import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage/LoginPage.tsx';
import { getStoredUser, logout } from './api/auth';
import type { User } from './types/user';

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = getStoredUser();
        if (storedUser) {
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    const handleLoginSuccess = (userData: User) => {
        console.log('Login success:', userData);
        setUser(userData);
    };

    const handleLogout = () => {
        logout();
        setUser(null);
    };

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--color-main-background)'
            }}>
                <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div>
            {user ? (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--color-main-background)',
                    padding: 'var(--spacing-lg)'
                }}>
                    <div className="card" style={{
                        maxWidth: '480px',
                        width: '100%',
                        textAlign: 'center',
                        padding: 'var(--spacing-xxl)'
                    }}>
                        <h2 className="heading-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
                            ✅ Успешный вход!
                        </h2>

                        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                            <p className="heading-3" style={{ marginBottom: 'var(--spacing-md)' }}>
                                Привет, <strong>{user.name}</strong>!
                            </p>
                            <p className="text-muted" style={{ marginBottom: 'var(--spacing-sm)' }}>
                                Email: {user.email}
                            </p>
                            <div style={{
                                display: 'inline-block',
                                padding: 'var(--spacing-xs) var(--spacing-md)',
                                backgroundColor: 'var(--color-input-field)',
                                borderRadius: 'var(--border-radius-xl)',
                                fontSize: 'var(--font-size-sm)',
                                marginTop: 'var(--spacing-sm)'
                            }}>
                                {user.role === 'admin' ? '👨‍💼 Администратор' : '👨‍🎓 Студент'}
                            </div>
                            {user.program && (
                                <p className="text-muted" style={{ marginTop: 'var(--spacing-lg)' }}>
                                    {user.program} • {user.year} • {user.language}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="button button--danger button--lg"
                            style={{ minWidth: '200px' }}
                        >
                            Выйти
                        </button>
                    </div>
                </div>
            ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
            )}
        </div>
    );
}

export default App;