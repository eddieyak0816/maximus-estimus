import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAssessmentStore } from '../store/assessmentStore';
import {
  generateEstimate,
  lineCustomerLabor, lineCustomerMaterial,
  lineInternalLabor, lineInternalMaterial,
  estimateTotals,
} from '../utils/estimateEngine';
import type { EstimateLine, MaterialTier } from '../types';

const TIER_LABELS: Record<MaterialTier, string> = {
  low:  'Low',
  med:  'Medium',
  high: 'High',
};

const UNIT_ABBR: Record<string, string> = {
  'linear-ft': 'lf',
  'sq-ft':     'sf',
  'unit':      'ea',
  'flat-rate': 'flat',
  'per-hour':  'hr',
};

function dollars(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function PrivacyModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <div className="modal-icon">🔒</div>
        <h2 className="modal-title">Internal Cost View</h2>
        <p className="modal-body">
          You are about to view internal job costs including actual cost vs. customer price and profit margins.
          <br /><br />
          <strong>Is anyone nearby who may see your screen?</strong>
        </p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm}>Yes, Show Internal View</button>
        </div>
      </div>
    </div>
  );
}

interface OverrideModalProps {
  line: EstimateLine;
  onSave: (laborTotal: number | undefined, materialTotal: number | undefined) => void;
  onClear: () => void;
  onCancel: () => void;
}

