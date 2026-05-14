import type { LivingRoomMeasurements } from '../../types';

interface Props {
  data: LivingRoomMeasurements;
  onUpdate: (d: LivingRoomMeasurements) => void;
}

function SecHead({ title }: { title: string }) {
  return <div className="q-sec-head">{title}</div>;
}

export default function LivingRoomMeasurements({ data, onUpdate }: Props) {
  const u = (key: keyof LivingRoomMeasurements, val: unknown) => onUpdate({ ...data, [key]: val });

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

      <SecHead title="Flooring & Lighting" />
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

      <div className="form-field">
        <label className="form-label">Lighting notes</label>
        <textarea
          className="textarea"
          rows={3}
          placeholder="Current lighting setup, fixtures, natural light, etc."
          value={data.lightingNotes || ''}
          onChange={e => u('lightingNotes', e.target.value)}
        />
      </div>
    </div>
  );
}
