import React, { createContext, useContext, useState } from 'react';
import { LANGUAGES, TRANSLATIONS } from '../translations/languages';

const LanguageContext = createContext();

const STORAGE_KEY = 'aayusetu_selected_language';

// Reverse lookup maps to allow direct English string translations as well as key lookups
const EN_MAP = {};
const EN_MAP_LOWER = {};
const normalizeStr = (s) => (typeof s === 'string' ? s.toLowerCase().replace(/[:\.\,\-\(\)\/\•]/g, ' ').replace(/\s+/g, ' ').trim() : '');

if (TRANSLATIONS && TRANSLATIONS.en) {
  for (const [key, val] of Object.entries(TRANSLATIONS.en)) {
    if (typeof val === 'string') {
      EN_MAP[val] = key;
      EN_MAP_LOWER[val.toLowerCase().trim()] = key;
      const norm = normalizeStr(val);
      if (norm && !EN_MAP_LOWER[norm]) {
        EN_MAP_LOWER[norm] = key;
      }
    }
  }
}

// Common aliases for standalone words
const COMMON_ALIASES = {
  'doctor': 'doctorRole',
  'patient': 'patientRole',
  'asha': 'ashaRole',
  'staff': 'staffRole',
  'admin': 'adminRole',
  'government': 'govtRole',
  'teleconsult': 'teleconsultation',
  'emergency': 'emergency',
  'cancel': 'cancel',
  'confirm': 'confirm',
  'save': 'saveRegistration',
  'age': 'age',
  'years': 'years',
  'mins': 'mins',
  'minutes': 'mins',
  'symptoms': 'symptoms',
  'diagnosis': 'diagnosis',
  'available': 'available',
  'busy': 'busy',
  'on call': 'onCall',
  'off duty': 'offDuty',
  'high risk': 'highRisk',
  'medium risk': 'mediumRisk',
  'low risk': 'lowRisk'
};

for (const [alias, targetKey] of Object.entries(COMMON_ALIASES)) {
  if (!EN_MAP_LOWER[alias]) {
    EN_MAP_LOWER[alias] = targetKey;
  }
}

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGUAGES.some(l => l.code === saved)) return saved;
    } catch (e) {}
    return 'en';
  });

  const setLanguage = (code) => {
    if (LANGUAGES.some(l => l.code === code)) {
      setCurrentLang(code);
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch (e) {}
    }
  };

  const t = (key) => {
    if (!key) return '';
    const langDict = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];
    
    // 1. Direct translation key lookup (e.g. t('appTitle'))
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    
    // 2. English phrase reverse lookup (exact, lower, and normalized)
    if (typeof key === 'string') {
      const trimmed = key.trim();
      const lower = trimmed.toLowerCase();
      const norm = normalizeStr(trimmed);
      const mappedKey = EN_MAP[key] || EN_MAP[trimmed] || EN_MAP_LOWER[lower] || EN_MAP_LOWER[norm];
      if (mappedKey && langDict && langDict[mappedKey] !== undefined) {
        return langDict[mappedKey];
      }
    }
    
    // 3. Fallback to English dictionary
    if (TRANSLATIONS.en && TRANSLATIONS.en[key] !== undefined) {
      return TRANSLATIONS.en[key];
    }
    
    return key;
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
