import { useEffect, useMemo, useState } from 'react';
import { downloadSemesterExcel, getSettings } from '../api/adminSettings';
import { getElectives } from '../api/electives';
import type { Elective } from '../types/elective';
import type { SettingsLanguage } from '../types/adminSettings';
import { UiAlert } from '../components/UiAlert';
import { toUserFacingError } from '../utils/userFacingError';
import buttonStyles from '../styles/button.module.css';
import styles from './AdminSemesterManagementPage.module.css';

type StreamConfig = {
    localId: string;
    programLang: string;
    electiveType: string;
    programIds: number[];
    electiveIds: number[];
    priorities: number;
    isOpen: boolean;
};

type IterationForm = {
    iterationId: number | null;
    season: string;
    year: string;
    degreeYear: string;
    streams: StreamConfig[];
};

type MockIteration = {
    id: number;
    isActive: boolean;
    season: string;
    year: string;
    degreeYear: string;
    streams: StreamConfig[];
};

const ACTIVE_ITERATION_KEY = 'active_iteration_id';

function makeStreamConfig(): StreamConfig {
    return {
        localId: crypto.randomUUID(),
        programLang: '',
        electiveType: '',
        programIds: [],
        electiveIds: [],
        priorities: 5,
        isOpen: true,
    };
}

function makeEmptyForm(defaultDegree = ''): IterationForm {
    return {
        iterationId: null,
        season: 'SUMMER',
        year: String(new Date().getFullYear()),
        degreeYear: defaultDegree,
        streams: [makeStreamConfig()],
    };
}

const INITIAL_MOCK_ITERATIONS: MockIteration[] = [
    {
        id: 1,
        isActive: true,
        season: 'SUMMER',
        year: '2026',
        degreeYear: 'BS1',
        streams: [
            {
                localId: crypto.randomUUID(),
                programLang: 'ENG',
                electiveType: 'TECH',
                programIds: [],
                electiveIds: [],
                priorities: 5,
                isOpen: true,
            },
        ],
    },
    {
        id: 2,
        isActive: false,
        season: 'FALL',
        year: '2026',
        degreeYear: 'BS2',
        streams: [
            {
                localId: crypto.randomUUID(),
                programLang: 'RUS',
                electiveType: 'MATH',
                programIds: [],
                electiveIds: [],
                priorities: 5,
                isOpen: true,
            },
        ],
    },
];

