# Canonical Component Locations
## Single Source of Truth for GHXSTSHIP UI Components

**Last Updated:** $(date +%Y-%m-%d)

### ATOMS

#### Button
- **Canonical:** `/packages/ui/src/components/atomic/Button.tsx`
- **Reason:** Enterprise-grade with CVA, 7 variants, 5 sizes, full accessibility
- **Features:** Loading states, icons, compound components (ButtonGroup)
- **Deprecated:**
  - `/packages/ui/src/atoms/Button.tsx` - Basic implementation
  - `/packages/ui/src/unified/Button.tsx` - Redundant
  - `/packages/ui/src/components/normalized/Button.tsx` - Redundant
  - `/packages/ui/src/components/rtl/RTLButton.tsx` - Should be variant
  - `/packages/ui/src/components/ExportButton.tsx` - Should be specialized component

#### Input
- **Canonical:** `/packages/ui/src/components/atomic/Input.tsx`
- **Reason:** Enterprise-grade with CVA, 4 variants, 3 sizes, full features
- **Features:** Label, error, icons, addons, loading, compound components
- **Deprecated:**
  - `/packages/ui/src/atoms/Input.tsx` - Basic implementation
  - `/packages/ui/src/unified/Input.tsx` - Redundant
  - `/packages/ui/src/components/normalized/Input.tsx` - Redundant

#### Checkbox
- **Canonical:** `/packages/ui/src/components/atomic/Checkbox.tsx`
- **Reason:** Most complete implementation
- **Deprecated:**
  - `/packages/ui/src/atoms/Checkbox.tsx` - Basic implementation

#### Textarea
- **Canonical:** `/packages/ui/src/components/atomic/Textarea.tsx`
- **Reason:** Consistent with Input patterns
- **Deprecated:**
  - `/packages/ui/src/atoms/Textarea.tsx` - Basic implementation

#### Typography
- **Canonical:** `/packages/ui/src/components/Heading.tsx`
- **Status:** ✅ Single implementation (no duplicates)

#### Other Atoms (Single Implementations)
- **Avatar:** `/packages/ui/src/components/Avatar.tsx`
- **Badge:** `/packages/ui/src/components/Badge.tsx`
- **Icon:** `/packages/ui/src/components/Icon.tsx`
- **Image:** `/packages/ui/src/components/Image.tsx`
- **Label:** `/packages/ui/src/components/Label.tsx`
- **Link:** `/packages/ui/src/components/Link.tsx`
- **Progress:** `/packages/ui/src/components/Progress.tsx`
- **Separator:** `/packages/ui/src/components/Separator.tsx`
- **Skeleton:** `/packages/ui/src/components/atomic/Skeleton.tsx`
- **Switch:** `/packages/ui/src/components/Switch.tsx`
- **Toggle:** `/packages/ui/src/components/Toggle.tsx`

### MIGRATION STRATEGY

1. **Update all imports** to use canonical components
2. **Mark deprecated components** with JSDoc warnings
3. **Remove deprecated components** after 2-week grace period
4. **Update documentation** with new import paths

