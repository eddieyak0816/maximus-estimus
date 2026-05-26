-- Migration: Add assignment support to assessments
-- Purpose: Allow admins to assign assessments to team members

-- Add assigned_to_user_id column to assessments table
alter table public.assessments
add column if not exists assigned_to_user_id uuid references public.pin_users(id) on delete set null;

-- Update RLS policy to allow users to see assessments assigned to them
drop policy if exists "Allow app access" on public.assessments;
create policy "Allow app access"
on public.assessments
for all
to anon
using (true)
with check (true);
