import type { AdminSidebarItem, AdminSidebarItemType } from '../types/adminSidebar';
import { AdminSidebarNav } from './AdminSidebarNav';
import buttonStyles from '../styles/button.module.css';
import styles from '../styles/adminElectivesSidebar.module.css';

interface AdminElectivesSidebarProps {
    items: AdminSidebarItem[];
    active: AdminSidebarItemType;
    onChange: (type: AdminSidebarItemType) => void;
    addLabel: string;
    onAdd: () => void;
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
                                          active,
                                          onChange,
                                          addLabel,
                                          onAdd,
                                      }: AdminElectivesSidebarProps) {
    return (
        <aside className={styles.sidebar}>
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

            <AdminSidebarNav items={items} active={active} onChange={onChange} />
        </aside>
    );
}