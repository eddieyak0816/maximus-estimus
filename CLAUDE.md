# 🏛️ Maximus Estimus — AI Developer Handoff Guide

> **Last Updated:** May 29, 2026 (Session 5)  
> **Project Lead:** Eddie (eddie0816@gmail.com)  
> **Status:** Phase 1 Complete + Phase 5 Complete + All UX Features Complete ✅ + Questions Customization (Smart) ✅ + Island Photo Capture ✅ + UI Polish & Data Indicators ✅

---

## 📋 Quick Reference

| Item | Status | Details |
|------|--------|---------|
| **Phase** | Phase 1 + Phase 5 ✅ | Field workflow complete, cloud sync live |
| **Platform** | Web (React 19 + TypeScript) | iOS/Android planned for Sprint 7 |
| **Storage** | Supabase + localStorage | PostgreSQL + offline cache (IndexedDB for photos) |
| **Deployment** | GitHub Pages + Supabase | Live at https://eddieyak0816.github.io/maximus-estimus/ |
| **Auth** | Supabase PIN-based (4-12 digit) | Admin creates PINs; super admins at eddie0816@gmail.com & maximusconstructionnj@gmail.com |
| **Team** | Solo dev (Eddie) + AI assistant | Small field team of 3+ in production |

---

## 🎯 What This App Does

**Maximus Estimus** is a field measurement and job intake app for kitchen designers and contractors. It guides team members through a complete job site visit:
1. **Capture customer info** (name, address, contact, visit date, assigned team member)
2. **Select job types** (Kitchen, Bathroom, Flooring, Other, or custom room templates)
3. **Record measurements** (walls, appliances, fixtures, dimensions)
4. **Answer questions** (scope, timeline, materials, preferences, special notes)
5. **Take photos** (real device camera, stored in IndexedDB)
6. **Generate estimates** (auto-calculated from measurements + price guide)
7. **View summary** (consolidated report of all collected data)
8. **Export/email** (PDF reports to customer, coming in Sprint 6)

---

## 💬 Communication & Collaboration Preferences

### How to Work with Eddie (Project Lead)

- **Async preferred** — Eddie works across multiple projects. Detailed handoff docs are appreciated.
- **Clear task definitions** — When asking for a feature, include: what it does, why, where it goes, acceptance criteria.
- **Don't guess on scope** — If unclear, ask before implementing. A 5-minute clarification saves 30 minutes of rework.
- **Test in the browser before declaring done** — Type checking and unit tests verify code correctness, not feature correctness. Always open the app and test the golden path.
- **Commit message style** — Short, clear, imperative: "Add room template for living rooms" not "added feature" or "fixed stuff".
- **No big refactors without discussion** — The codebase is young and intentionally simple. If you spot something that feels like tech debt, mention it first.

### When Something Breaks
- Document what broke, what you tried, and where you got stuck.
- Include git commands and error messages if applicable.
- If it's a build/deps issue, assume it's a local environment problem first (npm cache, node version, Google Drive path issues).

---

## 📊 Current Sprint Status

### ✅ Complete (May 14-15, 2026)
- **Sprint 1:** Core kitchen assessment (measurements, questions, photos, cabinet gallery)
- **Sprint 2:** Bathroom and flooring assessments, "Other" job type
- **Sprint 3:** Price guide (editable), estimate generation (auto + manual override), customer + internal cost views
- **Real Photo Capture:** Device camera integration, IndexedDB storage, photo display/deletion
- **Summary View:** Consolidated read-only report of all job data with estimate hero
- **UX Polish:** Full collapsible sections, wall rename propagation, accordion appliances/island/plumbing
- **Phase 5 (Cloud Sync):** Supabase backend, team authentication, cloud database, Supabase Storage for photos, local-first offline sync
- **Admin Panel MVP (May 14 evening):** Super admin user management, user deletion, logged-in user display on Dashboard, PIN-based authentication with Supabase
- **UI Standardization (May 15):** Consistent header backgrounds on collapsible sections, unified pencil icon styling (SVG not emoji), matching layout patterns across Kitchen and Flooring, collapsible rooms/sections with ChevronIcon, full-width clickable header backgrounds with rgba(255,255,255,0.02)
- **Configurable Dropdowns (May 15 evening):** 8 dropdown categories (appliances, materials, finishes, transitions, etc.), admin UI at /admin/dropdowns, reusable DropdownSelect component, form integrations for Kitchen appliances, Flooring materials, transition locations, caching with in-memory 5-min TTL
- **UX Enhancements (May 15 late evening):** 
  - Team Member field now uses dropdown (team_members list) with custom value support
  - Wall labels now use dropdown (wall_labels list: A, B, C, D, or custom) when editing
  - All dropdown fields include "Other / Custom" option for free-text values
  - Fixed checkbox vs radio button display: multi-select fields show checkboxes, single-select show radio buttons
  - Added OK buttons to all edit fields (wall rename, room/part/transition rename in Flooring) instead of relying on blur
  - Custom values auto-populate their input field when editing existing custom entries
  - Alphabetically sorted dropdown options (both admin entry and user display)

- **Creator Tracking & Dashboard Display (May 17):**
  - Added `creatorId` field to all assessments (links to pin_users.id)
  - Dashboard now displays creator name next to each assessment date
  - Admins can see who created each job (helps oversee team workflow)
  - Data syncing fully fixed (403 permissions issue resolved)

- **Kitchen & Bathroom Feature Enhancements (May 17):**
  - **Windows:** Per-window replacement toggle in measurements (WindowCard) — no longer in Questions tab; cleaner UX with scope decisions at point of measurement
  - **Flooring:** Support multiple floor and trim measurement entries per room with individual + room totals shown
  - **Backsplash:** New Kitchen question (Section 7) "Will there be a new backsplash?" with material options (Tiles, Solid Slab, Other) and custom text input
  - **Painting:** New assessment type (auto-creates like Flooring) with multiple floor and trim measurements, questions (scope, timeline, referral, special notes), and photo checklist
  - **Recessed Lights:** Added to Kitchen (Section 12) and Bathroom (Section 8) with toggle + numeric count input, displayed in summary
  - **Reusable Pattern:** Multiple measurement entries now support varied field patterns for future room types

