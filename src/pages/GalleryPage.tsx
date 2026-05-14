import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CabinetStyle {
  name: string;
  desc: string;
  swatch: string;
  panel: string;
  accent: string;
  glass?: boolean;
}

const CABINET_STYLES: CabinetStyle[] = [
  { name: 'Shaker', desc: 'Clean lines, recessed center panel', swatch: '#e8ddd0', panel: '#d4c9bb', accent: '#60a5fa' },
  { name: 'Raised Panel', desc: 'Traditional elegance with raised detailing', swatch: '#ddd3c4', panel: '#c9bfb0', accent: '#2dd4bf' },
  { name: 'Flat Panel / Slab', desc: 'Modern, minimal, no frame or panel', swatch: '#d0ccc8', panel: '#bbb7b3', accent: '#c084fc' },
  { name: 'Glass Front', desc: 'Display-friendly, open and airy', swatch: '#c8dde8', panel: 'rgba(180,215,235,0.5)', accent: '#34d399', glass: true },
];

const COLORS = [
  { name: 'White', hex: '#f5f5f0' },
  { name: 'Off-White', hex: '#ede8df' },
  { name: 'Gray', hex: '#9ca3af' },
  { name: 'Charcoal', hex: '#4b5563' },
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'Sage Green', hex: '#7d9b76' },
  { name: 'Black', hex: '#1c1c1e' },
  { name: 'Natural Wood', hex: '#c4956a' },
];

function CabinetDoorMock({ style }: { style: CabinetStyle }) {
  return (
    <div className="cabinet-door-mock" style={{ background: 'rgba(255,255,255,0.5)', borderColor: 'rgba(0,0,0,0.08)' }}>
      <div className="cabinet-door-inner"
        style={{ background: style.panel, borderColor: 'rgba(0,0,0,0.06)' }}>
        {!style.glass && style.name !== 'Flat Panel / Slab' && (
          <div style={{ width: 22, height: 42, background: 'rgba(0,0,0,0.06)', borderRadius: 2 }} />
        )}
      </div>
    </div>
  );
}

function StyleDetailView({ style, onBack }: { style: CabinetStyle; onBack: () => void }) {
  const [link, setLink] = useState('');

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back to Gallery</button>
        <h2 className="page-title">{style.name}</h2>
      </div>

      <div className="gallery-detail-preview" style={{ background: style.swatch }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="cabinet-door-mock-lg"
            style={{ background: 'rgba(255,255,255,0.5)', borderColor: 'rgba(0,0,0,0.08)' }}>
            <div className="cabinet-door-inner-lg"
              style={{ background: style.panel, borderColor: 'rgba(0,0,0,0.06)' }}>
              {!style.glass && style.name !== 'Flat Panel / Slab' && (
                <div style={{ width: 32, height: 60, background: 'rgba(0,0,0,0.06)', borderRadius: 2 }} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="gallery-detail-name">{style.name}</div>
      <div className="gallery-detail-desc">{style.desc}</div>

      <div className="q-sec-head">Available Colors</div>
      <div className="color-grid">
        {COLORS.map(col => (
          <div key={col.name} className="color-swatch-card">
            <div className="color-swatch" style={{ background: col.hex }} />
            <span className="color-name">{col.name}</span>
          </div>
        ))}
      </div>

      <div className="q-sec-head">Customer Link</div>
      <div className="q-card">
        <p className="assess-hint">Paste a URL to share this style with the customer</p>
        <input className="input" placeholder="https://…" value={link} onChange={e => setLink(e.target.value)} />
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);

  const viewingStyle = viewing ? CABINET_STYLES.find(s => s.name === viewing) : null;

  if (viewingStyle) {
    return <StyleDetailView style={viewingStyle} onBack={() => setViewing(null)} />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <div>
          <h2 className="page-title">Cabinet Style Gallery</h2>
          <p className="page-subtitle">Tap a style to view details and colors</p>
        </div>
      </div>

      <p className="assess-hint" style={{ marginBottom: 16 }}>
        Show customers styles on-site or send links for them to browse at home.
      </p>

      <div className="gallery-list">
        {CABINET_STYLES.map(style => {
          const isSel = selected === style.name;
          return (
            <div key={style.name}
              className={`gallery-card${isSel ? ' selected' : ''}`}
              style={{ borderColor: isSel ? style.accent : undefined }}>

              <div className="gallery-card-preview"
                style={{ background: style.swatch, cursor: 'pointer' }}
                onClick={() => setViewing(style.name)}>
                {[1, 2, 3, 4].map(i => (
                  <CabinetDoorMock key={i} style={style} />
                ))}
                {isSel && (
                  <div className="gallery-selected-badge" style={{ background: style.accent }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="gallery-card-body">
                <div className="gallery-card-info">
                  <div className="gallery-card-name">{style.name}</div>
                  <div className="gallery-card-desc">{style.desc}</div>
                </div>
                <button
                  className={`btn btn-sm${isSel ? ' btn-outline' : ' btn-ghost'}`}
                  style={{ borderColor: isSel ? style.accent : undefined, color: isSel ? style.accent : undefined }}
                  onClick={() => setSelected(isSel ? null : style.name)}
                >
                  {isSel ? '✓ Selected' : 'Select'}
                </button>

                <div className="color-swatches-row">
                  {COLORS.slice(0, 6).map(col => (
                    <div key={col.name} title={col.name}
                      className="mini-swatch" style={{ background: col.hex }} />
                  ))}
                  <div className="mini-swatch more-swatch">+2</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
