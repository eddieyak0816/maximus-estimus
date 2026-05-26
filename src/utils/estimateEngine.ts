import { v4 as uuidv4 } from 'uuid';
import type {
  Assessment, PriceCategory, MarkupSettings,
  EstimateData, EstimateLine, MaterialTier, PricingUnit,
} from '../types';

// ── Line computation helpers ───────────────────────────────────────────────────

export function lineCustomerLabor(line: EstimateLine): number {
  if (line.isOverridden && line.overrideLaborTotal !== undefined) return line.overrideLaborTotal;
  return line.qty * line.laborCostPerUnit * (1 + line.laborMarkupPct / 100);
}

export function lineCustomerMaterial(line: EstimateLine): number {
  if (line.isOverridden && line.overrideMaterialTotal !== undefined) return line.overrideMaterialTotal;
  return line.qty * line.materialCostPerUnit * (1 + line.materialsMarkupPct / 100);
}

export function lineInternalLabor(line: EstimateLine): number {
  return line.qty * line.laborCostPerUnit;
}

export function lineInternalMaterial(line: EstimateLine): number {
  return line.qty * line.materialCostPerUnit;
}

export function estimateTotals(lines: EstimateLine[]) {
  return lines.reduce(
    (acc, l) => ({
      customerLabor:    acc.customerLabor    + lineCustomerLabor(l),
      customerMaterial: acc.customerMaterial + lineCustomerMaterial(l),
      internalLabor:    acc.internalLabor    + lineInternalLabor(l),
      internalMaterial: acc.internalMaterial + lineInternalMaterial(l),
    }),
    { customerLabor: 0, customerMaterial: 0, internalLabor: 0, internalMaterial: 0 }
  );
}

// ── Price guide lookup ─────────────────────────────────────────────────────────

function findByKey(guide: PriceCategory[], key: string) {
  for (const cat of guide) {
    const item = cat.items.find(i => i.key === key);
    if (item) return item;
  }
  return null;
}

function materialCost(item: ReturnType<typeof findByKey>, tier: MaterialTier): number {
  if (!item) return 0;
  if (tier === 'low')  return item.materialLow  ?? 0;
  if (tier === 'high') return item.materialHigh ?? 0;
  return item.materialMed ?? 0;
}

function makeLine(
  key: string,
  label: string,
  qty: number,
  guide: PriceCategory[],
  markup: MarkupSettings,
  tier: MaterialTier,
): EstimateLine | null {
  if (qty <= 0) return null;
  const item = findByKey(guide, key);
  if (!item) return null;
  const unit: PricingUnit = item.unit;
  return {
    id: uuidv4(),
    label,
    unit,
    qty: Math.round(qty * 100) / 100,
    laborCostPerUnit:    item.laborCost,
    materialCostPerUnit: materialCost(item, tier),
    tier,
    laborMarkupPct:    markup.laborPct,
    materialsMarkupPct: markup.materialsPct,
    isOverridden: false,
  };
}

// ── parse a measurement string to a number (returns 0 if blank/invalid) ────────
function n(val?: string): number {
  if (!val) return 0;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
}

// ── Generate ──────────────────────────────────────────────────────────────────

