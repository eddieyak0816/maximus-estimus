import { useState } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAssessmentStore } from '../store/assessmentStore';
import type { PriceCategory, PriceGuideItem, PricingUnit } from '../types';

const UNIT_LABELS: Record<PricingUnit, string> = {
  'linear-ft':  'per linear ft',
  'sq-ft':      'per sq ft',
  'unit':       'per unit',
  'flat-rate':  'flat rate',
  'per-hour':   'per hour',
};

const UNIT_OPTIONS: PricingUnit[] = ['linear-ft', 'sq-ft', 'unit', 'flat-rate', 'per-hour'];

function fmt(val: number | undefined): string {
  if (val === undefined || val === 0) return '';
  return String(val);
}

function parseNum(s: string): number {
  const v = parseFloat(s);
  return isNaN(v) ? 0 : v;
}

interface ItemRowProps {
  item: PriceGuideItem;
  onChange: (updated: PriceGuideItem) => void;
  onRemove: () => void;
}

function ItemRow({ item, onChange, onRemove }: ItemRowProps) {
  return (
    <div className="pg-item-row">
      <div className="pg-item-name-col">
        <input
          className="input pg-name-input"
          value={item.name}
          onChange={e => onChange({ ...item, name: e.target.value })}
          placeholder="Item name"
        />
      </div>
      <div className="pg-item-unit-col">
        <select
          className="select select-sm"
          value={item.unit}
          onChange={e => onChange({ ...item, unit: e.target.value as PricingUnit })}
        >
          {UNIT_OPTIONS.map(u => (
            <option key={u} value={u}>{UNIT_LABELS[u]}</option>
          ))}
        </select>
      </div>
      <div className="pg-item-costs-col">
        <div className="pg-cost-group">
          <span className="pg-cost-label">Labor $</span>
          <input
            className="input pg-cost-input"
            type="number"
            min="0"
            value={fmt(item.laborCost)}
            onChange={e => onChange({ ...item, laborCost: parseNum(e.target.value) })}
            placeholder="0"
          />
        </div>
        <div className="pg-cost-group">
          <span className="pg-cost-label pg-tier-low">Mat Low $</span>
          <input
            className="input pg-cost-input"
            type="number"
            min="0"
            value={fmt(item.materialLow)}
            onChange={e => onChange({ ...item, materialLow: parseNum(e.target.value) || undefined })}
            placeholder="—"
          />
        </div>
        <div className="pg-cost-group">
          <span className="pg-cost-label pg-tier-med">Mat Med $</span>
          <input
            className="input pg-cost-input"
            type="number"
            min="0"
            value={fmt(item.materialMed)}
            onChange={e => onChange({ ...item, materialMed: parseNum(e.target.value) || undefined })}
            placeholder="—"
          />
        </div>
        <div className="pg-cost-group">
          <span className="pg-cost-label pg-tier-high">Mat High $</span>
          <input
            className="input pg-cost-input"
            type="number"
            min="0"
            value={fmt(item.materialHigh)}
            onChange={e => onChange({ ...item, materialHigh: parseNum(e.target.value) || undefined })}
            placeholder="—"
          />
        </div>
      </div>
      <button
        className="btn btn-ghost btn-sm btn-danger pg-remove-btn"
        onClick={onRemove}
        title="Remove item"
      >
        ✕
      </button>
    </div>
  );
}

