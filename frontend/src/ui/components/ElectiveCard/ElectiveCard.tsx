import { useMemo, useState, useRef, useEffect } from 'react';
import styles from './ElectiveCard.module.css';
import { Modal } from '../Modal/Modal';

type Elective = {
    id: string;
    title: string;
    language: string;
    program: string; // можно string[] если нужно
    year: number;
    description: string;
};

type Role = 'student' | 'admin';

type ElectiveCardProps = {
    role: Role;
    elective: Elective;

    // Student
    isFavourite?: boolean;
    onToggleFavourite?: (id: string) => void;

    // Admin
    onEdit?: (id: string) => void;
    onArchive?: (id: string) => void;
    onDelete?: (id: string) => void;
};

export function ElectiveCard({
                                 role,
                                 elective,
                                 isFavourite = false,
                                 onToggleFavourite,
                                 onEdit,
                                 onArchive,
                                 onDelete,
                             }: ElectiveCardProps) {
    const [open, setOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const meta = useMemo(
        () => [
            { label: 'Language', value: elective.language },
            { label: 'Program', value: elective.program },
            { label: 'Year', value: String(elective.year) },
        ],
        [elective.language, elective.program, elective.year]
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
                aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                onClick={() => onToggleFavourite?.(elective.id)}
            >
                <StarIcon filled={isFavourite} />
            </button>
        ) : (
            <div className={styles.menuWrap} ref={menuRef}>
                <button
                    className={styles.iconButton}
                    aria-label="Open menu"
                    onClick={() => setMenuOpen((v) => !v)}
                >
                    <DotsIcon />
                </button>

                {menuOpen ? (
                    <div className={styles.menu} role="menu">
                        <button
                            className={styles.menuItem}
                            role="menuitem"
                            onClick={() => {
                                setMenuOpen(false);
                                onEdit?.(elective.id);
                            }}
                        >
                            Edit
                        </button>
                        <button
                            className={styles.menuItem}
                            role="menuitem"
                            onClick={() => {
                                setMenuOpen(false);
                                onArchive?.(elective.id);
                            }}
                        >
                            Archive
                        </button>
                        <button
                            className={`${styles.menuItem} ${styles.menuItemDanger}`}
                            role="menuitem"
                            onClick={() => {
                                setMenuOpen(false);
                                onDelete?.(elective.id);
                            }}
                        >
                            Delete
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
                        <div key={m.label} className={styles.metaRow}>
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
                    >
                        See more
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
                            <button
                                className="button button--outline"
                                onClick={() => onEdit?.(elective.id)}
                            >
                                Edit
                            </button>
                            <button
                                className="button button--secondary"
                                onClick={() => onArchive?.(elective.id)}
                            >
                                Archive
                            </button>
                            <button
                                className="button button--danger"
                                onClick={() => onDelete?.(elective.id)}
                            >
                                Delete
                            </button>
                        </>
                    ) : (
                        <button
                            className={`button ${isFavourite ? 'button--outline' : 'button--primary'}`}
                            onClick={() => onToggleFavourite?.(elective.id)}
                        >
                            {isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                        </button>
                    )
                }
            >
                <div className={styles.modalMeta}>
                    {meta.map((m) => (
                        <div key={m.label} className={styles.modalMetaRow}>
                            <span className={styles.metaLabel}>{m.label}:</span>
                            <span className={styles.metaValue}>{m.value}</span>
                        </div>
                    ))}
                </div>

                <div className={styles.modalDescription}>
                    {elective.description}
                </div>
            </Modal>
        </>
    );
}

/* --- icons (простые inline SVG, чтобы не тащить либы) --- */

function StarIcon({ filled }: { filled: boolean }) {
    return (
        <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={styles.icon}
        >
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
