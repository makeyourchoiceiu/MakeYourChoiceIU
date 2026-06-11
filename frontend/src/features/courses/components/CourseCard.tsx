import { useTranslation } from 'react-i18next';

interface CourseProps {
  id: string;
  title: string;
  language: string;
  format: string;
  instructor: string;
  description: string;
  onToggleFavorite: (id: string) => void;
}

export const CourseCard = ({
                             id, title, language, format, instructor, description, onToggleFavorite
                           }: CourseProps) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-4 relative border border-gray-100 dark:border-gray-700">
      {/* Star Button */}
      <button
        onClick={() => onToggleFavorite(id)}
        className="absolute top-4 right-4 text-green-500 hover:fill-green-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      </button>

      <h3 className="text-xl font-bold text-green-500 mb-3">{title}</h3>
      <div className="flex flex-wrap gap-6 text-sm font-medium mb-3">
        <div className="flex gap-2">
          <span className="text-gray-700 dark:text-gray-300">{t('course.language')}:</span>
          <span className="text-green-500">{language}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-gray-700 dark:text-gray-300">{t('course.format')}:</span>
          <span className="text-green-500">{format}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-gray-700 dark:text-gray-300">{t('course.instructor')}:</span>
          <span className="font-bold text-gray-900 dark:text-gray-100">{instructor}</span>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
        {description}
      </p>
      <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-1.5 px-4 rounded text-sm transition-colors">
        {t('course.see_more')}
      </button>
    </div>
  );
};