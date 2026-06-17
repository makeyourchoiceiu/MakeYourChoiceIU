import { useState, useEffect } from 'react';

// Define the shape of an enrolled elective (adjust to match your real data)
interface EnrolledElective {
  id: string;
  name: string;
  credits: number;
}

// Mock data – replace with real API call later
const MOCK_ENROLLED_ELECTIVES: EnrolledElective[] = [
  { id: '1', name: 'Advanced TypeScript', credits: 3 },
  { id: '2', name: 'UI/UX Fundamentals', credits: 2 },
];

export const useEnrolledElectives = () => {
  const [data, setData] = useState<EnrolledElective[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const fetchEnrolled = async () => {
      setIsLoading(true);
      // Replace with real fetch: const res = await api.get('/enrollments')
      setTimeout(() => {
        setData(MOCK_ENROLLED_ELECTIVES);
        setIsLoading(false);
      }, 500);
    };
    fetchEnrolled();
  }, []);

  return { data, isLoading };
};