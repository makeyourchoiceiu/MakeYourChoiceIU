import type { AuthUser } from '../types/auth';
import buttonStyles from '../styles/button.module.css';
import styles from '../styles/headerProfileMenu.module.css';

interface HeaderProfileMenuProps {
    user: AuthUser;
    open: boolean;
    onLogout: () => void;
    onSwitchToStudent?: () => void;
}

export function HeaderProfileMenu({
                                      user,
                                      open,
                                      onLogout,
                                      onSwitchToStudent,
                                  }: HeaderProfileMenuProps) {
    if (!open) {
        return null;
    }

    const canSwitchToStudent = user.role === 'admin-student';

    return (
        <div className={styles.menu} role="menu">
            <div className={styles.infoBlock}>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Email:</span>
                    <span>{user.email}</span>
                </div>

                <div className={styles.infoRow}>
                    <span className={styles.label}>Group:</span>
                    <span>{user.group}</span>
                </div>
            </div>

            <div className={styles.actions}>
                {canSwitchToStudent ? (
                    <button
                        type="button"
                        onClick={onSwitchToStudent}
                        className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                    >
                        Switch to student
                    </button>
                ) : null}

                <button
                    type="button"
                    onClick={onLogout}
                    className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}