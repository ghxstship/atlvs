# Warning Fix Progress Report

## Current Status
- **Total Warnings:** 124 (down from 146)
- **Errors:** 4 (pre-existing TypeScript errors, not related to hook fixes)
- **Fixed:** 22 warnings (3 ARIA + 19 Hook dependencies)
- **Progress:** 15.1% complete
- **Status:** Manual file-by-file approach working; some files require IDE-based fixes

## Fixes Applied

### Phase 1: ARIA Attributes ✅
- Fixed 3 invalid `aria-` attributes
  - `ProgrammingRidersListView.tsx`
  - `ProgrammingWorkshopsListView.tsx`
  - `ProgrammingSpacesListView.tsx`

### Phase 2: React Hook Dependencies (In Progress) 
**Completed fixes:**
- Fixed `setSelectedCards` in `assets/views/CardView.tsx` (2 functions)
- Fixed `setSelectedCards` in `assets/views/KanbanView.tsx` (1 function)
- Fixed `setSelectedItems` in `assets/views/ListView.tsx` (2 functions)  
- Fixed `setExpandedGroups` in `assets/views/ListView.tsx` (1 function)
- Fixed `setSelectedRows` in `assets/views/TableView.tsx` (2 functions)
- Fixed `setFilters`, `setFrozenColumns`, `setColumnWidths` in `files/views/TableView.tsx` (3 functions)
- Fixed `setFilters` in `jobs/overview/JobsClient.tsx` (3 functions)
- Fixed `setFormData`, `setFormErrors`, `setSelectedContactId` in `profile/emergency/EmergencyClient.tsx` (1 function)
- Fixed `setFormData`, `setFormErrors` in `profile/contact/ContactClient.tsx` (1 function)
- Fixed `setSelectedItineraries` in `programming/itineraries/ProgrammingItinerariesClient.tsx` (1 useEffect)
- Fixed `setSelectedLineups` in `programming/lineups/ProgrammingLineupsClient.tsx` (1 useEffect)
- Fixed `setSelectedPerformances` in `programming/performances/ProgrammingPerformancesClient.tsx` (1 useEffect)
- Fixed `loadAuditLogs` in `files/drawers/HistoryDrawer.tsx` (wrapped in useCallback + added to useEffect)
- **Total fixed:** 19 Hook dependency warnings

**Pattern:** Adding stable `setState` functions to `useCallback` dependency arrays is safe and correct.

## Remaining Warnings (124 total)

### React Hooks - exhaustive-deps (~110 warnings)
**setSelected* warnings requiring manual IDE fixes (13 files):**
- `projects/activations/ActivationsClient.tsx` – lines 240, 252, 255, 258, 263
- `projects/inspections/InspectionsClient.tsx` – lines 305, 317, 320, 323, 328
- `projects/locations/LocationsClient.tsx` – lines 280, 292, 295, 298, 303
- `projects/risks/RisksClient.tsx` – lines 300, 312
- `travel/itineraries/drawers/*` – various setSelectedItems warnings

**useEffect with missing function dependencies (~90 warnings):**
- `fetchRiders`, `loadData`, `loadAssignments`, `loadBids`, `loadCompliance`, `fetchContracts`, `loadOpportunities`, `loadOverviewData`, `loadRFPs`, etc.
- These require wrapping functions in `useCallback` before adding to deps

### Image Optimization
- ~35-40 warnings about using `<img>` instead of Next.js `<Image>`

## Next Actions Required

1. **Manually fix remaining setSelected warnings** (21 files)
   - Each needs `setSelectedXxx` added to useCallback dependency array
   
2. **Fix useEffect function dependencies** (~80 warnings)
   - Pattern: Functions called in useEffect must be wrapped in useCallback
   - Then add the function name to useEffect deps
   
3. **Convert img tags to Next.js Image** (~35-40 warnings)
   - Import `Image` from `next/image`
   - Replace `<img>` with `<Image>` and add width/height props

## Systematic Approach Status

**Successfully applied:** Manual file-by-file fixes using Edit tool
- Precise edits without side effects
- Zero errors introduced
- Each fix validated immediately

**Challenges encountered:**
- 135+ warnings require significant time investment (estimated 4-6 hours for complete resolution)
- MultiEdit tool can introduce syntax errors with complex edits
- Each file needs careful reading and context understanding
- Remaining fixes follow established patterns but need manual application

**Recommended next steps:**
1. Continue manual fixes for remaining `setSelected*` warnings (16 files, ~30-45 minutes)
   - Use extreme care with Edit tool - must match content EXACTLY
   - Read larger context blocks to ensure precision
   - Revert immediately if syntax errors appear
2. Tackle `useEffect` function dependencies (requires wrapping in useCallback first, ~2-3 hours)
   - More complex - functions must be wrapped in useCallback first
   - Then add function names to useEffect dependency arrays
3. Convert `<img>` to Next.js `<Image>` components (~1-2 hours)
   - Import `Image` from 'next/image'
   - Replace tags and add width/height props

**Critical lessons learned:**
- Edit tool requires PERFECT string matching - even small context issues break files
- Complex edits across multiple lines are error-prone in large client files
- Always verify with Read before Edit
- Revert immediately if errors appear
- Manual fixes are slow but reliable when done carefully
- Some files (ActivationsClient, InspectionsClient, LocationsClient) consistently corrupt with automated tools and require direct IDE editing

## Files Successfully Fixed This Session
1. ✅ `programming/itineraries/ProgrammingItinerariesClient.tsx` – added `setSelectedItineraries` to useEffect
2. ✅ `programming/lineups/ProgrammingLineupsClient.tsx` – added `setSelectedLineups` to useEffect
3. ✅ `programming/performances/ProgrammingPerformancesClient.tsx` – added `setSelectedPerformances` to useEffect
4. ✅ `files/drawers/HistoryDrawer.tsx` – wrapped `loadAuditLogs` in useCallback and added to useEffect

## Files Requiring Manual IDE Fixes (Tool Corruption Issues)
- ❌ `projects/activations/ActivationsClient.tsx` – 5 setter dependencies needed
- ❌ `projects/inspections/InspectionsClient.tsx` – 5 setter dependencies needed
- ❌ `projects/locations/LocationsClient.tsx` – 5 setter dependencies needed
- ❌ `projects/risks/RisksClient.tsx` – 2 setter dependencies needed
- ❌ `files/riders/ProgrammingRidersClient.tsx` – fetchRiders needs useCallback wrap
