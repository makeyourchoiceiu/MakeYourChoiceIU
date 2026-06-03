/**
 * Some descriptions are stored with escaped markdown punctuation
 * like \*\*bold\*\*, so react-markdown renders literal asterisks.
 * Normalize the common escaped markdown tokens before rendering/editing.
 */
export function normalizeStoredMarkdown(value: string): string {
    return String(value ?? '').replace(/\\([\\`*_{}\[\]()#+\-.!>])/g, '$1');
}
