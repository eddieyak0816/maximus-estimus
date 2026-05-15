import { useState, useRef } from 'react';
import Toggle from './Toggle';
import MeasInput from './MeasInput';
import ChevronIcon from './ChevronIcon';
import DropdownSelect from './DropdownSelect';
import type { WallData, WindowData, DoorData, OutletData, ApplianceOnWall } from '../types';

// ── Window card ───────────────────────────────────────────────────────────────
function WindowCard({ win, index, onUpdate, onRemove }: {
  win: WindowData; index: number;
  onUpdate: (v: WindowData) => void; onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);
  const u = (f: keyof WindowData, v: string) => onUpdate({ ...win, [f]: v });
  return (
    <div className="sub-card">
      <div className="sub-card-header" style={{ cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <span className="sub-card-title">Window {index + 1}</span>
        <div className="sub-card-actions">
          <ChevronIcon open={open} onClick={e => { e.stopPropagation(); setOpen(o => !o); }} />
          <button className="icon-btn danger" onClick={e => { e.stopPropagation(); onRemove(); }}>✕</button>
        </div>
      </div>
      {open && <>
        <div className="sub-section-label">INTERIOR</div>
        <div className="grid-2">
          {([
            ['Width', 'width'],
            ['Height', 'height'],
            ['Distance from Left Corner', 'leftCorner'],
            ['Distance from Right Corner', 'rightCorner'],
          ] as [string, keyof WindowData][]).map(([l, k]) => (
            <div key={k}>
              <div className="tiny-label">{l}</div>
              <input className="input input-sm" placeholder='0"' value={win[k] || ''} onChange={e => u(k, e.target.value)} />
            </div>
          ))}
        </div>
        <div className="tiny-label" style={{ marginTop: 8 }}>Sill Height from Countertop</div>
        <input className="input input-sm" placeholder='0"' value={win.sillHeight || ''} onChange={e => u('sillHeight', e.target.value)} />
        <div className="sub-section-label" style={{ marginTop: 10 }}>TRIM WIDTH</div>
        <div className="grid-2">
          {([
            ['Left Side', 'trimLeft'],
            ['Right Side', 'trimRight'],
            ['Top', 'trimTop'],
            ['Bottom (Apron)', 'trimBottom'],
          ] as [string, keyof WindowData][]).map(([l, k]) => (
            <div key={k}>
              <div className="tiny-label">{l}</div>
              <input className="input input-sm" placeholder='0"' value={win[k] || ''} onChange={e => u(k, e.target.value)} />
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

// ── Door card ─────────────────────────────────────────────────────────────────
function DoorCard({ door, index, onUpdate, onRemove }: {
  door: DoorData; index: number;
  onUpdate: (v: DoorData) => void; onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);
  const u = (f: keyof DoorData, v: string) => onUpdate({ ...door, [f]: v } as DoorData);
  const title = door.type === 'Opening' ? `Opening ${index + 1}` : `Door ${index + 1}`;
  return (
    <div className="sub-card">
      <div className="sub-card-header" style={{ cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <span className="sub-card-title">{title}</span>
        <div className="sub-card-actions">
          <ChevronIcon open={open} onClick={e => { e.stopPropagation(); setOpen(o => !o); }} />
          <button className="icon-btn danger" onClick={e => { e.stopPropagation(); onRemove(); }}>✕</button>
        </div>
      </div>
      {open && <>
        <div className="pill-group" style={{ marginBottom: 10 }}>
          {(['Door', 'Opening'] as const).map(t => (
            <button key={t} className={`pill${door.type === t ? ' active' : ''}`} onClick={() => u('type', t)}>{t}</button>
          ))}
        </div>
        <div className="grid-2" style={{ marginBottom: 10 }}>
          {([
            ['Width', 'width'],
            ['Height', 'height'],
            ['Distance from Left Corner', 'leftCorner'],
            ['Distance from Right Corner', 'rightCorner'],
          ] as [string, keyof DoorData][]).map(([l, k]) => (
            <div key={k}>
              <div className="tiny-label">{l}</div>
              <input className="input input-sm" placeholder='0"' value={(door[k] as string) || ''} onChange={e => u(k, e.target.value)} />
            </div>
          ))}
        </div>
        <div className="tiny-label">Swing Direction</div>
        <div className="pill-group" style={{ marginTop: 6, marginBottom: 10 }}>
          {(['Left', 'Right', 'Both', 'N/A'] as const).map(d => (
            <button key={d} className={`pill${door.swing === d ? ' active' : ''}`} onClick={() => onUpdate({ ...door, swing: d })}>{d}</button>
          ))}
        </div>
        {door.type !== 'Opening' && (
          <>
            <div className="sub-section-label">TRIM WIDTH</div>
            <div className="grid-2">
              {([
                ['Left Side', 'trimLeft'],
                ['Right Side', 'trimRight'],
                ['Top', 'trimTop'],
              ] as [string, keyof DoorData][]).map(([l, k]) => (
                <div key={k}>
                  <div className="tiny-label">{l}</div>
                  <input className="input input-sm" placeholder='0"' value={(door[k] as string) || ''} onChange={e => u(k, e.target.value)} />
                </div>
              ))}
            </div>
          </>
        )}
      </>}
    </div>
  );
}

// ── Appliance card ────────────────────────────────────────────────────────────
function ApplianceCard({ app, onUpdate, onRemove }: {
  app: ApplianceOnWall;
  onUpdate: (v: ApplianceOnWall) => void; onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="sub-card">
      <div className="sub-card-header">
        <div style={{ flex: 1 }}>
          <DropdownSelect
            listName="appliance_names"
            value={app.name}
            onChange={(val) => onUpdate({ ...app, name: val })}
            placeholder="Select appliance…"
            allowCustom={true}
          />
        </div>
        <div className="sub-card-actions">
          {app.name && <ChevronIcon open={open} onClick={() => setOpen(o => !o)} />}
          <button className="icon-btn danger" onClick={onRemove}>✕</button>
        </div>
      </div>
      {open && app.name && <>
        <div className="grid-3" style={{ marginTop: 8 }}>
          {([['Width', 'w'], ['Height', 'h'], ['Depth', 'd']] as [string, keyof ApplianceOnWall][]).map(([l, f]) => (
            <div key={f}>
              <div className="tiny-label">{l}</div>
              <input className="input input-sm" placeholder='0"' value={(app[f] as string) || ''}
                onChange={e => onUpdate({ ...app, [f]: e.target.value })} />
            </div>
          ))}
        </div>
        <div className="tiny-label" style={{ marginTop: 8, marginBottom: 4 }}>Measure from which corner?</div>
        <div className="pill-group" style={{ marginBottom: 6 }}>
          {(['Left', 'Right'] as const).map(c => (
            <button key={c} className={`pill pill-sm${app.corner === c ? ' active' : ''}`}
              onClick={() => onUpdate({ ...app, corner: c })}>{c}</button>
          ))}
        </div>
        <div className="tiny-label" style={{ marginBottom: 4 }}>Distance from corner</div>
        <input className="input input-sm" placeholder='0"' value={app.loc || ''}
          onChange={e => onUpdate({ ...app, loc: e.target.value })} />
      </>}
    </div>
  );
}

// ── Outlet row ────────────────────────────────────────────────────────────────
function OutletRow({ outlet, onUpdate, onRemove }: {
  outlet: OutletData; onUpdate: (v: OutletData) => void; onRemove: () => void;
}) {
  return (
    <div className="outlet-row">
      <div className="pill-group">
        {(['Outlet', 'Switch'] as const).map(t => (
          <button key={t} className={`pill pill-sm${outlet.type === t ? ' active' : ''}`}
            onClick={() => onUpdate({ ...outlet, type: t })}>{t}</button>
        ))}
      </div>
      <div className="pill-group">
        {(['Left', 'Right'] as const).map(c => (
          <button key={c} className={`pill pill-sm${outlet.corner === c ? ' active' : ''}`}
            onClick={() => onUpdate({ ...outlet, corner: c })}>{c}</button>
        ))}
      </div>
      <input className="input input-sm" style={{ flex: 1 }} placeholder="Distance from corner"
        value={outlet.location || ''} onChange={e => onUpdate({ ...outlet, location: e.target.value })} />
      <button className="remove-btn" onClick={onRemove}>×</button>
    </div>
  );
}

// ── Wall section ──────────────────────────────────────────────────────────────
interface WallProps {
  wall: string;
  data: WallData;
  onUpdate: (v: WallData) => void;
  globalHasSoffit?: boolean;
  soffitSame?: boolean;
  globalSoffitH?: string;
  globalSoffitD?: string;
}

export default function WallSection({ wall, data, onUpdate, globalHasSoffit, soffitSame, globalSoffitH, globalSoffitD }: WallProps) {
  const [open, setOpen] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [soffitOpen, setSoffitOpen] = useState(true);
  const [sinkOpen, setSinkOpen] = useState(true);
  const [cabsOpen, setCabsOpen] = useState(true);
  const dropdownRef = useRef<any>(null);
  const u = (f: keyof WallData, v: unknown) => onUpdate({ ...data, [f]: v });

  const addWin = () => u('windows', [...(data.windows || []), {}]);
  const addDoor = () => u('doors', [...(data.doors || []), { type: 'Door' as const }]);
  const addOutlet = () => u('outlets', [...(data.outlets || []), { type: 'Outlet' as const }]);
  const addAppliance = () => u('appliances', [...(data.appliances || []), { name: '' }]);

  const done = !!data.length;
  const appCount = (data.appliances || []).filter(a => a.name).length;
  const displayName = data.name || `Wall ${wall}`;

  const toggleOpen = () => { if (!renaming) setOpen(o => !o); };

  return (
    <div className="wall-section">
      <div className="wall-header" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={toggleOpen}>
        <ChevronIcon open={open} onClick={e => { e.stopPropagation(); toggleOpen(); }} />
        <div className={`wall-badge${done ? ' done' : ''}`}>
          {done
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            : <span>{wall}</span>}
        </div>
        <div className="wall-meta" style={{ flex: 1 }}>
          {renaming
            ? <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <DropdownSelect
                    ref={dropdownRef}
                    listName="wall_labels"
                    value={data.name || ''}
                    onChange={v => u('name', v)}
                    placeholder="Select wall label…"
                    allowCustom={true}
                    hideCustomButton={true}
                    onConfirm={() => setRenaming(false)}
                  />
                </div>
                <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); setRenaming(false); }}>OK</button>
              </div>
            : <div className="wall-name-row">
                <span className="wall-name">{displayName}</span>
                <button className="icon-btn" title="Rename"
                  onClick={e => { e.stopPropagation(); setRenaming(true); }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </button>
              </div>}
          <div className="wall-sub">
            {(data.windows || []).length} win · {(data.doors || []).length} door · {(data.outlets || []).length} outlet · {appCount} appl{data.hasSink ? ' · sink' : ''}{(data.hasUpperCabs || data.hasBaseCabs || data.hasTallCab) ? ' · cabs' : ''}
          </div>
        </div>
      </div>

      {open && (
        <div className="wall-body">
          <MeasInput label="Wall Length" value={data.length} onChange={v => u('length', v)} />

          {/* Ceiling override */}
          <div className="toggle-row">
            <span className="toggle-label">Override ceiling height?</span>
            <Toggle on={!!data.ceilOvr} onToggle={() => u('ceilOvr', !data.ceilOvr)} />
          </div>
          {data.ceilOvr && <MeasInput label={`Ceiling Height — ${displayName}`} value={data.ceilH} onChange={v => u('ceilH', v)} />}

          {/* Per-wall soffit */}
          {globalHasSoffit && !soffitSame && (
            <div className="soffit-override-box">
              <div className="soffit-override-header" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setSoffitOpen(o => !o)}>
                <ChevronIcon open={soffitOpen} onClick={e => { e.stopPropagation(); setSoffitOpen(o => !o); }} />
                <span className="soffit-override-label">SOFFIT — {displayName}</span>
              </div>
              {soffitOpen && (
                <>
                  <div className="grid-3">
                    {([
                      ['Height', 'sH', globalSoffitH],
                      ['Depth', 'sD', globalSoffitD],
                      ['Width', 'sW', undefined],
                    ] as [string, keyof WallData, string | undefined][]).map(([l, k, globalVal]) => (
                      <div key={k}>
                        <div className="tiny-label">{l}</div>
                        <input className="input input-sm" placeholder={globalVal || '0"'}
                          value={(data[k] as string) || ''} onChange={e => u(k, e.target.value)} />
                      </div>
                    ))}
                  </div>
                  {data.length && (
                    <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}
                      onClick={() => u('sW', data.length)}>
                      = Same as wall length ({data.length})
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Windows */}
          <div className="wall-sub-section">
            <div className="wall-sub-section-header">
              <span className="tiny-label">Windows</span>
              <button className="chip-btn" onClick={addWin}>+ Add Window</button>
            </div>
            {(data.windows || []).map((w, i) => (
              <WindowCard key={i} win={w} index={i}
                onUpdate={v => { const a = [...(data.windows || [])]; a[i] = v; u('windows', a); }}
                onRemove={() => u('windows', (data.windows || []).filter((_, x) => x !== i))} />
            ))}
          </div>

          {/* Doors */}
          <div className="wall-sub-section">
            <div className="wall-sub-section-header">
              <span className="tiny-label">Doors / Openings</span>
              <button className="chip-btn" onClick={addDoor}>+ Add Door</button>
            </div>
            {(data.doors || []).map((d, i) => (
              <DoorCard key={i} door={d} index={i}
                onUpdate={v => { const a = [...(data.doors || [])]; a[i] = v; u('doors', a); }}
                onRemove={() => u('doors', (data.doors || []).filter((_, x) => x !== i))} />
            ))}
          </div>

          {/* Outlets */}
          <div className="wall-sub-section">
            <div className="wall-sub-section-header">
              <span className="tiny-label">Outlets & Switches</span>
              <button className="chip-btn" onClick={addOutlet}>+ Add</button>
            </div>
            {(data.outlets || []).map((o, i) => (
              <OutletRow key={i} outlet={o}
                onUpdate={v => { const a = [...(data.outlets || [])]; a[i] = v; u('outlets', a); }}
                onRemove={() => u('outlets', (data.outlets || []).filter((_, x) => x !== i))} />
            ))}
          </div>

          {/* Appliances on wall */}
          <div className="wall-sub-section">
            <div className="wall-sub-section-header">
              <span className="tiny-label">Appliances on this wall</span>
              <button className="chip-btn" onClick={addAppliance}>+ Add</button>
            </div>
            {(data.appliances || []).map((app, i) => (
              <ApplianceCard key={i} app={app}
                onUpdate={v => { const a = [...(data.appliances || [])]; a[i] = v; u('appliances', a); }}
                onRemove={() => u('appliances', (data.appliances || []).filter((_, x) => x !== i))} />
            ))}
          </div>

          {/* Plumbing / Sink */}
          <div className="wall-sub-section">
            <div className="toggle-row">
              <span className="tiny-label">Sink / Plumbing on this wall?</span>
              <Toggle on={!!data.hasSink} onToggle={() => u('hasSink', !data.hasSink)} />
            </div>
            {data.hasSink && (
              <>
                <div className="soffit-override-header" style={{ marginTop: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setSinkOpen(o => !o)}>
                  <ChevronIcon open={sinkOpen} onClick={e => { e.stopPropagation(); setSinkOpen(o => !o); }} />
                  <span className="soffit-override-label">SINK / PLUMBING — {displayName}</span>
                </div>
                {sinkOpen && (
                  <div className="plumbing-box">
                    <div className="tiny-label" style={{ marginBottom: 4 }}>Sink type</div>
                    <div className="pill-group" style={{ marginBottom: 10 }}>
                      {['Undermount', 'Apron Front', 'Other'].map(t => (
                        <button key={t} className={`pill${data.sinkType === t ? ' active' : ''}`}
                          onClick={() => u('sinkType', t)}>{t}</button>
                      ))}
                    </div>
                    {data.sinkType === 'Other' && (
                      <input className="input input-sm" style={{ marginBottom: 8 }} placeholder="Describe sink type…"
                        value={data.sinkTypeOther || ''} onChange={e => u('sinkTypeOther', e.target.value)} />
                    )}
                    <div className="tiny-label" style={{ marginBottom: 4 }}>Measure from which corner?</div>
                    <div className="pill-group" style={{ marginBottom: 8 }}>
                      {(['Left', 'Right'] as const).map(c => (
                        <button key={c} className={`pill${data.sinkCorner === c ? ' active' : ''}`}
                          onClick={() => u('sinkCorner', c)}>{c}</button>
                      ))}
                    </div>
                    <MeasInput label="Sink Location from Corner" value={data.sinkLoc} onChange={v => u('sinkLoc', v)} />
                    <MeasInput label="Existing Sink Cabinet Width" value={data.sinkCabExistingW} onChange={v => u('sinkCabExistingW', v)} />
                    <MeasInput label="Desired Sink Cabinet Width" value={data.sinkCabDesiredW} onChange={v => u('sinkCabDesiredW', v)} />
                    <MeasInput label="Sink Width" value={data.sinkW} onChange={v => u('sinkW', v)} />
                    <MeasInput label="Sink Depth" value={data.sinkD} onChange={v => u('sinkD', v)} />
                    <MeasInput label="Faucet Location" value={data.faucetLoc} onChange={v => u('faucetLoc', v)} />
                    <MeasInput label="Dishwasher Water Line" value={data.dwLine} onChange={v => u('dwLine', v)} />
                    <MeasInput label="Ice Maker Line" value={data.imLine} onChange={v => u('imLine', v)} />
                    <div className="toggle-row">
                      <span className="toggle-label">Garbage Disposal?</span>
                      <Toggle on={!!data.disposal} onToggle={() => u('disposal', !data.disposal)} />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Existing Cabinets */}
          <div className="wall-sub-section">
            <div className="wall-sub-section-header" style={{ cursor: 'pointer', gap: 8 }} onClick={() => setCabsOpen(o => !o)}>
              <ChevronIcon open={cabsOpen} onClick={e => { e.stopPropagation(); setCabsOpen(o => !o); }} />
              <span className="tiny-label">Existing Cabinets on this wall</span>
            </div>
            {cabsOpen && (
              <>
                <div className="toggle-row">
                  <span className="toggle-label">Upper cabinets?</span>
                  <Toggle on={!!data.hasUpperCabs} onToggle={() => u('hasUpperCabs', !data.hasUpperCabs)} />
                </div>
                {data.hasUpperCabs && (
                  <div className="plumbing-box">
                    <MeasInput label="Upper Cabinet Height" value={data.upperCabH} onChange={v => u('upperCabH', v)} />
                    <MeasInput label="Upper Cabinet Depth" value={data.upperCabD} onChange={v => u('upperCabD', v)} />
                  </div>
                )}
                <div className="toggle-row">
                  <span className="toggle-label">Base cabinets?</span>
                  <Toggle on={!!data.hasBaseCabs} onToggle={() => u('hasBaseCabs', !data.hasBaseCabs)} />
                </div>
                <div className="toggle-row">
                  <span className="toggle-label">Tall / pantry cabinet?</span>
                  <Toggle on={!!data.hasTallCab} onToggle={() => u('hasTallCab', !data.hasTallCab)} />
                </div>
                {data.hasTallCab && (
                  <div className="plumbing-box">
                    <MeasInput label="Tall Cabinet Height" value={data.tallCabH} onChange={v => u('tallCabH', v)} />
                    <MeasInput label="Tall Cabinet Depth" value={data.tallCabD} onChange={v => u('tallCabD', v)} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Cabinet layout notes */}
          <div className="wall-sub-section">
            <div className="tiny-label">Cabinet layout notes for this wall</div>
            <textarea className="textarea" rows={2} style={{ marginTop: 6 }}
              placeholder="Describe cabinet layout, desk area, special features…"
              value={data.cabinetNotes || ''}
              onChange={e => u('cabinetNotes', e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}
