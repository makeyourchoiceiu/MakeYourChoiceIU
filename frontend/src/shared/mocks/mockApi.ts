import type { ElectiveDTO } from '@/shared/api/electives';

// ------------------------------------------------------------------
// 1. DTO types for each role
// ------------------------------------------------------------------

export type StudentAuthDTO = {
  id: number;
  mail: string;
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
};

export type AdminAuthDTO = {
  id: number;
  mail: string;
  role: 'admin';
  all_electives: ElectiveDTO[];
};

export type AdminStudentAuthDTO = {
  id: number;
  mail: string;
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
};

// ------------------------------------------------------------------
// 2. Shared mock elective data (to avoid duplication)
// ------------------------------------------------------------------

const mockElectives: ElectiveDTO[] = [
  {
    id: 101,
    name: 'Advanced Python',
    instructor: 'Dr. Smith',
    description: 'Deep dive into Python features.',
    elective_type: 'TECH',
    program_language: 'ENG',
    elective_language: 'english',
    status: 1,
    degree_year: ['BS-3', 'BS-4'],
    prerequisite: 'Basic Python',
  },
  {
    id: 102,
    name: 'Data Structures',
    instructor: 'Prof. Johnson',
    description: 'Algorithms and data structures.',
    elective_type: 'TECH',
    program_language: 'ENG',
    elective_language: 'english',
    status: 1,
    degree_year: ['BS-2', 'BS-3'],
    prerequisite: 'Programming 101',
  },
  {
    id: 103,
    name: 'Russian Literature',
    instructor: 'Dr. Ivanova',
    description: '19th century Russian classics.',
    elective_type: 'HUM',
    program_language: 'RUS',
    elective_language: 'russian',
    status: 1,
    degree_year: ['BS-1', 'BS-2', 'BS-3', 'BS-4'],
    prerequisite: '',
  },
  {
    id: 104,
    name: 'Machine Learning Fundamentals',
    instructor: 'Dr. Lee',
    description: 'Introduction to ML algorithms.',
    elective_type: 'MATH',
    program_language: 'ENG',
    elective_language: 'english',
    status: 1,
    degree_year: ['BS-3', 'BS-4'],
    prerequisite: 'Linear Algebra',
  },
  {
    id: 105,
    name: 'Web Development with React',
    instructor: 'Prof. Chen',
    description: 'Building modern web applications.',
    elective_type: 'TECH',
    program_language: 'ENG',
    elective_language: 'english',
    status: 0, // archived
    degree_year: ['BS-2', 'BS-3', 'BS-4'],
    prerequisite: 'JavaScript basics',
  },
];

// ------------------------------------------------------------------
// 3. Mock functions for each role
// ------------------------------------------------------------------

/**
 * Returns a mock student session DTO.
 * Used for development when the backend is not available.
 */
export function mockStudentAuth(): StudentAuthDTO {
  return {
    id: 999,
    mail: 'mock.student@example.com',
    role: 'student',
    degree_year: 'BS-3',
    program: {
      id: 1,
      name: 'Software Engineering',
      language: 'ENG',
    },
    track: {
      id: 2,
      name: 'Machine Learning',
    },
    available_electives: mockElectives.slice(0, 3), // first 3 electives
    my_choices: [
      {
        elective_type: 'TECH',
        priority: 1,
        elective: mockElectives[0], // Advanced Python
      },
    ],
  };
}

/**
 * Returns a mock admin session DTO.
 * Admins only see all_electives – no student-specific fields.
 */
export function mockAdminAuth(): AdminAuthDTO {
  return {
    id: 1,
    mail: 'mock.admin@example.com',
    role: 'admin',
    all_electives: mockElectives, // all electives (including archived)
  };
}

/**
 * Returns a mock admin-student session DTO.
 * This user has both admin and student privileges.
 */
export function mockAdminStudentAuth(): AdminStudentAuthDTO {
  return {
    id: 42,
    mail: 'mock.admin-student@example.com',
    role: 'admin-student',
    all_electives: mockElectives, // all electives for admin view
    degree_year: 'BS-4',
    program: {
      id: 3,
      name: 'Computer Science',
      language: 'ENG',
    },
    track: {
      id: 5,
      name: 'Data Science',
    },
    available_electives: mockElectives.slice(2, 5), // electives 103, 104, 105
    my_choices: [
      {
        elective_type: 'MATH',
        priority: 1,
        elective: mockElectives[3], // Machine Learning Fundamentals
      },
      {
        elective_type: 'HUM',
        priority: 2,
        elective: mockElectives[2], // Russian Literature
      },
    ],
  };
}