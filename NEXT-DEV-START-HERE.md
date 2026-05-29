# 🚀 Start Here — Next Developer Onboarding

**Last Session:** May 28, 2026 (Session 4)  
**Status:** All changes deployed, tests passing, docs updated ✅

---

## ⚡ 5-Minute Quick Start

1. **Read these first** (in order):
   - This file (you are here)
   - `CLAUDE.md` — Full project spec (scroll to Session 4 updates, ~line 260+)
   - `HANDOFF-SESSION-4.md` — Detailed walkthrough of what changed this session

2. **Get the app running:**
   ```bash
   cd "g:\My Drive\Maximus Digital Marketing\Maximus Estimus"
   npm run dev
   ```

3. **Test the new features:**
   - Create a new job → Questions tab should show **nothing** (all OFF)
   - Fill in a question field
   - Click ⚙️ Customize → that question shows "Has data" label, checkbox disabled
   - Try to uncheck it → alert: "Cannot hide — clear data first"
   - Clear the data → now you can uncheck it ✅
   - Find Island section → see 📷 camera icon
   - Click it → camera opens with "Photo: Island" ✅

4. **Next task ideas** (see `CLAUDE.md` line ~290 for full list):
   - Add camera icons to other measurement sections (Bathroom Tub/Shower, Flooring, etc.)
   - Implement dynamic wall count (5+ walls)
   - Build room layout drawing feature

---

## 🎯 What Changed in Session 4

### 1. Smart Questions Constraint
**What:** Users can't hide questions that have data.  
**Why:** Prevents accidental data loss.  
**How:** `AddQuestionsModal` detects content and disables unchecking.

**Key Pattern:** Every question page has `fieldsPerQuestion` mapping:
```typescript
const fieldsPerQuestion: Record<string, string[]> = {
  scope: ['scope'],
  timeline: ['timeline', 'targetDate'],
  cabinets: ['cabinets'],
  // ... etc
};
```

### 2. Questions Visibility Overhaul
**What:** New jobs show all questions OFF by default.  
**Why:** Less clutter; users enable what they need.  
**Bonus:** Existing jobs auto-show questions that have data.

**Key Pattern:** `getDefaultVisibleQuestions()` function in each question page:
```typescript
const getDefaultVisibleQuestions = () => {
  if (data.visibleQuestions) return data.visibleQuestions;
  const withContent: string[] = [];
  availableQuestions.forEach(q => {
    const fields = (fieldsPerQuestion[q.key] || []) as (keyof QuestionsType)[];
    if (sectionHasContent(fields)) withContent.push(q.key);
  });
  return withContent;
};
```

### 3. Modal Scrolling Fixed
**What:** Customize modal can scroll even when zoomed.  
**Why:** Users couldn't see questions 1-4 at high zoom.  
**How:** `maxHeight: '70vh'` + `alignItems: 'flex-start'` instead of center.

### 4. Island Photo Capture
**What:** 📷 camera icon in Island section (like walls).  
**Why:** Consistency with wall photo flow.  
**How:** Same pattern as WallSection camera, but in KitchenMeasurements.

---

## 📂 Key Files to Know

**Question Logic (all follow same pattern):**
- `src/pages/kitchen/KitchenQuestions.tsx` ← study this as the reference
- `src/pages/bathroom/BathroomQuestions.tsx`
- `src/pages/flooring/FlooringQuestions.tsx`
- `src/pages/painting/PaintingQuestions.tsx`
- `src/pages/living-room/LivingRoomQuestions.tsx`
- `src/pages/bedroom/BedroomQuestions.tsx`
- `src/pages/deck/DeckQuestions.tsx`

**Constraint/Modal:**
- `src/components/AddQuestionsModal.tsx` ← where the data detection happens
- `src/components/CollapseSection.tsx` ← now accepts `ReactNode` for title

**Island Feature:**
- `src/pages/kitchen/KitchenMeasurements.tsx` ← camera icon + modal

**Types:**
- `src/types/index.ts` ← KitchenQuestions, BathroomQuestions, etc. interfaces

---

## 🧠 Core Concepts

### How Questions Work Now

```
User creates new Kitchen job
  ↓
Questions tab shows nothing (all OFF)
  ↓
User clicks ⚙️ Customize
  ↓
Modal shows all questions, all unchecked
  ↓
User checks "Project Scope" and fills it
  ↓
User clicks ⚙️ Customize again
  ↓
Modal shows "Project Scope" with "Has data" label, checkbox disabled
  ↓
If user tries to uncheck it → alert "Cannot hide — clear data first"
  ↓
User clears the "Project Scope" field
  ↓
User clicks ⚙️ Customize
  ↓
Now the checkbox is enabled, user can uncheck it
```

