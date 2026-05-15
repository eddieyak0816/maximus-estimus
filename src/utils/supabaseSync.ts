import { supabase } from '../lib/supabase';
import type { Assessment, PriceCategory, MarkupSettings } from '../types';

export async function pushAssessment(assessment: Assessment): Promise<void> {
  const { error } = await supabase
    .from('assessments')
    .upsert(
      {
        id: assessment.id,
        created_at: assessment.createdAt,
        updated_at: assessment.updatedAt,
        status: assessment.status,
        client: assessment.client,
        jobs: assessment.jobs,
        costs: assessment.costs,
        estimate: assessment.estimate,
        general_notes: assessment.generalNotes,
      },
      { onConflict: 'id' }
    );
  if (error) console.error('Failed to push assessment:', error);
}

export async function pullAllAssessments(): Promise<Assessment[]> {
  const { data, error } = await supabase
    .from('assessments')
    .select('*');

  if (error) {
    console.error('Failed to pull assessments:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    client: row.client,
    jobs: row.jobs,
    costs: row.costs,
    estimate: row.estimate,
    generalNotes: row.general_notes,
  }));
}

export async function deleteAssessmentRemote(id: string): Promise<void> {
  const { error } = await supabase
    .from('assessments')
    .delete()
    .eq('id', id);
  if (error) console.error('Failed to delete assessment:', error);
}

export async function pushTeamMembers(members: string[]): Promise<void> {
  // Delete all and re-insert
  await supabase.from('team_members').delete().neq('name', '');

  if (members.length === 0) return;

  const { error } = await supabase
    .from('team_members')
    .insert(members.map(name => ({ name })));
  if (error) console.error('Failed to push team members:', error);
}

export async function pullTeamMembers(): Promise<string[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('name');

  if (error) {
    console.error('Failed to pull team members:', error);
    return [];
  }

  return (data || []).map(row => row.name);
}

export async function pushMarkupSettings(settings: MarkupSettings): Promise<void> {
  const { error } = await supabase
    .from('markup_settings')
    .upsert({ id: 1, labor_pct: settings.laborPct, materials_pct: settings.materialsPct });
  if (error) console.error('Failed to push markup settings:', error);
}

export async function pullMarkupSettings(): Promise<MarkupSettings | null> {
  const { data, error } = await supabase
    .from('markup_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    console.error('Failed to pull markup settings:', error);
    return null;
  }

  if (!data) return null;

  return {
    laborPct: data.labor_pct,
    materialsPct: data.materials_pct,
  };
}

export async function pushPriceGuide(guide: PriceCategory[]): Promise<void> {
  const { error } = await supabase
    .from('price_guide')
    .upsert({ id: 1, data: guide });
  if (error) console.error('Failed to push price guide:', error);
}

export async function pullPriceGuide(): Promise<PriceCategory[] | null> {
  const { data, error } = await supabase
    .from('price_guide')
    .select('data')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    console.error('Failed to pull price guide:', error);
    return null;
  }

  return data?.data || null;
}
