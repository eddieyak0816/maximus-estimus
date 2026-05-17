import { useState } from 'react';
import MeasInput from '../../components/MeasInput';
import ChevronIcon from '../../components/ChevronIcon';
import type { PaintingMeasurements as PM, PaintingMeasurement } from '../../types';

interface Props {
  data: PM;
  onUpdate: (d: PM) => void;
}

export default function PaintingMeasurements({ data, onUpdate }: Props) {
  const floorMeasurements = data.floorMeasurements || [];
  const trimMeasurements = data.trimMeasurements || [];
  const [expandedFloor, setExpandedFloor] = useState<Set<string>>(new Set(floorMeasurements.map(m => m.id)));
  const [expandedTrim, setExpandedTrim] = useState<Set<string>>(new Set(trimMeasurements.map(m => m.id)));
  const [editingFloorId, setEditingFloorId] = useState<string | null>(null);
  const [editingTrimId, setEditingTrimId] = useState<string | null>(null);

  const updateFloor = (id: string, patch: Partial<PaintingMeasurement>) =>
    onUpdate({ ...data, floorMeasurements: floorMeasurements.map(m => m.id === id ? { ...m, ...patch } : m) });

  const addFloor = () =>
    onUpdate({ ...data, floorMeasurements: [...floorMeasurements, { id: crypto.randomUUID() }] });

  const removeFloor = (id: string) =>
    onUpdate({ ...data, floorMeasurements: floorMeasurements.filter(m => m.id !== id) });

  const updateTrim = (id: string, patch: Partial<PaintingMeasurement>) =>
    onUpdate({ ...data, trimMeasurements: trimMeasurements.map(m => m.id === id ? { ...m, ...patch } : m) });

  const addTrim = () =>
    onUpdate({ ...data, trimMeasurements: [...trimMeasurements, { id: crypto.randomUUID() }] });

  const removeTrim = (id: string) =>
    onUpdate({ ...data, trimMeasurements: trimMeasurements.filter(m => m.id !== id) });

  const toggleFloorExpanded = (id: string) => {
    const next = new Set(expandedFloor);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedFloor(next);
  };

  const toggleTrimExpanded = (id: string) => {
    const next = new Set(expandedTrim);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedTrim(next);
  };

  return (
    <div className="assess-tab">
      <div className="tiny-label" style={{ marginBottom: 8 }}>Floor Measurements</div>
      {floorMeasurements.length === 0 && (
        <div className="assess-hint" style={{ fontSize: 13, marginBottom: 12 }}>
          No floor measurements added — tap below to add.
        </div>
      )}

      {floorMeasurements.map((meas, idx) => {
        const isExpanded = expandedFloor.has(meas.id);
        return (
          <div key={meas.id} style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 6, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isExpanded ? 8 : 0, cursor: 'pointer' }} onClick={() => toggleFloorExpanded(meas.id)}>
              <ChevronIcon
                open={isExpanded}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFloorExpanded(meas.id);
                }}
              />
              {editingFloorId === meas.id ? (
                <div style={{ flex: 1, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    className="input input-sm"
                    autoFocus
                    value={meas.label || ''}
                    onChange={e => updateFloor(meas.id, { label: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && setEditingFloorId(null)}
                    placeholder="Room section name (optional)"
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn btn-primary btn-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingFloorId(null);
                    }}
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13 }}>{meas.label || `Floor ${idx + 1}`}</span>
                  <button
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingFloorId(meas.id);
                    }}
                    style={{ width: '20px', height: '20px', padding: 0 }}
                    title="Edit name"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                  </button>
                </div>
              )}
              <button className="btn btn-ghost btn-xs" onClick={(e) => {
                e.stopPropagation();
                removeFloor(meas.id);
              }}>Remove</button>
            </div>
            {isExpanded && (
              <MeasInput label="Square Feet" value={meas.length} onChange={v => updateFloor(meas.id, { length: v })} />
            )}
          </div>
        );
      })}

      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={addFloor}>
        + Add Floor Measurement
      </button>

      <div className="tiny-label" style={{ marginBottom: 8 }}>Trim Measurements</div>
      {trimMeasurements.length === 0 && (
        <div className="assess-hint" style={{ fontSize: 13, marginBottom: 12 }}>
          No trim measurements added — tap below to add.
        </div>
      )}

      {trimMeasurements.map((meas, idx) => {
        const isExpanded = expandedTrim.has(meas.id);
        return (
          <div key={meas.id} style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 6, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isExpanded ? 8 : 0, cursor: 'pointer' }} onClick={() => toggleTrimExpanded(meas.id)}>
              <ChevronIcon
                open={isExpanded}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTrimExpanded(meas.id);
                }}
              />
              {editingTrimId === meas.id ? (
                <div style={{ flex: 1, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    className="input input-sm"
                    autoFocus
                    value={meas.label || ''}
                    onChange={e => updateTrim(meas.id, { label: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && setEditingTrimId(null)}
                    placeholder="Trim location (optional)"
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn btn-primary btn-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTrimId(null);
                    }}
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13 }}>{meas.label || `Trim ${idx + 1}`}</span>
                  <button
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTrimId(meas.id);
                    }}
                    style={{ width: '20px', height: '20px', padding: 0 }}
                    title="Edit name"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                  </button>
                </div>
              )}
              <button className="btn btn-ghost btn-xs" onClick={(e) => {
                e.stopPropagation();
                removeTrim(meas.id);
              }}>Remove</button>
            </div>
            {isExpanded && (
              <MeasInput label="Linear Feet" value={meas.length} onChange={v => updateTrim(meas.id, { length: v })} />
            )}
          </div>
        );
      })}

      <button className="btn btn-ghost btn-sm" onClick={addTrim}>
        + Add Trim Measurement
      </button>
    </div>
  );
}
