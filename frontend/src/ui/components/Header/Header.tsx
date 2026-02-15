import { useEffect, useRef, useState } from 'react';
import styles from './Header.module.css';

type Role = 'student' | 'admin' | 'combined';

type HeaderProps = {
    email: string;
    role: Role;

    // студентам показываем дедлайн
    deadlineText?: string; // например: "Deadline: 2d 14h"
    // язык интерфейса
    locale: 'en' | 'ru';
    onToggleLocale: () => void;

    // меню
    onLogout: () => void;
    onSwitchToStudent?: () => void; // для combined, но пока показываем всем админам
};

export function Header({
                           email,
                           role,
                           deadlineText,
                           locale,
                           onToggleLocale,
                           onLogout,
                           onSwitchToStudent,
                       }: HeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement | null>(null);

    // закрыть меню по клику снаружи / по Esc
    useEffect(() => {
        if (!menuOpen) return;

        const onDown = (e: MouseEvent) => {
            const t = e.target as Node;
            if (wrapRef.current && !wrapRef.current.contains(t)) setMenuOpen(false);
        };

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };

        window.addEventListener('mousedown', onDown);
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('mousedown', onDown);
            window.removeEventListener('keydown', onKey);
        };
    }, [menuOpen]);

    const showSwitchToStudent = role === 'admin' || role === 'combined'; // как ты попросила (пока для всех админов)
    const t = {
        logout: locale === 'ru' ? 'Выйти' : 'Log out',
        switchToStudent: locale === 'ru' ? 'Переключиться на студента' : 'Switch to student',
    };

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                {/* тут можно будет потом добавить название страницы/логотип, но пока минимально */}
            </div>

            <div className={styles.right}>
                {/* deadline только студентам */}
                {role === 'student' && deadlineText ? (
                    <div className={styles.deadline} title="Deadline">
                        {deadlineText}
                    </div>
                ) : null}

                {/* toggle языка */}
                <button
                    type="button"
                    className={styles.langButton}
                    onClick={onToggleLocale}
                    aria-label="Switch language"
                >
                    {locale === 'en' ? 'EN' : 'RU'}
                </button>

                {/* профиль + email + dropdown */}
                <div className={styles.profileWrap} ref={wrapRef}>
                    <button
                        type="button"
                        className={`${styles.profileButton} ${menuOpen ? styles.profileButtonActive : ''}`}
                        onClick={() => setMenuOpen((v) => !v)}
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                    >
                        <ProfileIcon active={menuOpen} />
                        <span className={`${styles.email} ${menuOpen ? styles.emailActive : ''}`}>
                            {email}
                        </span>
                    </button>

                    {menuOpen ? (
                        <div className={styles.menu} role="menu">
                            {showSwitchToStudent ? (
                                <button
                                    type="button"
                                    className={styles.menuItem}
                                    role="menuitem"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onSwitchToStudent?.();
                                    }}
                                >
                                    {t.switchToStudent}
                                </button>
                            ) : null}

                            <button
                                type="button"
                                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                                role="menuitem"
                                onClick={() => {
                                    setMenuOpen(false);
                                    onLogout();
                                }}
                            >
                                {t.logout}
                            </button>
                        </div>
                    ) : null}

                </div>
            </div>
        </header>
    );
}

function ProfileIcon({ active }: { active: boolean }) {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={styles.icon}
        >
            <path
                d="M12 12c2.4 0 4.3-2 4.3-4.4S14.4 3.2 12 3.2 7.7 5.2 7.7 7.6 9.6 12 12 12zm0 2.2c-3.6 0-7 1.9-7 4.5V20.8h14V18.7c0-2.6-3.4-4.5-7-4.5z"
                fill={active ? 'var(--color-primary)' : 'var(--color-text-lighter)'}
            />
        </svg>
    );
}
