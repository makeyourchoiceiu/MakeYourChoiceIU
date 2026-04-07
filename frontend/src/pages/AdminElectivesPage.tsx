import { useState } from 'react';
import type { Elective } from '../types/elective';
import type { AdminElectiveFilters } from '../types/electivesList';
import type { Locale } from '../utils/electiveText';
import type { AdminSidebarItem, AdminSidebarItemType } from '../types/adminSidebar';
import { useAdminElectivesPage } from '../hooks/useAdminElectivesPage';
import { AdminElectiveFilters as AdminElectiveFiltersPanel } from '../components/AdminElectiveFilters';
import { ElectivesList } from '../components/ElectivesList';
import { AdminElectivesSidebar } from '../components/AdminElectivesSidebar';
import { AdminPageLayout } from '../components/AdminPageLayout';

interface AdminElectivesPageProps {
    electives: Elective[];
    locale: Locale;
    query: string;
    onEdit?: (elective: Elective) => void;
    onArchive?: (elective: Elective) => void;
    onDelete?: (elective: Elective) => void;
    onAddElective?: () => void;
}

const INITIAL_FILTERS: AdminElectiveFilters = {
    electiveLanguage: '',
    degreeYear: '',
    electiveType: '',
    programLanguage: '',
    status: '',
};

const SIDEBAR_ITEMS: AdminSidebarItem[] = [
    { type: 'all', title: 'All electives' },
    { type: 'tech', title: 'Tech' },
    { type: 'hum', title: 'Hum' },
    { type: 'math', title: 'Math' },
];

/**
 * Admin page:
 * - sidebar state
 * - filters state
 * - подготовка данных через page hook
 * - layout как у student page
 */
export function AdminElectivesPage({
                                       electives,
                                       locale,
                                       query,
                                       onEdit,
                                       onArchive,
                                       onDelete,
                                       onAddElective,
                                   }: AdminElectivesPageProps) {
    const [activeType, setActiveType] = useState<AdminSidebarItemType>('all');
    const [filters, setFilters] = useState<AdminElectiveFilters>(INITIAL_FILTERS);

    /**
     * Sidebar type и admin filters должны работать вместе.
     * Поэтому effective filters = обычные filters + sidebar type.
     */
    const effectiveFilters: AdminElectiveFilters = {
        ...filters,
        electiveType: activeType === 'all' ? filters.electiveType : String(activeType).toUpperCase(),
    };

    const { visibleElectives, filterOptions } = useAdminElectivesPage({
        electives,
        query,
        filters: effectiveFilters,
    });

    function updateFilter<Key extends keyof AdminElectiveFilters>(
        key: Key,
        value: AdminElectiveFilters[Key]
    ) {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    function resetFilters() {
        setFilters(INITIAL_FILTERS);
        setActiveType('all');
    }

    function handleAddElective() {
        onAddElective?.();
    }

    return (
        <AdminPageLayout
            sidebar={
                <AdminElectivesSidebar
                    items={SIDEBAR_ITEMS}
                    active={activeType}
                    onChange={setActiveType}
                    addLabel="Add elective"
                    onAdd={handleAddElective}
                />
            }
            content={
                <section>
                    <h1>Admin electives</h1>

                    <AdminElectiveFiltersPanel
                        filters={filters}
                        filterOptions={filterOptions}
                        onChange={updateFilter}
                        onReset={resetFilters}
                    />

                    <ElectivesList
                        role="admin"
                        electives={visibleElectives}
                        locale={locale}
                        query={query}
                        onEdit={onEdit}
                        onArchive={onArchive}
                        onDelete={onDelete}
                        emptyText="No electives match the current admin filters"
                    />
                </section>
            }
        />
    );
}