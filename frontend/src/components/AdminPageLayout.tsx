import type { ReactNode } from 'react';
import styles from '../styles/adminPageLayout.module.css';

interface AdminPageLayoutProps {
    sidebar: ReactNode;
    content: ReactNode;
}

/**
 * Layout для admin page:
 * - слева sidebar
 * - справа основной контент
 *
 * По структуре зеркалит StudentPageLayout.
 */
export function AdminPageLayout({
                                    sidebar,
                                    content,
                                }: AdminPageLayoutProps) {
    return (
        <div className={styles.wrap}>
            <div className={styles.sidebar}>{sidebar}</div>
            <div className={styles.content}>{content}</div>
        </div>
    );
}