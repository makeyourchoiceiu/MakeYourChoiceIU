import { useState } from 'react';
import { ElectiveCard } from '../../ui/components/ElectiveCard/ElectiveCard';

export function StudentElectivesPage() {
    const [fav, setFav] = useState(false);

    return (
        <div style={{ padding: 'var(--spacing-xxl)', background: 'var(--color-main-background)', minHeight: '100vh' }}>
            <div style={{ width: 'min(980px, 100%)', margin: '0 auto', display: 'grid', gap: 'var(--spacing-xl)' }}>
                <h1 className="heading-2">Student Electives</h1>

                <ElectiveCard
                    role="student"
                    elective={{
                        id: 'rbt-101',
                        title: 'Intro into Robotics',
                        language: 'Russian',
                        program: 'English',
                        year: 1,
                        description: 'Some description and details\nSome description and details\n\n' + 'Long text '.repeat(50),
                    }}
                    isFavourite={fav}
                    onToggleFavourite={() => setFav((v) => !v)}
                />
            </div>
        </div>
    );
}
