# Handoff Prompt — Next AI Developer (May 26, 2026 - Session 2)

## What Just Got Done ✅

**Feature: All Accordions Start Closed on Measure Tab**

When a user enters the "📏 Measure" tab in any assessment, all collapsible sections (accordions) now start in a closed state. This provides a clean measurement interface.

### Implementation
- Main sections (Room Globals, Walls, Island, etc.) start closed
- Wall sub-sections (soffit, sink, cabinets) start closed
- Sub-cards (Windows, Doors, Appliances) start closed
- State resets fresh when switching tabs back to Measure
- Uses React key-based remounting + prop propagation pattern

### Files Changed
- `src/pages/AssessmentDetail.tsx` — Added key + startClosed prop
- `src/pages/kitchen/KitchenMeasurements.tsx` — Added startClosed prop, updated defaultOpen
- `src/pages/bathroom/BathroomMeasurements.tsx` — Added startClosed prop, updated defaultOpen
- `src/components/WallSection.tsx` — Added startClosed prop to all sub-cards

### How to Verify
1. Open any assessment with Kitchen or Bathroom job
2. Click "📏 Measure" tab
3. All sections should start collapsed (chevrons point right ▶️)
4. Click section header to open it
5. Click "📋 Questions" tab, then back to "📏 Measure"
6. Sections should be collapsed again (fresh reset)

---

## What's Next? 🔲

### Priority 1: Feature 2 — Dynamic Wall Count (5+ Walls)
**Goal:** Allow users to add more walls beyond the hardcoded A, B, C, D limit.

**Scope:**
- Replace hardcoded WALL_LABELS array with dynamic wall count
- Add "➕ Add Wall" button below Wall D to create E, F, G, etc.
- Remove button for user-added walls
- Auto-naming based on letter sequence
- Photo handling (wall photos tagged with auto-generated names)
- Estimate generation updates (works with any wall count)

**Files to modify:**
- `src/pages/kitchen/KitchenMeasurements.tsx`
- `src/pages/bathroom/BathroomMeasurements.tsx`
- `src/types/index.ts` — KitchenMeasurements.walls structure
- `src/store/assessmentStore.ts` — add/remove wall actions
- `src/utils/estimateEngine.ts` — ensure generation loops correctly

**Acceptance Criteria:**
- ✓ Users can add walls beyond D
- ✓ Walls auto-name (E, F, G, H, etc.)
- ✓ Wall photos work with new walls
- ✓ Estimates generate correctly for all walls
- ✓ Persist to Supabase
- ✓ Works on Kitchen, Bathroom, and other wall-based pages

### Priority 2: Sprint 6 — Export & Email
- PDF export (full job report)
- Customer-facing PDF (clean, branded, no costs)
- Internal PDF (costs, margins — owner only)
- Email directly from app

### Priority 3: Mobile Apps (Sprint 7)
- Decide: React Native (true native) vs PWA (web-based)
- iOS + App Store submission
- Android + Google Play submission

---

## How to Work with Eddie

- **Async preferred** — Detailed handoff docs are appreciated
- **Clear task definitions** — Include: what it does, why, where, acceptance criteria
- **Test in the browser** — Type checking ≠ feature correctness. Always verify in the real app.
- **Commit messages** — Short, imperative: "Add dynamic wall count" not "added feature"
- **No big refactors** — Ask first if you spot tech debt

---

## Quick Navigation

**Key Files**
- `src/pages/AssessmentDetail.tsx` — Tab routing + measurement rendering
- `src/types/index.ts` — All TypeScript interfaces
- `src/store/assessmentStore.ts` — Zustand state + localStorage
- `src/utils/estimateEngine.ts` — Auto-generate line items

**Architecture**
- `src/pages/kitchen/` — Kitchen measurements, questions, photos
- `src/pages/bathroom/` — Bathroom measurements, questions, photos
- `src/components/WallSection.tsx` — Reusable wall section (Windows, Doors, Appliances, Outlets, Soffit, Sink, Cabinets)
- `src/components/CollapseSection.tsx` — Accordion component with defaultOpen prop
- `src/components/PhotosTab.tsx` — Unified photo interface for all job types

**Build & Deploy**
```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build locally
```

**Live Site**
https://eddieyak0816.github.io/maximus-estimus/

---

## Common Patterns

### Adding a New Measurement Section
1. Create state: `const [myOpen, setMyOpen] = useState(!startClosed);`
2. Wrap in CollapseSection: `<CollapseSection defaultOpen={!startClosed}>`
3. Pass startClosed to any child components
4. Example: Island, Soffit, Sink, Cabinets in WallSection

### Persisting Data to Supabase
1. Update Zustand action in `assessmentStore.ts`
2. Action calls `supabaseSync.push()` in background
3. Data auto-syncs to Supabase when online
4. Works offline — changes persist to localStorage, sync later

### Testing on Mobile
1. Run `npm run dev`
2. Find your machine's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Visit `http://[YOUR_IP]:5173` from phone on same WiFi
4. Test with Chrome DevTools Device Mode for quick iteration

---

## Questions?

- **For Eddie:** eddie0816@gmail.com
- **Spec:** Read `project-spcs.md` for complete feature descriptions
- **Memory:** Check `memory/MEMORY.md` for recent session notes
- **Build issues:** Usually node_modules or npm cache. Try: `npm cache clean --force` then `npm install`