function OverrideModal({ line, onSave, onClear, onCancel }: OverrideModalProps) {
  const [labor, setLabor] = useState(
    line.overrideLaborTotal !== undefined ? String(line.overrideLaborTotal) : ''
  );
  const [material, setMaterial] = useState(
    line.overrideMaterialTotal !== undefined ? String(line.overrideMaterialTotal) : ''
  );

  function parseVal(s: string): number | undefined {
    if (!s.trim()) return undefined;
    const v = parseFloat(s);
    return isNaN(v) ? undefined : v;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h2 className="modal-title">Override: {line.label}</h2>
        <p className="modal-body" style={{ marginBottom: 20 }}>
          Enter custom totals (not per-unit). Leave blank to keep auto-calculated value.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-field">
            <label className="form-label">Customer Labor Total ($)</label>
            <input className="input" type="number" min="0" value={labor}
              onChange={e => setLabor(e.target.value)} placeholder="auto" />
          </div>
          <div className="form-field">
            <label className="form-label">Customer Material Total ($)</label>
            <input className="input" type="number" min="0" value={material}
              onChange={e => setMaterial(e.target.value)} placeholder="auto" />
          </div>
        </div>
        <div className="modal-actions" style={{ marginTop: 24 }}>
          {line.isOverridden && (
            <button className="btn btn-ghost btn-danger btn-sm" onClick={onClear}>Clear Override</button>
          )}
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(parseVal(labor), parseVal(material))}>
            Save Override
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EstimatePage() {
  const { id } = useParams<{ id: string }>();
  const { getAssessment, priceGuide, markupSettings, updateEstimate } = useAssessmentStore();
  const assessment = id ? getAssessment(id) : undefined;

  const [viewMode, setViewMode] = useState<'customer' | 'internal'>('customer');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [overridingLine, setOverridingLine] = useState<EstimateLine | null>(null);

  if (!assessment) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>Assessment not found</h2>
          <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const clientName = [assessment.client.firstName, assessment.client.lastName].filter(Boolean).join(' ') || 'Untitled';
  const estimate = assessment.estimate;

  function handleGenerate(tier?: MaterialTier) {
    if (estimate?.isLocked) return;
    const t = tier ?? estimate?.defaultTier ?? 'med';
    const fresh = generateEstimate(assessment!, priceGuide, markupSettings, t);
    updateEstimate(id!, fresh);
  }

  function handleRegenerateTier(tier: MaterialTier) {
    if (estimate?.isLocked) return;
    handleGenerate(tier);
  }

  function handleLock() {
    if (!estimate) return;
    updateEstimate(id!, { ...estimate, isLocked: true });
  }

  function handleUnlock() {
    if (!estimate) return;
    if (!confirm('Unlock this estimate? It can then be edited or regenerated.')) return;
    updateEstimate(id!, { ...estimate, isLocked: false });
  }

  function handleNotes(notes: string) {
    if (!estimate || estimate.isLocked) return;
    updateEstimate(id!, { ...estimate, notes });
  }

  function handleRemoveLine(lineId: string) {
    if (!estimate || estimate.isLocked) return;
    updateEstimate(id!, { ...estimate, lines: estimate.lines.filter(l => l.id !== lineId) });
  }

  function handleAddManualLine() {
    if (!estimate || estimate.isLocked) return;
    const newLine: EstimateLine = {
      id: uuidv4(),
      label: 'Custom Line Item',
      unit: 'flat-rate',
      qty: 1,
      laborCostPerUnit: 0,
      materialCostPerUnit: 0,
      tier: estimate.defaultTier,
      laborMarkupPct: markupSettings.laborPct,
      materialsMarkupPct: markupSettings.materialsPct,
      isOverridden: true,
      overrideLaborTotal: 0,
      overrideMaterialTotal: 0,
    };
    updateEstimate(id!, { ...estimate, lines: [...estimate.lines, newLine] });
    setOverridingLine(newLine);
  }

  function handleSaveOverride(lineId: string, laborTotal: number | undefined, materialTotal: number | undefined) {
    if (!estimate) return;
    const lines = estimate.lines.map(l => {
      if (l.id !== lineId) return l;
      const isOverridden = laborTotal !== undefined || materialTotal !== undefined;
      return { ...l, overrideLaborTotal: laborTotal, overrideMaterialTotal: materialTotal, isOverridden };
    });
    updateEstimate(id!, { ...estimate, lines });
    setOverridingLine(null);
  }

  function handleClearOverride(lineId: string) {
    if (!estimate) return;
    const lines = estimate.lines.map(l =>
      l.id === lineId
        ? { ...l, overrideLaborTotal: undefined, overrideMaterialTotal: undefined, isOverridden: false }
        : l
    );
    updateEstimate(id!, { ...estimate, lines });
    setOverridingLine(null);
  }

  function requestInternalView() {
    if (viewMode === 'internal') {
      setViewMode('customer');
    } else {
      setShowPrivacyModal(true);
    }
  }

  const totals = estimate ? estimateTotals(estimate.lines) : null;
  const customerTotal  = totals ? totals.customerLabor + totals.customerMaterial  : 0;
  const internalTotal  = totals ? totals.internalLabor + totals.internalMaterial  : 0;
  const profit         = customerTotal - internalTotal;
  const marginPct      = customerTotal > 0 ? (profit / customerTotal * 100) : 0;

  return (
    <div className="page">
      {showPrivacyModal && (
        <PrivacyModal
          onConfirm={() => { setViewMode('internal'); setShowPrivacyModal(false); }}
          onCancel={() => setShowPrivacyModal(false)}
        />
      )}
      {overridingLine && (
        <OverrideModal
          line={overridingLine}
          onSave={(l, m) => handleSaveOverride(overridingLine.id, l, m)}
          onClear={() => handleClearOverride(overridingLine.id)}
          onCancel={() => setOverridingLine(null)}
        />
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <div className="breadcrumb-row">
            <Link to="/" className="breadcrumb-link">Dashboard</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to={`/assessment/${id}`} className="breadcrumb-link">{clientName}</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Estimate</span>
          </div>
          <h1 className="page-title">Estimate — {clientName}</h1>
          {assessment.client.address && (
            <p className="page-subtitle">{assessment.client.address}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={requestInternalView}>
            {viewMode === 'internal' ? '👤 Customer View' : '🔒 Internal View'}
          </button>
          {estimate?.isLocked
            ? <button className="btn btn-ghost btn-sm" onClick={handleUnlock}>🔓 Unlock</button>
            : <button className="btn btn-primary btn-sm" onClick={handleLock} disabled={!estimate}>✓ Lock Estimate</button>
          }
        </div>
      </div>

      {/* No jobs guard */}
      {assessment.jobs.length === 0 && (
        <div className="empty-state">
          <h2>No jobs added yet</h2>
          <p>Add jobs to this assessment before generating an estimate.</p>
          <Link to={`/assessment/${id}/type`} className="btn btn-primary">Add Jobs</Link>
        </div>
      )}

      {/* Generate / status bar */}
      {assessment.jobs.length > 0 && (
        <div className="estimate-action-bar">
          {!estimate ? (
            <>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>No estimate yet</p>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                  Auto-generates line items from your measurement data and price guide.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleGenerate('low')}>Low tier</button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleGenerate('high')}>High tier</button>
                <button className="btn btn-primary" onClick={() => handleGenerate('med')}>Generate Estimate</button>
              </div>
            </>
          ) : (
            <>
              <div>
                {estimate.isLocked
                  ? <span className="badge badge-complete">🔒 Locked</span>
                  : <span className="badge badge-in-progress">Editable</span>
                }
                <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                  Generated {new Date(estimate.generatedAt).toLocaleDateString()}
                  {' · '}{estimate.lines.length} line items
                  {' · '}Material tier: <strong style={{ color: 'var(--text-secondary)' }}>{TIER_LABELS[estimate.defaultTier]}</strong>
                </span>
              </div>
              {!estimate.isLocked && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleRegenerateTier('low')}>Low tier</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleRegenerateTier('med')}>Med tier</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleRegenerateTier('high')}>High tier</button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleGenerate()}>↺ Regenerate</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Estimate table */}
      {estimate && (
        <>
          {/* Total hero */}
          <div className="estimate-total-hero">
            <div>
              <div className="estimate-hero-label">
                {viewMode === 'customer' ? 'Customer Total' : 'Internal Cost'}
              </div>
              <div className="estimate-hero-total">
                {viewMode === 'customer' ? dollars(customerTotal) : dollars(internalTotal)}
              </div>
            </div>
            {viewMode === 'customer' && (
              <div className="estimate-hero-breakdown">
                <span>Labor: <strong>{dollars(totals!.customerLabor)}</strong></span>
                <span>Materials: <strong>{dollars(totals!.customerMaterial)}</strong></span>
              </div>
            )}
            {viewMode === 'internal' && (
              <div className="estimate-hero-breakdown estimate-internal-breakdown">
                <span>Cost: <strong>{dollars(internalTotal)}</strong></span>
                <span>Revenue: <strong>{dollars(customerTotal)}</strong></span>
                <span>Profit: <strong style={{ color: profit >= 0 ? 'var(--green)' : 'var(--red)' }}>{dollars(profit)}</strong></span>
                <span>Margin: <strong style={{ color: profit >= 0 ? 'var(--green)' : 'var(--red)' }}>{marginPct.toFixed(1)}%</strong></span>
              </div>
            )}
          </div>

          {/* Line items */}
          <div className="section-card">
            <div className="section-card-header" style={{ alignItems: 'center' }}>
              <span className="section-card-title">Line Items</span>
              {!estimate.isLocked && (
                <button className="btn btn-ghost btn-sm" onClick={handleAddManualLine}>+ Add Manual</button>
              )}
            </div>
            <div className="estimate-table-wrap">
              <table className="estimate-table">
                <thead>
                  <tr>
                    <th className="et-col-label">Description</th>
                    <th className="et-col-qty">Qty</th>
                    <th className="et-col-unit">Unit</th>
                    {viewMode === 'internal' && <th className="et-col-cost">Labor Cost</th>}
                    {viewMode === 'internal' && <th className="et-col-cost">Mat Cost</th>}
                    <th className="et-col-cost">Labor</th>
                    <th className="et-col-cost">Material</th>
                    <th className="et-col-total">Total</th>
                    {!estimate.isLocked && <th className="et-col-actions"></th>}
                  </tr>
                </thead>
                <tbody>
                  {estimate.lines.map(line => {
                    const custLabor    = lineCustomerLabor(line);
                    const custMat      = lineCustomerMaterial(line);
                    const intLabor     = lineInternalLabor(line);
                    const intMat       = lineInternalMaterial(line);
                    const lineTotal    = viewMode === 'customer'
                      ? custLabor + custMat
                      : intLabor + intMat;

                    return (
                      <tr key={line.id} className={line.isOverridden ? 'et-row-overridden' : ''}>
                        <td className="et-col-label">
                          <span className="et-label">{line.label}</span>
                          {line.isOverridden && <span className="et-override-tag">override</span>}
                        </td>
                        <td className="et-col-qty">{line.qty}</td>
                        <td className="et-col-unit">{UNIT_ABBR[line.unit] ?? line.unit}</td>
                        {viewMode === 'internal' && (
                          <td className="et-col-cost et-internal">{dollars(intLabor)}</td>
                        )}
                        {viewMode === 'internal' && (
                          <td className="et-col-cost et-internal">{dollars(intMat)}</td>
                        )}
                        <td className="et-col-cost">{dollars(custLabor)}</td>
                        <td className="et-col-cost">{dollars(custMat)}</td>
                        <td className="et-col-total">{dollars(lineTotal)}</td>
                        {!estimate.isLocked && (
                          <td className="et-col-actions">
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setOverridingLine(line)}
                              title="Override values"
                            >
                              ✎
                            </button>
                            <button
                              className="btn btn-ghost btn-sm btn-danger"
                              onClick={() => handleRemoveLine(line.id)}
                              title="Remove line"
                            >
                              ✕
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}

                  {estimate.lines.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        No line items. Regenerate or add items manually.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="et-footer-row">
                    <td colSpan={viewMode === 'internal' ? 5 : 3} className="et-footer-label">Total</td>
                    <td className="et-col-cost et-footer-val">{dollars(totals!.customerLabor)}</td>
                    <td className="et-col-cost et-footer-val">{dollars(totals!.customerMaterial)}</td>
                    <td className="et-col-total et-footer-total">{dollars(customerTotal)}</td>
                    {!estimate.isLocked && <td />}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Internal margin summary — only in internal view */}
          {viewMode === 'internal' && (
            <div className="section-card estimate-internal-card">
              <div className="section-card-header">
                <span className="section-card-title">🔒 Internal Summary (not on customer docs)</span>
              </div>
              <div className="section-card-body">
                <div className="estimate-margin-grid">
                  <div className="estimate-margin-row">
                    <span>Markup applied</span>
                    <span>Labor {markupSettings.laborPct}% · Materials {markupSettings.materialsPct}%</span>
                  </div>
                  <div className="estimate-margin-row">
                    <span>Internal cost (labor)</span>
                    <span>{dollars(totals!.internalLabor)}</span>
                  </div>
                  <div className="estimate-margin-row">
                    <span>Internal cost (materials)</span>
                    <span>{dollars(totals!.internalMaterial)}</span>
                  </div>
                  <div className="estimate-margin-row">
                    <span>Internal cost total</span>
                    <strong>{dollars(internalTotal)}</strong>
                  </div>
                  <div className="estimate-margin-row">
                    <span>Customer price total</span>
                    <strong>{dollars(customerTotal)}</strong>
                  </div>
                  <div className="estimate-margin-row estimate-profit-row">
                    <span>Gross profit</span>
                    <strong style={{ color: profit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {dollars(profit)} ({marginPct.toFixed(1)}%)
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="section-card">
            <div className="section-card-header">
              <span className="section-card-title">Estimate Notes</span>
            </div>
            <div className="section-card-body">
              <textarea
                className="textarea"
                rows={4}
                placeholder="Add notes to appear on the customer estimate..."
                value={estimate.notes}
                onChange={e => handleNotes(e.target.value)}
                disabled={estimate.isLocked}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
