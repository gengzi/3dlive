import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_LANGUAGE } from './constants';

const LanguageContext = createContext(undefined);

// Store translations in a mutable object outside the component to avoid re-fetching on every render
const translations = {
  en: {},
  zh: {},
};

// Function to load translations from JSON files
const loadTranslations = async (lang) => {
  if (translations[lang] && Object.keys(translations[lang]).length > 0) {
    // Translations already loaded
    return;
  }
  try {
    const response = await fetch(`/locales/${lang}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${lang} translations`);
    }
    translations[lang] = await response.json();
  } catch (error) {
    console.error(`Error loading translations for ${lang}:`, error);
    // Fallback to default language or empty if loading fails
    translations[lang] = {};
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(DEFAULT_LANGUAGE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize language from localStorage or default
  useEffect(() => {
    const savedLang = localStorage.getItem('appLang');
    const initialLang = savedLang && (savedLang === 'en' || savedLang === 'zh') ? savedLang : DEFAULT_LANGUAGE;
    setLangState(initialLang);
  }, []);

  // Load translations when the language changes
  useEffect(() => {
    setIsLoaded(false); // Set loading state
    loadTranslations(lang).then(() => {
      setIsLoaded(true); // Translations loaded
    });
  }, [lang]);

  // Function to change language and save to localStorage
  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    localStorage.setItem('appLang', newLang);
  }, []);

  // Translation function
  const t = useCallback((key) => {
    if (!isLoaded) {
      // Return key itself or a fallback if translations aren't loaded yet
      return key;
    }
    return translations[lang]?.[key] || key;
  }, [lang, isLoaded]);

  const contextValue = {
    lang,
    setLang,
    t,
  };

  if (!isLoaded) {
    // Optionally render a loading spinner or null while translations load
    return React.createElement(
      'div',
      { className: "flex items-center justify-center w-full h-screen text-sketch-black" },
      'Loading...'
    );
  }

  return React.createElement(
    LanguageContext.Provider,
    { value: contextValue },
    children
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};