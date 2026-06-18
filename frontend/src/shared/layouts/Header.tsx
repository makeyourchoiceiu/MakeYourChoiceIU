import { useAuth } from '@/shared/hooks/useAuth';
import LanguageToggle from '@/shared/components/LanguageToggle';
import ThemeToggle from '@/shared/components/ThemeToggle';

export function Header() {
  const { session, logout, toggleMode, isAdminMode } = useAuth();

  if (!session) return null;

  const isAdminStudent = session.user.role === 'admin-student';

  return (
    <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Left: Logo */}
      <div className="text-3xl font-bold text-green-iu">IU</div>

      {/* Right: User info + actions */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {session.user.email}
        </span>

        {isAdminStudent && (
          <button
            onClick={toggleMode}
            className="text-sm font-bold text-green-iu hover:text-hover-green-iu dark:text-green-iu dark:hover:text-dark-hover-green-iu transition-colors"
          >
            Switch to {isAdminMode ? 'Student' : 'Admin'}
          </button>
        )}

        <LanguageToggle />
        <ThemeToggle />

        <button
          onClick={logout}
          className="text-sm font-bold text-green-iu hover:text-hover-green-iu dark:text-green-iu dark:hover:text-dark-hover-green-iu transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}