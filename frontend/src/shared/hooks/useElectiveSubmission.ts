import { useState, useCallback } from 'react';
import { submitStudentElectives } from '@/shared/api/studentVoting';

interface UseElectiveSubmissionParams {
  studentId: number | string;
  iterationId: number;
}

interface UseElectiveSubmissionReturn {
  submit: (selectedIds: string[], type: 'tech' | 'hum' | 'math') => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export function useElectiveSubmission({
                                        studentId,
                                        iterationId,
                                      }: UseElectiveSubmissionParams): UseElectiveSubmissionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = useCallback(
    async (selectedIds: string[], type: 'tech' | 'hum' | 'math') => {
      const choices = selectedIds.map((id, index) => ({
        priority: index + 1,
        electiveId: id,
      }));

      setIsLoading(true);
      setError(null);

      try {
        await submitStudentElectives(studentId, iterationId, type, choices);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Submission failed');
        setError(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    [studentId, iterationId]
  );

  return { submit, isLoading, error };
}