import { useMemo } from 'react';
import type { Elective } from '../types/elective';
import type { AdminElectiveFilters } from '../types/electivesList';
import {
    electiveMatchesQuery,
    filterAdminElectives,
    getAdminFilterOptions,
    prioritizeAdminElectivesByDegreeYears,
} from '../utils/electivesList';

interface UseAdminElectivesPageParams {
    electives: Elective[];
    query: string;
    filters: AdminElectiveFilters;
}

interface UseAdminElectivesPageResult {
    visibleElectives: Elective[];
    filterOptions: ReturnType<typeof getAdminFilterOptions>;
}

/**
 * Хук подготовки данных admin-страницы.
 * Последовательность:
 * 1. фильтрация по query
 * 2. фильтрация по admin filters
 * 3. подготовка options для select-ов
 */
export function useAdminElectivesPage({
                                          electives,
                                          query,
                                          filters,
                                      }: UseAdminElectivesPageParams): UseAdminElectivesPageResult {
    const filterOptions = useMemo(() => getAdminFilterOptions(electives), [electives]);

    const visibleElectives = useMemo(() => {
        const byQuery = electives.filter((elective) => electiveMatchesQuery(elective, query));
        const filtered = filterAdminElectives(byQuery, filters);
        return prioritizeAdminElectivesByDegreeYears(filtered, filters.degreeYears);
    }, [electives, query, filters]);

    return { visibleElectives, filterOptions };
}
