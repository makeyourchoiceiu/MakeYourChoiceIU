import {useRef} from "react";
import type {Elective} from "../types/elective.ts";
import {useDisclosure} from "../hooks/useDisclosure.ts";
import {useOutsideClick} from "../hooks/useOutsideClick.ts";
import styles from './AdminElectiveActionsMenu.module.css';
import buttonStyles from '../styles/button.module.css';

interface AdminElectiveActionsMenuProps {
    elective: Elective;
    openMenuLabel: string;
    editLabel: string;
    archiveLabel: string;
    unarchiveLabel: string;
    deleteLabel: string;
    restoreLabel: string;
    onEdit?: (elective: Elective) => void;
    onArchive?: (elective: Elective) => void;
    onDelete?: (elective: Elective) => void;
    onRestore?: (elective: Elective) => void;
}

export function AdminElectiveActionsMenu({
                                             elective,
                                             openMenuLabel,
                                             editLabel,
                                             archiveLabel,
                                             unarchiveLabel,
                                             deleteLabel,
                                             restoreLabel,
                                             onEdit,
                                             onArchive,
                                             onDelete,
                                             onRestore,
                                         }: AdminElectiveActionsMenuProps) {
    const { isOpen, toggle, close } = useDisclosure(false);


    const containerRef = useRef<HTMLDivElement | null>(null);

    useOutsideClick(containerRef, close, isOpen);

    function handleEdit() {
        close();
        onEdit?.(elective);
    }

    function handleArchive() {
        close();
        onArchive?.(elective);
    }

    function handleDelete() {
        close();
        onDelete?.(elective);
    }

    function handleRestore() {
        close();
        onRestore?.(elective);
    }

    return (
        <div ref={containerRef} className={styles.wrap}>
            <button
                type="button"
                aria-label={openMenuLabel}
                onClick={toggle}
                className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.iconOnly}`}
            >
                ⋯
            </button>

            {isOpen ? (
                <div role="menu" className={styles.menu}>
                    {elective.status === -1 ? (
                        <button
                            type="button"
                            role="menuitem"
                            onClick={handleRestore}
                            className={styles.menuItem}
                        >
                            {restoreLabel}
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                role="menuitem"
                                onClick={handleEdit}
                                className={styles.menuItem}
                            >
                                {editLabel}
                            </button>

                            <button
                                type="button"
                                role="menuitem"
                                onClick={elective.status === 0 ? handleRestore : handleArchive}
                                className={styles.menuItem}
                            >
                                {elective.status === 0 ? unarchiveLabel : archiveLabel}
                            </button>

                            <button
                                type="button"
                                role="menuitem"
                                onClick={handleDelete}
                                className={`${styles.menuItem} ${styles.danger}`}
                            >
                                {deleteLabel}
                            </button>
                        </>
                    )}
                </div>
            ) : null}
        </div>
    );
}
