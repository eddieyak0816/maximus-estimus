import CheckOpt from '../../components/CheckOpt';
import type { PaintingQuestions as PQ } from '../../types';

const SPECIAL_NOTES_ITEMS = [
  'Pet in home', 'Access restrictions', 'Asbestos concern', 'Second floor job',
  'Narrow doorways', 'HOA approval needed', 'Occupied during work', 'Fragile items present',
];

function SecHead({ title }: { title: string }) {
  return <div className="q-sec-head">{title}</div>;
}

interface Props { data: PQ; onUpdate: (d: PQ) => void; }

export default function PaintingQuestions({ data, onUpdate }: Props) {
  const u = (f: keyof PQ, v: unknown) => onUpdate({ ...data, [f]: v });
  const toggle = (field: keyof PQ, val: string) => {
    const c = (data[field] as string[]) || [];
    u(field, c.includes(val) ? c.filter(x => x !== val) : [...c, val]);
  };
  const isSel = (field: keyof PQ, val: string) => ((data[field] as string[]) || []).includes(val);

  return (
    <div className="assess-tab">
      <SecHead title="1 — Project Scope" />
      <p className="assess-hint">What areas need painting?</p>
      {['Walls only', 'Walls & ceiling', 'Walls & trim', 'Walls, ceiling & trim', 'Other areas'].map(opt =>
        <CheckOpt key={opt} label={opt} selected={isSel('scope', opt)} onToggle={() => toggle('scope', opt)} />
      )}

      <SecHead title="2 — Timeline" />
      {['Under 1 week', '1 to 2 weeks', '2 to 4 weeks', 'No rush', 'Specific target date'].map(opt =>
        <CheckOpt key={opt} label={opt} selected={data.timeline === opt} onToggle={() => u('timeline', opt)} round />
      )}
      {data.timeline === 'Specific target date' && (
        <input type="date" className="input" value={data.targetDate || ''} onChange={e => u('targetDate', e.target.value)} />
      )}

      <SecHead title="3 — How Did You Hear About Us?" />
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

      <SecHead title="4 — Special Notes" />
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
    </div>
  );
}
