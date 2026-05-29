import { useState } from 'react';
import CheckOpt from '../../components/CheckOpt';
import Toggle from '../../components/Toggle';
import CollapseSection from '../../components/CollapseSection';
import QuestionsSectionAnchors from '../../components/QuestionsSectionAnchors';
import AddQuestionsModal from '../../components/AddQuestionsModal';
import type { KitchenQuestions as KQ } from '../../types';

const APPLIANCE_TYPES = [
  'Refrigerator','Range / Slide-in','Cooktop','Wall Oven','Dishwasher',
  'Microwave (Over Range)','Microwave (Built-in)','Hood / Range Hood',
  'Warming Drawer','Wine Fridge','Trash Compactor',
];
const SPECIAL_NOTES_ITEMS = [
  'Pet in home','Access restrictions','Asbestos concern','Second floor job',
  'Narrow doorways','HOA approval needed','Occupied during work','Fragile items present',
];

const CABINET_STYLES = [
  { name: 'Shaker', desc: 'Clean lines, recessed center panel', color: '#c4a882' },
  { name: 'Raised Panel', desc: 'Traditional elegance with raised detailing', color: '#b89f80' },
  { name: 'Flat Panel / Slab', desc: 'Modern, minimal, no frame or panel', color: '#a8a49f' },
  { name: 'Glass Front', desc: 'Display-friendly, open and airy', color: '#8ab4c4' },
];

interface Props { data: KQ; onUpdate: (d: KQ) => void; }

