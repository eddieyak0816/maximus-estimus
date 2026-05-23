# 🚀 Maximus Estimus — AI Developer Handoff Prompt

**Date:** May 17, 2026 (Morning)  
**Status:** Phase 1 + Phase 5 Complete | Mobile UI Done | Windows Per-Basis Complete | Role-Based Visibility Complete | Duplicate Bug Fixed ✅  
**Status Note (May 22, 2026):** This handoff is historical. Room Templates are complete. Current next work is role-based job visibility, sync hardening, and production polish. Wall length quick-add pieces are also complete for Kitchen/Bathroom walls.

**Original Next Task:** PRIORITY 1 — Room Templates (Living Room, Bedroom, Deck)

---

## ✅ What's Been Completed (This Session — May 17)

### Mobile-Friendly UI Redesign (COMPLETE)
- Added hamburger menu (≡ icon) for mobile navigation (hidden on desktop >768px)
- Hamburger toggles slide-down nav panel with all links, + New button, Sign Out
- Menu auto-closes on route change and when backdrop is tapped
- All touch targets increased to 44px minimum (iOS/Android accessibility standard):
  - Inputs: 44px min-height with 11px padding
  - Buttons: .btn-sm, .remove-btn, .icon-btn all 40-44px
  - Pills: 40px min-height
  - Toggle rows: 52px min-height
  - CheckOpts: 48px min-height with 20×20px checkbox
- Layout improvements for 480px screens:
  - Page padding reduced: 32px 24px → 20px 14px
  - Assessment cards wrap right side to full-width on narrow screens
  - Footer buttons stack vertically on mobile
  - Outlet rows flex-column on mobile
  - Header reduced from 68px to 60px on mobile
- Tested on iPhone SE (375×667) — hamburger menu, form inputs, photo capture all work

### Windows Feature Moved to Per-Basis (COMPLETE)
- Removed global "Windows being replaced?" toggle from Kitchen Questions and Bathroom Questions
- Windows now toggle individually in wall measurements:
  - Each wall can have a "Windows" button to expand a section
  - User adds individual windows with toggle "Are windows being replaced?" per window
  - Windows show in summary with total count
- Sections renumbered after removal (KitchenQuestions, BathroomQuestions)
- SummaryView updated to display window count from measurements, not questions

### Role-Based Job Visibility (COMPLETE)
- Dashboard now filters assessments based on user role:
  - Admins see "All Assessments" (all jobs across team)
  - Regular users see "My Assessments" (only their own, filtered by creatorId)
- Title updates dynamically: "All Assessments" or "My Assessments"
- Creator display shows who created each job (for admin view)
- Visible in AssessmentDetail → AssessmentCard → filtered in Dashboard.tsx

### Duplicate Assessment Bug Fixed (COMPLETE)
- **Root cause:** Creating assessment via NewRedirect creates blank entry; user fills in client info but blank copy persists if user navigates away
- **Fix:** Added useEffect cleanup in CustomerInfoPage.tsx that deletes incomplete assessments
  - Tracks `hasClientName` state (set to true when firstName or lastName filled)
  - On unmount, if hasClientName is false and assessment has no name, deletes it via store
- **Result:** No more duplicate blank assessments left behind

### Enterprise Standards Enforcement (NEW)
- Created memory file documenting: **Only suggest enterprise-acceptable solutions, never workarounds**
  - Example: Don't hide blank assessments → prevent them from being created
  - Example: Don't filter out bad data → fix data at the source
- Applied to: Duplicate assessment bug (chose proper cleanup over filter-and-hide)

---

## 📋 Codebase State

