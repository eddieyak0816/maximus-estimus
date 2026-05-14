# Contributing to Maximus Estimus

Welcome! This guide helps you collaborate effectively on the Maximus Estimus project.

---

## Before You Start

1. **Read CLAUDE.md** — This is the master project guide. It covers everything from setup to architecture to communication preferences.
2. **Understand the current sprint** — Check which features are being worked on and what's coming next.
3. **Ask if unclear** — Better to clarify than to build the wrong thing. Reach out to Eddie (eddie0816@gmail.com) if you're unsure about scope or approach.

---

## Setting Up Your Environment

```bash
# 1. Clone the repo
git clone https://github.com/eddieyak0816/maximus-estimus.git
cd maximus-estimus

# 2. Install dependencies (Google Drive workaround)
cd C:\Users\Eddie\AppData\Local\Temp\maximus-estimus-setup
npm install
xcopy /E /I node_modules "g:\My Drive\Maximus Digital Marketing\Maximus Estimus\node_modules"

# 3. Start the dev server
cd "g:\My Drive\Maximus Digital Marketing\Maximus Estimus"
npm run dev

# 4. Open http://localhost:5173 in your browser
```

See **CLAUDE.md** for detailed setup instructions.

---

## Git Workflow

### Branch Naming
```
feature/room-templates         (new feature)
fix/photo-storage-bug          (bug fix)
refactor/estimate-engine       (code cleanup)
docs/update-readme             (documentation)
```

### Before Opening a Pull Request

1. **Create a feature branch** from `main`
2. **Make your changes** with clear, small commits
3. **Test in the browser** — Don't rely on linting alone
4. **Verify localStorage/IndexedDB** — Open DevTools to check persistence
5. **Push to your branch**
6. **Open a PR** with a clear description

### Commit Messages

Format: **[type]: [imperative description]**

Examples:
```
feat: Add living room template with measurements and questions
fix: Correct soffit override propagation on wall rename
refactor: Extract appliance form into reusable component
docs: Update CLAUDE.md with room template instructions
chore: Update .gitattributes for line ending normalization
```

**Guidelines:**
- Use imperative mood ("Add" not "Added")
- Capitalize the first letter after the colon
- Keep it under 70 characters
- Include context if helpful (e.g., "fix: Correct IndexedDB photo key format for multi-job assessments")

### Pull Request Template

When you open a PR, include:

```markdown
## Description
What does this PR do? (1-3 sentences)

## Changes
- [ ] Changed X
- [ ] Added Y
- [ ] Removed Z

## Testing
How did you test this? (manual steps, not just "tests pass")
- [ ] Tested on desktop browser
- [ ] Tested on mobile (DevTools Device Mode)
- [ ] Verified localStorage persists
- [ ] Verified photos save/display correctly (if applicable)

## Related
Links to issues, tasks, or relevant spec sections in `project-spcs.md`
```

---

## Code Style

### File Organization
- **Components:** `src/components/` (reusable, no business logic)
- **Pages:** `src/pages/` (route-specific, may contain business logic)
- **Store:** `src/store/assessmentStore.ts` (all Zustand state + actions)
- **Types:** `src/types/index.ts` (all TypeScript interfaces)
- **Utils:** `src/utils/` (calculations, storage, helpers)

### Naming Conventions
```typescript
// Components: PascalCase
export function KitchenMeasurements() { }

// Functions/variables: camelCase
const formatDate = (date: string) => { }
const assessmentId = useParams().id

// CSS classes: kebab-case
<div className="measurement-input">
<div className="wall-section-header">

// Store actions: camelCase
store.updateJobKitchen(assessmentId, jobId, data)
```

### Comments
**Don't add comments for obvious code.**

```typescript
// ❌ Bad: Explains what the code does
const status = 'draft'; // Set status to draft

// ✅ Good: Explains why
// Initialize as draft so field user can continue editing later
const status = 'draft';
```

**Only add a comment if the WHY is non-obvious:**
- Hidden constraint
- Subtle invariant
- Workaround for a specific bug
- Performance consideration

### Imports

```typescript
// 1. React and hooks at the top
import React, { useState, useEffect } from 'react';

// 2. External libraries
import { useParams } from 'react-router-dom';

// 3. Local components
import WallSection from '@/components/WallSection';

// 4. Local utils and types
import { formatDate } from '@/utils/calculations';
import { Assessment } from '@/types/index';

// 5. Styles
import './KitchenMeasurements.css';
```

