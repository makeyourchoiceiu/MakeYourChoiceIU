import { StudentProfile } from '@/shared/types/user';

// replace with real API call later
const MOCK_STUDENT: StudentProfile = {
  id: 'student-123',
  name: 'Ivan Petrov',
  program: 'MFAI',
  yearOfStudy: 2,
  completedElectives: ['elective-001', 'elective-005'], // IDs of electives already taken
};

export const fetchStudentProfile = async (): Promise<StudentProfile> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // In a real app: return fetch('/api/students/me').then(res => res.json());
  return MOCK_STUDENT;
};