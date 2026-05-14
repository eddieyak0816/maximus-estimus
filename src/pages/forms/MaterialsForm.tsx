import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SectionCard from '../../components/SectionCard';
import FormField from '../../components/FormField';
import type { Assessment, MaterialSelection } from '../../types';

interface Props {
  assessment: Assessment;
  onSave: (patch: Partial<Assessment>) => void;
}

export default function MaterialsForm({ assessment, onSave }: Props) {
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<MaterialSelection>({
    defaultValues: assessment.materials,
  });

  useEffect(() => { reset(assessment.materials); }, [assessment.id]);

  function onSubmit(data: MaterialSelection) {
    onSave({ materials: data });
    reset(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-page">
      <SectionCard title="Countertops">
        <div className="form-grid form-grid-2">
          <FormField label="Material">
            <select className="select" {...register('countertopMaterial')}>
              <option value="quartz">Quartz (Engineered Stone)</option>
              <option value="granite">Granite</option>
              <option value="marble">Marble</option>
              <option value="laminate">Laminate</option>
              <option value="butcher-block">Butcher Block</option>
              <option value="concrete">Concrete</option>
              <option value="tile">Tile</option>
              <option value="other">Other</option>
            </select>
          </FormField>
          <FormField label="Color / Pattern" hint="e.g. Calacatta Gold, Carrara White">
            <input className="input" {...register('countertopColor')} placeholder="e.g. Calacatta Gold" />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Backsplash">
        <div className="form-grid form-grid-2">
          <FormField label="Material">
            <select className="select" {...register('backsplashMaterial')}>
              <option value="tile">Ceramic / Porcelain Tile</option>
              <option value="glass">Glass Tile</option>
              <option value="stone">Natural Stone</option>
              <option value="metal">Metal / Stainless</option>
              <option value="none">None</option>
              <option value="other">Other</option>
            </select>
          </FormField>
          <FormField label="Color / Pattern">
            <input className="input" {...register('backsplashColor')} placeholder="e.g. 3x6 White Subway" />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Flooring">
        <div className="form-grid form-grid-2">
          <FormField label="Material">
            <select className="select" {...register('flooringMaterial')}>
              <option value="hardwood">Hardwood</option>
              <option value="tile">Ceramic / Porcelain Tile</option>
              <option value="lvp">LVP / LVT</option>
              <option value="laminate">Laminate</option>
              <option value="carpet">Carpet</option>
              <option value="other">Other</option>
            </select>
          </FormField>
          <FormField label="Color / Species">
            <input className="input" {...register('flooringColor')} placeholder="e.g. Medium Oak, Gray Ash" />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Paint">
        <div className="form-grid form-grid-2">
          <FormField label="Wall Paint Color" hint="Brand and color code if known">
            <input className="input" {...register('paintColor')} placeholder="e.g. BM White Dove OC-17" />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Notes">
        <FormField label="Materials Notes">
          <textarea className="textarea" rows={4} {...register('notes')} placeholder="Special finishes, grout colors, edge profiles, tile patterns, samples collected..." />
        </FormField>
      </SectionCard>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={!isDirty}>Save Material Selections</button>
        {!isDirty && <span className="saved-indicator">✓ Saved</span>}
      </div>
    </form>
  );
}
