import {useEffect, useState} from "react";
import {getElectiveById} from "../api/electives.ts";
import type {Elective} from "../types/elective.ts";

interface UseElectiveResult {
    elective: Elective | null;
    loading: boolean;
    error: string | null;
}

export function useElective(id: number): UseElectiveResult {

    const [elective, setElective] = useState<Elective | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);
                const data = await getElectiveById(id);

                if (!cancelled) {
                    setElective(data)
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();
        return () => {
            cancelled = true;
        }
    }, [id]);

    return {elective, loading, error}
}