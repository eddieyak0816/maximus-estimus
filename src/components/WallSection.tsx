import { useState, useRef } from 'react';
import Toggle from './Toggle';
import MeasInput from './MeasInput';
import ChevronIcon from './ChevronIcon';
import DropdownSelect from './DropdownSelect';
import CameraModal from './CameraModal';
import type { WallData, WindowData, DoorData, OutletData, ApplianceOnWall, WallLengthPiece } from '../types';

function newWallLengthPiece(index: number): WallLengthPiece {
  return { id: crypto.randomUUID(), label: `Piece ${index + 1}` };
}

function parseMeasurementToInches(value?: string): number {
  const raw = (value || '').trim().toLowerCase();
  if (!raw) return 0;

  const feetInches = raw.match(/^(\d+(?:\.\d+)?)\s*'\s*(\d+(?:\.\d+)?)?\s*"?$/);
  if (feetInches) {
    return (parseFloat(feetInches[1]) * 12) + (parseFloat(feetInches[2] || '0') || 0);
  }

  const number = parseFloat(raw.replace(/[^0-9.]/g, ''));
  if (isNaN(number)) return 0;
  return raw.includes("'") || raw.includes('ft') ? number * 12 : number;
}

function formatInches(inches: number): string {
  return Number.isInteger(inches) ? `${inches}"` : `${inches.toFixed(1)}"`;
}

// ── Window card ───────────────────────────────────────────────────────────────
function windowHasData(win: WindowData): boolean {
  return !!(win.insideWidth || win.insideHeight || win.withTrimWidth || win.withTrimHeight || win.distanceFromLeftCorner || win.distanceFromRightCorner || win.sillHeight || win.replacing);
}

function WindowCard({ win, index, onUpdate, onRemove, startClosed = false }: {
  win: WindowData; index: number;
  onUpdate: (v: WindowData) => void; onRemove: () => void;
  startClosed?: boolean;
}) {
  const [open, setOpen] = useState(!startClosed);
  const hasData = windowHasData(win);
  const u = (f: keyof WindowData, v: string) => onUpdate({ ...win, [f]: v });

  return (
    <div className={`sub-card ${hasData ? 'sub-card-with-data' : ''}`}>
      <div className="sub-card-header" style={{ cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <span className="sub-card-title">Window {index + 1}</span>
        <div className="sub-card-actions">
          <ChevronIcon open={open} onClick={e => { e.stopPropagation(); setOpen(o => !o); }} />
          <button className="icon-btn danger" onClick={e => { e.stopPropagation(); onRemove(); }}>✕</button>
        </div>
      </div>
      {open && <>
        <div className="sub-section-label">INSIDE TRIM (Opening)</div>
        <div className="grid-2">
          {([
            ['Width', 'insideWidth'],
            ['Height', 'insideHeight'],
          ] as [string, keyof WindowData][]).map(([l, k]) => (
            <div key={k}>
              <div className="tiny-label">{l}</div>
              <input className="input input-sm" placeholder='0"' value={(win[k] as string) || ''} onChange={e => u(k, e.target.value)} />
            </div>
          ))}
        </div>

        <div className="sub-section-label" style={{ marginTop: 10 }}>WITH TRIM (Frame)</div>
        <div className="grid-2">
          {([
            ['Width', 'withTrimWidth'],
            ['Height', 'withTrimHeight'],
            ['Distance from Left Corner', 'distanceFromLeftCorner'],
            ['Distance from Right Corner', 'distanceFromRightCorner'],
          ] as [string, keyof WindowData][]).map(([l, k]) => (
            <div key={k}>
              <div className="tiny-label">{l}</div>
              <input className="input input-sm" placeholder='0"' value={(win[k] as string) || ''} onChange={e => u(k, e.target.value)} />
            </div>
          ))}
        </div>

        <div className="tiny-label" style={{ marginTop: 10 }}>Sill Height from Countertop</div>
        <input className="input input-sm" placeholder='0"' value={win.sillHeight || ''} onChange={e => u('sillHeight', e.target.value)} />

        <div className="toggle-row" style={{ marginTop: 12 }}>
          <span className="toggle-label">Window Being Replaced?</span>
          <Toggle on={!!win.replacing} onToggle={() => onUpdate({ ...win, replacing: !win.replacing })} />
        </div>
      </>}
    </div>
  );
}

// ── Door card ─────────────────────────────────────────────────────────────────
function doorHasData(door: DoorData): boolean {
  return !!(door.type !== 'Door' || door.insideWidth || door.insideHeight || door.withTrimWidth || door.withTrimHeight || door.distanceFromLeftCorner || door.distanceFromRightCorner || door.swing);
}

function DoorCard({ door, index, onUpdate, onRemove, startClosed = false }: {
  door: DoorData; index: number;
  onUpdate: (v: DoorData) => void; onRemove: () => void;
  startClosed?: boolean;
}) {
  const [open, setOpen] = useState(!startClosed);
  const hasData = doorHasData(door);
  const u = (f: keyof DoorData, v: string) => onUpdate({ ...door, [f]: v });
  const title = door.type === 'Opening' ? `Opening ${index + 1}` : `Door ${index + 1}`;

  return (
    <div className={`sub-card ${hasData ? 'sub-card-with-data' : ''}`}>
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

        <div className="sub-section-label">INSIDE TRIM (Opening)</div>
        <div className="grid-2">
          {([
            ['Width', 'insideWidth'],
            ['Height', 'insideHeight'],
          ] as [string, keyof DoorData][]).map(([l, k]) => (
            <div key={k}>
              <div className="tiny-label">{l}</div>
              <input className="input input-sm" placeholder='0"' value={(door[k] as string) || ''} onChange={e => u(k, e.target.value)} />
            </div>
          ))}
        </div>

        <div className="sub-section-label" style={{ marginTop: 10 }}>WITH TRIM (Frame)</div>
        <div className="grid-2">
          {([
            ['Width', 'withTrimWidth'],
            ['Height', 'withTrimHeight'],
            ['Distance from Left Corner', 'distanceFromLeftCorner'],
            ['Distance from Right Corner', 'distanceFromRightCorner'],
          ] as [string, keyof DoorData][]).map(([l, k]) => (
            <div key={k}>
              <div className="tiny-label">{l}</div>
              <input className="input input-sm" placeholder='0"' value={(door[k] as string) || ''} onChange={e => u(k, e.target.value)} />
            </div>
          ))}
        </div>

        <div className="tiny-label" style={{ marginTop: 10 }}>Swing Direction</div>
        <div className="pill-group" style={{ marginTop: 6 }}>
          {(['Left', 'Right', 'Both', 'N/A'] as const).map(d => (
            <button key={d} className={`pill${door.swing === d ? ' active' : ''}`} onClick={() => onUpdate({ ...door, swing: d })}>{d}</button>
          ))}
        </div>
      </>}
    </div>
  );
}

// ── Appliance card ────────────────────────────────────────────────────────────
function applianceHasData(app: ApplianceOnWall): boolean {
  return !!(app.w || app.h || app.d || app.corner || app.loc);
}

function ApplianceCard({ app, onUpdate, onRemove, startClosed = false }: {
  app: ApplianceOnWall;
  onUpdate: (v: ApplianceOnWall) => void; onRemove: () => void;
  startClosed?: boolean;
}) {
  const [open, setOpen] = useState(!startClosed);
  const hasData = applianceHasData(app);
  return (
    <div className={`sub-card ${hasData ? 'sub-card-with-data' : ''}`}>
      <div className="sub-card-header" style={{ gap: 10 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <DropdownSelect
            listName="appliance_names"
            value={app.name}
            onChange={(val) => onUpdate({ ...app, name: val })}
            placeholder="Select appliance…"
            allowCustom={true}
          />
        </div>
        <div className="sub-card-actions" style={{ gap: 6, marginLeft: 'auto' }}>
          {app.name && (
            <button
              className="icon-btn"
              onClick={() => setOpen(o => !o)}
              style={{
                width: 40,
                height: 40,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: open ? 'var(--surface-hover)' : 'transparent',
                border: `1.5px solid ${open ? 'var(--brand-blue)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
            >
              <ChevronIcon open={open} />
            </button>
          )}
          <button className="icon-btn danger" onClick={onRemove} style={{ width: 40, height: 40, padding: 0 }}>✕</button>
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
function outletHasData(outlet: OutletData): boolean {
  return !!(outlet.type !== 'Outlet' || outlet.corner || outlet.location);
}

function OutletRow({ outlet, onUpdate, onRemove }: {
  outlet: OutletData; onUpdate: (v: OutletData) => void; onRemove: () => void;
}) {
  const hasData = outletHasData(outlet);
  return (
    <div className={`outlet-row ${hasData ? 'outlet-row-with-data' : ''}`}>
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
  onWallPhotoCapture?: (wallName: string, blob: Blob) => Promise<void>;
  onRemove?: () => void;
  startClosed?: boolean;
}

export default function WallSection({ wall, data, onUpdate, globalHasSoffit, soffitSame, globalSoffitH, globalSoffitD, onWallPhotoCapture, onRemove, startClosed = false }: WallProps) {
  const [open, setOpen] = useState(!startClosed);
  const [renaming, setRenaming] = useState(false);
  const [soffitOpen, setSoffitOpen] = useState(!startClosed);
  const [sinkOpen, setSinkOpen] = useState(!startClosed);
  const [cabsOpen, setCabsOpen] = useState(!startClosed);
  const [pieceDraft, setPieceDraft] = useState('');
  const [pieceUnit, setPieceUnit] = useState<'"' | "'">('"');
  const [showWallCamera, setShowWallCamera] = useState(false);
  const [editingLength, setEditingLength] = useState(false);
  const [lengthDraft, setLengthDraft] = useState(data.length || '');
  const dropdownRef = useRef<any>(null);
  const pieceInputRef = useRef<HTMLInputElement>(null);
  const u = (f: keyof WallData, v: unknown) => onUpdate({ ...data, [f]: v });

  const addWin = () => u('windows', [...(data.windows || []), {}]);
  const addDoor = () => u('doors', [...(data.doors || []), { type: 'Door' as const }]);
  const addOutlet = () => u('outlets', [...(data.outlets || []), { type: 'Outlet' as const }]);
  const addAppliance = () => u('appliances', [...(data.appliances || []), { name: '' }]);
  const syncLengthPieces = (pieces: WallLengthPiece[]) => {
    const totalInches = pieces.reduce((sum, piece) => sum + parseMeasurementToInches(piece.length), 0);
    onUpdate({ ...data, lengthPieces: pieces, length: totalInches > 0 ? formatInches(totalInches) : '' });
  };
  const handleWallPhotoCapture = async (blob: Blob) => {
    if (!onWallPhotoCapture) return;
    try {
      await onWallPhotoCapture(displayName, blob);
      setShowWallCamera(false);
    } catch (err) {
      console.error('Failed to capture wall photo:', err);
    }
  };
  const addLengthPiece = () => {
    const raw = pieceDraft.trim().replace(/['"]/g, '');
    if (!raw) {
      pieceInputRef.current?.focus();
      return;
    }

    const pieces = data.lengthPieces || [];
    syncLengthPieces([...pieces, { ...newWallLengthPiece(pieces.length), length: `${raw}${pieceUnit}` }]);
    setPieceDraft('');
    requestAnimationFrame(() => pieceInputRef.current?.focus());
  };
  const undoLengthPiece = () => {
    const pieces = data.lengthPieces || [];
    if (pieces.length === 0) return;
    syncLengthPieces(pieces.slice(0, -1));
  };

  const done = !!data.length;
  const appCount = (data.appliances || []).filter(a => a.name).length;
  const displayName = data.name || `Wall ${wall}`;
  const lengthPieces = data.lengthPieces || [];
  const lengthTotalInches = lengthPieces.reduce((sum, piece) => sum + parseMeasurementToInches(piece.length), 0);
  const hasData = !!(
    data.length ||
    (data.windows || []).length > 0 ||
    (data.doors || []).length > 0 ||
    (data.outlets || []).length > 0 ||
    appCount > 0 ||
    data.hasSink ||
    data.hasUpperCabs ||
    data.hasBaseCabs ||
    data.hasTallCab
  );

  const toggleOpen = () => { if (!renaming) setOpen(o => !o); };

  return (
    <div className={`wall-section ${hasData ? 'wall-section-with-data' : ''}`}>
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
                {onWallPhotoCapture && (
                  <button className="icon-btn" title="Take wall photo"
                    onClick={e => { e.stopPropagation(); setShowWallCamera(true); }}>
                    📷
                  </button>
                )}
                {onRemove && (
                  <button className="icon-btn" title="Remove wall"
                    onClick={e => { e.stopPropagation(); onRemove(); }}
                    style={{ color: 'var(--danger, #ef4444)' }}>
                    ✕
                  </button>
                )}
              </div>}
          <div className="wall-sub">
            {data.length && parseFloat(String(data.length)) > 0 && <span style={{ fontWeight: 600, color: 'var(--brand-yellow)', marginRight: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              Length: {data.length}
              <button className="icon-btn" title="Edit length" style={{ fontSize: '12px', padding: '4px' }} onClick={e => { e.stopPropagation(); setEditingLength(true); setLengthDraft(data.length || ''); }}>✎</button>
            </span>}
            {(data.windows || []).length} win · {(data.doors || []).length} door · {(data.outlets || []).length} outlet · {appCount} appl{data.hasSink ? ' · sink' : ''}{(data.hasUpperCabs || data.hasBaseCabs || data.hasTallCab) ? ' · cabs' : ''}{data.notes ? ' · 📝' : ''}
          </div>
        </div>
      </div>

      {open && (
        <div className="wall-body">
          <div style={{ marginBottom: 14 }}>
            <div className="tiny-label" style={{ marginBottom: 6 }}>Wall Notes</div>
            <textarea
              className="input"
              rows={2}
              placeholder="Any notes about this wall…"
              value={data.notes || ''}
              onChange={e => u('notes', e.target.value)}
              style={{ width: '100%', resize: 'vertical', minHeight: 60 }}
            />
          </div>
          <MeasInput label="Wall Length" value={data.length} onChange={v => u('length', v)} />

          <div className="wall-sub-section">
            <div className="wall-sub-section-header">
              <span className="tiny-label">Wall length pieces</span>
            </div>
            <div className="sub-card wall-piece-card">
              <div className="wall-piece-add-row">
                <input
                  ref={pieceInputRef}
                  className="input input-sm"
                  placeholder="Next piece"
                  value={pieceDraft}
                  onChange={e => setPieceDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addLengthPiece();
                    }
                  }}
                  inputMode="decimal"
                />
                <select className="meas-unit" value={pieceUnit} onChange={e => setPieceUnit(e.target.value as '"' | "'")}>
                  <option value={`"`}>in</option>
                  <option value={`'`}>ft</option>
                </select>
                <button className="btn btn-primary btn-sm" onClick={addLengthPiece}>Add</button>
              </div>
              {lengthPieces.length > 0 && (
                <>
                  <div className="wall-piece-equation">
                    {lengthPieces.map(piece => piece.length).filter(Boolean).join(' + ')}
                  </div>
                  <div className="wall-piece-total">
                    <span>Total</span>
                    <strong>{formatInches(lengthTotalInches)}</strong>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={undoLengthPiece}>
                    Undo last
                  </button>
                </>
              )}
            </div>
          </div>

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
                onRemove={() => u('windows', (data.windows || []).filter((_, x) => x !== i))}
                startClosed={startClosed} />
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
                onRemove={() => u('doors', (data.doors || []).filter((_, x) => x !== i))}
                startClosed={startClosed} />
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
                onRemove={() => u('appliances', (data.appliances || []).filter((_, x) => x !== i))}
                startClosed={startClosed} />
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
                {data.hasBaseCabs && (
                  <div className="plumbing-box">
                    <MeasInput label="Base Cabinet Height" value={data.baseCabH} onChange={v => u('baseCabH', v)} />
                    <MeasInput label="Base Cabinet Depth" value={data.baseCabD} onChange={v => u('baseCabD', v)} />
                  </div>
                )}
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

      {showWallCamera && (
        <CameraModal
          label={`Photo: ${displayName}`}
          onCapture={handleWallPhotoCapture}
          onClose={() => setShowWallCamera(false)}
        />
      )}

      {editingLength && (
        <div className="wall-dialog-overlay" onClick={() => setEditingLength(false)}>
          <div className="wall-dialog" onClick={e => e.stopPropagation()}>
            <h3 className="wall-dialog-title">Edit {displayName} Length</h3>
            <div className="wall-dialog-content">
              <label className="wall-dialog-label">Wall Length:</label>
              <input
                type="text"
                className="wall-dialog-input"
                placeholder="e.g., 12, 12.5, 15 ft"
                value={lengthDraft}
                onChange={e => setLengthDraft(e.target.value)}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    u('length', lengthDraft);
                    setEditingLength(false);
                  }
                }}
              />
            </div>
            <div className="wall-dialog-buttons">
              <button className="btn btn-ghost" onClick={() => setEditingLength(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={() => {
                u('length', lengthDraft);
                setEditingLength(false);
              }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
