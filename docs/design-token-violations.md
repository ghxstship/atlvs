# Design Token Validation Report

**Generated:** 10/1/2025, 10:50:42 AM

## Summary

| Metric | Count |
|--------|-------|
| Files with Violations | 10 |
| Total Violations | 112 |
| 🔴 Errors | 111 |
| 🟡 Warnings | 1 |
| 🔵 Info | 0 |

## Files with Most Violations

| # | File | Total | Errors | Warnings |
|---|------|-------|--------|----------|
| 1 | `packages/ui/src/components/architecture/DesignSystem.tsx` | 50 | 50 | 0 |
| 2 | `packages/ui/src/system/DesignSystem.tsx` | 35 | 35 | 0 |
| 3 | `packages/ui/src/UnifiedDesignSystem.tsx` | 20 | 20 | 0 |
| 4 | `apps/web/app/(app)/(shell)/dashboard/views/ChartView.tsx` | 1 | 1 | 0 |
| 5 | `apps/web/app/(app)/(shell)/dashboard/views/KanbanView.tsx` | 1 | 0 | 1 |
| 6 | `apps/web/app/(app)/(shell)/finance/transactions/CreateTransactionClient.tsx` | 1 | 1 | 0 |
| 7 | `apps/web/app/(app)/(shell)/people/lib/validations.ts` | 1 | 1 | 0 |
| 8 | `apps/web/app/(app)/(shell)/projects/views/KanbanView.tsx` | 1 | 1 | 0 |
| 9 | `apps/web/app/(app)/(shell)/projects/schedule/views/ScheduleCalendarView.tsx` | 1 | 1 | 0 |
| 10 | `apps/web/app/(app)/(shell)/projects/schedule/views/ScheduleGanttView.tsx` | 1 | 1 | 0 |

## Detailed Violations

### packages/ui/src/components/architecture/DesignSystem.tsx

**Total Violations:** 50

- **Line 14** (error): hex-color
  ```
  50: '#eff6ff',
  ```
  💡 *Use hsl(var(--color-*)) or semantic Tailwind class*

- **Line 15** (error): hex-color
  ```
  100: '#dbeafe',
  ```
  💡 *Use hsl(var(--color-*)) or semantic Tailwind class*

- **Line 16** (error): hex-color
  ```
  200: '#bfdbfe',
  ```
  💡 *Use hsl(var(--color-*)) or semantic Tailwind class*

- **Line 17** (error): hex-color
  ```
  300: '#93c5fd',
  ```
  💡 *Use hsl(var(--color-*)) or semantic Tailwind class*

- **Line 18** (error): hex-color
  ```
  400: '#60a5fa',
  ```
  💡 *Use hsl(var(--color-*)) or semantic Tailwind class*

*...and 45 more violations*

### packages/ui/src/system/DesignSystem.tsx

**Total Violations:** 35

- **Line 87** (error): hex-color
  ```
  50: '#f0f9ff',
  ```
  💡 *Use hsl(var(--color-*)) or semantic Tailwind class*

- **Line 88** (error): hex-color
  ```
  100: '#e0f2fe',
  ```
  💡 *Use hsl(var(--color-*)) or semantic Tailwind class*

- **Line 89** (error): hex-color
  ```
  200: '#bae6fd',
  ```
  💡 *Use hsl(var(--color-*)) or semantic Tailwind class*

- **Line 90** (error): hex-color
  ```
  300: '#7dd3fc',
  ```
  💡 *Use hsl(var(--color-*)) or semantic Tailwind class*

- **Line 91** (error): hex-color
  ```
  400: '#38bdf8',
  ```
  💡 *Use hsl(var(--color-*)) or semantic Tailwind class*

*...and 30 more violations*

### packages/ui/src/UnifiedDesignSystem.tsx

**Total Violations:** 20

- **Line 1528** (error): rgb-color
  ```
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  ```
  💡 *Use HSL with opacity: hsl(var(--color-*) / 0.5)*

- **Line 1529** (error): rgb-color
  ```
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  ```
  💡 *Use HSL with opacity: hsl(var(--color-*) / 0.5)*

- **Line 1530** (error): rgb-color
  ```
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  ```
  💡 *Use HSL with opacity: hsl(var(--color-*) / 0.5)*

- **Line 1531** (error): rgb-color
  ```
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  ```
  💡 *Use HSL with opacity: hsl(var(--color-*) / 0.5)*

- **Line 1538** (error): hex-color
  ```
  primary: '#8b5cf6', // Purple
  ```
  💡 *Use hsl(var(--color-*)) or semantic Tailwind class*

*...and 15 more violations*

### apps/web/app/(app)/(shell)/dashboard/views/ChartView.tsx

**Total Violations:** 1

- **Line 203** (error): hex-color
  ```
  color: config.colors?.[0] || '#3b82f6'
  ```
  💡 *Use hsl(var(--color-*)) or semantic Tailwind class*

### apps/web/app/(app)/(shell)/dashboard/views/KanbanView.tsx

**Total Violations:** 1

- **Line 477** (warning): inline-style
  ```
  {column.icon && <column.icon className="h-icon-xs w-icon-xs" style={{ color: column.color }} />}
  ```
  💡 *Use Tailwind classes or CSS custom properties*

### apps/web/app/(app)/(shell)/finance/transactions/CreateTransactionClient.tsx

**Total Violations:** 1

- **Line 266** (error): hex-color
  ```
  placeholder="e.g., Check #1234, Wire #ABC123"
  ```
  💡 *Use hsl(var(--color-*)) or semantic Tailwind class*

### apps/web/app/(app)/(shell)/people/lib/validations.ts

**Total Violations:** 1

- **Line 96** (error): hex-color
  ```
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #FF0000)')
  ```
  💡 *Use hsl(var(--color-*)) or semantic Tailwind class*

### apps/web/app/(app)/(shell)/projects/views/KanbanView.tsx

**Total Violations:** 1

- **Line 75** (error): hex-color
  ```
  style={{ backgroundColor: column.color || '#6B7280' }}
  ```
  💡 *Use hsl(var(--color-*)) or semantic Tailwind class*

### apps/web/app/(app)/(shell)/projects/schedule/views/ScheduleCalendarView.tsx

**Total Violations:** 1

- **Line 197** (error): hex-color
  ```
  style={{ borderLeftColor: item.color || "#6B7280" }}
  ```
  💡 *Use hsl(var(--color-*)) or semantic Tailwind class*

### apps/web/app/(app)/(shell)/projects/schedule/views/ScheduleGanttView.tsx

**Total Violations:** 1

- **Line 143** (error): hex-color
  ```
  backgroundColor: item.color || "#6B7280",
  ```
  💡 *Use hsl(var(--color-*)) or semantic Tailwind class*