### CSS

**Use CSS variables for colors:**
```css
/* ✅ Good */
color: var(--text-primary);
background: var(--accent);
border: 1px solid var(--border-color);

/* ❌ Avoid hardcoding colors */
color: #e8edf5;
```

**Mobile-first approach:**
```css
/* Mobile styles first */
.measurement-input {
  font-size: 15px;
  padding: 12px;
}

/* Desktop overrides in media query */
@media (min-width: 768px) {
  .measurement-input {
    font-size: 16px;
    padding: 16px;
  }
}
```

---

## Testing

### Manual Testing Checklist
Always test before declaring done:

- [ ] Feature works on desktop browser
- [ ] Feature works on mobile (DevTools Device Mode)
- [ ] Data persists after refresh (localStorage)
- [ ] Photos save/display if relevant (IndexedDB)
- [ ] Form validation works if applicable
- [ ] Error states handled gracefully
- [ ] No console errors (warnings OK)

### Browser DevTools

**Check localStorage:**
```
DevTools → Application → LocalStorage → maximus-estimus-v3
```

**Check IndexedDB (photos):**
```
DevTools → Application → IndexedDB → Expand and verify photo keys
```

### Test Checklist Tool
Open `test-checklist.html` directly in your browser for a comprehensive checklist with 44 test items, notes, and a report generator.

---

## Common Tasks

### Adding a New Room Template

1. Create folder: `src/pages/[room-name]/`
2. Create three files:
   - `[RoomName]Measurements.tsx`
   - `[RoomName]Questions.tsx`
   - `[RoomName]Photos.tsx`
3. Add type to `JobInstance` in `src/types/index.ts`
4. Add Zustand action: `updateJob[RoomName]` in `src/store/assessmentStore.ts`
5. Wire into `AssessmentDetail.tsx` (check `activeJob.type`)
6. Wire into `JobTypePage.tsx` (add option to job selector)
7. Add to `SummaryView.tsx` (display room data)

### Adding a New Price Category

1. Edit `src/utils/defaultPriceGuide.ts`
2. Or add via the UI: Navigate to `/price-guide`, click "Add Category"
3. Changes auto-save to localStorage

### Fixing a Bug

1. Create a branch: `git checkout -b fix/[bug-name]`
2. Reproduce the bug (take notes on what breaks)
3. Find the root cause (check Zustand store, component state, IndexedDB)
4. Fix it
5. Test manually (before + after)
6. Commit with clear message: `fix: [what was broken]`
7. Open a PR with reproduction steps and how you verified the fix

---

## Communication

### Questions?
Reach out to Eddie (eddie0816@gmail.com) with:
- What you're trying to do
- What's unclear
- What you've already checked

**Better to ask than to guess.** A 5-minute clarification saves 30 minutes of rework.

### When Something Breaks
Document:
- What broke
- What error message you see
- What you tried to fix it
- What you think might be causing it

### Async Updates
Use git commits and PR descriptions to communicate progress. Clear commit messages are gold for async handoffs.

---

## Code Review Checklist (For Reviewers)

- [ ] Code follows style guide (naming, formatting, imports)
- [ ] No hardcoded colors (uses CSS variables)
- [ ] Components are reusable (not tied to one specific use case)
- [ ] Zustand actions are the source of truth (not duplicate state in components)
- [ ] Types are defined in `src/types/index.ts` (not inline)
- [ ] localStorage persists correctly
- [ ] Photos (if relevant) save/display correctly
- [ ] Mobile-responsive (test in DevTools Device Mode)
- [ ] No console errors
- [ ] Commit messages are clear

---

## Deployment

**Phase 1 (Local Only):**
- No production deployment yet
- App runs locally with `npm run dev`
- Data stored in localStorage + IndexedDB

**Future (Sprint 5+):**
- Deployment strategy TBD with Eddie

---

## Resources

- **CLAUDE.md** — Master project guide (read this first!)
- **project-spcs.md** — Detailed spec of every feature
- **src/types/index.ts** — All TypeScript interfaces
- **src/store/assessmentStore.ts** — All state + actions
- **test-checklist.html** — 44 test items with report generator

---

**Thanks for contributing! 🚀**
