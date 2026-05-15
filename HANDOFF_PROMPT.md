# 🚀 Maximus Estimus — AI Developer Handoff Prompt

**Date:** May 15, 2026 (Late Evening)  
**Status:** Phase 1 + Phase 5 Complete | All UX Polish Done | Ready for Room Templates  
**Next Task:** PRIORITY 1 — Room Templates (Living Room, Bedroom, Deck)

---

## ✅ What's Been Completed (This Session)

### Configurable Dropdowns System (COMPLETE)
- 8 dropdown categories managed in Supabase (`dropdown_lists` and `dropdown_options` tables)
- Admin panel at `/admin/dropdowns` for CRUD operations
- In-memory caching with 5-minute TTL
- Default categories seeded: appliance_names, flooring_materials, cabinet_finishes, wall_labels, team_members, room_names, transition_locations, special_notes_categories
- Reusable `DropdownSelect` component with custom value support ("Other / Custom" option)
- Alphabetical sorting (both admin entry and user display)

### UX Enhancements (COMPLETE)
- **Team Member field:** Now uses "team_members" dropdown (was manual input)
- **Wall labels:** Now use "wall_labels" dropdown (A, B, C, D default, or custom)
- **Checkbox vs Radio buttons:** Fixed — multi-select fields show checkboxes, single-select show radio buttons
- **Edit confirmations:** All edit fields (wall, room, part, transition) have explicit OK buttons (no blur-to-confirm)
- **Custom value auto-population:** When editing a custom value, the input field pre-populates with the previous value
- **Custom input in one click:** Users can type a custom value and click OK once to save (no double-click needed)

### Integrations Complete
- Kitchen appliances → DropdownSelect with custom support
- Flooring materials → DropdownSelect + custom material text input
- Transition locations → DropdownSelect with custom support
- Team member selection → DropdownSelect with custom support
- Wall labels → DropdownSelect with custom support

---

## 📋 Codebase State

### Key Files (No Changes Needed)
- `src/store/assessmentStore.ts` — Zustand state management (unchanged)
- `src/types/index.ts` — All type definitions (up-to-date with custom fields)
- `src/utils/dropdownManager.ts` — Dropdown utilities with caching
- `src/components/DropdownSelect.tsx` — Reusable dropdown component (forwardRef, useImperativeHandle)
- `src/pages/AdminDropdownsPage.tsx` — Admin CRUD UI
- `src/utils/supabaseSync.ts` — Cloud sync (unchanged)

### Database State
- Supabase tables created: `dropdown_lists`, `dropdown_options`
- RLS policies: Permissive (access control in frontend)
- Default data seeded for all 8 categories
- PIN-based auth working with admin flag

### Build Status
- ✅ TypeScript: No errors
- ✅ Vite build: 143 modules, ~656 KB minified
- ✅ All components render and function correctly

---

## 🎯 Next Task: Room Templates (PRIORITY 1)

### Goal
Add 3 flexible room templates for non-kitchen jobs (Living Room, Bedroom, Deck) with their own measurement forms, questions, and photo checklists.

### What Needs to Be Done

#### 1. Create Type Definitions (15 min)
**File:** `src/types/index.ts`

Add three new assessment types:
```typescript
export interface LivingRoomMeasurements {
  ceilingHeight?: string;
  windows?: WindowData[];
  doors?: DoorData[];
  outlets?: OutletData[];
  flooringNotes?: string;
  lightingNotes?: string;
}

export interface LivingRoomQuestions {
  scope?: string[];
  timeline?: string;
  targetDate?: string;
  lighting?: string[];
  flooring?: string[];
  referral?: string;
  referralName?: string;
  referralOther?: string;
  specialNoteItems?: string[];
  specialNotes?: string;
}

export interface LivingRoomPhotos {
  roomEntrance?: string;
  roomOverview?: string;
  ceiling?: string;
  flooring?: string;
  walls?: Record<string, string>;
  lighting?: string;
  problemAreas?: string;
  catchAll?: string;
  catchAllNotes?: string;
}

export interface LivingRoomAssessment {
  measurements: LivingRoomMeasurements;
  questions: LivingRoomQuestions;
  photos: LivingRoomPhotos;
}
```

Do the same for `BedroomAssessment` and `DeckAssessment`.

Add to `JobInstance` type:
```typescript
livingRoom?: LivingRoomAssessment;
bedroom?: BedroomAssessment;
deck?: DeckAssessment;
```

Update `JobType`:
```typescript
export type JobType = 'Kitchen' | 'Bathroom' | 'Flooring' | 'Living Room' | 'Bedroom' | 'Deck' | 'Other';
```

#### 2. Add Store Actions (10 min)
**File:** `src/store/assessmentStore.ts`

