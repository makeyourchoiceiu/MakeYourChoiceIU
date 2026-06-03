import { useEffect, useMemo, useState } from 'react';
import { loginByEmail, mapAuthResponseToUser, mapStudentData } from '../api/auth';
import { mapAdminElectivesToElectives } from '../utils/authElectives';
import { sortAdminElectives } from '../utils/electivesList';
import { mockStudentAuthResponse, MOCK_STUDENT_EMAIL } from '../mocks/studentAuthMock';
import type {
    AuthResponse,
    AuthUser,
    EffectiveMode,
    NormalizedStudentData,
} from '../types/auth';
import type { Elective } from '../types/elective';

const STORAGE_KEY = 'myc-auth-session';

interface StoredSession {
    authResponse: AuthResponse | null;
    effectiveMode: EffectiveMode | null;
}

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
    setAdminElectives: (nextElectives: Elective[]) => void;
    upsertAdminElective: (elective: Elective) => void;
    removeAdminElective: (id: number) => void;
}

function readStoredSession(): StoredSession {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return {
                authResponse: null,
                effectiveMode: null,
            };
        }

        return JSON.parse(raw) as StoredSession;
    } catch {
        return {
            authResponse: null,
            effectiveMode: null,
        };
    }
}

function writeStoredSession(session: StoredSession) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearStoredSession() {
    localStorage.removeItem(STORAGE_KEY);
}

export function useAuth(): UseAuthResult {
    const stored = readStoredSession();

    const [authResponse, setAuthResponse] = useState<AuthResponse | null>(
        stored.authResponse
    );
    const [effectiveMode, setEffectiveMode] = useState<EffectiveMode | null>(
        stored.effectiveMode
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        writeStoredSession({
            authResponse,
            effectiveMode,
        });
    }, [authResponse, effectiveMode]);

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

        return sortAdminElectives(mapAdminElectivesToElectives(authResponse.all_electives));
    }, [authResponse]);

    async function login(email: string) {
        try {
            setLoading(true);
            setError(null);

            if (email.trim().toLowerCase() === MOCK_STUDENT_EMAIL) {
                setAuthResponse(mockStudentAuthResponse);
                setEffectiveMode('student');
                return;
            }

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
        clearStoredSession();
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

    function setAdminElectives(nextElectives: Elective[]) {
        setAuthResponse((prev) => {
            if (!prev || prev.role === 'student') {
                return prev;
            }

            return {
                ...prev,
                all_electives: nextElectives,
            };
        });
    }

    function upsertAdminElective(elective: Elective) {
        setAuthResponse((prev) => {
            if (!prev || prev.role === 'student') {
                return prev;
            }

            const exists = prev.all_electives.some((item) => item.id === elective.id);

            return {
                ...prev,
                all_electives: exists
                    ? prev.all_electives.map((item) =>
                        item.id === elective.id ? elective : item
                    )
                    : [elective, ...prev.all_electives],
            };
        });
    }

    function removeAdminElective(id: number) {
        setAuthResponse((prev) => {
            if (!prev || prev.role === 'student') {
                return prev;
            }

            return {
                ...prev,
                all_electives: prev.all_electives.filter((item) => item.id !== id),
            };
        });
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
        setAdminElectives,
        upsertAdminElective,
        removeAdminElective,
    };
}
