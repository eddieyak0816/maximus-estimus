import type { DeckMeasurements } from '../../types';

interface Props {
  data: DeckMeasurements;
  onUpdate: (d: DeckMeasurements) => void;
  onWallPhotoCapture?: (wallName: string, blob: Blob) => Promise<void>;
}

function SecHead({ title }: { title: string }) {
  return <div className="q-sec-head">{title}</div>;
}

export default function DeckMeasurements({ data, onUpdate }: Props) {
  const u = (key: keyof DeckMeasurements, val: unknown) => onUpdate({ ...data, [key]: val });

  const calcSqFt = () => {
    const length = parseFloat(data.length || '0');
    const width = parseFloat(data.width || '0');
    return length && width ? (length * width).toFixed(1) : '';
  };

  return (
    <div className="assess-tab">
      <SecHead title="Deck Dimensions" />
      <div className="form-field">
        <label className="form-label">Length (feet)</label>
        <input
          className="input"
          type="number"
          placeholder="e.g. 12, 16, 20"
          value={data.length || ''}
          onChange={e => u('length', e.target.value)}
        />
      </div>

      <div className="form-field">
        <label className="form-label">Width (feet)</label>
        <input
          className="input"
          type="number"
          placeholder="e.g. 10, 12, 14"
          value={data.width || ''}
          onChange={e => u('width', e.target.value)}
        />
      </div>

      {calcSqFt() && (
        <div className="form-field" style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Square Feet</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{calcSqFt()} sq ft</div>
        </div>
      )}

      <div className="form-field">
        <label className="form-label">Height / elevation from ground (feet)</label>
        <input
          className="input"
          type="number"
          placeholder="e.g. 2, 3, 4"
          value={data.height || ''}
          onChange={e => u('height', e.target.value)}
        />
      </div>

      <SecHead title="Existing Condition" />
      <div className="form-field">
        <label className="form-label">Existing deck condition</label>
        <textarea
          className="textarea"
          rows={3}
          placeholder="Age, material, damage, rot, sun exposure, etc."
          value={data.existingCondition || ''}
          onChange={e => u('existingCondition', e.target.value)}
        />
      </div>

      <SecHead title="Railing" />
      <div className="form-field">
        <label className="form-label">Railing present?</label>
        <select
          className="input"
          value={data.railingPresent ? 'Yes' : 'No'}
          onChange={e => u('railingPresent', e.target.value === 'Yes')}
        >
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      </div>

      {data.railingPresent && (
        <div className="form-field">
          <label className="form-label">Railing details</label>
          <textarea
            className="textarea"
            rows={3}
            placeholder="Type, condition, height, existing or needs replacement, preferred style, etc."
            value={data.railingNotes || ''}
            onChange={e => u('railingNotes', e.target.value)}
          />
        </div>
      )}

      <SecHead title="Access & Misc" />
      <div className="form-field">
        <label className="form-label">Access notes</label>
        <textarea
          className="textarea"
          rows={3}
          placeholder="Stairs, gate access, HOA restrictions, utility lines, drainage, neighbors, etc."
          value={data.accessNotes || ''}
          onChange={e => u('accessNotes', e.target.value)}
        />
      </div>
    </div>
  );
}
