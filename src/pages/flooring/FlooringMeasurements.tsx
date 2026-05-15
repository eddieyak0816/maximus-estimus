import MeasInput from '../../components/MeasInput';
import type { FlooringMeasurements as FM, FlooringRoom, FlooringPart } from '../../types';

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

function calcPartSqFt(part: FlooringPart): number {
  const lIn = parseFtIn(part.length);
  const wIn = parseFtIn(part.width);
  return (lIn * wIn) / 144;
}

function calcRoomTotal(room: FlooringRoom): number {
  return (room.parts || []).reduce((sum, p) => sum + calcPartSqFt(p), 0);
}

export default function FlooringMeasurements({ data, onUpdate }: Props) {
  const rooms = data.rooms || [];

  const updateRoom = (id: string, patch: Partial<FlooringRoom>) =>
    onUpdate({ ...data, rooms: rooms.map(r => r.id === id ? { ...r, ...patch } : r) });

  const updatePart = (roomId: string, partId: string, patch: Partial<FlooringPart>) => {
    const updated = rooms.map(r => {
      if (r.id !== roomId) return r;
      return {
        ...r,
        parts: r.parts.map(p => p.id === partId ? { ...p, ...patch } : p),
      };
    });
    onUpdate({ ...data, rooms: updated });
  };

  const addRoom = () =>
    onUpdate({ ...data, rooms: [...rooms, { id: crypto.randomUUID(), label: `Room ${rooms.length + 1}`, parts: [] }] });

  const addPart = (roomId: string) => {
    const updated = rooms.map(r => {
      if (r.id !== roomId) return r;
      const parts = r.parts || [];
      return { ...r, parts: [...parts, { id: crypto.randomUUID(), label: `Part ${parts.length + 1}` }] };
    });
    onUpdate({ ...data, rooms: updated });
  };

  const removePart = (roomId: string, partId: string) => {
    const updated = rooms.map(r => {
      if (r.id !== roomId) return r;
      return { ...r, parts: r.parts.filter(p => p.id !== partId) };
    });
    onUpdate({ ...data, rooms: updated });
  };

  const removeRoom = (id: string) =>
    onUpdate({ ...data, rooms: rooms.filter(r => r.id !== id) });

  const grandTotal = rooms.reduce((sum, r) => sum + calcRoomTotal(r), 0);

  return (
    <div className="assess-tab">
      {rooms.length === 0 && (
        <div className="assess-hint" style={{ textAlign: 'center', padding: '24px 0' }}>
          No rooms added yet — tap below to start.
        </div>
      )}

      {rooms.map((room, idx) => {
        const roomTotal = calcRoomTotal(room);
        const parts = room.parts || [];
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

            {parts.length === 0 && (
              <div className="assess-hint" style={{ fontSize: 13, marginBottom: 12 }}>
                No sections added — tap below to measure parts of this room.
              </div>
            )}

            {parts.map((part, pIdx) => {
              const partSqFt = calcPartSqFt(part);
              return (
                <div key={part.id} style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 6, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <input
                      className="input input-sm"
                      placeholder={`Section ${pIdx + 1}`}
                      value={part.label || ''}
                      onChange={e => updatePart(room.id, part.id, { label: e.target.value })}
                      style={{ flex: 1 }}
                    />
                    <button className="btn btn-ghost btn-xs" onClick={() => removePart(room.id, part.id)}>Remove</button>
                  </div>
                  <MeasInput label="Length" value={part.length} onChange={v => updatePart(room.id, part.id, { length: v })} />
                  <MeasInput label="Width" value={part.width} onChange={v => updatePart(room.id, part.id, { width: v })} />
                  {partSqFt > 0 && (
                    <div className="sqft-auto-row">
                      <span className="sqft-label">Section Sq. Ft.</span>
                      <span className="sqft-value">{partSqFt.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              );
            })}

            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }} onClick={() => addPart(room.id)}>
              + Add Section
            </button>

            {roomTotal > 0 && (
              <div style={{ padding: '10px 12px', backgroundColor: 'rgba(245,196,42,0.1)', borderRadius: 6, borderLeft: '3px solid var(--accent)' }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Room Total: </span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{roomTotal.toFixed(1)} sq ft</span>
              </div>
            )}

            <div className="tiny-label" style={{ marginTop: 12, marginBottom: 4 }}>Transition Strip Locations</div>
            <input className="input input-sm" placeholder="e.g. Doorway to hallway"
              value={room.transitionNotes || ''} onChange={e => updateRoom(room.id, { transitionNotes: e.target.value })} />
          </div>
        );
      })}

      <button className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={addRoom}>
        + Add Room
      </button>

      {rooms.length > 0 && grandTotal > 0 && (
        <div className="grand-total-card">
          <span className="grand-total-label">Grand Total</span>
          <span className="grand-total-value">{grandTotal.toFixed(1)} sq ft</span>
        </div>
      )}
    </div>
  );
}
