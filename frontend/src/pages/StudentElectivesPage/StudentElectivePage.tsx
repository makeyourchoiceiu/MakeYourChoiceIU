import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.tsx';
import { useLocale } from '../../app/locale/LocaleContext';
import { Header } from '../../ui/components/Header/Header';
import { ElectiveCard } from '../../ui/components/ElectiveCard/ElectiveCard';
import { useState } from 'react';

export function StudentElectivesPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { locale, toggleLocale } = useLocale();
    const [fav, setFav] = useState(false);

    return (
        <div style={{ background: 'var(--color-main-background)', minHeight: '100vh' }}>
            <Header
                email={user!.email}
                role={user!.role}
                deadlineText={locale === 'en' ? 'Deadline: 2d 14h' : 'Дедлайн: 2д 14ч'}
                locale={locale}
                onToggleLocale={toggleLocale}
                onLogout={() => navigate('/logout')}
            />

            <div style={{ padding: 'var(--spacing-xxl)' }}>
                <ElectiveCard
                    role="student"
                    elective={{
                        id: 'rbt-101',
                        title: 'Intro into Robotics',
                        language: 'Russian',
                        program: 'English',
                        year: 1,
                        description: 'Some description and details\n\n' + 'Long text '.repeat(50),
                    }}
                    isFavourite={fav}
                    onToggleFavourite={() => setFav((v) => !v)}
                />
            </div>
        </div>
    );
}
