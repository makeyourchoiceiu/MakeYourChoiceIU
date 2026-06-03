import { useMemo, useState } from 'react';
import type { Elective } from '../types/elective';
import type { Locale } from '../utils/electiveText';
import type { StudentProfileElectiveType } from '../types/studentSidebar';
import { useStudentElectivesPage } from '../hooks/useStudentElectivesPage';
import { useStudentSidebar } from '../hooks/useStudentSidebar';
import { StudentSidebar } from '../components/StudentSidebar';
import { StudentPageLayout } from '../components/StudentPageLayout';
import { ElectivesList } from '../components/ElectivesList';
import {
    StudentElectiveSelectionForm,
    type StudentSelectionOption,
} from '../components/StudentElectiveSelectionForm';
import type { StudentSelectionByTypeHandle } from '../types/studentVoting';
import type { StudentChosenGroup } from '../hooks/useStudentElectivesFlow';
import { UiAlert } from '../components/UiAlert';
import styles from './StudentElectivesPage.module.css';

interface StudentElectivesPageProps {
    electives: Elective[];
    locale: Locale;
    favouriteIds: number[];
    availableElectiveTypes: StudentProfileElectiveType[];
    chosenByType: StudentChosenGroup[];
    getSelections: StudentSelectionByTypeHandle['getSelections'];
    setSelection: StudentSelectionByTypeHandle['setSelection'];
    resetSelections: StudentSelectionByTypeHandle['resetSelections'];
    submitSelections: StudentSelectionByTypeHandle['submitSelections'];
    savingType: string | null;
    saveError: string | null;
    query: string;
    onQueryChange: (value: string) => void;
    onToggleFavourite?: (elective: Elective) => void;
}

export function StudentElectivesPage({
                                         electives,
                                         locale,
                                         favouriteIds,
                                         availableElectiveTypes,
                                         chosenByType,
                                         getSelections,
                                         setSelection,
                                         resetSelections,
                                         submitSelections,
                                         savingType,
                                         saveError,
                                         query,
                                         onQueryChange,
                                         onToggleFavourite,
                                     }: StudentElectivesPageProps) {
    const [languageFilter, setLanguageFilter] = useState('');
    const [yearFilters, setYearFilters] = useState<string[]>([]);

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

    const { visibleElectives } = useStudentElectivesPage({
        electives,
        query,
        favouriteIds,
        activeType,
    });

    const languageOptions = useMemo(() => {
        return Array.from(new Set(electives.map((item) => item.electiveLanguage))).sort();
    }, [electives]);

    const yearOptions = useMemo(() => {
        return Array.from(new Set(electives.flatMap((item) => item.degreeYear))).sort();
    }, [electives]);

    const filteredElectives = useMemo(() => {
        return visibleElectives.filter((item) => {
            const languageMatches =
                !languageFilter || item.electiveLanguage === languageFilter;
            const yearMatches =
                yearFilters.length === 0 ||
                yearFilters.some((year) => item.degreeYear.includes(year));

            return languageMatches && yearMatches;
        });
    }, [visibleElectives, languageFilter, yearFilters]);

    const activeTypeConfig = useMemo(
        () =>
            availableElectiveTypes.find((item) => item.type === activeType) ?? null,
        [availableElectiveTypes, activeType]
    );

    const activeTypeElectives = useMemo(() => {
        if (!activeTypeConfig) {
            return [];
        }

        return electives.filter((item) => item.electiveType === activeTypeConfig.type);
    }, [electives, activeTypeConfig]);

    const currentSelections = useMemo(() => {
        if (!activeTypeConfig) {
            return [];
        }

        return getSelections(activeTypeConfig.type, activeTypeConfig.requiredCount);
    }, [activeTypeConfig, getSelections]);

    const formOptions = useMemo<StudentSelectionOption[]>(() => {
        const favouriteSet = new Set(favouriteIds);
        return [...activeTypeElectives]
            .sort((a, b) => {
                const aFav = favouriteSet.has(a.id);
                const bFav = favouriteSet.has(b.id);

                if (aFav !== bFav) {
                    return aFav ? -1 : 1;
                }

                return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
            })
            .map((item) => ({
                id: item.id,
                name: item.name,
                isFavourite: favouriteSet.has(item.id),
            }));
    }, [activeTypeElectives, favouriteIds]);

    const chosenSummary = useMemo(
        () => chosenByType.filter((group) => group.electiveIds.length > 0),
        [chosenByType]
    );

    function renderContent() {
        if (!activeSection) {
            return <p>No active section</p>;
        }

        if (activeSection.kind === 'main') {
            return (
                <section className={styles.contentSection}>
                    {chosenSummary.length === 0 ? (
                        <div className={styles.mainCard}>
                            <p className={styles.emptyHint}>
                                No submission yet. Choose an elective type and save your priorities.
                            </p>
                        </div>
                    ) : (
                        <div className={styles.mainCard}>
                            <p className={styles.mainLead}>Your latest submitted choices:</p>
                            {chosenSummary.map((group) => (
                                <section key={`chosen-${group.type}`} className={styles.typeBlock}>
                                    <h3 className={styles.typeTitle}>{group.type}</h3>
                                    <ol className={styles.chosenList}>
                                        {group.electiveIds.map((electiveId, index) => {
                                            const matched = electives.find(
                                                (item) => item.id === electiveId
                                            );
                                            return (
                                                <li key={`${group.type}-${index}-${electiveId}`}>
                                                    {matched?.name ?? `Elective #${electiveId}`}
                                                </li>
                                            );
                                        })}
                                    </ol>
                                </section>
                            ))}
                        </div>
                    )}
                </section>
            );
        }

        return (
            <section className={styles.contentSection}>
                <ElectivesList
                    role="student"
                    electives={filteredElectives}
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
                    languageFilter={languageFilter}
                    languageOptions={languageOptions}
                    onLanguageFilterChange={setLanguageFilter}
                    yearFilters={yearFilters}
                    yearOptions={yearOptions}
                    onToggleYearFilter={(value) => {
                        setYearFilters((prev) =>
                            prev.includes(value)
                                ? prev.filter((item) => item !== value)
                                : [...prev, value]
                        );
                    }}
                    onResetFilters={() => {
                        setLanguageFilter('');
                        setYearFilters([]);
                    }}
                    selectionForm={
                        activeSection && activeSection.kind === 'elective-type' && activeTypeConfig ? (
                            <>
                                <StudentElectiveSelectionForm
                                    electiveType={activeTypeConfig.type}
                                    requiredCount={activeTypeConfig.requiredCount}
                                    selections={currentSelections}
                                    options={formOptions}
                                    saving={savingType === activeTypeConfig.type}
                                    onChange={(index, electiveId) => {
                                        setSelection(
                                            activeTypeConfig.type,
                                            activeTypeConfig.requiredCount,
                                            index,
                                            electiveId
                                        );
                                    }}
                                    onSave={async () => {
                                        await submitSelections(
                                            activeTypeConfig.type,
                                            activeTypeConfig.requiredCount
                                        );
                                    }}
                                    onReset={() => {
                                        resetSelections(
                                            activeTypeConfig.type,
                                            activeTypeConfig.requiredCount
                                        );
                                    }}
                                />
                                {saveError ? <UiAlert message={saveError} /> : null}
                            </>
                        ) : null
                    }
                    onChange={setActiveSectionKey}
                />
            }
            content={renderContent()}
        />
    );
}
