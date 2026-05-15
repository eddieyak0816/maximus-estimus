-- Grant INSERT/UPDATE/DELETE to anon role for dropdown management
grant insert on public.dropdown_options to anon;
grant update on public.dropdown_options to anon;
grant delete on public.dropdown_options to anon;
grant insert on public.dropdown_lists to anon;
grant update on public.dropdown_lists to anon;
grant delete on public.dropdown_lists to anon;

-- Optional: Drop the problematic RLS policies and use permissive ones instead
-- This allows anon to insert/update/delete, access control is handled by frontend
drop policy if exists "Allow admin insert dropdown_options" on public.dropdown_options;
drop policy if exists "Allow admin update dropdown_options" on public.dropdown_options;
drop policy if exists "Allow admin delete dropdown_options" on public.dropdown_options;
drop policy if exists "Allow admin insert dropdown_lists" on public.dropdown_lists;
drop policy if exists "Allow admin update dropdown_lists" on public.dropdown_lists;
drop policy if exists "Allow admin delete dropdown_lists" on public.dropdown_lists;

-- Create permissive policies (access control via frontend)
create policy "Allow public insert dropdown_options"
  on public.dropdown_options for insert to public with check (true);

create policy "Allow public update dropdown_options"
  on public.dropdown_options for update to public using (true);

create policy "Allow public delete dropdown_options"
  on public.dropdown_options for delete to public using (true);

create policy "Allow public insert dropdown_lists"
  on public.dropdown_lists for insert to public with check (true);

create policy "Allow public update dropdown_lists"
  on public.dropdown_lists for update to public using (true);

create policy "Allow public delete dropdown_lists"
  on public.dropdown_lists for delete to public using (true);
