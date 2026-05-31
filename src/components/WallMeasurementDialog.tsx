import { useState, useEffect } from 'react';

interface Props {
  wallDirection: 'horizontal' | 'vertical' | 'diagonal';
  wallLabel: string;
  onSave: (length: string) => void;
  onCancel: () => void;
}

export default function WallMeasurementDialog({ wallDirection, wallLabel, onSave, onCancel }: Props) {
  const [length, setLength] = useState('');

  useEffect(() => {
    console.log('🎯 WallMeasurementDialog MOUNTED:', { wallDirection, wallLabel });
    return () => console.log('🎯 WallMeasurementDialog UNMOUNTED');
  }, [wallDirection, wallLabel]);

  useEffect(() => {
    console.log('📍 Dialog input value changed:', length);
  }, [length]);

  const handleSave = () => {
    if (!length.trim()) {
      alert('Please enter a wall length');
      return;
    }
    onSave(length);
  };

  const directionLabel = {
    horizontal: 'Horizontal Wall',
    vertical: 'Vertical Wall',
    diagonal: 'Diagonal Wall',
  }[wallDirection];

  return (
    <div className="wall-dialog-overlay" onClick={onCancel}>
      <div className="wall-dialog" onClick={e => e.stopPropagation()}>
        <h3 className="wall-dialog-title">{directionLabel} {wallLabel}</h3>

        <div className="wall-dialog-content">
          <label className="wall-dialog-label">Wall Length:</label>
          <input
            type="text"
            className="wall-dialog-input"
            placeholder="e.g., 12, 12.5, 15 ft"
            value={length}
            onChange={e => setLength(e.target.value)}
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
        </div>

        <div className="wall-dialog-buttons">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Wall
          </button>
        </div>
      </div>
    </div>
  );
}
