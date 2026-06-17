import { useTranslation } from 'react-i18next';
import { ElectiveCard } from './ElectiveCard';
import { Elective } from '@/shared/types/elective';

interface ElectiveListProps {
  electives: Elective[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

export const ElectiveList = ({ electives, isFavorite, onToggleFavorite }: ElectiveListProps) => {
  const { t } = useTranslation();

  if (electives.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-300">
        {t('elective_page.no_electives_found')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {electives.map((elective) => (
        <ElectiveCard
          key={elective.id}
          {...elective}
          isFavorite={isFavorite(elective.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};