### Files Modified in This Session
| File | Change |
|------|--------|
| `src/components/Layout.tsx` | Added hamburger menu (useState, useEffect, mobile nav panel) |
| `src/index.css` | Added @media queries for 768px and 480px breakpoints; touch target fixes; nav styling |
| `src/pages/kitchen/KitchenQuestions.tsx` | Removed "Windows being replaced?" toggle; renumbered sections |
| `src/pages/bathroom/BathroomQuestions.tsx` | Removed "Windows being replaced?" toggle; renumbered sections |
| `src/pages/kitchen/WallSection.tsx` | Added per-window "Are windows being replaced?" toggle |
| `src/pages/bathroom/BathroomMeasurements.tsx` | Added per-window "Are windows being replaced?" toggle |
| `src/pages/CustomerInfoPage.tsx` | Added hasClientName state + cleanup useEffect to delete incomplete assessments |
| `src/pages/Dashboard.tsx` | Added role-based filtering (admins see all, users see only their own) |
| `src/pages/SummaryView.tsx` | Removed q.windowsReplacing display from Kitchen/Bathroom questions sections |
| `src/pages/AssessmentDetail.tsx` | Reduced footer spacing (marginTop: 24 → 12); changed "Mark Complete" from btn-ghost to btn-outline |
| `src/types/index.ts` | Removed windowsReplacing?: boolean from KitchenQuestions and BathroomQuestions |

### Build Status
- ✅ TypeScript: No errors
- ✅ Vite build: 143 modules, ~656 KB minified (warning about chunk size is non-critical)
- ✅ All components compile and function correctly
- ✅ Mobile testing passed: hamburger menu, touch targets, responsive layouts

### Key Unchanged Files (Reference for Patterns)
- `src/store/assessmentStore.ts` — Zustand state + localStorage + Supabase sync
- `src/contexts/AuthContext.tsx` — PIN-based auth with isAdmin flag
- `src/types/index.ts` — Type definitions (updated with window changes)
- `src/utils/supabaseSync.ts` — Cloud sync

---

## 🎯 Historical Task: Room Templates (Complete)

### Goal
Add 3 flexible room templates for non-kitchen jobs (Living Room, Bedroom, Deck) with their own measurement forms, questions, and photo checklists.

### Quick Start
1. Read **CLAUDE.md** (full project context)
2. Read **project-spcs.md** (detailed feature spec)
3. Look at `src/pages/kitchen/` folder as the reference implementation
4. Follow the same pattern for Living Room, Bedroom, Deck
5. Run `npm run dev` and test locally before pushing

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
- `src/types/index.ts` — Add LivingRoomAssessment, BedroomAssessment, DeckAssessment types
- `src/store/assessmentStore.ts` — Add updateJobLivingRoom, updateJobBedroom, updateJobDeck actions
- `src/pages/JobTypePage.tsx` — Add 3 job type buttons
- `src/pages/AssessmentDetail.tsx` — Wire in new components
- `src/pages/SummaryView.tsx` — Add sections for 3 new templates

### Acceptance Criteria
- [ ] TypeScript build passes
- [ ] User can select Living Room, Bedroom, Deck as job types
- [ ] Each template has measurements, questions, photos forms
- [ ] Data saves independently (no cross-contamination)
- [ ] Summary view displays all three templates correctly
- [ ] Manual testing: Create assessment → add all 3 jobs → view summary
- [ ] Photos work (camera integration)

---

## 💡 Important Notes

### Enterprise Standards Rule
**Only suggest solutions that meet enterprise standards. No bandaids or workarounds.**
- Bad data in the database is never acceptable, even if hidden from UI
- Always prevent bad data at the source, don't filter/hide it in the UI
- Example: Don't hide blank assessments → implement cleanup on form unmount instead

### Mobile-First Development
- Always test on DevTools Device Mode (iPhone SE 375×667)
- Verify all touch targets are ≥44px
- Test hamburger menu opens/closes smoothly
- Test form inputs are easily tappable

### Testing Checklist Before Submitting
1. `npm run build` — Verify TypeScript and Vite pass
2. `npm run dev` — Start local server
3. Chrome DevTools → Device Mode → iPhone SE
4. Create new assessment → verify hamburger menu and all inputs work
5. Fill one complete job (measurements, questions, photos)
6. Navigate away and back → verify data persists
7. View summary → verify all data shows correctly
8. Test on actual phone if available (not just DevTools)

