import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Locale = 'en' | 'ru';
const STORAGE_KEY = 'ui_locale';

type LocaleContextValue = {
    locale: Locale;
    toggleLocale: () => void;
    setLocale: (l: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function getInitialLocale(): Locale {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'ru' ? 'ru' : 'en';
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocale] = useState<Locale>(() => getInitialLocale());

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, locale);
    }, [locale]);

    const toggleLocale = () => setLocale((l) => (l === 'en' ? 'ru' : 'en'));

    const value = useMemo(() => ({ locale, setLocale, toggleLocale }), [locale]);

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
    const ctx = useContext(LocaleContext);
    if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
    return ctx;
}
