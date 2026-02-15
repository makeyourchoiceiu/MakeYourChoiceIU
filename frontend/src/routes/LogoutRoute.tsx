import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext.tsx';

export function LogoutRoute() {
    const { logout } = useAuth();

    useEffect(() => {
        logout();
    }, [logout]);

    return <Navigate to="/login" replace />;
}