export function generateEstimate(
  assessment: Assessment,
  guide: PriceCategory[],
  markup: MarkupSettings,
  tier: MaterialTier = 'med',
): EstimateData {
  const lines: EstimateLine[] = [];

  function add(key: string, label: string, qty: number) {
    const line = makeLine(key, label, qty, guide, markup, tier);
    if (line) lines.push(line);
  }

  for (const job of assessment.jobs) {

    // ── Kitchen ───────────────────────────────────────────────────────────────
    if (job.type === 'Kitchen') {
      const m = job.kitchen.measurements;
      const walls = m.walls || [];

      let upperLF = 0, baseLF = 0, tallCount = 0;
      let counterSqFt = 0, backsplashSqFt = 0;

      for (const wall of walls) {
        const wLen = n(wall.length);
        if (!wLen) continue;
        if (wall.hasUpperCabs)  { upperLF += wLen; }
        if (wall.hasBaseCabs)   { baseLF  += wLen; counterSqFt += wLen * 2.08; }
        if (wall.hasTallCab)    { tallCount++; }
        if (wall.hasUpperCabs && wall.hasBaseCabs) { backsplashSqFt += wLen * 1.5; }
      }

      // Island countertop
      if (m.hasIsland) {
        const iLen = n(m.iLen);
        const iW   = n(m.iW);
        counterSqFt += iLen * iW;
        add('island-cabs', `Island Cabinets (${job.label})`, iLen);
      }

      add('upper-cabs',    `Upper Cabinets (${job.label})`,     upperLF);
      add('base-cabs',     `Base Cabinets (${job.label})`,      baseLF);
      add('tall-cab',      `Tall / Pantry Cabinet (${job.label})`, tallCount);
      add('crown-molding', `Crown Molding (${job.label})`,      upperLF);
      add('countertops',   `Countertops (${job.label})`,        counterSqFt);
      add('backsplash-install', `Backsplash (${job.label})`,   backsplashSqFt);

      // Appliances — count all appliances across all walls
      let applianceCount = 0;
      for (const wall of walls) {
        applianceCount += (wall.appliances ?? []).length;
      }
      add('appliance-install', `Appliance Installation (${job.label})`, applianceCount);

      // Sink / Plumbing
      let sinkCount = 0;
      let disposalCount = 0;
      for (const wall of walls) {
        if (wall.hasSink)    { sinkCount++; }
        if (wall.disposal)   { disposalCount++; }
      }
      if (m.hasIsland && m.iSink) sinkCount++;

      add('sink-plumbing',    `Sink / Plumbing (${job.label})`,        sinkCount);
      add('disposal-install', `Garbage Disposal (${job.label})`,       disposalCount);
      add('kitchen-demo',     `Kitchen Demo (${job.label})`,           1);
    }

    // ── Flooring ──────────────────────────────────────────────────────────────
    if (job.type === 'Flooring') {
      const m  = job.flooring!.measurements;
      const q  = job.flooring!.questions;

      let totalSqFt = 0;
      for (const room of m.rooms) {
        for (const part of (room.parts || [])) {
          totalSqFt += n(part.length) * n(part.width);
        }
      }

      add('flooring-material', `Flooring Material (${job.label})`,     totalSqFt);
      add('flooring-install',  `Flooring Installation (${job.label})`, totalSqFt);
      if (q.underlayment)    add('underlayment',  `Underlayment (${job.label})`,          totalSqFt);
      if (q.removeExisting)  add('floor-demo',    `Floor Demo / Removal (${job.label})`,  totalSqFt);
      if (q.stairNosing)     add('stair-nosing',  `Stair Nosing (${job.label})`,          1);
    }

    // ── Bathroom ──────────────────────────────────────────────────────────────
    if (job.type === 'Bathroom') {
      const m = job.bathroom!.measurements;

      add('bathroom-demo', `Bathroom Demo (${job.label})`, 1);

      if (m.hasShower) {
        const sLen = n(m.showerLen);
        const sW   = n(m.showerW);
        const sH   = n(m.showerH);
        const wallTileSqFt  = sH > 0 ? (sLen + sW * 2) * sH : 0;
        const floorTileSqFt = sLen * sW;
        add('shower-wall-tile',  `Shower Wall Tile (${job.label})`,  wallTileSqFt);
        add('shower-floor-tile', `Shower Floor Tile (${job.label})`, floorTileSqFt);
      }

      if (m.hasTub) {
        add('tub-install', `Tub Installation (${job.label})`, 1);
      }

      const vanityW = n(m.vanityW);
      if (vanityW > 0) {
        add('vanity-install', `Vanity Installation (${job.label})`, 1);
      }

      // Toilet — always include if any bathroom work is happening
      add('toilet-install', `Toilet Installation (${job.label})`, 1);

      if (m.heatedFloor) {
        // Rough estimate: use shower area or a nominal 50 sqft if no data
        const floorSqFt = n(m.showerLen) * n(m.showerW) || 50;
        add('heated-floor-install', `Heated Floor (${job.label})`, floorSqFt);
      }
    }
  }

  return {
    lines,
    defaultTier: tier,
    isLocked: false,
    notes: '',
    generatedAt: new Date().toISOString(),
  };
}
