import { useState } from 'react';
import CheckOpt from '../../components/CheckOpt';
import CollapseSection from '../../components/CollapseSection';
import AddQuestionsModal from '../../components/AddQuestionsModal';
import type { PaintingQuestions as PQ } from '../../types';

const SPECIAL_NOTES_ITEMS = [
  'Pet in home', 'Access restrictions', 'Asbestos concern', 'Second floor job',
  'Narrow doorways', 'HOA approval needed', 'Occupied during work', 'Fragile items present',
];

interface Props { data: PQ; onUpdate: (d: PQ) => void; }

export default function PaintingQuestions({ data, onUpdate }: Props) {
  const [showAddQuestionsModal, setShowAddQuestionsModal] = useState(false);
  const u = (f: keyof PQ, v: unknown) => onUpdate({ ...data, [f]: v });
  const toggle = (field: keyof PQ, val: string) => {
    const c = (data[field] as string[]) || [];
    u(field, c.includes(val) ? c.filter(x => x !== val) : [...c, val]);
  };
  const isSel = (field: keyof PQ, val: string) => ((data[field] as string[]) || []).includes(val);

  const availableQuestions = [
    { key: 'scope', label: '1 — Project Scope' },
    { key: 'timeline', label: '2 — Timeline' },
    { key: 'referral', label: '3 — How Did You Hear About Us?' },
    { key: 'specialNotes', label: '4 — Special Notes' },
  ];

  const fieldsPerQuestion: Record<string, string[]> = {
    scope: ['scope'],
    timeline: ['timeline', 'targetDate'],
    referral: ['referral', 'referralName', 'referralOther'],
    specialNotes: ['specialNoteItems', 'specialNotes'],
  };

  const visibleQuestions = data.visibleQuestions || availableQuestions.map(q => q.key);
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

        {isQuestionVisible('scope') && <CollapseSection title="1 — Project Scope" defaultOpen={false}>
          <p className="assess-hint">What areas need painting?</p>
          {['Walls only', 'Walls & ceiling', 'Walls & trim', 'Walls, ceiling & trim', 'Other areas'].map(opt =>
            <CheckOpt key={opt} label={opt} selected={isSel('scope', opt)} onToggle={() => toggle('scope', opt)} />
          )}
        </CollapseSection>}

        {isQuestionVisible('timeline') && <CollapseSection title="2 — Timeline" defaultOpen={false}>
          {['Under 1 week', '1 to 2 weeks', '2 to 4 weeks', 'No rush', 'Specific target date'].map(opt =>
            <CheckOpt key={opt} label={opt} selected={data.timeline === opt} onToggle={() => u('timeline', opt)} round />
          )}
          {data.timeline === 'Specific target date' && (
            <input type="date" className="input" value={data.targetDate || ''} onChange={e => u('targetDate', e.target.value)} />
          )}
        </CollapseSection>}

        {isQuestionVisible('referral') && <CollapseSection title="3 — How Did You Hear About Us?" defaultOpen={false}>
          {['Referral', 'Google', 'Social media', 'Repeat customer', 'Other'].map(opt =>
            <CheckOpt key={opt} label={opt} selected={data.referral === opt} onToggle={() => u('referral', opt)} round />
          )}
          {data.referral === 'Referral' && (
            <input className="input" placeholder="Who referred you?" style={{ marginTop: 4 }}
              value={data.referralName || ''} onChange={e => u('referralName', e.target.value)} />
          )}
          {data.referral === 'Other' && (
            <input className="input" placeholder="How did you hear about us?" style={{ marginTop: 4 }}
              value={data.referralOther || ''} onChange={e => u('referralOther', e.target.value)} />
          )}
        </CollapseSection>}

        {isQuestionVisible('specialNotes') && <CollapseSection title="4 — Special Notes" defaultOpen={false}>
          <p className="assess-hint">Tap to add common items</p>
          <div className="special-notes-chips">
            {SPECIAL_NOTES_ITEMS.map(item => {
              const sel = isSel('specialNoteItems', item);
              return (
                <button key={item} className={`chip${sel ? ' active' : ''}`}
                  onClick={() => toggle('specialNoteItems', item)}>
                  {sel ? '✓ ' : ''}{item}
                </button>
              );
            })}
          </div>
          <textarea className="textarea" rows={4} placeholder="Additional notes, color preferences, prep work needed…"
            value={data.specialNotes || ''} onChange={e => u('specialNotes', e.target.value)} />
        </CollapseSection>}
      </div>
    </>
  );
}
