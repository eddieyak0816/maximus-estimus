create table if not exists public.pin_users (
  id uuid primary key default gen_random_uuid(),
  pin text not null unique,
  created_at timestamptz not null default now()
);

alter table public.pin_users enable row level security;

drop policy if exists "Allow PIN lookup" on public.pin_users;
create policy "Allow PIN lookup"
on public.pin_users
for select
to anon
using (true);

drop policy if exists "Allow PIN create" on public.pin_users;
create policy "Allow PIN create"
on public.pin_users
for insert
to anon
with check (pin ~ '^[0-9]{4,}$');

alter table public.assessments enable row level security;
alter table public.team_members enable row level security;
alter table public.markup_settings enable row level security;
alter table public.price_guide enable row level security;

drop policy if exists "Allow app access" on public.assessments;
create policy "Allow app access"
on public.assessments
for all
to anon
using (true)
with check (true);

drop policy if exists "Allow app access" on public.team_members;
create policy "Allow app access"
on public.team_members
for all
to anon
using (true)
with check (true);

drop policy if exists "Allow app access" on public.markup_settings;
create policy "Allow app access"
on public.markup_settings
for all
to anon
using (true)
with check (true);

drop policy if exists "Allow app access" on public.price_guide;
create policy "Allow app access"
on public.price_guide
for all
to anon
using (true)
with check (true);

drop policy if exists "Allow app photo access" on storage.objects;
create policy "Allow app photo access"
on storage.objects
for all
to anon
using (bucket_id = 'assessment-photos')
with check (bucket_id = 'assessment-photos');
