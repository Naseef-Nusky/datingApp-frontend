import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

// Only English is bundled; other languages loaded from API (Google Cloud Translate) when user selects them
const resources = {
  en: { translation: en },
  'en-uk': { translation: { ...en } },
};

const savedLang = typeof window !== 'undefined' ? localStorage.getItem('app_language') : null;
const initialLang = savedLang && (savedLang === 'en' || savedLang === 'en-uk' || ['es', 'de', 'fr'].includes(savedLang)) ? savedLang : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: initialLang,
  fallbackLng: 'en',
  supportedLngs: ['en', 'en-uk', 'es', 'de', 'fr'],
  interpolation: {
    escapeValue: false,
  },
  react: { useSuspense: false },
});

export default i18n;
