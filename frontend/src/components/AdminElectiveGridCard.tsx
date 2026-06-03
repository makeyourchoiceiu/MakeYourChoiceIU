import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Elective } from '../types/elective';
import { ElectiveModal } from './ElectiveModal';
import { AdminElectiveActionsMenu } from './AdminElectiveActionsMenu';
import { useDisclosure } from '../hooks/useDisclosure';
import { useElectiveSearch } from '../hooks/useElectiveSearch';
import { ELECTIVE_TEXT, type Locale } from '../utils/electiveText';
import { highlight } from '../utils/electiveSearch';
import { getAdminElectiveStatusPresentation } from '../utils/adminElectiveStatus';
import buttonStyles from '../styles/button.module.css';
import styles from './AdminElectiveGridCard.module.css';
import markdownStyles from './ElectiveCardMarkdown.module.css';

const MarkdownRenderer = ReactMarkdown as unknown as React.ComponentType<{
    children: string;
}>;

interface AdminElectiveGridCardProps {
    elective: Elective;
    locale: Locale;
    query?: string;
    onEdit?: (elective: Elective) => void;
    onArchive?: (elective: Elective) => void;
    onDelete?: (elective: Elective) => void;
    onRestore?: (elective: Elective) => void;
}

export function AdminElectiveGridCard({
                                          elective,
                                          locale,
                                          query = '',
                                          onEdit,
                                          onArchive,
                                          onDelete,
                                          onRestore,
                                      }: AdminElectiveGridCardProps) {
    const { isOpen, open, close } = useDisclosure(false);
    const text = ELECTIVE_TEXT[locale];
    const statusPresentation = getAdminElectiveStatusPresentation(elective.status, locale);
    const { normalizedQuery } = useElectiveSearch(elective, query);

    return (
        <>
            <article
                className={[
                    styles.card,
                    statusPresentation.tone === 'active' ? styles.active : '',
                    statusPresentation.tone === 'archived' ? styles.archived : '',
                    statusPresentation.tone === 'deleted' ? styles.deleted : '',
                ].join(' ').trim()}
            >
                <div className={styles.header}>
                    <h3 className={styles.title}>
                        {highlight(elective.name, normalizedQuery)}
                    </h3>

                    <AdminElectiveActionsMenu
                        elective={elective}
                        openMenuLabel={text.actions.openMenu}
                        editLabel={text.actions.edit}
                        archiveLabel={text.actions.archive}
                        unarchiveLabel={text.actions.unarchive}
                        deleteLabel={text.actions.delete}
                        restoreLabel={text.actions.restore}
                        onEdit={onEdit}
                        onArchive={onArchive}
                        onDelete={onDelete}
                        onRestore={onRestore}
                    />
                </div>

                <div className={styles.footer}>
                    <button
                        type="button"
                        onClick={open}
                        className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                    >
                        {text.actions.seeMore}
                    </button>
                </div>
            </article>

            <ElectiveModal
                open={isOpen}
                title={elective.name}
                onClose={close}
                footer={
                    elective.status === -1 ? (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                onClick={() => onRestore?.(elective)}
                                className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                            >
                                {text.actions.restore}
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                onClick={() => onEdit?.(elective)}
                                className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                            >
                                {text.actions.edit}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    elective.status === 0
                                        ? onRestore?.(elective)
                                        : onArchive?.(elective)
                                }
                                className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                            >
                                {elective.status === 0 ? text.actions.unarchive : text.actions.archive}
                            </button>

                            <button
                                type="button"
                                onClick={() => onDelete?.(elective)}
                                className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                            >
                                {text.actions.delete}
                            </button>
                        </div>
                    )
                }
            >
                <div>
                    <p>
                        {text.meta.teacher}: {highlight(elective.instructor, normalizedQuery)}
                    </p>
                    <p>
                        {text.meta.language}: {highlight(elective.electiveLanguage, normalizedQuery)}
                    </p>
                    <p>
                        {text.meta.prerequisite}: {highlight(elective.prerequisite, normalizedQuery)}
                    </p>
                    <p>
                        {text.meta.status}: {statusPresentation.label}
                    </p>
                    <p>
                        {text.meta.type}: {elective.electiveType}
                    </p>
                    <p>
                        {text.meta.program}: {elective.programLanguage}
                    </p>
                    <p>
                        {text.meta.degreeYears}: {elective.degreeYear.join(', ')}
                    </p>

                    <div className={markdownStyles.markdown}>
                        <MarkdownRenderer>{elective.description}</MarkdownRenderer>
                    </div>
                </div>
            </ElectiveModal>
        </>
    );
}
