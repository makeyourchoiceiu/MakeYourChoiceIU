// frontend/src/api/auth.ts
import axios from 'axios';
import { getCsrfToken } from '@/shared/utils/csrf';
import { mockStudentAuth, mockAdminAuth, mockAdminStudentAuth } from '@/shared/mocks/mockApi';
import { dtoToElective, type ElectiveDTO } from './electives';
import type { Elective } from '@/shared/types/elective';

// ------------------------------------------------------------------
// 1. DTO types (strictly internal to this module)
// ------------------------------------------------------------------

/**
 * Base DTO fields that all auth responses share.
 */
interface BaseAuthDTO {
  id: number;
  mail: string;
}

/**
 * DTO for a pure admin (no student record).
 */
export interface AdminAuthDTO extends BaseAuthDTO {
  role: 'admin';
  all_electives: ElectiveDTO[];
}

/**
 * DTO for a pure student (no admin record).
 */
export interface StudentAuthDTO extends BaseAuthDTO {
  role: 'student';
  degree_year: string;
  program: {
    id: number;
    name: string;
    language: string;
  };
  track: {
    id: number;
    name: string;
  } | null;
  available_electives: ElectiveDTO[];
  my_choices: {
    elective_type: string;
    priority: number;
    elective: ElectiveDTO;
  }[];
  iteration_id: number;
}

/**
 * DTO for an admin-student (found in both tables).
 * Merges fields from both admin and student responses.
 */
export interface AdminStudentAuthDTO extends BaseAuthDTO {
  role: 'admin-student';
  all_electives: ElectiveDTO[];
  degree_year: string;
  program: {
    id: number;
    name: string;
    language: string;
  };
  track: {
    id: number;
    name: string;
  } | null;
  available_electives: ElectiveDTO[];
  my_choices: {
    elective_type: string;
    priority: number;
    elective: ElectiveDTO;
  }[];
  iteration_id: number;
}

type AuthDTO = AdminAuthDTO | StudentAuthDTO | AdminStudentAuthDTO;

// ------------------------------------------------------------------
// 2. Frontend domain models (what your app actually uses)
// ------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'student' | 'admin-student';
}

export interface AuthSession {
  user: AuthUser;
  /** The current UI mode: 'admin' or 'student'. For pure roles, this is fixed. */
  effectiveMode: 'admin' | 'student';
  /** All electives (for admin pages). Always available for admin / admin-student. */
  allElectives: Elective[];
  /** Student-specific fields – only populated for student / admin-student. */
  degreeYear?: string;
  program?: {
    id: number;
    name: string;
    language: string;
  };
  track?: {
    id: number;
    name: string;
  } | null;
  /** Electives available for the student to choose from. */
  availableElectives?: Elective[];
  /** The student’s previously saved choices. */
  myChoices?: {
    electiveType: string;
    priority: number;
    elective: Elective;
  }[];
  iterationId?: number;
}

// ------------------------------------------------------------------
// 3. Mappers (the only place where DTO ↔ Model conversion happens)
// ------------------------------------------------------------------

/**
 * Maps a single choice DTO to the frontend model.
 */
function mapChoice(dtoChoice: {
  elective_type: string;
  priority: number;
  elective: ElectiveDTO;
}) {
  return {
    electiveType: dtoChoice.elective_type,
    priority: dtoChoice.priority,
    elective: dtoToElective(dtoChoice.elective),
  };
}

/**
 * Converts the backend auth DTO into a clean frontend session.
 * Handles all three roles gracefully.
 */
function dtoToAuthSession(dto: AuthDTO): AuthSession {
  const baseUser: AuthUser = {
    id: String(dto.id),
    email: dto.mail,
    role: dto.role,
  };

  // ---------- PURE ADMIN ----------
  if (dto.role === 'admin') {
    return {
      user: baseUser,
      effectiveMode: 'admin',
      allElectives: dto.all_electives?.map(dtoToElective) ?? [],
    };
  }

  // ---------- PURE STUDENT ----------
  if (dto.role === 'student') {
    return {
      user: baseUser,
      effectiveMode: 'student',
      allElectives: [], // students don't have this field
      degreeYear: dto.degree_year,
      program: dto.program,
      track: dto.track,
      availableElectives: dto.available_electives?.map(dtoToElective) ?? [],
      myChoices: dto.my_choices?.map(mapChoice) ?? [],
      iterationId: dto.iteration_id
    };
  }

  // ---------- ADMIN-STUDENT ----------
  // Default effectiveMode is 'admin' because the admin dashboard is the primary view.
  // The user can toggle to 'student' mode via the header button.
  return {
    user: baseUser,
    effectiveMode: 'admin', // will be overridden by useAuth if a preference is stored
    allElectives: dto.all_electives?.map(dtoToElective) ?? [],
    degreeYear: dto.degree_year,
    program: dto.program,
    track: dto.track,
    availableElectives: dto.available_electives?.map(dtoToElective) ?? [],
    myChoices: dto.my_choices?.map(mapChoice) ?? [],
    iterationId: dto.iteration_id
  };
}

// ------------------------------------------------------------------
// 4. Public API functions
// ------------------------------------------------------------------

/**
 * GET /api/auth/email?email=...
 * Logs in a user by email and returns their full session.
 * Supports a mock student for development.
 *
 * @param email - The user's email address.
 * @returns A fully mapped AuthSession for the frontend.
 */
export async function loginByEmail(email: string): Promise<AuthSession> {
  // --- Mock support for development ---
  if (email === 'mock.student@example.com') {
    return dtoToAuthSession(mockStudentAuth());
  }

  if (email === 'mock.admin@example.com') {
    return dtoToAuthSession(mockAdminAuth());
  }

  if (email === 'mock.admin-student@example.com') {
    return dtoToAuthSession(mockAdminStudentAuth());
  }

  // --- Real backend call ---
  try {
    const response = await axios.get<AuthDTO>('/api/auth/email', {
      params: { email },
      withCredentials: true,
      headers: {
        // CSRF token is read from the cookie and sent in the header.
        'X-CSRFToken': getCsrfToken(),
      },
    });

    return dtoToAuthSession(response.data);
  } catch (error) {
    // Re-throw with a friendly message, or let the caller handle it.
    // useAuth will catch this and set an error state.
    throw error;
  }
}

/**
 * Utility to clear the session – purely a client‑side operation.
 * The backend has no session‑based logout endpoint (no cookies set).
 */
export function clearSession(): void {
  localStorage.removeItem('myc-auth-session');
  // Optionally clear other sensitive data.
}