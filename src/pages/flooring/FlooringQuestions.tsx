import { useEffect, useState } from 'react';
import CheckOpt from '../../components/CheckOpt';
import Toggle from '../../components/Toggle';
import CollapseSection from '../../components/CollapseSection';
import AddQuestionsModal from '../../components/AddQuestionsModal';
import { fetchDropdownList } from '../../utils/dropdownManager';
import type { DropdownOption } from '../../utils/dropdownManager';
import type { FlooringQuestions as FQ } from '../../types';

const SPECIAL_NOTES_ITEMS = [
  'Pet in home', 'Access restrictions', 'Asbestos concern', 'Second floor job',
  'Narrow doorways', 'HOA approval needed', 'Occupied during work', 'Fragile items present',
];

interface Props { data: FQ; onUpdate: (d: FQ) => void; }

export default function FlooringQuestions({ data, onUpdate }: Props) {
  const [showAddQuestionsModal, setShowAddQuestionsModal] = useState(false);
  const u = (f: keyof FQ, v: unknown) => onUpdate({ ...data, [f]: v });
  const toggle = (field: keyof FQ, val: string) => {
    const c = (data[field] as string[]) || [];
    u(field, c.includes(val) ? c.filter(x => x !== val) : [...c, val]);
  };
  const isSel = (field: keyof FQ, val: string) => ((data[field] as string[]) || []).includes(val);

  const [materials, setMaterials] = useState<DropdownOption[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  const availableQuestions = [
    { key: 'material', label: '1 — Flooring Material' },
    { key: 'removeExisting', label: '2 — Remove Existing' },
    { key: 'subfloor', label: '3 — Subfloor Repairs' },
    { key: 'underlayment', label: '4 — Underlayment' },
    { key: 'stairNosing', label: '5 — Stair Nosing' },
    { key: 'matching', label: '6 — Matching Existing' },
    { key: 'timeline', label: '7 — Timeline' },
    { key: 'referral', label: '8 — How Did You Hear About Us?' },
    { key: 'specialNotes', label: '9 — Special Notes' },
  ];

  const fieldsPerQuestion: Record<string, string[]> = {
    material: ['material', 'customMaterial'],
    removeExisting: ['removeExisting'],
    subfloor: ['subfloorRepairs'],
    underlayment: ['underlayment'],
    stairNosing: ['stairNosing'],
    matching: ['matchingOther'],
    timeline: ['timeline', 'targetDate'],
    referral: ['referral', 'referralName', 'referralOther'],
    specialNotes: ['specialNoteItems', 'specialNotes'],
  };

  const visibleQuestions = data.visibleQuestions ?? [];
  const isQuestionVisible = (key: string) => visibleQuestions.includes(key);

  function handleSaveQuestions(visible: string[]) {
    u('visibleQuestions', visible);
  }

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

        {isQuestionVisible('material') && <CollapseSection title="1 — Flooring Material" defaultOpen={false}>
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
          <input className="input" placeholder="Other material (not saved to list)" style={{ marginTop: 8 }}
            value={data.customMaterial || ''} onChange={e => u('customMaterial', e.target.value)} />
        </CollapseSection>}

        {isQuestionVisible('removeExisting') && <CollapseSection title="2 — Remove Existing Flooring?" defaultOpen={false}>
          <div className="q-card">
            <div className="toggle-row">
              <span className="toggle-label">Remove existing flooring?</span>
              <Toggle on={!!data.removeExisting} onToggle={() => u('removeExisting', !data.removeExisting)} />
            </div>
          </div>
        </CollapseSection>}

        {isQuestionVisible('subfloor') && <CollapseSection title="3 — Subfloor Repairs?" defaultOpen={false}>
          {['Yes', 'No', 'Unknown'].map(opt =>
            <CheckOpt key={opt} label={opt} selected={data.subfloorRepairs === opt}
              onToggle={() => u('subfloorRepairs', opt)} round />
          )}
        </CollapseSection>}

        {isQuestionVisible('underlayment') && <CollapseSection title="4 — Underlayment Needed?" defaultOpen={false}>
          <div className="q-card">
            <div className="toggle-row">
              <span className="toggle-label">Underlayment needed?</span>
              <Toggle on={!!data.underlayment} onToggle={() => u('underlayment', !data.underlayment)} />
            </div>
          </div>
        </CollapseSection>}

        {isQuestionVisible('stairNosing') && <CollapseSection title="5 — Stair Nosing Needed?" defaultOpen={false}>
          <div className="q-card">
            <div className="toggle-row">
              <span className="toggle-label">Stair nosing needed?</span>
              <Toggle on={!!data.stairNosing} onToggle={() => u('stairNosing', !data.stairNosing)} />
            </div>
          </div>
        </CollapseSection>}

        {isQuestionVisible('matching') && <CollapseSection title="6 — Matching Existing Flooring?" defaultOpen={false}>
          <div className="q-card">
            <div className="toggle-row">
              <span className="toggle-label">Matching existing flooring in other rooms?</span>
              <Toggle on={!!data.matchingOther} onToggle={() => u('matchingOther', !data.matchingOther)} />
            </div>
          </div>
        </CollapseSection>}

        {isQuestionVisible('timeline') && <CollapseSection title="7 — Timeline" defaultOpen={false}>
          {['Under 3 months', '3 to 6 months', '6 to 12 months', 'No rush', 'Specific target date'].map(opt =>
            <CheckOpt key={opt} label={opt} selected={data.timeline === opt} onToggle={() => u('timeline', opt)} round />
          )}
          {data.timeline === 'Specific target date' && (
            <input type="date" className="input" value={data.targetDate || ''} onChange={e => u('targetDate', e.target.value)} />
          )}
        </CollapseSection>}

        {isQuestionVisible('referral') && <CollapseSection title="8 — How Did You Hear About Us?" defaultOpen={false}>
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

        {isQuestionVisible('specialNotes') && <CollapseSection title="9 — Special Notes" defaultOpen={false}>
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
        </CollapseSection>}
      </div>
    </>
  );
}
