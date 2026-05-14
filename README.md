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
│   ├── SummaryView.tsx            # (legacy — not wired to current routes)
│   │
│   ├── kitchen/
│   │   ├── KitchenMeasurements.tsx  # Full kitchen measurement form
│   │   ├── KitchenQuestions.tsx     # 19 kitchen questions
│   │   └── KitchenPhotos.tsx        # Photo checklist (conditional sections)
│   │
│   └── forms/                     # (legacy — unused, safe to delete)
│       ├── ClientForm.tsx
│       ├── RoomForm.tsx
│       ├── CabinetForm.tsx
│       ├── ApplianceForm.tsx
│       ├── MaterialsForm.tsx
│       └── CostForm.tsx
│
└── index.css                      # All styles (CSS variables + component classes)
```

---

## Routes

| URL | Component | Purpose |
|---|---|---|
| `/` | Dashboard | Assessment list |
| `/new` | NewRedirect (in App.tsx) | Creates a new assessment, redirects to `/assessment/:id/client` |
| `/assessment/:id/client` | CustomerInfoPage | Client info form |
| `/assessment/:id/type` | JobTypePage | Add/remove jobs |
| `/assessment/:id` | AssessmentDetail | Measurements, Questions, Photos per job |
| `/gallery` | GalleryPage | Cabinet style reference |

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

## What's Built (Sprint 1 — Complete)

- Dashboard with stat cards, assessment list, status dots, job type tags, delete
- Create new assessment flow: Customer Info → Job Type Selection → Assessment Detail
- Customer Info: first/last name, address, phone, email, visit date, notes, team member (dropdown roster + "Other" + manage panel)
- Job Type Selection: add multiple jobs of any type with custom labels, remove jobs
- Assessment Detail: job switcher (multi-job), tabbed Measure/Questions/Photos per job
- Kitchen Measurements: ceiling height, soffit (global + per-wall override), walls A-D (length, windows, doors, outlets, cabinet notes), appliances, plumbing, island, existing cabinets, desk — all with toggles, collapsible sections, and MeasInput components
- Soffit shortcut button: "= Same as wall length" to copy wall length into soffit width
- Kitchen Questions: 19 questions with CheckOpt multi-choice, dropdowns, date pickers, notes fields
- Kitchen Photos: conditional photo checklist (island/desk/cabinets sections only shown when toggles are ON), progress bar
- Cabinet Style Gallery: 4 styles with color swatches and customer link input
- Status management: draft / in-progress / complete
- localStorage persistence (storage key: `maximus-estimus-v3`)
- Global team member roster with per-assessment assignment

---

## What's Next (Sprint 2)

- Bathroom assessment (measurements, questions, photos)
- Flooring assessment (measurements, questions, photos)
- "Other" job type with free-text name and blank tabs
- Wire `AssessmentDetail` to show bathroom/flooring forms when job type is Bathroom/Flooring

---

## Known Issues / Quirks

- **Photos are stubs:** `PhotoItem` toggles a boolean (`taken: true/false`) but does not open the camera or store an image. Real camera integration is deferred.
- **Legacy files:** `src/pages/forms/` and `src/pages/SummaryView.tsx` are unused leftovers from the original prototype. They are safe to delete.
- **`JobInstance.kitchen`:** Even non-kitchen jobs have a `kitchen` field (it's just unused). When Bathroom/Flooring forms are built, new sibling fields (`bathroom`, `flooring`) should be added to `JobInstance` in `types/index.ts`.
- **npm on Google Drive:** Running `npm install` directly in the project path fails. Always install in `C:\Users\Eddie\AppData\Local\Temp\maximus-estimus-setup\` and copy `node_modules` across.
- **Storage key history:** v1 and v2 keys are abandoned. If a user's data ever disappears after a key bump, a migration script exists in the chat history.

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
