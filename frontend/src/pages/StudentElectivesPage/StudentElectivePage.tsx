import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.tsx';
import { useLocale } from '../../app/locale/LocaleContext';
import { Header } from '../../ui/components/Header/Header';
import { ElectiveCard } from '../../ui/components/ElectiveCard/ElectiveCard';
import VotingForm from '../../ui/forms/VotingForm/VotingForm.tsx'
import { useVotingForm } from '../../hooks/useVotingForm.ts'
import { useState } from 'react';

// пока что заглушка для примеров
const MOCK_ELECTIVES = [
    { id: 1, name: 'Machine Learning' },
    { id: 2, name: 'Web Development' },
    { id: 3, name: 'Mobile Development' },
    { id: 4, name: 'Algorithms' },
    { id: 5, name: 'Database Systems' },
    { id: 6, name: 'Computer Networks' },
    { id: 7, name: 'Cybersecurity' },
    { id: 8, name: 'Cloud Computing' },
];

export function StudentElectivesPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { locale, toggleLocale } = useLocale();
    const [fav, setFav] = useState(false);
    const { handleSubmit, handleClear } = useVotingForm();

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

            <div style={{ background: 'var(--color-main-background)',
                minHeight: '100vh',
                width: '75vw',
                transition: 'width 0.3s ease',
                padding: 'var(--spacing-xxl)' }}>
                <ElectiveCard
                    role="student"
                    locale={locale}
                    elective={{
                        id: 'rbt-101',
                        title: 'Intro into Robotics',
                        teacher: 'Ivan Petrov',
                        language: 'Russian',
                        program: 'English',
                        year: 1,
                        description: 'Some description and details\n\n' + 'Long text '.repeat(50),
                    }}
                    isFavourite={fav}
                    onToggleFavourite={() => setFav((v) => !v)}
                />
            </div>

            <div style={{ marginTop: 'var(--spacing-xxl)' }}>
                <VotingForm
                    electives={MOCK_ELECTIVES}
                    requiredCount={5}
                    onSubmit={handleSubmit}
                    onClear={handleClear}
                    locale={locale}
                />
            </div>
        </div>
    );
}
