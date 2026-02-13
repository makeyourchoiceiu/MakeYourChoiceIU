import type { User, AuthResponse } from '../types/user';

const API_URL = 'http://localhost:8000/api';

export const STORAGE_KEYS = {
    TOKEN: 'electives_token',
    USER: 'electives_user',
    EMAIL: 'electives_remembered_email'
};

export const login = async (credentials: { email: string }): Promise<AuthResponse> => {
    // Мок-данные, пока бэкенд не готов
    return new Promise((resolve) => {
        setTimeout(() => {
            const role: 'admin' | 'student' =
                credentials.email === 'admin@innopolis.university' ? 'admin' : 'student';

            const name = credentials.email.split('@')[0];

            resolve({
                token: 'mock-token-' + Date.now(),
                user: {
                    id: 1,
                    email: credentials.email,
                    name: name,
                    role: role,
                    ...(role === 'student' && {
                        program: 'MFAI',
                        year: 'BS1',
                        language: 'EN'
                    })
                }
            });
        }, 500);
    });
};

export const getMe = async (token: string): Promise<User> => {
    // ВРЕМЕННО: мок
    return {
        id: 1,
        email: 'student@innopolis.university',
        name: 'student',
        role: 'student',
        program: 'MFAI',
        year: 'BS1',
        language: 'EN'
    };
};

export const saveAuth = (token: string, user: User, email?: string) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    if (email) {
        localStorage.setItem(STORAGE_KEYS.EMAIL, email);
    }
};

export const getStoredUser = (): User | null => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
};

export const getStoredToken = (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

export const getStoredEmail = (): string => {
    return localStorage.getItem(STORAGE_KEYS.EMAIL) || '';
};

export const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
};