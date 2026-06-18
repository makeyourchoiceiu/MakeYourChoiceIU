/**
 * Reads the CSRF token from the browser's cookies.
 * Django sets a cookie named 'csrftoken' on the first GET request.
 * Falls back to an empty string if the cookie is not found.
 */
export function getCsrfToken(): string {
  const name = 'csrftoken';
  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='))
    ?.split('=')[1];

  return cookieValue || '';
}