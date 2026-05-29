import { useState } from 'react';
import CollapseSection from '../../components/CollapseSection';
import AddQuestionsModal from '../../components/AddQuestionsModal';
import type { DeckQuestions } from '../../types';

interface Props {
  data: DeckQuestions;
  onUpdate: (d: DeckQuestions) => void;
}

export default function DeckQuestions({ data, onUpdate }: Props) {
  const [showAddQuestionsModal, setShowAddQuestionsModal] = useState(false);
  const u = (key: keyof DeckQuestions, val: unknown) => onUpdate({ ...data, [key]: val });

  const toggleMulti = (key: keyof DeckQuestions, value: string) => {
    const arr = (data[key] as string[]) || [];
    const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
    u(key, next);
  };

  const availableQuestions = [
    { key: 'scope', label: 'Project Scope' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'condition', label: 'Existing & Railing' },
    { key: 'details', label: 'Final Details' },
  ];

  const fieldsPerQuestion: Record<string, string[]> = {
    scope: ['renovationScope'],
    timeline: ['timeline', 'targetDate'],
    condition: ['existing', 'railing'],
    details: ['referral', 'referralName', 'referralOther', 'specialNoteItems', 'specialNotes'],
  };

  // Auto-show questions that have content (for existing jobs)
  const sectionHasContent = (fields: (keyof DeckQuestions)[]): boolean => {
    return fields.some(field => {
      const value = data[field];
      if (value === null || value === undefined) return false;
      if ((value as any) === '') return false;
      if ((value as any) === false) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    });
  };
  const getDefaultVisibleQuestions = () => {
    if (data.visibleQuestions) return data.visibleQuestions;
    const withContent: string[] = [];
    availableQuestions.forEach(q => {
      const fields = (fieldsPerQuestion[q.key] || []) as (keyof DeckQuestions)[];
      if (sectionHasContent(fields)) withContent.push(q.key);
    });
    return withContent;
  };
  const visibleQuestions = getDefaultVisibleQuestions();
  const isQuestionVisible = (key: string) => visibleQuestions.includes(key);

  function handleSaveQuestions(visible: string[]) {
    u('visibleQuestions', visible);
  }

  return (
    <>
      {showAddQuestionsModal && (
        <AddQuestionsModal
          availableQuestions={availableQuestions}
          visibleQuestions={visibleQuestions}
          data={data as Record<string, unknown>}
          fieldsPerQuestion={fieldsPerQuestion}
          onSave={handleSaveQuestions}
          onClose={() => setShowAddQuestionsModal(false)}
        />
      )}
      <div className="assess-tab">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowAddQuestionsModal(true)}>
            ⚙️ Customize
          </button>
        </div>

        {isQuestionVisible('scope') && <CollapseSection title="Project Scope" defaultOpen={false}>
          <div className="form-field">
            <label className="form-label">What is the scope of work?</label>
            <div className="checkbox-group">
              {['New deck construction', 'Deck replacement', 'Railing upgrade', 'Stain / seal only', 'Repair / restoration', 'Other'].map(v => (
                <label key={v} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={(data.renovationScope || []).includes(v)}
                    onChange={() => toggleMulti('renovationScope', v)}
                  />
                  {v}
                </label>
              ))}
            </div>
          </div>
        </CollapseSection>}

        {isQuestionVisible('timeline') && <CollapseSection title="Timeline" defaultOpen={false}>
          <div className="form-field">
            <label className="form-label">What is your timeline?</label>
            <select
              className="input"
              value={data.timeline || ''}
              onChange={e => u('timeline', e.target.value)}
            >
              <option value="">— Select —</option>
              <option value="Under 3 months">Under 3 months</option>
              <option value="3 to 6 months">3 to 6 months</option>
              <option value="6 to 12 months">6 to 12 months</option>
              <option value="No rush">No rush</option>
              <option value="Specific date">Specific target date</option>
            </select>
          </div>

          {data.timeline === 'Specific date' && (
            <div className="form-field">
              <label className="form-label">Target date</label>
              <input
                className="input"
                type="date"
                value={data.targetDate || ''}
                onChange={e => u('targetDate', e.target.value)}
              />
            </div>
          )}
        </CollapseSection>}

        {isQuestionVisible('condition') && <>
          <CollapseSection title="Existing Deck" defaultOpen={false}>
            <div className="form-field">
              <label className="form-label">If existing deck — what are we doing with it?</label>
              <select
                className="input"
                value={data.existing || ''}
                onChange={e => u('existing', e.target.value)}
              >
                <option value="">— Select —</option>
                <option value="Keep and maintain">Keep and maintain</option>
                <option value="Repair specific areas">Repair specific areas</option>
                <option value="Full restoration">Full restoration (stain, seal, repairs)</option>
                <option value="Remove and replace">Remove and replace</option>
              </select>
            </div>
          </CollapseSection>

          <CollapseSection title="Railing & Safety" defaultOpen={false}>
            <div className="form-field">
              <label className="form-label">Railing — what are we doing?</label>
              <select
                className="input"
                value={data.railing || ''}
                onChange={e => u('railing', e.target.value)}
              >
                <option value="">— Select —</option>
                <option value="Keep existing">Keep existing</option>
                <option value="Repair existing">Repair existing</option>
                <option value="Replace with new">Replace with new</option>
                <option value="Install new (doesn't exist)">Install new (doesn't exist)</option>
                <option value="Not applicable">Not applicable</option>
              </select>
            </div>
          </CollapseSection>
        </>}

        {isQuestionVisible('details') && <CollapseSection title="Final Details" defaultOpen={false}>
        <div className="form-field">
          <label className="form-label">How did you hear about us?</label>
          <select
            className="input"
            value={data.referral || ''}
            onChange={e => u('referral', e.target.value)}
          >
            <option value="">— Select —</option>
            <option value="Referral">Referral</option>
            <option value="Google">Google</option>
            <option value="Social media">Social media</option>
            <option value="Repeat customer">Repeat customer</option>
            <option value="Other">Other (please specify)</option>
          </select>
        </div>

        {data.referral === 'Referral' && (
          <div className="form-field">
            <label className="form-label">Referred by (name)</label>
            <input
              className="input"
              type="text"
              placeholder="Customer name"
              value={data.referralName || ''}
              onChange={e => u('referralName', e.target.value)}
            />
          </div>
        )}

        {data.referral === 'Other' && (
          <div className="form-field">
            <label className="form-label">How did you hear about us?</label>
            <input
              className="input"
              type="text"
              placeholder="Please describe"
              value={data.referralOther || ''}
              onChange={e => u('referralOther', e.target.value)}
            />
          </div>
        )}

        <div className="form-field">
          <label className="form-label">Special notes or concerns</label>
          <div className="checkbox-group">
            {['Pet in home', 'Access restrictions', 'Neighbors nearby', 'Neighborhood restrictions', 'Permit required'].map(v => (
              <label key={v} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(data.specialNoteItems || []).includes(v)}
                  onChange={() => toggleMulti('specialNoteItems', v)}
                />
                {v}
              </label>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Additional notes</label>
          <textarea
            className="textarea"
            rows={3}
            placeholder="Any other details or concerns…"
            value={data.specialNotes || ''}
            onChange={e => u('specialNotes', e.target.value)}
          />
        </div>
        </CollapseSection>}
      </div>
    </>
  );
}
