import { useEffect, useMemo, useState } from 'react';
import type { Elective, ElectiveType } from '../types/electives';
import { getElectives } from '../api/electives';

type Params = {
    groupId: string;
    type?: ElectiveType; // tech | hum | math | custom
};

export function useElectives({ groupId, type }: Params) {
    // 1) "сырой" список с сервера (или мока)
    const [rawItems, setRawItems] = useState<Elective[]>([]);

    // 2) состояния запроса
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // 3) поисковая строка (UI будет менять её через setQuery)
    const [query, setQuery] = useState<string>('');

    // 4) загрузка с бэка/мока при изменении groupId/type
    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        setError('');

        getElectives({ groupId, type })
            .then((data) => {
                if (cancelled) return;
                setRawItems(data);
            })
            .catch(() => {
                if (cancelled) return;
                setError('Failed to load electives');
                setRawItems([]);
            })
            .finally(() => {
                if (cancelled) return;
                setLoading(false);
            });

        // cleanup: если компонент размонтировался или параметры сменились
        // не обновляем state “поздним” ответом
        return () => {
            cancelled = true;
        };
    }, [groupId, type]);

    // 5) фильтрация по поиску (быстро и удобно держать в хуке)
    const items = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return rawItems;

        return rawItems.filter((e) => {
            // поиск по всему контенту внутри карточки:
            // название, преподаватель, описание (можно расширять)
            const haystack = `${e.title} ${e.teacher} ${e.description}`.toLowerCase();

            // если хочешь включить ещё program/language/year:
            // const haystack = `${e.title} ${e.teacher} ${e.description} ${e.program} ${e.language} ${e.year}`.toLowerCase();

            return haystack.includes(q);
        });
    }, [rawItems, query]);

    return {
        // данные
        items,     // уже отфильтрованные по query
        rawItems,  // исходные без фильтра (иногда полезно)

        // состояния
        loading,
        error,

        // поиск
        query,
        setQuery,

        // утилиты (удобно для UI)
        refresh: async () => {
            // ручное обновление (например, кнопка "обновить")
            setLoading(true);
            setError('');
            try {
                const data = await getElectives({ groupId, type });
                setRawItems(data);
            } catch {
                setError('Failed to load electives');
                setRawItems([]);
            } finally {
                setLoading(false);
            }
        },
    };
}
