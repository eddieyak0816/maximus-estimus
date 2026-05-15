# Configurable Dropdowns Integration Guide

## Implementation Status

### ✅ COMPLETE
1. **Supabase Schema** (`supabase-dropdowns-setup.sql`)
   - `dropdown_lists` table with 8 categories
   - `dropdown_options` table with default values
   - RLS policies for public read, admin write

2. **Utility Functions** (`src/utils/dropdownManager.ts`)
   - `fetchAllDropdowns()` — fetch all with caching
   - `fetchDropdownList(name)` — fetch single list
   - `addDropdownOption()`, `removeDropdownOption()` — admin operations
   - `getDropdownListsForAdmin()` — for admin UI

3. **Reusable Component** (`src/components/DropdownSelect.tsx`)
   - Supports predefined options + custom values
   - Loading states and error handling
   - Memory-efficient caching

4. **Admin UI** (`src/pages/AdminDropdownsPage.tsx`)
   - View all dropdown categories (sidebar)
   - Add/remove options per category
   - Real-time updates with cache clearing
   - Access control (admin only)

5. **Form Integrations DONE**
   - ✅ **Appliance names** in Kitchen measurements (WallSection.tsx)
   - ✅ **Flooring materials** in Flooring questions
   - ✅ **Transition locations** in Flooring measurements
   - Route: `/admin/dropdowns` added
   - Dashboard link added for admins

---

## Remaining Integrations (Optional Enhancement)

### 🔲 Cabinet Finishes
**Location:** `src/pages/kitchen/KitchenQuestions.tsx`
**Change:** Replace hardcoded cabinet finish options with dropdown
**File line:** Approximately line 50-60 (cabinet material options)

**Implementation:**
```tsx
// Add to imports
import { useEffect, useState } from 'react';
import { fetchDropdownList } from '../../utils/dropdownManager';

// Add to component
const [finishes, setFinishes] = useState<DropdownOption[]>([]);
useEffect(() => {
  fetchDropdownList('cabinet_finishes').then(setFinishes);
}, []);

// Replace hardcoded options with:
{finishes.map(opt => 
  <CheckOpt label={opt.label} ... />
)}
```

### 🔲 Wall Labels (A, B, C, D)
**Location:** `src/pages/kitchen/KitchenMeasurements.tsx`
**Current:** `const WALL_LABELS = ['A','B','C','D']`
**Change:** Fetch from `wall_labels` dropdown

**Note:** This requires passing custom labels through wall renaming logic. More complex than other integrations.

### 🔲 Team Member Dropdown Integration
**Location:** `src/pages/CustomerInfoPage.tsx`
**Current Issue:** Team members stored in Zustand (localStorage), not Supabase

**To implement this properly:**
1. Modify `assessmentStore.ts` to fetch team members from `fetchDropdownList('team_members')` instead of local state
2. Update team member management to use `addDropdownOption()` / `removeDropdownOption()`
3. Requires architectural change from local state to remote source

**Simplified Alternative:**
- Keep team members in Zustand for backward compatibility
- Update CustomerInfoPage to optionally fetch from dropdowns if admin has configured them
- Fall back to Zustand if dropdowns are empty

### 🔲 Special Notes Categories
**Location:** `src/pages/flooring/FlooringQuestions.tsx` & other question pages
**Current:** `const SPECIAL_NOTES_ITEMS = [...]` (hardcoded)
**Change:** Replace with dropdown

### 🔲 Room Names / Room Labels
**Location:** `src/pages/flooring/FlooringMeasurements.tsx` (room.label input)
**Current:** Free text input
**Change:** Add optional dropdown with suggestions, keep custom input fallback

---

## Setup Instructions for Admin

### 1. Run the Supabase Migration
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Paste contents of `supabase-dropdowns-setup.sql`
4. Execute
5. Verify tables and policies are created

### 2. Access Admin Panel
1. Log in as super admin (eddie0816@gmail.com or maximusconstructionnj@gmail.com)
2. Click "🔧 Manage Dropdowns" on Dashboard
3. Select a category to view/edit options
4. Add/remove options as needed

