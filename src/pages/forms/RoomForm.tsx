import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SectionCard from '../../components/SectionCard';
import FormField from '../../components/FormField';
import type { Assessment, RoomMeasurements } from '../../types';
import { calcArea } from '../../utils/calculations';

interface Props {
  assessment: Assessment;
  onSave: (patch: Partial<Assessment>) => void;
}

export default function RoomForm({ assessment, onSave }: Props) {
  const { register, handleSubmit, watch, reset, formState: { isDirty } } = useForm<RoomMeasurements>({
    defaultValues: assessment.room,
  });

  useEffect(() => { reset(assessment.room); }, [assessment.id]);

  const length = watch('length');
  const width = watch('width');
  const area = calcArea(length, width);

  function onSubmit(data: RoomMeasurements) {
    onSave({ room: data });
    reset(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-page">
      <SectionCard
        title="Room Dimensions"
        subtitle="Enter measurements in feet and inches (e.g. 12.5)"
        action={area > 0 ? <span className="area-badge">{area.toFixed(1)} sq ft</span> : undefined}
      >
        <div className="form-grid form-grid-3">
          <FormField label="Length (ft)" hint="Wall to wall">
            <input className="input" {...register('length')} placeholder="12.5" type="number" step="0.1" min="0" />
          </FormField>
          <FormField label="Width (ft)" hint="Wall to wall">
            <input className="input" {...register('width')} placeholder="10" type="number" step="0.1" min="0" />
          </FormField>
          <FormField label="Ceiling Height (ft)">
            <input className="input" {...register('height')} placeholder="9" type="number" step="0.1" min="0" />
          </FormField>
        </div>
        <div className="form-grid form-grid-2">
          <FormField label="Ceiling Type">
            <select className="select" {...register('ceilingType')}>
              <option value="standard">Standard / Flat</option>
              <option value="vaulted">Vaulted</option>
              <option value="coffered">Coffered</option>
              <option value="tray">Tray</option>
              <option value="other">Other</option>
            </select>
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Openings">
        <div className="form-grid form-grid-3">
          <FormField label="Number of Windows">
            <input className="input" {...register('windows', { valueAsNumber: true })} type="number" min="0" />
          </FormField>
          <FormField label="Number of Doors">
            <input className="input" {...register('doors', { valueAsNumber: true })} type="number" min="0" />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Soffit">
        <div className="form-grid form-grid-2">
          <FormField label="Existing Soffit?">
            <label className="checkbox-label">
              <input type="checkbox" {...register('soffit')} />
              <span>Yes, there is a soffit</span>
            </label>
          </FormField>
          <FormField label="Soffit Height (ft)" hint="Height of soffit from floor">
            <input className="input" {...register('soffitHeight')} placeholder="7.5" type="number" step="0.1" min="0" />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Notes">
        <FormField label="Room Notes">
          <textarea className="textarea" rows={4} {...register('notes')} placeholder="Describe any unusual conditions: sloped floors, out-of-square walls, load-bearing walls, plumbing locations..." />
        </FormField>
      </SectionCard>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={!isDirty}>Save Room Measurements</button>
        {!isDirty && <span className="saved-indicator">✓ Saved</span>}
      </div>
    </form>
  );
}
