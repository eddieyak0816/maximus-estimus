# 🏛️ Maximus Estimus — Master Project Spec & Roadmap
> **Living Document** — Updated continuously as the project evolves.
> Last Updated: May 22, 2026 — Core field workflow, cloud sync, room templates, mobile camera/photo fixes, and wall length quick-add pieces complete; next: role-based visibility, PDF/export, and sync hardening

---

## 📌 Table of Contents
1. [App Overview](#app-overview)
2. [App Name & Branding](#app-name--branding)
3. [Target Users](#target-users)
4. [Platform](#platform)
5. [Tech Stack](#tech-stack)
6. [Current Build State](#current-build-state)
7. [Development Roadmap](#development-roadmap)
8. [Screen Flow](#screen-flow)
9. [Feature List — Phase 1](#feature-list--phase-1)
10. [Kitchen Assessment — Measurements](#kitchen-assessment--measurements)
11. [Kitchen Assessment — Questions](#kitchen-assessment--questions)
12. [Kitchen Assessment — Photo Checklist](#kitchen-assessment--photo-checklist)
13. [Bathroom Assessment](#bathroom-assessment)
14. [Flooring Assessment](#flooring-assessment)
15. [Other Job Types](#other-job-types)
16. [Customer Info](#customer-info)
17. [Cabinet Style Gallery](#cabinet-style-gallery)
18. [Price Guide](#price-guide)
19. [Estimating — Phase 1](#estimating--phase-1)
20. [Admin Panel](#admin-panel)
21. [Export & Email](#export--email)
22. [Team & Data Sharing](#team--data-sharing)
23. [Design Guidelines](#design-guidelines)
24. [Phase 2 — AI Project Planner & Estimator](#phase-2--ai-project-planner--estimator)
25. [Open Questions & Ideas](#open-questions--ideas)

---

## App Overview

**Maximus Estimus** is a field measurement and job intake app designed for kitchen designers and contractors. It guides team members step by step through a job site visit, ensuring that every measurement is taken, every question is asked, and every detail is captured — so that a detailed, accurate quote can be produced on the spot or back at the office.

### Core Purpose
- Guide field team through complete job site data collection
- Store customer info and job details
- Capture photos tied to specific items
- Reference cabinet styles, pricing, and products
- Generate estimates from collected data
- Export and email job reports

---

## App Name & Branding

- **App Name:** Maximus Estimus
- **Company:** Maximus Construction NJ LLC
- **Logo:** Maximus panda mascot with hard hat — navy blue + golden yellow
- **Primary Color:** Navy Blue `#1F3096`
- **Accent Color:** Golden Yellow `#F5C42A`
- **Theme:** Dark mode
- **Design Feel:** Clean, professional, logical, easy to navigate
- **User Base:** Non-tech-savvy contractors and designers

---

## Target Users

- Kitchen designers and contractors
- Small team of 3+ field members
- One lead reviewer (owner/manager) who reviews all jobs
- Users are not highly tech-savvy — UI must be extremely intuitive

---

## Platform

- Web ✅ *(built first)*
- iOS *(Phase 1 — via React Native or PWA)*
- Android *(Phase 1 — via React Native or PWA)*
> All three platforms must be supported from launch.

---

## Tech Stack

> Decisions locked. Do not change without discussion.

| Layer | Choice | Status |
|---|---|---|
| Framework | React 19 + TypeScript | ✅ In use |
| Build Tool | Vite | ✅ In use |
| Routing | React Router v7 | ✅ In use |
| State Management | Zustand | ✅ In use |
| Forms | React Hook Form + Zod | 🔲 Not yet wired up — forms are plain controlled components |
| Styling | Custom CSS (dark mode, brand tokens) | ✅ In use |
| Storage (Phase 1) | localStorage (single device) | ✅ In use |
| Storage (Phase 1B) | Supabase or Firebase — TBD | 🔲 Pending decision |
| Auth | Supabase Auth or Firebase Auth — TBD | 🔲 Pending decision |
| PDF Export | react-pdf or jsPDF — TBD | 🔲 Pending decision |
| Photo Storage | Device camera API + cloud storage — TBD | 🔲 Pending decision |
| Mobile | React Native or PWA — TBD | 🔲 Pending decision |

---

## Current Build State

> As of April 2026. This reflects what is actually working in the app today.

### ✅ Done — Sprint 1 Complete (see Sprint 1 section in roadmap)

- Vite + React 19 + TypeScript project scaffolded and running
- React Router v7 navigation with full URL-based routing
- Zustand store with localStorage persistence (storage key: `maximus-estimus-v3`)
- Dark mode UI with brand colors (navy `#1F3096` + gold `#F5C42A`)
- Maximus panda logo in header
- Dashboard with stat cards, assessment list, status dots, job type tags, and delete
- **Multi-job model:** Each assessment holds an array of `JobInstance` objects — supports multiple kitchens, bathrooms, or any combination, each with its own label and fully independent data
- Customer Info form: first/last name, address, phone, email, visit date, notes, team member
- **Team member roster:** Global list of team members stored separately in Zustand; Customer Info shows a dropdown with an "Other…" option and an inline manage panel to add/remove names
- Job Type Selection: pill-based type selector, custom labels, add multiple jobs, remove jobs
- Assessment Detail: job switcher tab row (only shown for multi-job assessments), tabbed Measure / Questions / Photos per active job
- Kitchen Measurements: ceiling height, soffit (global + per-wall override with shortcut "= Same as wall length"), walls A-D with length plus additive wall-length quick-add pieces, windows, doors, outlets, cabinet notes; appliances, plumbing, island, existing cabinets, desk — all with toggles and collapsible sections
- Kitchen Questions: all 19 questions implemented with multi-choice, dropdowns, date pickers, notes
- Kitchen Photos: conditional photo checklist (island/desk/cabinets sections gated by measurement toggles), progress bar
- Cabinet Style Gallery: 4 cabinet styles with color swatches and customer link input
- Status management: draft / in-progress / complete
- `test-checklist.html`: browser-based testing tool with 44 items, Pass/Fail/Skip, per-item notes, progress bar, and report generator

### ✅ Done — Sprint 2 Complete
- Bathroom assessment — measurements (room globals, walls A-D, tub, shower, vanity/sink, toilet, linen closet, extras), questions (12 questions), photos (conditional checklist)
- Flooring assessment — measurements (dynamic multi-room list, auto sq ft, irregular shape, grand total), questions (9 questions), photos (per-room + conditional stairs)
- "Other" job type — free-text notes tabs for measurements / questions / photos
- `AssessmentDetail` wired to check `activeJob.type` and render the correct form set (Kitchen / Bathroom / Flooring / Other)
- `BathroomAssessment`, `FlooringAssessment`, `OtherAssessment` types added to `src/types/index.ts`; `JobInstance` updated with optional `bathroom?`, `flooring?`, `other?` fields
- `emptyBathroom()`, `emptyFlooring()`, `emptyOther()` factories + `updateJobBathroom`, `updateJobFlooring`, `updateJobOther` store actions added
- CSS classes for flooring room cards, sq ft display, grand total card, Other job empty state

### ✅ Done — UX Polish (April 26, 2026)
- **WallSection — full-header click:** Clicking anywhere on a wall card header (not just the ▲▼ button) collapses or expands it. Same for Window and Door sub-cards.
- **WallSection — rename propagation:** Renaming a wall updates the name everywhere inside that wall — SOFFIT label (`SOFFIT — Stove Wall`), SINK/PLUMBING label (`SINK / PLUMBING — Stove Wall`), and ceiling override label.
- **WallSection — collapsible soffit:** Per-wall soffit override section is now a collapsible accordion with a ▲▼ header showing the wall name.
- **WallSection — collapsible sink:** After enabling "Sink / Plumbing on this wall?", a yellow collapsible `SINK / PLUMBING — [wall name]` header appears that hides/shows all plumbing fields.
- **WallSection — collapsible existing cabinets:** Existing Cabinets sub-section within each wall body now has a collapsible ▲▼ header.
- **WallSection — appliance accordions:** Appliances are now accordion cards — selecting a type expands dimensions and corner/distance fields; ▲▼ button collapses detail.
- **WallSection — wall length pieces:** Wall length now supports additive quick-entry pieces. Field users can type the next piece, press Enter/Add, see an inches-only combined total, auto-fill Wall Length from the total, and undo the last piece.
- **Kitchen Island — sub-section accordions:** Island content broken into 7 distinct collapsible sub-sections: Dimensions, Distance from Walls, Countertop Overhang, Sink, Cooktop, Outlets, Levels. Each uses `sub-card` styling (distinct background + border) so sections are visually separated.
- **Kitchen Island — feature collapse:** When a feature toggle (Sink, Cooktop, Outlets, Levels) is turned on, a yellow collapsible header appears to hide/show the detail fields.
- **Kitchen Island — "Existing or New?" at top:** Status pills moved to the top of island content (before Dimensions) so it's the first thing captured.
- **CollapseSection full-width header:** `width: 100%` added to `.collapse-header` so clicking anywhere on Room Globals / Walls / Island accordion row toggles it, not just the left portion.
- **Existing Cabinets restructure:** Cabinet tracking (upper/base/tall, with H+D dimensions) moved from a standalone accordion into each individual wall card. The top-level Existing Cabinets and Desk accordions in Kitchen Measurements have been removed entirely.
- **AI feature ideas:** Full brainstorm document saved to `docs/ai-features.md` covering field visit, data entry, estimating, client communication, and business intelligence use cases.

### ✅ Done — Sprint 3 Complete (April 27, 2026)
- **Price Guide data model:** `PriceGuideItem` (id, key, name, unit, laborCost, materialLow/Med/High), `PriceCategory`, `MarkupSettings`, `MaterialTier`, `EstimateLine`, `EstimateData` — all added to `src/types/index.ts`
- **Default price guide:** 7 categories seeded in `src/utils/defaultPriceGuide.ts` — Cabinets & Millwork, Countertops, Backsplash, Flooring, Plumbing, Appliances, Bathroom, Labor & Misc
- **Markup settings:** Labor % and Materials % stored globally in Zustand; editable on Price Guide page
- **Price Guide UI:** `/price-guide` — collapsible categories, inline editable items (name, unit, labor, material low/med/high), add/remove items & categories, reset to defaults; all changes auto-save
- **Estimate engine:** `src/utils/estimateEngine.ts` — auto-generates line items from Kitchen (upper/base/tall cabs, island, countertops, backsplash, crown molding, appliances, plumbing), Flooring (material, install, demo, underlayment, stair nosing), and Bathroom (demo, shower tile wall/floor, tub, vanity, toilet, heated floor) measurements
- **Estimate page:** `/assessment/:id/estimate` — generate/regenerate at low/med/high tier; customer-facing view (labor + material totals); internal cost view (actual cost, revenue, profit, margin %) behind privacy confirmation modal; per-line override modal (set custom labor/material totals or clear); add manual line items; remove line items; estimate lock/unlock; estimate notes field
- **Zustand store extended:** `priceGuide`, `markupSettings` stored in localStorage; `updatePriceGuide`, `resetPriceGuide`, `updateMarkupSettings`, `updateEstimate` actions added
- **Navigation:** Price Guide and Gallery links in header nav; quick-link buttons on Dashboard; "💰 View / Generate Estimate" button in AssessmentDetail footer
- **Routes added:** `/price-guide` → PriceGuidePage, `/assessment/:id/estimate` → EstimatePage

### ✅ Done — Summary/Report View Complete (May 3, 2026)
- **Summary page:** `/assessment/:id/summary` — read-only consolidated view of all collected job data (customer info, measurements, question answers, photo checklist status)
- **Customer info section:** Name, address, phone, email, visit date, team member, notes
- **Estimate hero:** Customer-facing total (labor + materials), tier, line count, locked status (only shown if estimate exists)
- **Per-job sections:** For each job in assessment (Kitchen/Bathroom/Flooring/Other):
  - **Measurements:** All captured data organized by section (walls with dimensions/cabinets, appliances, island for Kitchen; tub/shower/vanity/toilet/linen for Bathroom; rooms with auto-calculated sq ft for Flooring; free-text notes for Other)
  - **Questions:** All answered questions from the checklist (arrays displayed as comma-separated, booleans as Yes/No, empty fields hidden)
  - **Photos:** Conditional checklist with ✓/○ indicators showing taken vs missing photos; progress count badge (e.g., "12 / 18 captured")
- **Multi-job support:** If assessment has multiple jobs, each job shown with clear blue divider and job label
- **Edit links:** Each section has "Edit" button linking back to AssessmentDetail for quick gap-checking and fixes
- **Print-friendly:** Print CSS hides nav, buttons, breadcrumb; exports as clean PDF
- **New button:** "📋 View Summary" button in AssessmentDetail footer (flex: 1, between Mark Complete and View Estimate)
- **CSS:** New classes for job dividers, sub-headings, photo checklists, summary actions; reuses existing `.summary-row`, `.summary-label`, `.summary-value`, `.summary-total-hero` classes
- **Route:** `/assessment/:id/summary` added BEFORE `:tab` wildcard in App.tsx to prevent route matching issues

### ✅ Done — Real Photo Capture Complete (May 4, 2026)
- **Camera integration** — Uses `navigator.mediaDevices.getUserMedia()` with rear camera on mobile
- **IndexedDB storage** — Photos stored as Blob objects in IndexedDB (100MB+ capacity)
- **Photo capture flow** — Camera modal with preview before save, Keep/Retake buttons
- **Camera permissions** — Graceful error handling for permission denial
- **Photo display** — Thumbnails in photo checklists and Summary View
- **Photo deletion** — Delete button to remove captured photos from IndexedDB
- **Multi-job support** — Photos stored per job with full assessment/job ID tracking
- **Updated types** — Photo fields now store photoId string instead of boolean
- **Updated components** — KitchenPhotos, BathroomPhotos, FlooringPhotos all integrated
- **Updated Summary View** — Displays actual photo thumbnails instead of ✓/○ checkmarks
- **CSS additions** — Camera modal, thumbnail display, spinner animation

### ❌ Not Yet Built / Remaining Work (Priority Order for Field Workflow)
- Role-based job visibility — non-admin users should see only their own assessments; admins should see all
- Sync hardening — durable outbox/retry status for assessment and photo sync, conflict awareness, and visible sync health
- PDF export — Sprint 6
- Email from app — Sprint 6
- Admin Panel expansion — deeper management for job types, cabinet gallery, roles, and configuration
- Cleanup: `src/pages/forms/` are unused legacy files, safe to delete (ClientForm.tsx, RoomForm.tsx, CabinetForm.tsx, ApplianceForm.tsx, MaterialsForm.tsx, CostForm.tsx)

---

## Development Roadmap

> Sprints are ordered by dependency and business value. Each sprint should be fully complete before the next begins.

---

### ✅ Sprint 1 — Core Field Workflow *(Complete)*
> Goal: Make the app usable for a real kitchen site visit end-to-end.

- [x] Split customer name into First Name + Last Name
- [x] Add Date of Site Visit and Assigned Team Member to customer info
- [x] Global team member roster (dropdown + manage panel + "Other" fallback)
- [x] Build Job Type Selection screen (Kitchen / Bathroom / Flooring / Other)
- [x] Multi-job model: each assessment holds multiple JobInstance objects, each with independent label and data
- [x] Rebuild Kitchen Measurements as per full spec (per-wall, windows, doors, outlets, appliances, plumbing, island, existing cabinets, desk)
- [x] Soffit "same as wall length" shortcut button
- [x] Additive wall-length pieces with quick add, inches total, auto-fill wall length, and undo last
- [x] Build Kitchen Questions tab (all 19 questions)
- [x] Build Kitchen Photos tab (per-item checklist with conditional sections)
- [x] Assessment tab structure: Measurements · Questions · Photos
- [x] Job switcher in Assessment Detail for multi-job assessments
- [x] Cabinet Style Gallery (4 styles, color swatches, customer link input)

---

### ✅ Sprint 2 — Additional Job Types *(Complete)*
> Goal: Support bathroom and flooring jobs.

- [x] Bathroom Assessment — Measurements (tub, shower, vanity, toilet, linen closet, extras)
- [x] Bathroom Assessment — Questions
- [x] Bathroom Assessment — Photos
- [x] Flooring Assessment — Measurements (multi-room, auto sq ft total)
- [x] Flooring Assessment — Questions
- [x] Flooring Assessment — Photos
- [x] "Other" job type with free-text name and blank measurement/question/photo tabs

---

### ✅ UX Polish Round 1 — WallSection & Island *(Complete)*
> Goal: Make the measurement forms easier to navigate on a phone during a real site visit.

- [x] Wall card header — full row clickable (not just ▲▼ button)
- [x] Window and Door sub-cards — full header clickable
- [x] Wall rename propagates to SOFFIT, SINK/PLUMBING, and ceiling labels inside the wall
- [x] Soffit override section within each wall is collapsible
- [x] Sink/Plumbing section within each wall is collapsible after enabling
- [x] Existing Cabinets section within each wall is collapsible
- [x] Appliances converted to accordion cards (type dropdown always visible; dims/location collapse)
- [x] Kitchen Island broken into 7 collapsible sub-sections with card styling
- [x] Island feature toggles (Sink, Cooktop, Outlets, Levels) show collapsible yellow headers
- [x] Island "Existing or New?" moved to top of island content
- [x] CollapseSection headers (Room Globals, Walls, Island) made full-width clickable
- [x] AI features brainstorm doc saved to `docs/ai-features.md`

---

### ✅ Sprint 3 — Price Guide & Estimating *(Complete)*
> Goal: Auto-generate estimates from collected data.

- [x] Build Price Guide data model (per linear ft, per sq ft, per unit, flat rate, per hour)
- [x] Build Price Guide UI (editable by admin, organized by category)
- [x] Add material tiers (low / medium / high) per material type
- [x] Build estimate auto-generation engine (measurements × price guide)
- [x] Build customer-facing estimate view (clean, no internals)
- [x] Build internal cost view (owner only, privacy prompt, optional PIN)
- [x] Add markup settings to Admin Panel (labor % and materials % separately)
- [x] Allow manual override of any auto-generated line item
- [x] Estimate lock when user approves

---

### ✅ Core Field Workflow Phase 2 — Real Photo Capture *(Complete)*
> Goal: Make on-site photo capture functional.

- [x] **Real camera integration** — Replace boolean photo toggle with actual device camera API
  - [x] Camera permission handling (graceful errors)
  - [x] Photo preview before saving
  - [x] Store photo as Blob in IndexedDB (100MB+ capacity)
  - [x] Display captured photos in summary view (thumbnails instead of ✓/○)
  - [x] Delete capability for captured photos

### ✅ Core Field Workflow Phase 3 — Room Templates *(Complete)*
> Goal: Add flexibility for non-kitchen jobs.
> Templates expand job flexibility beyond Kitchen/Bathroom/Flooring.

- [x] **Room templates** — Pre-built measurement/question/photo checklists for common room types
  - [x] Living Room template (ceiling height, windows, doors, outlets, flooring, lighting notes)
  - [x] Bedroom template (ceiling height, closets, windows, doors, outlets, flooring)
  - [x] Deck/Outdoor template (dimensions, height, existing condition, railing, access notes)
  - [x] Wire templates into job type selection (same UX as Kitchen/Bathroom/Flooring)

---

### 🔲 Sprint 4 — Admin Panel & Cabinet Gallery Enhancement
> Goal: Give the owner full control over pricing, team, and cabinet reference library.
> **AFTER core field workflow (photo capture + templates) is solid.**

- [ ] Cabinet Style Gallery — image grid organized by style and color (enhance existing)
- [ ] Cabinet Gallery — full-screen image view on tap
- [ ] Cabinet Gallery — admin add/remove images
- [ ] Admin Panel — centralized dashboard for owner/manager
  - [ ] Manage job types and their checklists (currently hardcoded; should be editable)
  - [ ] Manage Price Guide (currently at `/price-guide`; move to admin)
  - [ ] Manage team members (currently in Customer Info form; centralize)
  - [ ] Manage markup settings (currently in price guide; move to admin)
  - [ ] Manage special notes checklist items (currently hardcoded; should be editable)

---

### 🔲 Sprint 5 — Backend & Team Sharing
> Goal: Move off localStorage so the whole team can share jobs on any device.

- [ ] Select and integrate backend (Supabase or Firebase — decision needed)
- [ ] User authentication (team member login)
- [ ] Role-based access: field user vs manager/owner
- [ ] All jobs stored in shared cloud database
- [ ] Each job records which team member conducted the assessment
- [ ] Owner can review any job from any device at any time
- [ ] Offline support with sync when back online *(important for job sites)*

---

### 🔲 Sprint 6 — Export & Email
> Goal: Produce a professional deliverable from every job.

- [ ] PDF export — full job report (customer info, measurements, answers, photos, estimate)
- [ ] Customer-facing PDF (clean, branded, no internals)
- [ ] Internal PDF (costs, margins — owner only)
- [ ] Email report directly from app
- [ ] Save/share to device

---

### 🔲 Sprint 7 — Mobile Apps
> Goal: Native iOS and Android experience.

- [ ] Decide: React Native (true native) vs PWA (web-based)
- [ ] iOS build
- [ ] Android build
- [ ] App Store submission
- [ ] Google Play submission
- [ ] Test camera integration on device

---

### 🔲 Phase 2 — AI Estimator
> Locked until Phase 1 is complete. See Phase 2 section below.

---

## Screen Flow

### 1. 🏠 Home Screen
- App logo and name
- List of all saved jobs (most recent first)
- **+ New Job** button
- **Cabinet Style Gallery** button
- **Price Guide** button
- **Admin Panel** button (owner access only)

---

### 2. 👤 New Job — Customer Info Screen
- First Name
- Last Name
- Address
- Phone Number
- Email Address
- General Notes
- **Next → Select Job Type(s)** button

---

### 3. 🔲 Job Type Selection Screen
- ☑️ Kitchen
- ☑️ Bathroom
- ☑️ Flooring
- ☑️ Other *(free text field to name the job type)*
- *(Check all that apply)*
- **Begin Field Assessment** button

---

### 4. 📐 Assessment Screens *(one per job type selected)*
Each job type has 3 tabs:

| Tab | Content |
|---|---|
| 📏 Measurements | Step-by-step guided measurement inputs |
| ❓ Questions | Checklist of questions to ask the customer |
| 📷 Photos | Item-by-item optional photo capture list |

---

### 5. 📊 Job Summary Screen
- Full recap of all entered data, measurements, answers, and photos
- **Generate Estimate** button *(Phase 1 basic, Phase 2 AI-powered)*
- **Export / Email Report** button
- **Back to Home** button

---

### 6. 🖼️ Cabinet Style Gallery
- Grid of cabinet door images organized by style and color
- Tappable images for full-screen view
- Ability to add and remove images (admin)
- Used during customer questions to show options on-site

---

### 7. 💰 Price Guide
- Organized list of all products and services with editable costs
- Accessible from home screen and during estimating
- Categories: Cabinets, Countertops, Backsplash, Flooring, Lighting, Plumbing, Appliances, Labor & Misc

---

### 8. ⚙️ Admin Panel
- Manage job types *(add, edit, remove)*
- Build custom measurement checklists per job type
- Build custom question checklists per job type
- Build custom photo checklists per job type
- Manage Cabinet Style Gallery
- Manage Price Guide
- Manage team members

---

## Feature List — Phase 1

### ✅ Core Features
- [ ] Step-by-step guided field assessment
- [ ] Customer info storage per job
- [ ] Multiple jobs stored and reviewable at any time
- [ ] Job type selection (Kitchen, Bathroom, Flooring, Other)
- [ ] Measurement input screens per job type
- [ ] Customer questions checklist per job type
- [ ] Photo capture tied to specific checklist items (optional per item)
- [ ] Cabinet Style Gallery (image storage and display)
- [ ] Price Guide (editable product/service costs)
- [ ] Basic estimate generation from measurements + price guide
- [ ] Export job data (PDF or similar)
- [ ] Email job report
- [ ] Team data sharing (all team members see all jobs)
- [ ] Admin panel for managing job types and checklists
- [ ] "Other" job type with free text naming

---

## Kitchen Assessment — Measurements

> ✅ FULLY DETAILED & APPROVED

### 🌐 Room Globals *(measured once for the whole room)*
- [ ] Overall ceiling height
- [ ] Soffit present? *(yes/no toggle)*
  - [ ] Overall soffit height
  - [ ] Overall soffit depth
  - [ ] Overall soffit width
  - [ ] Same on all walls? *(yes/no — if no, override per wall)*

---

### 📏 Per Wall — Repeated for Wall A, B, C, D

**Wall Measurement**
- [ ] Wall length

**Ceiling & Soffit Override** *(only if different from global)*
- [ ] Ceiling height override
- [ ] Soffit height override
- [ ] Soffit depth override
- [ ] Soffit width override

**Windows** *(add as many as needed — each window captures:)*
- Interior Measurements
  - [ ] Width
  - [ ] Height
  - [ ] Distance from left corner
  - [ ] Distance from right corner
  - [ ] Sill height from countertop
- Trim Measurements
  - [ ] Trim width — left side
  - [ ] Trim width — right side
  - [ ] Trim width — top
  - [ ] Trim width — bottom (apron)

**Doors / Openings** *(add as many as needed — each captures:)*
- [ ] Type — Door or Opening?
- [ ] Width
- [ ] Height
- [ ] Distance from left corner
- [ ] Distance from right corner
- [ ] Swing direction *(left / right / both / n/a)*

**Outlets & Switches** *(add as many as needed — each captures:)*
- [ ] Type — Outlet or Switch?
- [ ] Location from nearest corner

**Existing Cabinet Layout Notes**
- [ ] Free text notes field for cabinet layout on this wall

---

### 🍳 Appliances *(add only appliances that exist in this kitchen)*

Each appliance captures:
- [ ] Which wall it's on
- [ ] Location from nearest corner
- [ ] Width
- [ ] Height
- [ ] Depth

Available appliance types:
- [ ] Refrigerator
- [ ] Range / Slide-in range
- [ ] Cooktop *(separate from oven)*
- [ ] Wall oven
- [ ] Dishwasher
- [ ] Microwave — over range
- [ ] Microwave — built-in / drawer
- [ ] Hood / Range hood
- [ ] Warming drawer
- [ ] Wine fridge
- [ ] Trash compactor

---

### 🚰 Plumbing
- [ ] Which wall sink is on
- [ ] Sink location from nearest corner
- [ ] Sink width
- [ ] Sink depth
- [ ] Faucet location
- [ ] Dishwasher water line location
- [ ] Ice maker line location
- [ ] Garbage disposal — yes / no

---

### 🏝️ Island *(optional — toggle on/off)*
- [ ] Island length
- [ ] Island width
- [ ] Distance from nearest wall — all 4 sides
- [ ] Seating overhang depth
- [ ] Seating overhang location *(which sides)*
- [ ] Has sink? *(yes/no)*
- [ ] Has cooktop? *(yes/no)*
- [ ] Has outlet? *(yes/no)*
- [ ] Existing or new?

---

### 🗄️ Existing Cabinets *(per wall — inside each wall card)*
> Restructured April 2026: Cabinet info moved from a standalone accordion into each individual wall card. Captures per-wall rather than globally.
- [x] Upper cabinets on this wall? *(yes/no toggle)*
  - [x] Upper cabinet height
  - [x] Upper cabinet depth
- [x] Base cabinets on this wall? *(yes/no toggle)*
- [x] Tall / pantry cabinet on this wall? *(yes/no toggle)*
  - [x] Tall cabinet height
  - [x] Tall cabinet depth
- [x] Cabinet layout notes field per wall

---

### 🖥️ Desk
> Removed April 2026: Desk section removed from the Measurements tab. Desk areas should be noted in the cabinet layout notes field on the relevant wall.

---

## Kitchen Assessment — Questions

> ✅ FULLY DETAILED & APPROVED

### 📋 Project Scope
1. **What is the scope of this project?**
   - Full gut renovation
   - Cabinet replacement only
   - Countertops only
   - Multiple items but not a full gut

2. **Why are you renovating?**
   - Outdated
   - Damaged
   - Full remodel
   - Preparing to sell
   - Other *(free text)*

3. **What is your timeline?**
   - Under 3 months
   - 3 to 6 months
   - 6 to 12 months
   - No rush
   - Specific target date *(date picker)*

---

### 🗄️ Cabinets
4. **What are we doing with the cabinets?**
   - New cabinets
   - Partial replacement

5. **Cabinet style preference?**
   - Show cabinet gallery *(photos on-site)*
   - Send style links to customer *(URL links per style)*
   - Notes field

---

### 🪨 Countertops
6. **Countertop material preference?**
   - Guidance only — we do not template, fabricate, or install
   - Notes field for preference

---

### 🎨 Backsplash
7. **Backsplash material preference?**
   - We do not sell materials but we install tile
   - Notes field for preference
   - Is installation needed? *(yes / no)*

---

### 🚰 Sink & Faucet
8. **Sink style preference?** *(customer provides own)*
   - Notes field

9. **Faucet style preference?** *(customer provides own)*
   - Notes field

---

### 🍳 Appliances
10. **What is happening with appliances?**
    - Keeping all existing appliances
    - Replacing all appliances
    - Replacing some appliances
    - Customer purchasing appliances themselves
    - Install only — customer provides

11. **If replacing — which appliances?**
    - Refrigerator
    - Range / Slide-in range
    - Cooktop
    - Wall oven
    - Dishwasher
    - Microwave
    - Hood / Range hood
    - Warming drawer
    - Wine fridge
    - Trash compactor

---

### 💡 Lighting
12. **Lighting** — Customer handles separately *(noted on report)*

---

### 🔩 Hardware
13. **Cabinet hardware** — Customer provides own *(noted on report)*

---

### ⚡ Electrical & Plumbing
14. **Electrical work** — Who will handle?
    - We will handle through our subcontractors
    - Customer will hire their own electrician

15. **Plumbing work** — Who will handle?
    - We will handle through our subcontractors
    - Customer will hire their own plumber

---

### 🪵 Flooring
16. **Is flooring included in this kitchen job?** *(yes / no)*
    - If yes → opens flooring assessment

---

### 📋 Final Details
17. **Are permits required in your municipality?** *(yes / no / unknown)*

18. **How did you hear about us?**
    - Referral
    - Google
    - Social media
    - Repeat customer
    - Other *(free text)*

19. **Special Notes**
    - Pre-built checklist of common items *(tappable, adds to notes)*
      - Pet in home
      - Access restrictions
      - Asbestos concern
      - Second floor job
      - Narrow doorways / tight access
      - HOA approval needed
      - *(Checklist items fully editable in Admin Panel)*
    - Free text notes field

---

## Kitchen Assessment — Photo Checklist

> ✅ FULLY DETAILED & APPROVED
> Photos are optional per item. Tapping an item opens the camera and attaches the photo to that specific item on the report.

### 🏠 Room Overview
- [ ] Full room — from entrance
- [ ] Full room — from opposite corner
- [ ] Floor overview

### 📏 Walls *(one straight-on shot per wall — captures everything on it)*
- [ ] Wall A
- [ ] Wall B
- [ ] Wall C
- [ ] Wall D

### 🏝️ Island *(only appears if island toggle is ON)*
- [ ] Island — full view

### 🖥️ Desk *(only appears if desk toggle is ON)*
- [ ] Desk — full view

### 🗄️ Existing Cabinets *(only appears if cabinets toggle is ON)*
- [ ] Uppers — full view
- [ ] Base cabinets — full view
- [ ] Tall / pantry cabinet — full view

### ⚠️ Problem Areas & Misc
- [ ] Any problem areas or damage
- [ ] Anything unusual or out of square
- [ ] Electrical panel *(if relevant to job)*
- [ ] General catch-all — free notes + photo field

---

## Bathroom Assessment

> ✅ FULLY DETAILED & APPROVED
> Note: Walls, windows, doors, and outlets follow the exact same pattern as the Kitchen Assessment.

---

### 📐 Bathroom Measurements

**🌐 Room Globals** *(same as kitchen)*
- [ ] Overall ceiling height
- [ ] Soffit present? *(yes/no toggle)*

**📏 Per Wall — A, B, C, D** *(same as kitchen)*
- [ ] Wall length
- [ ] Ceiling / soffit overrides if different
- [ ] Windows *(same fields as kitchen)*
- [ ] Doors / Openings *(same fields as kitchen)*
- [ ] Outlets & Switches *(same fields as kitchen)*

**🛁 Tub** *(toggle on/off)*
- [ ] Length
- [ ] Width
- [ ] Height
- [ ] Location from nearest corner
- [ ] Combined tub/shower? *(yes/no)*

**🚿 Shower** *(toggle on/off)*
- [ ] Length
- [ ] Width
- [ ] Height
- [ ] Location from nearest corner
- [ ] Ceiling height inside shower
- [ ] Shower door / glass enclosure opening width
- [ ] Knee wall height
- [ ] Knee wall length

**🪥 Vanity & Sink**
- [ ] Which wall vanity is on
- [ ] Vanity location from nearest corner
- [ ] Vanity width
- [ ] Vanity height
- [ ] Vanity depth
- [ ] Single or double sink?
- [ ] Mirror / medicine cabinet width
- [ ] Mirror / medicine cabinet height

**🚽 Toilet**
- [ ] Toilet location from nearest corner
- [ ] Toilet to wall clearance — left side
- [ ] Toilet to wall clearance — right side

**🗄️ Linen Closet** *(toggle on/off)*
- [ ] Width
- [ ] Height
- [ ] Depth
- [ ] Location

**➕ Extras**
- [ ] Exhaust fan location
- [ ] Towel bar locations
- [ ] Heated floor — yes/no
- [ ] Laundry in bathroom? *(yes/no)*
  - [ ] Washer location and measurements
  - [ ] Dryer location and measurements

---

### ❓ Bathroom Questions

**📋 Project Scope**
1. **What is the scope of this project?**
   - Full gut renovation
   - Tub / shower replacement only
   - Vanity replacement only
   - Tile work only
   - Multiple items but not a full gut
   - Flooring only

2. **Timeline?**
   - Under 3 months
   - 3 to 6 months
   - 6 to 12 months
   - No rush
   - Specific target date *(date picker)*

**🛁 Tub & Shower**
3. **What are we doing with the tub/shower?**
   - Keep existing tub
   - Replace tub
   - Remove tub — convert to shower
   - New shower — tile
   - New shower — prefab / surround
   - New glass enclosure
   - Walk-in shower
   - Undecided

**🪥 Vanity & Fixtures**
4. **What are we doing with the vanity and fixtures?**
   - New vanity — customer provides, we install
   - Keeping existing vanity
   - New countertop on existing vanity
   - New sink only
   - New faucet only
   - New mirror / medicine cabinet
   - New toilet
   - New exhaust fan
   - Towel bars and accessories — customer provides
   - Heated floor

**🎨 Tile Work**
5. **Tile work scope?**
   - Wall tile — we install
   - Floor tile — we install
   - Shower / tub surround tile — we install
   - Customer sources all tile materials

6. **Grout color preference?** *(notes field)*

7. **Tile pattern preference?** *(notes field)*

**⚡ Trades & Final Details**
8. **Electrical** — our subs or customer's own contractor?
9. **Plumbing** — our subs or customer's own contractor?
10. **Are permits required?** *(yes / no / unknown)*
11. **How did you hear about us?** *(dropdown + other)*
12. **Special Notes** *(smart checklist + free text)*

---

### 📷 Bathroom Photo Checklist

> Photos are optional per item. Tapping an item opens the camera and attaches the photo to that specific item on the report.

**🏠 Room Overview** *(same as kitchen)*
- [ ] Full room — from entrance
- [ ] Full room — from opposite corner
- [ ] Floor overview

**📏 Walls** *(same as kitchen)*
- [ ] Wall A
- [ ] Wall B
- [ ] Wall C
- [ ] Wall D

**🛁 Tub & Shower** *(only appears if toggles are ON)*
- [ ] Tub — full view
- [ ] Shower — full view
- [ ] Shower — floor and drain

**🪥 Vanity & Fixtures**
- [ ] Vanity — full view
- [ ] Toilet area

**🗄️ Linen Closet** *(only appears if toggle is ON)*
- [ ] Linen closet — full view

**⚠️ Problem Areas & Misc**
- [ ] Any problem areas or damage
- [ ] General catch-all — free notes + photo

---

## Flooring Assessment

> ✅ FULLY DETAILED & APPROVED

---

### 📐 Flooring Measurements

**🏠 Rooms** *(add as many rooms as needed — each room captures:)*
- [ ] Room name / label *(e.g. Kitchen, Living Room, Hallway)*
- [ ] Room length
- [ ] Room width
- [ ] Total sq. ft. *(auto-calculated from length x width)*
- [ ] Irregular shape? *(yes/no — if yes, manual sq. ft. entry + notes)*
- [ ] Transition strip locations *(notes field)*

> **Grand Total Sq. Ft.** — auto-calculated across all rooms

---

### ❓ Flooring Questions

**📋 Project Scope**
1. **What flooring material?**
   - Hardwood
   - Engineered hardwood
   - LVP / Luxury vinyl plank
   - Tile
   - Carpet
   - Laminate
   - Concrete / Epoxy
   - Customer to source — we install
   - Undecided

2. **Remove existing flooring?** *(yes / no)*
3. **Subfloor repairs needed?** *(yes / no / unknown)*
4. **Underlayment needed?** *(yes / no)*
5. **Stair nosing needed?** *(yes / no)*
6. **Matching existing flooring in other rooms?** *(yes / no)*

**📋 Final Details**
7. **Timeline?**
   - Under 3 months
   - 3 to 6 months
   - 6 to 12 months
   - No rush
   - Specific target date *(date picker)*
8. **How did you hear about us?** *(dropdown + other)*
9. **Special Notes** *(smart checklist + free text)*

---

### 📷 Flooring Photo Checklist

> Photos are optional per item. Tapping an item opens the camera and attaches the photo to that specific item on the report.

**🏠 Per Room** *(repeated for each room added)*
- [ ] Full room overview photo
- [ ] Existing flooring condition

**🪜 Stairs** *(only appears if stair nosing toggle is ON)*
- [ ] Stairs — full view

**⚠️ Misc**
- [ ] General catch-all — free notes + photo

---

## Other Job Types

- Users can select "Other" and name the job type freely on a per-job basis
- Admin can create fully custom job types with their own measurement, question, and photo checklists
- New job types can be added at any time through the Admin Panel without developer involvement

---

## Customer Info

Fields captured per job:
- First Name
- Last Name
- Address
- Phone Number
- Email Address
- General Notes
- Job Type(s)
- Date of Site Visit *(auto-captured)*
- Assigned Team Member *(auto or manual)*

---

## Cabinet Style Gallery

- In-app image gallery organized by style and color
- Admin can add/remove images at any time
- Field users can browse and show images to customers on-site during the questions phase
- Images are stored within the app (no external service required at launch)

---

## Price Guide

### Categories and Line Items *(editable by admin)*

**Cabinets & Millwork**
- Cost per linear foot by cabinet door style/color
- Cabinet hardware per unit
- Crown molding per linear foot
- Valance/light rail per linear foot
- Filler pieces

**Countertops**
- Cost per sq. ft. by material (granite, quartz, laminate, butcher block)
- Edge profile upcharges
- Cutout fees (sink, cooktop)

**Backsplash**
- Cost per sq. ft. by material (tile, subway, mosaic, stone)
- Installation cost per sq. ft.

**Flooring**
- Cost per sq. ft. by material (hardwood, LVP, tile, carpet)
- Installation cost per sq. ft.
- Underlayment cost per sq. ft.

**Lighting**
- Cost per high hat installed
- Cost per pendant installed
- Under cabinet lighting per linear foot

**Plumbing**
- Cost of fixtures by type (faucet, sink, disposal)
- Installation cost per fixture

**Appliances**
- Common appliance packages or ranges
- Installation/delivery fees

**Labor & Misc**
- Demo cost per room
- Haul away fees
- Permit costs
- Painting per room

---

## Estimating — Phase 1

> ✅ FULLY DETAILED & APPROVED

---

### 🕐 When Estimates Are Generated
- At the end of each individual assessment *(kitchen, bathroom, flooring)*
- Combined total estimate on the final job summary screen

---

### ⚙️ How Estimates Are Built
1. Auto-generated from measurements + price guide
2. User reviews and manually edits any line item before finalizing
3. Estimate is locked when user approves it

---

### 💰 Labor Pricing Methods *(combination depending on task)*
- Per linear foot *(cabinets, molding)*
- Per sq. ft. *(tile, flooring, countertops)*
- Per unit *(fixtures, appliances, high hats)*
- Flat rate *(per job type or task)*
- Per hour *(miscellaneous tasks)*

---

### 🪵 Material Pricing
- Low / medium / high range based on material tier
- Each material type has three price tiers set in the Price Guide
- Estimate shows customer a range *(e.g. "Materials: $2,400 – $4,800")*

---

### 📊 Markup Settings *(set in Admin Panel)*
- **Labor markup** — single adjustable percentage *(e.g. 30%)*
- **Materials markup** — single adjustable percentage *(e.g. 40%)*
- Applied automatically when estimate is generated
- Creates the difference between internal cost and customer price
- Never visible to customer on any exported document

---

### 👁️ Two Completely Separate Cost Views

**👤 Customer-Facing Estimate**
- Clean, professional one-page view
- Shows labor quote + material low/high range
- Exported as PDF and emailed to customer
- No internal costs visible anywhere

**🔒 Internal Cost View** *(owner/manager only)*
- Completely separate from customer view
- Protected by privacy pop-up before opening:
  > *"You are about to view internal job costs. Is anyone nearby who may see your screen?"*
  - "Yes, continue" button
  - "Cancel" button
- Shows actual costs vs customer price per line item
- Shows profit margin per line item and overall total
- Optional PIN or fingerprint protection
- Never appears on any exported or emailed document

---

### 📄 Estimate Report Format
- One page, clean, customer-friendly
- Delivered as PDF and/or emailed directly from app
- Sections:
  - Customer info
  - Job type(s)
  - Labor quote *(firm)*
  - Materials range *(low – high)*
  - Combined total range
  - Company branding / contact info

---

## Admin Panel

Accessible by owner/manager only.

- **Job Types** — Add, edit, remove job types and their full checklists
- **Measurements** — Customize measurement fields per job type
- **Questions** — Customize question checklists per job type
- **Photos** — Customize photo checklists per job type
- **Cabinet Gallery** — Add/remove cabinet style images
- **Price Guide** — Edit all product and service costs
- **Markup Settings** — Set labor % and materials % markup
- **Team Members** — Add/remove team members and set roles

---

## Export & Email

- Export full job report including:
  - Customer info
  - All measurements
  - All question answers
  - All photos (attached to their respective items)
  - Estimate (if generated)
- Format: PDF (primary)
- Delivery: Email directly from app, or save/share to device

---

## Team & Data Sharing

- All team members see all jobs at all times
- Jobs are stored in shared cloud database
- Owner/manager can review any job from any device at any time
- Each job entry records which team member conducted the assessment
- Offline support with sync when connection is restored *(job sites often have poor signal)*

---

## Design Guidelines

- **Primary Color:** Navy Blue `#1F3096`
- **Accent Color:** Golden Yellow `#F5C42A`
- **Theme:** Dark mode
- **Feel:** Clean, professional, logical, approachable
- **Navigation:** Extremely simple — designed for non-tech-savvy users
- **Layout:** Very well organized, easy to follow step by step
- **Typography:** Clear, readable, no clutter
- **Platforms:** iOS, Android, Web (responsive)

---

## Phase 2 — AI Project Planner & Estimator

> 🔒 Locked for Phase 2. Foundation will be built correctly in Phase 1 to support this.

The AI will analyze all job data entered and:

### Auto-Complete Estimating
- Review all measurements and automatically populate every relevant line item
- Flag any missing items the estimator may have overlooked
- Suggest related items based on what was entered

### AI Prompts & Suggestions (examples)
- *"You have 14 linear feet of upper cabinets — don't forget crown molding, under cabinet lighting, and valance."*
- *"A new sink was noted — have you included disposal, plumbing rough-in, and faucet?"*
- *"You measured 22 sq ft of backsplash but only quoted 15."*
- *"Kitchen has an island — did you include seating overhang on the countertop?"*

### Full Professional Project Planning
- **Demo & Prep:** Demo of cabinets, countertops, flooring, fixtures; haul away; wall prep; floor leveling
- **Electrical:** High hats, under cabinet lighting, outlet relocation, dedicated circuits, permits
- **Plumbing:** Sink, faucet, disposal, dishwasher, ice maker, rough-in relocation, permits
- **Cabinets & Millwork:** All cabinet types, hardware, crown, light rail, valance, fillers, island
- **Countertops:** Material, edge profiles, cutouts, seams, returns
- **Backsplash:** Material, installation, cuts around outlets/windows
- **Flooring:** Material, underlayment, transitions, subfloor repairs
- **Bathroom Specific:** Tile surround, glass enclosure, vanity, mirror, accessories, exhaust fan
- **Appliances:** Supply and install or install only, delivery, haul away
- **Finishing:** Painting, caulking, touch ups, hardware install
- **Project Management:** Timeline, subcontractor scheduling, permit timeline, punch list, change orders
- **Financial:** Line item estimate with markup, labor vs material breakdown, tax, payment schedule, profit margin analysis

---

## Open Questions & Ideas

> Decisions needed before the relevant sprint begins.

- [ ] **Backend:** Supabase or Firebase? *(needed before Sprint 5)*
- [ ] **Mobile:** React Native or PWA? *(needed before Sprint 7)*
- [ ] **PDF export:** react-pdf or jsPDF? *(needed before Sprint 6)*
- [ ] **Photo storage:** Where are photos stored? Device only, or uploaded to cloud? *(needed before Sprint 1)*
- [ ] **Digital signature:** Should the customer be able to sign the estimate on-site? *(nice to have)*
- [ ] **Offline:** Confirmed requirement — jobs must work offline and sync later
- [ ] **Permission levels:** Field user vs manager — confirmed two roles needed *(Sprint 5)*
- [ ] **Export format:** PDF confirmed as primary. Excel as secondary? TBD
- [ ] **Notes per section:** Confirmed — each assessment section should have a notes field at the end
- [ ] **Estimate on-site vs back at office:** Should estimate be generated on-site or just back at the office?
