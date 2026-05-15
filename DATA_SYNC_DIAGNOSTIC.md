# 🔍 Data Sync Diagnostic — Why 3 Assessments on Localhost ≠ 1 on Live

**Issue:** 3 assessments on localhost, 1 on live site, none matching

---

## Likely Cause

The background push to Supabase is **not completing** when you save data on localhost. This means:
- Data saves to **localStorage only**
- Data does **NOT reach Supabase**
- Live site can't see it (because it pulls from Supabase)

---

## How to Check (Browser Console Diagnostic)

### On Localhost (5174):

1. **Open DevTools** (Press F12)
2. **Go to Console tab**
3. **Create a new assessment** (click "+ New") — don't fill it, just create it
4. **Check Console for errors:**
   - Look for any red error messages
   - Look for anything mentioning "Supabase" or "push"
5. **Screenshot or copy-paste any errors you see**

Then:
6. **Paste this in Console:**
```javascript
// Check if assessments are being pushed to Supabase
console.log('Checking Supabase connection...');
const { supabase } = await import('./lib/supabase.js');
const { data, error } = await supabase.from('assessments').select('count');
if (error) {
  console.error('SUPABASE ERROR:', error);
} else {
  console.log('✓ Supabase is reachable. Total assessments in cloud:', data);
}
```
7. **Tell me what it says**

### On Live Site (GitHub Pages):

1. **Open DevTools** (F12)
2. **Console tab**
3. **Look for errors**
4. **Paste the same code above**
5. **Tell me what it says**

---

## Possible Issues

| Issue | Sign | Fix |
|-------|------|-----|
| **Push not triggered** | Console shows no "push" messages | Check browser console for errors |
| **Supabase unreachable** | "Network error" or "Failed to push" | Check internet connection, Supabase status |
| **Wrong Supabase project** | Live site shows different data | Verify .env.local has correct credentials |
| **Different user logged in** | Data from different creators | Log in as same user on both |
| **localStorage corruption** | Data in localStorage but won't push | Clear localStorage and retry |

---

## Quick Fixes to Try

### Fix 1: Clear and Retry
1. On localhost, go to DevTools → Application → LocalStorage
2. Find key `maximus-estimus-v3` and delete it
3. Refresh page
4. Create ONE new assessment (simple: just name)
5. Wait 5 seconds
6. Check Console for push messages
7. Go to live site, hard refresh, check Dashboard

### Fix 2: Check Supabase Directly
1. Go to https://supabase.com/dashboard
2. Log in (need Supabase account access)
3. Go to `assessments` table
4. See how many assessments exist
5. Check their `creator_id` and `created_at`

### Fix 3: Verify Environment Variables
Supabase credentials in `.env.local`:
```
VITE_SUPABASE_URL=https://vjsqjtpvqealpqqjuocl.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_wlGZAF_m3wawcF0kuVK2_Q_ANCCnatp
```

These should be the same on **both localhost and live site** (they are hardcoded in built files).

---

## What I Need From You

1. **Run diagnostic in browser console** (steps above)
2. **Screenshot or paste** any errors you see
3. **Tell me:** Does Supabase say "reachable" or "error"?
4. **Check Supabase dashboard** if possible

Once I see the error, I can fix the sync issue.

---

**Status:** Blocked on diagnostic  
**Severity:** HIGH — assessments aren't persisting to cloud
