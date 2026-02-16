import { useMemo, useState, useRef, useEffect } from 'react';
import styles from './ElectiveCard.module.css';
import { Modal } from '../Modal/Modal';

type Elective = {
    id: string;
    title: string;
    teacher: string;
    language: string;
    program: string;
    year: number;
    description: string;
};

type Role = 'student' | 'admin';
type Locale = 'en' | 'ru';

type ElectiveCardProps = {
    role: Role;
    elective: Elective;
    locale: Locale; // ✅ добавили

    // Student
    isFavourite?: boolean;
    onToggleFavourite?: (id: string) => void;

    // Admin
    onEdit?: (id: string) => void;
    onArchive?: (id: string) => void;
    onDelete?: (id: string) => void;
};

const TEXT = {
    en: {
        meta: {
            teacher: 'Teacher',
            language: 'Language',
            program: 'Program',
            year: 'Year',
        },
        seeMore: 'See more',
        edit: 'Edit',
        archive: 'Archive',
        delete: 'Delete',
        addFav: 'Add to favourites',
        removeFav: 'Remove from favourites',
        openMenu: 'Open menu',
    },
    ru: {
        meta: {
            teacher: 'Преподаватель',
            language: 'Язык',
            program: 'Программа',
            year: 'Курс',
        },
        seeMore: 'Подробнее',
        edit: 'Редактировать',
        archive: 'Архивировать',
        delete: 'Удалить',
        addFav: 'В избранное',
        removeFav: 'Убрать из избранного',
        openMenu: 'Открыть меню',
    },
} as const;

export function ElectiveCard({
                                 role,
                                 elective,
                                 locale,
                                 isFavourite = false,
                                 onToggleFavourite,
                                 onEdit,
                                 onArchive,
                                 onDelete,
                             }: ElectiveCardProps) {
    const [open, setOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const t = TEXT[locale];

    // ✅ meta делаем с ключами, а label подставляем из t (так проще и безопаснее)
    const meta = useMemo(
        () => [
            { key: 'teacher', label: t.meta.teacher, value: elective.teacher }, // ✅
            { key: 'language', label: t.meta.language, value: elective.language },
            { key: 'program', label: t.meta.program, value: elective.program },
            { key: 'year', label: t.meta.year, value: String(elective.year) },
        ],
        [
            t.meta.teacher,
            t.meta.language,
            t.meta.program,
            t.meta.year,
            elective.teacher,
            elective.language,
            elective.program,
            elective.year,
        ]
    );


    // close admin menu on outside click
    useEffect(() => {
        if (!menuOpen) return;

        const onClick = (e: MouseEvent) => {
            const target = e.target as Node;
            if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false);
        };

        window.addEventListener('mousedown', onClick);
        return () => window.removeEventListener('mousedown', onClick);
    }, [menuOpen]);

    const actionNode =
        role === 'student' ? (
            <button
                className={styles.iconButton}
                aria-label={isFavourite ? t.removeFav : t.addFav}
                onClick={() => onToggleFavourite?.(elective.id)}
                type="button"
            >
                <StarIcon filled={isFavourite} />
            </button>
        ) : (
            <div className={styles.menuWrap} ref={menuRef}>
                <button
                    className={styles.iconButton}
                    aria-label={t.openMenu}
                    onClick={() => setMenuOpen((v) => !v)}
                    type="button"
                >
                    <DotsIcon />
                </button>

                {menuOpen ? (
                    <div className={styles.menu} role="menu">
                        <button
                            className={styles.menuItem}
                            role="menuitem"
                            type="button"
                            onClick={() => {
                                setMenuOpen(false);
                                onEdit?.(elective.id);
                            }}
                        >
                            {t.edit}
                        </button>

                        <button
                            className={styles.menuItem}
                            role="menuitem"
                            type="button"
                            onClick={() => {
                                setMenuOpen(false);
                                onArchive?.(elective.id);
                            }}
                        >
                            {t.archive}
                        </button>

                        <button
                            className={`${styles.menuItem} ${styles.menuItemDanger}`}
                            role="menuitem"
                            type="button"
                            onClick={() => {
                                setMenuOpen(false);
                                onDelete?.(elective.id);
                            }}
                        >
                            {t.delete}
                        </button>
                    </div>
                ) : null}
            </div>
        );

    return (
        <>
            <article className={styles.card}>
                <header className={styles.header}>
                    <h3 className={styles.title}>{elective.title}</h3>
                    {actionNode}
                </header>

                <div className={styles.meta}>
                    {meta.map((m) => (
                        <div key={m.key} className={styles.metaRow}>
                            <span className={styles.metaLabel}>{m.label}:</span>
                            <span className={styles.metaValue}>{m.value}</span>
                        </div>
                    ))}
                </div>

                <p className={styles.descriptionPreview}>{elective.description}</p>

                <div className={styles.footer}>
                    <button
                        className="button button--primary button--lg"
                        onClick={() => setOpen(true)}
                        type="button"
                    >
                        {t.seeMore}
                    </button>
                </div>
            </article>

            <Modal
                open={open}
                title={elective.title}
                onClose={() => setOpen(false)}
                footer={
                    role === 'admin' ? (
                        <>
                            <button className="button button--outline" onClick={() => onEdit?.(elective.id)} type="button">
                                {t.edit}
                            </button>
                            <button className="button button--secondary" onClick={() => onArchive?.(elective.id)} type="button">
                                {t.archive}
                            </button>
                            <button className="button button--danger" onClick={() => onDelete?.(elective.id)} type="button">
                                {t.delete}
                            </button>
                        </>
                    ) : (
                        <button
                            className={`button ${isFavourite ? 'button--outline' : 'button--primary'}`}
                            onClick={() => onToggleFavourite?.(elective.id)}
                            type="button"
                        >
                            {isFavourite ? t.removeFav : t.addFav}
                        </button>
                    )
                }
            >
                <div className={styles.modalMeta}>
                    {meta.map((m) => (
                        <div key={m.key} className={styles.modalMetaRow}>
                            <span className={styles.metaLabel}>{m.label}:</span>
                            <span className={styles.metaValue}>{m.value}</span>
                        </div>
                    ))}
                </div>

                <div className={styles.modalDescription}>{elective.description}</div>
            </Modal>
        </>
    );
}

/* --- icons --- */

function StarIcon({ filled }: { filled: boolean }) {
    return (
        <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
            <path
                d="M12 17.3l-5.5 3 1-6.1-4.5-4.4 6.2-.9L12 3l2.8 5.9 6.2.9-4.5 4.4 1 6.1z"
                fill={filled ? 'var(--color-primary)' : 'transparent'}
                stroke="var(--color-primary)"
                strokeWidth="2"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function DotsIcon() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
            <circle cx="6" cy="12" r="1.8" fill="var(--color-primary)" />
            <circle cx="12" cy="12" r="1.8" fill="var(--color-primary)" />
            <circle cx="18" cy="12" r="1.8" fill="var(--color-primary)" />
        </svg>
    );
}
