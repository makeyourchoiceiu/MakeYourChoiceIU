import { useState, useEffect } from 'react';
import { login, saveAuth, getStoredEmail } from '../api/auth';
import type { User } from '../types/user';

export const useLogin = (onLoginSuccess: (user: User) => void) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedEmail = getStoredEmail();
        if (savedEmail) {
            setEmail(savedEmail);
        }
    }, []);

    const isInnopolisEmail = (email: string): boolean => {
        return email.endsWith('@innopolis.university');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email.trim()) {
            setError('Email is required');
            setLoading(false);
            return;
        }

        if (!isInnopolisEmail(email)) {
            setError('Email must be from innopolis.university');
            setLoading(false);
            return;
        }

        try {
            const { token, user } = await login({ email });
            // Сохраняем email для следующего раза
            saveAuth(token, user, email);
            onLoginSuccess(user);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return {
        email,
        setEmail,
        error,
        loading,
        handleLogin
    };
};