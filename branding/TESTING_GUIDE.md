# Whitelabel System Testing Guide

## 🧪 Complete Testing Checklist

### Phase 1: Basic Functionality

#### **Test 1: List Brands**
```bash
npm run brand:list
```
**Expected Output:**
```
default
ghxstship
opendeck
```

#### **Test 2: Switch to Default Brand**
```bash
npm run brand:switch default
npm run dev
```
**Verify:**
- [ ] Site loads without errors
- [ ] Default blue theme (#3B82F6)
- [ ] Navigation shows standard labels ("Dashboard", "Projects", etc.)
- [ ] Favicon loads correctly

#### **Test 3: Switch to GHXSTSHIP Brand**
```bash
npm run brand:switch ghxstship
npm run dev
```
**Verify:**
- [ ] Site loads without errors
- [ ] Dark navy theme (#0F172A)
- [ ] Navigation shows custom labels ("Command Center", "Missions", "Crew")
- [ ] ANTON font in headings
- [ ] GHXSTSHIP favicon

### Phase 2: Component Integration

#### **Test 4: Brand Hooks**
Create a test component:
```tsx
'use client';

import { useBrand, useBrandLabel } from '@ghxstship/shared/platform/brand';

export function BrandTest() {
  const { brand } = useBrand();
  const dashboardLabel = useBrandLabel('dashboard');
  
  return (
    <div className="p-md">
      <h1>Brand: {brand?.brand.name}</h1>
      <p>Dashboard Label: {dashboardLabel}</p>
    </div>
  );
}
```

**Verify:**
- [ ] Component renders without errors
- [ ] Shows correct brand name
- [ ] Shows correct labels based on active brand

#### **Test 5: Terminology Replacement**
```tsx
import { useBrandTerminology } from '@ghxstship/shared/platform/brand';

export function TermTest() {
  const t = useBrandTerminology();
  return <p>Create a new {t('project')}</p>;
}
```

**Verify with GHXSTSHIP:**
- [ ] Shows "Create a new mission" (not "project")

**Verify with Default:**
- [ ] Shows "Create a new project"

### Phase 3: Theme System

#### **Test 6: CSS Custom Properties**
Open browser DevTools → Elements → `<html>` → Computed

**Verify CSS variables exist:**
- [ ] `--color-brand-primary`
- [ ] `--color-brand-secondary`
- [ ] `--font-heading`
- [ ] `--font-body`
- [ ] `--spacing-md`
- [ ] `--radius-lg`

#### **Test 7: Theme Colors**
```tsx
import { useBrandColors } from '@ghxstship/shared/platform/brand';

export function ColorTest() {
  const colors = useBrandColors();
  return (
    <div>
      <div style={{ backgroundColor: colors?.primary, height: 50 }}>Primary</div>
      <div style={{ backgroundColor: colors?.accent, height: 50 }}>Accent</div>
    </div>
  );
}
```

**Verify:**
- [ ] Colors change when switching brands
- [ ] No flash of unstyled content

### Phase 4: Domain Detection

#### **Test 8: Middleware Brand Detection**
Add to `/etc/hosts`:
```
127.0.0.1 ghxstship.local
127.0.0.1 atlvs.local
```

Visit `http://ghxstship.local:3000`

**Verify:**
- [ ] GHXSTSHIP brand loads automatically
- [ ] Cookie `brand_id=ghxstship` is set

Visit `http://atlvs.local:3000`

**Verify:**
- [ ] Default brand loads automatically
- [ ] Cookie `brand_id=default` is set

### Phase 5: Brand Creation

#### **Test 9: Create New Brand**
```bash
npm run brand:create testbrand "Test Brand"
```

**Verify:**
- [ ] Creates `branding/config/testbrand.brand.json`
- [ ] Creates asset directories
- [ ] Adds to `brands.json` registry
- [ ] No errors during creation

#### **Test 10: Build New Brand**
```bash
npm run brand:build testbrand
```

**Verify:**
- [ ] Copies config to public directory
- [ ] Creates `.env.branding` with correct brand ID
- [ ] No errors during build

#### **Test 11: Switch to New Brand**
```bash
npm run brand:switch testbrand
npm run dev
```

**Verify:**
- [ ] Site loads with new brand
- [ ] Default theme colors (since config is template)
- [ ] Brand name shows as "Test Brand"

### Phase 6: Server-Side Rendering

#### **Test 12: Server Component Integration**
Create server component:
```tsx
import { getActiveBrand } from '@ghxstship/shared/platform/brand/server';

export default async function TestPage() {
  const brand = await getActiveBrand();
  return <h1>{brand.brand.name}</h1>;
}
```

**Verify:**
- [ ] Renders on server
- [ ] No hydration errors
- [ ] Shows correct brand name

#### **Test 13: Metadata Generation**
Check `<head>`:

**Verify:**
- [ ] Title matches brand SEO config
- [ ] Description matches brand config
- [ ] Favicon URL matches brand assets
- [ ] Theme color matches brand primary

### Phase 7: Performance

#### **Test 14: Load Times**
Using Network tab in DevTools:

**Verify:**
- [ ] Brand config loads < 50ms
- [ ] No duplicate requests
- [ ] Cached on subsequent loads

#### **Test 15: Bundle Size**
```bash
npm run build
```

**Verify:**
- [ ] Brand system adds < 10KB to bundle
- [ ] No unused brand configs in bundle
- [ ] Tree-shaking working correctly

### Phase 8: Edge Cases

#### **Test 16: Invalid Brand**
```bash
npm run brand:switch nonexistent
```

**Expected:**
- [ ] Error message shown
- [ ] Falls back to default brand
- [ ] No app crash

#### **Test 17: Missing Assets**
Remove a logo file, switch brand

**Verify:**
- [ ] Graceful fallback
- [ ] Console warning (not error)
- [ ] App continues to work

#### **Test 18: Malformed Config**
Create invalid JSON in brand config

**Verify:**
- [ ] Build fails with clear error
- [ ] Validation catches issue
- [ ] Helpful error message

### Phase 9: Production Build

#### **Test 19: Production Build**
```bash
npm run brand:build ghxstship
npm run build
npm start
```

**Verify:**
- [ ] Builds without errors
- [ ] All assets copied correctly
- [ ] Brand loads in production mode
- [ ] No console errors

#### **Test 20: Environment Variables**
Set in `.env.production`:
```
NEXT_PUBLIC_BRAND_ID=ghxstship
```

```bash
npm run build
npm start
```

**Verify:**
- [ ] Correct brand loads
- [ ] No middleware needed
- [ ] Cookie set correctly

---

## 🎯 Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ No build errors
- ✅ Proper brand rendering
- ✅ Correct theme application
- ✅ Fast load times
- ✅ Graceful fallbacks

---

## 🐛 Common Issues & Fixes

### Issue: Brand not switching
**Fix:** Clear browser cache and cookies

### Issue: CSS not applying
**Fix:** Check `<style>` tag in `<head>` has theme CSS

### Issue: TypeScript errors
**Fix:** Run `npm run typecheck` to see errors

### Issue: Assets not loading
**Fix:** Check paths in brand config match actual files

### Issue: Domain detection not working
**Fix:** Verify middleware is running and cookie is set

---

## 📊 Test Results Template

```
=== ATLVS Whitelabel System Test Results ===
Date: _______________
Tester: _____________

Phase 1: Basic Functionality
[ ] Test 1: List Brands
[ ] Test 2: Switch Default
[ ] Test 3: Switch GHXSTSHIP

Phase 2: Component Integration
[ ] Test 4: Brand Hooks
[ ] Test 5: Terminology

Phase 3: Theme System
[ ] Test 6: CSS Variables
[ ] Test 7: Theme Colors

Phase 4: Domain Detection
[ ] Test 8: Middleware

Phase 5: Brand Creation
[ ] Test 9: Create Brand
[ ] Test 10: Build Brand
[ ] Test 11: Switch New Brand

Phase 6: Server-Side
[ ] Test 12: Server Components
[ ] Test 13: Metadata

Phase 7: Performance
[ ] Test 14: Load Times
[ ] Test 15: Bundle Size

Phase 8: Edge Cases
[ ] Test 16: Invalid Brand
[ ] Test 17: Missing Assets
[ ] Test 18: Malformed Config

Phase 9: Production
[ ] Test 19: Production Build
[ ] Test 20: Environment Vars

OVERALL STATUS: _______________
NOTES: _________________________
```

---

**Ready to test your whitelabel system!** 🧪
