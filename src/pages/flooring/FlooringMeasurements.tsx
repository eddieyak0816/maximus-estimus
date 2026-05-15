import { useState } from 'react';
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
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set(rooms.map(r => r.id)));
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());

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

  const toggleRoomExpanded = (id: string) => {
    const next = new Set(expandedRooms);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedRooms(next);
  };

  const togglePartExpanded = (id: string) => {
    const next = new Set(expandedParts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedParts(next);
  };

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
        const isRoomExpanded = expandedRooms.has(room.id);
        return (
          <div key={room.id} className="flooring-room-card">
            <div className="flooring-room-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => toggleRoomExpanded(room.id)}
                style={{ padding: '4px 6px', minWidth: 'auto' }}
              >
                {isRoomExpanded ? '▼' : '▶'}
              </button>
              <input
                className="input flooring-room-label"
                placeholder={`Room ${idx + 1}`}
                value={room.label}
                onChange={e => updateRoom(room.id, { label: e.target.value })}
                style={{ flex: 1 }}
              />
              {roomTotal > 0 && (
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginRight: 8 }}>
                  {roomTotal.toFixed(1)} sq ft
                </span>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => removeRoom(room.id)}>Remove</button>
            </div>

            {isRoomExpanded && (
              <>
                {parts.length === 0 && (
                  <div className="assess-hint" style={{ fontSize: 13, marginBottom: 12 }}>
                    No sections added — tap below to measure parts of this room.
                  </div>
                )}

                {parts.map((part, pIdx) => {
                  const partSqFt = calcPartSqFt(part);
                  const isPartExpanded = expandedParts.has(part.id);
                  return (
                    <div key={part.id} style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 6, marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isPartExpanded ? 8 : 0 }}>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => togglePartExpanded(part.id)}
                          style={{ padding: '2px 4px', minWidth: 'auto', fontSize: 10 }}
                        >
                          {isPartExpanded ? '▼' : '▶'}
                        </button>
                        <input
                          className="input input-sm"
                          placeholder={`Section ${pIdx + 1}`}
                          value={part.label || ''}
                          onChange={e => updatePart(room.id, part.id, { label: e.target.value })}
                          style={{ flex: 1 }}
                        />
                        {partSqFt > 0 && (
                          <span style={{ fontSize: 11, fontWeight: 600, marginRight: 8 }}>
                            {partSqFt.toFixed(1)} sq ft
                          </span>
                        )}
                        <button className="btn btn-ghost btn-xs" onClick={() => removePart(room.id, part.id)}>Remove</button>
                      </div>
                      {isPartExpanded && (
                        <>
                          <MeasInput label="Length" value={part.length} onChange={v => updatePart(room.id, part.id, { length: v })} />
                          <MeasInput label="Width" value={part.width} onChange={v => updatePart(room.id, part.id, { width: v })} />
                        </>
                      )}
                    </div>
                  );
                })}

                <button className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }} onClick={() => addPart(room.id)}>
                  + Add Section
                </button>

                {roomTotal > 0 && (
                  <div style={{ padding: '10px 12px', backgroundColor: 'rgba(245,196,42,0.1)', borderRadius: 6, borderLeft: '3px solid var(--accent)', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Room Total: </span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{roomTotal.toFixed(1)} sq ft</span>
                  </div>
                )}

                <div className="tiny-label" style={{ marginBottom: 4 }}>Transition Strip Locations</div>
                <input className="input input-sm" placeholder="e.g. Doorway to hallway"
                  value={room.transitionNotes || ''} onChange={e => updateRoom(room.id, { transitionNotes: e.target.value })} />
              </>
            )}
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
