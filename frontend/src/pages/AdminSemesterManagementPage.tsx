import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
    addElectivesToStream,
    createStream,
    deleteStream,
    downloadSemesterExcel,
    getSettings,
    getStreamElectives,
    getStreams,
    removeElectiveFromStream,
    updateStream,
} from '../api/adminSettings';
import { getElectives } from '../api/electives';
import type { Elective } from '../types/elective';
import type { SettingsLanguage, StreamDto } from '../types/adminSettings';
import { UiAlert } from '../components/UiAlert';
import { toUserFacingError } from '../utils/userFacingError';
import buttonStyles from '../styles/button.module.css';
import styles from './AdminSemesterManagementPage.module.css';

type StreamDraft = {
    streamId: number | null;
    season: string;
    year: string;
    degreeYear: string;
    programLang: string;
    electiveType: string;
    programIds: number[];
    electiveIds: number[];
    priorities: number;
};

const EMPTY_DRAFT: StreamDraft = {
    streamId: null,
    season: 'SUMMER',
    year: String(new Date().getFullYear()),
    degreeYear: '',
    programLang: '',
    electiveType: '',
    programIds: [],
    electiveIds: [],
    priorities: 5,
};
const ACTIVE_ITERATION_KEY = 'active_iteration_id';

function parseMultiSelect(event: ChangeEvent<HTMLSelectElement>): string[] {
    return Array.from(event.target.selectedOptions).map((option) => option.value);
}