- **Mobile-Friendly UI Redesign (May 17 evening):**
  - Hamburger menu (≡ button) for navigation on screens ≤768px — slide-down overlay with all nav links, Font Size control, + New Assessment, Sign Out
  - Touch targets: All interactive elements brought to 44px minimum (iOS/Android standard)
    - Input fields: 30px → 44px min-height
    - Buttons: 24–28px → 40–44px
    - Pills: 20–26px → 36–44px
    - Toggle rows: 52px tap zone
    - CheckOpt rows: 48px min-height
  - Responsive layouts on mobile: Page padding reduced, cards wrap/stack, buttons full-width, outlet rows stack on 480px
  - App works reliably on field contractors' phones (iPhone/Android, 375px+)

- **Photos Interface Redesign & Mobile Camera Fixes (May 22):**
  - **Unified Photos Tab:** Replaced all job-specific photo pages (Kitchen, Bathroom, Flooring, Painting, Living Room, Bedroom, Deck) with single reusable PhotosTab component
  - **Simplified UX:** Photos now use dropdown-based interface instead of long predefined checklist
    - Dropdown populated with wall names from measurements + default categories (Room Overview, Floor, Problem Areas, Lighting, Electrical, etc.) + "Other" custom option
    - Users simply tap "➕ Add Photo", select category from dropdown, upload/take photo
    - No more scrolling through 20+ photo items
    - Flexible: users can add unlimited photos per job, tagged as needed
  - **Mobile Camera Fixed:** 
    - Added fallback camera constraints (if `facingMode: 'environment'` fails, tries any available camera)
    - Improved stream initialization with proper `onloadedmetadata` and `oncanplay` handlers
    - Added 1-second timeout fallback to show camera view even if metadata loads slowly
    - Better error messages for permission denied/camera unavailable
    - Video element now has explicit min-height (300px) to ensure visibility
  - **Photo Upload Feature:**
    - Added "📁 Upload Photo" button to all photo interfaces (alongside "📷 Take Photo")
    - Users can upload from device storage/camera roll without using web camera
    - Works on all job types equally
    - File input with image-only filtering
  - **Responsive Button Fix:**
    - Fixed CustomPhotosSection buttons overflowing on mobile
    - Buttons now wrap on small screens with proper flex layout
    - Shortened button text (Take/Upload/✕) for mobile fit
  - **Data Model Change:**
    - Simplified all `*Photos` interfaces from individual fields to single array: `photos: CustomPhoto[]`
    - Example: `KitchenPhotos` changed from `{roomEntrance?, wallA?, wallB?, ...}` to `{photos: CustomPhoto[]}`
    - All photo pages now use same data structure, enabling reusable PhotosTab component

- **Opening Trim Size Enhancement (May 22):**
  - Added trim width measurements to Openings (doors without type-specific trim were hidden)
  - Openings now show Left Side, Right Side, Top trim fields alongside regular Door measurements
  - Consistent with Door trim UI

- **Wall Length Quick-Add Pieces (May 22):**
  - Kitchen/Bathroom wall length now supports additive pieces under each Wall Length field
  - Field user enters one "Next piece" value, taps Add or presses Enter, and the input clears/refocuses
  - Combined total displays in inches and automatically fills the main Wall Length field
  - Undo last removes the most recent piece for fast correction
  - Existing simple Wall Length entry remains available for straightforward walls

- **Room Templates: Living Room, Bedroom, Deck (May 15 completed, verified May 22):**
  - **Living Room:** Measurements (ceiling height, windows, doors, outlets, flooring, lighting notes) + Questions (scope, timeline, flooring included, lighting work, referral, special notes) + Photos (PhotosTab)
  - **Bedroom:** Measurements (ceiling height, closets, closet notes, windows, doors, outlets, flooring) + Questions (scope, timeline, flooring, closet work, referral, special notes) + Photos (PhotosTab)
  - **Deck:** Measurements (length, width, auto-calculated sqft, height, existing condition, railing toggle, access notes) + Questions (scope, timeline, existing deck, railing, referral, special notes) + Photos (PhotosTab)
  - All three room types fully wired into AssessmentDetail routing, JobTypePage job picker, and SummaryView rendering
  - All three share consistent patterns: `u()` helper for updates, collapsible sections, PhotosTab integration
  - Data persists independently per room type; syncs to Supabase with other jobs

- **Role-Based Job Visibility (May 15 completed, verified May 22):**
  - Dashboard.tsx: `visibleAssessments = user?.isAdmin ? assessments : assessments.filter(a => a.creatorId === user?.id)`
  - Page title switches: "All Assessments" (admin) vs "My Assessments" (regular user)
  - `App.tsx` `NewRedirect`: `createAssessment(user.id)` stamps creator ID on every new assessment
  - `AuthContext.tsx`: `PinUser.isAdmin` non-optional boolean, sourced from Supabase `is_admin` column, persisted in localStorage
  - `Assessment.creatorId`: required `string` field, set at creation, never overwritten
  - Creator name badge displays for each assessment showing who created it

- **Wall Photo Capture from Measurements (May 26):**
  - 📷 camera icon next to each wall name in Kitchen/Bathroom measurements
  - Click icon → camera opens with wall name pre-selected as photo category
  - Photo auto-tagged with wall name (e.g., "Wall A", "Wall B")
  - Photos appear in Photos tab with wall names as labels
  - Works on all measurement pages (Kitchen, Bathroom, Flooring, etc.)
  - Files: WallSection.tsx (camera icon + modal), AssessmentDetail.tsx (handler), KitchenMeasurements.tsx, BathroomMeasurements.tsx

- **Photo Viewer Modal with "View" Button (May 26):**
  - Created ImageModal.tsx component for full-screen image viewing
  - PhotoItem now shows "View" button to open captured photos in modal
  - Click thumbnail → opens full-size photo (not camera)
  - Close with ✕ button or Esc key
  - Improves photo review workflow on field

- **Cumulative Font Scaling (May 26):**
  - A+ button → increases font size 10% each click (cumulative, unlimited)
  - A− button → decreases font size 10% each click
  - A button → resets to default (100%)
  - FontScaleContext.tsx manages state + localStorage persistence
  - CSS --font-scale variable applies to all font sizes
  - Accessibility improvement for users with vision challenges
  - Preference saved across sessions

- **Measurement Input UI Improvement (May 26 evening):**
  - Narrowed all measurement inputs from flex: 1 (stretch-to-fill) to width: 80px
  - Accommodates 3-digit measurements without taking up entire row width
  - Fixed unit dropdown state initialization to detect unit from stored value (so "feet" values show "ft" on reload)
  - Updated unit dropdown labels from Unicode symbols (″/′) to plain text (in/ft) for better mobile readability
  - Applies to 30+ MeasInput instances across Kitchen, Bathroom, Island, Living Room, Bedroom, Deck
  - Files changed: src/components/MeasInput.tsx, src/index.css
  - Improves mobile UX: forms no longer require horizontal scrolling, compact measurement sections

