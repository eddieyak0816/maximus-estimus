# 🚀 Maximus Estimus — Next Developer Handoff (May 29, 2026)

> **Your mission:** Continue building the field measurement app for Maximus Construction NJ LLC. The foundation is solid — all core features work, cloud sync is live, and UX is polished. Your job is to implement the next wave of improvements.

---

## 📍 Where We Are

**Status:** Phase 1 ✅ + Phase 5 ✅ + UX Polish ✅  
**What's Live:** Kitchen/Bathroom/Flooring measurements, questions, photo capture, cloud sync, estimates, admin controls, mobile UI  
**What Just Shipped (May 29):** Dashboard filtering, better pill selection visibility, data indicators throughout, camera modal fix, wall length display  
**Tech Stack:** React 19 + TypeScript + Vite + Supabase + Zustand  

**Live App:** https://eddieyak0816.github.io/maximus-estimus/  
**Project Spec:** `project-spcs.md` (complete feature list)  
**Full Docs:** `CLAUDE.md` (everything about the app)

---

## 🎯 Your Next Tasks (Priority Order)

### 1. **Dynamic Wall Count (5+ Walls)** — PRIMARY NEXT FEATURE

**What it does:** Let users add more walls beyond the hardcoded A, B, C, D limit.

**Acceptance Criteria:**
- ✓ Users can click "➕ Add Wall" button below Wall D to create E, F, G, etc.
- ✓ Walls auto-name based on letter sequence (A→B→C→D→E→F...)
- ✓ Wall photos work with new walls (tags show wall names correctly)
- ✓ Estimates generate correctly for any wall count (loop through all walls)
- ✓ Data persists to Supabase

**Where to work:**
- `src/pages/kitchen/KitchenMeasurements.tsx` — Convert static wall map to dynamic array
- `src/pages/bathroom/BathroomMeasurements.tsx` — Same pattern
- `src/types/index.ts` — KitchenMeasurements.walls structure (currently fixed record, make dynamic)
- `src/store/assessmentStore.ts` — Add `addWall()` / `removeWall()` actions
- `src/utils/estimateEngine.ts` — Verify estimate generation loops over all walls

**Files to read first:**
- KitchenMeasurements.tsx (see how walls are currently mapped)
- WallSection.tsx (understand wall rendering)
- estimateEngine.ts (verify loop logic)

**Design pattern to follow:**
- Look at how Flooring handles multiple rooms — that's a good parallel (map over array, render components)
- Wall removal button should only show on dynamically-added walls (keep A, B, C, D as core)
- Add wall button only appears after last wall

**Why this matters:** Field teams measure houses with more than 4 walls. This is blocking real usage.

---

### 2. **Sprint 4: Admin Panel Enhancements**

Current state: Admin dashboard exists at `/admin` with basic user/dropdown management.

**Still needed:**
- Manage job types (add/remove Kitchen/Bathroom/Flooring/custom types)
- Manage team members (centralized admin list instead of dropdown entries)
- Consolidate price guide into admin (move from `/price-guide`)
- Manage markup settings (labor % + materials %) globally
- Cabinet gallery admin (add/remove/reorder images)

---

### 3. **Sprint 6: Export & Email**

- PDF export (full job report)
- Customer-facing PDF (clean layout, no cost breakdown)
- Internal PDF (cost breakdown, labor, margins — owner only)
- Email directly from app

---

## 🏗️ How to Work Here

### Testing
- **Always test in browser before marking done.** Type checking ≠ feature correctness.
- Build: `npm run build`
- Dev server: `npm run dev`

### Before You Start

1. Read `CLAUDE.md` (architecture & all features)
2. Read `project-spcs.md` (feature spec)
3. Run `npm run dev` and explore the app
4. Read WallSection.tsx (where dynamic walls will go)
5. Read estimateEngine.ts (you'll update this)

---

## 📞 Contact

**Questions?** Ask Eddie: eddie0816@gmail.com  
**Memory Notes?** Check `/memory/` directory

Good luck! 🚀
