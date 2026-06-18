import axios from 'axios';
import type { Elective } from '@/shared/types/elective';

// ------------------------------------------------------------------
// 1. Request DTO (what the backend expects)
// ------------------------------------------------------------------
interface SubmissionElectiveDTO {
  priority: number;       // 1-based priority
  elective_id: string | number; // backend uses numeric id, but we store as string; will convert
}

export interface SubmissionRequestDTO {
  student_id: number | string;
  iteration_id: number;
  elective_type: string;   // e.g., "TECH", "HUM", "MATH" – backend expects uppercase
  electives: SubmissionElectiveDTO[];
}

// ------------------------------------------------------------------
// 2. Response DTO (what the backend returns)
// ------------------------------------------------------------------
interface SubmissionResponseDTO {
  success: boolean;
  message?: string;
  // Optionally might return created history entries
}

// ------------------------------------------------------------------
// 3. Public function
// ------------------------------------------------------------------

/**
 * Submit student's elective choices to the backend.
 * @param studentId – the student's ID (numeric or string)
 * @param iterationId – the iteration ID (numeric)
 * @param electiveType – the type of electives: 'tech', 'hum', 'math' (will be uppercased)
 * @param choices – array of { priority, electiveId } where priority is 1..N
 * @returns Promise<SubmissionResponseDTO>
 */
export async function submitStudentElectives(
  studentId: number | string,
  iterationId: number,
  electiveType: 'tech' | 'hum' | 'math',
  choices: { priority: number; electiveId: string | number }[]
): Promise<SubmissionResponseDTO> {
  // Convert electiveType to uppercase as backend expects
  const typeMap: Record<'tech' | 'hum' | 'math', string> = {
    tech: 'TECH',
    hum: 'HUM',
    math: 'MATH',
  };

  const payload: SubmissionRequestDTO = {
    student_id: studentId,
    iteration_id: iterationId,
    elective_type: typeMap[electiveType],
    electives: choices.map(({ priority, electiveId }) => ({
      priority,
      elective_id: String(electiveId), // ensure it's string; backend can handle numeric strings
    })),
  };

  try {
    const response = await axios.post<SubmissionResponseDTO>(
      '/api/me/submissions',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        // Include credentials if needed (cookies)
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // The backend likely returns error details in response.data
      const errData = error.response.data as { message?: string; detail?: string };
      throw new Error(errData?.message || errData?.detail || 'Submission failed');
    }
    throw new Error('Network error or server unavailable');
  }
}