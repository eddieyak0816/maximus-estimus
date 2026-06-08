import { useState, useEffect, useRef } from 'react';
import Toggle from '../../components/Toggle';
import MeasInput from '../../components/MeasInput';
import CollapseSection from '../../components/CollapseSection';
import WallSection from '../../components/WallSection';
import ChevronIcon from '../../components/ChevronIcon';
import CameraModal from '../../components/CameraModal';
import VoiceDictationButton from '../../components/VoiceDictationButton';
import DictationTranscriptsPanel from '../../components/DictationTranscriptsPanel';
import AIWallSelectionDialog from '../../components/AIWallSelectionDialog';
import type { DictationTranscript, ParsedResult } from '../../components/DictationTranscriptsPanel';
import type { KitchenMeasurements as KM } from '../../types';
import { applyParsedDataToJobAsAIWall, extractWallContext } from '../../utils/applyParsedDataToJob';

function wallLabel(i: number): string {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return i < 26 ? A[i] : A[Math.floor(i / 26) - 1] + A[i % 26];
}

interface Props {
  data: KM;
  onUpdate: (d: KM) => void;
  onUpdateJob?: (job: any) => void; // For updating full job (including dictations)
  job?: any; // Full job object (KitchenAssessment) for accessing dictations
  onWallPhotoCapture?: (wallName: string, blob: Blob) => Promise<void>;
  startClosed?: boolean;
}