### 3. Options Available by Category
- **appliance_names**: Stove, Refrigerator, Dishwasher, Microwave, etc.
- **flooring_materials**: Hardwood, Tile, Vinyl, Laminate, Carpet, etc.
- **cabinet_finishes**: Oak, Maple, Espresso, White, Natural, Grey
- **wall_labels**: A, B, C, D
- **transition_locations**: Doorway, Threshold, Stairs, Kitchen to Dining, Hallway
- **special_notes_categories**: Warranty, Color Match, Custom Request, Budget Constraint, Timeline Pressure
- **team_members**: (empty initially — add via admin panel or form)
- **room_names**: (empty initially — add via admin panel or use free text)

---

## API Reference

### Fetch Dropdowns
```tsx
import { fetchAllDropdowns, fetchDropdownList } from '../utils/dropdownManager';

// Get all dropdowns
const all = await fetchAllDropdowns();
const applianceNames = all.appliance_names; // DropdownOption[]

// Get single list
const materials = await fetchDropdownList('flooring_materials');
```

### Use in Forms
```tsx
import DropdownSelect from '../components/DropdownSelect';

<DropdownSelect
  listName="appliance_names"
  value={selectedValue}
  onChange={(val) => setSelected(val)}
  placeholder="Select..."
  allowCustom={true}  // Show "Other / Custom" option
/>
```

### Admin Operations
```tsx
import { 
  addDropdownOption, 
  removeDropdownOption,
  getDropdownListsForAdmin 
} from '../utils/dropdownManager';

// Add option
await addDropdownOption('appliance_names', 'Ice Maker', 'Ice Maker');

// Remove option
await removeDropdownOption(optionId);

// Get lists (for admin page)
const lists = await getDropdownListsForAdmin();
```

---

## Testing Checklist

### Setup
- [ ] Run `supabase-dropdowns-setup.sql` successfully
- [ ] Verify `dropdown_lists` table has 8 rows
- [ ] Verify `dropdown_options` table has ~50 rows

### Admin UI
- [ ] Log in as admin
- [ ] See "🔧 Manage Dropdowns" link on Dashboard
- [ ] Open admin dropdowns page
- [ ] View all 8 categories in sidebar
- [ ] Click a category and see its options
- [ ] Add a new option (e.g., "Custom Appliance")
- [ ] Remove the test option
- [ ] Refresh page — options persist

### Form Usage
- [ ] Open Kitchen assessment
- [ ] Add appliance to wall
- [ ] Verify appliance dropdown shows configurable options
- [ ] Select predefined option, verify it saves
- [ ] Select "Other / Custom", type custom appliance, verify it saves
- [ ] Open Flooring assessment
- [ ] Add measurement room with transition
- [ ] Verify transition location dropdown works
- [ ] Test flooring material checkboxes load from dropdown

### Data Persistence
- [ ] Add/edit assessment with dropdown values
- [ ] Refresh page — data persists
- [ ] Delete assessment — data is gone
- [ ] Admin modifies dropdown options
- [ ] Field user sees updated options on next load (due to cache clearing)

---

## Troubleshooting

### Dropdowns not appearing
- Check browser console for errors
- Verify Supabase SQL migration ran successfully
- Ensure you're logged in (dropdowns require auth context)
- Check if list name matches exactly (case-sensitive)

### Custom values not saving
- Verify `allowCustom={true}` is set on DropdownSelect
- Check that "Other / Custom" option appears when expanded
- Look in browser DevTools for network errors during save

### Admin changes not visible to field users
- Cache TTL is 5 minutes — changes appear after 5 min
- Or manually clear cache: `clearDropdownsCache()` after admin changes
- Test by logging in as field user after admin makes change

### Team members dropdown not working
- Team members are currently in Zustand (localStorage)
- To use Supabase dropdowns, need to migrate `assessmentStore.ts`
- Or keep manual management + use dropdowns as optional suggestions

---

## Next Phase: Bulk Integrations

To convert all remaining hardcoded lists to dropdowns:
1. Create a migration script that finds all hardcoded const arrays
2. Map each to a dropdown category
3. Update components systematically
4. Test thoroughly

Or use search & replace:
```
Find: const [A-Z_]+ = \[.{1,500}\];  // Hardcoded list
Replace: const list = await fetchDropdownList('...');  // Dropdown
```

---

**Last Updated:** May 15, 2026
