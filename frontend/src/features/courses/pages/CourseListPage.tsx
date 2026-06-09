import { useTranslation } from 'react-i18next';

export const CourseListPage = () => {
  const { t, i18n } = useTranslation(); // i18n instance for changing language

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('pages.course_list.title')}</h1>
      <input
        type="text"
        placeholder={t('pages.course_list.search_placeholder')}
        className="border p-2 rounded mb-4 w-full"
      />
      <p>{t('pages.course_list.no_courses')}</p>
    </div>
  );
};