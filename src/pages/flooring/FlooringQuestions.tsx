import { useEffect, useState } from 'react';
import CheckOpt from '../../components/CheckOpt';
import Toggle from '../../components/Toggle';
import { fetchDropdownList } from '../../utils/dropdownManager';
import type { DropdownOption } from '../../utils/dropdownManager';
import type { FlooringQuestions as FQ } from '../../types';

const SPECIAL_NOTES_ITEMS = [
  'Pet in home', 'Access restrictions', 'Asbestos concern', 'Second floor job',
  'Narrow doorways', 'HOA approval needed', 'Occupied during work', 'Fragile items present',
];

function SecHead({ title }: { title: string }) {
  return <div className="q-sec-head">{title}</div>;
}

interface Props { data: FQ; onUpdate: (d: FQ) => void; }

export default function FlooringQuestions({ data, onUpdate }: Props) {
  const u = (f: keyof FQ, v: unknown) => onUpdate({ ...data, [f]: v });
  const toggle = (field: keyof FQ, val: string) => {
    const c = (data[field] as string[]) || [];
    u(field, c.includes(val) ? c.filter(x => x !== val) : [...c, val]);
  };
  const isSel = (field: keyof FQ, val: string) => ((data[field] as string[]) || []).includes(val);

  const [materials, setMaterials] = useState<DropdownOption[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const opts = await fetchDropdownList('flooring_materials');
        setMaterials(opts);
      } catch (err) {
        console.error('Failed to load flooring materials:', err);
      } finally {
        setLoadingMaterials(false);
      }
    })();
  }, []);

  return (
    <div className="assess-tab">
      <SecHead title="1 — Flooring Material" />
      <p className="assess-hint">Select all that apply</p>
      {loadingMaterials ? (
        <p style={{ fontSize: 'var(--font-size-sm)', color: '#999' }}>Loading materials...</p>
      ) : materials.length > 0 ? (
        materials.map(opt =>
          <CheckOpt key={opt.value} label={opt.label} selected={isSel('material', opt.value)} onToggle={() => toggle('material', opt.value)} />
        )
      ) : (
        <p style={{ fontSize: 'var(--font-size-sm)', color: '#999' }}>No materials configured yet. Use admin panel to add options.</p>
      )}

      <SecHead title="2 — Remove Existing Flooring?" />
      <div className="q-card">
        <div className="toggle-row">
          <span className="toggle-label">Remove existing flooring?</span>
          <Toggle on={!!data.removeExisting} onToggle={() => u('removeExisting', !data.removeExisting)} />
        </div>
      </div>

      <SecHead title="3 — Subfloor Repairs?" />
      {['Yes', 'No', 'Unknown'].map(opt =>
        <CheckOpt key={opt} label={opt} selected={data.subfloorRepairs === opt}
          onToggle={() => u('subfloorRepairs', opt)} round />
      )}

      <SecHead title="4 — Underlayment Needed?" />
      <div className="q-card">
        <div className="toggle-row">
          <span className="toggle-label">Underlayment needed?</span>
          <Toggle on={!!data.underlayment} onToggle={() => u('underlayment', !data.underlayment)} />
        </div>
      </div>

      <SecHead title="5 — Stair Nosing Needed?" />
      <div className="q-card">
        <div className="toggle-row">
          <span className="toggle-label">Stair nosing needed?</span>
          <Toggle on={!!data.stairNosing} onToggle={() => u('stairNosing', !data.stairNosing)} />
        </div>
      </div>

      <SecHead title="6 — Matching Existing Flooring?" />
      <div className="q-card">
        <div className="toggle-row">
          <span className="toggle-label">Matching existing flooring in other rooms?</span>
          <Toggle on={!!data.matchingOther} onToggle={() => u('matchingOther', !data.matchingOther)} />
        </div>
      </div>

      <SecHead title="7 — Timeline" />
      {['Under 3 months', '3 to 6 months', '6 to 12 months', 'No rush', 'Specific target date'].map(opt =>
        <CheckOpt key={opt} label={opt} selected={data.timeline === opt} onToggle={() => u('timeline', opt)} round />
      )}
      {data.timeline === 'Specific target date' && (
        <input type="date" className="input" value={data.targetDate || ''} onChange={e => u('targetDate', e.target.value)} />
      )}

      <SecHead title="8 — How Did You Hear About Us?" />
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

      <SecHead title="9 — Special Notes" />
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
      <textarea className="textarea" rows={4} placeholder="Additional notes, special requests, important details…"
        value={data.specialNotes || ''} onChange={e => u('specialNotes', e.target.value)} />
    </div>
  );
}
