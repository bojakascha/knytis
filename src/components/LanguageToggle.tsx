import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/useI18n';
import type { Locale } from '../i18n/messages';

function FlagSweden({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 10" aria-hidden focusable="false">
      <rect width="16" height="10" fill="#006AA7" />
      <rect x="5" width="2.5" height="10" fill="#FECC00" />
      <rect y="3.75" width="16" height="2.5" fill="#FECC00" />
    </svg>
  );
}

function FlagUk({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 30" aria-hidden focusable="false">
      <rect width="60" height="30" fill="#012169" />
      <path stroke="#FFF" strokeWidth="6" d="M0 0l60 30M60 0L0 30" />
      <path stroke="#C8102E" strokeWidth="4" d="M0 0l60 30M60 0L0 30" />
      <path stroke="#FFF" strokeWidth="10" d="M30 0v30M0 15h60" />
      <path stroke="#C8102E" strokeWidth="6" d="M30 0v30M0 15h60" />
    </svg>
  );
}

const LOCALES: { id: Locale; Flag: typeof FlagSweden; label: string }[] = [
  { id: 'sv', Flag: FlagSweden, label: 'Svenska' },
  { id: 'en', Flag: FlagUk,     label: 'English'  },
];

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  const select = (next: Locale) => {
    setLocale(next);
    setOpen(false);
  };

  const active = LOCALES.find((l) => l.id === locale)!;

  return (
    <div className="lang-menu" ref={ref}>
      <button
        type="button"
        className="lang-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('language.switchLabel')}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <active.Flag className="lang-menu-flag" />
        <svg
          className={`lang-menu-chevron${open ? ' lang-menu-chevron-open' : ''}`}
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="lang-menu-dropdown" role="listbox" aria-label={t('language.switchLabel')}>
          {LOCALES.map(({ id, Flag, label }) => (
            <button
              key={id}
              type="button"
              role="option"
              aria-selected={locale === id}
              className={`lang-menu-item${locale === id ? ' lang-menu-item-active' : ''}`}
              onClick={() => select(id)}
            >
              <Flag className="lang-menu-item-flag" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