export default function KitchenMeasurements({ data, onUpdate, onUpdateJob, job, onWallPhotoCapture, startClosed = false }: Props) {
  const u = (f: keyof KM, v: unknown) => onUpdate({ ...data, [f]: v });

  const [iDimsOpen, setIDimsOpen] = useState(!startClosed);
  const [iClearOpen, setIClearOpen] = useState(!startClosed);
  const [iOvhgOpen, setIOvhgOpen] = useState(!startClosed);
  const [iSinkOpen, setISinkOpen] = useState(!startClosed);
  const [iCooktopOpen, setICooktopOpen] = useState(!startClosed);
  const [iOutletOpen, setIOutletOpen] = useState(!startClosed);
  const [iLevelsOpen, setILevelsOpen] = useState(!startClosed);
  const [showIslandCamera, setShowIslandCamera] = useState(false);
  const [showWallSelectionDialog, setShowWallSelectionDialog] = useState(false);
  const [pendingParsedData, setPendingParsedData] = useState<ParsedResult | null>(null);
  const dictationSectionRef = useRef<HTMLDivElement>(null);

  // Load dictations from job (persistent across tab switches)
  const dictations = job?.dictations || [];

  // Scroll to dictation section on first load
  useEffect(() => {
    if (dictationSectionRef.current && !startClosed) {
      // Small delay to ensure layout is complete
      setTimeout(() => {
        dictationSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [startClosed]);

  function handleDictationTranscribed(text: string) {
    const newDictation: DictationTranscript = {
      id: Date.now().toString(),
      text,
      timestamp: new Date().toISOString(),
      processed: false,
    };
    const updated = { ...job, dictations: [...dictations, newDictation] };
    onUpdateJob?.(updated);
  }

  function handleDeleteDictation(id: string) {
    const updated = { ...job, dictations: dictations.filter((d: DictationTranscript) => d.id !== id) };
    onUpdateJob?.(updated);
  }

  function handleEditDictation(id: string, newText: string) {
    const updated = {
      ...job,
      dictations: dictations.map((d: DictationTranscript) => (d.id === id ? { ...d, text: newText } : d)),
    };
    onUpdateJob?.(updated);
  }

  function handleUpdateTranscript(id: string, updatedTranscript: DictationTranscript) {
    const updated = {
      ...job,
      dictations: dictations.map((d: DictationTranscript) => (d.id === id ? updatedTranscript : d)),
    };
    onUpdateJob?.(updated);
  }

  function handleApplyParsedData(parsed: ParsedResult) {
    // Try to extract wall context from parsed data
    const wallContext = extractWallContext(parsed.wallContext);

    if (wallContext && (parsed.wallContextConfidence === 'high' || parsed.wallContextConfidence === 'medium')) {
      // AI confident about the wall - apply directly
      applyToAIWall(wallContext, parsed);
    } else {
      // AI unsure - show dialog for user to select/create wall
      setPendingParsedData(parsed);
      setShowWallSelectionDialog(true);
    }
  }

  function applyToAIWall(wallName: string, parsed: ParsedResult) {
    const appliedJob = applyParsedDataToJobAsAIWall(job, parsed, wallName);
    onUpdateJob?.(appliedJob);
    onUpdate(appliedJob.measurements);

    setPendingParsedData(null);
    setShowWallSelectionDialog(false);
    alert(`✅ Created/updated "${wallName}"! You can now edit the wall measurements.`);
  }

  function handleWallSelection(wallName: string, _isNewWall: boolean) {
    if (!pendingParsedData) {
      alert('Error: No parsed data available');
      return;
    }
    applyToAIWall(wallName, pendingParsedData);
  }

  return (
    <div className="assess-tab">
      {/* ── Voice Dictation ── */}
      <div ref={dictationSectionRef} style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <VoiceDictationButton
          onTranscribed={handleDictationTranscribed}
          label="Dictate Notes"
        />
      </div>

      <DictationTranscriptsPanel
        transcripts={dictations}
        onAddTranscript={handleDictationTranscribed}
        onDeleteTranscript={handleDeleteDictation}
        onEditTranscript={handleEditDictation}
        onUpdateTranscript={handleUpdateTranscript}
        onApplyParsedData={handleApplyParsedData}
        jobType="Kitchen"
      />

      {/* ── Room Globals ── */}
      <CollapseSection title="🌐 Room Globals" accent defaultOpen={!startClosed}>
        <MeasInput label="Overall Ceiling Height" value={data.ceilingHeight} onChange={v => u('ceilingHeight', v)} />
        <div className="toggle-row">
          <span className="toggle-label">Soffit Present?</span>
          <Toggle on={!!data.hasSoffit} onToggle={() => u('hasSoffit', !data.hasSoffit)} />
        </div>
        {data.hasSoffit && (
          <div className="soffit-global-box">
            <div className="tiny-label" style={{ marginBottom: 8 }}>Global soffit dimensions (height &amp; depth apply to all walls)</div>
            <div className="grid-2" style={{ marginBottom: 10 }}>
              {([['Height', 'soffitH'], ['Depth', 'soffitD']] as [string, keyof KM][]).map(([l, k]) => (
                <div key={k}>
                  <div className="tiny-label">{l}</div>
                  <input className="input input-sm" placeholder='0"' value={(data[k] as string) || ''}
                    onChange={e => u(k, e.target.value)} />
                </div>
              ))}
            </div>
            <div className="toggle-row">
              <span className="toggle-label">Same on all walls?</span>
              <Toggle on={!!data.soffitSame} onToggle={() => {
                if (data.soffitSame) {
                  const walls = (data.walls || []).map(w => ({
                    ...w,
                    sH: w.sH || data.soffitH || '',
                    sD: w.sD || data.soffitD || '',
                  }));
                  onUpdate({ ...data, soffitSame: false, walls });
                } else {
                  u('soffitSame', true);
                }
              }} />
            </div>
          </div>
        )}
      </CollapseSection>

      {/* ── Per-Wall ── */}
      <CollapseSection title="📏 Walls" accent defaultOpen={!startClosed}>
        <p className="assess-hint">Tap the pencil icon to rename a wall. Tap the chevron to expand or collapse. Tap the 📷 icon to capture a wall photo.</p>
        {(data.walls || []).map((wallData, i) => {
          const label = wallLabel(i);
          return (
            <WallSection
              key={i}
              wall={label}
              data={wallData}
              onUpdate={v => {
                const next = [...(data.walls || [])];
                next[i] = v;
                onUpdate({ ...data, walls: next });
              }}
              onRemove={i >= 4 ? () => {
                onUpdate({ ...data, walls: (data.walls || []).filter((_, idx) => idx !== i) });
              } : undefined}
              globalHasSoffit={data.hasSoffit}
              soffitSame={data.soffitSame}
              globalSoffitH={data.soffitH}
              globalSoffitD={data.soffitD}
              onWallPhotoCapture={onWallPhotoCapture}
              startClosed={startClosed}
            />
          );
        })}
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginTop: 10, width: '100%' }}
          onClick={() => onUpdate({ ...data, walls: [...(data.walls || []), {}] })}
        >
          ➕ Add Wall {wallLabel((data.walls || []).length)}
        </button>
      </CollapseSection>

      {/* ── Island ── */}
      <CollapseSection title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🏝️ Island</span>
          {data.hasIsland && onWallPhotoCapture && (
            <button className="icon-btn" title="Take island photo" style={{ fontSize: '14px' }}
              onClick={e => { e.stopPropagation(); setShowIslandCamera(true); }}>
              📷
            </button>
          )}
        </div>
      } defaultOpen={false}>
        {!data.hasIsland
          ? <div className="enable-row">
              <span>Island not enabled</span>
              <button className="btn btn-ghost btn-sm" onClick={() => u('hasIsland', true)}>Enable Island</button>
            </div>
          : <div>

              {/* Status */}
              <div className="sub-card">
                <div className="tiny-label" style={{ marginBottom: 6 }}>Existing or New?</div>
                <div className="pill-group">
                  {(['Existing','New'] as const).map(o => (
                    <button key={o} className={`pill${data.iStatus === o ? ' active' : ''}`}
                      onClick={() => u('iStatus', o)}>{o}</button>
                  ))}
                </div>
              </div>

              {/* Dimensions */}
              <div className="sub-card">
                <div className="wall-sub-section-header" style={{ cursor: 'pointer', marginBottom: iDimsOpen ? 8 : 0 }} onClick={() => setIDimsOpen(o => !o)}>
                  <span className="tiny-label">Dimensions</span>
                  <ChevronIcon open={iDimsOpen} onClick={e => { e.stopPropagation(); setIDimsOpen(o => !o); }} />
                </div>
                {iDimsOpen && (
                  <>
                    <div className="grid-2" style={{ marginBottom: 8 }}>
                      {([['Length','iLen'],['Width','iW']] as [string, keyof KM][]).map(([l, k]) => (
                        <div key={k}>
                          <div className="tiny-label">{l}</div>
                          <input className="input input-sm" placeholder='0"' value={(data[k] as string) || ''} onChange={e => u(k, e.target.value)} />
                        </div>
                      ))}
                    </div>
                    <MeasInput label="Cabinet Length" value={data.iCabLen} onChange={v => u('iCabLen', v)} />
                  </>
                )}
              </div>

              {/* Clearances */}
              <div className="sub-card">
                <div className="wall-sub-section-header" style={{ cursor: 'pointer', marginBottom: iClearOpen ? 8 : 0 }} onClick={() => setIClearOpen(o => !o)}>
                  <span className="tiny-label">Distance from Walls</span>
                  <ChevronIcon open={iClearOpen} onClick={e => { e.stopPropagation(); setIClearOpen(o => !o); }} />
                </div>
                {iClearOpen && (
                  <div className="grid-2">
                    {([['Front','iDF'],['Back','iDB'],['Left','iDL'],['Right','iDR']] as [string, keyof KM][]).map(([l, k]) => (
                      <div key={k}>
                        <div className="tiny-label">{l}</div>
                        <input className="input input-sm" placeholder='0"' value={(data[k] as string) || ''} onChange={e => u(k, e.target.value)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Countertop Overhang */}
              <div className="sub-card">
                <div className="wall-sub-section-header" style={{ cursor: 'pointer', marginBottom: iOvhgOpen ? 8 : 0 }} onClick={() => setIOvhgOpen(o => !o)}>
                  <span className="tiny-label">Countertop Overhang</span>
                  <ChevronIcon open={iOvhgOpen} onClick={e => { e.stopPropagation(); setIOvhgOpen(o => !o); }} />
                </div>
                {iOvhgOpen && (
                  <>
                    {(['Front','Back','Left','Right'] as const).map(s => {
                      const sel = (data.iOvhgSides || []).includes(s);
                      const ovKey = `iOvhg_${s}` as keyof KM;
                      return (
                        <div key={s} className="overhang-row">
                          <button
                            className={`pill${sel ? ' active' : ''}`}
                            style={{ width: 80 }}
                            onClick={() => u('iOvhgSides', sel
                              ? (data.iOvhgSides || []).filter(x => x !== s)
                              : [...(data.iOvhgSides || []), s])}>
                            {sel ? `✓ ${s}` : s}
                          </button>
                          {sel && (
                            <input className="input input-sm" style={{ flex: 1 }} placeholder='Depth"'
                              value={(data[ovKey] as string || '').replace(/['"]/g, '')}
                              onChange={e => u(ovKey, e.target.value)}
                              onBlur={e => { const v = e.target.value.trim(); if (v) u(ovKey, v + '"'); }} />
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Sink */}
              <div className="sub-card">
                <div className="toggle-row" style={{ marginBottom: 0 }}>
                  <span className="toggle-label">Has Sink?</span>
                  <Toggle on={!!data.iSink} onToggle={() => u('iSink', !data.iSink)} />
                </div>
                {data.iSink && (
                  <>
                    <div className="soffit-override-header" style={{ marginTop: 10, cursor: 'pointer' }} onClick={() => setISinkOpen(o => !o)}>
                      <span className="soffit-override-label">SINK DETAILS</span>
                      <ChevronIcon open={iSinkOpen} onClick={e => { e.stopPropagation(); setISinkOpen(o => !o); }} />
                    </div>
                    {iSinkOpen && (
                      <>
                        <div className="pill-group" style={{ marginBottom: 10 }}>
                          {['Undermount','Apron Front','Other'].map(t => (
                            <button key={t} className={`pill${data.iSinkType === t ? ' active' : ''}`}
                              onClick={() => u('iSinkType', t)}>{t}</button>
                          ))}
                        </div>
                        {data.iSinkType === 'Other' && (
                          <input className="input input-sm" placeholder="Describe sink type…" style={{ marginBottom: 8 }}
                            value={data.iSinkTypeOther || ''} onChange={e => u('iSinkTypeOther', e.target.value)} />
                        )}
                        <MeasInput label="Distance from Left Edge" value={data.iSinkLeft} onChange={v => u('iSinkLeft', v)} />
                        <MeasInput label="Distance from Right Edge" value={data.iSinkRight} onChange={v => u('iSinkRight', v)} />
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Cooktop */}
              <div className="sub-card">
                <div className="toggle-row" style={{ marginBottom: 0 }}>
                  <span className="toggle-label">Has Cooktop?</span>
                  <Toggle on={!!data.iCooktop} onToggle={() => u('iCooktop', !data.iCooktop)} />
                </div>
                {data.iCooktop && (
                  <>
                    <div className="soffit-override-header" style={{ marginTop: 10, cursor: 'pointer' }} onClick={() => setICooktopOpen(o => !o)}>
                      <span className="soffit-override-label">COOKTOP DETAILS</span>
                      <ChevronIcon open={iCooktopOpen} onClick={e => { e.stopPropagation(); setICooktopOpen(o => !o); }} />
                    </div>
                    {iCooktopOpen && (
                      <>
                        <MeasInput label="Cooktop Length" value={data.iCooktopLen} onChange={v => u('iCooktopLen', v)} />
                        <MeasInput label="Cooktop Width" value={data.iCooktopW} onChange={v => u('iCooktopW', v)} />
                        <MeasInput label="Distance from Left Edge" value={data.iCooktopLeft} onChange={v => u('iCooktopLeft', v)} />
                        <MeasInput label="Distance from Right Edge" value={data.iCooktopRight} onChange={v => u('iCooktopRight', v)} />
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Outlets */}
              <div className="sub-card">
                <div className="toggle-row" style={{ marginBottom: 0 }}>
                  <span className="toggle-label">Has Outlet(s)?</span>
                  <Toggle on={!!data.iOutlet} onToggle={() => u('iOutlet', !data.iOutlet)} />
                </div>
                {data.iOutlet && (
                  <>
                    <div className="soffit-override-header" style={{ marginTop: 10, cursor: 'pointer' }} onClick={() => setIOutletOpen(o => !o)}>
                      <span className="soffit-override-label">OUTLET DETAILS</span>
                      <ChevronIcon open={iOutletOpen} onClick={e => { e.stopPropagation(); setIOutletOpen(o => !o); }} />
                    </div>
                    {iOutletOpen && (
                      <>
                        <div className="tiny-label" style={{ marginBottom: 6 }}>Which sides have outlets?</div>
                        <div className="pill-group" style={{ marginBottom: 10 }}>
                          {(['Front','Back','Left','Right']).map(s => {
                            const sel = (data.iOutletSides || []).includes(s);
                            return (
                              <button key={s} className={`pill${sel ? ' active' : ''}`}
                                onClick={() => u('iOutletSides', sel
                                  ? (data.iOutletSides || []).filter(x => x !== s)
                                  : [...(data.iOutletSides || []), s])}>
                                {sel ? `✓ ${s}` : s}
                              </button>
                            );
                          })}
                        </div>
                        <div className="toggle-row">
                          <span className="toggle-label">Outlets in countertop?</span>
                          <Toggle on={!!data.iOutletCountertop} onToggle={() => u('iOutletCountertop', !data.iOutletCountertop)} />
                        </div>
                        {data.iOutletCountertop && (
                          <input className="input input-sm" style={{ marginTop: 8 }} placeholder="Describe location…"
                            value={data.iOutletCountertopNotes || ''} onChange={e => u('iOutletCountertopNotes', e.target.value)} />
                        )}
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Levels */}
              <div className="sub-card">
                <div className="toggle-row" style={{ marginBottom: 0 }}>
                  <span className="toggle-label">Has Additional Level(s)?</span>
                  <Toggle on={!!data.iHasLevels} onToggle={() => u('iHasLevels', !data.iHasLevels)} />
                </div>
                {data.iHasLevels && (
                  <>
                    <div className="soffit-override-header" style={{ marginTop: 10, cursor: 'pointer' }} onClick={() => setILevelsOpen(o => !o)}>
                      <span className="soffit-override-label">LEVEL DETAILS</span>
                      <ChevronIcon open={iLevelsOpen} onClick={e => { e.stopPropagation(); setILevelsOpen(o => !o); }} />
                    </div>
                    {iLevelsOpen && (
                      <>
                        <div className="pill-group" style={{ marginBottom: 12 }}>
                          {['Lower — Desk / Prep','Higher — Bar Stools','Both'].map(t => (
                            <button key={t} className={`pill${data.iLevelType === t ? ' active' : ''}`}
                              onClick={() => u('iLevelType', t)}>{t}</button>
                          ))}
                        </div>
                        {(data.iLevelType === 'Lower — Desk / Prep' || data.iLevelType === 'Both') && <>
                          <div className="tiny-label" style={{ marginBottom: 6, fontWeight: 600 }}>Lower Level (Desk / Prep)</div>
                          <MeasInput label="Height" value={data.iLevelLowH} onChange={v => u('iLevelLowH', v)} />
                          <MeasInput label="Length" value={data.iLevelLowLen} onChange={v => u('iLevelLowLen', v)} />
                          <MeasInput label="Width" value={data.iLevelLowW} onChange={v => u('iLevelLowW', v)} />
                        </>}
                        {(data.iLevelType === 'Higher — Bar Stools' || data.iLevelType === 'Both') && <>
                          <div className="tiny-label" style={{ marginBottom: 6, marginTop: 8, fontWeight: 600 }}>Higher Level (Bar Stools)</div>
                          <MeasInput label="Height" value={data.iLevelHighH} onChange={v => u('iLevelHighH', v)} />
                          <MeasInput label="Length" value={data.iLevelHighLen} onChange={v => u('iLevelHighLen', v)} />
                          <MeasInput label="Width" value={data.iLevelHighW} onChange={v => u('iLevelHighW', v)} />
                        </>}
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Remove */}
              <button className="btn btn-ghost btn-sm"
                onClick={() => onUpdate({ ...data, hasIsland: false })}>
                Remove Island
              </button>

            </div>
        }
      </CollapseSection>

      {showIslandCamera && onWallPhotoCapture && (
        <CameraModal
          label="Photo: Island"
          onCapture={(blob) => {
            onWallPhotoCapture('Island', blob).then(() => setShowIslandCamera(false)).catch(err => {
              console.error('Failed to capture island photo:', err);
            });
          }}
          onClose={() => setShowIslandCamera(false)}
        />
      )}

      {showWallSelectionDialog && (
        <AIWallSelectionDialog
          existingWalls={data.walls || []}
          onSelect={handleWallSelection}
          onCancel={() => {
            setShowWallSelectionDialog(false);
            setPendingParsedData(null);
          }}
        />
      )}

    </div>
  );
}
