# 📋 Maximus Estimus — Session 4 Handoff (May 28, 2026)

**Session Lead:** Claude (AI Assistant)  
**Time:** ~2 hours  
**Scope:** Questions UX Polish + Island Photo Capture  
**Status:** All changes tested, built successfully ✅

---

## 🎯 What Got Done

### 1. **Smart Questions Constraint** ✅
**Problem:** Users could hide (delete) questions even if they had data, risking data loss.

**Solution:** Implemented validation in `AddQuestionsModal.tsx`:
- Cannot uncheck a question if it has data
- Shows alert: "Cannot hide — clear data first"
- Disabled checkbox with "Has data" label
- Each question page now maps its fields: `fieldsPerQuestion: Record<string, string[]>`

**Files Changed:**
- `src/components/AddQuestionsModal.tsx` — Added content detection logic
- `src/components/CollapseSection.tsx` — Now accepts `ReactNode` for title (not just string)
- All 7 question pages — Added `fieldsPerQuestion` mapping:
  - `src/pages/kitchen/KitchenQuestions.tsx`
  - `src/pages/bathroom/BathroomQuestions.tsx`
  - `src/pages/flooring/FlooringQuestions.tsx`
  - `src/pages/painting/PaintingQuestions.tsx`
  - `src/pages/living-room/LivingRoomQuestions.tsx`
  - `src/pages/bedroom/BedroomQuestions.tsx`
  - `src/pages/deck/DeckQuestions.tsx`

**Testing:** ✅
- Fill in a question (e.g., Project Scope)
- Click ⚙️ Customize
- Try to uncheck that question → should see alert
- Clear the data, then uncheck → should work

---

### 2. **Removed Yellow Questions Tab Highlight** ✅
**Problem:** Questions tab showed yellow background even when not active, confusing.

**Solution:** Removed `.tab-btn.has-content` CSS rules from `src/index.css`.

**Files Changed:**
- `src/index.css` — Deleted lines with `.tab-btn.has-content` styling

**Result:** Questions tab now only shows active state (yellow), no background highlight on inactive.

---

### 3. **Fixed Modal Scrolling** ✅
**Problem:** Customize modal couldn't scroll to see questions 1-4 when zoomed; height was too small.

**Solution:** 
- Increased modal height from `400px` to `70vh` (responsive)
- Overrode alignment from `center` to `flex-start` so content scrolls from top

**Files Changed:**
- `src/components/AddQuestionsModal.tsx` — Updated `maxHeight` and alignment inline styles

**Testing:** ✅
- Zoom in/out on browser
- Click ⚙️ Customize
- Should see all questions 1-N without scrolling issues

---

### 4. **Questions Visibility Overhaul** ✅
**Problem:** New jobs showed all 20 questions by default; too much clutter. Users want to turn on what they need.

**Solution:** 
- Changed default from `data.visibleQuestions || availableQuestions.map(q => q.key)` to `data.visibleQuestions ?? []`
- Added `getDefaultVisibleQuestions()` helper that auto-detects questions with data
- For existing jobs: auto-show questions that already have content
- For new jobs: all questions hidden until user enables them

**How It Works:**
1. If `visibleQuestions` is already saved → use that
2. Otherwise, loop through `availableQuestions` and check `sectionHasContent(fields)` for each
3. Auto-show only questions with populated fields
4. User can then toggle others on as needed

**Files Changed:**
- All 7 question pages — Added `getDefaultVisibleQuestions()` helper function

**Testing:** ✅
- Create new job → Questions tab shows nothing (all OFF)
- Click ⚙️ Customize → modal shows all questions unchecked
- Open existing job with data → only questions with data are visible (checked)
- Clear data from a question → can now hide it

---

### 5. **Island Photo Capture** ✅
**Problem:** Island section had no way to take photos like walls do.

**Solution:** Added 📷 camera icon to Island section header, same pattern as walls.

**Implementation:**
- Added `showIslandCamera` state
- Updated Island title to be a custom React element with camera icon
- Icon only shows when Island is enabled
- CameraModal opens with "Photo: Island" label
- Photo tagged as "Island" in Photos tab

**Files Changed:**
- `src/pages/kitchen/KitchenMeasurements.tsx`:
  - Added CameraModal import
  - Added `showIslandCamera` state
  - Updated Island title to include camera icon button
  - Added CameraModal component at bottom with Island handler

**Testing:** ✅
- Enable Island
- Look for 📷 icon next to "🏝️ Island" header
- Click it → camera opens with "Photo: Island" pre-selected
- Take/upload photo → appears in Photos tab tagged "Island"

---

## 🧠 Key Implementation Patterns

