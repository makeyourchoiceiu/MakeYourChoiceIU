import { useEffect, useMemo, useState } from 'react';
import {
    createElectiveType,
    createProgram,
    createTrack,
    deleteElectiveType,
    deleteProgram,
    deleteTrack,
    getSettings,
    updateProgram,
    updateTrack,
} from '../api/adminSettings';
import type { SettingsLanguage } from '../types/adminSettings';
import { UiAlert } from '../components/UiAlert';
import { toUserFacingError } from '../utils/userFacingError';
import buttonStyles from '../styles/button.module.css';
import styles from './AdminProgramSettingsPage.module.css';

function normalize(value: string): string {
    return value.trim().toLowerCase();
}

export function AdminProgramSettingsPage() {
    const [languages, setLanguages] = useState<SettingsLanguage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const [newProgramByLang, setNewProgramByLang] = useState<Record<string, string>>({});
    const [renameProgramId, setRenameProgramId] = useState<number | null>(null);
    const [renameProgramValue, setRenameProgramValue] = useState('');

    const [newTrackByProgram, setNewTrackByProgram] = useState<Record<number, string>>({});
    const [renameTrackId, setRenameTrackId] = useState<number | null>(null);
    const [renameTrackValue, setRenameTrackValue] = useState('');

    const [newTypeByLang, setNewTypeByLang] = useState<Record<string, string>>({});

    async function reload() {
        setLoading(true);
        setError(null);
        try {
            const data = await getSettings();
            setLanguages(data.languages);
        } catch (e) {
            setError(toUserFacingError(e, 'Failed to load settings'));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void reload();
    }, []);

    const allTypes = useMemo(
        () => Array.from(new Set(languages.flatMap((lang) => lang.elective_types.map((item) => item.name)))),
        [languages]
    );

    async function runAction(action: () => Promise<void>) {
        setBusy(true);
        setError(null);
        try {
            await action();
            await reload();
        } catch (e) {
            setError(toUserFacingError(e, 'Action failed'));
        } finally {
            setBusy(false);
        }
    }

    async function handleAddProgram(languageCode: string, existingNames: string[]) {
        const value = newProgramByLang[languageCode] ?? '';
        if (!value.trim()) {
            return;
        }
        if (existingNames.map(normalize).includes(normalize(value))) {
            setError('Program with this name already exists in this language.');
            return;
        }
        await runAction(() => createProgram({ name: value.trim(), language: languageCode }));
        setNewProgramByLang((prev) => ({ ...prev, [languageCode]: '' }));
    }

    async function submitRenameProgram(programId: number, siblingNames: string[], currentName: string) {
        if (!renameProgramValue.trim() || renameProgramValue.trim() === currentName) {
            setRenameProgramId(null);
            return;
        }
        if (
            siblingNames
                .filter((item) => item !== currentName)
                .map(normalize)
                .includes(normalize(renameProgramValue))
        ) {
            setError('Program with this name already exists in this language.');
            return;
        }
        await runAction(() => updateProgram(programId, { name: renameProgramValue.trim() }));
        setRenameProgramId(null);
    }

    async function handleDeleteProgram(programId: number) {
        if (!window.confirm('Delete this program and all its tracks?')) {
            return;
        }
        await runAction(() => deleteProgram(programId));
    }

    async function handleAddTrack(programId: number, existingTrackNames: string[]) {
        const value = newTrackByProgram[programId] ?? '';
        if (!value.trim()) {
            return;
        }
        if (existingTrackNames.map(normalize).includes(normalize(value))) {
            setError('Track with this name already exists in this program.');
            return;
        }
        await runAction(() => createTrack({ name: value.trim(), program: programId }));
        setNewTrackByProgram((prev) => ({ ...prev, [programId]: '' }));
    }

    async function submitRenameTrack(trackId: number, siblingNames: string[], currentName: string) {
        if (!renameTrackValue.trim() || renameTrackValue.trim() === currentName) {
            setRenameTrackId(null);
            return;
        }
        if (
            siblingNames
                .filter((item) => item !== currentName)
                .map(normalize)
                .includes(normalize(renameTrackValue))
        ) {
            setError('Track with this name already exists in this program.');
            return;
        }
        await runAction(() => updateTrack(trackId, { name: renameTrackValue.trim() }));
        setRenameTrackId(null);
    }

    async function handleDeleteTrack(trackId: number) {
        if (!window.confirm('Delete this track?')) {
            return;
        }
        await runAction(() => deleteTrack(trackId));
    }

    async function handleAddType(languageCode: string) {
        const value = newTypeByLang[languageCode] ?? '';
        if (!value.trim()) {
            return;
        }
        if (allTypes.map(normalize).includes(normalize(value))) {
            setError('This elective type already exists.');
            return;
        }
        await runAction(() => createElectiveType({ elective_type_name: value.trim() }));
        setNewTypeByLang((prev) => ({ ...prev, [languageCode]: '' }));
    }

    async function handleDeleteType(typeName: string) {
        if (!window.confirm(`Delete elective type "${typeName}"?`)) {
            return;
        }
        await runAction(() => deleteElectiveType(typeName));
    }

    if (loading) {
        return <section className={styles.page}>Loading program settings…</section>;
    }

    function languageLabel(code: string): string {
        return code === 'RUS' ? 'RU' : code;
    }

    return (
        <section className={styles.page}>
            <div className={styles.head}>
                <h1 className={styles.title}>Programs settings</h1>
                {busy ? <span className={styles.meta}>Saving…</span> : null}
            </div>

            {error ? <UiAlert message={error} /> : null}

            <div className={styles.columns}>
                {languages.map((language) => {
                    const siblingProgramNames = language.programs.map((program) => program.name);
                    const languageTypes = language.elective_types.map((item) => item.name);

                    return (
                        <section key={language.code} className={styles.column}>
                            <div className={styles.columnHead}>
                                <h2>{languageLabel(language.code)}</h2>
                            </div>

                            <div className={styles.inlineRow}>
                                <input
                                    value={newProgramByLang[language.code] ?? ''}
                                    onChange={(e) =>
                                        setNewProgramByLang((prev) => ({ ...prev, [language.code]: e.target.value }))
                                    }
                                    placeholder="New program name"
                                    className={styles.inlineInput}
                                />
                                <button
                                    type="button"
                                    className={`${buttonStyles.button} ${buttonStyles.sizeSm} ${buttonStyles.variantGhost}`}
                                    onClick={() => void handleAddProgram(language.code, siblingProgramNames)}
                                    disabled={busy}
                                >
                                    + Add program
                                </button>
                            </div>

                            <div className={styles.typeSection}>
                                <div className={styles.rowHead}>
                                    <strong>Types of electives</strong>
                                </div>
                                <div className={styles.inlineRow}>
                                    <input
                                        value={newTypeByLang[language.code] ?? ''}
                                        onChange={(e) =>
                                            setNewTypeByLang((prev) => ({ ...prev, [language.code]: e.target.value }))
                                        }
                                        placeholder="New type"
                                        className={styles.inlineInput}
                                    />
                                    <button
                                        type="button"
                                        className={`${buttonStyles.button} ${buttonStyles.sizeSm} ${buttonStyles.variantGhost}`}
                                        onClick={() => void handleAddType(language.code)}
                                        disabled={busy}
                                    >
                                        + Add type
                                    </button>
                                </div>

                                <div className={styles.typeList}>
                                    {languageTypes.map((typeName) => (
                                        <div key={`${language.code}-${typeName}`} className={styles.typeItem}>
                                            <span className={styles.chip}>{typeName}</span>
                                            <button
                                                type="button"
                                                className={`${buttonStyles.button} ${buttonStyles.sizeSm} ${buttonStyles.variantDanger}`}
                                                onClick={() => void handleDeleteType(typeName)}
                                                disabled={busy}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.programs}>
                                {language.programs.map((program) => {
                                    const trackNames = program.tracks.map((track) => track.name);
                                    const isRenamingProgram = renameProgramId === program.id;
                                    return (
                                        <article key={program.id} className={styles.programCard}>
                                            <div className={styles.programHead}>
                                                {isRenamingProgram ? (
                                                    <div className={styles.inlineRow}>
                                                        <input
                                                            className={styles.inlineInput}
                                                            value={renameProgramValue}
                                                            onChange={(e) => setRenameProgramValue(e.target.value)}
                                                        />
                                                        <button
                                                            type="button"
                                                            className={`${buttonStyles.button} ${buttonStyles.sizeSm} ${buttonStyles.variantGhost}`}
                                                            onClick={() =>
                                                                void submitRenameProgram(
                                                                    program.id,
                                                                    siblingProgramNames,
                                                                    program.name
                                                                )
                                                            }
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={`${buttonStyles.button} ${buttonStyles.sizeSm} ${buttonStyles.variantGhost}`}
                                                            onClick={() => setRenameProgramId(null)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h3>{program.name}</h3>
                                                        <div className={styles.actions}>
                                                            <button
                                                                type="button"
                                                                className={styles.iconButton}
                                                                onClick={() => {
                                                                    setRenameProgramId(program.id);
                                                                    setRenameProgramValue(program.name);
                                                                }}
                                                                disabled={busy}
                                                                title="Rename program"
                                                            >
                                                                edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={styles.iconButton}
                                                                onClick={() => void handleDeleteProgram(program.id)}
                                                                disabled={busy}
                                                                title="Delete program"
                                                            >
                                                                delete
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <ul className={styles.tracks}>
                                                {program.tracks.map((track) => {
                                                    const isRenamingTrack = renameTrackId === track.id;
                                                    return (
                                                        <li key={track.id} className={styles.trackRow}>
                                                            {isRenamingTrack ? (
                                                                <div className={styles.inlineRow}>
                                                                    <input
                                                                        className={styles.inlineInput}
                                                                        value={renameTrackValue}
                                                                        onChange={(e) => setRenameTrackValue(e.target.value)}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className={`${buttonStyles.button} ${buttonStyles.sizeSm} ${buttonStyles.variantGhost}`}
                                                                        onClick={() =>
                                                                            void submitRenameTrack(
                                                                                track.id,
                                                                                trackNames,
                                                                                track.name
                                                                            )
                                                                        }
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className={`${buttonStyles.button} ${buttonStyles.sizeSm} ${buttonStyles.variantGhost}`}
                                                                        onClick={() => setRenameTrackId(null)}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <span>{track.name}</span>
                                                                    <div className={styles.actions}>
                                                                        <button
                                                                            type="button"
                                                                            className={styles.iconButton}
                                                                            onClick={() => {
                                                                                setRenameTrackId(track.id);
                                                                                setRenameTrackValue(track.name);
                                                                            }}
                                                                            disabled={busy}
                                                                            title="Rename track"
                                                                        >
                                                                            edit
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className={styles.iconButton}
                                                                            onClick={() => void handleDeleteTrack(track.id)}
                                                                            disabled={busy}
                                                                            title="Delete track"
                                                                        >
                                                                            delete
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                            </ul>

                                            <div className={styles.inlineRow}>
                                                <input
                                                    value={newTrackByProgram[program.id] ?? ''}
                                                    onChange={(e) =>
                                                        setNewTrackByProgram((prev) => ({
                                                            ...prev,
                                                            [program.id]: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="New track"
                                                    className={styles.inlineInput}
                                                />
                                                <button
                                                    type="button"
                                                    className={`${buttonStyles.button} ${buttonStyles.sizeSm} ${buttonStyles.variantGhost}`}
                                                    onClick={() => void handleAddTrack(program.id, trackNames)}
                                                    disabled={busy}
                                                >
                                                    + Add track
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </div>
        </section>
    );
}
