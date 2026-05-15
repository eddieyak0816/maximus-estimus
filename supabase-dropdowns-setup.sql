-- Supabase SQL Setup for Configurable Dropdowns
-- Run this in Supabase SQL Editor, then seed default data with the provided JSON

-- 1. Create dropdown_lists table
create table if not exists public.dropdown_lists (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,  -- "appliance_names", "flooring_materials", etc.
  label text not null,        -- "Appliance Names", "Flooring Materials", etc.
  description text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 2. Create dropdown_options table
create table if not exists public.dropdown_options (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.dropdown_lists(id) on delete cascade,
  value text not null,        -- "Stove", "Refrigerator", etc.
  label text not null,        -- Display label (same as value usually)
  display_order int default 0,
  created_at timestamp default now()
);

-- 3. Create unique index on list_id + value to prevent duplicates
create unique index if not exists idx_dropdown_options_list_value
  on public.dropdown_options(list_id, value);

-- 4. RLS Policies for dropdown_lists (public read, admin write)
alter table public.dropdown_lists enable row level security;

create policy "Allow public read dropdown_lists"
  on public.dropdown_lists for select to public using (true);

create policy "Allow admin insert dropdown_lists"
  on public.dropdown_lists for insert to public
  with check (
    exists (
      select 1 from public.pin_users
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Allow admin update dropdown_lists"
  on public.dropdown_lists for update to public
  using (
    exists (
      select 1 from public.pin_users
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Allow admin delete dropdown_lists"
  on public.dropdown_lists for delete to public
  using (
    exists (
      select 1 from public.pin_users
      where id = auth.uid() and is_admin = true
    )
  );

-- 5. RLS Policies for dropdown_options (public read, admin write)
alter table public.dropdown_options enable row level security;

create policy "Allow public read dropdown_options"
  on public.dropdown_options for select to public using (true);

create policy "Allow admin insert dropdown_options"
  on public.dropdown_options for insert to public
  with check (
    exists (
      select 1 from public.pin_users
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Allow admin update dropdown_options"
  on public.dropdown_options for update to public
  using (
    exists (
      select 1 from public.pin_users
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Allow admin delete dropdown_options"
  on public.dropdown_options for delete to public
  using (
    exists (
      select 1 from public.pin_users
      where id = auth.uid() and is_admin = true
    )
  );

-- 6. DEFAULT DATA INSERTION
-- First, insert dropdown_lists
insert into public.dropdown_lists (name, label, description) values
  ('appliance_names', 'Appliance Names', 'Kitchen appliances (stove, fridge, etc.)'),
  ('flooring_materials', 'Flooring Materials', 'Types of flooring (hardwood, tile, vinyl, etc.)'),
  ('cabinet_finishes', 'Cabinet Finishes', 'Cabinet finish options (oak, maple, espresso, etc.)'),
  ('room_names', 'Room Names', 'Custom room labels (Master Bedroom, Powder Room, etc.)'),
  ('wall_labels', 'Wall Labels', 'Wall identifiers (typically A, B, C, D but customizable)'),
  ('team_members', 'Team Members', 'Field team member names'),
  ('transition_locations', 'Transition Locations', 'Where flooring transitions occur (doorway, threshold, stairs, etc.)'),
  ('special_notes_categories', 'Special Notes Categories', 'Categories for special notes (warranty, color match, etc.)')
on conflict (name) do nothing;

-- Insert appliance_names options
insert into public.dropdown_options (list_id, value, label, display_order)
select id, 'Stove', 'Stove', 1 from dropdown_lists where name = 'appliance_names'
union all
select id, 'Refrigerator', 'Refrigerator', 2 from dropdown_lists where name = 'appliance_names'
union all
select id, 'Dishwasher', 'Dishwasher', 3 from dropdown_lists where name = 'appliance_names'
union all
select id, 'Microwave', 'Microwave', 4 from dropdown_lists where name = 'appliance_names'
union all
select id, 'Oven', 'Oven', 5 from dropdown_lists where name = 'appliance_names'
union all
select id, 'Cooktop', 'Cooktop', 6 from dropdown_lists where name = 'appliance_names'
union all
select id, 'Range Hood', 'Range Hood', 7 from dropdown_lists where name = 'appliance_names'
on conflict do nothing;

-- Insert flooring_materials options
insert into public.dropdown_options (list_id, value, label, display_order)
select id, 'Hardwood', 'Hardwood', 1 from dropdown_lists where name = 'flooring_materials'
union all
select id, 'Tile', 'Tile', 2 from dropdown_lists where name = 'flooring_materials'
union all
select id, 'Vinyl', 'Vinyl', 3 from dropdown_lists where name = 'flooring_materials'
union all
select id, 'Laminate', 'Laminate', 4 from dropdown_lists where name = 'flooring_materials'
union all
select id, 'Carpet', 'Carpet', 5 from dropdown_lists where name = 'flooring_materials'
union all
select id, 'Stone', 'Stone', 6 from dropdown_lists where name = 'flooring_materials'
union all
select id, 'Concrete', 'Concrete', 7 from dropdown_lists where name = 'flooring_materials'
on conflict do nothing;

-- Insert cabinet_finishes options
insert into public.dropdown_options (list_id, value, label, display_order)
select id, 'Oak', 'Oak', 1 from dropdown_lists where name = 'cabinet_finishes'
union all
select id, 'Maple', 'Maple', 2 from dropdown_lists where name = 'cabinet_finishes'
union all
select id, 'Espresso', 'Espresso', 3 from dropdown_lists where name = 'cabinet_finishes'
union all
select id, 'White', 'White', 4 from dropdown_lists where name = 'cabinet_finishes'
union all
select id, 'Natural', 'Natural', 5 from dropdown_lists where name = 'cabinet_finishes'
union all
select id, 'Grey', 'Grey', 6 from dropdown_lists where name = 'cabinet_finishes'
on conflict do nothing;

-- Insert wall_labels options
insert into public.dropdown_options (list_id, value, label, display_order)
select id, 'A', 'A', 1 from dropdown_lists where name = 'wall_labels'
union all
select id, 'B', 'B', 2 from dropdown_lists where name = 'wall_labels'
union all
select id, 'C', 'C', 3 from dropdown_lists where name = 'wall_labels'
union all
select id, 'D', 'D', 4 from dropdown_lists where name = 'wall_labels'
on conflict do nothing;

-- Insert transition_locations options
insert into public.dropdown_options (list_id, value, label, display_order)
select id, 'Doorway', 'Doorway', 1 from dropdown_lists where name = 'transition_locations'
union all
select id, 'Threshold', 'Threshold', 2 from dropdown_lists where name = 'transition_locations'
union all
select id, 'Stairs', 'Stairs', 3 from dropdown_lists where name = 'transition_locations'
union all
select id, 'Kitchen to Dining', 'Kitchen to Dining', 4 from dropdown_lists where name = 'transition_locations'
union all
select id, 'Hallway', 'Hallway', 5 from dropdown_lists where name = 'transition_locations'
on conflict do nothing;

-- Insert special_notes_categories options
insert into public.dropdown_options (list_id, value, label, display_order)
select id, 'Warranty', 'Warranty', 1 from dropdown_lists where name = 'special_notes_categories'
union all
select id, 'Color Match', 'Color Match', 2 from dropdown_lists where name = 'special_notes_categories'
union all
select id, 'Custom Request', 'Custom Request', 3 from dropdown_lists where name = 'special_notes_categories'
union all
select id, 'Budget Constraint', 'Budget Constraint', 4 from dropdown_lists where name = 'special_notes_categories'
union all
select id, 'Timeline Pressure', 'Timeline Pressure', 5 from dropdown_lists where name = 'special_notes_categories'
on conflict do nothing;