Add three new store actions (follow existing pattern for Kitchen/Bathroom/Flooring):
```typescript
updateJobLivingRoom: (assessmentId: string, jobId: string, livingRoom: LivingRoomAssessment) => void;
updateJobBedroom: (assessmentId: string, jobId: string, bedroom: BedroomAssessment) => void;
updateJobDeck: (assessmentId: string, jobId: string, deck: DeckAssessment) => void;
```

Add empty initializers to `emptyJobInstance()`:
```typescript
if (type === 'Living Room') return { ...base, livingRoom: emptyLivingRoom() };
if (type === 'Bedroom') return { ...base, bedroom: emptyBedroom() };
if (type === 'Deck') return { ...base, deck: emptyDeck() };
```

#### 3. Create Living Room Components (1.5 hours)
**Path:** `src/pages/living-room/`

Create 3 files following Kitchen/Bathroom/Flooring pattern:

**LivingRoomMeasurements.tsx**
- Label: "1 — Ceiling Height"
- Label: "2 — Windows" (add/remove with WindowCard)
- Label: "3 — Doors / Openings" (add/remove with DoorCard)
- Label: "4 — Outlets & Switches" (add/remove with OutletRow)
- Label: "5 — Flooring Notes" (textarea)
- Label: "6 — Lighting Notes" (textarea)

**LivingRoomQuestions.tsx**
- Section 1: Project Scope (checkboxes) — examples: "Full refurbish", "Lighting upgrade", "Flooring only", etc.
- Section 2: Timeline (radio buttons: Under 3 months, 3-6 months, etc. + target date option)
- Section 3: Lighting preferences (textarea)
- Section 4: Flooring preferences (dropdown or textarea)
- Section 5: Referral source (radio buttons: Referral, Google, Social, Repeat, Other)
- Section 6: Special Notes (chips + textarea)

**LivingRoomPhotos.tsx**
- Room Entrance
- Room Overview
- Ceiling condition
- Flooring condition
- Wall conditions (A, B, C, D if applicable, or free-text)
- Lighting setup
- Problem areas (if any)
- Catch-all photo + notes

#### 4. Create Bedroom Components (1.5 hours)
**Path:** `src/pages/bedroom/`

Same structure as LivingRoom, but with:
- Closet measurements (width, height, depth)
- Closet condition toggle
- Bedroom-specific scope options (closet build-out, flooring, wall treatment, etc.)
- Bedroom-specific photos (closets, ceiling, flooring, walls, problem areas, etc.)

#### 5. Create Deck Components (1.5 hours)
**Path:** `src/pages/deck/`

Same structure, but with:
- Deck dimensions (length, width, height above ground)
- Existing condition (good, fair, poor, needs demo)
- Railing requirements (yes/no, type if yes)
- Access constraints (basement stairs, side access, etc.)
- Deck-specific questions (expansion plans, materials, weather exposure, etc.)
- Deck-specific photos (overall, railings, stairs, existing condition, problem areas, etc.)

#### 6. Wire into Job Type Selector (30 min)
**File:** `src/pages/JobTypePage.tsx`

Add 3 new buttons to the job type selector:
- "Living Room"
- "Bedroom"
- "Deck"

Add corresponding case statements in routing to show the new templates.

#### 7. Wire into Assessment Detail Router (30 min)
**File:** `src/pages/AssessmentDetail.tsx`

Add imports for the 3 new components (Measurements, Questions, Photos for each).

Add case statements to render the right components when job type matches.

Add state update handlers:
```typescript
case 'Living Room':
  updateJobLivingRoom(assessmentId!, job.id, measurementsData);
```

#### 8. Update Summary View (1 hour)
**File:** `src/pages/SummaryView.tsx`

Add sections to display data for the 3 new room templates (following Kitchen/Bathroom/Flooring pattern).

Add edit links back to AssessmentDetail for each template.

#### 9. Test Integration (30 min)
- Create a new assessment
- Add a Living Room job
- Fill measurements, questions, photos
- Verify data saves in Zustand
- View in summary
- Create Bedroom and Deck jobs
- Test all three in one assessment

### Acceptance Criteria
- [x] User can select "Living Room", "Bedroom", or "Deck" as a job type
- [x] Each template shows its own measurement form, questions, and photo checklist
- [x] Data saves independently per room template (no cross-contamination)
- [x] Summary view displays all three template types correctly
- [x] Photos tied to room template work (camera integration)
- [x] TypeScript build passes
- [x] Manual testing shows golden path works

### Files to Create
```
src/pages/living-room/
  ├── LivingRoomMeasurements.tsx
  ├── LivingRoomQuestions.tsx
  └── LivingRoomPhotos.tsx

src/pages/bedroom/
  ├── BedroomMeasurements.tsx
  ├── BedroomQuestions.tsx
  └── BedroomPhotos.tsx

src/pages/deck/
  ├── DeckMeasurements.tsx
  ├── DeckQuestions.tsx
  └── DeckPhotos.tsx
```

