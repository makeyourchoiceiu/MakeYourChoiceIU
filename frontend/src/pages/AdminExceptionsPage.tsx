import { useEffect, useMemo, useState } from 'react';
import { getElectives } from '../api/electives';
import { getPrograms, getTracks } from '../api/adminSettings';
import { UiAlert } from '../components/UiAlert';
import { toUserFacingError } from '../utils/userFacingError';
import type { Elective } from '../types/elective';
import type { ProgramDto, TrackDto } from '../types/adminSettings';
import styles from './AdminExceptionsPage.module.css';

export function AdminExceptionsPage() {
    const [electives, setElectives] = useState<Elective[]>([]);
    const [tracks, setTracks] = useState<TrackDto[]>([]);
    const [programs, setPrograms] = useState<ProgramDto[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void (async () => {
            try {
                const [electivesData, tracksData, programsData] = await Promise.all([
                    getElectives(),
                    getTracks(),
                    getPrograms(),
                ]);
                setElectives(electivesData);
                setTracks(tracksData);
                setPrograms(programsData);
            } catch (e) {
                setError(toUserFacingError(e, 'Failed to load data'));
            }
        })();
    }, []);

    const tracksWithProgram = useMemo(
        () =>
            tracks.map((track) => ({
                ...track,
                programName: programs.find((program) => program.id === track.program)?.name ?? 'Unknown',
            })),
        [tracks, programs]
    );

    return (
        <section className={styles.page}>
            <h1 className={styles.title}>Electives-exceptions for academic programs</h1>
            {error ? <UiAlert message={error} /> : null}
            <article className={styles.createCard}>
                <h2>Create exception</h2>
                <div className={styles.createRow}>
                    <select disabled>
                        <option>Choose elective</option>
                        {electives.slice(0, 20).map((elective) => (
                            <option key={elective.id}>{elective.name}</option>
                        ))}
                    </select>
                    <strong>is forbidden to</strong>
                    <select disabled>
                        <option>Choose track</option>
                        {tracksWithProgram.slice(0, 20).map((track) => (
                            <option key={track.id}>{track.name}</option>
                        ))}
                    </select>
                    <span className={styles.chip}>DS</span>
                </div>
                <button type="button" className={styles.createButton} disabled>
                    Create
                </button>
                <p className={styles.note}>
                    Exceptions API is not available yet (`/api/exceptions`). UI is styled and ready for connection.
                </p>
            </article>

            <div className={styles.listBlock}>
                {electives.slice(0, 1).map((elective) => (
                    <article key={elective.id} className={styles.exceptionRow}>
                        <strong className={styles.green}>{elective.name}</strong>
                        <strong>is forbidden to</strong>
                        <strong className={styles.green}>
                            {tracksWithProgram.slice(0, 2).map((track) => track.name).join(', ') || 'DS, SD'}
                        </strong>
                        <button type="button" className={styles.menuButton}>
                            ...
                        </button>
                    </article>
                ))}
            </div>
        </section>
    );
}
