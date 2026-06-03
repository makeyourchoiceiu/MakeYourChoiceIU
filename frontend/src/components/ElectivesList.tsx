import type { Elective } from '../types/elective';
import type { Locale } from '../utils/electiveText';
import { StudentElectiveCard } from './StudentElectiveCard';
import { AdminElectiveCard } from './AdminElectiveCard';
import { AdminElectiveGridCard } from './AdminElectiveGridCard';
import styles from './ElectivesList.module.css';

interface ElectivesListProps {
    role: 'student' | 'admin';
    electives: Elective[];
    locale: Locale;
    query?: string;
    adminViewMode?: 'list' | 'grid';

    favouriteIds?: number[];
    onToggleFavourite?: (elective: Elective) => void;

    onEdit?: (elective: Elective) => void;
    onArchive?: (elective: Elective) => void;
    onDelete?: (elective: Elective) => void;
    onRestore?: (elective: Elective) => void;

    emptyText?: string;
}

/**
 * Общий renderer списка карточек.
 * Ничего не знает:
 * - про tabs
 * - про filters
 * - про поиск
 * - про page-level state
 *
 * Он получает уже готовый массив electives и просто рисует карточки.
 */
export function ElectivesList({
                                  role,
                                  electives,
                                  locale,
                                  query = '',
                                  adminViewMode = 'list',
                                  favouriteIds = [],
                                  onToggleFavourite,
                                  onEdit,
                                  onArchive,
                                  onDelete,
                                  onRestore,
                                  emptyText = 'No electives found',
                              }: ElectivesListProps) {
    const favouriteSet = new Set(favouriteIds);

    if (electives.length === 0) {
        return <p>{emptyText}</p>;
    }

    const isAdminGrid = role === 'admin' && adminViewMode === 'grid';

    return (
        <div className={isAdminGrid ? styles.grid : styles.list}>
            {electives.map((elective) => (
                <div key={elective.id} className={styles.item}>
                    {role === 'student' ? (
                        <StudentElectiveCard
                            elective={elective}
                            locale={locale}
                            query={query}
                            isFavourite={favouriteSet.has(elective.id)}
                            onToggleFavourite={onToggleFavourite}
                        />
                    ) : isAdminGrid ? (
                        <AdminElectiveGridCard
                            elective={elective}
                            locale={locale}
                            query={query}
                            onEdit={onEdit}
                            onArchive={onArchive}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    ) : (
                        <AdminElectiveCard
                            elective={elective}
                            locale={locale}
                            query={query}
                            onEdit={onEdit}
                            onArchive={onArchive}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
