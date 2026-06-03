import { useState } from 'react';
import type { Elective } from '../types/elective';
import type { AdminElectiveFilters } from '../types/electivesList';
import type { Locale } from '../utils/electiveText';
import { useAdminElectivesPage } from '../hooks/useAdminElectivesPage';
import { useAdminElectiveEditor } from '../hooks/useAdminElectiveEditor';
import { useAdminSidebarFilters } from '../hooks/useAdminSidebarFilters';
import { AdminElectiveFilters as AdminElectiveFiltersPanel } from '../components/AdminElectiveFilters';
import { ElectivesList } from '../components/ElectivesList';
import { AdminElectivesSidebar } from '../components/AdminElectivesSidebar';
import { AdminPageLayout } from '../components/AdminPageLayout';
import { ElectiveEditorModal } from '../components/ElectiveEditorModal';
import { mapDraftToElectivePayload } from '../utils/electiveEditor';
import type { UpdateElectivePayload } from '../api/electives';
import styles from './AdminElectivesPage.module.css';

interface AdminElectivesPageProps {
    electives: Elective[];
    locale: Locale;
    query: string;
    onQueryChange: (value: string) => void;
    onCreateElective: (payload: UpdateElectivePayload) => Promise<void>;
    onUpdateElective: (id: number, payload: UpdateElectivePayload) => Promise<void>;
    onArchive?: (elective: Elective) => void;
    onDelete?: (elective: Elective) => void;
    onRestore?: (elective: Elective) => void;
}

const INITIAL_FILTERS: AdminElectiveFilters = {
    electiveLanguage: '',
    degreeYears: [],
    electiveTypes: [],
    programLanguage: '',
    statuses: [],
};

export function AdminElectivesPage({
                                       electives,
                                       locale,
                                       query,
                                       onQueryChange,
                                       onCreateElective,
                                       onUpdateElective,
                                       onArchive,
                                       onDelete,
                                       onRestore,
                                   }: AdminElectivesPageProps) {
    const [filters, setFilters] = useState<AdminElectiveFilters>(INITIAL_FILTERS);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [saving, setSaving] = useState(false);

    const editor = useAdminElectiveEditor();
    const sidebar = useAdminSidebarFilters({ electives });

    const effectiveFilters: AdminElectiveFilters = {
        ...filters,
        electiveTypes: sidebar.selectedElectiveTypes,
        statuses: sidebar.selectedStatuses,
    };

    const isAllElectivesSelected =
        filters.electiveLanguage === '' &&
        filters.degreeYears.length === 0 &&
        filters.programLanguage === '' &&
        sidebar.selectedElectiveTypes.length === 0 &&
        sidebar.selectedStatuses.length === 0;

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

    function resetAllFilters() {
        setFilters(INITIAL_FILTERS);
        sidebar.resetFilters();
    }

    function handleAddElective() {
        const prefilledType =
            sidebar.selectedElectiveTypes.length === 1 ? sidebar.selectedElectiveTypes[0] : '';
        editor.openAdd(prefilledType);
    }

    function handleEditElective(elective: Elective) {
        editor.openEdit(elective);
    }

    async function handleSave() {
        try {
            setSaving(true);

            if (editor.mode === 'add') {
                const payload = mapDraftToElectivePayload(editor.draft, 1);
                await onCreateElective(payload);
            } else if (
                editor.editingElectiveId !== null &&
                editor.editingElectiveStatus !== null
            ) {
                const payload = mapDraftToElectivePayload(
                    editor.draft,
                    editor.editingElectiveStatus
                );
                await onUpdateElective(editor.editingElectiveId, payload);
            }

            editor.close();
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <AdminPageLayout
                sidebar={
                    <AdminElectivesSidebar
                        items={sidebar.items}
                        isResetActive={isAllElectivesSelected}
                        selectedItemIds={sidebar.selectedItemIds}
                        onToggle={(item) => {
                            if (item.kind === 'reset') {
                                resetAllFilters();
                                return;
                            }

                            sidebar.toggleItem(item);
                        }}
                        addLabel="Add elective"
                        onAdd={handleAddElective}
                        searchValue={query}
                        onSearchChange={onQueryChange}
                        filters={
                            <AdminElectiveFiltersPanel
                                filters={filters}
                                filterOptions={filterOptions}
                                viewMode={viewMode}
                                hasActiveFilters={!isAllElectivesSelected}
                                visibleCount={visibleElectives.length}
                                totalCount={electives.length}
                                onViewModeChange={setViewMode}
                                onChange={updateFilter}
                                onReset={resetAllFilters}
                            />
                        }
                    />
                }
                content={
                    <section className={styles.page}>
                        <div className={styles.list}>
                            <ElectivesList
                                role="admin"
                                electives={visibleElectives}
                                locale={locale}
                                query={query}
                                adminViewMode={viewMode}
                                onEdit={handleEditElective}
                                onArchive={onArchive}
                                onDelete={onDelete}
                                onRestore={onRestore}
                                emptyText="No electives match the current admin filters"
                            />
                        </div>
                    </section>
                }
            />

            <ElectiveEditorModal
                open={editor.isOpen}
                mode={editor.mode}
                draft={editor.draft}
                typeOptions={sidebar.typeOptions}
                onClose={editor.close}
                onChangeField={editor.updateField}
                onSave={handleSave}
                saving={saving}
                locale={locale}
            />
        </>
    );
}
