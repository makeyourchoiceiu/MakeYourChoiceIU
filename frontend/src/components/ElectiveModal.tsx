import type { ReactNode, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import styles from './ElectiveModal.module.css';
import buttonStyles from '../styles/button.module.css';
interface ElectiveModalProps {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
}

export function ElectiveModal({
                                  open,
                                  title,
                                  onClose,
                                  children,
                                  footer,
                              }: ElectiveModalProps) {
    if (!open) {
        return null;
    }

    function handleOverlayClick() {
        onClose();
    }

    function handleModalClick(event: MouseEvent<HTMLDivElement>) {
        event.stopPropagation();
    }

    return createPortal(
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="elective-modal-title"
            onClick={handleOverlayClick}
        >
            <div className={styles.modal} onClick={handleModalClick}>
                <div className={styles.header}>
                    <h2 id="elective-modal-title" className={styles.title}>
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.iconOnly}`}
                    >
                        ×
                    </button>
                </div>

                <div className={styles.body}>{children}</div>

            {footer ? <div className={styles.footer}>{footer}</div> : null}
            </div>
        </div>,
        document.body
    );
}