---

## 🔗 Key Files & Patterns

### Zustand Store Pattern
```typescript
// Update action (used in all room templates)
updateJobLivingRoom: (assessmentId, jobId, livingRoom) => {
  set(s => {
    const next = s.assessments.map(a => {
      if (a.id !== assessmentId) return a;
      return {
        ...a,
        jobs: a.jobs.map(j =>
          j.id === jobId ? { ...j, livingRoom } : j
        ),
        updatedAt: new Date().toISOString(),
      };
    });
    save(next, s.teamMembers, s.priceGuide, s.markupSettings);
    const updated = next.find(a => a.id === assessmentId);
    if (updated) pushAssessment(updated).catch(console.error);
    return { assessments: next };
  });
};
```

### Measurements Form Pattern
```typescript
export default function LivingRoomMeasurements({ data, onUpdate }) {
  const u = (key: keyof typeof data, value: any) =>
    onUpdate({ ...data, [key]: value });

  return (
    <div className="form-section">
      <div className="section-card">
        <div className="section-card-header">1 — Ceiling Height</div>
        <div className="section-card-body">
          <MeasInput
            value={data.ceilingHeight || ''}
            onChange={v => u('ceilingHeight', v)}
            placeholder="12' 0\""
          />
        </div>
      </div>
      {/* More sections... */}
    </div>
  );
}
```

### Questions Section Pattern
```typescript
const SecHead = ({ title }: { title: string }) => (
  <div className="q-sec-head">{title}</div>
);

// In render:
<SecHead title="1 — Project Scope" />
<p className="assess-hint">Select all that apply</p>
{['Option 1', 'Option 2'].map(opt => (
  <CheckOpt
    key={opt}
    label={opt}
    selected={data.scope?.includes(opt) ?? false}
    onToggle={() => {
      const next = data.scope?.includes(opt)
        ? data.scope.filter(x => x !== opt)
        : [...(data.scope || []), opt];
      u('scope', next);
    }}
  />
))}
```

### Photo Checklist Pattern
```typescript
<CheckOpt
  label="Room overview"
  selected={!!data.photos.roomOverview}
  onToggle={() => {
    if (data.photos.roomOverview) {
      deletePhoto(assessmentId, jobId, data.photos.roomOverview).catch(
        console.error
      );
      u('photos', { ...data.photos, roomOverview: '' });
    } else {
      setShowCamera({ field: 'roomOverview', label: 'Room Overview' });
    }
  }}
/>
```

---

## 📚 Reference Docs (In Reading Order)
1. **CLAUDE.md** — Full project context, stack, all features
2. **project-spcs.md** — Detailed feature specification
3. **Kitchen reference:** `src/pages/kitchen/` (best working example)
4. **Memory docs:** `.claude/projects/.../memory/` for session context

---

## ⚠️ Common Gotchas

- **TypeScript:** Use `import type { X }` for types only (strict mode)
- **Zustand:** Always `set(s => {...})`, call `save()` after, call `pushAssessment()` async
- **Photos:** Use assessmentId + jobId as IndexedDB key, check for empty string before rendering
- **Summary:** All read-only; edit buttons link back to AssessmentDetail
- **CSS:** Use variables: `var(--primary)`, `var(--accent)`, `var(--text-primary)`
- **Mobile:** Always test on DevTools Device Mode, verify 44px touch targets

---

## ✅ Pre-Flight Checklist (For Each Session)

- [ ] Read CLAUDE.md and project-spcs.md
- [ ] `npm run build` passes
- [ ] `npm run dev` starts without errors
- [ ] Tested manually on Device Mode (iPhone SE 375×667)
- [ ] Verified hamburger menu works
- [ ] Verified all form inputs are tappable (44px+)
- [ ] Created test assessment, filled data, verified persistence
- [ ] Viewed summary, verified data displays correctly
- [ ] No console errors (warnings OK)

---

**Good luck! You've got this. 🚀**
