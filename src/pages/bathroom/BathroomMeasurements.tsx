import Toggle from '../../components/Toggle';
import MeasInput from '../../components/MeasInput';
import CollapseSection from '../../components/CollapseSection';
import WallSection from '../../components/WallSection';
import type { BathroomMeasurements as BM } from '../../types';

const WALL_LABELS = ['A', 'B', 'C', 'D'] as const;

interface Props {
  data: BM;
  onUpdate: (d: BM) => void;
}

export default function BathroomMeasurements({ data, onUpdate }: Props) {
  const u = (f: keyof BM, v: unknown) => onUpdate({ ...data, [f]: v });

  return (
    <div className="assess-tab">
      {/* ── Room Globals ── */}
      <CollapseSection title="🌐 Room Globals" accent defaultOpen>
        <MeasInput label="Overall Ceiling Height" value={data.ceilingHeight} onChange={v => u('ceilingHeight', v)} />
        <div className="toggle-row">
          <span className="toggle-label">Soffit Present?</span>
          <Toggle on={!!data.hasSoffit} onToggle={() => u('hasSoffit', !data.hasSoffit)} />
        </div>
        {data.hasSoffit && (
          <div className="soffit-global-box">
            <div className="tiny-label" style={{ marginBottom: 8 }}>Global soffit dimensions (height &amp; depth apply to all walls)</div>
            <div className="grid-2" style={{ marginBottom: 10 }}>
              {([['Height', 'soffitH'], ['Depth', 'soffitD']] as [string, keyof BM][]).map(([l, k]) => (
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
                  const walls = { ...data.walls };
                  for (const w of ['A', 'B', 'C', 'D'] as const) {
                    walls[w] = { ...walls[w], sH: walls[w].sH || data.soffitH || '', sD: walls[w].sD || data.soffitD || '' };
                  }
                  onUpdate({ ...data, soffitSame: false, walls });
                } else {
                  u('soffitSame', true);
                }
              }} />
            </div>
          </div>
        )}
      </CollapseSection>

      {/* ── Walls ── */}
      <CollapseSection title="📏 Walls" accent defaultOpen>
        <p className="assess-hint">Tap the pencil icon to rename a wall. Tap the chevron to expand or collapse.</p>
        {WALL_LABELS.map(w => (
          <WallSection
            key={w}
            wall={w}
            data={data.walls?.[w] || {}}
            onUpdate={v => onUpdate({ ...data, walls: { ...data.walls, [w]: v } })}
            globalHasSoffit={data.hasSoffit}
            soffitSame={data.soffitSame}
            globalSoffitH={data.soffitH}
            globalSoffitD={data.soffitD}
          />
        ))}
      </CollapseSection>

      {/* ── Tub ── */}
      <CollapseSection title="🛁 Tub" defaultOpen={false}>
        {!data.hasTub
          ? <div className="enable-row">
              <span>Tub not enabled</span>
              <button className="btn btn-ghost btn-sm" onClick={() => u('hasTub', true)}>Enable Tub</button>
            </div>
          : <div>
              <MeasInput label="Length" value={data.tubLen} onChange={v => u('tubLen', v)} />
              <MeasInput label="Width" value={data.tubW} onChange={v => u('tubW', v)} />
              <MeasInput label="Height" value={data.tubH} onChange={v => u('tubH', v)} />
              <MeasInput label="Location from Nearest Corner" value={data.tubLoc} onChange={v => u('tubLoc', v)} />
              <div className="toggle-row">
                <span className="toggle-label">Combined tub / shower?</span>
                <Toggle on={!!data.tubCombined} onToggle={() => u('tubCombined', !data.tubCombined)} />
              </div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}
                onClick={() => u('hasTub', false)}>Remove Tub</button>
            </div>
        }
      </CollapseSection>

      {/* ── Shower ── */}
      <CollapseSection title="🚿 Shower" defaultOpen={false}>
        {!data.hasShower
          ? <div className="enable-row">
              <span>Shower not enabled</span>
              <button className="btn btn-ghost btn-sm" onClick={() => u('hasShower', true)}>Enable Shower</button>
            </div>
          : <div>
              <MeasInput label="Length" value={data.showerLen} onChange={v => u('showerLen', v)} />
              <MeasInput label="Width" value={data.showerW} onChange={v => u('showerW', v)} />
              <MeasInput label="Height" value={data.showerH} onChange={v => u('showerH', v)} />
              <MeasInput label="Location from Nearest Corner" value={data.showerLoc} onChange={v => u('showerLoc', v)} />
              <MeasInput label="Ceiling Height Inside Shower" value={data.showerCeilH} onChange={v => u('showerCeilH', v)} />
              <MeasInput label="Door / Glass Enclosure Opening Width" value={data.showerDoorW} onChange={v => u('showerDoorW', v)} />
              <MeasInput label="Knee Wall Height" value={data.kneeWallH} onChange={v => u('kneeWallH', v)} />
              <MeasInput label="Knee Wall Length" value={data.kneeWallLen} onChange={v => u('kneeWallLen', v)} />
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}
                onClick={() => u('hasShower', false)}>Remove Shower</button>
            </div>
        }
      </CollapseSection>

      {/* ── Vanity & Sink ── */}
      <CollapseSection title="🪥 Vanity & Sink" defaultOpen>
        <div className="tiny-label" style={{ marginBottom: 6 }}>Which wall?</div>
        <div className="pill-group" style={{ marginBottom: 12 }}>
          {WALL_LABELS.map(w => (
            <button key={w} className={`pill${data.vanityWall === w ? ' active' : ''}`}
              onClick={() => u('vanityWall', w)}>Wall {w}</button>
          ))}
        </div>
        <MeasInput label="Location from Nearest Corner" value={data.vanityLoc} onChange={v => u('vanityLoc', v)} />
        <MeasInput label="Vanity Width" value={data.vanityW} onChange={v => u('vanityW', v)} />
        <MeasInput label="Vanity Height" value={data.vanityH} onChange={v => u('vanityH', v)} />
        <MeasInput label="Vanity Depth" value={data.vanityD} onChange={v => u('vanityD', v)} />
        <div className="tiny-label" style={{ marginBottom: 6 }}>Single or double sink?</div>
        <div className="pill-group" style={{ marginBottom: 12 }}>
          {(['Single', 'Double'] as const).map(opt => (
            <button key={opt} className={`pill${data.vanitySinks === opt ? ' active' : ''}`}
              onClick={() => u('vanitySinks', opt)}>{opt}</button>
          ))}
        </div>
        <MeasInput label="Mirror / Medicine Cabinet Width" value={data.mirrorW} onChange={v => u('mirrorW', v)} />
        <MeasInput label="Mirror / Medicine Cabinet Height" value={data.mirrorH} onChange={v => u('mirrorH', v)} />
      </CollapseSection>

      {/* ── Toilet ── */}
      <CollapseSection title="🚽 Toilet" defaultOpen>
        <MeasInput label="Location from Nearest Corner" value={data.toiletLoc} onChange={v => u('toiletLoc', v)} />
        <MeasInput label="Clearance — Left Side" value={data.toiletClearLeft} onChange={v => u('toiletClearLeft', v)} />
        <MeasInput label="Clearance — Right Side" value={data.toiletClearRight} onChange={v => u('toiletClearRight', v)} />
      </CollapseSection>

      {/* ── Linen Closet ── */}
      <CollapseSection title="🗄️ Linen Closet" defaultOpen={false}>
        {!data.hasLinenCloset
          ? <div className="enable-row">
              <span>Linen closet not enabled</span>
              <button className="btn btn-ghost btn-sm" onClick={() => u('hasLinenCloset', true)}>Enable</button>
            </div>
          : <div>
              <MeasInput label="Width" value={data.lcW} onChange={v => u('lcW', v)} />
              <MeasInput label="Height" value={data.lcH} onChange={v => u('lcH', v)} />
              <MeasInput label="Depth" value={data.lcD} onChange={v => u('lcD', v)} />
              <MeasInput label="Location" value={data.lcLoc} onChange={v => u('lcLoc', v)} />
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}
                onClick={() => u('hasLinenCloset', false)}>Remove</button>
            </div>
        }
      </CollapseSection>

      {/* ── Extras ── */}
      <CollapseSection title="➕ Extras" defaultOpen={false}>
        <div className="tiny-label" style={{ marginBottom: 4 }}>Exhaust Fan Location</div>
        <input className="input input-sm" placeholder="e.g. Center of ceiling"
          value={data.exhaustFanLoc || ''} onChange={e => u('exhaustFanLoc', e.target.value)} />

        <div className="tiny-label" style={{ marginBottom: 4, marginTop: 10 }}>Towel Bar Locations</div>
        <input className="input input-sm" placeholder="e.g. Left of vanity, back wall"
          value={data.towelBarLocs || ''} onChange={e => u('towelBarLocs', e.target.value)} />

        <div className="toggle-row" style={{ marginTop: 10 }}>
          <span className="toggle-label">Heated Floor?</span>
          <Toggle on={!!data.heatedFloor} onToggle={() => u('heatedFloor', !data.heatedFloor)} />
        </div>

        <div className="toggle-row">
          <span className="toggle-label">Laundry in Bathroom?</span>
          <Toggle on={!!data.hasLaundry} onToggle={() => u('hasLaundry', !data.hasLaundry)} />
        </div>
        {data.hasLaundry && (
          <div className="island-feature-box">
            <div className="sub-section-label">WASHER</div>
            <div className="tiny-label" style={{ marginBottom: 4 }}>Location</div>
            <input className="input input-sm" style={{ marginBottom: 8 }} placeholder="Washer location…"
              value={data.washerLoc || ''} onChange={e => u('washerLoc', e.target.value)} />
            <div className="grid-3">
              {([['Width', 'washerW'], ['Height', 'washerH']] as [string, keyof BM][]).map(([l, k]) => (
                <div key={k}>
                  <div className="tiny-label">{l}</div>
                  <input className="input input-sm" placeholder='0"' value={(data[k] as string) || ''}
                    onChange={e => u(k, e.target.value)} />
                </div>
              ))}
            </div>
            <div className="sub-section-label" style={{ marginTop: 12 }}>DRYER</div>
            <div className="tiny-label" style={{ marginBottom: 4 }}>Location</div>
            <input className="input input-sm" style={{ marginBottom: 8 }} placeholder="Dryer location…"
              value={data.dryerLoc || ''} onChange={e => u('dryerLoc', e.target.value)} />
            <div className="grid-3">
              {([['Width', 'dryerW'], ['Height', 'dryerH']] as [string, keyof BM][]).map(([l, k]) => (
                <div key={k}>
                  <div className="tiny-label">{l}</div>
                  <input className="input input-sm" placeholder='0"' value={(data[k] as string) || ''}
                    onChange={e => u(k, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        )}
      </CollapseSection>
    </div>
  );
}
