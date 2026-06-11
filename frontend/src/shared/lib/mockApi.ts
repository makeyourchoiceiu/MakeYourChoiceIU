// src/shared/lib/mockApi.ts

export interface Course {
  id: string;
  title: string;
  language: 'English' | 'Russian';
  format: 'offline' | 'online';
  instructor: string;
  description: string;
  credits: number;
  totalSeats: number;
  enrolled: number;   // how many students already enrolled
}

// Mock courses data
export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Haskell',
    language: 'English',
    format: 'offline',
    instructor: 'Nikolay Kudasov',
    description: 'The main purpose of this course is to present purely functional programming with a strong static type system and discuss its benefits for structuring...',
    credits: 3,
    totalSeats: 30,
    enrolled: 12,
  },
  {
    id: '2',
    title: 'Introduction to Music Generation',
    language: 'English',
    format: 'offline',
    instructor: 'Munir Makhmutov',
    description: 'The target audience of this course are students interested in music generation...',
    credits: 2,
    totalSeats: 25,
    enrolled: 8,
  },
  {
    id: '3',
    title: 'Advanced React Patterns',
    language: 'English',
    format: 'online',
    instructor: 'Jane Smith',
    description: 'Deep dive into compound components, render props, and state management with React hooks.',
    credits: 4,
    totalSeats: 40,
    enrolled: 25,
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch all courses
export const fetchCourses = async (): Promise<Course[]> => {
  await delay(500);
  return [...mockCourses];
};

// Fetch a single course by id
export const fetchCourseById = async (id: string): Promise<Course | undefined> => {
  await delay(300);
  return mockCourses.find(c => c.id === id);
};

// Enroll in a course (decrease available seats, increment enrolled)
export const enrollInCourse = async (courseId: string): Promise<{ success: boolean; message: string; updatedCourse?: Course }> => {
  await delay(500);
  const course = mockCourses.find(c => c.id === courseId);
  if (!course) {
    return { success: false, message: 'Course not found' };
  }
  if (course.enrolled >= course.totalSeats) {
    return { success: false, message: 'No seats available' };
  }
  // In a real API you would also check if the student is already enrolled.
  course.enrolled += 1;
  return { success: true, message: 'Enrolled successfully', updatedCourse: course };
};

// Drop a course
export const dropCourse = async (courseId: string): Promise<{ success: boolean; message: string; updatedCourse?: Course }> => {
  await delay(500);
  const course = mockCourses.find(c => c.id === courseId);
  if (!course) {
    return { success: false, message: 'Course not found' };
  }
  if (course.enrolled <= 0) {
    return { success: false, message: 'No enrolled students to drop' };
  }
  course.enrolled -= 1;
  return { success: true, message: 'Dropped successfully', updatedCourse: course };
};

// For the sidebar: get currently enrolled courses for a specific student.
// In a real app this would be user‑specific. For mock, we just return a subset.
export const fetchMyEnrolledCourses = async (studentId: string = 'me'): Promise<Course[]> => {
  await delay(400);
  // For demo, assume student enrolled in course id '1' and '2'
  const enrolledIds = ['1', '2'];
  return mockCourses.filter(c => enrolledIds.includes(c.id));
};