# 🤖 Handoff Prompt for Next AI Developer

**Date:** May 17, 2026  
**From:** Eddie Yakubovich (Project Lead)  
**To:** Next AI Developer  
**Project:** Maximus Estimus — Field Assessment Tool

---

## 🎯 START HERE: Ask Clarifying Questions

**BEFORE you start coding, you must ask Eddie these questions to confirm you understand the scope:**

1. **Windows Feature:** "Should the Kitchen/Bathroom/etc. assessment ask 'Are windows getting replaced or added?' and track details (count, size, type)?"

2. **Flooring Feature:** "When a user marks 'Will there be new flooring?' in Kitchen/Bathroom/Other assessments, should:
   - A separate Flooring project be automatically created for that assessment?
   - Or should the user manually create one?
   - What flooring material options should be available?"

3. **Backsplash Feature:** "Should Kitchen assessments ask 'Will there be a new backsplash?' with material options (tiles, solid slab, other)?"

4. **Painting Feature:** "When a user marks 'Will we be painting that room?', should:
   - A separate Painting project be automatically created?
   - Or should the user manually create one?
   - What room locations should be tracked?"

5. **Recessed Lights Feature:** "Should Kitchen/Bathroom/Living Room assessments ask 'Will there be recessed lights?' with a field to specify 'How many?'"

6. **Project Auto-Creation:** "For Flooring and Painting projects that auto-create, what data should carry over from the parent project (Kitchen/Bathroom)?"

**Don't start coding until you have clear answers to all 6 questions.**

---

## 📊 Current Project State (May 17, 2026)

### What's Complete ✅
- **Room Templates:** Living Room, Bedroom, Deck fully implemented
- **Admin-Only Visibility:** Admins see all assessments, users see only their own (by creatorId)
- **PIN-Based Auth:** 4-12 digit PIN login with super admin controls
- **Dropdown Management:** 8 configurable dropdown lists (appliances, materials, etc.)
- **Photo Capture:** Device camera integration, IndexedDB storage
- **Estimates:** Auto-generated with manual override capability
- **Data Sync:** Localhost ↔ Supabase cloud sync working (see SUPABASE_RLS_PERMISSIONS_FIX.md)
- **Creator Tracking:** Assessment creator_id linked to user, displayed on Dashboard

### What Needs to Be Added (Your Task)
The 5 features listed above + any clarifications needed.

---

## 📁 Key Files You'll Modify

### Core Assessment Data
- **`src/types/index.ts`** — Add new field types for windows, backsplash, painting, recessed lights
- **`src/store/assessmentStore.ts`** — Add store actions for new fields + auto-project creation logic

### Kitchen/Bathroom Components
- **`src/pages/kitchen/KitchenQuestions.tsx`** — Add windows, flooring, backsplash, painting, recessed lights questions
- **`src/pages/bathroom/BathroomQuestions.tsx`** — Same as above
- **`src/pages/kitchen/KitchenMeasurements.tsx`** — May need to track window details
- **`src/pages/bathroom/BathroomMeasurements.tsx`** — May need to track window details

### Summary View
- **`src/pages/SummaryView.tsx`** — Display new fields for Kitchen/Bathroom

### Auto-Project Creation (If Needed)
- **`src/utils/autoProjectCreator.ts`** (NEW) — Helper to auto-create Flooring/Painting projects
- Modify KitchenQuestions & BathroomQuestions to call this when users select flooring/painting

---

## 🔍 Important Architecture Notes

### 1. Assessment Structure
```typescript
{
  id: string,
  creatorId: string,  // Links to pin_users.id
  status: 'draft' | 'in-progress' | 'complete',
  client: ClientInfo,
  jobs: JobInstance[],  // Array of Kitchen, Bathroom, Flooring, Living Room, etc.
  estimate?: EstimateData,
  generalNotes: string
}

// JobInstance shape
{
  id: string,
  type: 'Kitchen' | 'Bathroom' | 'Flooring' | 'Living Room' | 'Bedroom' | 'Deck' | 'Other',
  label: string,  // e.g., "Master Kitchen"
  kitchen?: KitchenAssessment,
  bathroom?: BathroomAssessment,
  flooring?: FlooringAssessment,
  // ... etc
}
```

### 2. Auto-Project Creation Pattern
If flooring is marked as needed in Kitchen:
- **Option A (Simple):** User manually creates a Flooring project (status quo)
- **Option B (Smart):** Auto-create Flooring project and show confirmation
- **Discuss with Eddie** which approach to use

