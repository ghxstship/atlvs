# Enterprise Overview System - Implementation Guide

## 🚀 Overview

We've created a **normalized, reusable enterprise-grade overview system** that can be used across ALL modules in the GHXSTSHIP platform. This ensures consistency, maintainability, and rapid development of new overview pages.

## 📦 Components Created

### 1. **EnterpriseOverview.tsx**
The main presentation component that renders:
- Metric cards with trends and changes
- Status breakdown with progress bars
- Recent activity timeline
- Quick action buttons
- Custom sections for module-specific content
- Empty states with actions
- Loading states
- Export/refresh/settings actions

### 2. **useEnterpriseOverview.tsx**
A powerful React hook that:
- Loads data from configured tables
- Calculates metrics automatically
- Sets up real-time subscriptions
- Handles error states
- Provides refresh functionality
- Returns formatted data ready for display

### 3. **overviewConfigs.tsx**
Pre-built configurations for modules:
- Projects
- Activations
- Locations
- Inspections
- Files

## 🎯 How to Use

### Method 1: Using Pre-built Configuration

```tsx
"use client";

import EnterpriseOverview from "@/app/_components/shared/EnterpriseOverview";
import { useEnterpriseOverview } from "@/app/_components/shared/useEnterpriseOverview";
import { projectsOverviewConfig } from "@/app/_components/shared/overviewConfigs";

export default function ProjectsOverview({ orgId }: { orgId: string }) {
  const {
    loading,
    metrics,
    statusBreakdown,
    recentActivity,
    quickActions,
    customSections,
    refresh,
  } = useEnterpriseOverview(projectsOverviewConfig, orgId);

  return (
    <EnterpriseOverview
      title="Projects Overview"
      description="Monitor and manage all your projects"
      metrics={metrics}
      statusBreakdown={statusBreakdown}
      recentActivity={recentActivity}
      quickActions={quickActions}
      customSections={customSections}
      onRefresh={refresh}
      loading={loading}
    />
  );
}
```

### Method 2: Custom Implementation (Like ProjectsOverviewEnhanced.tsx)

For more control, you can use the `EnterpriseOverview` component directly with custom data loading logic.

## 🔧 Creating a New Module Overview

### Step 1: Define Configuration

```tsx
const myModuleConfig: OverviewConfig = {
  module: "MyModule",
  tables: {
    main: "my_table",
    tasks: "my_tasks", // optional
    activity: "activity_logs",
  },
  metrics: [
    {
      id: "total",
      title: "Total Items",
      query: (data) => data.main?.length || 0,
      icon: FolderOpen,
      iconColor: "text-primary",
      route: "/mymodule",
    },
    // Add more metrics...
  ],
  statusFields: {
    field: "status",
    values: [
      { value: "active", label: "Active", color: "#10B981", icon: PlayCircle },
      // Add more statuses...
    ],
  },
  quickActions: [
    { id: "new", label: "New Item", icon: Plus, route: "/mymodule?action=create" },
    // Add more actions...
  ],
};
```

### Step 2: Create Overview Component

```tsx
export default function MyModuleOverview({ orgId }: { orgId: string }) {
  const overviewData = useEnterpriseOverview(myModuleConfig, orgId);
  
  return (
    <EnterpriseOverview
      title="My Module Overview"
      {...overviewData}
    />
  );
}
```

### Step 3: Use in Page

```tsx
// app/(app)/(shell)/mymodule/overview/page.tsx
export default async function MyModuleOverviewPage() {
  const orgId = await getOrgId(); // Your auth logic
  
  return <MyModuleOverview orgId={orgId} />;
}
```

## 🎨 Features

### Metric Cards
- Display key metrics with icons
- Show trends (up/down/neutral)
- Percentage changes
- Subtitles for context
- Click actions to navigate

### Status Breakdown
- Visual progress bars
- Color-coded statuses
- Click to filter
- Total count display

### Recent Activity
- Timeline of recent actions
- User attribution
- Relative timestamps
- Click to view details

### Quick Actions
- Icon-based action buttons
- Multiple variants (default, outline, etc.)
- Disabled states
- Responsive grid layout

### Custom Sections
- Add module-specific content
- Flexible rendering
- Optional actions
- Collapsible support (future)

## 📊 Benefits

1. **Consistency**: All overview pages look and behave the same
2. **Maintainability**: Single source of truth for overview UI
3. **Rapid Development**: New overviews in minutes, not hours
4. **Real-time**: Built-in Supabase subscriptions
5. **Responsive**: Works on all screen sizes
6. **Accessible**: WCAG compliant
7. **Performance**: Optimized rendering and data loading
8. **Extensible**: Easy to add new features

## 🔄 Migration Path

To upgrade existing overview pages:

1. Keep existing page as-is for backward compatibility
2. Create new enhanced version using the system
3. Gradually migrate features
4. Switch over when ready
5. Remove old code

## 📈 Metrics Calculation Examples

```tsx
// Simple count
query: (data) => data.main?.length || 0

// Filtered count
query: (data) => data.main?.filter(item => item.status === "active").length || 0

// Sum calculation
query: (data) => {
  const total = data.main?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
  return `$${(total / 1000).toFixed(0)}K`;
}

// Percentage
query: (data) => {
  const completed = data.main?.filter(item => item.status === "completed").length || 0;
  const total = data.main?.length || 0;
  return total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%";
}

// Average
query: (data) => {
  const items = data.main || [];
  if (items.length === 0) return 0;
  const sum = items.reduce((acc, item) => acc + (item.score || 0), 0);
  return Math.round(sum / items.length);
}
```

## 🚦 Status Configuration

```tsx
statusFields: {
  field: "status", // The field to group by
  values: [
    { 
      value: "active",      // Field value
      label: "Active",      // Display label
      color: "#10B981",     // Progress bar color
      icon: PlayCircle      // Status icon
    },
    // Add all possible values
  ],
}
```

## 🎯 Quick Actions

```tsx
quickActions: [
  {
    id: "new",
    label: "New Item",
    icon: Plus,
    route: "/module?action=create",
    variant: "default", // or "outline", "destructive", "secondary"
  },
]
```

## 📝 Custom Sections

```tsx
customSections: [
  {
    id: "recent-items",
    title: "Recent Items",
    description: "Latest additions",
    dataKey: "main", // Which data to use
    renderItem: (item) => (
      <div className="p-sm border rounded">
        <h4>{item.name}</h4>
        <p className="text-sm text-muted">{item.description}</p>
      </div>
    ),
    route: "/module/all",
  },
]
```

## 🔮 Future Enhancements

- [ ] Chart integration (line, bar, pie)
- [ ] Comparison periods (vs last month/year)
- [ ] Goal tracking
- [ ] Alerts and notifications
- [ ] Customizable layouts
- [ ] Saved views
- [ ] Export to PDF/Excel
- [ ] Scheduled reports
- [ ] AI insights
- [ ] Predictive analytics

## ✅ Modules Ready for Migration

All modules can now use this system:
- ✅ Projects
- ✅ Activations  
- ✅ Files
- ✅ Inspections
- ✅ Locations
- ⏳ Tasks
- ⏳ Milestones
- ⏳ Risks
- ⏳ Finance
- ⏳ Companies
- ⏳ People
- ⏳ Jobs
- ⏳ Resources
- ⏳ Procurement
- ⏳ Analytics

## 🎉 Summary

The Enterprise Overview System provides a **production-ready, scalable solution** for creating consistent, feature-rich overview pages across the entire GHXSTSHIP platform. It reduces development time from days to minutes while ensuring a premium user experience.
