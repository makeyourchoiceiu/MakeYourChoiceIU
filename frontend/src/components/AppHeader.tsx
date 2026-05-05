import type { AuthUser } from '../types/auth';
import { HeaderProfileMenu } from './HeaderProfileMenu';
import { useHeaderProfileMenu } from '../hooks/useHeaderProfileMenu';
import { NavLink } from 'react-router-dom';
import buttonStyles from '../styles/button.module.css';
import styles from '../styles/appHeader.module.css';

interface HeaderTab {
    to: string;
    label: string;
}

interface AppHeaderProps {
    user: AuthUser;
    onLogout: () => void;
    onSwitchToStudent?: () => void;
    tabs?: HeaderTab[];
}

export function AppHeader({
                              user,
                              onLogout,
                              onSwitchToStudent,
                              tabs,
                          }: AppHeaderProps) {
    const { isOpen, toggle, menuRef } = useHeaderProfileMenu();

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                {tabs && tabs.length > 0 ? (
                    <nav className={styles.tabs} aria-label="Admin pages">
                        {tabs.map((tab) => (
                            <NavLink
                                key={tab.to}
                                to={tab.to}
                                className={({ isActive }) =>
                                    [styles.tab, isActive ? styles.tabActive : ''].join(' ')
                                }
                            >
                                {tab.label}
                            </NavLink>
                        ))}
                    </nav>
                ) : (
                    <div />
                )}

                <div className={styles.profileWrap} ref={menuRef}>
                    <button
                        type="button"
                        onClick={toggle}
                        aria-haspopup="menu"
                        aria-expanded={isOpen}
                        className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                    >
                        Profile
                    </button>

                    <HeaderProfileMenu
                        user={user}
                        open={isOpen}
                        onLogout={onLogout}
                        onSwitchToStudent={onSwitchToStudent}
                    />
                </div>
            </div>
        </header>
    );
}
