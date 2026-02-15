import { createContext, useContext, useMemo, useState } from 'react';
import type { User } from '../types/user.ts';
import { getStoredUser, logout as apiLogout } from '../api/auth.ts';

type AuthContextValue = {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // берём user из localStorage один раз на старте
    const [user, setUser] = useState<User | null>(() => getStoredUser());

    const logout = () => {
        apiLogout();     // чистим localStorage токен/юзера
        setUser(null);   // сбрасываем состояние
    };

    const value = useMemo(() => ({ user, setUser, logout }), [user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
