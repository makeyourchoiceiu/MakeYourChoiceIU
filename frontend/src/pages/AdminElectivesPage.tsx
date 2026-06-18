import { useAuth } from '@/shared/hooks/useAuth';
import { ElectiveList } from '@/features/electives/components/ElectiveList';
import { Navigate } from 'react-router-dom';

export function AdminElectivesPage() {
  const { session, isAdminMode } = useAuth();

  // Protect the route
  if (!isAdminMode) {
    return <Navigate to="/student" />;
  }

  const electives = session?.allElectives ?? [];

  return (
    <div className="min-h-screen text-base font-medium  bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
      <h1>Admin Electives Page</h1>
      <ElectiveList electives={electives} isFavorite={() => false} onToggleFavorite={() => {}} />
    </div>
  );
}