### 3. Data Syncing
- **Local:** Data saves to localStorage immediately
- **Cloud:** Async push to Supabase in background (via pushAssessment)
- **Both ways sync:** Use syncFromCloud() on page load (already integrated)

### 4. Permissions & Security
- **RLS Policies:** Already set up on all tables
- **Table Permissions:** Already granted via GRANT statements (see SUPABASE_RLS_PERMISSIONS_FIX.md)
- **Admin Filtering:** Dashboard shows all assessments to admins, own only to regular users
- **Creator Tracking:** Every assessment has a creatorId linking to creator's user ID

---

## 📚 Documentation References

**Read these in order:**
1. **CLAUDE.md** — Full project overview, tech stack, data model
2. **project-spcs.md** — Detailed feature specifications
3. **SUPABASE_RLS_PERMISSIONS_FIX.md** — If you add new Supabase tables (critical!)
4. **ROOM_TEMPLATES_TEST_LOG.md** — How room templates were tested
5. **Memory files** in `.claude/projects/.../memory/` — Session context

---

## 🧪 Testing Checklist (Before Declaring Done)

- [ ] TypeScript build passes (npm run build)
- [ ] Create new Kitchen assessment
- [ ] All 5 new questions appear and work
- [ ] If auto-project creation enabled: new projects auto-create correctly
- [ ] Data persists after page reload
- [ ] Summary view shows all new fields
- [ ] Test as admin (see all assessments)
- [ ] Test as regular user (see only own assessments)
- [ ] Hard refresh live site → data still appears

---

## 🎯 Definition of Done

A feature is "done" when:
- ✅ Code compiles (no TypeScript errors)
- ✅ Tested on localhost manually (golden path works)
- ✅ Tested on live site (GitHub Pages)
- ✅ Data syncs between sites
- ✅ Documented in commit message (imperative tense)
- ✅ No console errors (besides service worker warnings)

---

## 💡 Code Style Reminders

- **Components:** PascalCase (e.g., `KitchenMeasurements.tsx`)
- **Functions:** camelCase (e.g., `calculateSquareFeet`)
- **CSS:** kebab-case classes (e.g., `.measurement-input`)
- **Commits:** Imperative tense ("Add windows question" not "Added feature")
- **Comments:** Only if WHY is non-obvious (avoid "what" comments)
- **No big refactors without discussion**

---

## 🚨 Common Pitfalls to Avoid

1. **Forgetting Supabase migrations** — If adding new tables/columns, run the SQL to create them
2. **Missing RLS permissions** — If new tables, GRANT SELECT/INSERT/UPDATE/DELETE to authenticated role
3. **Not testing on live site** — Always test both localhost AND GitHub Pages
4. **Forgetting to sync assessments** — After changes, call pushAssessment() to cloud
5. **Leaving console.log statements** — Remove debug logs before declaring done (except for critical ones)
6. **Breaking existing features** — Always test the golden path of existing features after changes

---

## 📞 If You Get Stuck

1. **TypeScript errors?** → Check `src/types/index.ts` for type definitions
2. **Data not syncing?** → Check Supabase RLS permissions (SUPABASE_RLS_PERMISSIONS_FIX.md)
3. **Store actions failing?** → Check `src/store/assessmentStore.ts` pattern
4. **Component not rendering?** → Check if data is in state and passed as props
5. **Build fails?** → Run `npm run build` locally to see full error

---

## ✅ Before You Start Coding

**CONFIRM with Eddie:**
1. Answer all 6 clarifying questions above
2. Get explicit approval on scope
3. Understand which features are high/medium/low priority
4. Know if auto-project creation should be enabled

**Then:**
1. Create a branch: `git checkout -b feature/windows-backsplash-painting`
2. Make changes
3. Test locally (npm run dev)
4. Commit with clear messages
5. Create PR when ready

---

## 🎬 Good Luck!

You have a solid foundation. The architecture is clean, types are strict, and the team relies on your work. Ask Eddie questions early and often. Don't hesitate to reference the docs or prior work.

**Next task after this:** Role-Based Job Visibility (filter by creator for non-admin users)

---

**Contact:** eddie0816@gmail.com  
**Live Site:** https://eddieyak0816.github.io/maximus-estimus/  
**Status:** Production-ready for current features, ready to extend
