import type { ReactNode } from 'react';
import type { Elective } from '../types/elective';
import styles from './ElectiveCardBase.module.css';

interface ElectiveCardBaseProps {
    elective: Elective;
    muted?: boolean;
    headerAction?: ReactNode;
    extraInfo?: ReactNode;
    footer?: ReactNode;
    descriptionContent?: ReactNode;

    titleContent?: ReactNode;
    titleMeta?: ReactNode;
    instructorContent?: ReactNode;
    languageContent?: ReactNode;
    prerequisiteContent?: ReactNode;
}

export function ElectiveCardBase({
                                     elective,
                                     muted = false,
                                     headerAction,
                                     extraInfo,
                                     footer,
                                     descriptionContent,
                                     titleContent,
                                     titleMeta,
                                     instructorContent,
                                     languageContent,
                                     prerequisiteContent,
                                 }: ElectiveCardBaseProps) {
    return (
        <article className={[styles.card, muted ? styles.muted : ''].join(' ').trim()}>
            <header className={styles.header}>
                <div className={styles.titleBlock}>
                    <h3 className={styles.title}>{titleContent ?? elective.name}</h3>
                    {titleMeta ? <div className={styles.titleMeta}>{titleMeta}</div> : null}
                </div>
                {headerAction}
            </header>

            <div className={styles.meta}>
                <p className={styles.metaRow}>
                    Instructor: {instructorContent ?? elective.instructor}
                </p>
                <p className={styles.metaRow}>
                    Language: {languageContent ?? elective.electiveLanguage}
                </p>
                <p className={styles.metaRow}>
                    Prerequisite: {prerequisiteContent ?? elective.prerequisite}
                </p>
            </div>

            <div className={styles.description}>
                {descriptionContent ?? <p>{elective.description}</p>}
            </div>

            {extraInfo ? <div className={styles.extraInfo}>{extraInfo}</div> : null}
            {footer ? <div className={styles.footer}>{footer}</div> : null}
        </article>
    );
}
