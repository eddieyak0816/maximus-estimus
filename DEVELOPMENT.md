# Development Guide — Architecture & Deep Dives

This guide covers technical architecture, data flow, and implementation patterns used in Maximus Estimus.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Flow](#data-flow)
3. [Zustand Store Deep Dive](#zustand-store-deep-dive)
4. [Component Patterns](#component-patterns)
5. [Form Handling](#form-handling)
6. [Photo Storage](#photo-storage)
7. [Estimate Generation](#estimate-generation)
8. [Styling System](#styling-system)
9. [Debugging Tips](#debugging-tips)

---

## Architecture Overview

### Layers

```
┌─────────────────────────────────┐
│      React Router               │  Routes + Navigation
├─────────────────────────────────┤
│      Components                 │  Reusable UI (WallSection, Toggle, etc.)
├─────────────────────────────────┤
│      Pages                      │  Route handlers (Kitchen, Bathroom, etc.)
├─────────────────────────────────┤
│      Zustand Store              │  Centralized state + localStorage
├─────────────────────────────────┤
│      localStorage + IndexedDB    │  Persistence
└─────────────────────────────────┘
```

### Design Principles

- **Single source of truth:** Zustand store is the only source of state
- **Functional components:** No class components
- **Controlled inputs:** All form inputs read from store
- **Immutable updates:** Zustand actions shallow-merge, never mutate
- **No prop drilling:** Use store selectors to avoid passing props down multiple levels

---

## Data Flow

### Creating a New Assessment

```
User clicks "New Job"
         ↓
App.tsx routes to /new
         ↓
createAssessment() in store
  - Generates new ID
  - Creates empty Assessment object
  - Saves to localStorage
  - Returns ID
         ↓
Redirect to /assessment/:id/client
         ↓
CustomerInfoPage renders
         ↓
User fills in client info
  - All onChange handlers call store.updateAssessment()
  - Each call triggers localStorage save
         ↓
User clicks "Next"
         ↓
Route to /assessment/:id/type
```

### Adding a Job to an Assessment

```
User clicks "Add Kitchen"
         ↓
addJob(assessmentId, "Kitchen", "Main Kitchen")
  - Creates new JobInstance { id, type, label, kitchen: {...} }
  - Appends to assessment.jobs array
  - Saves to localStorage
         ↓
User routed to /assessment/:id
  (AssessmentDetail component)
         ↓
AssessmentDetail checks if multi-job
  - If yes: render job switcher tabs at top
  - activeJob = jobs[0] by default
         ↓
Check activeJob.type
  - If "Kitchen": render KitchenMeasurements
  - If "Bathroom": render BathroomMeasurements
  - etc.
```

### Updating Kitchen Measurements

```
User enters wall length
         ↓
onChange → handleWallChange(wallIndex, { length: 24 })
         ↓
Call updateJobKitchen(assessmentId, jobId, {
  ...currentKitchen,
  walls: [
    ...walls.slice(0, wallIndex),
    { ...walls[wallIndex], length: 24 },
    ...walls.slice(wallIndex + 1)
  ]
})
         ↓
Zustand store:
  - Find assessment by ID
  - Find job by ID
  - Replace kitchen data (shallow merge)
  - Persist to localStorage
         ↓
Component re-renders (store subscription)
         ↓
New value appears in form
```

### Saving a Photo

```
User taps photo item
         ↓
PhotoItem renders CameraModal
         ↓
User takes photo with device camera
         ↓
Preview shown with Keep/Retake buttons
         ↓
User clicks Keep
         ↓
savePhoto(assessmentId, jobId, photoBlob)
  - Generate unique ID (UUID)
  - Store Blob in IndexedDB
  - Return photoId string
         ↓
Update store:
  - Set photo field to photoId (was boolean, now string)
  - Save assessment to localStorage
         ↓
Component re-renders
  - Check if photoId is truthy
  - If yes: fetch photo from IndexedDB and display thumbnail
```

---

## Zustand Store Deep Dive

### Store Structure

```typescript
// src/store/assessmentStore.ts

const useStore = create<StoreState>((set, get) => ({
  // State
  assessments: [],
  teamMembers: [],
  priceGuide: [],
  markupSettings: { laborMarkup: 30, materialMarkup: 40 },

  // Actions
  createAssessment: () => { },
  updateAssessment: (id, partial) => { },
  deleteAssessment: (id) => { },
  
  // ... 20+ more actions
}))
```

### Persistence Pattern

```typescript
// Every mutation persists to localStorage immediately

export const useStore = create<StoreState>(
  persist(
    (set, get) => ({
      assessments: [],
      
      createAssessment: () => {
        const newAssessment = { /* ... */ }
        set(state => ({
          assessments: [...state.assessments, newAssessment]
        }))
        // ↑ Zustand's persist middleware auto-saves to localStorage
      }
    }),
    {
      name: 'maximus-estimus-v3',  // localStorage key
      storage: localStorage
    }
  )
)
```

### Action Pattern: Updating a Job

```typescript
// Pattern for all updateJob* actions

updateJobKitchen: (assessmentId: string, jobId: string, kitchen: KitchenAssessment) =>
  set(state => ({
    assessments: state.assessments.map(a =>
      a.id === assessmentId
        ? {
            ...a,
            jobs: a.jobs.map(j =>
              j.id === jobId
                ? { ...j, kitchen }  // ← Only change this job's kitchen
                : j
            )
          }
        : a
    )
  }))
```

### Selectors Pattern

```typescript
// Don't pass down props — use store selectors instead

// ❌ Avoid this (prop drilling)
<KitchenMeasurements assessment={assessment} job={job} />

// ✅ Better: Let component grab its own data
const KitchenMeasurements = () => {
  const assessmentId = useParams().id
  const { assessments } = useStore()
  const assessment = assessments.find(a => a.id === assessmentId)
  // ...
}
```

---

## Component Patterns

### Input Component Pattern (MeasInput)

```typescript
interface MeasInputProps {
  value?: number  // feet
  onChange: (value: number) => void
  label?: string
}

export function MeasInput({ value = 0, onChange, label }: MeasInputProps) {
  // Convert to feet + inches for display
  const feet = Math.floor(value)
  const inches = Math.round((value - feet) * 12)
  
  const handleFeetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFeet = parseFloat(e.target.value) || 0
    onChange(newFeet + (inches / 12))
  }
  
  const handleInchesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInches = parseFloat(e.target.value) || 0
    onChange(feet + (newInches / 12))
  }
  
  return (
    <div>
      <input value={feet} onChange={handleFeetChange} />
      <input value={inches} onChange={handleInchesChange} />
    </div>
  )
}
```

### Collapsible Section Pattern (CollapseSection)

```typescript
interface CollapseSectionProps {
  title: string
  open?: boolean
  onToggle?: (open: boolean) => void
  children: React.ReactNode
}

export function CollapseSection({
  title,
  open = false,
  onToggle,
  children
}: CollapseSectionProps) {
  const [isOpen, setIsOpen] = useState(open)
  
  const handleToggle = () => {
    setIsOpen(!isOpen)
    onToggle?.(!isOpen)
  }
  
  return (
    <div className="collapse-section">
      <div className="collapse-header" onClick={handleToggle}>
        <span>{isOpen ? '▼' : '▲'}</span>
        <h3>{title}</h3>
      </div>
      {isOpen && <div className="collapse-content">{children}</div>}
    </div>
  )
}
```

### Wall Section Pattern (WallSection)

```typescript
interface WallSectionProps {
  wall: Wall
  wallIndex: number
  onUpdate: (wall: Wall) => void
}

export function WallSection({ wall, wallIndex, onUpdate }: WallSectionProps) {
  const handleLengthChange = (length: number) => {
    onUpdate({ ...wall, length })
  }
  
  const handleAddWindow = () => {
    const newWindow = { id: uuid(), width: 0, height: 0, /* ... */ }
    onUpdate({
      ...wall,
      windows: [...wall.windows, newWindow]
    })
  }
  
  return (
    <CollapseSection title={`Wall ${wall.name}`}>
      <MeasInput
        label="Wall Length"
        value={wall.length}
        onChange={handleLengthChange}
      />
      {/* Windows, doors, outlets... */}
    </CollapseSection>
  )
}
```

---

## Form Handling

### Current Approach: Controlled Components

All forms use plain React controlled components (no React Hook Form yet):

```typescript
function KitchenMeasurements() {
  const [kitchen, setKitchen] = useState<KitchenAssessment>(...)
  
  const handleCeilingHeightChange = (height: number) => {
    setKitchen({
      ...kitchen,
      roomGlobals: { ...kitchen.roomGlobals, ceilingHeight: height }
    })
    // Auto-save to store
    updateJobKitchen(assessmentId, jobId, kitchen)
  }
  
  return (
    <MeasInput
      value={kitchen.roomGlobals.ceilingHeight}
      onChange={handleCeilingHeightChange}
    />
  )
}
```

### Future: React Hook Form + Zod

In Sprint 4, migrate to structured validation:

```typescript
const schema = z.object({
  roomGlobals: z.object({
    ceilingHeight: z.number().positive(),
    soffit: z.object({
      present: z.boolean(),
      height: z.number().optional(),
      depth: z.number().optional()
    })
  })
})

const form = useForm<KitchenAssessment>({
  resolver: zodResolver(schema),
  defaultValues: kitchen
})
```

---

## Photo Storage

### IndexedDB Structure

```
Database: maximus-estimus
Store: photos

Keys: `assessment-[assessmentId]-job-[jobId]-[photoId]`
Values: Blob (image file)

Example:
assessment-abc123-job-job1-photo-xyz789 → Blob(image data)
assessment-abc123-job-job2-photo-xyz790 → Blob(image data)
```

### Photo Lifecycle

```typescript
// src/utils/photoStorage.ts

// 1. Save photo
export async function savePhoto(
  assessmentId: string,
  jobId: string,
  blob: Blob
): Promise<string> {
  const photoId = generateId()
  const db = await openDB()
  const key = `assessment-${assessmentId}-job-${jobId}-${photoId}`
  await db.add('photos', blob, key)
  return photoId
}

// 2. Retrieve photo
export async function getPhoto(
  assessmentId: string,
  jobId: string,
  photoId: string
): Promise<Blob | null> {
  const db = await openDB()
  const key = `assessment-${assessmentId}-job-${jobId}-${photoId}`
  return (await db.get('photos', key)) || null
}

// 3. Delete photo
export async function deletePhoto(
  assessmentId: string,
  jobId: string,
  photoId: string
): Promise<void> {
  const db = await openDB()
  const key = `assessment-${assessmentId}-job-${jobId}-${photoId}`
  await db.delete('photos', key)
}

// 4. Display photo (in component)
function PhotoThumbnail({ assessmentId, jobId, photoId }) {
  const [src, setSrc] = useState<string | null>(null)
  
  useEffect(() => {
    getPhoto(assessmentId, jobId, photoId).then(blob => {
      if (blob) setSrc(URL.createObjectURL(blob))
    })
  }, [assessmentId, jobId, photoId])
  
  return src ? <img src={src} alt="photo" /> : null
}
```

---

## Estimate Generation

### Engine Overview

```typescript
// src/utils/estimateEngine.ts

export function generateEstimate(
  assessment: Assessment,
  jobId: string,
  tier: 'low' | 'medium' | 'high',
  priceGuide: PriceGuide,
  markupSettings: MarkupSettings
): EstimateData {
  const job = assessment.jobs.find(j => j.id === jobId)
  
  if (job.type === 'Kitchen') {
    return generateKitchenEstimate(job.kitchen, tier, priceGuide, markupSettings)
  }
  // ... handle other job types
}
```

### Kitchen Estimate Logic

```typescript
function generateKitchenEstimate(
  kitchen: KitchenAssessment,
  tier: 'low' | 'medium' | 'high',
  priceGuide: PriceGuide,
  markup: MarkupSettings
): EstimateData {
  const items: EstimateLine[] = []
  
  // 1. Calculate upper cabinets
  let upperCabinetLinearFeet = 0
  kitchen.walls.forEach(wall => {
    if (wall.existingCabinets?.upper) {
      // Count linear feet of upper cabinets
      upperCabinetLinearFeet += calculateLinearFeet(wall.length)
    }
  })
  
  const cabinets = priceGuide.find(c => c.key === 'upper-cabinets')
  items.push({
    description: `Upper cabinets (${upperCabinetLinearFeet} ft)`,
    quantity: upperCabinetLinearFeet,
    unit: 'linear ft',
    laborCost: cabinets.laborCost * upperCabinetLinearFeet,
    materialCost: cabinets[tier] * upperCabinetLinearFeet,
    // ...
  })
  
  // 2. Calculate countertops
  // ... similar pattern
  
  // 3. Calculate island (if present)
  // ... similar pattern
  
  // 4. Apply markup
  const lineItems = items.map(item => ({
    ...item,
    laborCost: item.laborCost * (1 + markup.laborMarkup / 100),
    materialCost: item.materialCost * (1 + markup.materialMarkup / 100)
  }))
  
  return {
    items: lineItems,
    laborTotal: sum(lineItems.map(l => l.laborCost)),
    materialLow: sum(lineItems.map(l => l.materialCost)),
    // ... medium and high tiers
  }
}
```

### Material Tiers

Each material has three price tiers:

```typescript
{
  key: 'upper-cabinets',
  name: 'Upper Cabinets',
  unit: 'linear ft',
  laborCost: 50,        // $50/ft labor (flat)
  low: 150,             // $150/ft material (budget)
  medium: 225,          // $225/ft material (standard)
  high: 350             // $350/ft material (premium)
}
```

Customer sees range: "Materials: $2,400 – $4,800" (low to high tier)

---

## Styling System

### CSS Variables

```css
/* src/index.css */

:root {
  /* Colors */
  --primary: #1F3096;           /* Navy blue */
  --accent: #F5C42A;            /* Gold */
  
  --bg-primary: #0f1419;
  --bg-secondary: #1a1f27;
  --border-color: #2a3f5f;
  
  --text-primary: #e8edf5;
  --text-secondary: #b0c4de;
  --text-muted: #6a85a5;
  
  --success: #4ade80;
  --error: #ef4444;
  --warning: #f59e0b;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Typography */
  --font-body: 15px;
  --font-title: 26px;
  --font-small: 13px;
}
```

### Component Class Patterns

```css
/* Page layout */
.page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.page-title {
  font-size: var(--font-title);
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

/* Cards and sections */
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.card:hover {
  border-color: var(--accent);
}

/* Form inputs */
.measurement-input {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.measurement-input input {
  width: 80px;
  padding: var(--spacing-sm);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 4px;
  font-size: var(--font-body);
}

.measurement-input input:focus {
  border-color: var(--accent);
  outline: none;
}

/* Buttons */
.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: 4px;
  font-size: var(--font-body);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--accent);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  border-color: var(--accent);
}

/* Responsive */
@media (max-width: 640px) {
  .page-container {
    padding: var(--spacing-md);
  }
  
  .page-title {
    font-size: 20px;
  }
}
```

---

## Debugging Tips

### DevTools — localStorage

```
DevTools → Application → LocalStorage → maximus-estimus-v3
```

Check the stored JSON:

```javascript
// In console
const data = JSON.parse(localStorage.getItem('maximus-estimus-v3'))
console.log(data)  // Pretty-print the entire store

// Find specific assessment
const assessment = data.assessments.find(a => a.id === '...')
console.log(assessment)

// Check photo IDs
const kitchen = assessment.jobs[0].kitchen
console.log(kitchen.photos)  // Should be strings or empty
```

### DevTools — IndexedDB

```
DevTools → Application → IndexedDB → maximus-estimus → photos
```

All photos stored here. Keys should follow pattern: `assessment-xxx-job-xxx-xxx`

### Zustand Store in Console

```javascript
// Subscribe to all state changes
import { useStore } from './store/assessmentStore'

const unsubscribe = useStore.subscribe(state => {
  console.log('Store changed:', state)
})

// Get current state
const state = useStore.getState()
console.log(state.assessments)

// Call an action
useStore.getState().createAssessment()
```

### Photo Issues Debugging

```javascript
// Check if photo exists in IndexedDB
const photo = await getPhoto('assessment-123', 'job-456', 'photo-789')
console.log(photo)  // Should be Blob or null

// Manually clear all photos
const db = await openDB()
const allKeys = await db.getAllKeys('photos')
allKeys.forEach(key => db.delete('photos', key))
```

### Component Re-render Debugging

```typescript
// Add a console.log at the top of your component to see re-renders
const KitchenMeasurements = () => {
  console.log('KitchenMeasurements rendered')
  // ...
}

// Check if subscription is working
const kitchen = useStore(state => {
  console.log('Subscription fired')
  return state.assessments.find(...)?.jobs[0]?.kitchen
})
```

---

## Performance Tips

### Avoid Unnecessary Subscriptions

```typescript
// ❌ Bad: Subscribes to entire store, re-renders on any change
const { assessments, teamMembers, priceGuide } = useStore()

// ✅ Better: Subscribe only to what you need
const assessments = useStore(state => state.assessments)
const assessment = assessments.find(a => a.id === assessmentId)
```

### Memoization (if needed)

```typescript
// For expensive calculations, memoize
const estimate = useMemo(() => {
  return generateEstimate(assessment, jobId, tier, priceGuide, markup)
}, [assessment, jobId, tier, priceGuide, markup])
```

### Lazy Load Photos

```typescript
// Don't load all photos at once in SummaryView
// Load thumbnail only when user scrolls to it (intersection observer)

<PhotoThumbnail
  assessmentId={assessmentId}
  jobId={jobId}
  photoId={photoId}
/>
```

---

## Common Pitfalls

### ❌ Mutating State

```typescript
// ❌ DON'T: Mutate objects directly
kitchen.walls[0].length = 24
updateJobKitchen(assessmentId, jobId, kitchen)

// ✅ DO: Create new objects
updateJobKitchen(assessmentId, jobId, {
  ...kitchen,
  walls: [
    ...kitchen.walls.slice(0, 0),
    { ...kitchen.walls[0], length: 24 },
    ...kitchen.walls.slice(1)
  ]
})
```

### ❌ Async/Await with Photos

```typescript
// ❌ DON'T: Block render on photo load
const photo = getPhoto(...) // This is async!

// ✅ DO: Use useEffect + useState
const [photo, setPhoto] = useState<Blob | null>(null)
useEffect(() => {
  getPhoto(...).then(setPhoto)
}, [])
```

### ❌ Prop Drilling

```typescript
// ❌ DON'T: Pass assessment down 5 levels
<Page assessment={assessment}>
  <Section assessment={assessment}>
    <Card assessment={assessment}>
      <WallCard assessment={assessment} />

// ✅ DO: Use store selectors in each component
const WallCard = () => {
  const assessment = useStore(s => s.assessments.find(...))
}
```

---

**Happy coding! 🚀**
