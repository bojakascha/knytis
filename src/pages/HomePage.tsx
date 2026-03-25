import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { createOccasion } from '../features/occasion/services/occasionRepository';
import { useI18n } from '../i18n/useI18n';

export function HomePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [hostName, setHostName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hostName.trim() || isSubmitting) {
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      const occasion = await createOccasion({
        title: title || t('home.untitledOccasion'),
        hostName,
        date: date || undefined,
        time: time || undefined,
      });
      navigate(`/occasion/${occasion.occasion.code}`);
    } catch {
      setError(t('home.createError'));
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell title="Knytis">
      <section className="panel panel-wide">
        <h2>{t('home.createHeading')}</h2>
        <form className="form-grid" onSubmit={handleCreate}>
          <label>
            <span>{t('home.occasionLabel')}</span>
            <input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setError('');
              }}
              placeholder={t('home.occasionPlaceholder')}
            />
          </label>
          <div className="form-row-half">
            <label>
              <span>{t('home.dateOptional')}</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
            <label>
              <span>{t('home.timeOptional')}</span>
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
            </label>
          </div>
          <label>
            <span>{t('home.yourName')}</span>
            <input
              value={hostName}
              onChange={(event) => {
                setHostName(event.target.value);
                setError('');
              }}
              placeholder={t('home.namePlaceholder')}
            />
          </label>
          <button type="submit">{isSubmitting ? t('home.creating') : t('home.create')}</button>
        </form>
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <section className="panel panel-wide">
        <h2>{t('home.joinHeading')}</h2>
        <div className="join-row">
          <input
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
            placeholder={t('home.joinPlaceholder')}
          />
          <Link className="button-link" to={`/join?code=${joinCode}`}>
            {t('home.join')}
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
