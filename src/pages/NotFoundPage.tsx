import { Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { useI18n } from '../i18n/useI18n';

export function NotFoundPage() {
  const { t } = useI18n();
  return (
    <AppShell
      title={t('notFound.title')}
      subtitle={t('notFound.subtitle')}
    >
      <section className="panel">
        <Link className="button-link secondary-link" to="/">
          {t('notFound.returnHome')}
        </Link>
      </section>
    </AppShell>
  );
}
