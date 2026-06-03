import type { Elective } from './elective';
import type { StudentProfileElectiveType } from './studentSidebar';

export type UserRole = 'student' | 'admin' | 'admin-student';
export type EffectiveMode = 'student' | 'admin';

export interface StudentAvailableElectiveResponse {
    id: number;
    name: string;
    instructor: string;
    description: string;
    elective_language: string;
    prerequisite: string;
}

export interface StudentAvailableElectiveGroupResponse {
    elective_type: string;
    priorities: number;
    electives: StudentAvailableElectiveResponse[];
}

export interface StudentChosenElectiveResponse {
    priority: number;
    elective: StudentAvailableElectiveResponse;
}

export interface StudentChosenElectiveGroupResponse {
    elective_type: string;
    electives: StudentChosenElectiveResponse[];
}

export interface StudentDataResponse {
    iteration_id: number;
    deadline: string;
    available_electives: StudentAvailableElectiveGroupResponse[];
    chosen_electives: StudentChosenElectiveGroupResponse[];
}

export interface StudentAuthResponse {
    student_id: number;
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

export interface AuthUser {
    email: string;
    role: UserRole;
    group: string | null;
}

export interface NormalizedStudentData {
    deadline: string;
    availableElectiveTypes: StudentProfileElectiveType[];
}