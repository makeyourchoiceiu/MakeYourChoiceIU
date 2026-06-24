import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { Sidebar } from '@/shared/layouts/Sidebar';
import { useFavorites } from '@/features/electives/hooks/useFavourites';
import { useElectiveFilterStore } from '@/stores/electiveFilterStore';
import { useSyncElectiveFilters } from '@/hooks/useSyncElectiveFilters';
import { useFilteredElectives } from '@/features/electives/hooks/useFilteredElectives';
import { SearchFilterToolbar } from '@/features/electives/components/SearchFilterToolbar';
import { ElectiveList } from '@/features/electives/components/ElectiveList';
import { fetchElectives } from '@/shared/api/electives';
import { useElectiveSubmission } from '@/shared/hooks/useElectiveSubmission';
import type { Elective } from "@/shared/types/elective";
import { useTranslation } from 'react-i18next';

export function ElectivesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [electives, setElectives] = useState<Elective[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { typeFilter, setTypeFilter } = useElectiveFilterStore();

  useSyncElectiveFilters();

  // Determine which electives to show:
  // - For students: use availableElectives from the session (filtered by the backend)
  // - For admins: use the full list fetched from the API
  const sidebarElectives = session?.effectiveMode === 'student'
    ? (session?.availableElectives ?? [])
    : electives;

  // Apply search and filters (language, format, type) to the correct list
  const filteredElectives = useFilteredElectives(sidebarElectives);

  const studentId = session?.user?.id;
  const iterationId = session?.iterationId;

  const { submit, isLoading: submitting } = useElectiveSubmission({
    studentId: studentId ?? '0',
    iterationId: iterationId ?? 0,
  });

  const handleSidebarSelect = (type: 'main_menu' | 'tech' | 'hum' | 'math') => {
    if (type === 'main_menu') {
      navigate('/menu');
    } else {
      setTypeFilter(type);
    }
  };

  const handleSidebarSubmit = async (selectedIds: string[], type: string) => {
    if (!studentId || !iterationId) {
      throw new Error(t('sidebar.toast.missingInfo'));
    }
    await submit(selectedIds, type);
  };

  // Fetch electives for admin mode (only needed when not in student mode)
  useEffect(() => {
    // If we are in student mode, we already have the electives from the session,
    // so we don't need to fetch them separately. For admin mode, we still fetch.
    if (session?.effectiveMode === 'student') {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const loadElectives = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchElectives({ status: 1 });
        if (isMounted) {
          setElectives(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch electives'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadElectives();
    return () => { isMounted = false; };
  }, [session?.effectiveMode]);

  const deadlineFormatted = session?.deadline
    ? new Date(session.deadline).toLocaleString()
    : t('sidebar.deadlineDefault');

  const activeTypeForSidebar = typeFilter !== 'all' ? typeFilter : 'tech';

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center text-gray-600 dark:text-gray-300">
          <div className="mb-4">Loading electives...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-iu mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center text-red-600 dark:text-red-400">
          <div className="text-xl mb-4">Something went wrong</div>
          <div>{error.message}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-iu text-white rounded hover:bg-hover-green-iu"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar
        deadline={deadlineFormatted}
        activeType={activeTypeForSidebar}
        onSelectType={handleSidebarSelect}
        electives={sidebarElectives}
        onSubmitSelected={handleSidebarSubmit}
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
}