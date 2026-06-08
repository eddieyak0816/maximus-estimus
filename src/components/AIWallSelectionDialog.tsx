import { useState } from 'react';
import type { WallData } from '../types';

interface Props {
  existingWalls: WallData[];
  onSelect: (wallName: string, isNewWall: boolean) => void;
  onCancel: () => void;
}

export default function AIWallSelectionDialog({ existingWalls, onSelect, onCancel }: Props) {
  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [customName, setCustomName] = useState('');

  // Separate existing walls and AI walls
  const regularWalls = existingWalls.filter(w => !w.name?.includes('(AI)'));
  const aiWalls = existingWalls.filter(w => w.name?.includes('(AI)'));

  function handleSelectWall(wallName: string) {
    onSelect(wallName, false);
  }

  function handleCreateWall() {
    if (customName.trim()) {
      const finalName = customName.includes('(AI)') ? customName : `${customName} (AI)`;
      onSelect(finalName, true);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2>Which wall is this?</h2>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mode === 'select' ? (
            <>
              {regularWalls.length > 0 && (
                <>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.6)', marginTop: '8px' }}>
                    Existing Walls
                  </div>
                  {regularWalls.map((wall, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectWall(wall.name || `Wall ${String.fromCharCode(65 + idx)}`)}
                      style={{
                        padding: '12px',
                        borderRadius: '4px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: 'inherit',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                        el.style.borderColor = 'var(--accent)';
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                        el.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      }}
                    >
                      {wall.name || `Wall ${String.fromCharCode(65 + idx)}`}
                    </button>
                  ))}
                </>
              )}

              {aiWalls.length > 0 && (
                <>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.6)', marginTop: '12px' }}>
                    Existing AI Walls (Add to)
                  </div>
                  {aiWalls.map((wall, idx) => (
                    <button
                      key={`ai-${idx}`}
                      onClick={() => handleSelectWall(wall.name || 'Wall (AI)')}
                      style={{
                        padding: '12px',
                        borderRadius: '4px',
                        border: '1px solid rgba(245, 196, 42, 0.3)',
                        backgroundColor: 'rgba(245, 196, 42, 0.1)',
                        color: 'inherit',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.backgroundColor = 'rgba(245, 196, 42, 0.15)';
                        el.style.borderColor = 'var(--accent)';
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.backgroundColor = 'rgba(245, 196, 42, 0.1)';
                        el.style.borderColor = 'rgba(245, 196, 42, 0.3)';
                      }}
                    >
                      {wall.name || 'Wall (AI)'} <span style={{ fontSize: '11px', opacity: 0.7 }}>(add to this)</span>
                    </button>
                  ))}
                </>
              )}

              <button
                onClick={() => setMode('create')}
                style={{
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px dashed rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'transparent',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginTop: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = 'rgba(245, 196, 42, 0.1)';
                  el.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = 'transparent';
                  el.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                ➕ Create New Wall
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                Wall name (e.g., "Sink Wall", "Window Wall", "Pantry"):
              </div>
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="Enter wall name"
                autoFocus
                style={{
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  color: 'inherit',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreateWall();
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleCreateWall}
                  disabled={!customName.trim()}
                  style={{ flex: 1 }}
                >
                  Create & Use
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setMode('select');
                    setCustomName('');
                  }}
                  style={{ flex: 1 }}
                >
                  Back
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
