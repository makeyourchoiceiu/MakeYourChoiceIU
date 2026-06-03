export function getCookie(name: string): string | null {
    const cookieString = document.cookie;

    if (!cookieString) {
        return null;
    }

    const cookies = cookieString.split(';');

    for (const cookie of cookies) {
        const trimmed = cookie.trim();

        if (trimmed.startsWith(`${name}=`)) {
            return decodeURIComponent(trimmed.slice(name.length + 1));
        }
    }

    return null;
}

export function getCsrfToken(): string | null {
    return getCookie('csrftoken');
}