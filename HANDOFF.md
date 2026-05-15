# Maximus Estimus — AI Developer Handoff (May 14, 2026)

## TL;DR
**Maximus Estimus** is a field measurement app for kitchen designers. Phase 1 (local field workflow) + Phase 5 (cloud sync) are complete. Team members now log in and see shared assessments across devices. **Next task:** Build room templates (Living Room, Bedroom, Deck) as alternate job types to Kitchen/Bathroom/Flooring.

---

## What You're Taking Over

### Current State
- ✅ **Core app works**: Assessments, measurements, questions, photos, estimates, summary reports
- ✅ **Cloud sync works**: Supabase backend, team authentication, shared data across devices
- ✅ **Photos work**: Capture via camera, store in Supabase Storage, see from any device
- ✅ **Deployed**: Live at https://eddieyak0816.github.io/maximus-estimus/
- 🔲 **Not done**: Room templates, admin panel, PDF export, mobile apps

### Technology
| Tech | Why | How to Learn |
|------|-----|-------------|
| React 19 + TypeScript | Web framework | Read `src/App.tsx`, `src/pages/` |
| Zustand | State management | Read `src/store/assessmentStore.ts` |
| Supabase | Backend (auth, DB, storage) | Read `src/lib/supabase.ts`, `src/utils/supabaseSync.ts` |
| Vite | Build tool | Runs `npm run dev` and `npm run build` |
| React Router v7 | Routing | Read `src/App.tsx` routes |
| localStorage + IndexedDB | Offline cache | Read `src/utils/photoStorage.ts` |

### Live URLs
- **App**: https://eddieyak0816.github.io/maximus-estimus/
- **Repo**: https://github.com/eddieyak0816/maximus-estimus
- **Supabase**: https://supabase.com/dashboard/project/vjsqjtpvqealpqqjuocl

---

## Critical Context

### Architecture: Local-First Sync
The app is built for **offline field work with team collaboration**:
1. **On startup**: Load assessments from localStorage instantly (no network wait)
2. **In background**: Fetch latest from Supabase, merge via last-write-wins (`updatedAt` timestamp)
3. **On every save**: Write to localStorage (immediate), then async Supabase push
4. **Photos**: Saved to IndexedDB locally, uploaded to Supabase Storage in background
5. **If offline**: All saves work locally, sync when back online

**Why this matters**: Job sites have terrible signal. Field workers can't wait for network calls.

### Data Flow
```
Component (Kitchen measurements form)
  ↓
Store action (updateJobKitchen)
  ↓
1) Update Zustand state + localStorage (sync, immediate) ✓
2) Call pushAssessment() to Supabase (async, background) ✓
  ↓
Component re-renders with new data instantly
Other devices see the change after next refresh or sync
```

