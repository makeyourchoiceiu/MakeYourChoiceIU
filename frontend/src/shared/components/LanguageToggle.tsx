import { useTranslation } from 'react-i18next';

const LanguageToggle = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const targetLang = currentLang === 'ru' ? 'en' : 'ru';
  const buttonLabel = (targetLang === 'ru' ? 'en' : 'ru').toUpperCase();

  const changeLanguage = () => i18n.changeLanguage(targetLang);

  return (
    <div className={`flex space-x-2 ${className || ''}`}>
      <button
        onClick={changeLanguage}
        className="px-2 py-1 rounded bg-white dark:bg-gray-800 text-green-iu border-2 border-solid border-green-iu"
      >
        {buttonLabel}
      </button>
    </div>
  );
};

export default LanguageToggle;