import type { AdminSidebarItem } from '../types/adminSidebar';
import buttonStyles from '../styles/button.module.css';
import styles from '../styles/adminElectivesSidebar.module.css';

interface AdminSidebarNavProps {
    items: AdminSidebarItem[];
    isResetActive: boolean;
    selectedItemIds: string[];
    onToggle: (item: AdminSidebarItem) => void;
}

export function AdminSidebarNav({
                                    items,
                                    isResetActive,
                                    selectedItemIds,
                                    onToggle,
                                }: AdminSidebarNavProps) {
    return (
        <nav className={styles.nav} aria-label="Admin elective categories">
            {items.map((item) => {
                const isActive =
                    item.kind === 'reset'
                        ? isResetActive
                        : selectedItemIds.includes(item.id);

                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onToggle(item)}
                        aria-pressed={isActive}
                        className={[
                            buttonStyles.button,
                            buttonStyles.sizeMd,
                            isActive ? buttonStyles.variantPrimary : buttonStyles.variantGhost,
                            styles.navButton,
                            item.kind === 'reset' ? styles.resetButton : '',
                            item.kind === 'status' ? styles.statusButton : '',
                            item.kind === 'type' ? styles.typeButton : '',
                        ].join(' ')}
                    >
                        {item.title}
                    </button>
                );
            })}
        </nav>
    );
}
