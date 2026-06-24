import apiClient from './client';
import { dtoToElective, type ElectiveDTO } from './electives';
import type { Elective } from '@/shared/types/elective';

// ------------------------------------------------------------------
// 1. DTO types – match the actual backend responses
// ------------------------------------------------------------------

interface BaseAuthDTO {
  role: 'admin' | 'student' | 'admin-student';
  email: string;
}

interface AdminAuthDTO extends BaseAuthDTO {
  role: 'admin';
  admin_id: number;
  all_electives: ElectiveDTO[];
}

interface StudentDataDTO {
  iteration_id: number;
  deadline: string;
  available_electives: {
    elective_type: string;
    priorities: number;
    electives: ElectiveDTO[];
  }[];
  chosen_electives: {
    elective_type: string;
    electives: {
      priority: number;
      elective: ElectiveDTO;
    }[];
  }[];
}

interface StudentAuthDTO extends BaseAuthDTO {
  role: 'student';
  student_id: number;
  student_data: StudentDataDTO;
}

// Admin‑student response now includes student_id (backend fixed)
interface AdminStudentAuthDTO extends BaseAuthDTO {
  role: 'admin-student';
  student_id: number;              // <-- now present
  admin_id?: number;              // not used, but keep optional
  all_electives: ElectiveDTO[];
  student_data: StudentDataDTO;
}

type AuthDTO = AdminAuthDTO | StudentAuthDTO | AdminStudentAuthDTO;

// ------------------------------------------------------------------
// 2. Frontend domain models
// ------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'student' | 'admin-student';
}

export interface AuthSession {
  user: AuthUser;
  effectiveMode: 'admin' | 'student';
  allElectives: Elective[];
  degreeYear?: string;
  program?: { id: number; name: string; language: string };
  track?: { id: number; name: string } | null;
  availableElectives?: Elective[];
  myChoices?: { electiveType: string; priority: number; elective: Elective }[];
  iterationId?: number;
  deadline?: string;
  studentId?: number;   // numeric student ID, used for submissions
  adminId?: number;     // optional, if we ever need it
}

// ------------------------------------------------------------------
// 3. Mappers
// ------------------------------------------------------------------

/**
 * Flatten available_electives from groups into a single array of Elective
 */
function flattenAvailableElectives(
  groups: StudentDataDTO['available_electives']
): Elective[] {
  const result: Elective[] = [];
  groups?.forEach(group => {
    group.electives.forEach(electiveDto => {
      const elective = dtoToElective(electiveDto);
      elective.backendType = group.elective_type;
      result.push(elective);
    });
  });
  return result;
}

/**
 * Flatten chosen_electives from groups into a flat array of choices
 */
function flattenChosenElectives(
  groups: StudentDataDTO['chosen_electives']
): { electiveType: string; priority: number; elective: Elective }[] {
  const result: { electiveType: string; priority: number; elective: Elective }[] = [];
  groups?.forEach(group => {
    group.electives.forEach(item => {
      result.push({
        electiveType: group.elective_type,
        priority: item.priority,
        elective: dtoToElective(item.elective),
      });
    });
  });
  return result;
}

function dtoToAuthSession(dto: AuthDTO): AuthSession {
  // ---------- ADMIN ----------
  if (dto.role === 'admin') {
    const adminDto = dto as AdminAuthDTO;
    return {
      user: {
        id: String(adminDto.admin_id),
        email: adminDto.email,
        role: 'admin',
      },
      effectiveMode: 'admin',
      allElectives: (adminDto.all_electives ?? []).map(dtoToElective),
    };
  }

  // ---------- STUDENT ----------
  if (dto.role === 'student') {
    const studentDto = dto as StudentAuthDTO;
    const data = studentDto.student_data;
    return {
      user: {
        id: String(studentDto.student_id),
        email: studentDto.email,
        role: 'student',
      },
      effectiveMode: 'student',
      allElectives: [],
      availableElectives: flattenAvailableElectives(data.available_electives),
      myChoices: flattenChosenElectives(data.chosen_electives),
      iterationId: data.iteration_id,
      deadline: data.deadline,
      studentId: studentDto.student_id,
    };
  }

  // ---------- ADMIN-STUDENT ----------
  if (dto.role === 'admin-student') {
    const adminStudentDto = dto as AdminStudentAuthDTO;
    const data = adminStudentDto.student_data;

    // student_id is now guaranteed by the backend; no warning needed
    return {
      user: {
        id: String(adminStudentDto.student_id),
        email: adminStudentDto.email,
        role: 'admin-student',
      },
      effectiveMode: 'admin', // default to admin view
      allElectives: (adminStudentDto.all_electives ?? []).map(dtoToElective),
      availableElectives: flattenAvailableElectives(data.available_electives),
      myChoices: flattenChosenElectives(data.chosen_electives),
      iterationId: data.iteration_id,
      deadline: data.deadline,
      studentId: adminStudentDto.student_id,
    };
  }

  // This should never happen
  throw new Error(`Unsupported role: ${(dto as any).role}`);
}

// ------------------------------------------------------------------
// 4. Public API functions
// ------------------------------------------------------------------

export async function loginByEmail(email: string): Promise<AuthSession> {
  try {
    const response = await apiClient.get<AuthDTO>('/auth/email', {
      params: { email },
    });
    return dtoToAuthSession(response.data);
  } catch (error) {
    // Let the caller (useAuth) handle the error
    throw error;
  }
}

export function clearSession(): void {
  localStorage.removeItem('myc-auth-session');
}