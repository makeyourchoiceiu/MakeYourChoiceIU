import { useTheme } from '../contexts/ThemeContext';
import { SunIcon } from './icons'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const label = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-200 dark:bg-gray-700 text-yellow-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
      aria-label={label}
    >
      <SunIcon />
    </button>
  );
};

export default ThemeToggle;