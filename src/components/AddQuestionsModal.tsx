import { useState } from 'react';

interface Question {
  key: string;
  label: string;
}

interface Props {
  availableQuestions: Question[];
  visibleQuestions: string[];
  data: Record<string, unknown>;
  fieldsPerQuestion: Record<string, string[]>;
  onSave: (visible: string[]) => void;
  onClose: () => void;
}

export default function AddQuestionsModal({ availableQuestions, visibleQuestions, data, fieldsPerQuestion, onSave, onClose }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(visibleQuestions));

  function sectionHasContent(fields: string[]): boolean {
    return fields.some(field => {
      const value = data[field];
      if (value === null || value === undefined) return false;
      if (value === '' || value === false) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    });
  }

  function toggleQuestion(key: string) {
    const newSelected = new Set(selected);
    const hasContent = sectionHasContent(fieldsPerQuestion[key] || []);

    if (newSelected.has(key)) {
      if (hasContent) {
        alert(`Cannot hide "${availableQuestions.find(q => q.key === key)?.label || key}" — it has data. Clear the data first, then you can hide it.`);
        return;
      }
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelected(newSelected);
  }

  function canHide(key: string): boolean {
    return !sectionHasContent(fieldsPerQuestion[key] || []);
  }

  function handleSave() {
    onSave(Array.from(selected));
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>Select Question Sections</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {availableQuestions.map(q => {
              const hasContent = !canHide(q.key);
              const isVisible = selected.has(q.key);
              return (
                <div key={q.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', opacity: hasContent && !isVisible ? 0.6 : 1 }}>
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => toggleQuestion(q.key)}
                    disabled={hasContent && !isVisible}
                    style={{ width: '18px', height: '18px', cursor: hasContent && !isVisible ? 'not-allowed' : 'pointer' }}
                    title={hasContent && !isVisible ? 'Clear data to hide this section' : ''}
                  />
                  <span style={{ cursor: 'default' }}>{q.label}</span>
                  {hasContent && !isVisible && <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: 'auto' }}>Has data</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