export default function KitchenQuestions({ data, onUpdate }: Props) {
  const [showGallery, setShowGallery] = useState(false);
  const [showAddQuestionsModal, setShowAddQuestionsModal] = useState(false);
  const u = (f: keyof KQ, v: unknown) => onUpdate({ ...data, [f]: v });
  const toggle = (field: keyof KQ, val: string) => {
    const c = (data[field] as string[]) || [];
    u(field, c.includes(val) ? c.filter(x => x !== val) : [...c, val]);
  };
  const isSel = (field: keyof KQ, val: string) => ((data[field] as string[]) || []).includes(val);

  const sectionHasContent = (fields: (keyof KQ)[]): boolean => {
    return fields.some(field => {
      const value = data[field];
      if (value === null || value === undefined) return false;
      if (value === '' || value === false) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    });
  };

  /* ── Inline cabinet gallery ── */
  if (showGallery) return (
    <div className="assess-tab">
      <div className="gallery-back-row">
        <button className="btn btn-ghost btn-sm" onClick={() => setShowGallery(false)}>← Back to Questions</button>
        <span className="gallery-title">Cabinet Style Gallery</span>
      </div>
      {CABINET_STYLES.map(style => {
        const sel = data.cabinetStyle === style.name;
        return (
          <div key={style.name} className={`gallery-style-card${sel ? ' selected' : ''}`}>
            <div className="gallery-style-preview" style={{ background: style.color }}>
              {[1,2,3].map(i => (
                <div key={i} className="cabinet-door-mock">
                  <div className="cabinet-door-inner" />
                </div>
              ))}
            </div>
            <div className="gallery-style-info">
              <div className="gallery-style-name">{style.name}</div>
              <div className="gallery-style-desc">{style.desc}</div>
              <button
                className={`btn btn-sm${sel ? ' btn-outline' : ' btn-ghost'}`}
                style={{ marginTop: 8 }}
                onClick={() => u('cabinetStyle', sel ? undefined : style.name)}>
                {sel ? '✓ Selected' : 'Select Style'}
              </button>
              <input className="input" style={{ marginTop: 8, fontSize: 12 }}
                placeholder="Paste link to send customer…"
                value={(data as Record<string, string>)[`${style.name}Link`] || ''}
                onChange={e => onUpdate({ ...data, [`${style.name}Link`]: e.target.value } as KQ)} />
            </div>
          </div>
        );
      })}
    </div>
  );

  const availableQuestions = [
    { key: 'scope', label: '1 — Project Scope' },
    { key: 'reason', label: '2 — Reason for Renovating' },
    { key: 'timeline', label: '3 — Timeline' },
    { key: 'cabinets', label: '4 — Cabinets' },
    { key: 'cabinetStyle', label: '5 — Cabinet Style' },
    { key: 'countertop', label: '6 — Countertops' },
    { key: 'backsplash', label: '7 — Backsplash' },
    { key: 'sink', label: '8 & 9 — Sink & Faucet' },
    { key: 'appliance', label: '10 & 11 — Appliances' },
    { key: 'lighting', label: '12 — Lighting' },
    { key: 'hardware', label: '14 — Cabinet Hardware' },
    { key: 'trades', label: '15 & 16 — Trades' },
    { key: 'flooring', label: '17 — Flooring' },
    { key: 'permits', label: '18 — Permits' },
    { key: 'referral', label: '19 — How Did You Hear About Us?' },
    { key: 'specialNotes', label: '20 — Special Notes' },
  ];

  const fieldsPerQuestion: Record<string, string[]> = {
    scope: ['scope'],
    reason: ['reason', 'reasonOther'],
    timeline: ['timeline', 'targetDate'],
    cabinets: ['cabinets'],
    cabinetStyle: ['cabinetStyle', 'cabinetNotes'],
    countertop: ['countertopNotes'],
    backsplash: ['backsplashInstall', 'backsplashMaterial', 'backsplashOther', 'backsplashNotes'],
    sink: ['sinkNotes', 'faucetNotes'],
    appliance: ['applianceScope', 'applianceList'],
    lighting: ['recessedLights', 'recessedLightsCount'],
    hardware: [],
    trades: ['electrical', 'plumbing'],
    flooring: ['flooringIncluded', 'flooringType'],
    permits: ['permits'],
    referral: ['referral', 'referralName', 'referralOther'],
    specialNotes: ['specialNoteItems', 'specialNotes'],
  };

  // Auto-show questions that have content (for existing jobs)
  const getDefaultVisibleQuestions = () => {
    if (data.visibleQuestions) return data.visibleQuestions;
    const withContent: string[] = [];
    availableQuestions.forEach(q => {
      const fields = (fieldsPerQuestion[q.key] || []) as (keyof KQ)[];
      if (sectionHasContent(fields)) withContent.push(q.key);
    });
    return withContent;
  };
  const visibleQuestions = getDefaultVisibleQuestions();
  const isQuestionVisible = (key: string) => visibleQuestions.includes(key);

  function handleSaveQuestions(visible: string[]) {
    u('visibleQuestions', visible);
  }

  const sections = availableQuestions.map(q => ({ id: q.key, label: q.label })).filter(s => isQuestionVisible(s.id));

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '10px' }}>
          <QuestionsSectionAnchors sections={sections} data={data} />
          <button className="btn btn-ghost btn-sm" onClick={() => setShowAddQuestionsModal(true)}>
            ⚙️ Customize
          </button>
        </div>
        {isQuestionVisible('scope') && <CollapseSection title="1 — Project Scope" defaultOpen={false} id="section-scope" hasContent={sectionHasContent(['scope'])}>
          <p className="assess-hint">Select all that apply</p>
          {['Full gut renovation','Cabinet replacement only','Countertops only','Multiple items but not a full gut'].map(opt =>
            <CheckOpt key={opt} label={opt} selected={isSel('scope', opt)} onToggle={() => toggle('scope', opt)} />
          )}
        </CollapseSection>}

        {isQuestionVisible('reason') && <CollapseSection title="2 — Reason for Renovating" defaultOpen={false} id="section-reason" hasContent={sectionHasContent(['reason', 'reasonOther'])}>
          <p className="assess-hint">Select all that apply</p>
          {['Outdated','Damaged','Full remodel','Preparing to sell','Other'].map(opt =>
            <CheckOpt key={opt} label={opt} selected={isSel('reason', opt)} onToggle={() => toggle('reason', opt)} />
          )}
          {isSel('reason', 'Other') && (
            <textarea className="textarea" rows={2} placeholder="Describe reason…"
              value={data.reasonOther || ''} onChange={e => u('reasonOther', e.target.value)} />
          )}
        </CollapseSection>}

        {isQuestionVisible('timeline') && <CollapseSection title="3 — Timeline" defaultOpen={false} id="section-timeline" hasContent={sectionHasContent(['timeline', 'targetDate'])}>
          {['Under 3 months','3 to 6 months','6 to 12 months','No rush','Specific target date'].map(opt =>
            <CheckOpt key={opt} label={opt} selected={data.timeline === opt} onToggle={() => u('timeline', opt)} round />
          )}
          {data.timeline === 'Specific target date' && (
            <input type="date" className="input" value={data.targetDate || ''} onChange={e => u('targetDate', e.target.value)} />
          )}
        </CollapseSection>}

        {isQuestionVisible('cabinets') && <CollapseSection title="4 — Cabinets" defaultOpen={false} id="section-cabinets" hasContent={sectionHasContent(['cabinets'])}>
          {['New cabinets','Partial replacement'].map(opt =>
            <CheckOpt key={opt} label={opt} selected={isSel('cabinets', opt)} onToggle={() => toggle('cabinets', opt)} />
          )}
        </CollapseSection>}

        {isQuestionVisible('cabinetStyle') && <CollapseSection title="5 — Cabinet Style" defaultOpen={false} id="section-cabinetStyle" hasContent={sectionHasContent(['cabinetStyle', 'cabinetNotes'])}>
          <div className="q-card">
            <div className="q-card-header">
              <span>Style Preference</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowGallery(true)}>Open Gallery →</button>
            </div>
            {data.cabinetStyle
              ? <div className="selected-style-row">
                  <div className="selected-style-swatch" style={{ background: CABINET_STYLES.find(s => s.name === data.cabinetStyle)?.color || '#c4a882' }} />
                  <div>
                    <div className="selected-style-name">{data.cabinetStyle}</div>
                    <div className="selected-style-hint">Tap gallery to change</div>
                  </div>
                </div>
              : <p className="assess-hint">No style selected — open gallery to choose</p>
            }
            <textarea className="textarea" rows={2} placeholder="Style notes, colors, finishes…"
              value={data.cabinetNotes || ''} onChange={e => u('cabinetNotes', e.target.value)} />
          </div>
        </CollapseSection>}

        {isQuestionVisible('countertop') && <CollapseSection title="6 — Countertops" defaultOpen={false} id="section-countertop" hasContent={sectionHasContent(['countertopNotes'])}>
          <div className="q-card">
            <p className="assess-hint">We offer guidance only — customer sources and arranges fabrication</p>
            <textarea className="textarea" rows={3} placeholder="Customer's material preference…"
              value={data.countertopNotes || ''} onChange={e => u('countertopNotes', e.target.value)} />
          </div>
        </CollapseSection>}

        {isQuestionVisible('backsplash') && <CollapseSection title="7 — Backsplash" defaultOpen={false} id="section-backsplash" hasContent={sectionHasContent(['backsplashInstall', 'backsplashMaterial', 'backsplashOther', 'backsplashNotes'])}>
          <div className="q-card">
            <div className="toggle-row" style={{ marginBottom: 10 }}>
              <span className="toggle-label">Will there be a new backsplash?</span>
              <Toggle on={!!data.backsplashInstall} onToggle={() => u('backsplashInstall', !data.backsplashInstall)} />
            </div>
            {data.backsplashInstall && (
              <>
                <p className="assess-hint" style={{ marginBottom: 8 }}>Material</p>
                {['Tiles','Solid Slab','Other'].map(opt =>
                  <CheckOpt key={opt} label={opt} selected={data.backsplashMaterial === opt} onToggle={() => u('backsplashMaterial', opt)} round />
                )}
                {data.backsplashMaterial === 'Other' && (
                  <input className="input" placeholder="Describe material…" style={{ marginTop: 8 }}
                    value={data.backsplashOther || ''} onChange={e => u('backsplashOther', e.target.value)} />
                )}
              </>
            )}
            <textarea className="textarea" rows={2} placeholder="Additional notes…"
              style={{ marginTop: 10 }}
              value={data.backsplashNotes || ''} onChange={e => u('backsplashNotes', e.target.value)} />
          </div>
        </CollapseSection>}

        {isQuestionVisible('sink') && <CollapseSection title="8 & 9 — Sink & Faucet" defaultOpen={false} id="section-sink" hasContent={sectionHasContent(['sinkNotes', 'faucetNotes'])}>
          <div className="q-card">
            <p className="assess-hint">Customer provides their own sink and faucet</p>
            <div className="tiny-label" style={{ marginBottom: 4 }}>Sink style preference</div>
            <textarea className="textarea" rows={2} placeholder="Undermount, farmhouse, drop-in…"
              style={{ marginBottom: 10 }}
              value={data.sinkNotes || ''} onChange={e => u('sinkNotes', e.target.value)} />
            <div className="tiny-label" style={{ marginBottom: 4 }}>Faucet style preference</div>
            <textarea className="textarea" rows={2} placeholder="Pull-down, single handle, bridge…"
              value={data.faucetNotes || ''} onChange={e => u('faucetNotes', e.target.value)} />
          </div>
        </CollapseSection>}

        {isQuestionVisible('appliance') && <CollapseSection title="10 & 11 — Appliances" defaultOpen={false} id="section-appliance" hasContent={sectionHasContent(['applianceScope', 'applianceList'])}>
          {['Keeping all existing appliances','Replacing all appliances','Replacing some appliances','Customer purchasing appliances themselves','Install only — customer provides'].map(opt =>
            <CheckOpt key={opt} label={opt} selected={isSel('applianceScope', opt)} onToggle={() => toggle('applianceScope', opt)} />
          )}
          {(isSel('applianceScope','Replacing some appliances') || isSel('applianceScope','Replacing all appliances') || isSel('applianceScope','Install only — customer provides')) && (
            <div className="q-card" style={{ marginTop: 8 }}>
              <p className="assess-hint">Which appliances?</p>
              {APPLIANCE_TYPES.map(a =>
                <CheckOpt key={a} label={a} selected={isSel('applianceList', a)} onToggle={() => toggle('applianceList', a)} />
              )}
            </div>
          )}
        </CollapseSection>}

        {isQuestionVisible('lighting') && <CollapseSection title="12 — Lighting" defaultOpen={false} id="section-lighting" hasContent={sectionHasContent(['recessedLights', 'recessedLightsCount'])}>
          <div className="q-card" style={{ marginBottom: 8 }}>
            <div className="toggle-row" style={{ marginBottom: 10 }}>
              <span className="toggle-label">Will there be recessed lights?</span>
              <Toggle on={!!data.recessedLights} onToggle={() => u('recessedLights', !data.recessedLights)} />
            </div>
            {data.recessedLights && (
              <input type="number" className="input" placeholder="How many?" min="0"
                value={data.recessedLightsCount || ''} onChange={e => u('recessedLightsCount', e.target.value)} />
            )}
          </div>
          <div className="q-info-card">
            <span className="q-info-icon">💡</span>
            <div>
              <div className="q-info-title">Other lighting handled separately</div>
              <div className="q-info-sub">Noted on report</div>
            </div>
          </div>
        </CollapseSection>}

        {isQuestionVisible('hardware') && <CollapseSection title="14 — Cabinet Hardware" defaultOpen={false}>
          <div className="q-info-card">
            <span className="q-info-icon">🔩</span>
            <div>
              <div className="q-info-title">Customer provides their own hardware</div>
              <div className="q-info-sub">Noted on report</div>
            </div>
          </div>
        </CollapseSection>}

        {isQuestionVisible('trades') && <CollapseSection title="15 & 16 — Trades" defaultOpen={false} id="section-trades" hasContent={sectionHasContent(['electrical', 'plumbing'])}>
          {(['Electrical','Plumbing'] as const).map(label => {
            const key = label.toLowerCase() as 'electrical' | 'plumbing';
            return (
              <div key={key} className="q-card">
                <div className="q-card-label">{label} — who will handle?</div>
                {['We will handle through our subcontractors','Customer will hire their own'].map(opt =>
                  <CheckOpt key={opt} label={opt} selected={data[key] === opt} onToggle={() => u(key, opt)} round />
                )}
              </div>
            );
          })}
        </CollapseSection>}

        {isQuestionVisible('flooring') && <CollapseSection title="17 — Flooring" defaultOpen={false} id="section-flooring" hasContent={sectionHasContent(['flooringIncluded', 'flooringType'])}>
          <div className="q-card">
            <div className="toggle-row">
              <span className="toggle-label">Flooring included in this job?</span>
              <Toggle on={!!data.flooringIncluded} onToggle={() => u('flooringIncluded', !data.flooringIncluded)} />
            </div>
            {data.flooringIncluded && <>
              <p className="assess-hint" style={{ marginTop: 10 }}>Flooring type</p>
              {['Hardwood','Engineered hardwood','LVP / Luxury vinyl plank','Tile','Carpet','Laminate','Concrete / Epoxy','Undecided'].map(opt =>
                <CheckOpt key={opt} label={opt} selected={isSel('flooringType', opt)} onToggle={() => toggle('flooringType', opt)} />
              )}
            </>}
          </div>
        </CollapseSection>}

        {isQuestionVisible('permits') && <CollapseSection title="18 — Permits" defaultOpen={false} id="section-permits" hasContent={sectionHasContent(['permits'])}>
          {['Yes','No','Unknown'].map(opt =>
            <CheckOpt key={opt} label={opt} selected={data.permits === opt} onToggle={() => u('permits', opt)} round />
          )}
        </CollapseSection>}

        {isQuestionVisible('referral') && <CollapseSection title="19 — How Did You Hear About Us?" defaultOpen={false} id="section-referral" hasContent={sectionHasContent(['referral', 'referralName', 'referralOther'])}>
          {['Referral','Google','Social media','Repeat customer','Other'].map(opt =>
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

        {isQuestionVisible('specialNotes') && <CollapseSection title="20 — Special Notes" defaultOpen={false} id="section-specialNotes" hasContent={sectionHasContent(['specialNoteItems', 'specialNotes'])}>
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
