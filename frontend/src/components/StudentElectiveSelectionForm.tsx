import buttonStyles from '../styles/button.module.css';
import styles from './StudentElectiveSelectionForm.module.css';

export interface StudentSelectionOption {
    id: number;
    name: string;
    isFavourite: boolean;
}

interface StudentElectiveSelectionFormProps {
    electiveType: string;
    requiredCount: number;
    selections: Array<number | undefined>;
    options: StudentSelectionOption[];
    saving: boolean;
    onChange: (index: number, electiveId: number | undefined) => void;
    onSave: () => Promise<void> | void;
    onReset: () => void;
}

export function StudentElectiveSelectionForm({
                                                 electiveType,
                                                 requiredCount,
                                                 selections,
                                                 options,
                                                 saving,
                                                 onChange,
                                                 onSave,
                                                 onReset,
                                             }: StudentElectiveSelectionFormProps) {
    const isFilled = selections.length === requiredCount && selections.every(Boolean);
    const isEmpty = selections.every((item) => item === undefined);

    return (
        <section className={styles.formWrap}>
            <div className={styles.header}>
                <p className={styles.title}>Selection ({electiveType})</p>
            </div>

            <form
                className={styles.form}
                onSubmit={(event) => {
                    event.preventDefault();
                    onSave();
                }}
            >
                <div className={styles.fields}>
                    {Array.from({ length: requiredCount }, (_, index) => {
                        const currentValue = selections[index];
                        const chosenOther = selections.filter(
                            (value, valueIndex) =>
                                valueIndex !== index && typeof value === 'number'
                        ) as number[];

                        const availableOptions = options.filter(
                            (item) =>
                                item.id === currentValue || !chosenOther.includes(item.id)
                        );

                        return (
                            <label key={`${electiveType}-priority-${index}`} className={styles.field}>
                                <span className={styles.label}>Priority {index + 1}</span>
                                <select
                                    className={styles.select}
                                    value={currentValue ?? ''}
                                    onChange={(event) =>
                                        onChange(
                                            index,
                                            event.target.value ? Number(event.target.value) : undefined
                                        )
                                    }
                                    disabled={saving}
                                >
                                    <option value="">Select elective</option>
                                    {availableOptions.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.isFavourite ? `★ ${item.name}` : item.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        );
                    })}
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={onReset}
                        disabled={saving || isEmpty}
                        className={`${buttonStyles.button} ${buttonStyles.sizeSm} ${buttonStyles.variantGhost}`}
                    >
                        Reset
                    </button>

                    <button
                        type="submit"
                        disabled={saving || !isFilled}
                        className={`${buttonStyles.button} ${buttonStyles.sizeSm} ${buttonStyles.variantSecondary}`}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </section>
    );
}