### Files to Modify
- `src/types/index.ts` — Add 3 assessment types, update JobType and JobInstance
- `src/store/assessmentStore.ts` — Add 3 store actions, add empty initializers
- `src/pages/JobTypePage.tsx` — Add 3 buttons to selector
- `src/pages/AssessmentDetail.tsx` — Wire in new components and actions
- `src/pages/SummaryView.tsx` — Add sections for 3 new templates

---

## 📚 Reference Docs

Read these in order:
1. **CLAUDE.md** (this repo) — Full project context, stack, architecture
2. **project-spcs.md** (this repo) — Detailed spec of all features
3. **Memory files** (in `.claude/projects/.../memory/`):
   - `ux-enhancements-may15-late.md` — Just-completed work
   - `configurable-dropdowns-complete.md` — Dropdown system details
   - `admin-panel-and-auth-may14.md` — Auth & admin setup

---

## 🎮 How to Test Locally

```bash
# Start dev server
npm run dev

# Visit http://localhost:5173
# Create assessment → Add Living Room → Fill forms → View summary

# Build for production
npm run build
```

---

## 💡 Tips & Patterns

### Reuse These Components
- `MeasInput` — For measurement input (width, height, length, etc.)
- `Toggle` — For on/off toggles
- `CheckOpt` — For checkboxes (multi-select) and radio buttons (single-select)
- `ChevronIcon` — For expandable sections
- `DropdownSelect` — For admin-managed dropdowns
- `WindowCard`, `DoorCard`, `OutletRow` — From Kitchen for shared elements

### State Update Pattern
```typescript
updateJobLivingRoom: (assessmentId, jobId, livingRoom) => {
  set(s => {
    const next = s.assessments.map(a => {
      if (a.id !== assessmentId) return a;
      return { ...a, jobs: a.jobs.map(j => j.id === jobId ? { ...j, livingRoom } : j), updatedAt: new Date().toISOString() };
    });
    save(next, s.teamMembers, s.priceGuide, s.markupSettings);
    const updated = next.find(a => a.id === assessmentId);
    if (updated) pushAssessment(updated).catch(console.error);
    return { assessments: next };
  });
};
```

### Photo Pattern
```typescript
<CheckOpt
  label="Ceiling photo"
  selected={!!data.photos.ceiling}
  onToggle={() => {
    if (data.photos.ceiling) {
      deletePhoto(assessmentId, jobId, data.photos.ceiling).catch(console.error);
      u('photos', { ...data.photos, ceiling: '' });
    } else {
      setShowCamera({ field: 'ceiling', label: 'Ceiling' });
    }
  }}
/>
```

### Questions Section Pattern
```typescript
const SecHead = ({ title }: { title: string }) => <div className="q-sec-head">{title}</div>;

<SecHead title="1 — Project Scope" />
<p className="assess-hint">Select all that apply</p>
{['Option 1', 'Option 2'].map(opt =>
  <CheckOpt key={opt} label={opt} selected={isSel('scope', opt)} onToggle={() => toggle('scope', opt)} />
)}
```

---

## ⚠️ Common Gotchas

- **TypeScript:** Don't forget to import `type { ... }` for types only (verbatimModuleSyntax is strict)
- **Zustand:** Always use `set(s => {...})` pattern for state updates, call `save()` after updates
- **Photos:** Use `assessmentId` and `jobId` for IndexedDB keys, check for empty string before rendering
- **Push to Cloud:** Every update should call `pushAssessment()` async (no await needed)
- **Summary View:** All data is READ-ONLY; edit buttons link back to AssessmentDetail
- **CSS:** Use CSS variables for colors (`var(--primary)`, `var(--accent)`, `var(--text-primary)`)

---

## ✅ Pre-Flight Checklist

Before declaring Room Templates done:
- [ ] TypeScript build passes (no errors)
- [ ] Create new assessment
- [ ] Add Living Room job
- [ ] Fill all Measurements fields
- [ ] Answer all Questions
- [ ] Capture photos (at least one)
- [ ] Save and reload page → data persists
- [ ] View Summary → Living Room data displays correctly
- [ ] Click "Edit" link → back to measurement form
- [ ] Create Bedroom and Deck jobs
- [ ] Verify all three can exist in one assessment
- [ ] Summary shows all three with no cross-contamination
- [ ] Delete one job → others remain intact

---

## 📞 Questions?

Refer to:
- **Code patterns:** Look at Kitchen, Bathroom, or Flooring implementations (they're the reference)
- **Type definitions:** Check `src/types/index.ts` for the full schema
- **Store actions:** Check `src/store/assessmentStore.ts` for the pattern
- **Component props:** Check `src/pages/kitchen/KitchenMeasurements.tsx` for structure

Good luck! This is a straightforward feature — just follow the Kitchen/Bathroom/Flooring pattern and you'll be done in ~6 hours of focused work.

**Next task after this:** Role-Based Job Visibility (allow filtering by creator for non-admin users).
