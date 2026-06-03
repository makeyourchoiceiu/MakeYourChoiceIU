import * as React from 'react';
import type { Elective } from '../types/elective';
import { ElectiveCardBase } from './ElectiveCardBase';
import { ElectiveModal } from './ElectiveModal';
import { AdminElectiveActionsMenu } from './AdminElectiveActionsMenu';
import { useDisclosure } from '../hooks/useDisclosure';
import { useElectiveSearch } from '../hooks/useElectiveSearch';
import { ELECTIVE_TEXT, type Locale } from '../utils/electiveText';
import { highlight } from '../utils/electiveSearch';
import { getAdminElectiveStatusPresentation } from '../utils/adminElectiveStatus';
import buttonStyles from '../styles/button.module.css';
import ReactMarkdown from 'react-markdown';
import styles from './AdminElectiveCard.module.css';
import markdownStyles from './ElectiveCardMarkdown.module.css';

const MarkdownRenderer = ReactMarkdown as unknown as React.ComponentType<{
    children: string;
}>;

interface AdminElectiveCardProps {
    elective: Elective;
    locale: Locale;
    query?: string;
    onEdit?: (elective: Elective) => void;
    onArchive?: (elective: Elective) => void;
    onDelete?: (elective: Elective) => void;
    onRestore?: (elective: Elective) => void;
}

export function AdminElectiveCard({
                                      elective,
                                      locale,
                                      query = '',
                                      onEdit,
                                      onArchive,
                                      onDelete,
                                      onRestore,
                                  }: AdminElectiveCardProps) {
    const { isOpen, open, close } = useDisclosure(false);
    const text = ELECTIVE_TEXT[locale];
    const statusPresentation = getAdminElectiveStatusPresentation(elective.status, locale);
    const statusClassName =
        statusPresentation.tone === 'active'
            ? `${styles.statusBadge} ${styles.statusActive}`
            : statusPresentation.tone === 'archived'
                ? `${styles.statusBadge} ${styles.statusArchived}`
                : `${styles.statusBadge} ${styles.statusDeleted}`;

    const { normalizedQuery } = useElectiveSearch(elective, query);
    const previewLimit = 240;
    const isCollapsed = !normalizedQuery && elective.description.length > previewLimit;

    return (
        <>
            <ElectiveCardBase
                elective={elective}
                muted={elective.status === 0}
                titleContent={highlight(elective.name, normalizedQuery)}
                titleMeta={
                    <span className={statusClassName}>
                        {statusPresentation.label}
                    </span>
                }
                instructorContent={highlight(elective.instructor, normalizedQuery)}
                languageContent={highlight(elective.electiveLanguage, normalizedQuery)}
                prerequisiteContent={highlight(elective.prerequisite, normalizedQuery)}
                headerAction={
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
                }
                descriptionContent={
                    <div>
                        <div
                            className={[
                                markdownStyles.markdown,
                                isCollapsed ? markdownStyles.collapsed : '',
                            ].join(' ').trim()}
                        >
                            <MarkdownRenderer>{elective.description}</MarkdownRenderer>
                        </div>
                    </div>
                }
                extraInfo={
                    <div>
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
                            {text.meta.degreeYears}: {(elective.degreeYear ?? []).join(', ')}
                        </p>
                    </div>
                }
                footer={
                    <button
                        type="button"
                        onClick={open}
                        className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                    >
                        {text.actions.seeMore}
                    </button>
                }
            />

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

                    <div>
                        <div className={markdownStyles.markdown}>
                            <MarkdownRenderer>{elective.description}</MarkdownRenderer>
                        </div>
                    </div>
                </div>
            </ElectiveModal>
        </>
    );
}
