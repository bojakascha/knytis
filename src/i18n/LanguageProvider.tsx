import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { LanguageContext } from './languageContextInternals';
import type { Locale, MessageKey } from './messages';
import { messagesByLocale } from './messages';

const STORAGE_KEY = 'knytis.locale';

function readStoredLocale(): Locale {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'en' || raw === 'sv') return raw;
  } catch {
    /* ignore */
  }
  return 'sv';
}

function interpolate(template: string, params?: Record<string, string>): string {
  if (!params) return template;
  let out = template;
  for (const [key, value] of Object.entries(params)) {
    out = out.replaceAll(`{{${key}}}`, value);
  }
  return out;
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: MessageKey, params?: Record<string, string>) => {
      const template = messagesByLocale[locale][key] ?? messagesByLocale.en[key] ?? key;
      return interpolate(template, params);
    },
    [locale],
  );

  useEffect(() => {
    document.documentElement.lang = locale === 'sv' ? 'sv' : 'en';
    const desc = messagesByLocale[locale]['meta.description'];
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', desc);
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
