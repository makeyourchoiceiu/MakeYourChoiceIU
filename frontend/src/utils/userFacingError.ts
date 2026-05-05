const FRIENDLY_MAP: Array<{ pattern: RegExp; message: string }> = [
    {
        pattern: /track is used by existing students/i,
        message: 'Cannot delete this track because students are linked to it.',
    },
    {
        pattern: /elective type is used by existing electives/i,
        message: 'Cannot delete this elective type because it is already used by electives.',
    },
    {
        pattern: /http 400/i,
        message: 'Request validation failed. Please check the data and try again.',
    },
    {
        pattern: /http 404/i,
        message: 'Requested data was not found.',
    },
    {
        pattern: /http 500/i,
        message: 'Server error. Please try again in a moment.',
    },
];

export function toUserFacingError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
    const raw = error instanceof Error ? error.message : String(error ?? '').trim();
    if (!raw) {
        return fallback;
    }
    const matched = FRIENDLY_MAP.find((item) => item.pattern.test(raw));
    return matched ? matched.message : raw;
}
