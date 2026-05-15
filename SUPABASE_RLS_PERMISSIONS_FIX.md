# 🔐 Supabase RLS & Permissions Guide

**Date Created:** May 15, 2026  
**Issue Resolved:** Live site getting 403 Forbidden when pulling from Supabase  
**Root Cause:** Missing table-level PostgreSQL permissions (separate from RLS policies)

---

## The Problem

**Symptom:** Live site (GitHub Pages) shows error in console:
```
Failed to pull assessments: Object
vjsqjtpvqealpqqjuocl.supabase.co/rest/v1/assessments: 403 Forbidden
```

**Why:** Supabase has TWO layers of access control:
1. **RLS (Row Level Security) policies** — control which ROWS users can see
2. **PostgreSQL table permissions** — control if users can SELECT/INSERT/UPDATE/DELETE at all

We had RLS policies set up, but the **table-level permissions were missing**. So the database said "no" before RLS could even check the policies.

---

## The Solution

### SQL to Run in Supabase

```sql
-- Grant SELECT permission to authenticated role (users logged in)
GRANT SELECT ON public.assessments TO authenticated;
GRANT SELECT ON public.team_members TO authenticated;
GRANT SELECT ON public.price_guide TO authenticated;
GRANT SELECT ON public.markup_settings TO authenticated;

-- Grant SELECT to anon role (unauthenticated, if needed)
GRANT SELECT ON public.assessments TO anon;
GRANT SELECT ON public.team_members TO anon;
GRANT SELECT ON public.price_guide TO anon;
GRANT SELECT ON public.markup_settings TO anon;

-- If you also need INSERT/UPDATE/DELETE:
GRANT INSERT, UPDATE, DELETE ON public.assessments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.price_guide TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.markup_settings TO authenticated;
```

---

## How to Diagnose This Issue

### Step 1: Check Browser Console
- Open live site DevTools (F12)
- Go to **Console** tab
- Look for: `Failed to pull` messages
- OR: `403 Forbidden`

### Step 2: Check Network Tab
- Go to **Network** tab
- Refresh page
- Look for requests to `supabase.co/rest/v1/[table_name]`
- If you see **403 status**, click on the request
- Go to **Response** tab
- Look for: `"code": "42501"` or `"permission denied for table"`

### Step 3: Check Supabase Error
The error response will say something like:
```json
{
  "code": "42501",
  "message": "permission denied for table assessments",
  "hint": "Grant the required privileges to the current role with: GRANT SELECT ON public.assessments TO authenticated;"
}
```

The **hint** tells you exactly what to grant!

---

## Related Issue: Stale LocalStorage

### What Happens
After fixing permissions, you might see **duplicate assessments** if the live site has old cached data in localStorage.

**Example:** 2 Eddie Yakubovich + 1 Nish Patel (when there should be 1 of each)

### Why
The app uses **local-first caching**:
- Assessments stored in browser `localStorage`
- New data pulled from Supabase syncs in **addition to** cached data
- If you don't clear old cache, you see both old + new

### Fix: Clear LocalStorage
1. Open live site DevTools
2. **Application** → **LocalStorage**
3. Find `maximus-estimus-v3` key
4. **Delete it**
5. **Refresh page**

Now it pulls only fresh data from Supabase.

---

## How to Prevent This

### For New Tables
When adding new Supabase tables:

1. **Set up RLS** (done automatically if you enable it in Supabase UI)
2. **Create RLS policies** for SELECT/INSERT/UPDATE/DELETE as needed
3. **GRANT table permissions** to roles that need access:
   ```sql
   GRANT SELECT ON public.new_table TO authenticated;
   GRANT SELECT ON public.new_table TO anon;
   GRANT INSERT, UPDATE, DELETE ON public.new_table TO authenticated;
   ```

### Checklist for New Features
- [ ] Table created in Supabase
- [ ] RLS enabled on table
- [ ] RLS policies created (SELECT, INSERT, UPDATE, DELETE as needed)
- [ ] GRANT statements run for `authenticated` role
- [ ] GRANT statements run for `anon` role (if needed)
- [ ] Test on localhost: data syncs?
- [ ] Test on live site: data syncs?
- [ ] Clear live site localStorage if seeing duplicates

---

## Reference: RLS Policy Template

```sql
-- Allow authenticated users to SELECT all rows
CREATE POLICY "authenticated_select"
  ON public.my_table
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to INSERT their own data (with creator_id)
CREATE POLICY "authenticated_insert"
  ON public.my_table
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid()::text);

-- Allow authenticated users to UPDATE their own data
CREATE POLICY "authenticated_update"
  ON public.my_table
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid()::text);

-- Allow authenticated users to DELETE their own data
CREATE POLICY "authenticated_delete"
  ON public.my_table
  FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid()::text);
```

---

## Current Supabase Permissions (May 15, 2026)

**Tables with proper permissions:**
- `assessments` ✅ SELECT to authenticated + anon
- `team_members` ✅ SELECT to authenticated + anon
- `price_guide` ✅ SELECT to authenticated + anon
- `markup_settings` ✅ SELECT to authenticated + anon
- `pin_users` ✅ SELECT/INSERT/DELETE to public (for PIN login)
- `dropdown_lists` ✅ SELECT/INSERT/UPDATE/DELETE to anon (for dropdown management)
- `dropdown_options` ✅ SELECT/INSERT/UPDATE/DELETE to anon (for dropdown options)

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| 403 Forbidden errors in console | Missing `GRANT SELECT` | Run GRANT statements above |
| Data shows old + new (duplicates) | Stale localStorage | Clear `maximus-estimus-v3` from localStorage |
| Live site sees no data, localhost works | Different Supabase project? | Check `.env.local` URLs match |
| Some users can't see data, others can | RLS policy filtering by creator_id | Check `creator_id` matches user ID |
| Local site stops syncing | Supabase API key expired | Check `.env.local` for valid keys |

---

## For Future Developers

**Before deploying to live site:**
1. Check that all new tables have proper RLS + GRANT permissions
2. Test data sync on localhost (should auto-sync to Supabase)
3. Hard-refresh live site and verify data appears
4. Check browser console for 403 errors
5. If duplicates appear, clear localStorage

**If 403 errors appear after deployment:**
1. Don't panic — it's a permissions issue, data is safe
2. Go to Supabase → SQL Editor
3. Run the GRANT statements
4. Refresh live site
5. Clear localStorage if you see duplicates

---

**Status:** Issue resolved, safeguards in place  
**Severity:** Medium (data isn't lost, but users can't access it)  
**Prevention:** Add permission checks to deployment checklist
