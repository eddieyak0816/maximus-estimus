import type { CostEstimate } from '../types';

export function calcTotal(costs: CostEstimate): number {
  const fields: (keyof CostEstimate)[] = [
    'cabinets', 'countertops', 'backsplash', 'appliances', 'flooring',
    'demolition', 'plumbing', 'electrical', 'painting', 'labor', 'permits', 'other',
  ];
  return fields.reduce((sum, key) => {
    const val = parseFloat((costs[key] as string).replace(/[^0-9.]/g, ''));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function calcArea(length: string, width: string): number {
  const l = parseFloat(length);
  const w = parseFloat(width);
  return isNaN(l) || isNaN(w) ? 0 : l * w;
}
