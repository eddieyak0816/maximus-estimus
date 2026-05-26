# Job Assignment Feature Migration

## Overview
This migration adds job assignment support to the Maximus Estimus app. It allows admins to assign assessments to team members, who can then see those assignments on their dashboard.

## Changes Made

### Frontend
1. **Assessment Type** (`src/types/index.ts`): Added `assignedToUserId?: string` field
2. **Dashboard** (`src/pages/Dashboard.tsx`): 
   - Updated filtering to show assessments user created OR is assigned to
   - Updated title for non-admins to "My Assessments & Assigned Work"
   - Display assignment badge (e.g., "Created by Eddie → Assigned to John")
3. **CustomerInfoPage** (`src/pages/CustomerInfoPage.tsx`):
   - Added "Assign to Team Member" dropdown (admin-only)
   - Auto-populated from pin_users table
4. **AssessmentDetail** (`src/pages/AssessmentDetail.tsx`):
   - Added reassign dropdown in header (admin-only)
   - Shows current assignment status
   - Allows admin to change assignment anytime
5. **Store** (`src/store/assessmentStore.ts`):
   - Added `assignedToUserId` to empty assessment template
   - Uses existing `updateAssessment` to handle assignments

### Database
Create the migration in Supabase SQL editor:

```sql
-- Migration: Add assignment support to assessments
-- Purpose: Allow admins to assign assessments to team members

-- Add assigned_to_user_id column to assessments table
alter table public.assessments
add column if not exists assigned_to_user_id uuid references public.pin_users(id) on delete set null;
```

## Manual Setup Steps

1. **Apply Supabase Migration:**
   - Go to Supabase Dashboard → Your Project → SQL Editor
   - Create new query
   - Copy & paste the SQL migration above
   - Execute the query
   - Verify: Go to Table Editor → assessments → should see `assigned_to_user_id` column

2. **Test Locally:**
   ```bash
   npm run dev
   ```
   - Log in as admin
   - Create new assessment
   - Set customer info
   - Should see "Assign to Team Member" dropdown
   - Assign to a team member
   - Log out, log in as that team member
   - Should see the assigned assessment on Dashboard

## Testing Checklist

### Local (no Supabase needed initially)
- [ ] Create new assessment → `assignedToUserId` defaults to undefined
- [ ] Admin sees all assessments on Dashboard
- [ ] Regular user sees own + assigned assessments
- [ ] Assignment dropdown appears only for admins on CustomerInfoPage
- [ ] Reassign button works on AssessmentDetail (updates state)

### Supabase Live Testing
- [ ] Run migration in Supabase SQL editor
- [ ] Log in as admin
- [ ] Create assessment + assign to "John"
- [ ] Log out, log in as John
- [ ] Dashboard shows assigned assessment
- [ ] John can open and view the assessment
- [ ] John can edit measurement/photos/etc
- [ ] Log back in as admin
- [ ] Reassign to different team member via dropdown
- [ ] Previous assignee no longer sees it; new assignee sees it
- [ ] Admin always sees both created and assigned assessments
- [ ] Reload browser → assignment persists

## Rollback

If needed, roll back the migration:

```sql
alter table public.assessments
drop column if exists assigned_to_user_id;
```

Then redeploy with the previous code version.

## Notes

- **Backward Compatibility:** Old assessments without `assignedToUserId` work fine (undefined = unassigned)
- **Visibility:** Regular users can only *see* assigned assessments, not delete or change permissions — only creator (admin) can manage
- **Performance:** No query changes needed; filtering happens in-app on existing assessments array
- **RLS Policy:** Current RLS allows anon role to access all assessments (uses app-level access control via isAdmin flag)
