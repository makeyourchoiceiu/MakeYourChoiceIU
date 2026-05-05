import type { AuthUser } from '../types/auth';
import { HeaderProfileMenu } from './HeaderProfileMenu';
import { useHeaderProfileMenu } from '../hooks/useHeaderProfileMenu';
import buttonStyles from '../styles/button.module.css';
import styles from '../styles/appHeader.module.css';

interface AppHeaderProps {
    user: AuthUser;
    onLogout: () => void;
    onSwitchToStudent?: () => void;
}

export function AppHeader({
                              user,
                              onLogout,
                              onSwitchToStudent,
                          }: AppHeaderProps) {
    const { isOpen, toggle, menuRef } = useHeaderProfileMenu();

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
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
