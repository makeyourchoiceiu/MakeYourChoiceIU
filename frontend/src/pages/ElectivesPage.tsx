import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/shared/layouts/Sidebar';
import { generateMockElectives } from '@/shared/lib/mockApi';
import { useFavorites } from '@/features/electives/hooks/useFavourites';
import { useElectiveFilterStore } from '@/stores/electiveFilterStore';
import { useSyncElectiveFilters } from '@/hooks/useSyncElectiveFilters';
import { useFilteredElectives } from '@/features/electives/hooks/useFilteredElectives';
import { SearchFilterToolbar } from '@/features/electives/components/SearchFilterToolbar';
import { ElectiveList } from '@/features/electives/components/ElectiveList';
import { Elective } from '@/shared/types/elective';

const ElectivesPage = () => {
  const navigate = useNavigate();
  const [allElectives, setAllElectives] = useState<Elective[]>(generateMockElectives(20));
  const [deadline, setDeadline] = useState('August 28, 23:59');
  const { toggleFavorite, isFavorite } = useFavorites();
  const { typeFilter, setTypeFilter } = useElectiveFilterStore();

  // Sync filters with URL
  useSyncElectiveFilters();

  // Filtered electives based on student & filter store
  const filteredElectives = useFilteredElectives(allElectives);

  // Sidebar navigation
  const handleSidebarSelect = (type: 'main_menu' | 'tech' | 'hum' | 'math') => {
    if (type === 'main_menu') {
      navigate('/');
    } else {
      setTypeFilter(type);
    }
  };

  // Fetch real data (mock for now)
  useEffect(() => {
    // fetchElectives().then(setAllElectives);
    // fetchDeadline().then(setDeadline);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar
        deadline={deadline}
        activeType={typeFilter}
        onSelectType={handleSidebarSelect}
      />

      <div className="flex-1 p-3 max-w-5xl">
        <SearchFilterToolbar />
        <ElectiveList
          electives={filteredElectives}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
      </div>
    </div>
  );
};

export default ElectivesPage;