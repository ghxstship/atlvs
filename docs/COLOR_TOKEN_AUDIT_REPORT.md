# GHXSTSHIP Semantic Color Token Audit Report
Generated: Thu Sep 18 15:26:00 EDT 2025

## Executive Summary
This report identifies all color token violations in the GHXSTSHIP repository where hardcoded colors are used instead of semantic design tokens.

## Key Requirements
1. **Titles/Headers**: Must use foreground color (black), NOT accent color
2. **Gradients**: Must use proper gradient classes with correct application
3. **Badges**: Must use semantic color tokens with proper opacity
4. **Backgrounds**: Must use semantic bg- classes
5. **Borders**: Must use semantic border- classes  
6. **Shadows**: Must use semantic shadow- classes

## Color Token Mapping

### Text Colors (Semantic)
- `text-foreground` - Primary text (black/white based on theme)
- `text-muted-foreground` - Secondary text
- `text-accent` - Accent color text (green)
- `text-primary` - Primary brand color
- `text-destructive` - Error/danger text
- `text-success` - Success text
- `text-warning` - Warning text

### Background Colors (Semantic)
- `bg-background` - Main background
- `bg-muted` - Muted background
- `bg-card` - Card background
- `bg-accent` - Accent background
- `bg-primary` - Primary background
- `bg-destructive` - Error background
- `bg-success` - Success background
- `bg-warning` - Warning background

### Border Colors (Semantic)
- `border-border` - Default border
- `border-accent` - Accent border
- `border-primary` - Primary border
- `border-destructive` - Error border
- `border-success` - Success border
- `border-warning` - Warning border

---

## Violations Found

### 1. Hardcoded Text Colors
Files using hardcoded Tailwind text colors instead of semantic tokens:


### 2. Hardcoded Background Colors
Files using hardcoded Tailwind background colors instead of semantic tokens:


### 3. Hardcoded Border Colors
Files using hardcoded Tailwind border colors instead of semantic tokens:


### 4. Incorrect Title/Header Colors
Files where titles/headers use accent color instead of foreground:

- `backup-20250918-103245/app/(marketing)/company/team/page.tsx` (h tag with accent color)
- `apps/web/app/(marketing)/company/team/page.tsx` (h tag with accent color)

### 5. Gradient Implementation Issues
Files with potential gradient issues:

