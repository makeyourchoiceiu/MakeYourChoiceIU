import styles from './LoginForm.module.css';

interface LoginFormProps {
    email: string;
    setEmail: (email: string) => void;
    error: string;
    loading: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

export default function LoginForm({
                                      email,
                                      setEmail,
                                      error,
                                      loading,
                                      onSubmit
                                  }: LoginFormProps) {
    return (
        <form onSubmit={onSubmit} className={styles.container}>
            <h2 className={styles.title}>MakeYourChoice Log In</h2>

            <input
                className={styles.input}
                type="email"
                placeholder="email@innopolis.university"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
            />

            {error && <div className={styles.error}>{error}</div>}

            <button
                type="submit"
                className={styles.continueButton}
                disabled={loading}
            >
                {loading ? 'Signing in...' : 'Log In'}
            </button>
        </form>
    );
}