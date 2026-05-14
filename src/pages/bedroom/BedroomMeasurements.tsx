import type { BedroomMeasurements } from '../../types';

interface Props {
  data: BedroomMeasurements;
  onUpdate: (d: BedroomMeasurements) => void;
}

function SecHead({ title }: { title: string }) {
  return <div className="q-sec-head">{title}</div>;
}

export default function BedroomMeasurements({ data, onUpdate }: Props) {
  const u = (key: keyof BedroomMeasurements, val: unknown) => onUpdate({ ...data, [key]: val });

  return (
    <div className="assess-tab">
      <SecHead title="Room Dimensions" />
      <div className="form-field">
        <label className="form-label">Ceiling height (feet)</label>
        <input
          className="input"
          type="number"
          placeholder="e.g. 8, 9, 10"
          value={data.ceilingHeight || ''}
          onChange={e => u('ceilingHeight', e.target.value)}
        />
      </div>

      <SecHead title="Closets" />
      <div className="form-field">
        <label className="form-label">Number of closets</label>
        <input
          className="input"
          type="number"
          placeholder="0, 1, 2, etc."
          value={data.closetCount || ''}
          onChange={e => u('closetCount', e.target.value)}
        />
      </div>

      <div className="form-field">
        <label className="form-label">Closet notes</label>
        <textarea
          className="textarea"
          rows={3}
          placeholder="Size, type, existing shelving, desired organization, etc."
          value={data.closetNotes || ''}
          onChange={e => u('closetNotes', e.target.value)}
        />
      </div>

      <SecHead title="Openings" />
      <div className="form-field">
        <label className="form-label">Number of windows</label>
        <input
          className="input"
          type="number"
          placeholder="0, 1, 2, etc."
          value={data.windowCount || ''}
          onChange={e => u('windowCount', e.target.value)}
        />
      </div>

      <div className="form-field">
        <label className="form-label">Number of doors</label>
        <input
          className="input"
          type="number"
          placeholder="0, 1, 2, etc."
          value={data.doorCount || ''}
          onChange={e => u('doorCount', e.target.value)}
        />
      </div>

      <div className="form-field">
        <label className="form-label">Number of outlets</label>
        <input
          className="input"
          type="number"
          placeholder="0, 1, 2, etc."
          value={data.outletCount || ''}
          onChange={e => u('outletCount', e.target.value)}
        />
      </div>

      <SecHead title="Flooring" />
      <div className="form-field">
        <label className="form-label">Current flooring type</label>
        <input
          className="input"
          type="text"
          placeholder="Hardwood, carpet, tile, etc."
          value={data.flooring || ''}
          onChange={e => u('flooring', e.target.value)}
        />
      </div>
    </div>
  );
}
