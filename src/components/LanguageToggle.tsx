import { useI18n } from '../i18n/useI18n';
import type { Locale } from '../i18n/messages';

function FlagSweden({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 10"
      aria-hidden
      focusable="false"
    >
      <rect width="16" height="10" fill="#006AA7" />
      <rect x="5" width="2.5" height="10" fill="#FECC00" />
      <rect y="3.75" width="16" height="2.5" fill="#FECC00" />
    </svg>
  );
}

function FlagUk({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 60 30"
      aria-hidden
      focusable="false"
    >
      <rect width="60" height="30" fill="#012169" />
      <path stroke="#FFF" strokeWidth="6" d="M0 0l60 30M60 0L0 30" />
      <path stroke="#C8102E" strokeWidth="4" d="M0 0l60 30M60 0L0 30" />
      <path stroke="#FFF" strokeWidth="10" d="M30 0v30M0 15h60" />
      <path stroke="#C8102E" strokeWidth="6" d="M30 0v30M0 15h60" />
    </svg>
  );
}

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  const select = (next: Locale) => {
    if (next !== locale) setLocale(next);
  };

  return (
    <div className="language-toggle" role="group" aria-label={t('language.switchLabel')}>
      <button
        type="button"
        className={`lang-btn${locale === 'sv' ? ' lang-btn-active' : ''}`}
        onClick={() => select('sv')}
        aria-pressed={locale === 'sv'}
        aria-label={t('language.ariaSv')}
      >
        <FlagSweden className="lang-flag" />
      </button>
      <button
        type="button"
        className={`lang-btn${locale === 'en' ? ' lang-btn-active' : ''}`}
        onClick={() => select('en')}
        aria-pressed={locale === 'en'}
        aria-label={t('language.ariaEn')}
      >
        <FlagUk className="lang-flag" />
      </button>
    </div>
  );
}
