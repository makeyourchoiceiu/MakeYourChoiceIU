import { Navigate } from 'react-router-dom';
import type { User } from '../types/user';

type Props = {
    user: User | null;
    children: React.ReactNode;
};

export default function ProtectedRoute({ user, children }: Props) {
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
}
