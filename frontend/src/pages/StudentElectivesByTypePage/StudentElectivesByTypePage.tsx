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
        // лучше использовать user.id если он есть, иначе email
        const userKey = user?.id ? String(user.id) : (user?.email ?? 'anon');
        // храним избранное отдельно по группе и по типу элективов
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


    const { items, loading, error, query, setQuery } = useElectives({
        groupId,
        type,
    });

    const sortedItems = useMemo(() => {
        // стабильная сортировка: сначала fav=true, потом остальные
        // внутри групп порядок сохраняем как был (в том числе после поиска)
        return [...items].sort((a, b) => {
            const af = !!favs[a.id];
            const bf = !!favs[b.id];
            return Number(bf) - Number(af); // true(1) идет раньше false(0)
        });
    }, [items, favs]);


    const { handleSubmit, handleClear } = useVotingForm();

// преобразуем карточки в options для селектов
    const options: ElectiveOption[] = items.map((e, idx) => ({
        id: idx + 1,          // временно number, пока бэк не готов
        name: e.title,        // можно `${e.title} — ${e.teacher}` если хочешь
    }));

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
