import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAssessmentStore } from '../store/assessmentStore';
import type { StatusConfig } from '../types';

function slugify(label: string): string {
  return label.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function AdminStatusesPage() {
  const { user } = useAuth();
  const { statuses, assessments, addStatus, updateStatus, deleteStatus, updateStatusOrder } = useAssessmentStore();

  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#6b7280');
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState('');
  const [error, setError] = useState('');
  const [orderedStatuses, setOrderedStatuses] = useState<StatusConfig[]>(statuses);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  if (!user?.isAdmin) {
    return (
      <div className="page">
        <div className="empty-state" style={{ marginTop: 80 }}>
          <div className="empty-icon">🔒</div>
          <h2>Access Denied</h2>
          <p>Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  function handleAdd() {
    const label = newLabel.trim();
    if (!label) { setError('Label is required'); return; }
    const value = slugify(label);
    if (!value) { setError('Label must contain letters or numbers'); return; }
    if (statuses.find(s => s.value === value)) { setError('A status with that name already exists'); return; }
    addStatus({ value, label, color: newColor });
    setNewLabel('');
    setNewColor('#6b7280');
    setError('');
  }

  function startEdit(value: string) {
    const st = statuses.find(s => s.value === value);
    if (!st) return;
    setEditingValue(value);
    setEditLabel(st.label);
    setEditColor(st.color);
    setError('');
  }

  function handleSaveEdit() {
    if (!editingValue) return;
    const label = editLabel.trim();
    if (!label) { setError('Label is required'); return; }
    const newValue = slugify(label);
    if (!newValue) { setError('Label must contain letters or numbers'); return; }
    if (newValue !== editingValue && statuses.find(s => s.value === newValue)) {
      setError('A status with that slug already exists');
      return;
    }
    updateStatus(editingValue, { value: newValue, label, color: editColor });
    setEditingValue(null);
    setError('');
  }

  function handleDelete(value: string) {
    const inUse = assessments.filter(a => a.status === value).length;
    const st = statuses.find(s => s.value === value);
    const msg = inUse > 0
      ? `"${st?.label}" is used by ${inUse} assessment${inUse > 1 ? 's' : ''}. Those assessments will show an unknown status until reassigned. Delete anyway?`
      : `Delete status "${st?.label}"?`;
    if (window.confirm(msg)) {
      deleteStatus(value);
      if (editingValue === value) setEditingValue(null);
    }
  }

  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;

    const newStatuses = [...orderedStatuses];
    const draggedStatus = newStatuses[draggingIndex];
    newStatuses.splice(draggingIndex, 1);
    newStatuses.splice(index, 0, draggedStatus);
    setOrderedStatuses(newStatuses);
    setDraggingIndex(index);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  const handleSaveOrder = () => {
    updateStatusOrder(orderedStatuses);
    setIsReordering(false);
    alert('Status order saved!');
  };

  const handleCancelReorder = () => {
    setOrderedStatuses(statuses);
    setIsReordering(false);
    setDraggingIndex(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div style={{ marginBottom: 4 }}>
            <Link to="/admin" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>
              ← Admin Panel
            </Link>
          </div>
          <h1 className="page-title">Job Statuses</h1>
          <p className="page-subtitle">Create and manage the status options shown on assessments</p>
        </div>
      </div>

      {/* Reordering Section */}
      {!isReordering && statuses.length > 1 && (
        <div style={{ marginBottom: 20 }}>
          <button
            className="btn btn-ghost"
            onClick={() => setIsReordering(true)}
            style={{ fontSize: 13 }}
          >
            ↕️ Reorder Statuses
          </button>
        </div>
      )}

      {isReordering && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          marginBottom: 28,
        }}>
          <div className="tiny-label" style={{ marginBottom: 12 }}>📊 Drag to Reorder Statuses</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {orderedStatuses.map((st, index) => (
              <div
                key={st.value}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={e => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                style={{
                  background: draggingIndex === index ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-elevated)',
                  border: `1px solid ${draggingIndex === index ? 'rgba(59, 130, 246, 0.5)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius)',
                  padding: '10px 12px',
                  cursor: 'grab',
                  transition: 'all 0.2s',
                  opacity: draggingIndex === index ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 18, color: 'var(--text-muted)', userSelect: 'none' }}>⋮⋮</span>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: st.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontWeight: 600, fontSize: 14 }}>{st.label}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>({st.value})</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={handleSaveOrder}>
              💾 Save Order
            </button>
            <button className="btn btn-ghost" onClick={handleCancelReorder}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing Statuses */}
      <div style={{ marginBottom: 28 }}>
        {statuses.length === 0 && (
          <div style={{ color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>
            No statuses yet. Add one below.
          </div>
        )}
        {statuses.map(st => (
          <div key={st.value} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius)',
            padding: '14px 16px',
            marginBottom: 10,
          }}>
            {editingValue === st.value ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="color"
                  value={editColor}
                  onChange={e => setEditColor(e.target.value)}
                  style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer', padding: 0, borderRadius: 6 }}
                />
                <div style={{ flex: 1, minWidth: 120 }}>
                  <input
                    className="input"
                    style={{ width: '100%' }}
                    value={editLabel}
                    onChange={e => { setEditLabel(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                    autoFocus
                  />
                  {editLabel.trim() && slugify(editLabel) !== editingValue && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                      slug will change to: {slugify(editLabel)}
                    </div>
                  )}
                </div>
                <button className="btn btn-primary" onClick={handleSaveEdit}>Save</button>
                <button className="btn btn-ghost" onClick={() => setEditingValue(null)}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: st.color, flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{st.label}</span>
                  <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>({st.value})</span>
                  <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                    · {assessments.filter(a => a.status === st.value).length} assessments
                  </span>
                </div>
                <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => startEdit(st.value)}>Edit</button>
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: 13, color: '#ef4444' }}
                  onClick={() => handleDelete(st.value)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Status */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 20px',
      }}>
        <div className="tiny-label" style={{ marginBottom: 12 }}>Add New Status</div>
        {error && (
          <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{error}</div>
        )}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="color"
            value={newColor}
            onChange={e => setNewColor(e.target.value)}
            title="Pick a color"
            style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer', padding: 0, borderRadius: 6 }}
          />
          <input
            className="input"
            style={{ flex: 1, minWidth: 160 }}
            placeholder="Status label (e.g. On Hold)"
            value={newLabel}
            onChange={e => { setNewLabel(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          {newLabel.trim() && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              value: {slugify(newLabel)}
            </span>
          )}
          <button className="btn btn-primary" onClick={handleAdd}>
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
