# Maximus Estimus

Field measurement and job intake app for Maximus Construction NJ LLC. Built for kitchen designers and contractors to guide a site visit end-to-end — capturing measurements, asking the right questions, and building a photo checklist — so an accurate quote can be produced on the spot or back at the office.

---

## Quick Start

> **Important:** The project lives on Google Drive. `npm install` fails from a Google Drive path. Use the workaround below.

```bash
# 1. Install dependencies in a temp location
cd C:\Users\Eddie\AppData\Local\Temp\maximus-estimus-setup
npm install

# 2. Copy node_modules to the project
xcopy /E /I node_modules "g:\My Drive\Maximus Digital Marketing\Maximus Estimus\node_modules"

# 3. Start the dev server (run from the project root)
cd "g:\My Drive\Maximus Digital Marketing\Maximus Estimus"
npm run dev
```

The app opens at `http://localhost:5173`.

Data persists in `localStorage` under the key `maximus-estimus-v3`. Closing and reopening the browser preserves all data.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Routing | React Router v7 |
| State / Persistence | Zustand + localStorage |
| Styling | Custom CSS (dark mode, CSS variables) |
| Storage (current) | localStorage — single device only |

> React Hook Form and Zod are listed in the spec doc but are **not yet wired up**. All forms are plain controlled React components.

---

## File Structure

```
src/
├── App.tsx                        # Route definitions
├── main.tsx                       # App entry point
│
├── types/
│   └── index.ts                   # All TypeScript interfaces
│
├── store/
│   └── assessmentStore.ts         # Zustand store (all state + actions)
│
├── utils/
│   └── calculations.ts            # formatDate and future calc helpers
│
├── components/
│   ├── Layout.tsx                 # App shell (header + nav)
│   ├── StatusBadge.tsx            # Colored status pill
│   ├── Toggle.tsx                 # On/off toggle switch
│   ├── MeasInput.tsx              # Measurement input with ft/in fields
│   ├── CollapseSection.tsx        # Collapsible section wrapper
│   ├── CheckOpt.tsx               # Multiple-choice option button
│   ├── PhotoItem.tsx              # Photo checklist row with camera stub
│   ├── WallSection.tsx            # Full per-wall measurement block
│   ├── FormField.tsx              # (legacy — unused)
│   └── SectionCard.tsx            # (legacy — unused)
│
├── pages/
│   ├── Dashboard.tsx              # Home: assessment list + stats
│   ├── CustomerInfoPage.tsx       # Step 1: client info + team member
│   ├── JobTypePage.tsx            # Step 2: add jobs (Kitchen/Bath/Floor/Other)
│   ├── AssessmentDetail.tsx       # Step 3: per-job tabs (Measure/Questions/Photos)
│   ├── GalleryPage.tsx            # Cabinet style gallery (4 styles, color swatches)
│   ├── PriceGuidePage.tsx         # Edit costs, materials, labor, markups
│   ├── EstimatePage.tsx           # Generate and view job estimates
│   ├── SummaryView.tsx            # Read-only consolidated job data view
│   │
│   ├── kitchen/
│   │   ├── KitchenMeasurements.tsx
│   │   ├── KitchenQuestions.tsx
│   │   └── KitchenPhotos.tsx
│   │
│   ├── bathroom/
│   │   ├── BathroomMeasurements.tsx
│   │   ├── BathroomQuestions.tsx
│   │   └── BathroomPhotos.tsx
│   │
│   ├── flooring/
│   │   ├── FlooringMeasurements.tsx
│   │   ├── FlooringQuestions.tsx
│   │   └── FlooringPhotos.tsx
│   │
│   ├── bedroom/                   # (Room template — in progress)
│   ├── living-room/               # (Room template — in progress)
│   ├── deck/                      # (Room template — in progress)
│   │
│   ├── other/
│   │   └── OtherTabs.tsx          # Free-text notes for custom job types
│   │
│   └── forms/                     # (legacy — unused, safe to delete)
│
└── index.css                      # All styles (CSS variables + component classes)
```

---

## Routes

| URL | Component | Purpose |
|---|---|---|
| `/` | Dashboard | Assessment list + stats |
| `/new` | NewRedirect | Creates assessment, redirects to `/assessment/:id/client` |
| `/assessment/:id/client` | CustomerInfoPage | Client info form |
| `/assessment/:id/type` | JobTypePage | Add/remove jobs |
| `/assessment/:id` | AssessmentDetail | Measurements, Questions, Photos per job (tabbed) |
| `/assessment/:id/summary` | SummaryView | Read-only consolidated job data + estimate hero |
| `/assessment/:id/estimate` | EstimatePage | Generate/view/edit job estimates |
| `/gallery` | GalleryPage | Cabinet style reference |
| `/price-guide` | PriceGuidePage | Edit costs, materials, labor, markup % |

---

## Data Model

Everything is persisted as one JSON object in localStorage under `maximus-estimus-v3`:

```typescript
{
  assessments: Assessment[],
  teamMembers: string[]      // global roster, shown as dropdown in CustomerInfoPage
}
```

### Assessment shape

