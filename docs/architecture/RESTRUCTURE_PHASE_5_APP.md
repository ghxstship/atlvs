# Phase 5: App Directory Restructure

## Overview
Reorganize `apps/web/app` for clear feature-based organization and eliminate scattered components.

## Target Structure

```
apps/web/
├── app/
│   ├── (routes)/
│   │   ├── (auth)/              # Auth routes
│   │   ├── (marketing)/         # Public routes
│   │   ├── (app)/               # Protected routes
│   │   │   ├── (shell)/         # Full app shell
│   │   │   └── (chromeless)/    # Minimal UI
│   │   └── (admin)/             # Admin routes
│   │
│   ├── api/
│   │   ├── v1/
│   │   │   ├── _middleware/
│   │   │   └── [modules]/
│   │   └── webhooks/
│   │
│   └── [root files]
│
├── features/                    # Feature modules
│   ├── projects/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types.ts
│   ├── finance/
│   └── [other features]/
│
├── lib/                         # Shared utilities
├── config/                      # App configuration
└── types/                       # Global types
```

## Migration Steps

### Step 1: Consolidate Components
Move app-specific components from `app/_components` to relevant feature modules.

### Step 2: Organize API Middleware
Create shared middleware directory for authentication, RBAC, validation, and error handling.

### Step 3: Feature Modules
Group related components, hooks, and utilities by feature for better cohesion.

## Success Criteria
- ✅ Clear feature-based organization
- ✅ No scattered component directories
- ✅ API middleware centralized
- ✅ Routes properly grouped

## Timeline
- **Day 1-3:** Move components to features
- **Day 4-5:** Reorganize API layer
- **Day 6-7:** Testing and validation
