# GHXSTSHIP Theme, Opacity & Z-Layer Audit Report

## Issues Identified

### 1. Opacity & Z-Layer Issues
### Files with potential opacity bleeding:
### Files with z-index usage:
### 2. Theme Consistency Violations
### Files with hardcoded colors (should use semantic tokens):
### 3. NavigationDropdown Specific Issues
**Current z-index usage:**
154:          "absolute top-full w-64 z-[var(--z-dropdown)]",
170:            "p-xs shadow-xl z-[calc(var(--z-dropdown)+1)]"
192:              <span className="relative z-10">{child.label}</span>

**Current opacity usage:**
42:            "hover:bg-accent/10 hover:color-accent hover:scale-[1.02]",
45:            pathname.startsWith(item.href) ? "bg-accent/10 color-accent" : "color-foreground"
63:              ? "max-h-96 opacity-100" 
64:              : "max-h-0 opacity-0"
74:                  "hover:bg-accent/10 hover:color-accent hover:translate-x-1",
75:                  "focus:outline-none focus:bg-accent/10 focus:color-accent",
76:                  pathname === child.href ? "bg-accent/10 color-accent" : "color-muted"
159:            ? "opacity-100 translate-y-0 scale-100 visible pointer-events-auto"
160:            : "opacity-0 -translate-y-1 scale-95 invisible pointer-events-none"
179:                "hover:bg-accent/10 hover:color-accent hover:translate-x-1",
180:                "focus:outline-none focus:bg-accent/10 focus:color-accent",
182:                pathname === child.href ? "bg-accent/10 color-accent" : "text-popover-foreground"
191:              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

**Current background usage:**
42:            "hover:bg-accent/10 hover:color-accent hover:scale-[1.02]",
45:            pathname.startsWith(item.href) ? "bg-accent/10 color-accent" : "color-foreground"
74:                  "hover:bg-accent/10 hover:color-accent hover:translate-x-1",
75:                  "focus:outline-none focus:bg-accent/10 focus:color-accent",
76:                  pathname === child.href ? "bg-accent/10 color-accent" : "color-muted"
132:          "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-accent after:transition-all after:duration-200",
168:            "relative rounded-xl border border-border bg-popover text-popover-foreground",
179:                "hover:bg-accent/10 hover:color-accent hover:translate-x-1",
180:                "focus:outline-none focus:bg-accent/10 focus:color-accent",
182:                pathname === child.href ? "bg-accent/10 color-accent" : "text-popover-foreground"
191:              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />


## Recommendations

### 1. Z-Index Scale Implementation
Create comprehensive z-index scale in design system:
```css
--z-base: 1;
--z-dropdown: 10;
--z-sticky: 20;
--z-fixed: 30;
--z-modal-backdrop: 40;
--z-modal: 50;
--z-popover: 60;
--z-tooltip: 70;
--z-notification: 80;
--z-max: 9999;
```

### 2. Opacity & Backdrop Fixes
- Replace transparent backgrounds with solid theme-aware backgrounds
- Add proper backdrop blur/overlay for dropdowns
- Ensure all popover/dropdown content has solid backgrounds

### 3. Theme Consistency Normalization
- Replace all hardcoded colors with semantic tokens
- Light theme: dark text/borders (text-foreground, border-border)
- Dark theme: light text/borders (text-foreground, border-border)
- Use semantic color utilities exclusively

### 4. NavigationDropdown Specific Fixes
- Add solid backdrop with blur effect
- Implement proper z-index hierarchy
- Ensure dropdown content doesn't bleed through
- Add theme-aware solid backgrounds

