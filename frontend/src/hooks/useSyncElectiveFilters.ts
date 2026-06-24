import { useEffect } from 'react';
import { useElectiveFilterStore, LanguageFilter, FormatFilter, TypeFilter } from '@/stores/electiveFilterStore';

export function useSyncElectiveFilters() {
  const { searchTerm, languageFilter, formatFilter, typeFilter, batchUpdate } = useElectiveFilterStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search') || '';
    const language = (params.get('language') as LanguageFilter) || 'all';
    const format = (params.get('format') as FormatFilter) || 'all';
    const type = (params.get('type') as TypeFilter) || 'tech';
    const validTypes: TypeFilter[] = ['tech', 'hum', 'math'];
    const safeType = validTypes.includes(type) ? type : 'tech';
    batchUpdate({
      searchTerm: search,
      languageFilter: language,
      formatFilter: format,
      typeFilter: safeType,
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (languageFilter !== 'all') params.set('language', languageFilter);
    if (formatFilter !== 'all') params.set('format', formatFilter);
    if (typeFilter !== 'tech') params.set('type', typeFilter);

    const queryString = params.toString();
    const newUrl = `${window.location.pathname}${queryString ? '?' + queryString : ''}`;
    window.history.replaceState(null, '', newUrl);
  }, [searchTerm, languageFilter, formatFilter, typeFilter]);
}