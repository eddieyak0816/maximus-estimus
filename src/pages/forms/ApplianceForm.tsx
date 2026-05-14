import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SectionCard from '../../components/SectionCard';
import FormField from '../../components/FormField';
import type { Assessment, ApplianceSpec } from '../../types';

interface Props {
  assessment: Assessment;
  onSave: (patch: Partial<Assessment>) => void;
}

export default function ApplianceForm({ assessment, onSave }: Props) {
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<ApplianceSpec>({
    defaultValues: assessment.appliances,
  });

  useEffect(() => { reset(assessment.appliances); }, [assessment.id]);

  function onSubmit(data: ApplianceSpec) {
    onSave({ appliances: data });
    reset(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-page">
      <SectionCard title="Cooking" subtitle="Enter brand and model information">
        <div className="form-grid form-grid-2">
          <FormField label="Range / Cooktop" hint="Brand, model, and size">
            <input className="input" {...register('range')} placeholder="Samsung 30&quot; Slide-In" />
          </FormField>
          <FormField label="Range Type">
            <select className="select" {...register('rangeType')}>
              <option value="gas">Gas</option>
              <option value="electric">Electric</option>
              <option value="induction">Induction</option>
              <option value="dual-fuel">Dual Fuel</option>
              <option value="none">None / Separate Cooktop</option>
            </select>
          </FormField>
          <FormField label="Range Hood / Ventilation">
            <input className="input" {...register('hood')} placeholder="Broan 30&quot; Under-Cabinet" />
          </FormField>
          <FormField label="Microwave">
            <input className="input" {...register('microwave')} placeholder="GE Over-the-Range 30&quot;" />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Other Appliances">
        <div className="form-grid form-grid-2">
          <FormField label="Refrigerator" hint="Brand, model, width, and configuration">
            <input className="input" {...register('refrigerator')} placeholder="LG 36&quot; French Door" />
          </FormField>
          <FormField label="Dishwasher">
            <input className="input" {...register('dishwasher')} placeholder="Bosch 24&quot; 500 Series" />
          </FormField>
          <FormField label="Garbage Disposal">
            <label className="checkbox-label">
              <input type="checkbox" {...register('disposal')} />
              <span>Disposal included in scope</span>
            </label>
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Notes">
        <FormField label="Appliance Notes">
          <textarea className="textarea" rows={4} {...register('notes')} placeholder="Owner-supplied vs. contractor-supplied, delivery dates, installation requirements..." />
        </FormField>
      </SectionCard>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={!isDirty}>Save Appliance Info</button>
        {!isDirty && <span className="saved-indicator">✓ Saved</span>}
      </div>
    </form>
  );
}
