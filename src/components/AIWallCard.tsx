import { useState } from 'react';
import type { AIWallData } from '../types';
import ChevronIcon from './ChevronIcon';

interface Props {
  wall: AIWallData;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (wall: AIWallData) => void;
  onDelete: (wallId: string) => void;
}

export default function AIWallCard({ wall, isExpanded, onToggle, onUpdate, onDelete }: Props) {
  const [showRawJSON, setShowRawJSON] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const confidenceColor = {
    high: 'rgba(34, 197, 94, 0.8)',
    medium: 'rgba(245, 196, 42, 0.8)',
    low: 'rgba(239, 68, 68, 0.8)',
  }[wall.wallContextConfidence];

  function startEdit(field: string, value: any) {
    setEditingField(field);
    setEditValue(String(value || ''));
  }

  function saveEdit() {
    if (editingField) {
      const updated = { ...wall };
      const keys = editingField.split('.');
      let obj: any = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = editValue;
      onUpdate(updated);
      setEditingField(null);
    }
  }

  function renderField(value: any, field: string, label: string) {
    if (typeof value === 'object' && value !== null) {
      return (
        <div key={field} style={{ marginBottom: '12px', paddingLeft: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px' }}>
            {label}
          </div>
          <div style={{ paddingLeft: '8px', borderLeft: '1px solid rgba(255, 255, 255, 0.1)' }}>
            {Object.entries(value).map(([k, v]) => (
              <div key={`${field}.${k}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{k}:</span>
                {editingField === `${field}.${k}` ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={e => e.key === 'Enter' && saveEdit()}
                    style={{
                      padding: '4px 6px',
                      borderRadius: '3px',
                      border: '1px solid var(--accent)',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: 'inherit',
                      fontSize: '13px',
                      width: '150px',
                    }}
                  />
                ) : (
                  <span
                    onClick={() => startEdit(`${field}.${k}`, v)}
                    style={{
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                    title="Click to edit"
                  >
                    {String(v)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div
      style={{
        padding: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '6px',
        border: `1px solid ${confidenceColor}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={onToggle}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <ChevronIcon open={isExpanded} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>
              {wall.name}
            </div>
            {!isExpanded && (
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
                {Object.keys(wall.measurements).length} measurements • {wall.appliances.length} appliances
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '9px',
            fontWeight: 700,
            padding: '2px 6px',
            backgroundColor: confidenceColor,
            borderRadius: '3px',
            color: '#0d1628',
            textTransform: 'uppercase',
          }}>
            {wall.wallContextConfidence}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(wall.id);
            }}
            style={{
              padding: '4px 8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            title="Delete wall"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {/* Measurements */}
          {renderField(wall.measurements, 'measurements', 'Measurements')}

          {/* Appliances */}
          {wall.appliances.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px' }}>
                Appliances
              </div>
              {wall.appliances.map((app) => (
                <div key={app.id} style={{
                  padding: '8px',
                  marginBottom: '6px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '3px',
                  fontSize: '13px',
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                    {app.name}
                    <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginLeft: '8px' }}>
                      {app.width && `${app.width}`}
                      {app.position && ` • ${app.position}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Features */}
          {renderField(wall.features, 'features', 'Features')}

          {/* Questions */}
          {renderField(wall.questions, 'questions', 'Questions')}

          {/* Notes */}
          {wall.notes && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                Notes
              </div>
              <div
                onClick={() => startEdit('notes', wall.notes)}
                style={{
                  padding: '8px',
                  backgroundColor: 'rgba(245, 196, 42, 0.05)',
                  borderRadius: '3px',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                }}
              >
                {wall.notes}
              </div>
            </div>
          )}

          {/* Clarifications Needed */}
          {wall.rawParsed?.clarifications_needed && wall.rawParsed.clarifications_needed.length > 0 && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(245, 196, 42, 0.9)', marginBottom: '8px' }}>
                ❓ Clarifications Needed ({wall.rawParsed.clarifications_needed.length})
              </div>
              {wall.rawParsed.clarifications_needed.map((clarif, idx) => (
                <div key={`clarif-${idx}`} style={{
                  padding: '8px',
                  marginBottom: '6px',
                  backgroundColor: 'rgba(245, 196, 42, 0.08)',
                  borderLeft: '2px solid rgba(245, 196, 42, 0.4)',
                  borderRadius: '2px',
                  fontSize: '12px',
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{clarif.field}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '3px' }}>
                    Stated: {clarif.what_was_said}
                  </div>
                  {clarif.suggested_standard && (
                    <div style={{ fontSize: '11px', color: 'rgba(245, 196, 42, 0.8)' }}>
                      Standard: {clarif.suggested_standard}
                    </div>
                  )}
                  {clarif.options && (
                    <div style={{ fontSize: '11px', marginTop: '4px', color: 'rgba(255, 255, 255, 0.6)' }}>
                      Options: {clarif.options.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Design Questions */}
          {wall.rawParsed?.design_questions && wall.rawParsed.design_questions.length > 0 && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(59, 130, 246, 0.9)', marginBottom: '8px' }}>
                🎯 Design Questions ({wall.rawParsed.design_questions.length})
              </div>
              {wall.rawParsed.design_questions.map((q, idx) => (
                <div key={`q-${idx}`} style={{
                  padding: '8px',
                  marginBottom: '6px',
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  borderLeft: '2px solid rgba(59, 130, 246, 0.4)',
                  borderRadius: '2px',
                  fontSize: '12px',
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{q.question}</div>
                  {q.user_stated && (
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '3px' }}>
                      User said: {q.user_stated}
                    </div>
                  )}
                  {q.current_state && (
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '2px' }}>
                      Current: {q.current_state}
                    </div>
                  )}
                  {q.options && (
                    <div style={{ fontSize: '11px', marginTop: '4px', color: 'rgba(59, 130, 246, 0.8)' }}>
                      Options: {q.options.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Flags */}
          {wall.rawParsed?.flags && wall.rawParsed.flags.length > 0 && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(239, 68, 68, 0.9)', marginBottom: '8px' }}>
                ⚠️ Flags ({wall.rawParsed.flags.length})
              </div>
              {wall.rawParsed.flags.map((flag, idx) => (
                <div key={`flag-${idx}`} style={{
                  padding: '6px 8px',
                  marginBottom: '4px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  borderLeft: '2px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '2px',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}>
                  {flag}
                </div>
              ))}
            </div>
          )}

          {/* Raw JSON Toggle */}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              onClick={() => setShowRawJSON(!showRawJSON)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '3px',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
              }}
            >
              {showRawJSON ? 'Hide Raw JSON' : 'Show Raw JSON'}
            </button>

            {showRawJSON && (
              <div style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '3px',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: 'rgba(255, 255, 255, 0.6)',
                maxHeight: '300px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}>
                {JSON.stringify(wall.rawParsed, null, 2)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