export function AdminSemesterManagementPage() {
    const [settingsLanguages, setSettingsLanguages] = useState<SettingsLanguage[]>([]);
    const [electives, setElectives] = useState<Elective[]>([]);
    const [backendStreams, setBackendStreams] = useState<StreamDto[]>([]);
    const [streamElectivesMap, setStreamElectivesMap] = useState<Record<number, number[]>>({});
    const [activeStreamId, setActiveStreamId] = useState<number | null>(null);
    const [draft, setDraft] = useState<StreamDraft>(EMPTY_DRAFT);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quickElectiveId, setQuickElectiveId] = useState<number | null>(null);

    const languageMap = useMemo(
        () => new Map(settingsLanguages.map((language) => [language.code, language])),
        [settingsLanguages]
    );

    const degreeYearOptions = useMemo(() => {
        const fromStreams = backendStreams.map((stream) => stream.degree_year);
        const fromElectives = electives.flatMap((item) => item.degreeYear);
        return Array.from(new Set([...fromStreams, ...fromElectives])).sort((a, b) => a.localeCompare(b));
    }, [backendStreams, electives]);

    async function reload() {
        const [settingsData, electivesData, streamsData] = await Promise.all([
            getSettings(),
            getElectives(),
            getStreams(),
        ]);
        setSettingsLanguages(settingsData.languages);
        setElectives(electivesData.filter((item) => item.status === 1));
        setBackendStreams(streamsData);

        const idsToLoad = streamsData.map((stream) => stream.id);
        const electiveLists = await Promise.all(idsToLoad.map((id) => getStreamElectives(id)));
        const nextMap: Record<number, number[]> = {};
        idsToLoad.forEach((id, idx) => {
            nextMap[id] = electiveLists[idx].map((item) => item.id);
        });
        setStreamElectivesMap(nextMap);
    }

    useEffect(() => {
        const stored = localStorage.getItem(ACTIVE_ITERATION_KEY);
        if (stored) {
            const parsed = Number(stored);
            if (!Number.isNaN(parsed)) {
                setActiveStreamId(parsed);
            }
        }
        void (async () => {
            setLoading(true);
            setError(null);
            try {
                await reload();
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

    function setPatch(patch: Partial<StreamDraft>) {
        setDraft((prev) => ({ ...prev, ...patch }));
    }

    function resetDraft() {
        setActiveStreamId(null);
        setDraft({ ...EMPTY_DRAFT, degreeYear: degreeYearOptions[0] ?? '' });
    }

    function openStream(stream: StreamDto) {
        const firstSeason = EMPTY_DRAFT.season;
        const firstYear = String(new Date().getFullYear());
        setActiveStreamId(stream.id);
        setDraft({
            streamId: stream.id,
            season: firstSeason,
            year: firstYear,
            degreeYear: stream.degree_year,
            programLang: stream.program_lang,
            electiveType: stream.elective_type,
            programIds: stream.programs,
            electiveIds: streamElectivesMap[stream.id] ?? [],
            priorities: stream.priorities,
        });
    }

    function formatStreamLine(stream: StreamDto): string {
        const programs = getProgramsForLanguage(stream.program_lang)
            .filter((program) => stream.programs.includes(program.id))
            .map((program) => program.name)
            .join(', ');
        return `${new Date().getFullYear()}-${EMPTY_DRAFT.season}-${stream.degree_year}-${stream.program_lang}(${programs || '—'})-${stream.elective_type}`;
    }

    async function saveDraft() {
        setSaving(true);
        setError(null);
        try {
            if (!draft.programLang || !draft.electiveType || draft.programIds.length === 0 || !draft.degreeYear) {
                throw new Error('Fill degree year, program language, elective type and at least one program.');
            }

            if (draft.streamId === null) {
                const created = await createStream({
                    degree_year: draft.degreeYear,
                    program_lang: draft.programLang,
                    elective_type: draft.electiveType,
                    programs: draft.programIds,
                    priorities: draft.priorities,
                });
                if (draft.electiveIds.length > 0) {
                    await addElectivesToStream(created.id, draft.electiveIds);
                }
            } else {
                await updateStream(draft.streamId, {
                    degree_year: draft.degreeYear,
                    program_lang: draft.programLang,
                    elective_type: draft.electiveType,
                    programs: draft.programIds,
                    priorities: draft.priorities,
                });

                const before = new Set(streamElectivesMap[draft.streamId] ?? []);
                const after = new Set(draft.electiveIds);
                const toAdd = Array.from(after).filter((id) => !before.has(id));
                const toRemove = Array.from(before).filter((id) => !after.has(id));

                if (toAdd.length > 0) {
                    await addElectivesToStream(draft.streamId, toAdd);
                }
                for (const electiveId of toRemove) {
                    await removeElectiveFromStream(draft.streamId, electiveId);
                }
            }

            await reload();
        } catch (e) {
            setError(toUserFacingError(e, 'Save failed'));
        } finally {
            setSaving(false);
        }
    }

    async function removeActiveStream() {
        if (draft.streamId === null) {
            resetDraft();
            return;
        }
        if (!window.confirm('Delete this stream?')) {
            return;
        }
        setSaving(true);
        try {
            await deleteStream(draft.streamId);
            await reload();
            resetDraft();
        } catch (e) {
            setError(toUserFacingError(e, 'Delete failed'));
        } finally {
            setSaving(false);
        }
    }

    function activateCurrent() {
        if (draft.streamId === null) {
            setError('Save stream first, then activate it.');
            return;
        }
        const next = activeStreamId === draft.streamId ? null : draft.streamId;
        setActiveStreamId(next);
        if (next === null) {
            localStorage.removeItem(ACTIVE_ITERATION_KEY);
        } else {
            localStorage.setItem(ACTIVE_ITERATION_KEY, String(next));
        }
    }

    const programs = getProgramsForLanguage(draft.programLang);
    const prioritizedElectives = electives.filter(
        (item) => item.programLanguage === draft.programLang && item.electiveType === draft.electiveType
    );
    const otherElectives = electives.filter(
        (item) => item.programLanguage !== draft.programLang || item.electiveType !== draft.electiveType
    );
    const electiveOptions = [...prioritizedElectives, ...otherElectives];
    const selectedElectives = electives.filter((item) => draft.electiveIds.includes(item.id));
    const availableQuickAddElectives = electiveOptions.filter((item) => !draft.electiveIds.includes(item.id));
    const selectedProgramNames = programs
        .filter((program) => draft.programIds.includes(program.id))
        .map((program) => program.name);
    const selectedElectiveNames = selectedElectives.map((item) => item.name);
    const draftPreview = `${draft.year || '—'}-${draft.season || '—'}-${draft.degreeYear || '—'}-${draft.programLang || '—'}(${selectedProgramNames.join(', ') || '—'})-${selectedElectiveNames.slice(0, 4).join(', ') || '—'}${selectedElectiveNames.length > 4 ? ` +${selectedElectiveNames.length - 4}` : ''}`;

    function addOneElective() {
        if (quickElectiveId === null || draft.electiveIds.includes(quickElectiveId)) {
            return;
        }
        setPatch({ electiveIds: [...draft.electiveIds, quickElectiveId] });
        setQuickElectiveId(null);
    }

    function removeOneElective(electiveId: number) {
        setPatch({ electiveIds: draft.electiveIds.filter((id) => id !== electiveId) });
    }

    async function handleDownloadExcel(semesterId: number) {
        try {
            await downloadSemesterExcel(semesterId);
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
                    <ul className={styles.historyList}>
                        {backendStreams.map((stream) => (
                            <li key={stream.id}>
                                <button
                                    type="button"
                                    className={`${styles.historyItem} ${stream.id === activeStreamId ? styles.historyItemActive : ''}`}
                                    onClick={() => openStream(stream)}
                                >
                                    <strong>#{stream.id}</strong>
                                    <span>{formatStreamLine(stream)}</span>
                                    {stream.id === activeStreamId ? <em>Active</em> : null}
                                </button>
                            </li>
                        ))}
                        {backendStreams.length === 0 ? <li className={styles.empty}>No streams yet</li> : null}
                    </ul>
                </aside>

                <div className={styles.formWrap}>
                    <h1 className={styles.title}>Semester management</h1>
                    {error ? <UiAlert message={error} /> : null}

                    <div className={styles.headerRow}>
                        <label>
                            Iteration season
                            <select value={draft.season} onChange={(e) => setPatch({ season: e.target.value })}>
                                <option value="SPRING">SPRING</option>
                                <option value="SUMMER">SUMMER</option>
                                <option value="FALL">FALL</option>
                                <option value="WINTER">WINTER</option>
                            </select>
                        </label>
                        <label>
                            Iteration year
                            <input value={draft.year} onChange={(e) => setPatch({ year: e.target.value })} />
                        </label>
                        <label>
                            Degree year
                            <select value={draft.degreeYear} onChange={(e) => setPatch({ degreeYear: e.target.value })}>
                                <option value="">Select degree year</option>
                                {degreeYearOptions.map((degree) => (
                                    <option key={degree} value={degree}>
                                        {degree}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <article className={styles.streamCard}>
                        <div className={styles.streamHead}>
                            <h2>{draft.streamId ? `Editing stream #${draft.streamId}` : 'New stream'}</h2>
                            <button
                                type="button"
                                className={`${buttonStyles.button} ${buttonStyles.sizeSm} ${buttonStyles.variantGhost}`}
                                onClick={removeActiveStream}
                                disabled={saving}
                            >
                                {draft.streamId ? 'Delete stream' : 'Clear'}
                            </button>
                        </div>

                        <div className={styles.grid}>
                            <label>
                                Program language
                                <select
                                    value={draft.programLang}
                                    onChange={(e) =>
                                        setPatch({
                                            programLang: e.target.value,
                                            programIds: [],
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

                            {draft.programLang ? (
                                <label>
                                    Elective type
                                    <select
                                        value={draft.electiveType}
                                        onChange={(e) => setPatch({ electiveType: e.target.value, electiveIds: [] })}
                                    >
                                        <option value="">Select type</option>
                                        {getTypesForLanguage(draft.programLang).map((typeName) => (
                                            <option key={typeName} value={typeName}>
                                                {typeName}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            ) : null}

                            {draft.programLang ? (
                                <label>
                                    Programs
                                    <select
                                        multiple
                                        value={draft.programIds.map(String)}
                                        onChange={(e) =>
                                            setPatch({
                                                programIds: parseMultiSelect(e).map(Number),
                                            })
                                        }
                                    >
                                        {programs.map((program) => (
                                            <option key={program.id} value={program.id}>
                                                {program.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            ) : null}

                            {draft.programLang && draft.electiveType ? (
                                <div className={styles.fullWidth}>
                                    <label>
                                        Electives
                                        <div className={styles.electivePickerRow}>
                                            <select
                                                value={quickElectiveId ?? ''}
                                                onChange={(e) =>
                                                    setQuickElectiveId(
                                                        e.target.value ? Number(e.target.value) : null
                                                    )
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
                                                onClick={addOneElective}
                                                disabled={quickElectiveId === null}
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
                                                    onClick={() => removeOneElective(elective.id)}
                                                    title="Remove elective"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        {selectedElectives.length === 0 ? (
                                            <p className={styles.emptySelection}>No electives selected yet</p>
                                        ) : null}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        <p className={styles.preview}>{draftPreview}</p>
                    </article>

                    <div className={styles.actions}>
                        {draft.streamId !== null ? (
                            <button
                                type="button"
                                className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                                onClick={() => void handleDownloadExcel(draft.streamId as number)}
                            >
                                Download to Excel
                            </button>
                        ) : null}
                        <button
                            type="button"
                            className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                            onClick={resetDraft}
                            disabled={saving}
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                            onClick={() => void saveDraft()}
                            disabled={saving}
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                            onClick={activateCurrent}
                            disabled={saving || draft.streamId === null}
                        >
                            {draft.streamId !== null && activeStreamId === draft.streamId ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
