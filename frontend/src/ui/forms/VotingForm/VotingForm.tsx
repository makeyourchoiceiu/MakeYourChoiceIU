import { useState, useEffect } from 'react';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import styles from './VotingForm.module.css';

export interface ElectiveOption {
    id: number;
    name: string;
}

export interface VotingFormProps {
    electives: ElectiveOption[];
    requiredCount: number;
    onSubmit: (selectedIds: number[]) => void;
    onClear?: () => void;
    isSubmitting?: boolean;
    className?: string;
    locale: 'en' | 'ru';
    storageKey?: string;
}

const TEXT = {
    en: {
        noElectives: 'No electives available',
        priority: 'Priority',
        selectElective: 'Select elective',
        clearAll: 'Clear All',
        submit: 'Submit',
    },
    ru: {
        noElectives: 'Нет доступных элективов',
        priority: 'Приоритет',
        selectElective: 'Выберите электив',
        clearAll: 'Очистить',
        submit: 'Отправить',
    },
} as const;

const DEFAULT_STORAGE_KEY = 'voting_form_selections';

export default function VotingForm({
                                       electives,
                                       requiredCount,
                                       onSubmit,
                                       onClear,
                                       isSubmitting = false,
                                       className = '',
                                       locale,
                                       storageKey = DEFAULT_STORAGE_KEY
                                   }: VotingFormProps) {

    const [selectedIds, setSelectedIds] = useLocalStorage<(number | undefined)[]>(
        storageKey,
        Array(requiredCount).fill(undefined)
    );

    const [isInitialized, setIsInitialized] = useState(false);
    const t = TEXT[locale];

    // Синхронизация с requiredCount
    useEffect(() => {
        if (selectedIds.length !== requiredCount) {
            // Если количество приоритетов изменилось, сбрасываем
            setSelectedIds(Array(requiredCount).fill(undefined));
        }
        setIsInitialized(true);
    }, [requiredCount, selectedIds.length, setSelectedIds]);

    // Валидация выбранных ID (удаляем несуществующие элективы)
    useEffect(() => {
        if (!isInitialized || !electives.length) return;

        const existingIds = new Set(electives.map(e => e.id));
        const hasInvalidSelections = selectedIds.some(id =>
            id !== undefined && !existingIds.has(id)
        );

        if (hasInvalidSelections) {
            const validSelections = selectedIds.map(id =>
                id !== undefined && existingIds.has(id) ? id : undefined
            );
            setSelectedIds(validSelections);
        }
    }, [electives, isInitialized, selectedIds, setSelectedIds]);

    const handleSelect = (position: number, electiveId: number) => {
        const newSelected = [...selectedIds];
        newSelected[position] = electiveId;
        setSelectedIds(newSelected);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validIds = selectedIds.filter((id): id is number => id !== undefined);
        onSubmit(validIds);
    };

    const handleClear = () => {
        setSelectedIds(Array(requiredCount).fill(undefined));
        localStorage.removeItem(storageKey);
        onClear?.();
    };

    const isFilled = selectedIds.every(id => id !== undefined);

    if (!electives.length) {
        return (
            <div className={`${styles.wrapper} ${className}`}>
                <div className={styles.container}>
                    <p className={styles.noCoursesMessage}>
                        {t.noElectives}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.wrapper} ${className}`}>
            <div className={styles.container}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.fieldsColumn}>
                        {Array.from({ length: requiredCount }, (_, i) => {
                            const selectedOthers = selectedIds.filter((_, index) => index !== i);
                            const availableElectives = electives.filter(elective =>
                                !selectedOthers.includes(elective.id)
                            );

                            return (
                                <div key={i} className={styles.field}>
                                    <label htmlFor={`elective-${i}`}>
                                        {t.priority} {i + 1}
                                    </label>
                                    <select
                                        id={`elective-${i}`}
                                        className={styles.select}
                                        value={selectedIds[i] || ''}
                                        onChange={(e) => handleSelect(i, Number(e.target.value))}
                                        disabled={isSubmitting}
                                    >
                                        <option value="" disabled>
                                            {t.selectElective}
                                        </option>
                                        {availableElectives.map((elective) => (
                                            <option
                                                key={elective.id}
                                                value={elective.id}
                                            >
                                                {elective.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            );
                        })}
                    </div>

                    <div className={styles.buttonsRow}>
                        <button
                            type="button"
                            onClick={handleClear}
                            className={styles.clearButton}
                            disabled={isSubmitting || selectedIds.every(id => id === undefined)}
                        >
                            {t.clearAll}
                        </button>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={!isFilled || isSubmitting}
                        >
                            {t.submit}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}