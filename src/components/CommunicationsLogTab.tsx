import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { LogEntry, MessageTemplate } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  log?: LogEntry[];
  assignedTeamMemberIds?: string[];
  creatorId?: string;
  onAddEntry: (entry: LogEntry) => void;
  onEditEntry: (entryId: string, newContent: string) => void;
  creatorMap?: Record<string, string>;
  templates?: MessageTemplate[];
}

type SortBy = 'newest' | 'oldest' | 'user';

export default function CommunicationsLogTab({
  log = [],
  assignedTeamMemberIds = [],
  creatorId,
  onAddEntry,
  onEditEntry,
  creatorMap = {},
  templates = [],
}: Props) {
  const { user } = useAuth();
  const [newNote, setNewNote] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [filterUser, setFilterUser] = useState<string>('');
  const [filterKeyword, setFilterKeyword] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  // Check if current user can add notes
  const canAddNotes = user?.isAdmin || assignedTeamMemberIds?.includes(user?.id || '');
  const canViewLog = canAddNotes || creatorId === user?.id;

  // Get all users who have access
  const accessibleUsers = useMemo(() => {
    const ids = new Set([
      ...(assignedTeamMemberIds || []),
      ...(creatorId ? [creatorId] : []),
    ]);
    return Array.from(ids);
  }, [assignedTeamMemberIds, creatorId]);

  // Filter and sort entries
  const filteredAndSorted = useMemo(() => {
    let result = [...log];

    // Apply filters
    if (filterUser) {
      result = result.filter(entry => entry.userId === filterUser);
    }
    if (filterKeyword) {
      const keyword = filterKeyword.toLowerCase();
      result = result.filter(
        entry =>
          entry.content.toLowerCase().includes(keyword) ||
          entry.editHistory?.some(edit =>
            edit.previousContent.toLowerCase().includes(keyword) ||
            edit.newContent.toLowerCase().includes(keyword)
          )
      );
    }

    // Apply sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } else if (sortBy === 'user') {
      result.sort((a, b) => {
        const aName = creatorMap[a.userId] || a.userId;
        const bName = creatorMap[b.userId] || b.userId;
        return aName.localeCompare(bName);
      });
    }

    return result;
  }, [log, filterUser, filterKeyword, sortBy, creatorMap]);

  const handleAddNote = () => {
    if (!newNote.trim() || !user?.id) return;

    const entry: LogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      userId: user.id,
      content: newNote.trim(),
    };

    onAddEntry(entry);
    setNewNote('');
  };

  const handleSaveEdit = (entryId: string) => {
    if (!editingContent.trim() || !user?.id) return;

    // Find original entry to get previous content
    const originalEntry = log.find(e => e.id === entryId);
    if (!originalEntry) return;

    // The parent component will handle tracking edit history
    // We just pass the new content
    onEditEntry(entryId, editingContent.trim());

    setEditingEntryId(null);
    setEditingContent('');
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  if (!canViewLog) {
    return (
      <div className="assess-tab">
        <div style={{
          padding: '24px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.6)',
        }}>
          You don't have access to this job's communication log.
        </div>
      </div>
    );
  }

  return (
    <div className="assess-tab">
      {/* Add Note Section */}
      {canAddNotes && (
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(59, 130, 246, 0.08)', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
            💬 Add Note
          </div>

          <textarea
            placeholder="Type a note or select a template..."
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              color: 'inherit',
              fontFamily: 'inherit',
              fontSize: '13px',
              marginBottom: '10px',
              resize: 'vertical',
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleAddNote();
              }
            }}
          />

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {templates.length > 0 && (
              <select
                onChange={e => {
                  if (e.target.value) {
                    const template = templates.find(t => t.id === e.target.value);
                    if (template) {
                      setNewNote(prev => (prev ? prev + '\n\n' : '') + template.content);
                    }
                    e.target.value = '';
                  }
                }}
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  color: 'inherit',
                  fontSize: '12px',
                }}
              >
                <option value="">📋 Select Template...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-primary"
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              style={{ flex: 1 }}
            >
              Add Note
            </button>
          </div>
        </div>
      )}

      {/* Filters & Sort */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortBy)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            color: 'inherit',
            fontSize: '12px',
          }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="user">By User</option>
        </select>

        <select
          value={filterUser}
          onChange={e => setFilterUser(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            color: 'inherit',
            fontSize: '12px',
          }}
        >
          <option value="">All Users</option>
          {accessibleUsers.map(userId => (
            <option key={userId} value={userId}>
              {creatorMap[userId] || userId.substring(0, 8)}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="🔍 Filter by keyword..."
          value={filterKeyword}
          onChange={e => setFilterKeyword(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            color: 'inherit',
            fontSize: '12px',
            minWidth: '200px',
          }}
        />

        {(filterUser || filterKeyword) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setFilterUser('');
              setFilterKeyword('');
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Log Entries */}
      {filteredAndSorted.length === 0 ? (
        <div style={{
          padding: '24px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '13px',
        }}>
          {log.length === 0 ? 'No notes yet. Add one above.' : 'No entries match your filters.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredAndSorted.map(entry => (
            <div
              key={entry.id}
              style={{
                padding: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '4px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>
                    {creatorMap[entry.userId] || entry.userId}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
                    {formatTimestamp(entry.timestamp)}
                  </div>
                </div>

                {canAddNotes && editingEntryId !== entry.id && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setEditingEntryId(entry.id);
                      setEditingContent(entry.content);
                    }}
                    style={{ fontSize: '12px' }}
                  >
                    ✎ Edit
                  </button>
                )}
              </div>

              {editingEntryId === entry.id ? (
                <div style={{ marginBottom: '8px' }}>
                  <textarea
                    value={editingContent}
                    onChange={e => setEditingContent(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      color: 'inherit',
                      fontSize: '12px',
                      marginBottom: '8px',
                      resize: 'vertical',
                    }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSaveEdit(entry.id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setEditingEntryId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: '8px' }}>
                  {entry.content}
                </div>
              )}

              {/* Edit History */}
              {entry.editHistory && entry.editHistory.length > 0 && (
                <div>
                  <button
                    onClick={() => setExpandedEntryId(expandedEntryId === entry.id ? null : entry.id)}
                    style={{
                      fontSize: '11px',
                      color: 'rgba(245, 196, 42, 0.8)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 0',
                      fontWeight: 500,
                    }}
                  >
                    {expandedEntryId === entry.id ? '▼' : '▶'} {entry.editHistory.length} edit{entry.editHistory.length !== 1 ? 's' : ''}
                  </button>

                  {expandedEntryId === entry.id && (
                    <div style={{ marginTop: '8px', paddingLeft: '12px', borderLeft: '2px solid rgba(245, 196, 42, 0.3)' }}>
                      {entry.editHistory.map((edit, idx) => (
                        <div key={idx} style={{ marginBottom: '8px', fontSize: '11px' }}>
                          <div style={{ color: 'rgba(245, 196, 42, 0.8)', fontWeight: 500 }}>
                            Edited {formatTimestamp(edit.editedAt)} by {creatorMap[edit.editedBy] || edit.editedBy}
                          </div>
                          <div style={{ marginTop: '4px' }}>
                            <div style={{ color: '#ef4444', marginBottom: '2px' }}>
                              - {edit.previousContent}
                            </div>
                            <div style={{ color: '#22c55e' }}>
                              + {edit.newContent}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Access Info */}
      <div style={{ marginTop: '24px', padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '4px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>👥 Access</div>
        <div>
          {accessibleUsers.map(userId => (
            <div key={userId}>
              {creatorMap[userId] || userId} {userId === user?.id && ' (you)'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
