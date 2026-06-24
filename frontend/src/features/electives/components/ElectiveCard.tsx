import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownRenderer } from '@/shared/components/MarkdownRenderer';

interface ElectiveProps {
  id: string;
  title: string;
  elective_language: string;
  format: string;
  instructor: string;
  description: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const ElectiveCard = ({
                             id,
                             title,
                             elective_language,
                             format,
                             instructor,
                             description,
                             isFavorite,
                             onToggleFavorite,
                           }: ElectiveProps) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm py-3 px-4 border border-gray-200 dark:border-gray-700 relative">
      {/* Compact header: title + star */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-lg font-bold text-green-iu truncate">{title}</h3>
        <button
          onClick={() => onToggleFavorite(id)}
          className="shrink-0 text-green-iu hover:text-hover-green-iu dark:text-green-iu dark:hover:hover:text-dark-hover-green-iu"
          aria-label={t('elective.toggle_favorite')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      </div>

      {/* Metadata – single line, tiny & muted */}
      <div className="flex flex-wrap gap-6 text-base font-medium mb-3">
        {[
          { label: 'elective.language', value: elective_language, valueClass: 'text-green-iu' },
          { label: 'elective.format', value: format, valueClass: 'text-green-iu' },
          { label: 'elective.instructor', value: instructor, valueClass: 'text-gray-900 dark:text-gray-100' }
        ].map(({ label, value, valueClass }) => (
          <div key={label} className="flex gap-2">
            <span className="font-bold text-gray-700 dark:text-gray-300">{t(label)}:</span>
            <span className={`font-bold ${valueClass}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Description area with absolute “more” button */}
      <div className="relative">
        {/* The description container */}
        <div
          className={`text-base font-medium text-gray-600 dark:text-gray-300 ${
            expanded ? '' : 'overflow-hidden'
          }`}
          style={expanded ? undefined : { maxHeight: '3rem', overflow: 'hidden' }}
        >
          <MarkdownRenderer content={description} />
        </div>

        {/* “See more” button overlays the end of the second line */}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 pl-2 pb-0.5 font-medium text-green-iu hover:text-hover-green-iu dark:text-green-iu dark:hover:hover:text-dark-hover-green-iu leading-tight"
            aria-expanded={false}
          >
            …{t('elective.see_more')}
          </button>
        )}
      </div>

      {/* “See less” when expanded */}
      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="font-medium  text-green-iu hover:text-hover-green-iu dark:text-green-iu dark:hover:hover:text-dark-hover-green-iu"
        >
          {t('elective.see_less')}
        </button>
      )}
    </div>
  );
};