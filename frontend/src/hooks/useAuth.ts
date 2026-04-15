import { useMemo, useState } from 'react';
import { loginByEmail, mapAuthResponseToUser, mapStudentData } from '../api/auth';
import type { AuthResponse, AuthUser, NormalizedStudentData, UserRole } from '../types/auth';
import type { Elective } from '../types/elective';

type EffectiveMode = 'student' | 'admin';

interface UseAuthResult {
    authResponse: AuthResponse | null;
    user: AuthUser | null;
    studentData: NormalizedStudentData | null;
    adminElectives: Elective[];
    effectiveMode: EffectiveMode | null;
    loading: boolean;
    error: string | null;
    login: (email: string) => Promise<void>;
    logout: () => void;
    switchToStudent: () => void;
    switchToAdmin: () => void;
}

export function useAuth(): UseAuthResult {
    const [authResponse, setAuthResponse] = useState<AuthResponse | null>(null);
    const [effectiveMode, setEffectiveMode] = useState<EffectiveMode | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const user = useMemo(() => {
        return authResponse ? mapAuthResponseToUser(authResponse) : null;
    }, [authResponse]);

    const studentData = useMemo(() => {
        return authResponse ? mapStudentData(authResponse) : null;
    }, [authResponse]);

    const adminElectives = useMemo(() => {
        if (!authResponse) {
            return [];
        }

        if (authResponse.role === 'student') {
            return [];
        }

        return authResponse.all_electives;
    }, [authResponse]);

    async function login(email: string) {
        try {
            setLoading(true);
            setError(null);

            const response = await loginByEmail(email);
            setAuthResponse(response);

            if (response.role === 'student') {
                setEffectiveMode('student');
            } else {
                setEffectiveMode('admin');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
            setAuthResponse(null);
            setEffectiveMode(null);
        } finally {
            setLoading(false);
        }
    }

    function logout() {
        setAuthResponse(null);
        setEffectiveMode(null);
        setError(null);
    }

    function switchToStudent() {
        if (!authResponse) {
            return;
        }

        if (authResponse.role === 'admin-student') {
            setEffectiveMode('student');
        }
    }

    function switchToAdmin() {
        if (!authResponse) {
            return;
        }

        if (authResponse.role === 'admin' || authResponse.role === 'admin-student') {
            setEffectiveMode('admin');
        }
    }

    return {
        authResponse,
        user,
        studentData,
        adminElectives,
        effectiveMode,
        loading,
        error,
        login,
        logout,
        switchToStudent,
        switchToAdmin,
    };
}