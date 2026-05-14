import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SectionCard from '../../components/SectionCard';
import FormField from '../../components/FormField';
import type { Assessment, ClientInfo } from '../../types';

const schema = z.object({
  name: z.string().min(1, 'Client name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email').or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2).max(2),
  zip: z.string().min(5, 'ZIP code required'),
  notes: z.string(),
});

interface Props {
  assessment: Assessment;
  onSave: (patch: Partial<Assessment>) => void;
}

export default function ClientForm({ assessment, onSave }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ClientInfo>({
    resolver: zodResolver(schema),
    defaultValues: assessment.client,
  });

  useEffect(() => { reset(assessment.client); }, [assessment.id]);

  function onSubmit(data: ClientInfo) {
    onSave({ client: data });
    reset(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-page">
      <SectionCard title="Client Information" subtitle="Contact and address details for this project">
        <div className="form-grid form-grid-2">
          <FormField label="Client Name" error={errors.name?.message} required>
            <input className="input" {...register('name')} placeholder="John Smith" />
          </FormField>
          <FormField label="Phone Number" error={errors.phone?.message} required>
            <input className="input" {...register('phone')} placeholder="(555) 555-5555" />
          </FormField>
          <FormField label="Email Address" error={errors.email?.message}>
            <input className="input" {...register('email')} type="email" placeholder="client@email.com" />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Project Address">
        <div className="form-grid form-grid-1">
          <FormField label="Street Address" error={errors.address?.message} required>
            <input className="input" {...register('address')} placeholder="123 Main St" />
          </FormField>
        </div>
        <div className="form-grid form-grid-3">
          <FormField label="City" error={errors.city?.message} required>
            <input className="input" {...register('city')} placeholder="Trenton" />
          </FormField>
          <FormField label="State" error={errors.state?.message} required>
            <input className="input" {...register('state')} placeholder="NJ" maxLength={2} style={{ textTransform: 'uppercase' }} />
          </FormField>
          <FormField label="ZIP Code" error={errors.zip?.message} required>
            <input className="input" {...register('zip')} placeholder="08601" />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Notes">
        <FormField label="Client Notes">
          <textarea className="textarea" rows={4} {...register('notes')} placeholder="Any additional notes about the client or project..." />
        </FormField>
      </SectionCard>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={!isDirty}>
          Save Client Info
        </button>
        {!isDirty && <span className="saved-indicator">✓ Saved</span>}
      </div>
    </form>
  );
}
