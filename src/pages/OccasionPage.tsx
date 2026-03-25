import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { InviteModal } from '../components/InviteModal';
import { useI18n } from '../i18n/useI18n';
import {
  addItemToOccasion,
  updateItemInOccasion,
  deleteItemFromOccasion,
  joinOccasion,
  subscribeToOccasion,
  getViewerName,
} from '../features/occasion/services/occasionRepository';
import { ContributionTable } from '../features/items/components/ContributionTable';
import { AddParticipant } from '../features/participants/components/AddParticipant';
import type { Occasion, OccasionView } from '../types/models';

function formatDateTime(occasion: Occasion): string | undefined {
  const parts: string[] = [];

  if (occasion.date) {
    const d = new Date(occasion.date + 'T00:00');
    parts.push(d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }));
  }

  if (occasion.time) {
    const [h, m] = occasion.time.split(':');
    const d = new Date();
    d.setHours(Number(h), Number(m));
    parts.push(d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }));
  }

  return parts.length > 0 ? parts.join(' at ') : undefined;
}

export function OccasionPage() {
  const { t } = useI18n();
  const { code = '' } = useParams();
  const normalizedCode = code.toUpperCase();
  const [occasionView, setOccasionView] = useState<OccasionView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const viewerName = useMemo(() => getViewerName(normalizedCode), [normalizedCode]);

  useEffect(() => {
    setIsLoading(true);

    const unsubscribe = subscribeToOccasion(normalizedCode, (nextOccasionView) => {
      setOccasionView(nextOccasionView);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [normalizedCode]);

  const handleCloseInvite = useCallback(() => setInviteOpen(false), []);

  if (isLoading) {
    return (
      <AppShell title={t('common.loading')}>
        <section className="panel panel-wide">
          <p className="muted">{t('common.oneMoment')}</p>
        </section>
      </AppShell>
    );
  }

  if (!occasionView) {
    return (
      <AppShell title={t('common.notFound')}>
        <section className="panel panel-wide">
          <p className="muted">{t('join.noOccasionForCode')}</p>
          <Link className="button-link secondary-link" to="/join">
            {t('common.tryAnotherCode')}
          </Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={occasionView.occasion.title}
      subtitle={formatDateTime(occasionView.occasion)}
      aside={
        <button
          type="button"
          className="invite-btn"
          onClick={() => setInviteOpen(true)}
          title={t('occasion.inviteAria')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      }
    >
      <ContributionTable
        items={occasionView.items}
        participants={occasionView.participants}
        defaultParticipantName={viewerName}
        isSaving={isSavingItem}
        onSubmit={async (values) => {
          try {
            setIsSavingItem(true);
            await addItemToOccasion(normalizedCode, values);
          } finally {
            setIsSavingItem(false);
          }
        }}
        onUpdate={(itemId, updates) => updateItemInOccasion(normalizedCode, itemId, updates)}
        onDelete={(itemId) => deleteItemFromOccasion(normalizedCode, itemId)}
      />
      <AddParticipant
        onAdd={async (name) => {
          await joinOccasion(normalizedCode, name);
        }}
      />
      <InviteModal
        code={normalizedCode}
        open={inviteOpen}
        onClose={handleCloseInvite}
      />
    </AppShell>
  );
}