### Authentication
- **Login page** at `/login` for unauthenticated users
- **Supabase Auth** — email/password, created by Eddie in dashboard
- **All authenticated users see all data** — no user isolation yet (that's Sprint 4)
- **Sign out button** in nav → redirects to login

### Team Workflow (Why This Matters)
1. Field worker opens app, logs in
2. Creates assessment, records measurements + photos
3. Photos upload to Supabase Storage in background
4. Designer logs in from office, sees the assessment + photos
5. Designer creates floor plan, uploads back (future Sprint 6)

---

## How to Get Started

### 1. Set Up Local Environment
```bash
# Clone the repo (you probably already have it)
git clone https://github.com/eddieyak0816/maximus-estimus
cd "g:\My Drive\Maximus Digital Marketing\Maximus Estimus"

# Install deps (Google Drive workaround — see CLAUDE.md)
cd C:\Users\Eddie\AppData\Local\Temp\maximus-estimus-setup
npm install
xcopy /E /I node_modules "g:\My Drive\Maximus Digital Marketing\Maximus Estimus\node_modules"

# Create .env.local with Supabase credentials (ask Eddie or check CLAUDE.md)
VITE_SUPABASE_URL=https://vjsqjtpvqealpqqjuocl.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_wlGZAF_m3wawcF0kuVK2_Q_ANCCnatp

# Start dev server
cd "g:\My Drive\Maximus Digital Marketing\Maximus Estimus"
npm run dev

# Visit http://localhost:5173
```

### 2. Understand the Codebase in 30 Minutes
Read these files in order:
1. **CLAUDE.md** — This file (complete project context)
2. **src/types/index.ts** — All TypeScript types (the data model)
3. **src/store/assessmentStore.ts** — How state is managed and persisted
4. **src/App.tsx** — Routing and auth setup
5. **src/pages/AssessmentDetail.tsx** — How a kitchen assessment works (reference for building room templates)

### 3. Next Task: Build Room Templates
The user (Eddie) explicitly chose this as Priority 1. You'll add 3 new room types:

#### What to Build
- **Living Room**: ceiling height, window count, door count, outlet count, flooring type, lighting notes
- **Bedroom**: ceiling height, closet count, window count, door count, outlet count, flooring type
- **Deck/Outdoor**: dimensions (length × width × height), existing condition, railing present/notes, access notes

Each room type needs:
- **Measurements form** (similar structure to Kitchen/Bathroom/Flooring)
- **Questions form** (scope, timeline, referral, special notes)
- **Photos checklist** (overview, details, problem areas)
- **Data model** in `src/types/index.ts`
- **Store actions** to update state (`updateJobLivingRoom`, etc. — already exist)

#### File Structure
```
src/pages/
├── living-room/
│   ├── LivingRoomMeasurements.tsx
│   ├── LivingRoomQuestions.tsx
│   └── LivingRoomPhotos.tsx
├── bedroom/
│   ├── BedroomMeasurements.tsx
│   ├── BedroomQuestions.tsx
│   └── BedroomPhotos.tsx
├── deck/
│   ├── DeckMeasurements.tsx
│   ├── DeckQuestions.tsx
│   └── DeckPhotos.tsx
```

#### How to Wire It In
1. **Types** — Already defined in `src/types/index.ts` (LivingRoomAssessment, etc.)
2. **Store actions** — Already exist (`updateJobLivingRoom`, etc.)
3. **AssessmentDetail.tsx** — Add routing logic (already has a pattern to follow from Kitchen/Bathroom)
4. **JobTypePage.tsx** — Add buttons to select "Living Room", "Bedroom", "Deck"
5. **SummaryView.tsx** — Add display sections for room templates

#### Reference Implementation
Copy the pattern from **KitchenMeasurements.tsx** → **LivingRoomMeasurements.tsx**, but with simpler fields (no island, no appliances, no soffit). Bathroom is even simpler. Use Flooring as a template for minimal forms.

---

## Key Rules (Read CLAUDE.md § "Communication & Collaboration Preferences")

1. **Test in browser before declaring done** — Type checking ≠ feature correctness
2. **Don't refactor without asking** — The codebase is intentionally simple
3. **Ask if scope is unclear** — 5-min clarification saves 30 min of rework
4. **Short, imperative commits** — "Add living room template" not "added feature"
5. **No big changes to tech stack** — React/TypeScript/Zustand/Supabase are locked

---

## Important Files You'll Touch

| File | Purpose | Why It Matters |
|------|---------|----------------|
| `src/types/index.ts` | TypeScript type definitions | The entire data model lives here |
| `src/store/assessmentStore.ts` | Zustand state + Supabase sync | Every state change triggers sync |
| `src/pages/AssessmentDetail.tsx` | Main assessment form router | Routes to Kitchen/Bathroom/Flooring/(new room types) |
| `src/pages/JobTypePage.tsx` | Job type selector | Where user picks Kitchen vs Flooring vs (new room types) |
| `src/pages/SummaryView.tsx` | Read-only report view | Must display room template data correctly |
| `src/App.tsx` | Routes + auth | Protected routes, login flow |
| `src/components/Layout.tsx` | App header + nav | Has sign-out button |

---

## Acceptance Criteria for Room Templates

Done when:
- ✓ User can select "Living Room", "Bedroom", or "Deck" from job type picker
- ✓ Each room type shows its own measurement form with correct fields
- ✓ Each room type shows its own questions form
- ✓ Each room type shows its own photo checklist
- ✓ Data saves to Supabase (check dashboard to verify)
- ✓ Photos upload and appear in summary view
- ✓ Summary view displays room template data correctly
- ✓ Multi-job assessment works (can have Kitchen + Living Room in one assessment)
- ✓ No TypeScript errors (`npm run build` passes)
- ✓ Live on GitHub Pages (workflow passes)

---

## Known Limitations (Don't Fix These Yet)

- **Photos require internet to upload** — Offline queuing not yet implemented
- **No real-time subscriptions** — Refresh needed to see other users' changes
- **No role-based access** — All users see all data (that's Sprint 4 Admin Panel)
- **No PDF export** — Coming in Sprint 6
- **No mobile app** — Coming in Sprint 7

---

## How to Ask for Help

If stuck:
1. **Build fails?** Run `npm run build` locally, share the error
2. **Type errors?** Read the TypeScript error message — it's usually clear
3. **Behavior broken?** Test in browser, open DevTools Console, share the error
4. **Not sure about scope?** Ask Eddie or review similar implementations (Kitchen/Bathroom for reference)

---

## Quick Command Reference

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages (Eddie usually does this)
npm run deploy

# Lint
npm run lint

# Check types
npm run build  # (includes tsc -b)
```

---

## When You're Done

1. **Test the golden path** (create assessment, pick room type, fill form, save, see in summary)
2. **Test multi-job** (add Kitchen + Living Room in same assessment)
3. **Check Supabase dashboard** (verify data is there)
4. **Make a commit** with clear message
5. **Push to GitHub** (`git push`)
6. **Wait for GitHub Actions** to deploy
7. **Test live site** at https://eddieyak0816.github.io/maximus-estimus/
8. **Notify Eddie** the task is complete

---

## Still Have Questions?

- **Architecture**: Read CLAUDE.md § "Tech Stack & Architecture"
- **Data model**: Read `src/types/index.ts` and `src/store/assessmentStore.ts`
- **How sync works**: Read `src/utils/supabaseSync.ts` and the store's `syncFromCloud` action
- **How photos work**: Read `src/utils/photoStorage.ts`
- **How forms work**: Read `src/pages/kitchen/KitchenMeasurements.tsx` (simple controlled components)

Good luck! 🚀
