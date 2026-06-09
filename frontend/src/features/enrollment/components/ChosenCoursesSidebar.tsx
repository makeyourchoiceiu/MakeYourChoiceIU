import { useTranslation } from 'react-i18next';
import { useEnrolledCourses } from '../hooks/useEnrolledCourses';

export const ChosenCoursesSidebar = () => {
  const { t } = useTranslation();
  const { data: enrolledCourses, isLoading } = useEnrolledCourses();

  if (isLoading) return <div className="p-4">{t('common.loading')}</div>;

  return (
    <aside className="w-64 bg-gray-100 p-4 border-l">
      <h3 className="font-bold text-lg mb-2">{t('common.my_courses')}</h3>
      <ul>
        {enrolledCourses?.map((course) => (
          <li key={course.id}>{course.name}</li>
        ))}
      </ul>
    </aside>
  );
};