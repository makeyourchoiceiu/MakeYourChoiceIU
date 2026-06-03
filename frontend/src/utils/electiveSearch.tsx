import React from 'react';
import type { ReactNode } from 'react';

export function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlight(text: string, query: string): ReactNode {
    const normalizedText = String(text ?? '');
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
        return normalizedText;
    }

    const regex = new RegExp(`(${escapeRegExp(normalizedQuery)})`, 'ig');
    const parts = normalizedText.split(regex);

    return (
        <>
            {parts.map((part, index) =>
                part.toLowerCase() === normalizedQuery.toLowerCase() ? (
                    <mark key={index}>{part}</mark>
                ) : (
                    <React.Fragment key={index}>{part}</React.Fragment>
                )
            )}
        </>
    );
}

export function findSnippet(
    text: string,
    query: string,
    radius = 80
): string | null {
    const normalizedText = String(text ?? '');
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
        return null;
    }

    const lowerText = normalizedText.toLowerCase();
    const lowerQuery = normalizedQuery.toLowerCase();
    const matchIndex = lowerText.indexOf(lowerQuery);

    if (matchIndex === -1) {
        return null;
    }

    const start = Math.max(0, matchIndex - radius);
    const end = Math.min(
        normalizedText.length,
        matchIndex + normalizedQuery.length + radius
    );

    const prefix = start > 0 ? '…' : '';
    const suffix = end < normalizedText.length ? '…' : '';

    return `${prefix}${normalizedText.slice(start, end)}${suffix}`;
}