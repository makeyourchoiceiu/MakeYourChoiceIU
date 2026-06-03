import type { Elective } from '../types/elective';
import type { AdminElectiveFilters, StudentElectiveTypeTab } from '../types/electivesList';

function normalize(value: string): string {
    return value.trim().toLowerCase();
}

/**
 * Собираем одну поисковую строку по всем важным полям.
 * Так проще держать поиск централизованным, а не размазывать по компонентам.
 */
export function buildElectiveSearchText(elective: Elective): string {
    return [
        elective.name,
        elective.instructor,
        elective.description,
        elective.electiveLanguage,
        elective.electiveType,
        elective.programLanguage,
        elective.prerequisite,
        ...elective.degreeYear,
    ]
        .join(' ')
        .toLowerCase();
}

/**
 * Проверяет, проходит ли курс по текущему query.
 * Пустой query пропускает всё.
 */
export function electiveMatchesQuery(elective: Elective, query: string): boolean {
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
        return true;
    }

    return buildElectiveSearchText(elective).includes(normalizedQuery);
}

/**
 * Сортировка для student-side:
 * favourites идут первыми, внутри групп сохраняется исходный порядок.
 *
 * Это удобно и для UX, и для анимации реордера.
 */
export function sortElectivesFavouritesFirst(
    electives: Elective[],
    favouriteIds: number[]
): Elective[] {
    const favouriteSet = new Set(favouriteIds);

    return electives
        .map((elective, index) => ({ elective, index }))
        .sort((a, b) => {
            const aFavourite = favouriteSet.has(a.elective.id);
            const bFavourite = favouriteSet.has(b.elective.id);

            if (aFavourite !== bFavourite) {
                return aFavourite ? -1 : 1;
            }

            return a.index - b.index;
        })
        .map((item) => item.elective);
}

function getAdminStatusRank(status: Elective['status']): number {
    if (status === 1) {
        return 0;
    }

    if (status === 0) {
        return 1;
    }

    return 2;
}

export function sortAdminElectives(electives: Elective[]): Elective[] {
    return [...electives].sort((a, b) => {
        const statusDiff = getAdminStatusRank(a.status) - getAdminStatusRank(b.status);

        if (statusDiff !== 0) {
            return statusDiff;
        }

        const nameDiff = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

        if (nameDiff !== 0) {
            return nameDiff;
        }

        return a.id - b.id;
    });
}

/**
 * Student filter по типу электива.
 */
export function filterStudentElectivesByType(
    electives: Elective[],
    activeType: string
): Elective[] {
    if (!activeType || activeType === 'all') {
        return electives;
    }

    return electives.filter((elective) => elective.electiveType === activeType);
}

/**
 * Готовим набор вкладок для student-side.
 */
export function getStudentElectiveTypeTabs(
    electives: Elective[]
): StudentElectiveTypeTab[] {
    const counts = new Map<string, number>();

    for (const elective of electives) {
        counts.set(elective.electiveType, (counts.get(elective.electiveType) ?? 0) + 1);
    }

    return [
        {
            value: 'all',
            label: 'All',

        },
        ...Array.from(counts.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([value]) => ({
                value,
                label: value
            })),
    ];
}

/**
 * Admin filter по нескольким полям.
 * Пустая строка означает "фильтр не выбран".
 */
export function filterAdminElectives(
    electives: Elective[],
    filters: AdminElectiveFilters
): Elective[] {
    return electives.filter((elective) => {
        const matchesLanguage =
            !filters.electiveLanguage || elective.electiveLanguage === filters.electiveLanguage;

        const matchesDegreeYear =
            filters.degreeYears.length === 0 ||
            filters.degreeYears.some((degreeYear) => elective.degreeYear.includes(degreeYear));

        const matchesType =
            filters.electiveTypes.length === 0 ||
            filters.electiveTypes.includes(elective.electiveType);

        const matchesProgramLanguage =
            !filters.programLanguage || elective.programLanguage === filters.programLanguage;

        const matchesStatus =
            filters.statuses.length === 0 ||
            filters.statuses.includes(elective.status);

        return (
            matchesLanguage &&
            matchesDegreeYear &&
            matchesType &&
            matchesProgramLanguage &&
            matchesStatus
        );
    });
}

export function prioritizeAdminElectivesByDegreeYears(
    electives: Elective[],
    degreeYears: string[]
): Elective[] {
    if (degreeYears.length === 0) {
        return electives;
    }

    return electives
        .map((elective, index) => {
            const matchCount = degreeYears.filter((degreeYear) =>
                elective.degreeYear.includes(degreeYear)
            ).length;

            return { elective, index, matchCount };
        })
        .sort((a, b) => {
            const aHasFullMatch = a.matchCount === degreeYears.length;
            const bHasFullMatch = b.matchCount === degreeYears.length;

            if (aHasFullMatch !== bHasFullMatch) {
                return aHasFullMatch ? -1 : 1;
            }

            if (a.matchCount !== b.matchCount) {
                return b.matchCount - a.matchCount;
            }

            return a.index - b.index;
        })
        .map((item) => item.elective);
}

/**
 * Собираем доступные значения для admin filters прямо из данных.
 */
export function getAdminFilterOptions(electives: Elective[]) {
    const electiveLanguages = Array.from(
        new Set(electives.map((elective) => elective.electiveLanguage))
    ).sort();

    const degreeYears = Array.from(
        new Set(electives.flatMap((elective) => elective.degreeYear))
    ).sort();

    const electiveTypes = Array.from(
        new Set(electives.map((elective) => elective.electiveType))
    ).sort();

    const programLanguages = Array.from(
        new Set(electives.map((elective) => elective.programLanguage))
    ).sort();

    const statuses = Array.from(
        new Set(electives.map((elective) => String(elective.status)))
    ).sort();

    return {
        electiveLanguages,
        degreeYears,
        electiveTypes,
        programLanguages,
        statuses,
    };
}
