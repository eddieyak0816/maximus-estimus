# Offline-First Sync — Critical Issues & Next Steps

**Date:** May 18, 2026  
**Status:** Real-time listener working, but data integrity issues remain  
**Priority:** HIGH — Current implementation can silently lose user data

---

## ✅ What's Working

- Real-time listener subscribed to Supabase changes (`Realtime subscription status: SUBSCRIBED`)
- Connection detection fires on online/offline transitions
- Multi-device data pulls work (both devices see the same Supabase data after refresh)
- Assessments sync between PC and phone when both are online

---

## ❌ Critical Issues Identified

### 1. Offline Changes Lost on Reconnect
**Scenario:** User creates assessment while offline, goes online, real-time fires before push completes.

**Current code flow:**
```
User offline → Creates "Assessment A" (localStorage only)
User goes online → Real-time listener fires
syncFromCloud() runs → Pulls from Supabase (Assessment A not there yet)
Result: Assessment A is LOST from store
```

**Why it happens:** `syncFromCloud()` replaces all data with Supabase without first pushing local changes.

---

### 2. Concurrent User Edits — Silent Data Loss
**Scenario:** Two users edit same assessment simultaneously.

```
User A edits Assessment X, pushes (updatedAt: 10:00)
User B edits Assessment X, pushes (updatedAt: 10:05)
Real-time fires on User A's device
syncFromCloud() pulls Assessment X from Supabase
User A now sees User B's version
User A's changes are LOST — no warning, no merge
```

**Why it happens:** No conflict resolution. Just replaces with Supabase version.

---

### 3. Race Condition — Push Before Pull Not Guaranteed
**Scenario:** User offline, makes changes, reconnects.

```
User goes online
syncOnReconnect() STARTS pushing local changes (async, not awaited)
Real-time listener fires IMMEDIATELY
syncFromCloud() runs and pulls from Supabase
Pull happens BEFORE push completes
Some local changes overwritten before they're sent
Result: Data loss
```

**Why it happens:** No synchronization between syncOnReconnect and real-time listener.

---

### 4. Silent Failures in Push
**Scenario:** Push fails but user doesn't know.

```
syncOnReconnect() calls pushAssessment()
Network error or permission denied
Error caught and logged to console only
No user feedback
syncFromCloud() then pulls old data
User thinks change saved, but it's actually lost
```

**Why it happens:** Errors only logged, not surfaced to user.

---

### 5. Assessment Disappears During Edit
**Scenario:** User viewing assessment, someone deletes it remotely.

```
User editing Assessment X on phone
Administrator deletes Assessment X in Supabase
Real-time fires, syncFromCloud pulls
Assessment X removed from store
UI crashes or shows errors
```

**Why it happens:** No UI state preservation when remote deletion happens.

---

## 🔧 What Needs to Be Fixed

### Root Cause
`syncFromCloud()` uses Supabase as source of truth without first ensuring all local changes are pushed. The real-time listener can fire at any time, creating race conditions.

### Required Changes

#### 1. **Ordered Sync Operations**
```
When reconnecting:
  1. Push all local changes to Supabase (await completion)
  2. THEN pull from Supabase
  3. THEN subscribe to real-time
```

Real-time listener should NOT trigger syncFromCloud alone. It should re-run full syncOnReconnect.

#### 2. **Proper Conflict Resolution**
For concurrent edits:
- Track which user made which change
- Show conflict UI instead of silently losing data
- Let user choose: keep local, keep remote, or merge
- Or: implement 3-way merge (common ancestor + both versions)

#### 3. **Error Handling & User Feedback**
- Push failures should prevent pull
- Show UI banner if sync fails: "Changes not synced - will retry"
- User should know if offline/online status
- Show sync status: "Syncing...", "Synced", "Failed"

#### 4. **Guarantee Push Before Pull**
```typescript
// Current (broken):
const unsubscribe = setupRealtimeListener(() => syncFromCloud());

// Should be:
const unsubscribe = setupRealtimeListener(async () => {
  // First push any local changes
  await syncOnReconnect(assessments);
  // THEN pull fresh data
  await syncFromCloud();
});
```

#### 5. **No More Silent Overwrites**
- If local assessment doesn't exist in Supabase, investigate before deleting
- If timestamps are very close (within 1 second), show conflict UI
- Never silently lose data

---

## 📋 Implementation Steps

### Phase 1: Fix Ordering (Critical)
- [ ] Modify Layout.tsx real-time listener to call syncOnReconnect instead of syncFromCloud
- [ ] Ensure syncOnReconnect completes before real-time pulls
- [ ] Add error handling so failed pushes prevent pulls

### Phase 2: Conflict Detection (Important)
- [ ] When pulling assessment that differs from local (same ID, different data)
- [ ] Check if timestamps are within conflict window (same editor, same second?)
- [ ] Show conflict UI if detected
- [ ] User chooses: local, remote, or manual merge

### Phase 3: User Feedback (Important)
- [ ] Add sync status indicator (UI banner or icon)
- [ ] Show "Syncing...", "Synced", "Failed to sync"
- [ ] Log all sync operations with timestamps
- [ ] Expose offline/online status in UI

### Phase 4: Validation (Nice to Have)
- [ ] Data integrity checks after sync
- [ ] Warn if assessment count changes unexpectedly
- [ ] Audit log of all sync operations

---

## ⚠️ Why This Matters

The current implementation can:
- **Silently lose assessments** created offline
- **Silently overwrite edits** from concurrent users
- **Crash the UI** when remote data changes unexpectedly
- Give users **false confidence** that data is saved when it's not

This is **unacceptable for a production app** handling customer data.

---

## 🎯 Success Criteria

After fixing:
- [ ] Create assessment offline → goes online → assessment appears in Supabase
- [ ] Two users edit same assessment → conflict UI shown (not silent loss)
- [ ] Push fails → user sees error, not false "synced" state
- [ ] Delete remote → UI handles gracefully (not crash)
- [ ] Real-time updates don't lose local pending changes
- [ ] Offline can work for hours, reconnect syncs everything correctly

---

## 📚 Key Files

- `src/components/Layout.tsx` — Real-time listener setup (line 75-85)
- `src/utils/supabaseSync.ts` — syncOnReconnect() and setupRealtimeListener()
- `src/store/assessmentStore.ts` — syncFromCloud() (line 416-440)

---

## 💡 Recommended Approach

Don't think of this as "Supabase data is always right" — think of it as:
- **Offline-first:** Local is source of truth while offline
- **Online-first merge:** When online, merge local + remote with conflict detection
- **User-facing:** Never silently lose data, always ask user when there's ambiguity

This is harder than "just use remote data" but actually correct for a field app.

---

**This is not a nice-to-have. This is a blocker for production use.** Fix the ordering and conflict detection before deploying to field team.