- **All Accordions Start Closed on Measure Tab (May 26 evening - Session 2):**
  - When user switches to "📏 Measure" tab, all accordion sections start in collapsed state
  - Propagates `startClosed` prop through entire component hierarchy:
    - AssessmentDetail.tsx → KitchenMeasurements, BathroomMeasurements (+ all other measurement types)
    - Measurement components → WallSection for each wall
    - WallSection → WindowCard, DoorCard, ApplianceCard sub-components
  - Uses React key change strategy: when switching to Measure tab, `key='measurements-tab'` forces component remount, resetting all useState hooks
  - Main sections (Room Globals, Walls, Island, Tub, Shower, etc.) initialize with `defaultOpen={!startClosed}`
  - Island sub-sections (Dimensions, Clearances, Overhang, Sink, Cooktop, Outlets, Levels) initialize with `useState(!startClosed)`
  - Wall sub-cards (Windows, Doors, Appliances, Outlets) and their details initialize with `useState(!startClosed)`
  - User can open sections as needed; accordion state resets fresh when switching tabs
  - Files modified: AssessmentDetail.tsx, KitchenMeasurements.tsx, BathroomMeasurements.tsx, WallSection.tsx

- **Base Cabinet Height & Depth (May 26 evening - Session 2):**
  - Added `baseCabH` and `baseCabD` fields to WallData type
  - Existing Cabinets section now shows height/depth inputs for base cabinets when toggle enabled
  - Consistent with upper and tall cabinet UI patterns
  - Files modified: src/types/index.ts, src/components/WallSection.tsx

- **Trim Copy/Paste Toggle for Windows & Doors (May 27-28):**
  - Added "Sync all trim sizes?" toggle in Window and Door trim sections
  - When enabled, entering one trim measurement syncs to all trim fields (Left, Right, Top, Bottom)
  - Windows: Syncs trimLeft, trimRight, trimTop, trimBottom
  - Doors: Syncs trimLeft, trimRight, trimTop
  - Uses local state per window/door card
  - Files modified: src/components/WallSection.tsx

- **Accordion Content Highlighting (May 27-28):**
  - Top-level accordions now show subtle blue background + left border when they contain data
  - Visible on ALL tabs (Questions, Measurements, Photos, etc.)
  - Created `sectionHasContent()` helper to detect populated fields
  - Applied to all 20 question sections in KitchenQuestions
  - Pattern can be applied to other question pages (Bathroom, Flooring, etc.)
  - Files created: src/utils/hasQuestionsContent.ts
  - Files modified: src/components/CollapseSection.tsx, src/index.css, src/pages/kitchen/KitchenQuestions.tsx, src/pages/AssessmentDetail.tsx

- **Questions Tab Content Indicator (May 27-28):**
  - Questions tab now highlights in golden yellow when it contains data
  - Non-active Questions tab shows: golden text color + semi-transparent yellow background
  - Added `questionsHaveContent()` function in AssessmentDetail.tsx to detect any populated fields
  - Works for all assessment types (Kitchen, Bathroom, Flooring, Painting, Living Room, Bedroom, Deck)
  - Files modified: src/pages/AssessmentDetail.tsx, src/index.css

- **Anchor Navigation for Populated Accordion Sections (May 27-28):**
  - Added "Quick Links:" bar at top of Questions tab showing only sections with content
  - Links allow smooth scrolling to sections with data
  - Created QuestionsSectionAnchors.tsx component
  - Updated CollapseSection to accept `id` prop for anchor targeting
  - All 20 Kitchen question sections now have unique IDs for anchor navigation
  - Pattern established for applying to other question pages
  - Files created: src/components/QuestionsSectionAnchors.tsx
  - Files modified: src/components/CollapseSection.tsx, src/index.css, src/pages/kitchen/KitchenQuestions.tsx

- **Adaptive Button Layout for Larger Font Sizes (May 27-28):**
  - Added `flex-wrap: wrap` to all inline button rows to prevent overflow when text size increases
  - Fixed elements: toggle-row, overhang-row, enable-row, outlet-row, soffit-override-header, wall-name-row, wall-sub-section-header, sub-card-header, sub-card-actions
  - Buttons now wrap to next line instead of disappearing off-screen with A+ font scaling
  - Files modified: src/index.css

- **Camera Modal with Choice Screen (May 27-28):**
  - CameraModal now shows initial choice screen: "📷 Take Photo" or "📁 Upload Photo"
  - Removed separate upload buttons; consolidated into one modal flow
  - Upload handler converts image to JPEG blob with 0.85 quality before saving
  - Wall photo button (📷) now opens modal with both options
  - Files modified: src/components/CameraModal.tsx

- **Bathroom Wall Names in Vanity Section (May 27-28):**
  - Fixed vanity wall selector buttons to use custom wall names instead of hardcoded A, B, C, D
  - Now shows `wall.name || label` (custom name with fallback to generated label)
  - Data persistence works correctly with renamed walls
  - Files modified: src/pages/bathroom/BathroomMeasurements.tsx

- **Smart Questions Customization (May 28 - Session 4):**
  - Added constraint: users cannot hide questions that contain data
  - Users must clear question data before hiding it; prevents accidental loss
  - Updated AddQuestionsModal to detect populated fields per question
  - When user tries to uncollapse a question with data → alert: "Cannot hide — clear data first"
  - Questions with active data show "Has data" label and disabled checkbox
  - Added `sectionHasContent()` helper function to all 7 question pages (Kitchen, Bathroom, Flooring, Painting, Living Room, Bedroom, Deck)
  - Added `fieldsPerQuestion` mapping to each question page specifying which fields belong to each question
  - Files modified: src/components/AddQuestionsModal.tsx, CollapseSection.tsx (now accepts ReactNode for title), all question pages
  - Files modified for CSS: src/index.css (removed yellow Questions tab highlight when not active)

- **Modal Scrolling Fix (May 28 - Session 4):**
  - Fixed AddQuestionsModal scroll issue when zoomed or with many questions
  - Changed modal-body height from 400px to 70vh (responsive)
  - Overrode alignment from center to flex-start so content scrolls properly from top
  - Users can now see all questions in customize modal regardless of zoom level