```typescript
Assessment {
  id: string
  status: 'draft' | 'in-progress' | 'complete'
  createdAt: string          // ISO date string
  updatedAt: string
  client: ClientInfo         // name, address, phone, email, teamMember, visitDate, notes
  jobs: JobInstance[]        // one entry per job added on JobTypePage
  costs: CostEstimate        // legacy stub — not used in current UI
  generalNotes: string
}

JobInstance {
  id: string
  type: 'Kitchen' | 'Bathroom' | 'Flooring' | 'Other'
  label: string              // e.g. "Kitchen", "Main Bath", "Upstairs Bath"
  kitchen: KitchenAssessment // measurements + questions + photos for this job
}
```

> Note: `JobInstance.kitchen` is named `kitchen` even for non-kitchen jobs. Sprint 2 will add `bathroom` and `flooring` sub-objects; the type field on the job will determine which is shown in `AssessmentDetail`.

---

## Key Zustand Actions

| Action | Signature | What it does |
|---|---|---|
| `createAssessment` | `() => string` | Creates and returns new assessment id |
| `updateAssessment` | `(id, partial)` | Shallow-merges fields onto assessment |
| `deleteAssessment` | `(id)` | Removes assessment |
| `setStatus` | `(id, status)` | Updates status |
| `addJob` | `(assessmentId, type, label)` | Appends a new JobInstance |
| `removeJob` | `(assessmentId, jobId)` | Removes a job from the array |
| `updateJobKitchen` | `(assessmentId, jobId, kitchen)` | Replaces kitchen data for one job |
| `addTeamMember` | `(name)` | Adds to global `teamMembers` roster |
| `removeTeamMember` | `(name)` | Removes from roster |
| `getAssessment` | `(id) => Assessment | undefined` | Selector |

---

## What's Built

### ✅ Core Field Workflow (Sprints 1-3 Complete)
- Dashboard with stat cards, assessment list, status dots, job type tags, delete
- Create new assessment flow: Customer Info → Job Type Selection → Assessment Detail
- Customer Info: first/last name, address, phone, email, visit date, notes, team member (dropdown roster)
- Job Type Selection: Kitchen, Bathroom, Flooring, Other, + custom labels
- Multi-job support: each assessment can hold multiple kitchen/bathroom/flooring jobs
- Full assessment detail forms for Kitchen, Bathroom, Flooring, and Other job types
- Cabinet Style Gallery: 4 styles with color swatches and customer link input
- Price Guide: editable cost database by category (labor + material tiers)
- Basic estimate auto-generation from measurements + price guide
- Estimate page: customer-facing view + internal cost view (profit margin, markup settings)
- Status management: draft / in-progress / complete
- localStorage persistence (storage key: `maximus-estimus-v3`)
- Global team member roster

### ✅ Real Photo Capture (May 4, 2026)
- Device camera integration (rear camera on mobile)
- IndexedDB storage (100MB+ capacity)
- Photo preview before save
- Captured photo display in summary view and photo checklists
- Delete capability for photos
- Full multi-job support

### ✅ Summary/Report View (May 3, 2026)
- Read-only consolidated view of all job data
- Customer info, measurements, answers, photo checklist status
- Estimate hero with customer-facing total
- Print-friendly CSS for PDF export
- Edit links for quick gap-checking

### ✅ UX Polish
- Full-width header click to collapse/expand sections
- Collapsible per-wall overrides for ceiling and soffit
- Collapsible appliance, island, and plumbing sections
- Wall rename propagation throughout forms
- Rename walls, see updates everywhere

---

## What's Next (Priority Order)

- **Room Templates** (PRIORITY 1) — Living Room, Bedroom, Deck with pre-built measurement/question/photo checklists
- Admin Panel — Manage job types, price guide, team members, cabinet gallery
- Backend & Cloud Sync — Move from localStorage to Supabase/Firebase
- PDF Export & Email — Professional job reports
- Mobile Apps — iOS and Android (React Native or PWA)

---

## Known Issues / Quirks

- **npm on Google Drive:** Running `npm install` directly in the project path fails. Always install in `C:\Users\Eddie\AppData\Local\Temp\maximus-estimus-setup\` and copy `node_modules` across.
- **Legacy files:** `src/pages/forms/` contains unused components from the original prototype. Safe to delete when ready.
- **React Hook Form & Zod not wired:** These are in package.json but not yet integrated. All forms are currently plain controlled React components. Wire up during Sprint 4 (Admin Panel).
- **Storage:** Still using localStorage for Phase 1. Backend (Supabase/Firebase) will be integrated in Sprint 5.
- **Cloud photo storage:** Photos currently stored in IndexedDB (device only). Will add cloud sync in Sprint 5.

---

## Testing Tool

`test-checklist.html` in the project root is a self-contained browser-based testing checklist with Pass/Fail/Skip toggles, per-item notes, a general notes area, progress tracking, and a report generator. Open it directly in any browser — no server needed.

---

## Brand

- Primary: Navy `#1F3096`
- Accent: Gold `#F5C42A`
- Theme: Dark mode
- Font sizes: body 15px, page-title 26px
- Colors: `--text-primary: #e8edf5`, `--text-secondary: #b0c4de`, `--text-muted: #6a85a5`
