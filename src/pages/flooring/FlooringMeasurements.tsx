import { useState } from 'react';
import MeasInput from '../../components/MeasInput';
import ChevronIcon from '../../components/ChevronIcon';
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
  const [expandedTransitions, setExpandedTransitions] = useState<Set<string>>(new Set());
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [editingTransitionId, setEditingTransitionId] = useState<string | null>(null);

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

  const updateTransition = (roomId: string, transId: string, patch: any) => {
    const updated = rooms.map(r => {
      if (r.id !== roomId) return r;
      return {
        ...r,
        transitions: r.transitions.map(t => t.id === transId ? { ...t, ...patch } : t),
      };
    });
    onUpdate({ ...data, rooms: updated });
  };

  const addTransition = (roomId: string) => {
    const updated = rooms.map(r => {
      if (r.id !== roomId) return r;
      const transitions = r.transitions || [];
      return { ...r, transitions: [...transitions, { id: crypto.randomUUID() }] };
    });
    onUpdate({ ...data, rooms: updated });
  };

  const removeTransition = (roomId: string, transId: string) => {
    const updated = rooms.map(r => {
      if (r.id !== roomId) return r;
      return { ...r, transitions: r.transitions.filter(t => t.id !== transId) };
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

  const toggleTransitionExpanded = (id: string) => {
    const next = new Set(expandedTransitions);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedTransitions(next);
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
            <div className="flooring-room-header" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => toggleRoomExpanded(room.id)}>
              <ChevronIcon
                open={isRoomExpanded}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRoomExpanded(room.id);
                }}
              />
              {editingRoomId === room.id ? (
                <input
                  className="input input-sm"
                  autoFocus
                  value={room.label}
                  onChange={e => updateRoom(room.id, { label: e.target.value })}
                  onBlur={() => setEditingRoomId(null)}
                  onKeyDown={e => e.key === 'Enter' && setEditingRoomId(null)}
                  style={{ flex: 1 }}
                />
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{room.label || `Room ${idx + 1}`}</span>
                  <button
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingRoomId(room.id);
                    }}
                    title="Edit room name"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                  </button>
                </div>
              )}
              {roomTotal > 0 && (
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginRight: 8 }}>
                  {roomTotal.toFixed(1)} sq ft
                </span>
              )}
              <button className="btn btn-ghost btn-sm" onClick={(e) => {
                e.stopPropagation();
                removeRoom(room.id);
              }}>Remove</button>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isPartExpanded ? 8 : 0, cursor: 'pointer' }} onClick={() => togglePartExpanded(part.id)}>
                        <ChevronIcon
                          open={isPartExpanded}
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePartExpanded(part.id);
                          }}
                        />
                        {editingPartId === part.id ? (
                          <input
                            className="input input-sm"
                            autoFocus
                            value={part.label || ''}
                            onChange={e => updatePart(room.id, part.id, { label: e.target.value })}
                            onBlur={() => setEditingPartId(null)}
                            onKeyDown={e => e.key === 'Enter' && setEditingPartId(null)}
                            style={{ flex: 1 }}
                          />
                        ) : (
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 13 }}>{part.label || `Section ${pIdx + 1}`}</span>
                            <button
                              className="icon-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPartId(part.id);
                              }}
                              style={{ width: '20px', height: '20px', padding: 0 }}
                              title="Edit section name"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                            </button>
                          </div>
                        )}
                        {partSqFt > 0 && (
                          <span style={{ fontSize: 11, fontWeight: 600, marginRight: 8 }}>
                            {partSqFt.toFixed(1)} sq ft
                          </span>
                        )}
                        <button className="btn btn-ghost btn-xs" onClick={(e) => {
                          e.stopPropagation();
                          removePart(room.id, part.id);
                        }}>Remove</button>
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

                <div className="tiny-label" style={{ marginBottom: 4 }}>Transition Strips</div>
                {(room.transitions || []).map((trans, tIdx) => {
                  const isTransExpanded = expandedTransitions.has(trans.id);
                  return (
                    <div key={trans.id} style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 6, marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isTransExpanded ? 8 : 0, cursor: 'pointer' }} onClick={() => toggleTransitionExpanded(trans.id)}>
                        <ChevronIcon
                          open={isTransExpanded}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTransitionExpanded(trans.id);
                          }}
                        />
                        {editingTransitionId === trans.id ? (
                          <input
                            className="input input-sm"
                            autoFocus
                            value={trans.location || ''}
                            onChange={e => updateTransition(room.id, trans.id, { location: e.target.value })}
                            onBlur={() => setEditingTransitionId(null)}
                            onKeyDown={e => e.key === 'Enter' && setEditingTransitionId(null)}
                            style={{ flex: 1 }}
                          />
                        ) : (
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 13 }}>
                              {trans.location ? `${trans.location}${trans.length ? ` (${trans.length})` : ''}` : `Transition ${tIdx + 1}`}
                            </span>
                            <button
                              className="icon-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTransitionId(trans.id);
                              }}
                              style={{ width: '20px', height: '20px', padding: 0 }}
                              title="Edit transition location"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                            </button>
                          </div>
                        )}
                        <button className="btn btn-ghost btn-xs" onClick={(e) => {
                          e.stopPropagation();
                          removeTransition(room.id, trans.id);
                        }}>Remove</button>
                      </div>
                      {isTransExpanded && (
                        <>
                          <input
                            className="input input-sm"
                            placeholder="e.g. Doorway to hallway"
                            value={trans.location || ''}
                            onChange={e => updateTransition(room.id, trans.id, { location: e.target.value })}
                            style={{ marginBottom: 8 }}
                          />
                          <MeasInput label="Length" value={trans.length} onChange={v => updateTransition(room.id, trans.id, { length: v })} />
                          <input
                            className="input input-sm"
                            placeholder="e.g. Reducer, Z-bar, T-molding"
                            value={trans.type || ''}
                            onChange={e => updateTransition(room.id, trans.id, { type: e.target.value })}
                          />
                        </>
                      )}
                    </div>
                  );
                })}

                <button className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }} onClick={() => addTransition(room.id)}>
                  + Add Transition Strip
                </button>
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
