import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        English
      </button>
      <button
        onClick={() => changeLanguage('ru')}
        className={`px-2 py-1 rounded ${i18n.language === 'ru' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        Русский
      </button>
    </div>
  );
};

export default LanguageSwitcher;