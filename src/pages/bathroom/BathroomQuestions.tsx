import CheckOpt from '../../components/CheckOpt';
import Toggle from '../../components/Toggle';
import type { BathroomQuestions as BQ } from '../../types';

const SPECIAL_NOTES_ITEMS = [
  'Pet in home', 'Access restrictions', 'Asbestos concern', 'Second floor job',
  'Narrow doorways', 'HOA approval needed', 'Occupied during work', 'Fragile items present',
];

function SecHead({ title }: { title: string }) {
  return <div className="q-sec-head">{title}</div>;
}

interface Props { data: BQ; onUpdate: (d: BQ) => void; }

export default function BathroomQuestions({ data, onUpdate }: Props) {
  const u = (f: keyof BQ, v: unknown) => onUpdate({ ...data, [f]: v });
  const toggle = (field: keyof BQ, val: string) => {
    const c = (data[field] as string[]) || [];
    u(field, c.includes(val) ? c.filter(x => x !== val) : [...c, val]);
  };
  const isSel = (field: keyof BQ, val: string) => ((data[field] as string[]) || []).includes(val);

  return (
    <div className="assess-tab">
      <SecHead title="1 — Project Scope" />
      <p className="assess-hint">Select all that apply</p>
      {['Full gut renovation', 'Tub / shower replacement only', 'Vanity replacement only',
        'Tile work only', 'Multiple items but not a full gut', 'Flooring only'].map(opt =>
        <CheckOpt key={opt} label={opt} selected={isSel('scope', opt)} onToggle={() => toggle('scope', opt)} />
      )}

      <SecHead title="2 — Timeline" />
      {['Under 3 months', '3 to 6 months', '6 to 12 months', 'No rush', 'Specific target date'].map(opt =>
        <CheckOpt key={opt} label={opt} selected={data.timeline === opt} onToggle={() => u('timeline', opt)} round />
      )}
      {data.timeline === 'Specific target date' && (
        <input type="date" className="input" value={data.targetDate || ''} onChange={e => u('targetDate', e.target.value)} />
      )}

      <SecHead title="3 — Tub & Shower" />
      <p className="assess-hint">What are we doing with the tub / shower?</p>
      {['Keep existing tub', 'Replace tub', 'Remove tub — convert to shower',
        'New shower — tile', 'New shower — prefab / surround', 'New glass enclosure',
        'Walk-in shower', 'Undecided'].map(opt =>
        <CheckOpt key={opt} label={opt} selected={isSel('tubShowerScope', opt)} onToggle={() => toggle('tubShowerScope', opt)} />
      )}

      <SecHead title="4 — Vanity & Fixtures" />
      <p className="assess-hint">Select all that apply</p>
      {['New vanity — customer provides, we install', 'Keeping existing vanity',
        'New countertop on existing vanity', 'New sink only', 'New faucet only',
        'New mirror / medicine cabinet', 'New toilet', 'New exhaust fan',
        'Towel bars and accessories — customer provides', 'Heated floor'].map(opt =>
        <CheckOpt key={opt} label={opt} selected={isSel('vanityScope', opt)} onToggle={() => toggle('vanityScope', opt)} />
      )}

      <SecHead title="5 — Tile Work" />
      {['Wall tile — we install', 'Floor tile — we install',
        'Shower / tub surround tile — we install', 'Customer sources all tile materials'].map(opt =>
        <CheckOpt key={opt} label={opt} selected={isSel('tileScope', opt)} onToggle={() => toggle('tileScope', opt)} />
      )}

      <SecHead title="6 — Grout Color" />
      <textarea className="textarea" rows={2} placeholder="Grout color preference…"
        value={data.groutNotes || ''} onChange={e => u('groutNotes', e.target.value)} />

      <SecHead title="7 — Tile Pattern" />
      <textarea className="textarea" rows={2} placeholder="Tile pattern preference…"
        value={data.tilePatternNotes || ''} onChange={e => u('tilePatternNotes', e.target.value)} />

      <SecHead title="8 — Lighting" />
      <div className="q-card">
        <div className="toggle-row" style={{ marginBottom: 10 }}>
          <span className="toggle-label">Will there be recessed lights?</span>
          <Toggle on={!!data.recessedLights} onToggle={() => u('recessedLights', !data.recessedLights)} />
        </div>
        {data.recessedLights && (
          <input type="number" className="input" placeholder="How many?" min="0"
            value={data.recessedLightsCount || ''} onChange={e => u('recessedLightsCount', e.target.value)} />
        )}
      </div>

      <SecHead title="9 & 10 — Trades" />
      {(['Electrical', 'Plumbing'] as const).map(label => {
        const key = label.toLowerCase() as 'electrical' | 'plumbing';
        return (
          <div key={key} className="q-card">
            <div className="q-card-label">{label} — who will handle?</div>
            {['We will handle through our subcontractors', 'Customer will hire their own'].map(opt =>
              <CheckOpt key={opt} label={opt} selected={data[key] === opt} onToggle={() => u(key, opt)} round />
            )}
          </div>
        );
      })}

      <SecHead title="11 — Permits" />
      {['Yes', 'No', 'Unknown'].map(opt =>
        <CheckOpt key={opt} label={opt} selected={data.permits === opt} onToggle={() => u('permits', opt)} round />
      )}

      <SecHead title="12 — How Did You Hear About Us?" />
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

      <SecHead title="12 — Special Notes" />
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
