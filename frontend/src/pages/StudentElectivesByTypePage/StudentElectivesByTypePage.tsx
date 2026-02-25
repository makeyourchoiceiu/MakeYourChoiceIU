import { useParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import { useLocale } from '../../app/locale/LocaleContext';
import { useElectives } from '../../hooks/useElectives';
import { ElectivesList } from '../../ui/components/ElectivesList/ElectivesList';
import type { ElectiveType } from '../../types/electives';
import VotingForm, { type ElectiveOption } from '../../ui/forms/VotingForm/VotingForm.tsx';
import { useVotingForm } from '../../hooks/useVotingForm.ts';
import styles from './StudentElectivesByTypePage.module.css';
import { useEffect, useMemo, useState } from 'react';

export function StudentElectivesByTypePage() {
    const { user } = useAuth();
    const { locale } = useLocale();
    const params = useParams();

    const type = params.type as ElectiveType; // tech/hum/math/custom
    const groupId = 'mock-group';

    const favKey = useMemo(() => {
        const userKey = user?.id ? String(user.id) : (user?.email ?? 'anon');
        return `favs:${userKey}:${groupId}:${type}`;
    }, [user, groupId, type]);

    const [favs, setFavs] = useState<Record<string, boolean>>(() => {
        const raw = localStorage.getItem(favKey);
        if (!raw) return {};
        try {
            const ids: string[] = JSON.parse(raw);
            return Object.fromEntries(ids.map((id) => [id, true]));
        } catch {
            return {};
        }
    });

    useEffect(() => {
        const raw = localStorage.getItem(favKey);
        if (!raw) {
            setFavs({});
            return;
        }
        try {
            const ids: string[] = JSON.parse(raw);
            setFavs(Object.fromEntries(ids.map((id) => [id, true])));
        } catch {
            setFavs({});
        }
    }, [favKey]);

    useEffect(() => {
        const ids = Object.keys(favs).filter((id) => favs[id]);
        localStorage.setItem(favKey, JSON.stringify(ids));
    }, [favs, favKey]);

    const isFavourite = (id: string) => !!favs[id];

    const onToggleFavourite = (id: string) => {
        setFavs((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // ⚠️ ВАЖНО:
    // items = отфильтрованные по query (для списка карточек)
    // rawItems = полный список без фильтра (для формы!)
    const { items, rawItems, loading, error, query, setQuery } = useElectives({
        groupId,
        type,
    });

    // Список карточек: поиск влияет, избранные сверху
    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const af = !!favs[a.id];
            const bf = !!favs[b.id];
            return Number(bf) - Number(af);
        });
    }, [items, favs]);

    const { handleSubmit, handleClear } = useVotingForm();

    // Для формы: ВСЕ элективы этого типа (без поиска), избранные сверху
    const sortedForForm = useMemo(() => {
        return [...rawItems].sort((a, b) => {
            const af = !!favs[a.id];
            const bf = !!favs[b.id];
            return Number(bf) - Number(af);
        });
    }, [rawItems, favs]);

    // Стабильный number-id для VotingForm, НЕ зависящий от поиска/сортировки
    const optionIdByElectiveId = useMemo(() => {
        const m = new Map<string, number>();
        rawItems.forEach((e, i) => m.set(e.id, i + 1));
        return m;
    }, [rawItems]);

    // options для селектов — из полного списка (sortedForForm), а не из items
    const options: ElectiveOption[] = useMemo(() => {
        return sortedForForm.map((e) => ({
            id: optionIdByElectiveId.get(e.id)!, // стабильно
            name: e.title,
        }));
    }, [sortedForForm, optionIdByElectiveId]);

    return (
        <div className={styles.page}>
            <div className={styles.list}>
                <ElectivesList
                    role="student"
                    locale={locale}
                    electives={sortedItems}
                    loading={loading}
                    error={error}
                    query={query}
                    onQueryChange={setQuery}
                    isFavourite={isFavourite}
                    onToggleFavourite={onToggleFavourite}
                />
            </div>

            <VotingForm
                electives={options}
                requiredCount={5}
                onSubmit={handleSubmit}
                onClear={handleClear}
                locale={locale}
            />
        </div>
    );
}