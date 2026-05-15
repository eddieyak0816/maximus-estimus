# 🏛️ Maximus Estimus — AI Developer Handoff Guide

> **Last Updated:** May 15, 2026 (Evening)  
> **Project Lead:** Eddie (eddie0816@gmail.com)  
> **Status:** Phase 1 Complete + Phase 5 (Cloud Sync) Complete + Admin Panel MVP Live + PIN auto-login bug FIXED ✅ + UI Standardization Complete ✅ + Configurable Dropdowns Complete ✅

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

### 🔲 Next Up (Priority Order)

#### PRIORITY 1: Room Templates (Starting Next)
**Goal:** Add flexibility for non-kitchen jobs (Living Room, Bedroom, Deck).

- [ ] Build 3 room templates with pre-made measurement/question/photo checklists
  - **Living Room:** ceiling height, windows, doors, outlets, flooring notes, lighting notes
  - **Bedroom:** ceiling height, closets, windows, doors, outlets, flooring notes
  - **Deck/Outdoor:** dimensions, height, existing condition, railing, access notes
- [ ] Wire into job type selector (same UX as Kitchen/Bathroom/Flooring)
- [ ] File structure: `src/pages/living-room/`, `src/pages/bedroom/`, `src/pages/deck/`
- **Acceptance Criteria:**
  - User can select "Living Room", "Bedroom", or "Deck" as a job type
  - Each template shows its own measurement form, questions, and photo checklist
  - Data saves independently per room template
  - Summary view displays room template data correctly
  - Photos tied to room template items work (camera integration)

#### 🔲 Role-Based Job Visibility (After Flooring Testing)
**Goal:** Restrict job visibility based on user role.

- [ ] Regular users see only jobs they created/entered
- [ ] Admins see all jobs across the team
- [ ] Dashboard filters assessments by creator (unless user is admin)
- [ ] Modify Dashboard.tsx to check `isAdmin` flag and filter accordingly
- **Acceptance Criteria:**
  - Non-admin user logs in → sees only their own assessments
  - Admin user logs in → sees all team assessments
  - When creating new assessment, creator is automatically recorded
  - Assessments show which user created them (for admin view)

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

#### Sprint 4: Admin Panel
**Goal:** Give owner full control over job types, pricing, team, cabinet gallery.

- [ ] Admin dashboard page (owner access only)
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

#### Phase 2: AI Estimator
**Locked until Phase 1 complete.** Will use Claude API to:
- Auto-populate estimate line items
- Flag missing items (e.g., "You have 14 ft of upper cabinets — did you include crown molding?")
- Suggest related items based on measurements
- Generate professional project plans

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
├── components/                 # Reusable UI components (Toggle, MeasInput, WallSection, etc.)
├── pages/
│   ├── Dashboard.tsx           # Home: assessment list + stats
│   ├── CustomerInfoPage.tsx    # Client info + team member assignment
│   ├── JobTypePage.tsx         # Add/remove jobs to an assessment
│   ├── AssessmentDetail.tsx    # Main form: routes to Kitchen/Bathroom/Flooring/Other/RoomTemplate
│   ├── SummaryView.tsx         # Read-only report of all data
│   ├── EstimatePage.tsx        # Generate/view/edit estimates
│   ├── PriceGuidePage.tsx      # Edit costs + markups
│   ├── GalleryPage.tsx         # Cabinet styles + swatches
│   ├── kitchen/                # Kitchen-specific forms
│   ├── bathroom/               # Bathroom-specific forms
│   ├── flooring/               # Flooring-specific forms
│   ├── other/                  # "Other" job type (free-text tabs)
│   ├── living-room/            # NEW: Room template (in progress)
│   ├── bedroom/                # NEW: Room template (in progress)
│   ├── deck/                   # NEW: Room template (in progress)
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
7. **Start on the next task** (Room Templates Priority 1, or ask Eddie for clarification)

---

**Good luck! You've got this. 🚀**
