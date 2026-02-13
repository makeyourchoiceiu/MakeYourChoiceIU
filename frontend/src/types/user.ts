export type UserRole = 'admin' | 'student';

export interface User {
    id: number;
    email: string;
    name: string;
    role: UserRole;

    // Для студентов
    program?: string;
    year?: string;
    language?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}