import styles from './UiAlert.module.css';

interface UiAlertProps {
    message: string;
}

export function UiAlert({ message }: UiAlertProps) {
    return (
        <div className={styles.alert} role="alert">
            {message}
        </div>
    );
}
