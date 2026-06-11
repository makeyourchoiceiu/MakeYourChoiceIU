import { Course } from '@/shared/types/course';

export const fetchCourses = async (): Promise<Course[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Return mock data matching your image
  return [
    {
      id: '1',
      title: 'Haskell',
      language: 'English',
      format: 'offline',
      instructor: 'Nikolay Kudasov',
      description: 'The main purpose of this course is to present purely functional programming with a strong static type system...',
      isFavorite: false,
    },
    {
      id: '2',
      title: 'Introduction to Music Generation',
      language: 'English',
      format: 'offline',
      instructor: 'Munir Makhmutov',
      description: 'The target audience of this course are students interested in music generation...',
      isFavorite: false,
    },
    {
      id: '3',
      title: 'Business Analysis in IT',
      language: 'English',
      format: 'offline',
      instructor: 'Ivan Goskov',
      description: 'Business Analysis in IT has become a high-demand trend in recent years...',
      isFavorite: false,
    },
    // ... add more courses
  ];
};

export const fetchDeadline = async (): Promise<string> => {
  return 'August 28, 23:59';
};