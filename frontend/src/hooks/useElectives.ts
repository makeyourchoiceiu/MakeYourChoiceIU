import { useCallback, useEffect, useState } from 'react';
import { getElectives } from '../api/electives';
import type { Elective } from '../types/elective';

interface UseElectivesResult {
    electives: Elective[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Хук для загрузки списка элективов.
 *
 * Возвращает:
 * - electives: массив курсов
 * - loading: идёт ли загрузка
 * - error: текст ошибки
 * - refetch: возможность перезагрузить список вручную
 */
export function useElectives(): UseElectivesResult {
    const [electives, setElectives] = useState<Elective[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getElectives();
            setElectives(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setError(null);

                const data = await getElectives();

                if (!cancelled) {
                    setElectives(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Unknown error');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, []);

    return { electives, loading, error, refetch };
}
