import React, { createContext, useContext, useState, useEffect } from 'react';

// Translation files
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';

const translations = {
  en: enTranslations,
  es: esTranslations
};

const TranslationContext = createContext();

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export const TranslationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get saved language from localStorage or default to 'es' (Spanish)
    return localStorage.getItem('jetchance-language') || 'es';
  });

  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('jetchance-language', currentLanguage);
  }, [currentLanguage]);
  useEffect(() => {
    localStorage.setItem('jetchance-language', currentLanguage);
  }, [currentLanguage]);

  const t = (key, defaultValue = key) => {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found in current language
        value = translations['en'];
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return defaultValue;
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : defaultValue;
  };

  const changeLanguage = (languageCode) => {
    if (translations[languageCode]) {
      setCurrentLanguage(languageCode);
    }
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: Object.keys(translations)
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};
