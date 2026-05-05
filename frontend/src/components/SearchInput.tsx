import styles from './SearchInput.module.css';

interface SearchInputProps {
    id?: string;
    label: string;
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
}

export function SearchInput({ id = 'search-input', label, value, placeholder, onChange }: SearchInputProps) {
    return (
        <div className={styles.field}>
            <label htmlFor={id} className={styles.label}>{label}</label>
            <input
                id={id}
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className={styles.input}
            />
        </div>
    );
}
