import { useMemo } from 'react';
import type { Elective } from '../types/elective';
import { findSnippet } from '../utils/electiveSearch';

interface UseElectiveSearchResult {
    normalizedQuery: string;
    previewRaw: string;

    matchInName: boolean;
    matchInInstructor: boolean;
    matchInLanguage: boolean;
    matchInPrerequisite: boolean;
    matchInDescription: boolean;

    hasAnyMatch: boolean;
    longOnly: boolean;
    snippet: string | null;
}

function includesQuery(value: string, query: string): boolean {
    if (!query) {
        return false;
    }

    return value.toLowerCase().includes(query.toLowerCase());
}

/**
 * Общая логика поиска по полям электива.
 *
 * Что делает:
 * - нормализует query
 * - проверяет совпадения по основным полям
 * - готовит preview для description
 * - определяет случай longOnly
 * - строит snippet для длинного описания
 */
export function useElectiveSearch(
    elective: Elective,
    query: string,
    previewLimit = 240
): UseElectiveSearchResult {
    return useMemo(() => {
        const normalizedQuery = query.trim();

        const previewRaw =
            elective.description.length > previewLimit
                ? elective.description.slice(0, previewLimit)
                : elective.description;

        const matchInName = includesQuery(elective.name, normalizedQuery);
        const matchInInstructor = includesQuery(elective.instructor, normalizedQuery);
        const matchInLanguage = includesQuery(elective.electiveLanguage, normalizedQuery);
        const matchInPrerequisite = includesQuery(elective.prerequisite, normalizedQuery);
        const matchInDescription = includesQuery(elective.description, normalizedQuery);

        const matchInPreview = includesQuery(previewRaw, normalizedQuery);

        const hasAnyMatch =
            !normalizedQuery ||
            matchInName ||
            matchInInstructor ||
            matchInLanguage ||
            matchInPrerequisite ||
            matchInDescription;

        // Совпадение есть в полном description, но не видно в preview
        // и не найдено в других верхних полях карточки
        const longOnly =
            Boolean(normalizedQuery) &&
            matchInDescription &&
            !matchInName &&
            !matchInInstructor &&
            !matchInLanguage &&
            !matchInPrerequisite &&
            !matchInPreview;

        const snippet = longOnly
            ? findSnippet(elective.description, normalizedQuery, 80)
            : null;

        return {
            normalizedQuery,
            previewRaw,
            matchInName,
            matchInInstructor,
            matchInLanguage,
            matchInPrerequisite,
            matchInDescription,
            hasAnyMatch,
            longOnly,
            snippet,
        };
    }, [elective, query, previewLimit]);
}