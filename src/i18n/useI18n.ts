import { useContext } from 'react';
import { LanguageContext, type LanguageContextValue } from './languageContextInternals';

export function useI18n(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useI18n must be used within LanguageProvider');
  }
  return ctx;
}
