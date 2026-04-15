import type { Elective } from './elective';
import type { StudentProfileElectiveType } from './studentSidebar';

export type UserRole = 'student' | 'admin' | 'admin-student';

export interface StudentAvailableElectiveGroupResponse {
    elective_type: string;
    priorities: number;
    electives: Array<{
        id: number;
        name: string;
        instructor: string;
        description: string;
        elective_language: string;
        prerequisite: string;
    }>;
}

export interface StudentDataResponse {
    deadline: string;
    available_electives: StudentAvailableElectiveGroupResponse[];
}

export interface StudentAuthResponse {
    role: 'student';
    email: string;
    student_data: StudentDataResponse;
}

export interface AdminAuthResponse {
    role: 'admin';
    email: string;
    all_electives: Elective[];
}

export interface AdminStudentAuthResponse {
    role: 'admin-student';
    email: string;
    all_electives: Elective[];
    student_data: StudentDataResponse;
}

export type AuthResponse =
    | StudentAuthResponse
    | AdminAuthResponse
    | AdminStudentAuthResponse;

/**
 * Нормализованный auth user для UI.
 * Group пока у бэка явно не приходит, поэтому временно делаем nullable.
 */
export interface AuthUser {
    email: string;
    role: UserRole;
    group: string | null;
}

export interface NormalizedStudentData {
    deadline: string;
    availableElectiveTypes: StudentProfileElectiveType[];
}