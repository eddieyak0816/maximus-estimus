create table if not exists public.pin_users (
  id uuid primary key default gen_random_uuid(),
  first_name text not null default '',
  last_name text not null default '',
  email text not null default '',
  pin text not null unique,
  created_at timestamptz not null default now()
);

alter table public.pin_users
add column if not exists first_name text not null default '';

alter table public.pin_users
add column if not exists last_name text not null default '';

alter table public.pin_users
add column if not exists email text not null default '';

create unique index if not exists pin_users_email_unique
on public.pin_users (lower(email))
where email <> '';

grant usage on schema public to anon;
grant select, insert, update on public.pin_users to anon;

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
with check (
  pin ~ '^[0-9]{4,}$'
  and first_name <> ''
  and last_name <> ''
  and email <> ''
);

alter table public.assessments enable row level security;
alter table public.team_members enable row level security;
alter table public.markup_settings enable row level security;
alter table public.price_guide enable row level security;

grant select, insert, update, delete on public.assessments to anon;
grant select, insert, update, delete on public.team_members to anon;
grant select, insert, update, delete on public.markup_settings to anon;
grant select, insert, update, delete on public.price_guide to anon;

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
