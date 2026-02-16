import styles from './ElectivesList.module.css';
import type { Elective } from '../../../types/electives.ts';
import { ElectiveCard } from '../ElectiveCard/ElectiveCard.tsx';

type Role = 'student' | 'admin';
type Locale = 'en' | 'ru';

type Props = {
    role: Role;
    locale: Locale;

    electives: Elective[];

    // поиск
    query: string;
    onQueryChange: (v: string) => void;

    // состояния
    loading?: boolean;
    error?: string;

    // student actions (опционально)
    isFavourite?: (id: string) => boolean;
    onToggleFavourite?: (id: string) => void;

    // admin actions (опционально)
    onEdit?: (id: string) => void;
    onArchive?: (id: string) => void;
    onDelete?: (id: string) => void;
};

const UI = {
    en: {
        searchPlaceholder: 'Search by title, teacher, description…',
        loading: 'Loading…',
        empty: 'No results',
    },
    ru: {
        searchPlaceholder: 'Поиск по названию, преподавателю, описанию…',
        loading: 'Загрузка…',
        empty: 'Ничего не найдено',
    },
} as const;


export function ElectivesList({
                                  role,
                                  locale,
                                  electives,
                                  query,
                                  onQueryChange,
                                  loading = false,
                                  error = '',
                                  isFavourite,
                                  onToggleFavourite,
                                  onEdit,
                                  onArchive,
                                  onDelete,
                              }: Props) {
    const t = UI[locale];

    return (
        <section className={styles.wrap}>
            <div className={styles.toolbar}>
                <input
                    className={styles.search}
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    aria-label={t.searchPlaceholder}
                />
            </div>

            {loading ? <div className={styles.state}>{t.loading}</div> : null}
            {!loading && error ? <div className={styles.state}>{error}</div> : null}

            {!loading && !error && electives.length === 0 ? (
                <div className={styles.state}>{t.empty}</div>
            ) : (
                <div className={styles.grid}>
                    {electives.map((e) => (
                        <ElectiveCard
                            key={e.id}
                            role={role}
                            locale={locale}
                            elective={{
                                id: e.id,
                                title: e.title,
                                teacher: e.teacher,
                                language: e.language,
                                program: e.program,
                                year: e.year,
                                description: e.description,
                            }}
                            isFavourite={isFavourite ? isFavourite(e.id) : false}
                            onToggleFavourite={onToggleFavourite}
                            onEdit={onEdit}
                            onArchive={onArchive}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
