import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useElectiveFilterStore, LanguageFilter, FormatFilter, TypeFilter } from '@/stores/electiveFilterStore';

// Map URL param names to store keys and validation functions
const paramMapping = {
  q: { storeKey: 'searchTerm', validate: (v: string) => v },
  lang: { storeKey: 'languageFilter', validate: (v: string): LanguageFilter =>
      v === 'English' || v === 'Russian' ? v : 'all'
  },
  format: { storeKey: 'formatFilter', validate: (v: string): FormatFilter =>
      v === 'online' || v === 'offline' ? v : 'all'
  },
  type: { storeKey: 'typeFilter', validate: (v: string): TypeFilter =>
      v === 'tech' || v === 'hum' || v === 'math' ? v : 'all'
  },
};

export const useSyncElectiveFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { batchUpdate, ...storeValues } = useElectiveFilterStore();
  const isInitialMount = useRef(true);
  const isUpdatingFromURL = useRef(false);

  // 1. On mount: read URL params and set store
  useEffect(() => {
    const updates: any = {};
    for (const [param, { storeKey, validate }] of Object.entries(paramMapping)) {
      const value = searchParams.get(param);
      if (value !== null) {
        updates[storeKey] = validate(value);
      }
    }
    if (Object.keys(updates).length > 0) {
      batchUpdate(updates);
    }
    isInitialMount.current = false;
  }, []); // run only once on mount

  // 2. Whenever store changes (after mount), update URL
  useEffect(() => {
    if (isInitialMount.current || isUpdatingFromURL.current) return;

    const newParams = new URLSearchParams(searchParams);

    // Search term (q)
    if (storeValues.searchTerm) {
      newParams.set('q', storeValues.searchTerm);
    } else {
      newParams.delete('q');
    }

    // Language (lang)
    if (storeValues.languageFilter !== 'all') {
      newParams.set('lang', storeValues.languageFilter);
    } else {
      newParams.delete('lang');
    }

    // Format
    if (storeValues.formatFilter !== 'all') {
      newParams.set('format', storeValues.formatFilter);
    } else {
      newParams.delete('format');
    }

    // Type
    if (storeValues.typeFilter !== 'all') {
      newParams.set('type', storeValues.typeFilter);
    } else {
      newParams.delete('type');
    }

    // Avoid unnecessary updates if params haven't changed
    const currentParamsStr = searchParams.toString();
    const newParamsStr = newParams.toString();
    if (currentParamsStr !== newParamsStr) {
      setSearchParams(newParams, { replace: true });
    }
  }, [
    storeValues.searchTerm,
    storeValues.languageFilter,
    storeValues.formatFilter,
    storeValues.typeFilter,
    searchParams,
    setSearchParams,
  ]);
};