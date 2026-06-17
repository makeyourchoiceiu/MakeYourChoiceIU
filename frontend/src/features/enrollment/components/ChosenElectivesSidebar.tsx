import { useTranslation } from 'react-i18next';
import { useEnrolledElectives } from '../hooks/useEnrolledElectives';

export const ChosenElectivesSidebar = () => {
  const { t } = useTranslation();
  const { data: enrolledElectives, isLoading } = useEnrolledElectives();

  if (isLoading) return <div className="p-4">{t('common.loading')}</div>;

  return (
    <aside className="w-64 bg-gray-100 p-4 border-l">
      <h3 className="font-bold text-lg mb-2">{t('common.my_electives')}</h3>
      <ul>
        {enrolledElectives?.map((elective) => (
          <li key={elective.id}>{elective.name}</li>
        ))}
      </ul>
    </aside>
  );
};