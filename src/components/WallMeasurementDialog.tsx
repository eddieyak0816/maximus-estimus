import { useState, useEffect } from 'react';

interface Props {
  wallDirection: 'horizontal' | 'vertical' | 'diagonal';
  onSave: (wallIndex: number, length: string, name: string) => void;
  onCancel: () => void;
  availableWalls: { index: number; label: string; hasData: boolean }[];
}

export default function WallMeasurementDialog({ wallDirection, onSave, onCancel, availableWalls }: Props) {
  const [step, setStep] = useState<'select' | 'enter-data' | 'place-another'>('select');
  const [selectedWallIndex, setSelectedWallIndex] = useState<number | null>(null);
  const [length, setLength] = useState('');
  const [wallName, setWallName] = useState('');

  useEffect(() => {
    console.log('🎯 WallMeasurementDialog MOUNTED');
    return () => console.log('🎯 WallMeasurementDialog UNMOUNTED');
  }, []);

  useEffect(() => {
    console.log('📍 Dialog input value changed:', length);
  }, [length]);

  const handleSelectWall = (wallIndex: number) => {
    const wall = availableWalls.find(w => w.index === wallIndex);
    setSelectedWallIndex(wallIndex);
    setWallName(wall?.label || '');
    setLength('');
    setStep('enter-data');
  };

  const handleSaveData = () => {
    if (selectedWallIndex === null) return;
    if (!length.trim()) {
      alert('Please enter a wall length');
      return;
    }
    onSave(selectedWallIndex, length, wallName);
    setStep('place-another');
  };

  const handlePlaceAnother = () => {
    setStep('select');
    setSelectedWallIndex(null);
    setLength('');
    setWallName('');
  };

  const directionLabel = {
    horizontal: 'Horizontal Wall',
    vertical: 'Vertical Wall',
    diagonal: 'Diagonal Wall',
  }[wallDirection];

  return (
    <div className="wall-dialog-overlay" onClick={onCancel}>
      <div className="wall-dialog" onClick={e => e.stopPropagation()}>
        {step === 'place-another' ? (
          <>
            <h3 className="wall-dialog-title">Wall placed! 🎉</h3>
            <div className="wall-dialog-content">
              <p style={{ textAlign: 'center', marginBottom: '16px' }}>
                Place another wall?
              </p>
            </div>
            <div className="wall-dialog-buttons">
              <button className="btn btn-ghost" onClick={onCancel}>
                Done
              </button>
              <button className="btn btn-primary" onClick={handlePlaceAnother}>
                Yes, place another
              </button>
            </div>
          </>
        ) : step === 'select' ? (
          <>
            <h3 className="wall-dialog-title">Which wall are you placing?</h3>
            <div className="wall-dialog-content">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {availableWalls.map(wall => (
                  <button
                    key={wall.index}
                    className={`btn ${wall.hasData ? 'btn-ghost' : 'btn-primary'}`}
                    onClick={() => handleSelectWall(wall.index)}
                    style={{
                      opacity: wall.hasData ? 0.6 : 1,
                      cursor: wall.hasData ? 'default' : 'pointer'
                    }}
                    disabled={wall.hasData}
                    title={wall.hasData ? 'Already has data' : 'Select to edit'}
                  >
                    Wall {wall.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="wall-dialog-buttons">
              <button className="btn btn-ghost" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="wall-dialog-title">{directionLabel} Wall {wallName || '?'}</h3>
            <div className="wall-dialog-content">
              <label className="wall-dialog-label">Wall Name (optional):</label>
              <input
                type="text"
                className="wall-dialog-input"
                placeholder="e.g., Main Wall, Kitchen Side"
                value={wallName}
                onChange={e => setWallName(e.target.value)}
              />
              <label className="wall-dialog-label" style={{ marginTop: 12 }}>Wall Length:</label>
              <input
                type="text"
                className="wall-dialog-input"
                placeholder="e.g., 12, 12.5, 15 ft"
                value={length}
                onChange={e => setLength(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSaveData()}
              />
            </div>
            <div className="wall-dialog-buttons">
              <button className="btn btn-ghost" onClick={() => setStep('select')}>
                Back
              </button>
              <button className="btn btn-primary" onClick={handleSaveData}>
                Save Wall
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
