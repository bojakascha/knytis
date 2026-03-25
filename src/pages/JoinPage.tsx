import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { getOccasionByCode, joinOccasion } from '../features/occasion/services/occasionRepository';
import { useI18n } from '../i18n/useI18n';
import type { OccasionView } from '../types/models';

export function JoinPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const prefilledCode = searchParams.get('code') ?? '';
  const [code, setCode] = useState(prefilledCode.toUpperCase());
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [occasionPreview, setOccasionPreview] = useState<OccasionView | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [typingNew, setTypingNew] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    if (!code.trim()) {
      return () => {
        isCurrent = false;
      };
    }

    getOccasionByCode(code)
      .then((occasion) => {
        if (isCurrent) {
          setOccasionPreview(occasion);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setOccasionPreview(null);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [code]);

  const displayedPreview = code.trim() ? occasionPreview : null;
  const hasParticipants = (displayedPreview?.participants.length ?? 0) > 0;

  const handleJoin = async (joinName: string) => {
    if (!code.trim() || !joinName.trim() || isSubmitting) {
      setError(t('join.enterCodeAndName'));
      return;
    }

    try {
      setIsSubmitting(true);
      const joinedOccasion = await joinOccasion(code, joinName);

      if (!joinedOccasion) {
        setError(t('join.noOccasionFound'));
        setIsSubmitting(false);
        return;
      }

      navigate(`/occasion/${joinedOccasion.occasion.code}`);
    } catch {
      setError(t('join.couldNotJoin'));
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleJoin(name);
  };

  // No code entered yet, or code doesn't match an occasion
  if (!displayedPreview) {
    return (
      <AppShell title={t('join.title')}>
        <section className="panel panel-wide">
          <form className="form-grid" onSubmit={(e) => { e.preventDefault(); }}>
            <label>
              <span>{t('join.code')}</span>
              <input
                value={code}
                onChange={(event) => {
                  const next = event.target.value.toUpperCase();
                  setCode(next);
                  setError('');
                  if (!next.trim()) setOccasionPreview(null);
                }}
                placeholder={t('join.codePlaceholder')}
                autoFocus
              />
            </label>
          </form>
          {code.trim() && !displayedPreview ? (
            <p className="muted" style={{ marginTop: '0.75rem' }}>{t('join.noOccasionForCode')}</p>
          ) : null}
          {error ? <p className="error-text">{error}</p> : null}
          <Link className="button-link secondary-link" to="/" style={{ marginTop: '1rem', display: 'inline-block' }}>
            {t('common.back')}
          </Link>
        </section>
      </AppShell>
    );
  }

  // Code matches — show "I am..." picker
  return (
    <AppShell title={displayedPreview.occasion.title}>
      <section className="panel panel-wide">
        <p className="join-prompt">{t('join.iAm')}</p>

        {hasParticipants && !typingNew ? (
          <div className="name-chips">
            {displayedPreview.participants.map((p) => (
              <button
                key={p.id}
                type="button"
                className="name-chip"
                disabled={isSubmitting}
                onClick={() => handleJoin(p.name)}
              >
                {p.name}
              </button>
            ))}
            <button
              type="button"
              className="name-chip name-chip-new"
              onClick={() => setTypingNew(true)}
            >
              {t('join.someoneElse')}
            </button>
          </div>
        ) : (
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              <span>{t('home.yourName')}</span>
              <input
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError('');
                }}
                placeholder={t('home.namePlaceholder')}
                autoFocus
              />
            </label>
            <div className="join-form-actions">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('join.joining') : t('join.join')}
              </button>
              {hasParticipants ? (
                <button
                  type="button"
                  className="button-link secondary-link"
                  onClick={() => { setTypingNew(false); setName(''); }}
                >
                  {t('common.back')}
                </button>
              ) : null}
            </div>
          </form>
        )}

        {error ? <p className="error-text">{error}</p> : null}
      </section>
    </AppShell>
  );
}