export function AdminSemesterManagementPage() {
    const [settingsLanguages, setSettingsLanguages] = useState<SettingsLanguage[]>([]);
    const [electives, setElectives] = useState<Elective[]>([]);
    const [mockIterations, setMockIterations] = useState<MockIteration[]>(INITIAL_MOCK_ITERATIONS);
    const [activeIterationId, setActiveIterationId] = useState<number | null>(null);
    const [form, setForm] = useState<IterationForm>(makeEmptyForm());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quickElectiveByStream, setQuickElectiveByStream] = useState<Record<string, number | null>>({});
    const [quickProgramByStream, setQuickProgramByStream] = useState<Record<string, number | null>>({});

    const languageMap = useMemo(
        () => new Map(settingsLanguages.map((language) => [language.code, language])),
        [settingsLanguages]
    );

    const degreeYearOptions = useMemo(() => {
        const fromIterations = mockIterations.map((item) => item.degreeYear);
        const fromElectives = electives.flatMap((item) => item.degreeYear);
        return Array.from(new Set([...fromIterations, ...fromElectives])).sort((a, b) => a.localeCompare(b));
    }, [electives, mockIterations]);

    useEffect(() => {
        const stored = localStorage.getItem(ACTIVE_ITERATION_KEY);
        if (stored) {
            const parsed = Number(stored);
            if (!Number.isNaN(parsed)) {
                setActiveIterationId(parsed);
            }
        }
        void (async () => {
            setLoading(true);
            setError(null);
            try {
                const [settingsData, electivesData] = await Promise.all([getSettings(), getElectives()]);
                setSettingsLanguages(settingsData.languages);
                setElectives(electivesData.filter((item) => item.status === 1));
                const defaultDegree = electivesData.flatMap((item) => item.degreeYear)[0] ?? '';
                setForm(makeEmptyForm(defaultDegree));
            } catch (e) {
                setError(toUserFacingError(e, 'Failed to load semester data'));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    function getProgramsForLanguage(languageCode: string) {
        return languageMap.get(languageCode)?.programs ?? [];
    }

    function getTypesForLanguage(languageCode: string) {
        return languageMap.get(languageCode)?.elective_types.map((item) => item.name) ?? [];
    }

    function setFormPatch(patch: Partial<IterationForm>) {
        setForm((prev) => ({ ...prev, ...patch }));
    }

    function updateStream(localId: string, patch: Partial<StreamConfig>) {
        setForm((prev) => ({
            ...prev,
            streams: prev.streams.map((stream) =>
                stream.localId === localId ? { ...stream, ...patch } : stream
            ),
        }));
    }

    function getSuggestedElectiveIds(programLang: string, electiveType: string): number[] {
        if (!programLang || !electiveType) {
            return [];
        }
        return electives
            .filter(
                (item) =>
                    item.programLanguage === programLang &&
                    item.electiveType === electiveType &&
                    item.status === 1
            )
            .map((item) => item.id);
    }

    function newIteration() {
        setError(null);
        setForm(makeEmptyForm(degreeYearOptions[0] ?? ''));
    }

    function openIteration(item: MockIteration) {
        setForm({
            iterationId: item.id,
            season: item.season,
            year: item.year,
            degreeYear: item.degreeYear,
            streams: item.streams.map((stream) => ({ ...stream, isOpen: true })),
        });
    }

    function toggleStream(localId: string) {
        updateStream(localId, {
            isOpen: !form.streams.find((item) => item.localId === localId)?.isOpen,
        });
    }

    function addStream() {
        setForm((prev) => ({
            ...prev,
            streams: [...prev.streams, makeStreamConfig()],
        }));
    }

    function removeStream(localId: string) {
        setForm((prev) => ({
            ...prev,
            streams:
                prev.streams.length > 1
                    ? prev.streams.filter((item) => item.localId !== localId)
                    : prev.streams,
        }));
    }

    async function handleSave() {
        setSaving(true);
        setError(null);
        try {
            if (!form.year || !form.season || !form.degreeYear) {
                throw new Error('Fill iteration year, season and degree year.');
            }
            for (const stream of form.streams) {
                if (!stream.programLang || !stream.electiveType || stream.programIds.length === 0) {
                    throw new Error('Each stream must have language, elective type and at least one program.');
                }
            }

            if (form.iterationId === null) {
                const nextId = mockIterations.length > 0 ? Math.max(...mockIterations.map((i) => i.id)) + 1 : 1;
                setMockIterations((prev) => [
                    ...prev,
                    {
                        id: nextId,
                        isActive: false,
                        season: form.season,
                        year: form.year,
                        degreeYear: form.degreeYear,
                        streams: form.streams,
                    },
                ]);
                setFormPatch({ iterationId: nextId });
            } else {
                setMockIterations((prev) =>
                    prev.map((item) =>
                        item.id === form.iterationId
                            ? {
                                ...item,
                                season: form.season,
                                year: form.year,
                                degreeYear: form.degreeYear,
                                streams: form.streams,
                            }
                            : item
                    )
                );
            }
        } catch (e) {
            setError(toUserFacingError(e, 'Save failed'));
        } finally {
            setSaving(false);
        }
    }

    function handleReset() {
        if (form.iterationId !== null) {
            const existing = mockIterations.find((item) => item.id === form.iterationId);
            if (existing) {
                openIteration(existing);
                return;
            }
        }
        newIteration();
    }

    function handleActivateToggle() {
        if (form.iterationId === null) {
            setError('Save iteration first, then activate it.');
            return;
        }
        const next = activeIterationId === form.iterationId ? null : form.iterationId;
        setActiveIterationId(next);
        if (next === null) {
            localStorage.removeItem(ACTIVE_ITERATION_KEY);
        } else {
            localStorage.setItem(ACTIVE_ITERATION_KEY, String(next));
        }
        setMockIterations((prev) =>
            prev.map((item) => ({ ...item, isActive: next !== null && item.id === next }))
        );
    }

    async function handleDownloadExcel(iterationId: number) {
        try {
            const data = `Iteration ID,${iterationId}\nGenerated,${new Date().toISOString()}\n`;
            const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `semester-${iterationId}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            await downloadSemesterExcel(iterationId).catch(() => undefined);
        } catch (e) {
            setError(toUserFacingError(e, 'Failed to download Excel file'));
        }
    }

    if (loading) {
        return <section className={styles.page}>Loading semester management…</section>;
    }

    return (
        <section className={styles.page}>
            <div className={styles.layout}>
                <aside className={styles.history}>
                    <button
                        type="button"
                        className={`${buttonStyles.button} ${buttonStyles.sizeSm} ${buttonStyles.variantPrimary} ${styles.addIterationButton}`}
                        onClick={newIteration}
                    >
                        + Add iteration
                    </button>
                    <ul className={styles.historyList}>
                        {mockIterations.map((item) => (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    className={`${styles.historyItem} ${item.isActive ? styles.historyItemActive : ''}`}
                                    onClick={() => openIteration(item)}
                                >
                                    <strong>#{item.id}</strong>
                                    <span>
                                        {item.year}-{item.season}-{item.degreeYear}-{item.streams[0]?.programLang || '—'}(
                                        {(item.streams[0]?.programIds?.length ?? 0)})
                                    </span>
                                    {item.isActive ? <em>Active</em> : null}
                                </button>
                            </li>
                        ))}
                        {mockIterations.length === 0 ? <li className={styles.empty}>No iterations yet</li> : null}
                    </ul>
                </aside>

                <div className={styles.formWrap}>
                    <h1 className={styles.title}>Semester management</h1>
                    {error ? <UiAlert message={error} /> : null}

                    <div className={styles.headerRow}>
                        <label>
                            Iteration season
                            <select value={form.season} onChange={(e) => setFormPatch({ season: e.target.value })}>
                                <option value="SPRING">SPRING</option>
                                <option value="SUMMER">SUMMER</option>
                                <option value="FALL">FALL</option>
                                <option value="WINTER">WINTER</option>
                            </select>
                        </label>
                        <label>
                            Iteration year
                            <input value={form.year} onChange={(e) => setFormPatch({ year: e.target.value })} />
                        </label>
                        <label>
                            Degree year
                            <select value={form.degreeYear} onChange={(e) => setFormPatch({ degreeYear: e.target.value })}>
                                <option value="">Select degree year</option>
                                {degreeYearOptions.map((degree) => (
                                    <option key={degree} value={degree}>
                                        {degree}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className={styles.streams}>
                        {form.streams.map((stream, index) => {
                            const programs = getProgramsForLanguage(stream.programLang);
                            const prioritizedElectives = electives.filter(
                                (item) =>
                                    item.programLanguage === stream.programLang &&
                                    item.electiveType === stream.electiveType
                            );
                            const otherElectives = electives.filter(
                                (item) =>
                                    item.programLanguage !== stream.programLang ||
                                    item.electiveType !== stream.electiveType
                            );
                            const electiveOptions = [...prioritizedElectives, ...otherElectives];
                            const selectedElectives = electives.filter((item) =>
                                stream.electiveIds.includes(item.id)
                            );
                            const availableQuickAddElectives = electiveOptions.filter(
                                (item) => !stream.electiveIds.includes(item.id)
                            );
                            const selectedProgramNames = programs
                                .filter((program) => stream.programIds.includes(program.id))
                                .map((program) => program.name);
                            const preview = `${form.year || '—'}-${form.season || '—'}-${form.degreeYear || '—'}-${stream.programLang || '—'}(${selectedProgramNames.join(', ') || '—'})-${selectedElectives.slice(0, 3).map((item) => item.name).join(', ') || '—'}${selectedElectives.length > 3 ? ` +${selectedElectives.length - 3}` : ''}`;

                            return (
                                <article key={stream.localId} className={styles.streamCard}>
                                    <div className={styles.streamHead}>
                                        <button
                                            type="button"
                                            className={styles.caretButton}
                                            onClick={() => toggleStream(stream.localId)}
                                            aria-label={stream.isOpen ? 'Collapse stream' : 'Expand stream'}
                                        >
                                            <span
                                                className={`${styles.caretIcon} ${stream.isOpen ? styles.caretOpen : ''}`}
                                            />
                                        </button>
                                        <h2>Stream {index + 1}</h2>
                                        <button
                                            type="button"
                                            className={`${buttonStyles.button} ${buttonStyles.sizeSm} ${buttonStyles.variantGhost}`}
                                            onClick={() => removeStream(stream.localId)}
                                            disabled={saving || form.streams.length <= 1}
                                        >
                                            Delete stream
                                        </button>
                                    </div>

                                    {stream.isOpen ? (
                                        <>
                                            <div className={styles.grid}>
                                                <label>
                                                    Program language
                                                    <select
                                                        value={stream.programLang}
                                                        onChange={(e) =>
                                                            updateStream(stream.localId, {
                                                                programLang: e.target.value,
                                                                programIds: getProgramsForLanguage(e.target.value).map((p) => p.id),
                                                                electiveIds: [],
                                                                electiveType: '',
                                                            })
                                                        }
                                                    >
                                                        <option value="">Select language</option>
                                                        {settingsLanguages.map((lang) => (
                                                            <option key={lang.code} value={lang.code}>
                                                                {lang.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>

                                                {stream.programLang ? (
                                                    <label>
                                                        Elective type
                                                        <select
                                                            value={stream.electiveType}
                                                            onChange={(e) =>
                                                                {
                                                                    const nextType = e.target.value;
                                                                    const suggested = getSuggestedElectiveIds(
                                                                        stream.programLang,
                                                                        nextType
                                                                    );
                                                                    updateStream(stream.localId, {
                                                                        electiveType: nextType,
                                                                        electiveIds:
                                                                            stream.electiveIds.length === 0
                                                                                ? suggested
                                                                                : stream.electiveIds,
                                                                    });
                                                                }
                                                            }
                                                        >
                                                            <option value="">Select type</option>
                                                            {getTypesForLanguage(stream.programLang).map((typeName) => (
                                                                <option key={typeName} value={typeName}>
                                                                    {typeName}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                ) : null}

                                                {stream.programLang ? (
                                                    <label>
                                                        Programs
                                                        <div className={styles.programTools}>
                                                            <select
                                                                value={quickProgramByStream[stream.localId] ?? ''}
                                                                onChange={(e) =>
                                                                    setQuickProgramByStream((prev) => ({
                                                                        ...prev,
                                                                        [stream.localId]: e.target.value ? Number(e.target.value) : null,
                                                                    }))
                                                                }
                                                            >
                                                                <option value="">Add program</option>
                                                                {programs
                                                                    .filter((program) => !stream.programIds.includes(program.id))
                                                                    .map((program) => (
                                                                        <option key={program.id} value={program.id}>
                                                                            {program.name}
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                            <button
                                                                type="button"
                                                                className={`${buttonStyles.button} ${buttonStyles.sizeSm} ${buttonStyles.variantGhost}`}
                                                                onClick={() => {
                                                                    const selected = quickProgramByStream[stream.localId];
                                                                    if (!selected || stream.programIds.includes(selected)) {
                                                                        return;
                                                                    }
                                                                    updateStream(stream.localId, {
                                                                        programIds: [...stream.programIds, selected],
                                                                    });
                                                                    setQuickProgramByStream((prev) => ({
                                                                        ...prev,
                                                                        [stream.localId]: null,
                                                                    }));
                                                                }}
                                                                disabled={!quickProgramByStream[stream.localId]}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <div className={styles.selectedPrograms}>
                                                            {programs
                                                                .filter((program) => stream.programIds.includes(program.id))
                                                                .map((program) => (
                                                                    <div key={program.id} className={styles.programChip}>
                                                                        <span>{program.name}</span>
                                                                        <button
                                                                            type="button"
                                                                            className={styles.removeChipButton}
                                                                            onClick={() =>
                                                                                updateStream(stream.localId, {
                                                                                    programIds: stream.programIds.filter(
                                                                                        (id) => id !== program.id
                                                                                    ),
                                                                                })
                                                                            }
                                                                            title="Remove program"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </label>
                                                ) : null}

                                                {stream.programLang && stream.electiveType ? (
                                                    <div className={styles.fullWidth}>
                                                        <label>
                                                            Electives
                                                            <div className={styles.electiveTools}>
                                                                <button
                                                                    type="button"
                                                                    className={`${buttonStyles.button} ${buttonStyles.sizeSm} ${buttonStyles.variantGhost}`}
                                                                    onClick={() =>
                                                                        updateStream(stream.localId, {
                                                                            electiveIds: getSuggestedElectiveIds(
                                                                                stream.programLang,
                                                                                stream.electiveType
                                                                            ),
                                                                        })
                                                                    }
                                                                >
                                                                    Autofill by filters
                                                                </button>
                                                            </div>
                                                            <div className={styles.electivePickerRow}>
                                                                <select
                                                                    value={quickElectiveByStream[stream.localId] ?? ''}
                                                                    onChange={(e) =>
                                                                        setQuickElectiveByStream((prev) => ({
                                                                            ...prev,
                                                                            [stream.localId]: e.target.value
                                                                                ? Number(e.target.value)
                                                                                : null,
                                                                        }))
                                                                    }
                                                                >
                                                                    <option value="">Choose elective to add</option>
                                                                    {availableQuickAddElectives.map((elective) => (
                                                                        <option key={elective.id} value={elective.id}>
                                                                            {elective.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <button
                                                                    type="button"
                                                                    className={`${buttonStyles.button} ${buttonStyles.sizeSm} ${buttonStyles.variantGhost}`}
                                                                    onClick={() => {
                                                                        const selected = quickElectiveByStream[stream.localId];
                                                                        if (!selected || stream.electiveIds.includes(selected)) {
                                                                            return;
                                                                        }
                                                                        updateStream(stream.localId, {
                                                                            electiveIds: [...stream.electiveIds, selected],
                                                                        });
                                                                        setQuickElectiveByStream((prev) => ({
                                                                            ...prev,
                                                                            [stream.localId]: null,
                                                                        }));
                                                                    }}
                                                                    disabled={!quickElectiveByStream[stream.localId]}
                                                                >
                                                                    Add elective
                                                                </button>
                                                            </div>
                                                        </label>

                                                        <div className={styles.selectedElectives}>
                                                            {selectedElectives.map((elective) => (
                                                                <div key={elective.id} className={styles.selectedElectiveChip}>
                                                                    <span>{elective.name}</span>
                                                                    <button
                                                                        type="button"
                                                                        className={styles.removeChipButton}
                                                                        onClick={() =>
                                                                            updateStream(stream.localId, {
                                                                                electiveIds: stream.electiveIds.filter(
                                                                                    (id) => id !== elective.id
                                                                                ),
                                                                            })
                                                                        }
                                                                        title="Remove elective"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            {selectedElectives.length === 0 ? (
                                                                <p className={styles.emptySelection}>
                                                                    No electives selected yet
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                            <p className={styles.preview}>{preview}</p>
                                        </>
                                    ) : null}
                                </article>
                            );
                        })}
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                            onClick={addStream}
                        >
                            + Add stream
                        </button>
                        {form.iterationId !== null ? (
                            <button
                                type="button"
                                className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                                onClick={() => void handleDownloadExcel(form.iterationId as number)}
                            >
                                Download to Excel
                            </button>
                        ) : null}
                        <button
                            type="button"
                            className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                            onClick={handleReset}
                            disabled={saving}
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                            onClick={() => void handleSave()}
                            disabled={saving}
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                            onClick={handleActivateToggle}
                            disabled={saving || form.iterationId === null}
                        >
                            {form.iterationId !== null && activeIterationId === form.iterationId ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