- **Questions Visibility Overhaul (May 28 - Session 4):**
  - Changed default from "all questions ON" to "all questions OFF"
  - Users start with clean slate, turn on questions they need
  - Auto-detection: if existing job has data in a question, that question auto-shows (checked)
  - New jobs: all questions hidden until user enables them
  - Implemented `getDefaultVisibleQuestions()` helper in each question page
  - Detection scans `fieldsPerQuestion` mapping and `sectionHasContent()` to auto-show relevant questions
  - Files modified: all 7 question pages

- **Island Photo Capture (May 28 - Session 4):**
  - Added 📷 camera icon to Island section header (like walls)
  - Icon appears when Island is enabled
  - Click icon → opens CameraModal with "Photo: Island" pre-selected
  - Photo tagged as "Island" in Photos tab
  - Follows same pattern as wall photo capture
  - Files modified: src/pages/kitchen/KitchenMeasurements.tsx, src/components/CollapseSection.tsx (title now accepts ReactNode)

- **Dashboard Filtering by Status (May 29 - Session 5):**
  - Clicking stat cards (Total, Draft, Active, Done) filters assessment list by status
  - Click same card again to reset filter and show all assessments
  - Active filter shows visual feedback: raised background + yellow border + glow effect
  - Hover states improved on all stat cards
  - Files modified: src/pages/Dashboard.tsx, src/index.css

