import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SectionCard from '../../components/SectionCard';
import FormField from '../../components/FormField';
import type { Assessment, CabinetSpec } from '../../types';

interface Props {
  assessment: Assessment;
  onSave: (patch: Partial<Assessment>) => void;
}

export default function CabinetForm({ assessment, onSave }: Props) {
  const { register, handleSubmit, watch, reset, formState: { isDirty } } = useForm<CabinetSpec>({
    defaultValues: assessment.cabinets,
  });

  useEffect(() => { reset(assessment.cabinets); }, [assessment.id]);

  const islandIncluded = watch('islandIncluded');

  function onSubmit(data: CabinetSpec) {
    onSave({ cabinets: data });
    reset(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-page">
      <SectionCard title="Cabinet Style & Material">
        <div className="form-grid form-grid-2">
          <FormField label="Cabinet Style" hint="e.g. Shaker, Raised Panel, Slab">
            <input className="input" {...register('style')} placeholder="Shaker" />
          </FormField>
          <FormField label="Material">
            <select className="select" {...register('material')}>
              <option value="wood">Solid Wood</option>
              <option value="plywood">Plywood Box</option>
              <option value="mdf">MDF</option>
              <option value="thermofoil">Thermofoil</option>
              <option value="metal">Metal</option>
              <option value="other">Other</option>
            </select>
          </FormField>
          <FormField label="Finish / Color" hint="e.g. White, Espresso, Natural Oak">
            <input className="input" {...register('finish')} placeholder="White" />
          </FormField>
          <FormField label="Hardware Style" hint="e.g. Brushed Nickel Bar Pulls">
            <input className="input" {...register('hardwareStyle')} placeholder="Brushed Nickel Bar Pulls" />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Cabinet Count">
        <div className="form-grid form-grid-3">
          <FormField label="Upper Cabinets">
            <input className="input" {...register('upperCount', { valueAsNumber: true })} type="number" min="0" placeholder="0" />
          </FormField>
          <FormField label="Base Cabinets">
            <input className="input" {...register('baseCount', { valueAsNumber: true })} type="number" min="0" placeholder="0" />
          </FormField>
          <FormField label="Tall Cabinets / Pantries">
            <input className="input" {...register('tallCount', { valueAsNumber: true })} type="number" min="0" placeholder="0" />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Island">
        <div className="form-grid form-grid-2">
          <FormField label="Island Included?">
            <label className="checkbox-label">
              <input type="checkbox" {...register('islandIncluded')} />
              <span>Yes, project includes an island</span>
            </label>
          </FormField>
        </div>
        {islandIncluded && (
          <div className="form-grid form-grid-2">
            <FormField label="Island Length (ft)">
              <input className="input" {...register('islandLength')} type="number" step="0.1" min="0" placeholder="4.0" />
            </FormField>
            <FormField label="Island Width (ft)">
              <input className="input" {...register('islandWidth')} type="number" step="0.1" min="0" placeholder="2.5" />
            </FormField>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Notes">
        <FormField label="Cabinet Notes">
          <textarea className="textarea" rows={4} {...register('notes')} placeholder="Special features, custom modifications, crown molding, glass inserts, lazy Susans..." />
        </FormField>
      </SectionCard>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={!isDirty}>Save Cabinet Info</button>
        {!isDirty && <span className="saved-indicator">✓ Saved</span>}
      </div>
    </form>
  );
}
