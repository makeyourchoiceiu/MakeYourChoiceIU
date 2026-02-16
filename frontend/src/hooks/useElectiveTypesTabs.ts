import { useEffect, useState } from 'react';
import { getAvailableElectiveTypes, type ElectiveTypeTab } from '../api/electiveTypes';

export function useElectiveTypesTabs(groupId: string, locale: 'en' | 'ru') {
    const [tabs, setTabs] = useState<ElectiveTypeTab[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        setError('');

        getAvailableElectiveTypes(groupId, locale)
            .then((data) => {
                if (!cancelled) setTabs(data);
            })
            .catch(() => {
                if (!cancelled) setError('Failed to load elective types');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [groupId, locale]);

    return { tabs, loading, error };
}
