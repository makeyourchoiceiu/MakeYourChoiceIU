import { useState } from 'react';
import { LoginPage } from './pages/LoginPage';
import { useAuth } from './hooks/useAuth';
import { StudentElectivesPage } from './pages/StudentElectivesPage';
import { AdminElectivesPage } from './pages/AdminElectivesPage';
import { AppShell } from './components/AppShell';
import { useAdminElectivesFlow } from './hooks/useAdminElectivesFlow';
import { useStudentElectivesFlow } from './hooks/useStudentElectivesFlow';

function App() {
    const auth = useAuth();
    const [query, setQuery] = useState('');
    const studentFlow = useStudentElectivesFlow({
        authResponse: auth.authResponse,
    });
    const adminFlow = useAdminElectivesFlow({
        canManageElectives: auth.authResponse?.role === 'admin' || auth.authResponse?.role === 'admin-student',
        setAdminElectives: auth.setAdminElectives,
    });

    function handleLogout() {
        auth.logout();
        setQuery('');
        studentFlow.resetStudentState();
        adminFlow.resetActionState();
    }

    if (!auth.authResponse || !auth.user || !auth.effectiveMode) {
        return (
            <LoginPage
                loading={auth.loading}
                error={auth.error}
                onSubmit={auth.login}
            />
        );
    }

    const isAdminMode = auth.effectiveMode === 'admin';
    const isStudentMode = auth.effectiveMode === 'student';

    return (
        <AppShell
            user={auth.user}
            onLogout={handleLogout}
            onSwitchToStudent={auth.user.role === 'admin-student' ? auth.switchToStudent : undefined}
        >
            {adminFlow.actionError ? <p>Action failed: {adminFlow.actionError}</p> : null}
            {adminFlow.actionLoadingId !== null ? (
                <p>Processing elective id: {adminFlow.actionLoadingId}</p>
            ) : null}

            {isStudentMode ? (
                <StudentElectivesPage
                    electives={studentFlow.studentElectives}
                    locale="en"
                    favouriteIds={studentFlow.favouriteIds}
                    availableElectiveTypes={auth.studentData?.availableElectiveTypes ?? []}
                    query={query}
                    onQueryChange={setQuery}
                    onToggleFavourite={studentFlow.handleToggleFavourite}
                />
            ) : null}

            {isAdminMode ? (
                <AdminElectivesPage
                    electives={auth.adminElectives}
                    locale="en"
                    query={query}
                    onQueryChange={setQuery}
                    onCreateElective={adminFlow.handleCreateElective}
                    onUpdateElective={adminFlow.handleUpdateElective}
                    onArchive={adminFlow.handleArchiveElective}
                    onDelete={adminFlow.handleDeleteElective}
                    onRestore={adminFlow.handleRestoreElective}
                />
            ) : null}
        </AppShell>
    );
}

export default App;
