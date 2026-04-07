import { useState } from 'react';
import { useElectives } from './hooks/useElectives';
import { StudentElectivesPage } from './pages/StudentElectivesPage';
import { AdminElectivesPage } from './pages/AdminElectivesPage';
import { AppShell } from './components/AppShell';
import { archiveElective, deleteElective, updateElective } from './api/electives';
import type { Elective } from './types/elective';
import type { StudentProfileElectiveType } from './types/studentSidebar';
import type { AuthUser } from './types/auth';
import buttonStyles from './styles/button.module.css';

const MOCK_STUDENT_ELECTIVE_TYPES: StudentProfileElectiveType[] = [
    { type: 'TECH', label: 'Tech', requiredCount: 2 },
    { type: 'HUM', label: 'Hum', requiredCount: 1 },
];

const MOCK_USER: AuthUser = {
    email: 'student.admin@university.edu',
    group: 'BS1-ENG-MFAI',
    role: 'admin-student',
};

function App() {
    const { electives, loading, error, refetch } = useElectives();

    const [mode, setMode] = useState<'student' | 'admin'>('student');
    const [query, setQuery] = useState('');
    const [favouriteIds, setFavouriteIds] = useState<number[]>([]);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    function handleToggleFavourite(elective: Elective) {
        setFavouriteIds((prev) => {
            const exists = prev.includes(elective.id);
            return exists ? prev.filter((id) => id !== elective.id) : [...prev, elective.id];
        });
    }

    function handleLogout() {
        console.log('logout');
    }

    function handleSwitchToStudent() {
        setMode('student');
    }

    async function handleArchive(elective: Elective) {
        try {
            setActionError(null);
            setActionLoadingId(elective.id);
            await archiveElective(elective.id);
            await refetch();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Failed to archive elective');
        } finally {
            setActionLoadingId(null);
        }
    }

    async function handleDelete(elective: Elective) {
        const confirmed = window.confirm(
            `Delete elective "${elective.name}"? This action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionError(null);
            setActionLoadingId(elective.id);
            await deleteElective(elective.id);
            await refetch();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Failed to delete elective');
        } finally {
            setActionLoadingId(null);
        }
    }
    function handleAddElective() {
        console.log('open add elective flow');
    }

    async function handleEdit(elective: Elective) {
        const nextName = window.prompt('Edit elective name', elective.name);
        if (nextName === null) return;

        const nextInstructor = window.prompt('Edit instructor', elective.instructor);
        if (nextInstructor === null) return;

        const nextDescription = window.prompt('Edit description', elective.description);
        if (nextDescription === null) return;

        try {
            setActionError(null);
            setActionLoadingId(elective.id);

            await updateElective(elective.id, {
                name: nextName,
                instructor: nextInstructor,
                description: nextDescription,
            });

            await refetch();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Failed to update elective');
        } finally {
            setActionLoadingId(null);
        }
    }

    if (loading) {
        return <div>Loading electives...</div>;
    }

    if (error) {
        return (
            <main>
                <h1>Electives test</h1>
                <p>Failed to load electives: {error}</p>
                <button type="button" onClick={refetch}>
                    Retry
                </button>
            </main>
        );
    }

    return (
        <AppShell
            user={MOCK_USER}
            searchValue={query}
            onSearchChange={setQuery}
            onLogout={handleLogout}
            onSwitchToStudent={MOCK_USER.role === 'admin-student' ? handleSwitchToStudent : undefined}
        >
            <div>
                <button
                    type="button"
                    onClick={() => setMode('student')}
                    aria-pressed={mode === 'student'}
                    className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${
                        mode === 'student' ? buttonStyles.variantPrimary : buttonStyles.variantGhost
                    }`}
                >
                    Student mode
                </button>

                <button
                    type="button"
                    onClick={() => setMode('admin')}
                    aria-pressed={mode === 'admin'}
                    className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${
                        mode === 'admin' ? buttonStyles.variantPrimary : buttonStyles.variantGhost
                    }`}
                >
                    Admin mode
                </button>
            </div>

            {actionError ? <p>Action failed: {actionError}</p> : null}
            {actionLoadingId !== null ? <p>Processing elective id: {actionLoadingId}</p> : null}

            {mode === 'student' ? (
                <StudentElectivesPage
                    electives={electives}
                    locale="en"
                    favouriteIds={favouriteIds}
                    availableElectiveTypes={MOCK_STUDENT_ELECTIVE_TYPES}
                    query={query}
                    onToggleFavourite={handleToggleFavourite}
                />
            ) : (
                <AdminElectivesPage
                    electives={electives}
                    locale="en"
                    query={query}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                    onAddElective={handleAddElective}
                />
            )}
        </AppShell>
    );
}

export default App;