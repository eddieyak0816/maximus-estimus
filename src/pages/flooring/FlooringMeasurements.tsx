import MeasInput from '../../components/MeasInput';
import Toggle from '../../components/Toggle';
import type { FlooringMeasurements as FM, FlooringRoom } from '../../types';

interface Props {
  data: FM;
  onUpdate: (d: FM) => void;
}

function parseFtIn(val: string = ''): number {
  const ft = val.match(/^(\d+(?:\.\d+)?)'/);
  const inch = val.match(/^(\d+(?:\.\d+)?)"$/);
  if (ft) return parseFloat(ft[1]) * 12;
  if (inch) return parseFloat(inch[1]);
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function calcSqFt(room: FlooringRoom): number {
  if (room.isIrregular && room.sqFtManual) return parseFloat(room.sqFtManual) || 0;
  const lIn = parseFtIn(room.length);
  const wIn = parseFtIn(room.width);
  return (lIn * wIn) / 144;
}

export default function FlooringMeasurements({ data, onUpdate }: Props) {
  const rooms = data.rooms || [];

  const updateRoom = (id: string, patch: Partial<FlooringRoom>) =>
    onUpdate({ ...data, rooms: rooms.map(r => r.id === id ? { ...r, ...patch } : r) });

  const addRoom = () =>
    onUpdate({ ...data, rooms: [...rooms, { id: crypto.randomUUID(), label: `Room ${rooms.length + 1}` }] });

  const removeRoom = (id: string) =>
    onUpdate({ ...data, rooms: rooms.filter(r => r.id !== id) });

  const grandTotal = rooms.reduce((sum, r) => sum + calcSqFt(r), 0);

  return (
    <div className="assess-tab">
      {rooms.length === 0 && (
        <div className="assess-hint" style={{ textAlign: 'center', padding: '24px 0' }}>
          No rooms added yet — tap below to start.
        </div>
      )}

      {rooms.map((room, idx) => {
        const sqFt = calcSqFt(room);
        return (
          <div key={room.id} className="flooring-room-card">
            <div className="flooring-room-header">
              <input
                className="input flooring-room-label"
                placeholder={`Room ${idx + 1}`}
                value={room.label}
                onChange={e => updateRoom(room.id, { label: e.target.value })}
              />
              <button className="btn btn-ghost btn-sm" onClick={() => removeRoom(room.id)}>Remove</button>
            </div>

            <MeasInput label="Length" value={room.length} onChange={v => updateRoom(room.id, { length: v })} />
            <MeasInput label="Width" value={room.width} onChange={v => updateRoom(room.id, { width: v })} />

            {!room.isIrregular && sqFt > 0 && (
              <div className="sqft-auto-row">
                <span className="sqft-label">Est. Sq. Ft.</span>
                <span className="sqft-value">{sqFt.toFixed(1)}</span>
              </div>
            )}

            <div className="toggle-row">
              <span className="toggle-label">Irregular shape?</span>
              <Toggle on={!!room.isIrregular} onToggle={() => updateRoom(room.id, { isIrregular: !room.isIrregular })} />
            </div>

            {room.isIrregular && (
              <>
                <div className="tiny-label" style={{ marginBottom: 4 }}>Manual Sq. Ft.</div>
                <input className="input input-sm" placeholder="e.g. 124"
                  value={room.sqFtManual || ''} onChange={e => updateRoom(room.id, { sqFtManual: e.target.value })} />
                <div className="tiny-label" style={{ marginBottom: 4, marginTop: 8 }}>Shape Notes</div>
                <textarea className="textarea" rows={2} placeholder="Describe irregular shape…"
                  value={room.shapeNotes || ''} onChange={e => updateRoom(room.id, { shapeNotes: e.target.value })} />
              </>
            )}

            <div className="tiny-label" style={{ marginTop: 10, marginBottom: 4 }}>Transition Strip Locations</div>
            <input className="input input-sm" placeholder="e.g. Doorway to hallway"
              value={room.transitionNotes || ''} onChange={e => updateRoom(room.id, { transitionNotes: e.target.value })} />
          </div>
        );
      })}

      <button className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={addRoom}>
        + Add Room
      </button>

      {rooms.length > 1 && (
        <div className="grand-total-card">
          <span className="grand-total-label">Grand Total</span>
          <span className="grand-total-value">{grandTotal.toFixed(1)} sq ft</span>
        </div>
      )}
    </div>
  );
}
