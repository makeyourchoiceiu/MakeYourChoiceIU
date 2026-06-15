import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchIcon, FilterIcon } from '@/shared/components/icons';
import { useCourseFilterStore } from '@/stores/courseFilterStore';

export const SearchFilterToolbar = () => {
  const { t } = useTranslation();
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const {
    searchTerm,
    languageFilter,
    formatFilter,
    setSearchTerm,
    setLanguageFilter,
    setFormatFilter,
    clearFilters,
  } = useCourseFilterStore();

  const handleClearFilters = () => {
    clearFilters();
    setShowFilter(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-4 mb-6">
      {/* Search Button + input */}
      <div className="relative">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="bg-green-iu hover:bg-hover-green-iu dark:bg-green-iu dark:hover:bg-dark-hover-green-iu p-2 rounded text-white transition-colors"
        >
          <SearchIcon />
        </button>
        {showSearch && (
          <input
            type="text"
            placeholder={t('course_page.search_by_title')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="absolute top-full right-0 mt-2 w-64 px-3 py-2 border rounded shadow-lg bg-white dark:bg-gray-800 dark:text-white z-10 border-gray-200 dark:border-gray-700"
            autoFocus
          />
        )}
      </div>

      {/* Filter Button + panel */}
      <div className="relative">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="bg-green-iu hover:bg-hover-green-iu dark:bg-green-iu dark:hover:bg-dark-hover-green-iu p-2 rounded text-white transition-colors"
        >
          <FilterIcon />
        </button>
        {showFilter && (
          <div className="absolute top-full right-0 mt-2 w-64 p-4 bg-white dark:bg-gray-800 rounded shadow-lg border z-10 space-y-3 border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-white">
                {t('course_page.language')}
              </label>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value as any)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white border-gray-100 dark:border-gray-600"
              >
                <option value="all">{t('course_page.all')}</option>
                <option value="English">{t('course_page.en')}</option>
                <option value="Russian">{t('course_page.ru')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-white">
                {t('course_page.format')}
              </label>
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value as any)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white border-gray-100 dark:border-gray-600"
              >
                <option value="all">{t('course_page.all')}</option>
                <option value="online">{t('course_page.online')}</option>
                <option value="offline">{t('course_page.offline')}</option>
              </select>
            </div>
            <button
              onClick={handleClearFilters}
              className="text-sm text-green-iu dark:text-green-iu hover:underline mt-2"
            >
              {t('course_page.clear_filters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};