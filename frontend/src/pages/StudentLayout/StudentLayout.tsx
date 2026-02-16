import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Header } from '../../ui/components/Header/Header';
import { SidebarMenu } from '../../ui/components/SidebarMenu/SidebarMenu';
import { useAuth } from '../../app/AuthContext';
import { useLocale } from '../../app/locale/LocaleContext';
import { useElectiveTypesTabs } from '../../hooks/useElectiveTypesTabs';
import styles from './StudentLayout.module.css';

export function StudentLayout() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { locale, toggleLocale } = useLocale();

    if (!user) return <Navigate to="/login" replace />;

    // позже: groupId = user.groupId / user.programId
    const groupId = 'mock-group';

    const { tabs, loading } = useElectiveTypesTabs(groupId, locale);

    return (
        <div className={styles.page}>
            <Header
                email={user.email}
                role={user.role}
                deadlineText={locale === 'en' ? 'Deadline: 2d 14h' : 'Дедлайн: 2д 14ч'}
                locale={locale}
                onToggleLocale={toggleLocale}
                onLogout={() => navigate('/logout')}
            />

            <SidebarMenu basePath="/student" tabs={tabs} />


            <main className={styles.content}>
                <Outlet />
            </main>
        </div>
    );
}
