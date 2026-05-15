# 📊 Data Sync Guide — Localhost vs Live Site

**Date Created:** May 15, 2026  
**Issue:** Different data visible on localhost vs GitHub Pages live site

---

## How Data Sync Works

### The System
The app uses a **local-first + cloud sync** architecture:

1. **Localhost (your computer):**
   - Data stored in browser **localStorage** (offline cache)
   - Every change saves to localStorage **immediately**
   - Simultaneously pushes to Supabase **in background** (async)

2. **Live Site (GitHub Pages):**
   - Also loads from browser **localStorage** first
   - Also syncs from Supabase in background
   - Same database as localhost (Supabase)

3. **Supabase (Cloud Database):**
   - Single shared database for both localhost and live site
   - All users pull from and push to the same Supabase

---

## Why Data Differs

### Common Reasons:
1. **Localhost data not yet synced to cloud**
   - You created/edited data on localhost
   - Changes saved to localStorage
   - But push to Supabase hasn't completed yet
   - Live site doesn't see it because it's not in Supabase

2. **Browser cache issue**
   - Live site cached old Supabase data
   - Need to hard-refresh the browser

3. **Different user logged in**
   - You created data with User A on localhost
   - Live site shows only User B's data (due to admin filtering)

---

## How to Ensure Data Is in Sync

### Step 1: Check What's on Localhost
1. Go to `http://localhost:5174/maximus-estimus/`
2. Log in
3. Look at your assessments on the Dashboard
4. Note how many you see

### Step 2: Force Sync to Cloud (Ensure Push)
**Every time you save data on localhost, it automatically pushes to Supabase.** This happens in the background.

To be 100% sure your localhost data is in Supabase:
- Open browser **DevTools** (F12)
- Go to **Console** tab
- Paste this code:
```javascript
// Force sync all assessments to cloud
const store = require('./store/assessmentStore').useAssessmentStore;
const assessments = store.getState().assessments;
assessments.forEach(a => {
  import('./utils/supabaseSync').then(m => m.pushAssessment(a));
});
console.log('Pushed ' + assessments.length + ' assessments to cloud');
```

### Step 3: Check Live Site
1. Go to live site: `https://eddieyak0816.github.io/maximus-estimus/`
2. Log in with **same user**
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R on Mac)
4. Check Dashboard for your assessments

---

## The Real Issue: Admin Filtering

**Important:** After the recent change, the Dashboard filters assessments:
- **Admins:** See all assessments
- **Regular users:** See only their own (by creatorId)

**Make sure:**
1. Both localhost and live site are using **the same user account**
2. That user has the **same admin status** on both (or data was created with the same user ID)

---

## File Locations (For Reference)

**Data sync code:**
- `src/utils/supabaseSync.ts` — Push/pull functions
- `src/store/assessmentStore.ts` — Local state + sync triggers

**Where data is stored:**
- **Browser localStorage:** Key = `maximus-estimus-v3`
- **Supabase:** Table = `assessments`
- **IndexedDB:** Photos (separate from assessments)

---

## Verification Checklist

- [ ] Logged in with **same user** on both localhost and live site
- [ ] Created test assessment on localhost
- [ ] Waited 5 seconds for background push to complete
- [ ] Hard-refreshed live site (Ctrl+Shift+R)
- [ ] Logged in on live site with **same user**
- [ ] Test assessment appears on live site Dashboard
- [ ] Assessment data is identical (same customer, jobs, measurements)

---

## Troubleshooting

### Data still doesn't match after hard refresh?

1. **Check Supabase directly:**
   - Go to https://supabase.com/dashboard
   - View `assessments` table
   - Verify your test assessment is there

2. **Check localStorage on live site:**
   - Open DevTools on live site
   - Application → LocalStorage
   - Click the live site URL
   - Look for key `maximus-estimus-v3`
   - Check if data is there

3. **Check if you're looking at the right user's data:**
   - Supabase assessments have a `creator_id` field
   - Make sure creator_id matches the user you're logged in as

4. **Clear cache and retry:**
   - DevTools → Application → Clear Storage
   - Log in again
   - Create new test assessment on localhost
   - Wait 10 seconds
   - Hard refresh live site
   - Log in with same user

---

## For Future Developers

The sync system is **automatic**. You don't need to manually sync in normal use. But if data seems out of sync:

1. Check if changes were recently made (they auto-push)
2. Verify same user is logged in on both sites
3. Hard-refresh the live site (browser cache issue)
4. Check Supabase dashboard to verify data exists in cloud

If issues persist, check browser console for errors from the sync functions.

---

**Status:** Ready to verify data sync  
**Next step:** Test checklist above
