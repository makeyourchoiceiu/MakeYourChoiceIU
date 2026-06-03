import type { ReactNode } from 'react';
import styles from './StudentPageLayout.module.css';

interface StudentPageLayoutProps {
    sidebar: ReactNode;
    content: ReactNode;
}

export function StudentPageLayout({
                                      sidebar,
                                      content,
                                  }: StudentPageLayoutProps) {
    return (
        <div className={styles.wrap}>
            <div className={styles.sidebar}>{sidebar}</div>
            <div className={styles.content}>{content}</div>
        </div>
    );
}