import type { ReactNode } from 'react';
import type { AuthUser } from '../types/auth';
import { AppHeader } from './AppHeader';
import styles from '../styles/appShell.module.css';

interface AppShellProps {
    user: AuthUser;
    onLogout: () => void;
    onSwitchToStudent?: () => void;
    children: ReactNode;
}

export function AppShell({
                             user,
                             onLogout,
                             onSwitchToStudent,
                             children,
                         }: AppShellProps) {
    return (
        <div className={styles.shell}>
            <AppHeader
                user={user}
                onLogout={onLogout}
                onSwitchToStudent={onSwitchToStudent}
            />

            <main className={styles.content}>{children}</main>
        </div>
    );
}
