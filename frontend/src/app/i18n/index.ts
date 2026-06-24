import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation JSONs
import enTranslation from './locales/en.json';
import ruTranslation from './locales/ru.json';
import {TranslationResources} from "./resources";

// All translations for all languages
const resources = {
  en: {
    translation: enTranslation,
  },
  ru: {
    translation: ruTranslation,
  },
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en',  // Use 'en' if the detected language is not available
    debug: process.env.NODE_ENV === 'development', // Enable debug logs in development

    interpolation: {
      escapeValue: false,
    },
    // react-i18next specific options
    react: {
      useSuspense: false, // Prevents suspense fallback on initial load
    },
  });

declare module 'react-i18next' {
  interface CustomTypeOptions {
    // Your base resources object type
    resources: {
      translation: TranslationResources;
    };
  }
}

export default i18n;