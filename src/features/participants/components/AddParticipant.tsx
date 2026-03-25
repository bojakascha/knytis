import { useState } from 'react';
import { useI18n } from '../../../i18n/useI18n';

interface AddParticipantProps {
  onAdd: (name: string) => Promise<void>;
}

export function AddParticipant({ onAdd }: AddParticipantProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;

    setSaving(true);
    await onAdd(name.trim());
    setName('');
    setSaving(false);
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        className="add-person-toggle"
        onClick={() => setOpen(true)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
        {t('addPerson.toggle')}
      </button>
    );
  }

  return (
    <form className="add-person-form" onSubmit={handleSubmit}>
      <input
        className="add-person-input"
        placeholder={t('addPerson.namePlaceholder')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <button type="submit" className="add-person-btn" disabled={saving}>
        {saving ? t('contrib.adding') : t('addPerson.add')}
      </button>
      <button
        type="button"
        className="add-person-cancel"
        onClick={() => { setOpen(false); setName(''); }}
      >
        {t('addPerson.cancel')}
      </button>
    </form>
  );
}
