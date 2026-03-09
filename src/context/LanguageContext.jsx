import { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import i18n from '../i18n';

const LanguageContext = createContext(null);

const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English (US)' },
  { value: 'en-uk', label: 'English (UK)' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
];

export function LanguageProvider({ children }) {
  const { user } = useAuth();
  const [loadingLang, setLoadingLang] = useState(false);

  const changeLanguage = useCallback(async (lang) => {
    if (!SUPPORTED_LANGUAGES.some((l) => l.value === lang)) return;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    if (lang !== 'en' && lang !== 'en-uk') {
      if (!i18n.hasResourceBundle(lang, 'translation')) {
        setLoadingLang(true);
        try {
          const { data } = await axios.get(`${apiUrl}/api/translate/locale?target=${encodeURIComponent(lang)}`);
          i18n.addResourceBundle(lang, 'translation', data);
        } catch (err) {
          console.warn('Could not load translation, using English:', err?.message);
          lang = 'en';
        } finally {
          setLoadingLang(false);
        }
      }
    }
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem('app_language', lang);
    } catch (e) {}
    if (user) {
      try {
        await axios.put(`${apiUrl}/api/settings`, { language: lang });
      } catch (err) {
        console.warn('Could not save language to server:', err?.message);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const loadSavedLanguage = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const { data } = await axios.get(`${apiUrl}/api/settings`);
        const saved = data?.language;
        if (!saved || saved === i18n.language) return;
        if (saved !== 'en' && saved !== 'en-uk' && !i18n.hasResourceBundle(saved, 'translation')) {
          setLoadingLang(true);
          try {
            const locRes = await axios.get(`${apiUrl}/api/translate/locale?target=${encodeURIComponent(saved)}`);
            i18n.addResourceBundle(saved, 'translation', locRes.data);
          } catch (e) {
            return;
          } finally {
            setLoadingLang(false);
          }
        }
        i18n.changeLanguage(saved);
        try {
          localStorage.setItem('app_language', saved);
        } catch (e) {}
      } catch (err) {
        // use existing i18n.language (from localStorage or default)
      }
    };
    loadSavedLanguage();
  }, [user?.id]);

  const value = {
    language: i18n.language,
    changeLanguage,
    languages: SUPPORTED_LANGUAGES,
    loadingLang,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
