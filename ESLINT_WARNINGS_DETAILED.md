# ESLint Warnings Detailed Report

## Summary
- **Total Warnings**: 122
- **Categories**:
  - react-hooks/exhaustive-deps: 80 warnings
  - @next/next/no-img-element: 35 warnings
  - jsx-a11y/alt-text: 4 warnings
  - Other: 3 warnings

## Remediation Strategy

### Phase 1: Fix Image-Related Warnings (39 warnings)
These are straightforward fixes:
1. Replace `<img>` with Next.js `<Image>` component (35 warnings)
2. Add `alt` attributes to images (4 warnings)

**Action**: Batch replace with proper Next.js Image components

### Phase 2: Fix React Hooks Dependencies (80 warnings)
These require careful analysis:
1. Add missing dependencies to useEffect/useCallback/useMemo
2. Wrap functions in useCallback where appropriate
3. Use functional updates for setState when needed

**Action**: Manual review and fix each occurrence

### Phase 3: Fix Other Warnings (3 warnings)
Miscellaneous warnings that need individual attention.

## Implementation Plan

### Immediate Actions (Can be automated):
1. ✅ Add `Image` import from 'next/image' to files using `<img>`
2. ✅ Replace `<img>` tags with `<Image>` components
3. ✅ Add required `width` and `height` props
4. ✅ Add `alt` attributes to all images

### Manual Review Required:
1. ⚠️ React Hooks exhaustive-deps warnings
   - Each requires understanding the component logic
   - Must ensure no infinite loops are created
   - Must verify correct dependency arrays

## Files Requiring Attention

### High Priority (Multiple Warnings):
- settings/billing/BillingClient.tsx (2 warnings)
- settings/teams/TeamsClient.tsx (2 warnings)
- projects/views/GalleryView.tsx (3 warnings)
- projects/views/TimelineView.tsx (1 warning)
- projects/tasks/TasksClient.tsx (2 warnings)
- projects/risks/RisksClient.tsx (2 warnings)
- projects/locations/LocationsClient.tsx (4 warnings)
- projects/activations/ActivationsClient.tsx (1 warning)
- programming/workshops/WorkshopsClient.tsx (1 warning)
- programming/locations/ProgrammingLocationsClient.tsx (4 warnings)
- programming/itineraries/ProgrammingItinerariesClient.tsx (1 warning)

### Image-Related Files (Need Next.js Image conversion):
- All files with @next/next/no-img-element warnings
- All files with jsx-a11y/alt-text warnings

## Next Steps

1. Create automated script for image conversions
2. Manually fix hooks dependencies with careful testing
3. Verify zero warnings after all fixes
4. Run full build to ensure no regressions
