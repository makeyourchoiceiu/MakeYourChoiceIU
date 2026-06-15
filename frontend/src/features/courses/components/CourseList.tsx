import { useTranslation } from 'react-i18next';
import { CourseCard } from './CourseCard';
import { Course } from '@/shared/types/course';

interface CourseListProps {
  courses: Course[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

export const CourseList = ({ courses, isFavorite, onToggleFavorite }: CourseListProps) => {
  const { t } = useTranslation();

  if (courses.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-300">
        {t('course_page.no_courses_found')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          {...course}
          isFavorite={isFavorite(course.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};