export default function PriceGuidePage() {
  const { priceGuide, markupSettings, updatePriceGuide, resetPriceGuide, updateMarkupSettings } = useAssessmentStore();
  const [saved, setSaved] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(() => new Set(priceGuide.map(c => c.id)));

  function saveGuide(guide: PriceCategory[]) {
    updatePriceGuide(guide);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateItem(catId: string, itemId: string, updated: PriceGuideItem) {
    saveGuide(priceGuide.map(cat =>
      cat.id === catId
        ? { ...cat, items: cat.items.map(i => i.id === itemId ? updated : i) }
        : cat
    ));
  }

  function removeItem(catId: string, itemId: string) {
    saveGuide(priceGuide.map(cat =>
      cat.id === catId ? { ...cat, items: cat.items.filter(i => i.id !== itemId) } : cat
    ));
  }

  function addItem(catId: string) {
    const newItem: PriceGuideItem = {
      id: uuidv4(),
      name: 'New Item',
      unit: 'unit',
      laborCost: 0,
    };
    saveGuide(priceGuide.map(cat =>
      cat.id === catId ? { ...cat, items: [...cat.items, newItem] } : cat
    ));
  }

  function addCategory() {
    const newCat: PriceCategory = { id: uuidv4(), name: 'New Category', items: [] };
    const next = [...priceGuide, newCat];
    setExpandedCats(prev => new Set([...prev, newCat.id]));
    saveGuide(next);
  }

  function removeCategory(catId: string) {
    if (!confirm('Remove this entire category and all its items?')) return;
    saveGuide(priceGuide.filter(c => c.id !== catId));
  }

  function renameCat(catId: string, name: string) {
    saveGuide(priceGuide.map(c => c.id === catId ? { ...c, name } : c));
  }

  function handleReset() {
    if (!confirm('Reset all prices to defaults? This cannot be undone.')) return;
    resetPriceGuide();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleCat(catId: string) {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId); else next.add(catId);
      return next;
    });
  }

  const markup = markupSettings;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumb-row">
            <Link to="/" className="breadcrumb-link">Dashboard</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Price Guide</span>
          </div>
          <h1 className="page-title">Price Guide</h1>
          <p className="page-subtitle">Edit labor and material costs. Changes save automatically.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          {saved && <span className="saved-indicator">✓ Saved</span>}
          <button className="btn btn-ghost btn-sm btn-danger" onClick={handleReset}>Reset to Defaults</button>
        </div>
      </div>

      {/* Markup Settings */}
      <div className="section-card" style={{ marginBottom: 28 }}>
        <div className="section-card-header">
          <div>
            <div className="section-card-title">⚙️ Markup Settings</div>
            <div className="section-card-subtitle">Applied automatically when generating estimates</div>
          </div>
        </div>
        <div className="section-card-body">
          <div className="pg-markup-row">
            <div className="pg-markup-field">
              <label className="form-label">Labor Markup %</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="999"
                  style={{ width: 100 }}
                  value={markup.laborPct}
                  onChange={e => updateMarkupSettings({ ...markup, laborPct: parseNum(e.target.value) })}
                />
                <span className="pg-cost-label">%</span>
              </div>
              <span className="form-hint">e.g. 30 = 30% markup on labor costs</span>
            </div>
            <div className="pg-markup-field">
              <label className="form-label">Materials Markup %</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="999"
                  style={{ width: 100 }}
                  value={markup.materialsPct}
                  onChange={e => updateMarkupSettings({ ...markup, materialsPct: parseNum(e.target.value) })}
                />
                <span className="pg-cost-label">%</span>
              </div>
              <span className="form-hint">e.g. 40 = 40% markup on material costs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      {priceGuide.map(cat => {
        const open = expandedCats.has(cat.id);
        return (
          <div key={cat.id} className="section-card" style={{ marginBottom: 14 }}>
            <div
              className="collapse-header"
              onClick={() => toggleCat(cat.id)}
              style={{ borderRadius: open ? '12px 12px 0 0' : 'var(--radius-lg)' }}
            >
              <input
                className="pg-cat-name-input"
                value={cat.name}
                onClick={e => e.stopPropagation()}
                onChange={e => renameCat(cat.id, e.target.value)}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span className="pg-item-count">{cat.items.length} item{cat.items.length !== 1 ? 's' : ''}</span>
                <button
                  className="btn btn-ghost btn-sm btn-danger"
                  onClick={e => { e.stopPropagation(); removeCategory(cat.id); }}
                  title="Remove category"
                >
                  ✕
                </button>
                <span className="collapse-chevron">{open ? '▲' : '▼'}</span>
              </div>
            </div>

            {open && (
              <div className="collapse-body pg-cat-body">
                {cat.items.length === 0 && (
                  <p className="pg-empty-cat">No items yet. Add one below.</p>
                )}

                {/* Column headers */}
                {cat.items.length > 0 && (
                  <div className="pg-item-headers">
                    <span className="pg-header-name">Item Name</span>
                    <span className="pg-header-unit">Unit</span>
                    <span className="pg-header-costs">Labor $ · Mat Low · Mat Med · Mat High (all per unit before markup)</span>
                  </div>
                )}

                {cat.items.map(item => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onChange={updated => updateItem(cat.id, item.id, updated)}
                    onRemove={() => removeItem(cat.id, item.id)}
                  />
                ))}

                <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => addItem(cat.id)}>
                  + Add Item
                </button>
              </div>
            )}
          </div>
        );
      })}

      <button className="btn btn-outline" style={{ marginTop: 8 }} onClick={addCategory}>
        + Add Category
      </button>
    </div>
  );
}
