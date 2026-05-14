import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SectionCard from '../../components/SectionCard';
import FormField from '../../components/FormField';
import type { Assessment, CostEstimate } from '../../types';
import { calcTotal, formatCurrency } from '../../utils/calculations';

interface Props {
  assessment: Assessment;
  onSave: (patch: Partial<Assessment>) => void;
}

const LINE_ITEMS: { key: keyof Omit<CostEstimate, 'notes'>; label: string }[] = [
  { key: 'cabinets', label: 'Cabinets & Hardware' },
  { key: 'countertops', label: 'Countertops' },
  { key: 'backsplash', label: 'Backsplash' },
  { key: 'appliances', label: 'Appliances' },
  { key: 'flooring', label: 'Flooring' },
  { key: 'demolition', label: 'Demolition' },
  { key: 'plumbing', label: 'Plumbing' },
  { key: 'electrical', label: 'Electrical' },
  { key: 'painting', label: 'Painting' },
  { key: 'labor', label: 'Labor / Installation' },
  { key: 'permits', label: 'Permits & Inspections' },
  { key: 'other', label: 'Other / Miscellaneous' },
];

export default function CostForm({ assessment, onSave }: Props) {
  const { register, handleSubmit, watch, reset, formState: { isDirty } } = useForm<CostEstimate>({
    defaultValues: assessment.costs,
  });

  useEffect(() => { reset(assessment.costs); }, [assessment.id]);

  const watched = watch();
  const total = calcTotal(watched);

  function onSubmit(data: CostEstimate) {
    onSave({ costs: data });
    reset(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-page">
      <SectionCard
        title="Cost Estimate"
        subtitle="Enter estimated dollar amounts for each line item"
        action={
          <div className="total-badge">
            Total: <strong>{formatCurrency(total)}</strong>
          </div>
        }
      >
        <div className="cost-grid">
          {LINE_ITEMS.map(({ key, label }) => (
            <div key={key} className="cost-row">
              <label className="cost-label">{label}</label>
              <div className="cost-input-wrap">
                <span className="currency-prefix">$</span>
                <input
                  className="input cost-input"
                  {...register(key)}
                  placeholder="0"
                  type="number"
                  min="0"
                  step="100"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="cost-total-row">
          <span className="cost-total-label">Estimated Total</span>
          <span className="cost-total-value">{formatCurrency(total)}</span>
        </div>
      </SectionCard>

      <SectionCard title="Notes">
        <FormField label="Cost Notes">
          <textarea className="textarea" rows={4} {...register('notes')} placeholder="Pricing assumptions, exclusions, contingency notes, quote validity..." />
        </FormField>
      </SectionCard>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={!isDirty}>Save Cost Estimate</button>
        {!isDirty && <span className="saved-indicator">✓ Saved</span>}
      </div>
    </form>
  );
}
