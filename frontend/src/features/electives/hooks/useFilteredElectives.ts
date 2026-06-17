import {useMemo} from 'react';
import {useDebounce} from '@/hooks/useDebounce';
import {Elective} from '@/shared/types/elective';
import {useElectiveFilterStore} from '@/stores/electiveFilterStore';

export const useFilteredElectives = (allElectives: Elective[]) => {
  const { searchTerm, languageFilter, formatFilter, typeFilter } = useElectiveFilterStore();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Apply search & filters
  return useMemo(() => {
    return allElectives.filter((elective) => {
      const matchesSearch =
        debouncedSearchTerm === '' || elective.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesLanguage = languageFilter === 'all' || elective.elective_language === languageFilter;
      const matchesFormat = formatFilter === 'all' || elective.format === formatFilter;
      const matchesType = typeFilter === 'all' || elective.type === typeFilter;
      return matchesSearch && matchesLanguage && matchesFormat && matchesType;
    });
  }, [allElectives, debouncedSearchTerm, languageFilter, formatFilter, typeFilter]);
};