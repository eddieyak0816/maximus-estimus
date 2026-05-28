import { useState } from 'react';

interface Question {
  key: string;
  label: string;
}

interface Props {
  availableQuestions: Question[];
  visibleQuestions: string[];
  onSave: (visible: string[]) => void;
  onClose: () => void;
}

export default function AddQuestionsModal({ availableQuestions, visibleQuestions, onSave, onClose }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(visibleQuestions));

  function toggleQuestion(key: string) {
    const newSelected = new Set(selected);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelected(newSelected);
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
        <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {availableQuestions.map(q => (
              <label key={q.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 0' }}>
                <input
                  type="checkbox"
                  checked={selected.has(q.key)}
                  onChange={() => toggleQuestion(q.key)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span>{q.label}</span>
              </label>
            ))}
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
