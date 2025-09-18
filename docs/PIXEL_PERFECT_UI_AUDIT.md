# Pixel-Perfect UI Audit Report
Generated: Wed Sep 17 23:38:14 EDT 2025

## Executive Summary
Comprehensive pixel-level audit of the GHXSTSHIP UI layer to identify all design inconsistencies and hardcoded values.

## Audit Categories

### 1. Color System Violations
#### Hardcoded Hex Colors
```
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/.storybook/preview.ts:          value: '#ffffff',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/.storybook/preview.ts:          value: '#0a0a0a',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/.storybook/preview.ts:          value: '#f5f5f5',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      50: '#f0f9ff',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      100: '#e0f2fe',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      200: '#bae6fd',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      300: '#7dd3fc',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      400: '#38bdf8',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      500: '#0ea5e9',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      600: '#0284c7',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      700: '#0369a1',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      800: '#075985',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      900: '#0c4a6e',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      950: '#082f49',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      50: '#f0fdf4',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      500: '#22c55e',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      600: '#16a34a',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      700: '#15803d',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      50: '#fffbeb',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      500: '#f59e0b',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      600: '#d97706',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      700: '#b45309',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      50: '#fef2f2',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      500: '#ef4444',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      600: '#dc2626',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      700: '#b91c1c',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      0: '#ffffff',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      50: '#fafafa',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      100: '#f5f5f5',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      200: '#e5e5e5',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      300: '#d4d4d4',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      400: '#a3a3a3',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      500: '#737373',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      600: '#525252',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      700: '#404040',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      800: '#262626',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      900: '#171717',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:      950: '#0a0a0a',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/index.ts:      primary: '#0066CC',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/index.ts:      secondary: '#6B7280',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/index.ts:      accent: '#F59E0B',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/components/3d/Spatial3D.tsx:        : '#3b82f6',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/components/DataViews/CalendarView.tsx:      color: colorField ? record[colorField] : '#3B82F6',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/components/DataViews/WhiteboardView.tsx:  '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/components/DataViews/WhiteboardView.tsx:  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/components/DataViews/WhiteboardView.tsx:  backgroundColor = '#FFFFFF',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/components/DataViews/WhiteboardView.tsx:    selectedColor: '#000000',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/components/DataViews/WhiteboardView.tsx:    ctx.strokeStyle = '#E5E7EB';
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/components/DataViews/WhiteboardView.tsx:        ctx.fillStyle = element.fill || '#FFEB3B';
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/components/DataViews/WhiteboardView.tsx:          ctx.fillStyle = '#000000';
```
#### Hardcoded RGB/RGBA Colors
```
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/styles/animations.css:  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/UIStateValidator.tsx:    if (backgroundColor === 'transparent' || backgroundColor === 'rgba(0, 0, 0, 0)') {
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/system/DesignSystem.tsx:    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/components/micro-interactions/MicroInteractions.tsx:export function RippleEffect({ children, color = 'rgba(255, 255, 255, 0.6)', duration = 600 }: RippleEffectProps) {
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/components/3d/Card3D.tsx:  glowColor = 'rgba(59, 130, 246, 0.5)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/components/3d/Card3D.tsx:              rgba(255, 255, 255, 0.8) 0%, 
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/components/3d/Card3D.tsx:      glowColor={status === 'active' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'}
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/components/architecture/DesignSystem.tsx:    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/components/architecture/DesignSystem.tsx:    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/components/architecture/DesignSystem.tsx:    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/components/architecture/DesignSystem.tsx:    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/components/architecture/DesignSystem.tsx:    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/UnifiedDesignSystem.tsx:      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/UnifiedDesignSystem.tsx:      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/UnifiedDesignSystem.tsx:      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/UnifiedDesignSystem.tsx:      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/UnifiedDesignSystem.tsx:      sm: '0 1px 3px 0 rgba(139, 92, 246, 0.1)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/UnifiedDesignSystem.tsx:      md: '0 4px 6px -1px rgba(139, 92, 246, 0.1)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/UnifiedDesignSystem.tsx:      lg: '0 10px 15px -3px rgba(139, 92, 246, 0.1)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/UnifiedDesignSystem.tsx:      xl: '0 20px 25px -5px rgba(139, 92, 246, 0.1)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/UnifiedDesignSystem.tsx:      sm: '0 1px 2px 0 rgba(245, 158, 11, 0.1)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/UnifiedDesignSystem.tsx:      md: '0 4px 6px -1px rgba(245, 158, 11, 0.1)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/UnifiedDesignSystem.tsx:      lg: '0 10px 15px -3px rgba(245, 158, 11, 0.1)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/UnifiedDesignSystem.tsx:      xl: '0 20px 25px -5px rgba(245, 158, 11, 0.1)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/tokens/navigation.ts:  --nav-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/tokens/navigation.ts:  --nav-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/tokens/navigation.ts:  --nav-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/tokens/navigation.ts:  --nav-shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/tokens/navigation.ts:  --nav-shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/ui/src/tokens/navigation.ts:  --nav-shadow-focus: 0 0 0 3px rgb(59 130 246 / 0.1);
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/config/tailwind-preset.ts:        soft: '0 1px 2px 0 rgba(0,0,0,0.05), 0 1px 3px 1px rgba(0,0,0,0.05)',
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/packages/config/tailwind-preset.ts:        elevated: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)'
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/apps/web/app/_components/marketing/PerformanceOptimizations.tsx:      background: rgba(255, 255, 255, 0.95);
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/apps/web/app/_components/marketing/AccessibilityEnhancements.tsx:        if (backgroundColor !== 'rgba(0, 0, 0, 0)' && color !== 'rgba(0, 0, 0, 0)') {
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/apps/web/app/globals.css:  --border-glass: rgba(255, 255, 255, 0.18);
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/apps/web/app/globals.css:  --border-glass-strong: rgba(255, 255, 255, 0.25);
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/apps/web/app/globals.css:  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/apps/web/app/globals.css:  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/apps/web/app/globals.css:  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/apps/web/app/globals.css:  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/apps/web/app/globals.css:  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/apps/web/app/globals.css:  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/apps/web/app/globals.css:  --shadow-surface: 0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08);
/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/.backup-colors-20250917-221009/apps/web/app/globals.css:  --shadow-elevated: 0 4px 12px -2px rgb(0 0 0 / 0.12), 0 2px 8px -2px rgb(0 0 0 / 0.08);
```
#### Non-Semantic Tailwind Colors
```
     683
 instances found
```

