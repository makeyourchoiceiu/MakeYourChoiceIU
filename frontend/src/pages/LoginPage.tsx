import { useState } from 'react';
import buttonStyles from '../styles/button.module.css';
import styles from '../styles/loginPage.module.css';
import { MOCK_STUDENT_EMAIL } from '../mocks/studentAuthMock';

interface LoginPageProps {
    loading: boolean;
    error: string | null;
    onSubmit: (email: string) => Promise<void>;
}

export function LoginPage({
                              loading,
                              error,
                              onSubmit,
                          }: LoginPageProps) {
    const [email, setEmail] = useState('');

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            return;
        }

        await onSubmit(trimmedEmail);
    }

    return (
        <main className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>Log in</h1>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <label className={styles.field}>
                        <span>Email</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="name@innopolis.university"
                        />
                    </label>

                    {error ? <p className={styles.error}>{error}</p> : null}

                    <button
                        type="submit"
                        disabled={!email.trim() || loading}
                        className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantPrimary} ${styles.submitButton}`}
                    >
                        {loading ? 'Loading...' : 'Log in'}
                    </button>
                </form>

                <p className={styles.hint}>
                    Student UI mock: <code>{MOCK_STUDENT_EMAIL}</code>
                </p>
            </div>
        </main>
    );
}
