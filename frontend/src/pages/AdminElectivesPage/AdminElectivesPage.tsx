import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.tsx';
import { useLocale } from '../../app/locale/LocaleContext';
import { Header } from '../../ui/components/Header/Header';
import { ElectiveCard } from '../../ui/components/ElectiveCard/ElectiveCard';

export function AdminElectivesPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { locale, toggleLocale } = useLocale();

    // user гарантирован ProtectedRoute
    const email = user!.email;
    const role = user!.role;

    return (
        <div style={{ background: 'var(--color-main-background)', minHeight: '100vh' }}>
            <Header
                email={email}
                role={role}
                locale={locale}
                onToggleLocale={toggleLocale}
                onLogout={() => navigate('/logout')}
                onSwitchToStudent={() => navigate('/student')}
            />

            {/* остальная страница */}
            <div style={{ padding: 'var(--spacing-xxl)' }}>
                <ElectiveCard
                    role="admin"
                    elective={{
                        id: 'rbt-101',
                        title: 'Intro into Robotics',
                        language: 'Russian',
                        program: 'BS1 DSAI, BS1 CSE',
                        year: 1,
                        description: 'Some description and details\n\n' + 'Long text '.repeat(50),
                    }}
                    onEdit={() => {}}
                    onArchive={() => {}}
                    onDelete={() => {}}
                />
            </div>
        </div>
    );
}
