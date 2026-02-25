import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage/LoginPage.tsx';
import { AdminElectivesPage } from './pages/AdminElectivesPage/AdminElectivesPage.tsx';

import ProtectedRoute from './routes/ProtectedRoute';
import { LogoutRoute } from './routes/LogoutRoute';

import type { User } from './types/user';
import { AuthProvider, useAuth } from './app/AuthContext.tsx';
import { LocaleProvider } from './app/locale/LocaleContext';

import { StudentLayout } from './pages/StudentLayout/StudentLayout';
import { StudentElectivesByTypePage } from './pages/StudentElectivesByTypePage/StudentElectivesByTypePage';


function getDefaultPath(user: User) {
    // combined пока ведём как admin (можно сделать отдельный выбор)
    if (user.role === 'admin' ) return '/admin';
    return '/student';
}

/**
 * Вынесли провайдеры в App, чтобы state был доступен во всех страницах.
 */
export default function App() {
    return (
        <AuthProvider>
            <LocaleProvider>
                <AppRoutes />
            </LocaleProvider>
        </AuthProvider>
    );
}

function AppRoutes() {
    const { user, setUser } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    user ? (
                        <Navigate to={getDefaultPath(user)} replace />
                    ) : (
                        <LoginPage onLoginSuccess={setUser} />
                    )
                }
            />

            <Route
                path="/student"
                element={
                    <ProtectedRoute user={user}>
                        <StudentLayout />
                    </ProtectedRoute>
                }
            >
                {/* куда попадать при /student */}
                <Route index element={<Navigate to="electives/tech" replace />} />
                {/* если хочешь главную: <Route index element={<Navigate to="main" replace />} /> */}
                {/* <Route path="main" element={<StudentMainPage />} /> */}

                {/* динамическая страница по типу */}
                <Route path="electives/:type" element={<StudentElectivesByTypePage />} />
            </Route>

            <Route
                path="/admin"
                element={
                    <ProtectedRoute user={user}>
                        <AdminElectivesPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/logout"
                element={
                    <ProtectedRoute user={user}>
                        <LogoutRoute />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/"
                element={
                    user ? <Navigate to={getDefaultPath(user)} replace /> : <Navigate to="/login" replace />
                }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
