import { useState } from 'react';
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
                             id,
                             title,
                             language,
                             format,
                             instructor,
                             description,
                             onToggleFavorite,
                           }: CourseProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm py-3 px-4 relative border border-gray-100 dark:border-gray-700">
      {/* Star Button */}
      <button
        onClick={() => onToggleFavorite(id)}
        className="absolute top-4 right-4 text-green-iu hover:fill-green-iu"
        aria-label={t('course.toggle_favorite')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>

      <h3 className="text-2xl font-bold text-green-iu mb-3">{title}</h3>

      <div className="flex flex-wrap gap-6 text-base font-medium mb-3">
        <div className="flex gap-2">
          <span className="font-bold text-gray-700 dark:text-gray-300">
            {t('course.language')}:
          </span>
          <span className="font-bold text-green-iu">{language}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-bold text-gray-700 dark:text-gray-300">
            {t('course.format')}:
          </span>
          <span className="font-bold text-green-iu">{format}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-bold text-gray-700 dark:text-gray-300">
            {t('course.instructor')}:
          </span>
          <span className="font-bold text-gray-900 dark:text-gray-100">
            {instructor}
          </span>
        </div>
      </div>

      <div className="pr-16">
        <p
          className={`
            font-medium text-gray-500 dark:text-gray-300 text-base
            whitespace-pre-wrap
            transition-all duration-200
            ${isExpanded ? '' : 'overflow-hidden'}
          `}
          style={
            isExpanded
              ? { whiteSpace: 'pre-wrap' }
              : { maxHeight: '1.5rem', overflow: 'hidden' }
          }
        >
          {description}
        </p>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute bottom-4 right-4 font-bold bg-green-iu hover:bg-green-iu text-white py-1 px-2 rounded text-base transition-colors shrink-0 whitespace-nowrap"
        >
          {isExpanded ? t('course.see_less') : t('course.see_more')}
        </button>
      </div>
    </div>
  );
};