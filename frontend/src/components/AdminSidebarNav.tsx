import type { AdminSidebarItem, AdminSidebarItemType } from '../types/adminSidebar';
import buttonStyles from '../styles/button.module.css';
import styles from '../styles/adminElectivesSidebar.module.css';

interface AdminSidebarNavProps {
    items: AdminSidebarItem[];
    active: AdminSidebarItemType;
    onChange: (type: AdminSidebarItemType) => void;
}

export function AdminSidebarNav({
                                    items,
                                    active,
                                    onChange,
                                }: AdminSidebarNavProps) {
    return (
        <nav className={styles.nav} aria-label="Admin elective categories">
            {items.map((item) => {
                const isActive = item.type === active;

                return (
                    <button
                        key={item.type}
                        type="button"
                        onClick={() => onChange(item.type)}
                        aria-pressed={isActive}
                        className={[
                            buttonStyles.button,
                            buttonStyles.sizeMd,
                            isActive ? buttonStyles.variantPrimary : buttonStyles.variantGhost,
                            styles.navButton,
                        ].join(' ')}
                    >
                        {item.title}
                    </button>
                );
            })}
        </nav>
    );
}