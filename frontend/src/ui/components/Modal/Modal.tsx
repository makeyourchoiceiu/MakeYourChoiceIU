import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

type ModalProps = {
    open: boolean;
    title?: string;
    onClose: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
};

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
    const dialogRef = useRef<HTMLDivElement | null>(null);

    // ESC + body scroll lock
    useEffect(() => {
        if (!open) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [open, onClose]);

    // focus for accessibility (минимально)
    useEffect(() => {
        if (!open) return;
        dialogRef.current?.focus();
    }, [open]);

    if (!open) return null;

    return createPortal(
        <div className={styles.backdrop} onMouseDown={onClose} role="presentation">
            <div
                className={styles.dialog}
                ref={dialogRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label={title ?? 'Dialog'}
                onMouseDown={(e) => e.stopPropagation()} // чтобы клик внутри не закрывал
            >
                <div className={styles.header}>
                    <div className={styles.title}>{title}</div>
                    <button className={styles.iconButton} onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>

                <div className={styles.body}>{children}</div>

                {footer ? <div className={styles.footer}>{footer}</div> : null}
            </div>
        </div>,
        document.body
    );
}