- `.eslintrc.semantic-tokens.js` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/providers/AdaptiveThemeProvider.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/system/WorkflowSystem.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/system/ComponentSystem.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/system/EnhancementSystem.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/system/LayoutSystem.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/system/ContainerSystem.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/system/CompositePatterns.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/system/GridSystem.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/Sidebar/SidebarNavigation.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/Sidebar/SidebarAnimations.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/3d/Spatial3D.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/Navigation/NavigationVariants.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/DataViews/DatabaseOptimizer.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/DataViews/StateManager.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/DataViews/FormView.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/DataViews/DashboardView.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/DataViews/DatabaseTransactionManager.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/DataViews/DesignTokenValidator.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/DataViews/PerformanceOptimizer.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/architecture/ComponentPatterns.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/voice/VoiceSearch.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/voice/VoiceInterface.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/ai/PredictiveUI.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/WorkflowOptimizer.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/monitoring/DatabaseMonitoringDashboard.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/monitoring/PerformanceMetricsChart.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/Modal.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/components/Toast.tsx` (uses gradient syntax but may lack proper classes)
- `packages/ui/src/UnifiedDesignSystem.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/providers/AdaptiveThemeProvider.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/system/WorkflowSystem.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/system/ComponentSystem.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/system/EnhancementSystem.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/system/LayoutSystem.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/system/ContainerSystem.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/system/CompositePatterns.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/system/GridSystem.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/Sidebar/SidebarNavigation.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/Sidebar/SidebarAnimations.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/3d/Spatial3D.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/Navigation/NavigationVariants.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/DataViews/DatabaseOptimizer.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/DataViews/StateManager.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/DataViews/FormView.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/DataViews/DashboardView.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/DataViews/DatabaseTransactionManager.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/DataViews/DesignTokenValidator.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/DataViews/PerformanceOptimizer.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/architecture/ComponentPatterns.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/voice/VoiceSearch.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/voice/VoiceInterface.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/ai/PredictiveUI.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/WorkflowOptimizer.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/monitoring/DatabaseMonitoringDashboard.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/monitoring/PerformanceMetricsChart.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/Modal.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/components/Toast.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/ui/src/UnifiedDesignSystem.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/app/(app)/(shell)/pipeline/contracting/CreateContractClient.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/app/(app)/(shell)/projects/overview/AutoSeedOnFirstRun.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/app/(app)/(shell)/profile/basic/BasicInfoClient.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/app/(app)/(shell)/companies/contracts/CreateContractClient.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/app/admin/enterprise/settings/page.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/app/(marketing)/security/page.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/app/_components/marketing/MarketingPageClient.tsx` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/app/_components/index.ts` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/app/api/v1/procurement/purchase-orders/route.ts` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/app/api/organizations/[orgId]/demo/route.ts` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/app/api/organizations/[orgId]/profiles/[profileId]/route.ts` (uses gradient syntax but may lack proper classes)
- `backup-20250918-103245/app/api/organizations/[orgId]/profiles/route.ts` (uses gradient syntax but may lack proper classes)
- `apps/web/app/(app)/(shell)/pipeline/contracting/CreateContractClient.tsx` (uses gradient syntax but may lack proper classes)
- `apps/web/app/(app)/(shell)/projects/overview/AutoSeedOnFirstRun.tsx` (uses gradient syntax but may lack proper classes)
- `apps/web/app/(app)/(shell)/profile/basic/BasicInfoClient.tsx` (uses gradient syntax but may lack proper classes)
- `apps/web/app/(app)/(shell)/companies/contracts/CreateContractClient.tsx` (uses gradient syntax but may lack proper classes)
- `apps/web/app/admin/enterprise/settings/page.tsx` (uses gradient syntax but may lack proper classes)
- `apps/web/app/(marketing)/security/page.tsx` (uses gradient syntax but may lack proper classes)
- `apps/web/app/_components/marketing/MarketingPageClient.tsx` (uses gradient syntax but may lack proper classes)
- `apps/web/app/_components/index.ts` (uses gradient syntax but may lack proper classes)
- `apps/web/app/api/v1/procurement/purchase-orders/route.ts` (uses gradient syntax but may lack proper classes)
- `apps/web/app/api/organizations/[orgId]/demo/route.ts` (uses gradient syntax but may lack proper classes)
- `apps/web/app/api/organizations/[orgId]/profiles/[profileId]/route.ts` (uses gradient syntax but may lack proper classes)
- `apps/web/app/api/organizations/[orgId]/profiles/route.ts` (uses gradient syntax but may lack proper classes)
- `apps/web/lib/telemetry.ts` (uses gradient syntax but may lack proper classes)
- `apps/web/lib/animations.ts` (uses gradient syntax but may lack proper classes)

### 6. Hardcoded Shadow Values
Files using hardcoded shadow values instead of semantic tokens:

- `packages/ui/src/components/Navigation/NavigationVariants.tsx`: shadow-lg,shadow-md,shadow-sm,shadow-xl
- `backup-20250918-103245/ui/src/components/Navigation/NavigationVariants.tsx`: shadow-lg,shadow-md,shadow-sm,shadow-xl

### 7. Hardcoded Ring/Focus Colors
Files using hardcoded ring colors instead of semantic tokens:


## Summary Statistics

- **Text Color Violations**:        0 files
- **Background Color Violations**:        0 files
- **Border Color Violations**:        0 files
- **Ring Color Violations**:        0 files
- **Total Files with Violations**: 0 files

## Recommended Actions

1. Run `semantic-color-fix.sh` to automatically fix violations
2. Review gradient implementations for proper class usage
3. Ensure all titles use `text-foreground` not `text-accent`
4. Replace all hardcoded colors with semantic tokens
5. Update shadow utilities to use semantic shadow classes

