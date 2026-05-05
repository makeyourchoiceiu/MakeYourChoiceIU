import type { ReactNode } from 'react';
import type { AdminSidebarItem } from '../types/adminSidebar';
import { AdminSidebarNav } from './AdminSidebarNav';
import { SearchInput } from './SearchInput';
import buttonStyles from '../styles/button.module.css';
import styles from '../styles/adminElectivesSidebar.module.css';

interface AdminElectivesSidebarProps {
    items: AdminSidebarItem[];
    isResetActive: boolean;
    selectedItemIds: string[];
    onToggle: (item: AdminSidebarItem) => void;
    addLabel: string;
    onAdd: () => void;
    searchValue: string;
    onSearchChange: (value: string) => void;
    filters?: ReactNode;
}

/**
 * Sidebar админа:
 * - контейнер
 * - верхняя кнопка добавления электива
 * - список категорий
 *
 * Ничего не знает про список карточек, модалки и API.
 */
export function AdminElectivesSidebar({
                                          items,
                                          isResetActive,
                                          selectedItemIds,
                                          onToggle,
                                          addLabel,
                                          onAdd,
                                          searchValue,
                                          onSearchChange,
                                          filters,
                                      }: AdminElectivesSidebarProps) {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.search}>
                <SearchInput
                    id="admin-sidebar-search"
                    label="Search electives"
                    value={searchValue}
                    onChange={onSearchChange}
                    placeholder="Type to search"
                />
            </div>

            <button
                type="button"
                onClick={onAdd}
                className={[
                    buttonStyles.button,
                    buttonStyles.sizeMd,
                    buttonStyles.variantPrimary,
                    styles.addButton,
                ].join(' ')}
            >
                {addLabel}
            </button>

            <AdminSidebarNav
                items={items}
                isResetActive={isResetActive}
                selectedItemIds={selectedItemIds}
                onToggle={onToggle}
            />

            {filters ? <div className={styles.filters}>{filters}</div> : null}
        </aside>
    );
}
