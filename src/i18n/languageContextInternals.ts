import { createContext } from 'react';
import type { Locale, MessageKey } from './messages';

export interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, params?: Record<string, string>) => string;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);
