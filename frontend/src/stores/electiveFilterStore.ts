import { create } from 'zustand';

export type LanguageFilter = 'all' | 'English' | 'Russian';
export type FormatFilter = 'all' | 'online' | 'offline';
export type TypeFilter = 'all' | 'tech' | 'hum' | 'math';

interface ElectiveFilterState {
  searchTerm: string;
  languageFilter: LanguageFilter;
  formatFilter: FormatFilter;
  typeFilter: TypeFilter;

  // Actions
  setSearchTerm: (term: string) => void;
  setLanguageFilter: (filter: LanguageFilter) => void;
  setFormatFilter: (filter: FormatFilter) => void;
  setTypeFilter: (filter: TypeFilter) => void;
  clearFilters: () => void;

  // Batch update (for URL sync)
  batchUpdate: (updates: Partial<Omit<ElectiveFilterState, 'batchUpdate' | 'setSearchTerm' | 'setLanguageFilter' | 'setFormatFilter' | 'setTypeFilter' | 'clearFilters'>>) => void;
}

export const useElectiveFilterStore = create<ElectiveFilterState>((set) => ({
  searchTerm: '',
  languageFilter: 'all',
  formatFilter: 'all',
  typeFilter: 'tech',

  setSearchTerm: (term) => set({ searchTerm: term }),
  setLanguageFilter: (filter) => set({ languageFilter: filter }),
  setFormatFilter: (filter) => set({ formatFilter: filter }),
  setTypeFilter: (filter) => set({ typeFilter: filter }),
  clearFilters: () =>
    set({
      searchTerm: '',
      languageFilter: 'all',
      formatFilter: 'all',
      typeFilter: 'tech',
    }),
  batchUpdate: (updates) => set((state) => ({ ...state, ...updates })),
}));