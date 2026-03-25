import { useI18n } from '../../../i18n/useI18n';
import type { Participant } from '../../../types/models';

interface ParticipantListProps {
  participants: Participant[];
}

export function ParticipantList({ participants }: ParticipantListProps) {
  const { t } = useI18n();
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="section-label">{t('participant.sectionLabel')}</p>
          <h2>{t('participant.joined', { count: String(participants.length) })}</h2>
        </div>
      </div>
      <ul className="stack-list">
        {participants.map((participant) => (
          <li key={participant.id} className="list-row">
            <span>{participant.name}</span>
            <span className="muted">{t('participant.ready')}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
