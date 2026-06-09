import { useState, useEffect } from 'react';

// Define the shape of an enrolled course (adjust to match your real data)
interface EnrolledCourse {
  id: string;
  name: string;
  credits: number;
}

// Mock data – replace with real API call later
const MOCK_ENROLLED_COURSES: EnrolledCourse[] = [
  { id: '1', name: 'Advanced TypeScript', credits: 3 },
  { id: '2', name: 'UI/UX Fundamentals', credits: 2 },
];

export const useEnrolledCourses = () => {
  const [data, setData] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const fetchEnrolled = async () => {
      setIsLoading(true);
      // Replace with real fetch: const res = await api.get('/enrollments')
      setTimeout(() => {
        setData(MOCK_ENROLLED_COURSES);
        setIsLoading(false);
      }, 500);
    };
    fetchEnrolled();
  }, []);

  return { data, isLoading };
};