### 2. Spacing System Violations
#### Hardcoded Pixel Values
```
    2349
 instances found
```
#### Non-Semantic Spacing Classes
```
    4137
 instances found
```

### 3. Border & Radius Violations
#### Hardcoded Border Widths
```
     291
 instances found
```
#### Hardcoded Border Radius
```
    7328
 instances using Tailwind defaults (should use semantic tokens)
```

### 4. Shadow System Violations
#### Non-Semantic Shadows
```
    1448
 instances found
```

### 5. Typography Violations
#### Hardcoded Font Sizes
```
    5772
 instances using Tailwind defaults
```
#### Hardcoded Font Weights
```
    2810
 instances found
```

### 6. Animation & Transition Violations
#### Hardcoded Transitions
```
    3534
 instances found
```
#### Hardcoded Durations
```
    1466
 instances found
```

### 7. State Violations
#### Inconsistent Hover States
```
      24
 instances with hardcoded hover colors
```
#### Inconsistent Focus States
```
      18
 instances with hardcoded focus colors
```

### 8. Component-Level Analysis
#### packages/ui/src/components
```
     114
 component files to normalize
```
#### apps/web/app/_components
```
      78
 component files to normalize
```
#### apps/web/app/(app)/(shell)
```
     303
 component files to normalize
```
#### apps/web/app/(marketing)
```
      43
 component files to normalize
```

## Priority Normalization Areas

### Critical (P0)
1. Color system - Replace all hardcoded colors with semantic tokens
2. Spacing system - Replace all numeric spacing with semantic tokens
3. Typography - Normalize all text styles to design tokens

### High (P1)
1. Border system - Standardize border widths and radii
2. Shadow system - Create semantic shadow scale
3. State management - Normalize hover/focus/active states

### Medium (P2)
1. Animation system - Standardize transitions and durations
2. Icon system - Normalize icon sizes and colors
3. Layout system - Standardize container widths and breakpoints

## Recommended Design Token Structure

```css
:root {
  /* Colors - Semantic */
  --color-background: ...;
  --color-foreground: ...;
  --color-primary: ...;
  --color-secondary: ...;
  --color-accent: ...;
  --color-muted: ...;
  --color-success: ...;
  --color-warning: ...;
  --color-destructive: ...;
  --color-info: ...;
  
  /* Spacing - T-shirt sizes */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;
  --spacing-4xl: 6rem;
  --spacing-5xl: 8rem;
  
  /* Radius - Semantic */
  --radius-none: 0;
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
  
  /* Shadows - Elevation */
  --shadow-sm: ...;
  --shadow-md: ...;
  --shadow-lg: ...;
  --shadow-xl: ...;
  --shadow-2xl: ...;
  
  /* Typography - Scales */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  
  /* Animation - Timing */
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 1000ms;
  
  /* Z-index - Layers */
  --z-base: 0;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 30;
  --z-modal-backdrop: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-tooltip: 70;
  --z-notification: 80;
}
```

## Next Steps
1. Create comprehensive design token system
2. Build automated migration scripts
3. Update all components to use semantic tokens
4. Implement ESLint rules for enforcement
5. Add CI/CD validation
6. Create component library documentation

