import { useLogin } from '../../hooks/useLogin';
import LoginForm from '../../ui/forms/LoginForm/LoginForm';
import styles from './LoginPage.module.css';
import type { User } from '../../types/user';

interface LoginPageProps {
    onLoginSuccess: (user: User) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
    const { email, setEmail, error, loading, handleLogin } = useLogin(onLoginSuccess);

    return (
        <div className={styles.wrapper}>
            <LoginForm
                email={email}
                setEmail={setEmail}
                error={error}
                loading={loading}
                onSubmit={handleLogin}
            />
        </div>
    );
}