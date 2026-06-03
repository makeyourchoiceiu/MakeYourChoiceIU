import { useMemo } from 'react';
import type { Elective } from '../types/elective';
import type { StudentElectiveTypeTab } from '../types/electivesList';
import {
    electiveMatchesQuery,
    filterStudentElectivesByType,
    getStudentElectiveTypeTabs,
    sortElectivesFavouritesFirst,
} from '../utils/electivesList';

interface UseStudentElectivesPageParams {
    electives: Elective[];
    query: string;
    favouriteIds: number[];
    activeType: string;
}

interface UseStudentElectivesPageResult {
    tabs: StudentElectiveTypeTab[];
    visibleElectives: Elective[];
}

/**
 * Хук подготовки данных student-страницы.
 * Ничего не рендерит, только считает:
 * - набор вкладок
 * - итоговый список после type filter, query filter и favourite sorting
 */
export function useStudentElectivesPage({
                                            electives,
                                            query,
                                            favouriteIds,
                                            activeType,
                                        }: UseStudentElectivesPageParams): UseStudentElectivesPageResult {
    const tabs = useMemo(() => getStudentElectiveTypeTabs(electives), [electives]);

    const visibleElectives = useMemo(() => {
        const byType = filterStudentElectivesByType(electives, activeType);
        const byQuery = byType.filter((elective) => electiveMatchesQuery(elective, query));
        return sortElectivesFavouritesFirst(byQuery, favouriteIds);
    }, [electives, activeType, query, favouriteIds]);

    return { tabs, visibleElectives };
}