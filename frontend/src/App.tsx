import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { useAuth } from './hooks/useAuth';
import { StudentElectivesPage } from './pages/StudentElectivesPage';
import { AdminElectivesPage } from './pages/AdminElectivesPage';
import { AdminProgramSettingsPage } from './pages/AdminProgramSettingsPage';
import { AdminExceptionsPage } from './pages/AdminExceptionsPage';
import { AdminSemesterManagementPage } from './pages/AdminSemesterManagementPage';
import { AppShell } from './components/AppShell';
import { UiAlert } from './components/UiAlert';
import { useAdminElectivesFlow } from './hooks/useAdminElectivesFlow';
import { useStudentElectivesFlow } from './hooks/useStudentElectivesFlow';
import { toUserFacingError } from './utils/userFacingError';

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
    const adminTabs = isAdminMode
        ? [
            { to: '/admin/electives', label: 'Electives' },
            { to: '/admin/program-settings', label: 'Program settings' },
            { to: '/admin/exceptions', label: 'Exceptions' },
            { to: '/admin/semester-management', label: 'Semester management' },
        ]
        : undefined;

    return (
        <AppShell
            user={auth.user}
            onLogout={handleLogout}
            onSwitchToStudent={auth.user.role === 'admin-student' ? auth.switchToStudent : undefined}
            tabs={adminTabs}
        >
            {adminFlow.actionError ? <UiAlert message={toUserFacingError(adminFlow.actionError, 'Action failed')} /> : null}
            {adminFlow.actionLoadingId !== null ? (
                <p>Processing elective id: {adminFlow.actionLoadingId}</p>
            ) : null}

            {isStudentMode ? (
                <StudentElectivesPage
                    electives={studentFlow.studentElectives}
                    locale="en"
                    favouriteIds={studentFlow.favouriteIds}
                    availableElectiveTypes={auth.studentData?.availableElectiveTypes ?? []}
                    chosenByType={studentFlow.chosenByType}
                    getSelections={studentFlow.getSelections}
                    setSelection={studentFlow.setSelection}
                    resetSelections={studentFlow.resetSelections}
                    submitSelections={studentFlow.submitSelections}
                    savingType={studentFlow.savingType}
                    saveError={studentFlow.saveError}
                    query={query}
                    onQueryChange={setQuery}
                    onToggleFavourite={studentFlow.handleToggleFavourite}
                />
            ) : null}

            {isAdminMode ? (
                <Routes>
                    <Route path="/" element={<Navigate to="/admin/electives" replace />} />
                    <Route
                        path="/admin/electives"
                        element={
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
                        }
                    />
                    <Route path="/admin/program-settings" element={<AdminProgramSettingsPage />} />
                    <Route path="/admin/exceptions" element={<AdminExceptionsPage />} />
                    <Route path="/admin/semester-management" element={<AdminSemesterManagementPage />} />
                    <Route path="*" element={<Navigate to="/admin/electives" replace />} />
                </Routes>
            ) : null}
        </AppShell>
    );
}

export default App;
