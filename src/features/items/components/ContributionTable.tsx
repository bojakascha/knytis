import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../../i18n/useI18n';
import type { AddItemValues, ContributionItem, Participant, SortMode } from '../../../types/models';

interface ContributionTableProps {
  items: ContributionItem[];
  participants: Participant[];
  defaultParticipantName: string;
  isSaving: boolean;
  onSubmit: (values: AddItemValues) => Promise<void> | void;
  onUpdate: (itemId: string, updates: { name?: string; notes?: string }) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
}

export function ContributionTable({
  items,
  participants,
  defaultParticipantName,
  isSaving,
  onSubmit,
  onUpdate,
  onDelete,
}: ContributionTableProps) {
  const { t } = useI18n();

  const getParticipantName = useCallback(
    (participantId: string): string =>
      participants.find((p) => p.id === participantId)?.name ?? t('common.unknown'),
    [participants, t],
  );

  const [sortMode, setSortMode] = useState<SortMode>('participant');

  const defaultParticipantId = useMemo(
    () =>
      participants.find(
        (p) => p.name.toLowerCase() === defaultParticipantName.toLowerCase(),
      )?.id ?? participants[0]?.id ?? '',
    [defaultParticipantName, participants],
  );

  // Add row state
  const [participantId, setParticipantId] = useState(defaultParticipantId);
  const [pickingOther, setPickingOther] = useState(false);
  const [itemName, setItemName] = useState('');
  const [notes, setNotes] = useState('');

  // Active row (tap to reveal actions on mobile)
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Expanded note row
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const editNameRef = useRef<HTMLInputElement>(null);

  // Dismiss active row when tapping outside the table
  useEffect(() => {
    if (!activeRowId) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setActiveRowId(null);
        setConfirmDeleteId(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [activeRowId]);

  const selectedParticipantId = participants.some((p) => p.id === participantId)
    ? participantId
    : defaultParticipantId;

  const isAddingForOther = selectedParticipantId !== defaultParticipantId;

  const viewerParticipant = participants.find(
    (p) => p.id === defaultParticipantId,
  );

  const sortedItems = useMemo(() => {
    const copy = [...items];
    if (sortMode === 'participant') {
      copy.sort((a, b) =>
        getParticipantName(a.participantId).localeCompare(getParticipantName(b.participantId)),
      );
    } else {
      copy.sort((a, b) => a.name.localeCompare(b.name));
    }
    return copy;
  }, [items, sortMode, getParticipantName]);

  const toggleNote = (itemId: string) => {
    setExpandedNoteId((prev) => (prev === itemId ? null : itemId));
  };

  const handleRowTap = (item: ContributionItem) => {
    setActiveRowId((prev) => (prev === item.id ? null : item.id));
    setConfirmDeleteId(null);
  };

  const startEdit = (item: ContributionItem) => {
    setActiveRowId(null);
    setExpandedNoteId(null);
    setEditingId(item.id);
    setEditName(item.name);
    setEditNotes(item.notes);
    setConfirmDeleteId(null);
    requestAnimationFrame(() => editNameRef.current?.focus());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setConfirmDeleteId(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;

    const item = items.find((i) => i.id === editingId);
    if (!item) return;

    const nameChanged = editName.trim() !== item.name;
    const notesChanged = editNotes.trim() !== item.notes;

    if (nameChanged || notesChanged) {
      await onUpdate(editingId, {
        ...(nameChanged && { name: editName.trim() }),
        ...(notesChanged && { notes: editNotes.trim() }),
      });
    }

    setEditingId(null);
    setConfirmDeleteId(null);
  };

  const handleEditKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') cancelEdit();
    if (event.key === 'Enter') saveEdit();
  };

  const handleDelete = async (itemId: string) => {
    if (confirmDeleteId === itemId) {
      await onDelete(itemId);
      setEditingId(null);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(itemId);
    }
  };

  // Add row handlers
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedParticipantId || !itemName.trim() || isSaving) return;

    await onSubmit({
      participantId: selectedParticipantId,
      name: itemName.trim(),
      category: 'food',
      quantity: '',
      notes: notes.trim(),
    });
    setItemName('');
    setNotes('');

    if (isAddingForOther) {
      setParticipantId(defaultParticipantId);
      setPickingOther(false);
    }
  };

  const handleNameClick = () => {
    if (participants.length > 1) {
      setPickingOther(true);
    }
  };

  const handleSelectChange = (value: string) => {
    setParticipantId(value);
    if (value === defaultParticipantId) {
      setPickingOther(false);
    }
  };

  return (
    <section className="panel panel-wide">
      <div className="table-wrap">
        <table className="contrib-table" ref={tableRef}>
          <thead>
            <tr>
              <th>
                <button
                  type="button"
                  className={`sort-btn${sortMode === 'participant' ? ' sort-active' : ''}`}
                  onClick={() => setSortMode('participant')}
                >
                  {t('contrib.sortParticipant')}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className={`sort-btn${sortMode === 'item' ? ' sort-active' : ''}`}
                  onClick={() => setSortMode('item')}
                >
                  {t('contrib.sortItem')}
                </button>
              </th>
              <th className="col-actions" />
            </tr>
          </thead>
          <tbody>
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty-copy">
                  {t('contrib.empty')}
                </td>
              </tr>
            ) : (
              sortedItems.map((item) =>
                editingId === item.id ? (
                  <Fragment key={item.id}>
                    <tr className="editing-row">
                      <td className="muted">
                        {getParticipantName(item.participantId)}
                      </td>
                      <td>
                        <input
                          ref={editNameRef}
                          className="edit-cell"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                        />
                      </td>
                      <td className="col-actions">
                        <div className="row-actions">
                          <button
                            type="button"
                            className="action-btn save-btn"
                            onClick={saveEdit}
                            title={t('contrib.saveTitle')}
                          >
                            {t('common.save')}
                          </button>
                          <button
                            type="button"
                            className="action-btn cancel-btn"
                            onClick={cancelEdit}
                            title={t('contrib.cancelTitle')}
                          >
                            {t('common.cancel')}
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="edit-notes-row">
                      <td colSpan={3}>
                        <input
                          className="edit-cell"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          placeholder={t('contrib.notesPlaceholder')}
                        />
                      </td>
                    </tr>
                  </Fragment>
                ) : (
                  <Fragment key={item.id}>
                    <tr
                      className={`item-row${activeRowId === item.id ? ' row-active' : ''}`}
                      onClick={() => handleRowTap(item)}
                    >
                      <td>{getParticipantName(item.participantId)}</td>
                      <td>
                        <span className="item-name-cell">
                          <span>{item.name}</span>
                          {item.notes ? (
                            <button
                              type="button"
                              className={`note-toggle${expandedNoteId === item.id ? ' note-toggle-open' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleNote(item.id); }}
                              title={t('contrib.notes')}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                              </svg>
                            </button>
                          ) : null}
                        </span>
                      </td>
                      <td className="col-actions">
                        <div className="hover-actions">
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={(e) => { e.stopPropagation(); startEdit(item); }}
                            title={t('contrib.editTitle')}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              <path d="m15 5 4 4" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="icon-btn icon-btn-danger"
                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                            title={
                              confirmDeleteId === item.id
                                ? t('contrib.deleteConfirmTitle')
                                : t('contrib.deleteTitle')
                            }
                          >
                            {confirmDeleteId === item.id ? (
                              <span className="confirm-label">{t('common.sure')}</span>
                            ) : (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedNoteId === item.id && item.notes ? (
                      <tr className="note-expand-row">
                        <td colSpan={3}>
                          <p className="note-content">{item.notes}</p>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ),
              )
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ padding: 0, border: 'none' }}>
                <form
                  className={`add-row${isAddingForOther ? ' add-row-other' : ''}`}
                  onSubmit={handleSubmit}
                >
                  {pickingOther || isAddingForOther ? (
                    <select
                      className="add-row-cell add-row-select"
                      value={selectedParticipantId}
                      onChange={(e) => handleSelectChange(e.target.value)}
                    >
                      {participants.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.id === defaultParticipantId ? `${p.name} ${t('contrib.youTag')}` : p.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      type="button"
                      className="add-row-name"
                      onClick={handleNameClick}
                      title={t('contrib.addForSomeoneTitle')}
                    >
                      {viewerParticipant?.name ?? t('contrib.you')}
                    </button>
                  )}
                  <input
                    className="add-row-cell"
                    placeholder={t('contrib.itemPlaceholder')}
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    autoFocus
                  />
                  <input
                    className="add-row-cell add-row-notes"
                    placeholder={t('contrib.notesOptional')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <button type="submit" className="add-row-btn" disabled={isSaving}>
                    {isSaving ? t('contrib.adding') : t('common.add')}
                  </button>
                </form>
                {isAddingForOther ? (
                  <p className="add-row-warning">
                    {t('contrib.addingFor', { name: getParticipantName(selectedParticipantId) })}
                  </p>
                ) : null}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
