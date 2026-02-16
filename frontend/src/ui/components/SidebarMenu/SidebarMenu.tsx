import { NavLink } from 'react-router-dom';
import styles from './SidebarMenu.module.css';
import type { ElectiveTypeTab } from '../../../api/electiveTypes';

type Props = {
    basePath: string;          // например "/student"
    tabs: ElectiveTypeTab[];   // пришли из бэка/мока
};

export function SidebarMenu({ basePath, tabs }: Props) {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>MYC</div>

            <nav className={styles.nav}>
                <NavLink
                    to={`${basePath}/main`}
                    className={({ isActive }) => (isActive ? styles.itemActive : styles.item)}
                >
                    Main page
                </NavLink>

                {tabs.map((t) => (
                    <NavLink
                        key={t.type}
                        to={`${basePath}/electives/${t.type}`}
                        className={({ isActive }) => (isActive ? styles.itemActive : styles.item)}
                    >
                        {t.title}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
