import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { loginByEmail, clearSession, type AuthSession } from '@/shared/api/auth';

// ------------------------------------------------------------------
// 1. Context type
// ------------------------------------------------------------------

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  toggleMode: () => void;
  isAdminMode: boolean;
  isStudentMode: boolean;
}

// ------------------------------------------------------------------
// 2. Create Context (exported so the hook can use it)
// ------------------------------------------------------------------

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ------------------------------------------------------------------
// 3. Provider Component (the "Component Part")
// ------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validationDone = useRef(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('myc-auth-session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthSession;
        setSession(parsed);
      } catch {
        localStorage.removeItem('myc-auth-session');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (validationDone.current || !session?.user?.email) return;

    const validateSession = async () => {
      try {
        const fresh = await loginByEmail(session.user.email);
        setSession(fresh);
        localStorage.setItem('myc-auth-session', JSON.stringify(fresh));
      } catch {
        localStorage.removeItem('myc-auth-session');
        setSession(null);
      } finally {
        validationDone.current = true;
      }
    };

    void validateSession();
  }, [session?.user?.email]);

  const login = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginByEmail(email);
      setSession(data);
      localStorage.setItem('myc-auth-session', JSON.stringify(data));
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    localStorage.removeItem('myc-auth-session');
    clearSession();
  }, []);

  const toggleMode = useCallback(() => {
    if (!session || session.user.role !== 'admin-student') return;
    const newMode = session.effectiveMode === 'admin' ? 'student' : 'admin';
    const updatedSession: AuthSession = { ...session, effectiveMode: newMode };
    setSession(updatedSession);
    localStorage.setItem('myc-auth-session', JSON.stringify(updatedSession));
  }, [session]);

  const isAdminMode = session?.effectiveMode === 'admin';
  const isStudentMode = session?.effectiveMode === 'student';

  const value: AuthContextValue = {
    session,
    isLoading,
    error,
    login,
    logout,
    toggleMode,
    isAdminMode,
    isStudentMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}