import type { ReactNode } from 'react';
import type { StudentSidebarSection } from '../types/studentSidebar';
import { SearchInput } from './SearchInput';
import buttonStyles from '../styles/button.module.css';
import styles from './StudentSidebar.module.css';

interface StudentSidebarProps {
    sections: StudentSidebarSection[];
    activeSectionKey: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    languageFilter: string;
    languageOptions: string[];
    onLanguageFilterChange: (value: string) => void;
    yearFilters: string[];
    yearOptions: string[];
    onToggleYearFilter: (value: string) => void;
    onResetFilters: () => void;
    selectionForm?: ReactNode;
    onChange: (key: string) => void;
}

export function StudentSidebar({
                                   sections,
                                   activeSectionKey,
                                   searchValue,
                                   onSearchChange,
                                   languageFilter,
                                   languageOptions,
                                   onLanguageFilterChange,
                                   yearFilters,
                                   yearOptions,
                                   onToggleYearFilter,
                                   onResetFilters,
                                   selectionForm,
                                   onChange,
                               }: StudentSidebarProps) {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.search}>
                <SearchInput
                    id="student-sidebar-search"
                    label="Search electives"
                    value={searchValue}
                    onChange={onSearchChange}
                    placeholder="Type to search"
                />
            </div>

            <section className={styles.filters}>
                <p className={styles.title}>Teaching language</p>
                <select
                    className={styles.select}
                    value={languageFilter}
                    onChange={(event) => onLanguageFilterChange(event.target.value)}
                >
                    <option value="">All</option>
                    {languageOptions.map((value) => (
                        <option key={`language-${value}`} value={value}>
                            {value}
                        </option>
                    ))}
                </select>

                <p className={styles.title}>Degree year</p>
                <div className={styles.yearGrid}>
                    {yearOptions.map((value) => {
                        const isActive = yearFilters.includes(value);

                        return (
                            <button
                                key={`year-${value}`}
                                type="button"
                                onClick={() => onToggleYearFilter(value)}
                                aria-pressed={isActive}
                                className={[
                                    buttonStyles.button,
                                    buttonStyles.sizeSm,
                                    isActive
                                        ? buttonStyles.variantSecondary
                                        : buttonStyles.variantGhost,
                                    styles.yearButton,
                                ].join(' ')}
                            >
                                {value}
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    onClick={onResetFilters}
                    className={`${buttonStyles.button} ${buttonStyles.sizeSm} ${buttonStyles.variantGhost}`}
                >
                    Reset filters
                </button>
            </section>

            <nav className={styles.nav} aria-label="Student sections">
                {sections.map((section) => {
                    const isActive = activeSectionKey === section.key;
                    const isMain = section.kind === 'main';

                    return (
                        <button
                            key={section.key}
                            type="button"
                            onClick={() => onChange(section.key)}
                            aria-pressed={isActive}
                            className={[
                                buttonStyles.button,
                                buttonStyles.sizeSm,
                                isActive ? buttonStyles.variantSecondary : buttonStyles.variantGhost,
                                styles.sectionButton,
                                isMain ? styles.mainButton : '',
                            ].join(' ')}
                        >
                            <span className={styles.label}>{section.label}</span>
                            {section.kind === 'elective-type' && section.requiredCount ? (
                                <span className={styles.meta}>Choose {section.requiredCount}</span>
                            ) : null}
                        </button>
                    );
                })}
            </nav>

            {selectionForm ? <div className={styles.formSlot}>{selectionForm}</div> : null}
        </aside>
    );
}
