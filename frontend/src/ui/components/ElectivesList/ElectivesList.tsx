import styles from './ElectivesList.module.css';
import type { Elective } from '../../../types/electives.ts';
import { ElectiveCard } from '../ElectiveCard/ElectiveCard.tsx';
import { useLayoutEffect, useRef } from 'react';


type Role = 'student' | 'admin';
type Locale = 'en' | 'ru';

type Props = {
    role: Role;
    locale: Locale;

    electives: Elective[];

    // поиск
    query: string;
    onQueryChange: (v: string) => void;

    // состояния
    loading?: boolean;
    error?: string;

    // student actions (опционально)
    isFavourite?: (id: string) => boolean;
    onToggleFavourite?: (id: string) => void;

    // admin actions (опционально)
    onEdit?: (id: string) => void;
    onArchive?: (id: string) => void;
    onDelete?: (id: string) => void;
};

const UI = {
    en: {
        searchPlaceholder: 'Search by title, teacher, description…',
        loading: 'Loading…',
        empty: 'No results',
    },
    ru: {
        searchPlaceholder: 'Поиск по названию, преподавателю, описанию…',
        loading: 'Загрузка…',
        empty: 'Ничего не найдено',
    },
} as const;


export function ElectivesList({
                                  role,
                                  locale,
                                  electives,
                                  query,
                                  onQueryChange,
                                  loading = false,
                                  error = '',
                                  isFavourite,
                                  onToggleFavourite,
                                  onEdit,
                                  onArchive,
                                  onDelete,
                              }: Props) {
    const t = UI[locale];

    const nodesRef = useRef(new Map<string, HTMLDivElement>());
    const prevRectsRef = useRef<Map<string, DOMRect>>(new Map());

    const setNode = (id: string) => (el: HTMLDivElement | null) => {
        if (!el) {
            nodesRef.current.delete(id);
            return;
        }
        nodesRef.current.set(id, el);
    };

    useLayoutEffect(() => {
        const prevRects = prevRectsRef.current;
        const nodes = nodesRef.current;

        // 1) меряем новые позиции
        const newRects = new Map<string, DOMRect>();
        nodes.forEach((node, id) => {
            newRects.set(id, node.getBoundingClientRect());
        });

        // 2) применяем инверсию и анимируем в ноль
        newRects.forEach((newRect, id) => {
            const prevRect = prevRects.get(id);
            const node = nodes.get(id);
            if (!prevRect || !node) return;

            const dx = prevRect.left - newRect.left;
            const dy = prevRect.top - newRect.top;

            if (dx === 0 && dy === 0) return;

            node.animate(
                [
                    { transform: `translate(${dx}px, ${dy}px)` },
                    { transform: 'translate(0, 0)' },
                ],
                {
                    duration: 220,
                    easing: 'cubic-bezier(0.2, 0, 0, 1)',
                }
            );
        });

        // 3) сохраняем текущие позиции на следующий рендер
        prevRectsRef.current = newRects;
    }, [electives]);



    return (
        <section className={styles.wrap}>
            <div className={styles.toolbar}>
                <input
                    className={styles.search}
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    aria-label={t.searchPlaceholder}
                />
            </div>

            {loading ? <div className={styles.state}>{t.loading}</div> : null}
            {!loading && error ? <div className={styles.state}>{error}</div> : null}

            {!loading && !error && electives.length === 0 ? (
                <div className={styles.state}>{t.empty}</div>
            ) : (
                <div className={styles.grid}>
                    {electives.map((e) => (
                        <div key={e.id} ref={setNode(e.id)} className={styles.item}>
                            <ElectiveCard
                                role={role}
                                locale={locale}
                                elective={{
                                    id: e.id,
                                    title: e.title,
                                    teacher: e.teacher,
                                    language: e.language,
                                    program: e.program,
                                    year: e.year,
                                    description: e.description,
                                }}
                                isFavourite={isFavourite ? isFavourite(e.id) : false}
                                onToggleFavourite={onToggleFavourite}
                                onEdit={onEdit}
                                onArchive={onArchive}
                                onDelete={onDelete}
                            />
                        </div>
                    ))}
                </div>

            )}
        </section>
    );
}
