import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; // add this import
import { CourseCard } from '@/features/courses/components/CourseCard';
import { Sidebar } from '@/shared/layouts/Sidebar';
import { mockCourses } from '@/shared/lib/mockApi';
import { useFavorites } from "@/features/courses/hooks/useFavourites";
import { Course } from '@/shared/types/course';

const CoursesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); // initialize navigation
  const [allCourses, setAllCourses] = useState<Course[]>(mockCourses);
  const [deadline, setDeadline] = useState('August 28, 23:59');
  const { toggleFavorite, isFavorite } = useFavorites();

  // Search & filter UI state
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'English' | 'Russian'>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | 'online' | 'offline'>('all');
  // Default type filter is 'tech' as per requirements
  const [typeFilter, setTypeFilter] = useState<'all' | 'tech' | 'hum' | 'math'>('tech');

  // Handler for sidebar selection (includes main menu navigation)
  const handleSidebarSelect = (type: 'main_menu' | 'tech' | 'hum' | 'math') => {
    if (type === 'main_menu') {
      navigate('/'); // or your home route, e.g. '/home'
    } else {
      setTypeFilter(type);
    }
  };

  // 1. Fetch Data from backend here
  useEffect(() => {
    // fetchCourses().then(setAllCourses);
    // fetchDeadline().then(setDeadline);
  }, []);

  // Derived: filtered courses based on search term + filters
  const filteredCourses = allCourses.filter(course => {
    // Search by title (case‑insensitive)
    const matchesSearch = searchTerm === '' ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase());

    // Language filter
    const matchesLanguage = languageFilter === 'all' || course.language === languageFilter;

    // Format filter
    const matchesFormat = formatFilter === 'all' || course.format === formatFilter;

    // Type filter
    const matchesType = typeFilter === 'all' || course.type === typeFilter;

    return matchesSearch && matchesLanguage && matchesFormat && matchesType;
  });

  const handleToggleFavorite = (id: string) => {
    console.log(`Toggled favorite for course: ${id}`);
    toggleFavorite(id);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLanguageFilter('all');
    setFormatFilter('all');
    setShowFilter(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Left Sidebar - passes the custom handler */}
      <Sidebar
        deadline={deadline}
        activeType={typeFilter}
        onSelectType={handleSidebarSelect}
      />

      {/* Main Content Area */}
      <div className="flex-1 p-3 max-w-5xl">
        {/* Top Toolbar */}
        <div className="flex flex-wrap items-center justify-end gap-4 mb-6">
          {/* Search Button + inline input */}
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

          {/* Filter Button + inline panel */}
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
                {/* Clear filters button */}
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

        {/* Course List */}
        <div className="flex flex-col gap-3">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-10 text-gray-600 dark:text-gray-300">
              {t('course_page.no_courses_found')}
            </div>
          ) : (
            filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                {...course}
                isFavorite={isFavorite(course.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const FilterIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 13 10 21 14 18 14 13 22 3"></polygon>
  </svg>
);