### How Auto-Detection Works (for existing jobs)

```
User opens existing job with Kitchen data already filled in
  ↓
KitchenQuestions component mounts
  ↓
getDefaultVisibleQuestions() runs:
  - Check if data.visibleQuestions is set → yes? use it
  - No? loop through availableQuestions
  - For each question, check sectionHasContent(fieldsPerQuestion[q.key])
  - If any fields have data → add question to withContent array
  ↓
visibleQuestions = withContent
  ↓
Questions tab shows only the ones with data, others are hidden
```

---

## 🔍 How to Add the Same Pattern Elsewhere

**Example: Add photo camera to Bathroom Tub/Shower section**

1. In `BathroomMeasurements.tsx`, add state:
   ```typescript
   const [showTubCamera, setShowTubCamera] = useState(false);
   ```

2. Update the Tub/Shower section title:
   ```typescript
   <CollapseSection title={
     <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
       <span>Tub & Shower</span>
       {data.hasTub && onWallPhotoCapture && (
         <button className="icon-btn" onClick={e => { e.stopPropagation(); setShowTubCamera(true); }}>
           📷
         </button>
       )}
     </div>
   }>
   ```

3. Add the modal at the bottom:
   ```typescript
   {showTubCamera && onWallPhotoCapture && (
     <CameraModal
       label="Photo: Tub/Shower"
       onCapture={(blob) => {
         onWallPhotoCapture('Tub/Shower', blob).then(() => setShowTubCamera(false)).catch(err => {
           console.error('Failed to capture tub photo:', err);
         });
       }}
       onClose={() => setShowTubCamera(false)}
     />
   )}
   ```

Done! That's the pattern.

---

## ✅ Pre-Start Checklist

- [ ] Read CLAUDE.md (lines 1-100)
- [ ] Read HANDOFF-SESSION-4.md (full walkthrough)
- [ ] Run `npm run build` → should pass
- [ ] Run `npm run dev` → app should load
- [ ] Test new features in browser (see "5-Minute Quick Start" #3)
- [ ] Open CLAUDE.md and scroll to "Next Up" section for feature ideas

---

## 🆘 If Something Breaks

**Modal not scrolling?**
- Check `AddQuestionsModal.tsx` line ~62
- Ensure `maxHeight: '70vh'` and `alignItems: 'flex-start'`

**Questions not auto-showing for existing jobs?**
- Check that `getDefaultVisibleQuestions()` is in the question page
- Verify `fieldsPerQuestion` mapping matches all question keys
- Test: does `sectionHasContent()` work? (Try logging in browser)

**Island camera not appearing?**
- Is Island enabled? Icon only shows when `hasIsland === true`
- Check `onWallPhotoCapture` prop is passed from parent
- Verify `showIslandCamera` state is wired to CameraModal

**Build failing?**
- `npm run build` output should show which file/line
- Usually a TypeScript type error in question pages
- Check that `fieldsPerQuestion[q.key]` is cast as `(keyof QuestionType)[]`

---

## 📚 Reading Order

**Must read:**
1. This file (quick orientation)
2. CLAUDE.md (full context)
3. HANDOFF-SESSION-4.md (detailed walkthrough)

**Should read:**
4. src/components/AddQuestionsModal.tsx (constraint logic)
5. src/pages/kitchen/KitchenQuestions.tsx (reference for pattern)
6. src/components/CollapseSection.tsx (title handling)

**Good to skim:**
7. CLAUDE.md "Key Files & Their Purposes" section
8. src/types/index.ts (KitchenQuestions interface)

---

## 🎓 Questions?

**What files did I change?**  
→ See HANDOFF-SESSION-4.md "Files Modified This Session"

**How do I test the constraint?**  
→ See HANDOFF-SESSION-4.md "Testing Checklist"

**What's the next feature to build?**  
→ See CLAUDE.md "Next Up" section (around line 290)

**How does the auto-detection work?**  
→ See "Core Concepts" section above, or the `getDefaultVisibleQuestions()` function in any question page

---

**You've got this! All the patterns are established, the code is clean, and the docs are thorough. Pick a feature from the "Next Up" list and go build.** 🚀
