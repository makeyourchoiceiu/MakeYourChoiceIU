import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/shared/layouts/Sidebar';
import { generateMockCourses } from '@/shared/lib/mockApi';
import { useFavorites } from '@/features/courses/hooks/useFavourites';
import { useProfileStore } from '@/stores/profileStore';
import { useCourseFilterStore } from '@/stores/courseFilterStore';
import { useSyncCourseFilters } from '@/hooks/useSyncCourseFilters';
import { useFilteredCourses } from '@/features/courses/hooks/useFilteredCourses';
import { SearchFilterToolbar } from '@/features/courses/components/SearchFilterToolbar';
import { CourseList } from '@/features/courses/components/CourseList';
import { Course } from '@/shared/types/course';

const CoursesPage = () => {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState<Course[]>(generateMockCourses(20));
  const [deadline, setDeadline] = useState('August 28, 23:59');
  const { toggleFavorite, isFavorite } = useFavorites();
  const { student } = useProfileStore();
  const { typeFilter, setTypeFilter } = useCourseFilterStore();

  // Sync filters with URL
  useSyncCourseFilters();

  // Filtered courses based on student & filter store
  const filteredCourses = useFilteredCourses(allCourses);

  // Sidebar navigation
  const handleSidebarSelect = (type: 'main_menu' | 'tech' | 'hum' | 'math') => {
    if (type === 'main_menu') {
      navigate('/');
    } else {
      setTypeFilter(type);
    }
  };

  // Fetch real data (mock for now)
  useEffect(() => {
    // fetchCourses().then(setAllCourses);
    // fetchDeadline().then(setDeadline);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar
        deadline={deadline}
        activeType={typeFilter}
        onSelectType={handleSidebarSelect}
      />

      <div className="flex-1 p-3 max-w-5xl">
        <SearchFilterToolbar />
        <CourseList
          courses={filteredCourses}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
      </div>
    </div>
  );
};

export default CoursesPage;