import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import en from '../i18n/en.json';
import fr from '../i18n/fr.json';

type Locale = 'en' | 'fr';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

function translate(key: string, locale: Locale, params?: Record<string, string>): string {
  const translations = locale === 'en' ? en : fr;
  const value = getNestedValue(translations as Record<string, unknown>, key);
  if (value === undefined) return key;

  let result = value;
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      result = result.replace(`{{${paramKey}}}`, paramValue);
    }
  }
  return result;
}

interface LocaleProviderProps {
  children: ReactNode;
}

export const LocaleProvider = ({ children }: LocaleProviderProps) => {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('locale');
    if (saved === 'en' || saved === 'fr') return saved;
    return navigator.language.startsWith('fr') ? 'fr' : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem('locale', locale);
  }, [locale]);

  const t = useCallback((key: string, params?: Record<string, string>) => translate(key, locale, params), [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within a LocaleProvider');
  return context;
};
