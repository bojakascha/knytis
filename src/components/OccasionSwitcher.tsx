import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getKnownOccasions,
  getKnownOccasionsAsync,
  type KnownOccasion,
} from '../features/occasion/services/occasionRepository';
import { useI18n } from '../i18n/useI18n';

function formatMonth(isoDate: string): string {
  if (!isoDate) return '';
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

export function OccasionSwitcher() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { code } = useParams();
  const currentCode = code?.toUpperCase() ?? '';
  const [open, setOpen] = useState(false);
  const [occasions, setOccasions] = useState<KnownOccasion[]>(() => getKnownOccasions());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    // Resolve titles from Firebase if needed
    getKnownOccasionsAsync().then(setOccasions);

    const handleClick = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClick);
    return () => document.removeEventListener('pointerdown', handleClick);
  }, [open]);

  const hasMultiple = occasions.length >= 2;

  if (!hasMultiple) return null;

  const otherOccasions = occasions.filter((o) => o.code !== currentCode);

  return (
    <div className="switcher" ref={ref}>
      <button
        type="button"
        className={`switcher-chevron${open ? ' switcher-chevron-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        title={t('switcher.title')}
        aria-expanded={open}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open ? (
        <div className="switcher-dropdown">
          {otherOccasions.map((occ) => (
            <button
              key={occ.code}
              type="button"
              className="switcher-item"
              onClick={() => {
                setOpen(false);
                navigate(`/occasion/${occ.code}`);
              }}
            >
              <span className="switcher-item-title">{occ.title}</span>
              {occ.createdAt ? (
                <span className="switcher-item-date">{formatMonth(occ.createdAt)}</span>
              ) : null}
            </button>
          ))}
          <button
            type="button"
            className="switcher-item switcher-item-home"
            onClick={() => {
              setOpen(false);
              navigate('/');
            }}
          >
            {t('switcher.newOrJoin')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