- **UI Polish: Pill Selection Visibility & Button Prominence (May 29 - Session 5):**
  - **Pill Selection Improvement:**
    - Active pills now have solid navy blue fill with white text (vs subtle tint)
    - Added glow effect: `0 0 12px rgba(31,48,150,0.4)`
    - Font weight increased to 700 for emphasis
    - Improved hover states: blue border appears on unselected pills
    - Applied to all pill selections: Left/Right, Outlet/Switch, Door/Opening, Swing Direction, etc.
  - **Dropdown + Accordion Button Redesign:**
    - Expand buttons increased from tiny to prominent 40x40px clickable area
    - Button shows visual feedback when accordion is open:
      - Raised background highlight
      - Blue border when expanded
      - Smooth transition effects
    - Dropdown narrower (doesn't stretch to fill space)
    - Better spacing between dropdown and action buttons (gap: 12px)
  - Files modified: src/index.css, src/components/WallSection.tsx

- **Data Indicators Throughout App (May 29 - Session 5):**
  - Added visual indicators showing which sections/cards have populated data
  - **Applied to Measurement Cards:**
    - Appliance Cards: Blue left border (3px) + light blue background when appliance has measurements
    - Window Cards: Same indicator when measurements/trim data exists
    - Door Cards: Same indicator when door data populated
    - Outlet Rows: Subtle blue highlight when outlet location is set
  - **Applied to Section Headers:**
    - Wall Sections: Subtle blue left border (4px) + light blue background when wall has any measurements, windows, doors, outlets, appliances, or fixtures
  - **Visual Style Consistent Across All:**
    - 3-4px blue left border
    - Light blue background: `rgba(31,48,150,0.08)`
    - Smooth transitions on all changes
  - **Helper Functions Added:**
    - `applianceHasData()` — detects appliance with measurements
    - `windowHasData()` — detects window with measurements/trim
    - `doorHasData()` — detects door with data
    - `outletHasData()` — detects outlet with location
    - Wall data detection inline in WallSection component
  - Files modified: src/components/WallSection.tsx, src/index.css

- **Camera Modal Choice Screen Fix (May 29 - Session 5):**
  - **Bug:** Choice screen (Take Photo / Upload) disappeared after 1 second
  - **Root Cause:** Camera automatically started on component mount, causing stage to change from 'choice' to 'requesting'/'camera'
  - **Solution:** Removed automatic camera startup; camera now only initializes when user clicks "Take Photo"
  - **Result:** Choice screen stays visible until user makes selection
  - Files modified: src/components/CameraModal.tsx

- **Wall Length in Collapsed Section Summary (May 29 - Session 5):**
  - Wall length now displays in the summary when accordion is closed
  - Formatted as: "Length: [measurement]" in bold yellow (brand color) at start of summary
  - Only shows if wall length has been entered (doesn't clutter empty walls)
  - Example: `Length: 12' 3" · 2 win · 1 door · 3 outlet · 1 appl · sink`
  - Files modified: src/components/WallSection.tsx

### 🔲 Next Up (Priority Order)

#### ✅ Configurable Dropdown Lists (COMPLETE — May 15, 2026 Evening)
**Goal:** Allow admins to create and manage dropdown options for labels throughout the app instead of free-text inputs.

**Completed:**
- [x] Supabase schema: `dropdown_lists` and `dropdown_options` tables with RLS policies
- [x] Admin UI at `/admin/dropdowns` for viewing/managing all dropdown categories
- [x] DropdownSelect component with support for custom values ("Other" option)
- [x] Dropdown utility functions with in-memory caching (5-min TTL)
- [x] 8 default dropdown categories seeded: appliance_names, flooring_materials, cabinet_finishes, wall_labels, transition_locations, team_members, room_names, special_notes_categories
- [x] Form integrations: Appliance names (Kitchen), Flooring materials (Flooring questions), Transition locations (Flooring measurements)
- [x] Integration guide: DROPDOWNS_INTEGRATION_GUIDE.md for remaining work

**Current Integrations:**
- ✅ Kitchen appliances (WallSection.tsx) — dropdown + custom input
- ✅ Flooring materials (FlooringQuestions.tsx) — dynamic list from dropdown
- ✅ Transition locations (FlooringMeasurements.tsx) — dropdown + custom input

**Remaining Integrations (Optional):**
- Cabinet finishes (KitchenQuestions.tsx)
- Wall labels (currently A, B, C, D)
- Team member dropdown (requires architectural change from local Zustand to remote source)
- Room names/labels
- Special notes categories
- See DROPDOWNS_INTEGRATION_GUIDE.md for implementation details

#### ✅ Measurement Input UI Improvement (COMPLETE — May 26, 2026 Evening)
**Goal:** Make measurement inputs narrower and add unit selector dropdown.

**Completed:**
- [x] Narrowed all measurement inputs from flex: 1 to width: 80px
- [x] Unit dropdown labels changed from Unicode symbols (″/′) to plain text (in/ft)
- [x] Fixed unit state initialization to detect unit from stored value on reload
- [x] Applies to 30+ MeasInput instances across all room types
- [x] Responsive on mobile (375px+)
- [x] Form layouts no longer require horizontal scrolling

#### 🔲 Feature 2: Dynamic Wall Count (5+ Walls) — NEXT
**Goal:** Allow users to add more walls beyond the hardcoded A, B, C, D limit.

**Scope:**
- Replace hardcoded WALL_LABELS array with dynamic wall count
- Add "➕ Add Wall" button below Wall D to create E, F, G, etc.
- Remove button for user-added walls
- Auto-naming based on letter sequence
- Photo handling (wall photos tagged with auto-generated names)
- Estimate generation updates (works with any wall count)

**Files to modify:**
- `src/pages/kitchen/KitchenMeasurements.tsx` — convert static map to dynamic state
- `src/pages/bathroom/BathroomMeasurements.tsx` — same pattern
- `src/types/index.ts` — KitchenMeasurements.walls structure (currently fixed record, convert to array or dynamic)
- `src/store/assessmentStore.ts` — update actions to handle wall add/remove
- `src/utils/estimateEngine.ts` — ensure estimate generation loops correctly

**Acceptance Criteria:**
- ✓ Users can add walls beyond D
- ✓ Walls auto-name (E, F, G, H, etc.)
- ✓ Wall photos work with new walls
- ✓ Estimates generate correctly for all walls
- ✓ Persist to Supabase
- ✓ Works on Kitchen, Bathroom (and any other wall-based pages)

#### Sprint 4: Admin Panel
**Goal:** Give owner full control over job types, pricing, team, cabinet gallery.

- [x] **Admin dashboard page at `/admin` (May 22, 2026)** — Unified hub for all admin functions
  - Section cards for Users, Dropdowns, Price Guide, Cabinet Gallery (each links to existing pages)
  - App stats row: total assessments, team member count, logged-in user name
  - Admin-gated with access denied for non-admins
  - Replaces scattered admin links on Dashboard with single "🛠️ Admin Panel" button
  - Responsive 2-column grid layout (stacks on mobile)
  - Hover effects on cards for visual feedback
- [ ] Manage job types (add/remove, custom checklists)
- [ ] Manage team members (centralized list)
- [ ] Manage price guide (move from `/price-guide` to admin)
- [ ] Manage markup settings (labor % + materials %)
- [ ] Cabinet gallery enhancements (add/remove images, full-screen view)

#### ✅ Sprint 5: Backend & Cloud Sync (COMPLETE — May 14, 2026)
**Goal:** Move off localStorage so the whole team can share jobs.

- [x] Chose Supabase (PostgreSQL, auth, storage)
- [x] User authentication (team member login via email/password)
- [x] Cloud database for all assessments (+ team members, price guide, markup settings)
- [x] Offline support with sync when back online — local-first: localStorage cache + background Supabase sync
- [x] Shared team access (all authenticated users see all assessments)
- [ ] Role-based access (field user vs manager/owner) — deferred to Sprint 4

**How it works:**
- Users log in with Supabase credentials (created by Eddie in dashboard)
- On app load, assessments load instantly from localStorage (works offline)
- In background, app fetches latest from Supabase (last-write-wins by `updatedAt`)
- Every mutation (create/update/delete) writes to localStorage immediately + syncs to Supabase async
- Photos save to IndexedDB locally + upload to Supabase Storage (with public URLs)
- If offline, changes persist locally, sync when back online

**Key files:**
- `src/lib/supabase.ts` — Supabase client
- `src/contexts/AuthContext.tsx` — Auth state + login/logout
- `src/pages/LoginPage.tsx` — Login form
- `src/utils/supabaseSync.ts` — Push/pull utilities
- `src/store/assessmentStore.ts` — Modified to add background sync calls
- `src/utils/photoStorage.ts` — Added Supabase Storage upload/download

#### Sprint 6: Export & Email
**Goal:** Professional deliverables from every job.

- [ ] PDF export (full job report: customer, measurements, answers, photos, estimate)
- [ ] Customer-facing PDF (clean, branded, no costs)
- [ ] Internal PDF (costs, margins — owner only)
- [ ] Email directly from app

#### Sprint 7: Mobile Apps
**Goal:** Native iOS and Android.

- [ ] Decide: React Native (true native) vs PWA (web-based)
- [ ] iOS build + App Store submission
- [ ] Android build + Google Play submission
- [ ] Test camera integration on device

#### Phase 2: AI Estimator & Measurement Extraction
**Locked until Phase 1 complete.** Will use Claude API for two key features:

**AI Measurement Extraction from Photos:**
- Analyze wall photos to automatically extract measurement data
- Detect and extract: wall length, window/door dimensions & locations, outlet/switch positions, appliance locations, sink presence, cabinet types & dimensions, ceiling/soffit details, material/finish info
- Pre-fill measurement form fields with AI estimates + confidence indicators
- User verifies/adjusts values before saving
- Saves field teams 60-80% measurement entry time
- Works on single wide photo or multiple angled photos for better accuracy

**AI Estimate Generation:**
- Auto-populate estimate line items from measurements
- Flag missing items (e.g., "You have 14 ft of upper cabinets — did you include crown molding?")
- Suggest related items based on measurements & room type
- Generate professional project plans
- Highlight potential design/material recommendations

---

## 🏗️ Tech Stack & Architecture

### Stack (Locked — Do Not Change)
| Layer | Choice | Status |
|---|---|---|
| Framework | React 19 + TypeScript | ✅ In use |
| Build Tool | Vite | ✅ In use |
| Routing | React Router v7 | ✅ In use |
| State | Zustand | ✅ In use |
| Storage (Phase 1) | localStorage (offline cache) | ✅ In use |
| Forms | Plain controlled components | ✅ In use (React Hook Form/Zod deferred) |
| Styling | Custom CSS (dark mode, brand tokens) | ✅ In use |
| Backend (Phase 5) | Supabase (PostgreSQL + Auth + Storage) | ✅ In use |
| Auth (Phase 5) | Supabase email/password | ✅ In use |
| Photos (Phase 5) | Supabase Storage + IndexedDB cache | ✅ In use |
| PDF Export | react-pdf or jsPDF | 🔲 TBD (Sprint 6) |
| Mobile | React Native or PWA | 🔲 TBD (Sprint 7) |

### Key Files & Their Purposes

```
src/
├── App.tsx                      # Route definitions + Layout wrapper
├── types/index.ts              # ALL TypeScript interfaces (Assessment, JobInstance, etc.)
├── store/assessmentStore.ts    # Zustand state + localStorage persistence
├── utils/
│   ├── calculations.ts         # formatDate, sq ft calc, etc.
│   ├── estimateEngine.ts       # Auto-generate line items from measurements
│   ├── defaultPriceGuide.ts    # Seed data for 7 price categories
│   └── photoStorage.ts         # IndexedDB photo save/load/delete
├── components/                 # Reusable UI components
│   ├── PhotosTab.tsx           # Unified photo interface (dropdown-based, all job types)
│   ├── PhotoItem.tsx           # Individual photo with take/upload/delete options
│   ├── CameraModal.tsx         # Device camera capture + preview
│   ├── CustomPhotosSection.tsx # Legacy custom photos (deprecated, use PhotosTab)
│   └── ...                     # Toggle, MeasInput, WallSection, etc.
├── pages/
│   ├── Dashboard.tsx           # Home: assessment list + stats
│   ├── CustomerInfoPage.tsx    # Client info + team member assignment
│   ├── JobTypePage.tsx         # Add/remove jobs to an assessment
│   ├── AssessmentDetail.tsx    # Main form: routes to Kitchen/Bathroom/Flooring/Other/RoomTemplate
│   ├── SummaryView.tsx         # Read-only report of all data
│   ├── EstimatePage.tsx        # Generate/view/edit estimates
│   ├── PriceGuidePage.tsx      # Edit costs + markups
│   ├── GalleryPage.tsx         # Cabinet styles + swatches
│   ├── kitchen/                # Kitchen-specific measurements + questions; uses PhotosTab for photos
│   ├── bathroom/               # Bathroom-specific measurements + questions; uses PhotosTab for photos
│   ├── flooring/               # Flooring-specific measurements + questions; uses PhotosTab for photos
│   ├── painting/               # Painting measurements + questions; uses PhotosTab for photos
│   ├── living-room/            # Living room template; uses PhotosTab for photos
│   ├── bedroom/                # Bedroom template; uses PhotosTab for photos
│   ├── deck/                   # Deck template; uses PhotosTab for photos
│   ├── other/                  # "Other" job type (free-text tabs)
│   └── forms/                  # LEGACY: Unused, safe to delete
├── index.css                   # All styles + CSS variables
└── main.tsx                    # React entry point
```

### Data Model (localStorage)

```typescript
// Root store object (key: "maximus-estimus-v3")
{
  assessments: Assessment[],
  teamMembers: string[],
  priceGuide: PriceCategory[],
  markupSettings: { laborMarkup: number, materialMarkup: number }
}

// Assessment shape
{
  id: string,
  status: "draft" | "in-progress" | "complete",
  createdAt: string,
  updatedAt: string,
  client: {
    firstName: string,
    lastName: string,
    address: string,
    phone: string,
    email: string,
    visitDate: string,
    teamMember: string,
    notes: string
  },
  jobs: JobInstance[]  // Array of jobs (Kitchen + Bathroom + Flooring, etc.)
}

// JobInstance shape
{
  id: string,
  type: "Kitchen" | "Bathroom" | "Flooring" | "Other" | "LivingRoom" | "Bedroom" | "Deck",
  label: string,        // e.g., "Main Kitchen", "Master Bath"
  kitchen?: KitchenAssessment,
  bathroom?: BathroomAssessment,
  flooring?: FlooringAssessment,
  other?: OtherAssessment,
  livingRoom?: LivingRoomAssessment,  // NEW
  bedroom?: BedroomAssessment,        // NEW
  deck?: DeckAssessment,              // NEW
  estimate?: EstimateData
}
```

### Zustand Store Actions

**Core Assessment Actions:**
- `createAssessment()` → string (id)
- `deleteAssessment(id)` → void
- `getAssessment(id)` → Assessment | undefined
- `updateAssessment(id, partial)` → void
- `setStatus(id, status)` → void

**Job Management:**
- `addJob(assessmentId, type, label)` → void
- `removeJob(assessmentId, jobId)` → void
- `updateJobKitchen(assessmentId, jobId, kitchen)` → void
- `updateJobBathroom(assessmentId, jobId, bathroom)` → void
- `updateJobFlooring(assessmentId, jobId, flooring)` → void
- `updateJobOther(assessmentId, jobId, other)` → void
- `updateJobLivingRoom(assessmentId, jobId, livingRoom)` → void  // NEW
- `updateJobBedroom(assessmentId, jobId, bedroom)` → void  // NEW
- `updateJobDeck(assessmentId, jobId, deck)` → void  // NEW

**Team Management:**
- `addTeamMember(name)` → void
- `removeTeamMember(name)` → void

**Estimate Management:**
- `updateEstimate(assessmentId, jobId, estimate)` → void
- `updateMarkupSettings(labor, material)` → void

**Price Guide Management:**
- `updatePriceGuide(categories)` → void
- `resetPriceGuide()` → void

### Photos Storage

- **Format:** Blob objects stored in IndexedDB (100MB+ capacity)
- **Key structure:** `assessment-[id]-job-[jobId]`
- **Photo field:** Changed from boolean to string (`photoId` or empty string)
- **Retrieve:** `photoStorage.ts` exports `getPhoto(assessmentId, jobId, photoId)` → Promise<Blob>
- **Save:** Camera modal calls `savePhoto(assessmentId, jobId, blob)` → Promise<string> (returns photoId)
- **Delete:** `deletePhoto(assessmentId, jobId, photoId)` → Promise<void>

### PIN-Based Authentication (May 14 Evening)

**Architecture:**
- Users authenticate via 4-12 digit PIN, not email/password
- PINs are stored in Supabase `pin_users` table
- Each user has: `id`, `first_name`, `last_name`, `email`, `pin`, `is_admin`, `created_at`
- Super admins (can delete users): `eddie0816@gmail.com` and `maximusconstructionnj@gmail.com`
- **Key files:**
  - `src/contexts/AuthContext.tsx` — PIN validation, user lookup, sign-in/sign-out, is_admin field
  - `src/pages/LoginPage.tsx` — PIN entry UI with numpad, Unlock button, Create User modal
  - `src/pages/AdminUsersPage.tsx` — Super admin panel to view all users and delete them

**Auth Flow:**
1. User enters PIN on LoginPage
2. AuthContext.signIn() queries Supabase for matching PIN
3. If found, user object (including `isAdmin` flag) stored in localStorage
4. Dashboard shows logged-in user name (top right)
5. If user is admin, "👥 Admin Users" link appears on Dashboard

**Admin Users Page:**
- Accessible only to users with `isAdmin: true`
- Displays all users in a table (Name, Email, PIN, Admin status)
- Super admins can delete users directly
- RLS policy allows public delete (access control enforced by frontend `isAdmin` check)

**Supabase RLS Policies (for Publishable API keys with public role):**
```sql
-- SELECT: Allow public to query all users
create policy "Allow public select"
on public.pin_users for select to public using (true);

-- INSERT: Allow public to create users (with validation)
create policy "Allow public insert"
on public.pin_users for insert to public
with check (
  pin ~ '^[0-9]{4,}' and
  first_name <> '' and
  last_name <> '' and
  email <> ''
);

-- DELETE: Allow public to delete (access control via frontend isAdmin check)
create policy "Allow public delete"
on public.pin_users for delete to public using (true);
```

### Admin Panel MVP (May 14 Evening)

**Features:**
- `/admin/users` route — Super admin user management page
- Users table with columns: Name, Email, PIN, Admin (Y/N), Action (Delete button)
- Loading state and error handling
- Access denied message for non-admin users
- Delete confirmation dialog before removal

**Files Added/Modified:**
- `src/pages/AdminUsersPage.tsx` — New admin users management page
- `src/pages/Dashboard.tsx` — Added logged-in user display + admin link
- `src/contexts/AuthContext.tsx` — Added `isAdmin` field to PinUser, propagated through all queries
- `src/App.tsx` — Added `/admin/users` route

**To Add Super Admin Status:**
Update Supabase directly:
```sql
update pin_users set is_admin = true where email = 'newadmin@example.com';
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ (check with `node --version`)
- npm 9+ (check with `npm --version`)
- Git

### Google Drive Workaround
⚠️ **Running `npm install` directly from a Google Drive path fails.** Use this workaround:

```bash
# 1. Install in a temp location
cd C:\Users\Eddie\AppData\Local\Temp\maximus-estimus-setup
npm install

# 2. Copy node_modules to the project
xcopy /E /I node_modules "g:\My Drive\Maximus Digital Marketing\Maximus Estimus\node_modules"

# 3. Start the dev server (from the project root)
cd "g:\My Drive\Maximus Digital Marketing\Maximus Estimus"
npm run dev
```

### Available Commands
```bash
npm run dev        # Start Vite dev server (http://localhost:5173)
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

### Data Persistence
- **Key:** `maximus-estimus-v3` (localStorage)
- **Photos:** IndexedDB (separate from localStorage)
- **Reset:** Open DevTools → Application → LocalStorage → Delete the key, refresh page

---

## 🔍 Important Implementation Details

### Per-Wall Soffit Override
- Global soffit can be overridden per wall
- "Same as wall length" button copies the wall's length into soffit width
- When a wall is renamed, the soffit label updates too

### Additive Wall Length Pieces
- Under each Kitchen/Bathroom Wall Length field, users can add wall pieces one at a time
- Add or Enter appends the next piece, clears the input, and refocuses for fast measuring
- Piece totals display in inches only and automatically populate the main Wall Length field
- Undo last removes the most recent piece without managing a list

### Appliances & Plumbing Per Wall
- Appliances are standalone (location can be on any wall)
- Plumbing (sink) is tied to a specific wall
- Both can be on the same wall

### Island Toggle
- Island is optional (toggle on/off)
- Only appears in Kitchen jobs
- Has 7 collapsible sub-sections: Dimensions, Distance from Walls, Countertop Overhang, Sink, Cooktop, Outlets, Levels
- Features (sink, cooktop, outlets) add yellow collapsible headers when enabled

### Estimate Auto-Generation
- **Kitchen:** Upper/base/tall cabinets, island, countertops, backsplash, crown molding, appliances, plumbing
- **Bathroom:** Demo, shower tile (wall+floor), tub, vanity, toilet, heated floor
- **Flooring:** Material, install, demo, underlayment, stair nosing
- Each line item can be manually overridden (labor + material cost, or clear to regenerate)
- Estimate locks when user approves it

### Photo Checklist Conditional Logic
- Photos gated by toggles (Island, Desk, Existing Cabinets, etc.)
- If a section is toggled OFF, its photo checklist items disappear
- Progress counter shows "X / Y captured" (only counts gated sections that are ON)
- Camera modal shows on tap, preview before save, keep/retake buttons

### Summary View
- Completely read-only
- Shows all data consolidated from all jobs in the assessment
- "Edit" buttons link back to AssessmentDetail for quick fixes
- Print-friendly CSS (hides nav, buttons, etc.)
- Estimate hero shows customer-facing total (labor + materials)

---

## ⚠️ Known Issues & Quirks

### ✅ Data Sync: 403 Forbidden Live Site Bug (FIXED — May 15, 2026)
**Issue:** Live site couldn't pull data from Supabase (403 Forbidden errors).

**Root Cause:** Missing PostgreSQL table-level permissions. RLS policies were set up, but the `authenticated` and `anon` roles didn't have `SELECT` permission on the tables.

**Fix:** Ran GRANT statements in Supabase:
```sql
GRANT SELECT ON public.assessments TO authenticated;
GRANT SELECT ON public.team_members TO authenticated;
-- ... etc for all data tables
```

**How to prevent:** When adding new Supabase tables, always run GRANT statements after setting up RLS.

**Reference:** See **SUPABASE_RLS_PERMISSIONS_FIX.md** for complete diagnostic guide.

### ✅ PIN Auto-Login UX Bug (FIXED — May 15, 2026)
**Issue:** "PIN Not Found" error message was flashing while typing a PIN.

**Root Cause:** Old error messages from previous attempts weren't being cleared before each auto-check attempt, causing stale errors to persist.

**Fix:** Added `setError('')` at the start of the auto-check timer callback in `src/pages/LoginPage.tsx` (commit `40ac7f9`).

**How it works now:**
- Auto-check silently clears any old errors before attempting validation
- If auto-check succeeds → user navigates away
- If auto-check fails → no error is displayed (silent failure)
- If user clicks "Unlock" button → error is shown if PIN is invalid
- No flashing, clean UX

### Google Drive Path Issue
- `npm install` from Google Drive path fails (see workaround above)
- Not a real issue once node_modules is in place

### Line Ending Warnings (CRLF)
- .gitattributes file normalizes to LF across the repo
- Warnings during commit are harmless but fixed

### Legacy Files (Safe to Delete When Ready)
- `src/pages/forms/` — Old prototype components (ClientForm, RoomForm, etc.)
- Not referenced anywhere in current app

### React Hook Form & Zod Not Wired
- Listed in package.json but not yet in use
- All forms currently use plain React controlled components
- Wire up in Sprint 4 (Admin Panel) if needed

### Estimate Lock
- Once locked, user cannot regenerate from measurements
- Must unlock first (checkbox in estimate page)
- This is intentional — prevents accidental overwrites of manual overrides

### Multi-Job Assessments
- If an assessment has multiple jobs, Assessment Detail shows a job switcher tab row at the top
- Each job has independent data + estimate
- Summary view shows all jobs with clear blue dividers

---

## 🧪 Testing & QA

### Manual Testing Checklist (Always Before Declaring Done)
1. **Create new assessment** → All fields auto-populate correctly
2. **Add multiple jobs** → Each job has independent data
3. **Fill one job completely** → All tabs (Measure/Questions/Photos) save
4. **Take a photo** (mobile or desktop with camera) → Photo saved + appears in summary
5. **Generate estimate** → Line items appear correctly for the job type
6. **Edit estimate** → Manual override works, lock/unlock works
7. **View summary** → All data shows correctly, edit links work
8. **Delete assessment** → Confirmation works, photo deleted from IndexedDB
9. **Reload browser** → All data persists (localStorage + IndexedDB)
10. **Check responsive** → Form works on phone-sized screen (mobile site view in DevTools)

### Browser DevTools Checks
- **Console:** No errors (warnings OK)
- **Application → LocalStorage:** `maximus-estimus-v3` contains correct JSON
- **Application → IndexedDB:** Photos stored with correct assessment/job IDs

### Test Checklist Tool
- `test-checklist.html` in project root — self-contained browser testing tool
- 44 test items with Pass/Fail/Skip, per-item notes, progress tracking, report generator
- Open directly in browser (no server needed)

---

## 📝 Code Style & Conventions

### Naming
- Components: PascalCase (e.g., `KitchenMeasurements.tsx`)
- Functions/variables: camelCase (e.g., `calculateSquareFeet`)
- Store actions: camelCase (e.g., `updateJobKitchen`)
- CSS classes: kebab-case (e.g., `.measurement-input`, `.wall-section`)

### Comments
- **Default:** No comments. Well-named code is self-documenting.
- **Add only if:** The WHY is non-obvious (hidden constraint, subtle invariant, workaround for specific bug)

### Imports
- React hooks at top
- External libs second
- Local components/utils last
- No barrel imports (import from specific file, not index)

### CSS
- Use CSS variables for colors: `var(--primary)`, `var(--accent)`, `var(--text-primary)`
- Mobile-first: desktop styles in media queries
- No Tailwind, no CSS-in-JS (custom CSS only)

### Git Commits
- Imperative: "Add living room template" not "Added feature"
- Short subject line (under 70 chars)
- Reference project spec or task if relevant
- Example: `Add living room template with measurements, questions, photos`

---

## 📞 Contacts & Resources

| Contact | Role | Email |
|---------|------|-------|
| Eddie | Project Lead | eddie0816@gmail.com |

### Important Docs
- **Project Spec:** `project-spcs.md` (master spec of all features)
- **AI Features:** `docs/ai-features.md` (brainstorm for Phase 2 AI estimator)
- **Test Checklist:** `test-checklist.html` (44 test items with report generator)

### Relevant Code
- **Store:** `src/store/assessmentStore.ts` — All state + actions
- **Types:** `src/types/index.ts` — All TypeScript interfaces
- **Estimate Engine:** `src/utils/estimateEngine.ts` — Auto-generation logic
- **Photo Storage:** `src/utils/photoStorage.ts` — IndexedDB photo ops

---

## 🎨 Brand & Design

- **Primary:** Navy Blue `#1F3096`
- **Accent:** Golden Yellow `#F5C42A`
- **Theme:** Dark mode
- **Font:** System stack, body 15px, titles 26px
- **Feel:** Clean, professional, logical, approachable

---

## 📋 Frequently Asked Questions

**Q: How do I add a new room template?**  
A: Create a new folder in `src/pages/` (e.g., `src/pages/living-room/`). Add `LivingRoomMeasurements.tsx`, `LivingRoomQuestions.tsx`, `LivingRoomPhotos.tsx`. Add the type to `JobInstance` in `types/index.ts`. Add store actions `updateJobLivingRoom` to Zustand. Wire into `AssessmentDetail.tsx` and `JobTypePage.tsx`.

**Q: How do I add a new price category?**  
A: Edit `src/utils/defaultPriceGuide.ts`, or add via the Price Guide UI at `/price-guide`. Changes auto-save to localStorage.

**Q: Photos aren't showing up. What do I check?**  
A: 1) Open DevTools → Application → IndexedDB → Check key format. 2) Verify photoId is a string, not empty. 3) Check `photoStorage.ts` for errors.

