import type { AdminElectiveFilters } from '../types/electivesList';
import buttonStyles from '../styles/button.module.css';
import styles from './AdminElectiveFilters.module.css';

interface AdminElectiveFiltersProps {
    filters: AdminElectiveFilters;
    filterOptions: {
        electiveLanguages: string[];
        degreeYears: string[];
        programLanguages: string[];
    };
    viewMode: 'list' | 'grid';
    hasActiveFilters?: boolean;
    visibleCount?: number;
    totalCount?: number;
    onViewModeChange: (mode: 'list' | 'grid') => void;
    onChange: <K extends keyof AdminElectiveFilters>(
        key: K,
        value: AdminElectiveFilters[K]
    ) => void;
    onReset: () => void;
}

/**
 * Отдельный UI-блок admin filters.
 * Не хранит state внутри себя.
 * Получает:
 * - текущее значение фильтров
 * - доступные options
 * - callbacks на изменение и reset
 */
export function AdminElectiveFilters({
                                         filters,
                                         filterOptions,
                                         viewMode,
                                         hasActiveFilters = false,
                                         visibleCount,
                                         totalCount,
                                         onViewModeChange,
                                         onChange,
                                         onReset,
                                     }: AdminElectiveFiltersProps) {
    function toggleDegreeYear(value: string) {
        const nextDegreeYears = filters.degreeYears.includes(value)
            ? filters.degreeYears.filter((degreeYear) => degreeYear !== value)
            : [...filters.degreeYears, value];

        onChange('degreeYears', nextDegreeYears);
    }

    return (
        <div className={styles.panel}>
            <div className={styles.summaryBlock}>
                <div className={styles.summaryText}>
                    <p className={styles.summaryLabel}>Electives</p>
                    <p className={styles.summaryValue}>
                        {visibleCount ?? 0}
                        {typeof totalCount === 'number' ? ` / ${totalCount}` : ''}
                    </p>
                </div>

                <div className={styles.viewToggle} aria-label="Elective view mode">
                    <button
                        type="button"
                        onClick={() => onViewModeChange('list')}
                        aria-pressed={viewMode === 'list'}
                        className={[
                            buttonStyles.button,
                            buttonStyles.sizeSm,
                            viewMode === 'list'
                                ? buttonStyles.variantSecondary
                                : buttonStyles.variantGhost,
                            styles.viewModeButton,
                        ].join(' ')}
                    >
                        List
                    </button>
                    <button
                        type="button"
                        onClick={() => onViewModeChange('grid')}
                        aria-pressed={viewMode === 'grid'}
                        className={[
                            buttonStyles.button,
                            buttonStyles.sizeSm,
                            viewMode === 'grid'
                                ? buttonStyles.variantSecondary
                                : buttonStyles.variantGhost,
                            styles.viewModeButton,
                        ].join(' ')}
                    >
                        Grid
                    </button>
                </div>
            </div>

            <div className={styles.section}>
                <p className={styles.sectionTitle}>Learning language</p>
                <label className={styles.field}>
                    <select
                        className={styles.select}
                        value={filters.electiveLanguage}
                        onChange={(event) => onChange('electiveLanguage', event.target.value)}
                    >
                        <option value="">All</option>
                        {filterOptions.electiveLanguages.map((value) => (
                            <option key={`language-${value}`} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className={styles.section}>
                <p className={styles.sectionTitle}>Program language</p>
                <label className={styles.field}>
                    <select
                        className={styles.select}
                        value={filters.programLanguage}
                        onChange={(event) => onChange('programLanguage', event.target.value)}
                    >
                        <option value="">All</option>
                        {filterOptions.programLanguages.map((value) => (
                            <option key={`program-${value}`} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className={styles.section}>
                <p className={styles.sectionTitle}>Degree year</p>

                <div className={styles.degreeGrid}>
                    {filterOptions.degreeYears.map((value) => {
                        const isSelected = filters.degreeYears.includes(value);

                        return (
                            <button
                                key={`degree-${value}`}
                                type="button"
                                onClick={() => toggleDegreeYear(value)}
                                aria-pressed={isSelected}
                                className={[
                                    buttonStyles.button,
                                    buttonStyles.sizeSm,
                                    isSelected
                                        ? buttonStyles.variantSecondary
                                        : buttonStyles.variantGhost,
                                    styles.degreeButton,
                                ].join(' ')}
                            >
                                {value}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    onClick={onReset}
                    disabled={!hasActiveFilters}
                    className={[
                        buttonStyles.button,
                        buttonStyles.sizeMd,
                        buttonStyles.variantGhost,
                        styles.resetButton,
                    ].join(' ')}
                >
                    Reset filters
                </button>
            </div>
        </div>
    );
}
