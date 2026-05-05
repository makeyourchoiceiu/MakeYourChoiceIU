import { useEffect } from 'react';
import type { Elective } from '../types/elective';
import type { Locale } from '../utils/electiveText';
import type { StudentProfileElectiveType } from '../types/studentSidebar';
import { useStudentElectivesPage } from '../hooks/useStudentElectivesPage';
import { useStudentSidebar } from '../hooks/useStudentSidebar';
import { StudentSidebar } from '../components/StudentSidebar';
import { StudentPageLayout } from '../components/StudentPageLayout';
import { ElectivesList } from '../components/ElectivesList';
import { StudentElectiveSelectionForm } from '../components/StudentElectiveSelectionForm';

interface StudentElectivesPageProps {
    electives: Elective[];
    locale: Locale;
    favouriteIds: number[];
    availableElectiveTypes: StudentProfileElectiveType[];
    query: string;
    onQueryChange: (value: string) => void;
    onToggleFavourite?: (elective: Elective) => void;
}

export function StudentElectivesPage({
                                         electives,
                                         locale,
                                         favouriteIds,
                                         availableElectiveTypes,
                                         query,
                                         onQueryChange,
                                         onToggleFavourite,
                                     }: StudentElectivesPageProps) {
    const {
        sections,
        activeSectionKey,
        activeSection,
        setActiveSectionKey,
    } = useStudentSidebar({
        electiveTypes: availableElectiveTypes,
    });

    const activeType =
        activeSection?.kind === 'elective-type' && activeSection.electiveType
            ? activeSection.electiveType
            : 'all';

    const { tabs, visibleElectives } = useStudentElectivesPage({
        electives,
        query,
        favouriteIds,
        activeType,
    });

    useEffect(() => {
        if (activeSection?.kind !== 'elective-type') {
            return;
        }

        const exists = tabs.some((tab) => tab.value === activeSection.electiveType);

        if (!exists) {
            setActiveSectionKey('main');
        }
    }, [tabs, activeSection, setActiveSectionKey]);

    function renderContent() {
        if (!activeSection) {
            return <p>No active section</p>;
        }

        if (activeSection.kind === 'main') {
            return (
                <section>
                    <h1>Student electives</h1>
                    <p>Main page placeholder.</p>
                    <p>Here we will later show the latest submitted elective choices.</p>
                </section>
            );
        }

        return (
            <section>
                <h1>{activeSection.label}</h1>

                <StudentElectiveSelectionForm
                    electiveType={activeSection.electiveType ?? ''}
                    requiredCount={activeSection.requiredCount ?? 0}
                />

                <ElectivesList
                    role="student"
                    electives={visibleElectives}
                    locale={locale}
                    query={query}
                    favouriteIds={favouriteIds}
                    onToggleFavourite={onToggleFavourite}
                    emptyText="No electives match the current filters"
                />
            </section>
        );
    }

    return (
        <StudentPageLayout
            sidebar={
                <StudentSidebar
                    sections={sections}
                    activeSectionKey={activeSectionKey}
                    searchValue={query}
                    onSearchChange={onQueryChange}
                    onChange={setActiveSectionKey}
                />
            }
            content={renderContent()}
        />
    );
}
