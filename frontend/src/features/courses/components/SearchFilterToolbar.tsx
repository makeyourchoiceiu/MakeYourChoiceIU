import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCourseFilterStore } from '@/stores/courseFilterStore';
import { SearchIcon, FilterIcon } from '@/shared/components/icons';

export const SearchFilterToolbar = () => {
  const { t } = useTranslation();
  const [showFilter, setShowFilter] = useState(false);
  const firstSelectRef = useRef<HTMLSelectElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { searchTerm, languageFilter, formatFilter, setSearchTerm, setLanguageFilter, setFormatFilter, clearFilters } = useCourseFilterStore();

  // Focus first select when filter panel opens
  useEffect(() => {
    if (showFilter && firstSelectRef.current) {
      firstSelectRef.current.focus();
    }
  }, [showFilter]);

  // Escape to close filter panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFilter) {
        setShowFilter(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFilter]);

  // Click outside to close filter panel
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && showFilter) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilter]);

  const handleClearFilters = () => {
    clearFilters();
    setShowFilter(false);
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      {/* Search input – always visible, grows to fill space */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={t('course_page.search_by_title')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label={t('course_page.search_aria') || 'Search courses'}
        />
      </div>

      {/* Filter button */}
      <div className="relative shrink-0">
        <button
          onClick={() => setShowFilter(!showFilter)}
          aria-label={t('course_page.filter_aria') || 'Filter courses'}
          className="bg-green-iu hover:bg-hover-green-iu dark:bg-green-iu dark:hover:bg-dark-hover-green-iu p-2 rounded-lg text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FilterIcon />
        </button>
        {showFilter && (
          <div
            ref={panelRef}
            className="absolute top-full right-0 mt-2 w-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border z-10 space-y-3 border-gray-200 dark:border-gray-700"
            role="dialog"
            aria-label="Filter options"
          >
            <div>
              <label id="language-label" className="block text-sm font-medium mb-1 dark:text-white">
                {t('course_page.language')}
              </label>
              <select
                ref={firstSelectRef}
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value as any)}
                aria-labelledby="language-label"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white border-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('course_page.all')}</option>
                <option value="English">{t('course_page.en')}</option>
                <option value="Russian">{t('course_page.ru')}</option>
              </select>
            </div>
            <div>
              <label id="format-label" className="block text-sm font-medium mb-1 dark:text-white">
                {t('course_page.format')}
              </label>
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value as any)}
                aria-labelledby="format-label"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white border-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('course_page.all')}</option>
                <option value="online">{t('course_page.online')}</option>
                <option value="offline">{t('course_page.offline')}</option>
              </select>
            </div>
            <button
              onClick={handleClearFilters}
              className="text-sm text-green-iu dark:text-green-iu hover:underline mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              {t('course_page.clear_filters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};