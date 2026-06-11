import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CourseCard } from '@/features/courses/components/CourseCard';
import { Sidebar } from '@/shared/layouts/Sidebar';
import { mockCourses } from '@/shared/lib/mockApi';

const CoursesPage = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState(mockCourses);
  const [deadline, setDeadline] = useState('August 28, 23:59');

  // 1. Fetch Data from backend here
  useEffect(() => {
    // fetchCourses().then(setCourses);
    // fetchDeadline().then(setDeadline);
  }, []);

  const handleToggleFavorite = (id: string) => {
    console.log(`Toggled favorite for course: ${id}`);
    // Logic to update state/backend
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Left Sidebar */}
      <Sidebar deadline={deadline} />

      {/* Main Content Area */}
      <div className="flex-1 p-8 max-w-5xl">
        {/* Top Toolbar */}
        <div className="flex justify-end gap-4 mb-6">
          <button className="bg-green-500 p-2 rounded text-white hover:bg-green-600 transition-colors">
            <SearchIcon />
          </button>
          <button className="bg-green-500 p-2 rounded text-white hover:bg-green-600 transition-colors">
            <FilterIcon />
          </button>
        </div>

        {/* Course List */}
        <div className="flex flex-col gap-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              {...course}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;

// Helper Icons
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