import { ElectiveCard } from '../../ui/components/ElectiveCard/ElectiveCard';

export function AdminElectivesPage() {
    return (
        <div style={{ padding: 'var(--spacing-xxl)', background: 'var(--color-main-background)', minHeight: '100vh' }}>
            <div style={{ width: 'min(980px, 100%)', margin: '0 auto', display: 'grid', gap: 'var(--spacing-xl)' }}>
                <h1 className="heading-2">Admin Electives</h1>

                <ElectiveCard
                    role="admin"
                    elective={{
                        id: 'rbt-101',
                        title: 'Intro into Robotics',
                        language: 'Russian',
                        program: 'BS1 DSAI, BS1 CSE',
                        year: 1,
                        description: 'Some description and details\nSome description and details\n\n' + 'Long text '.repeat(50),
                    }}
                    onEdit={(id) => console.log('edit', id)}
                    onArchive={(id) => console.log('archive', id)}
                    onDelete={(id) => console.log('delete', id)}
                />
            </div>
        </div>
    );
}