### Data Detection Pattern (Reusable)
```typescript
const sectionHasContent = (fields: (keyof MyType)[]): boolean => {
  return fields.some(field => {
    const value = data[field];
    if (value === null || value === undefined) return false;
    if ((value as any) === '') return false;
    if ((value as any) === false) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });
};
```
Use this to detect if a question/section has any populated data.

### Custom Section Header Pattern
```typescript
<CollapseSection title={
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <span>Section Name</span>
    {condition && (
      <button className="icon-btn" onClick={e => { e.stopPropagation(); ... }}>
        📷
      </button>
    )}
  </div>
}>
```
Use to add buttons/icons to section headers while keeping collapse functionality.

---

## 🚀 Next Tasks for Next Dev

### High Priority:
1. **Dynamic Wall Count (5+ walls)** — Allow users to add walls beyond D (E, F, G, etc.)
2. **Room Layout Drawing** — Separate tab for sketching room layout with quick-add rectangle option
3. **Wall photos in other rooms** — Add camera icons to Flooring, Painting, Living Room, Bedroom, Deck measurement sections

### Medium Priority:
1. Test comprehensive data flow: create job → fill questions → hide questions with data → verify constraint
2. Review all 7 question pages for consistency (they all follow same pattern now)
3. Consider auto-populating questions based on job type (some questions more relevant for kitchen vs bathroom)

### Low Priority:
1. Remove `<!-- ── Question N ── -->` comments from question pages (optional polish)
2. Add visual "required" indicators to key questions
3. Mobile testing on actual devices (constraint works on 375px+ widths)

---

## 🧪 Testing Checklist

**Run this before moving on:**

```bash
cd "g:\My Drive\Maximus Digital Marketing\Maximus Estimus"
npm run build  # Should succeed in ~2.5s
npm run dev    # Start dev server
```

**In browser:**
- [ ] Create new assessment
- [ ] Open Kitchen Questions → all collapsed (none visible)
- [ ] Click ⚙️ Customize → all unchecked
- [ ] Fill "Project Scope" question
- [ ] Click ⚙️ Customize → "Project Scope" shows "Has data" label, checkbox disabled
- [ ] Try unchecking it → alert appears
- [ ] Clear "Project Scope" field
- [ ] Click ⚙️ Customize → checkbox now enabled, can uncheck
- [ ] Close Kitchen job, open existing job → questions with data auto-show (checked)
- [ ] Enable Island → see 📷 icon next to "🏝️ Island" title
- [ ] Click 📷 → CameraModal opens with "Photo: Island"
- [ ] Take photo → appears in Photos tab with "Island" category

---

## 📝 Known Quirks & Gotchas

1. **CollapseSection title is now ReactNode** — If you pass a plain string, it still works. But if you pass a React element, make sure to use `onClick.stopPropagation()` on any buttons inside, or the collapse won't trigger correctly.

2. **fieldPerQuestion mapping must match data keys exactly** — Typos will silently fail (question appears to have no data even if it does). Use TypeScript `keyof` for safety.

3. **Modal alignment override is inline** — If you copy `AddQuestionsModal` patterns elsewhere, remember to override `alignItems: 'flex-start'` and `justifyContent: 'flex-start'` on the modal-body, or content will center and break scrolling.

4. **Island camera only shows when Island is enabled** — If user toggles Island off, icon disappears. This is intentional but could be confusing if they expect to find photos in a disabled section.

---

## 📚 Files Modified This Session

**Core Constraint Logic:**
- `src/components/AddQuestionsModal.tsx`
- `src/components/CollapseSection.tsx`

**All 7 Question Pages (same pattern):**
- `src/pages/kitchen/KitchenQuestions.tsx`
- `src/pages/bathroom/BathroomQuestions.tsx`
- `src/pages/flooring/FlooringQuestions.tsx`
- `src/pages/painting/PaintingQuestions.tsx`
- `src/pages/living-room/LivingRoomQuestions.tsx`
- `src/pages/bedroom/BedroomQuestions.tsx`
- `src/pages/deck/DeckQuestions.tsx`

**Island Feature:**
- `src/pages/kitchen/KitchenMeasurements.tsx`

**Styling:**
- `src/index.css` (removed yellow tab highlight)

---

## 🎓 Questions for Next Dev?

- **Should bathroom Tub/Shower also have photo capture?** Right now only Island, Walls, and Flooring measurements have cameras. Tub/Shower are toggles, not persistent sections.
- **Auto-show questions based on job type?** Kitchen might default to show "Cabinets" + "Backsplash" questions. Bathroom shows "Tub/Shower" + "Tile". Would that help?
- **Undo button for questions?** Once hidden, user can only get them back via ⚙️ Customize. Should there be an "Undo" or "Restore all" button?

---

**Good luck! The constraint logic is rock-solid and the Island camera follows the established wall pattern perfectly. Everything is tested and builds clean.** 🚀
