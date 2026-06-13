import { useTranslation } from 'react-i18next';
import LanguageToggle from '@/shared/components/LanguageToggle';

interface SidebarProps {
  deadline: string;
  activeType: 'main_menu' | 'tech' | 'hum' | 'math' | 'all';
  onSelectType: (type: 'main_menu' | 'tech' | 'hum' | 'math' | 'all') => void;
}

export const Sidebar = ({ deadline, activeType, onSelectType }: SidebarProps) => {
  const { t } = useTranslation();

  return (
    <div className="w-64 h-screen sticky top-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-4 overflow-y-auto">
      {/* Logo */}
      <div className="text-3xl font-bold text-green-iu">IU</div>
      <hr className="border-t-2 border-green-iu -mx-5" />
      <nav className="space-y-3 text-bold font-medium">
        {/*<div className="font-bold text-gray-800 dark:text-gray-200">{t('nav.main_menu')}</div>*/}
        <button
          onClick={() => onSelectType('main_menu')}
          className={`w-full text-left font-bold cursor-pointer transition-colors ${
            activeType === 'main_menu'
              ? 'text-gray-800 dark:text-gray-200'
              : 'text-green-iu hover:text-hover-green-iu dark:text-green-iu dark:hover:text-dark-hover-green-iu'
          }`}
        >
          {t('nav.main_menu')}
        </button>

        {/* Technical button - updates filter to 'tech' */}
        <button
          onClick={() => onSelectType('tech')}
          className={`w-full text-left font-bold cursor-pointer transition-colors ${
            activeType === 'tech'
              ? 'text-gray-800 dark:text-gray-200'
              : 'text-green-iu hover:text-hover-green-iu dark:text-green-iu dark:hover:text-dark-hover-green-iu'
          }`}
        >
          {t('nav.technical')}
        </button>

        {/* Humanitarian button - updates filter to 'hum' */}
        <button
          onClick={() => onSelectType('hum')}
          className={`w-full text-left font-bold cursor-pointer transition-colors ${
            activeType === 'hum'
              ? 'text-gray-800 dark:text-gray-200'
              : 'text-green-iu hover:text-hover-green-iu dark:text-green-iu dark:hover:text-dark-hover-green-iu'
          }`}
        >
          {t('nav.humanitarian')}
        </button>

        {/* Mathematical button - updates filter to 'math' */}
        <button
          onClick={() => onSelectType('math')}
          className={`w-full text-left font-bold cursor-pointer transition-colors ${
            activeType === 'math'
              ? 'text-gray-800 dark:text-gray-200'
              : 'text-green-iu hover:text-hover-green-iu dark:text-green-iu dark:hover:text-dark-hover-green-iu'
          }`}
        >
          {t('nav.mathematical')}
        </button>
      </nav>

      {/* Form */}
      <div className="mt-auto">
        <div className="flex items-center justify-between gap-2 mb-4">
          {/* Deadline */}
          <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded flex flex-col gap-1 relative">
            <div className="text-red-600 dark:text-red-400 font-bold text-sm text-center">{t('sidebar.deadline')}:</div>
            <div className="text-red-600 dark:text-red-400 font-bold text-sm text-center">{deadline}</div>
          </div>
          <LanguageToggle className="relative font-bold rounded" />
        </div>
        <h4 className="font-bold mb-2 border-b border-green-iu inline-block pb-1 text-sm text-gray-800 dark:text-gray-200">{t('sidebar.form')}</h4>
        <div className="space-y-2 mt-3">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="flex items-center gap-2">
              <span className="font-bold text-gray-700 dark:text-gray-300 text-xs w-4">{num}.</span>
              <input type="text" className="w-full bg-gray-200 dark:bg-gray-700 rounded-sm h-6 px-1 border-none outline-none" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button className="bg-green-iu hover:bg-hover-green-iu dark:bg-green-iu dark:hover:bg-dark-hover-green-iu text-white font-bold py-1.5 px-4 rounded text-sm flex-1 shadow-md">
            {t('sidebar.submit')}
          </button>
          <button className="bg-gray-400 hover:bg-gray-500 text-white p-1.5 rounded-full">
            {/* Reset Icon */}
          </button>
        </div>
      </div>
    </div>
  );
};