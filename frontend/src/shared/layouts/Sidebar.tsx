import { useTranslation } from 'react-i18next';
import LanguageToggle from '@/shared/components/LanguageToggle';

export const Sidebar = ({ deadline }: { deadline: string }) => {
  const { t } = useTranslation();

  return (
    <div className="w-64 h-screen sticky top-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-4 overflow-y-auto">
      {/* Logo */}
      <div className="text-3xl font-bold text-green-iu">IU</div>
      <hr className="border-t-2 border-green-iu -mx-5" />
      <nav className="space-y-3 text-bold font-medium">
        <div className="font-bold text-gray-800 dark:text-gray-200">{t('nav.main_menu')}</div>
        <div className="font-bold text-green-iu cursor-pointer">{t('nav.humanitarian')}</div>
        <div className="font-bold text-green-iu cursor-pointer">{t('nav.technical')}</div>
      </nav>


      {/* Form */}
      <div className="mt-auto">
        <div className="flex items-center justify-between gap-2 mb-4">
          {/* Deadline */}
          <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded flex flex-col gap-1 relative">
            <div className="text-red-600 dark:text-red-400 font-bold text-sm text-center">{t('sidebar.deadline')}:</div>
            <div className="text-red-600 dark:text-red-400 font-bold text-sm text-center">{deadline}</div>
            {/*<div className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-iu text-white text-xs font-bold px-2 py-0.5 rounded">EN</div>*/}
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
          <button className="bg-green-iu hover:bg-green-iu text-white font-bold py-1.5 px-4 rounded text-sm flex-1 shadow-md">
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