**Q: How do I test the app on mobile?**  
A: 1) Run `npm run dev`. 2) Find your machine's local IP (check WiFi settings). 3) Visit `http://[YOUR_IP]:5173` from phone on same WiFi. 4) Use Chrome DevTools Device Mode for quick testing.

**Q: Can I deploy this to production?**  
A: Not yet. Phase 1 only uses localStorage (single device). Sprint 5 adds cloud backend. For now, this is a local/field dev tool.

---

## 🔐 Security & Privacy Notes

- **No authentication yet** (Phase 1 is local only)
- **No external API calls** (no cloud uploads, no AI calls)
- **localStorage is readable** by any JS on the page (not a concern for local dev, but address in Sprint 5 backend)
- **Internal cost view** has a privacy modal before showing (good UX pattern to keep)
- **Photos are Blobs in IndexedDB** (not synced anywhere currently)

---

## 🎯 Next Steps for New Developer

1. **Read this file** (you are here ✓)
2. **Read `project-spcs.md`** (detailed spec of every feature)
3. **Clone and set up** (follow the Google Drive workaround above)
4. **Run `npm run dev`** and test the app manually
5. **Look at a completed feature** (e.g., Kitchen Measurements) to understand code patterns
6. **Review the Zustand store** (this is where all state lives)
7. **Start on the next task** (Role-Based Job Visibility, sync hardening, or ask Eddie for clarification)

---

**Good luck! You've got this. 🚀**
