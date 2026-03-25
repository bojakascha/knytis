import { useState } from 'react';
import { useI18n } from '../../../i18n/useI18n';
import type { Suggestion } from '../../../types/models';

interface SuggestionListProps {
  suggestions: Suggestion[];
  onAddSuggestion: (text: string) => Promise<void> | void;
}

export function SuggestionList({
  suggestions,
  onAddSuggestion,
}: SuggestionListProps) {
  const { t } = useI18n();
  const [text, setText] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!text.trim()) {
      return;
    }

    await onAddSuggestion(text);
    setText('');
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="section-label">{t('suggestion.sectionLabel')}</p>
          <h2>{t('suggestion.heading')}</h2>
        </div>
      </div>
      <form className="suggestion-form" onSubmit={handleSubmit}>
        <input
          placeholder={t('suggestion.placeholder')}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button type="submit">{t('suggestion.suggest')}</button>
      </form>
      <ul className="stack-list">
        {suggestions.length === 0 ? (
          <li className="empty-copy">{t('suggestion.empty')}</li>
        ) : (
          suggestions.map((suggestion) => (
            <li key={suggestion.id} className="suggestion-card">
              {suggestion.text}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
