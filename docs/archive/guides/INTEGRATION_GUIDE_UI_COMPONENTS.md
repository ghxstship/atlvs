# Integration Guide — UI Components
## Using @ghxstship/ui Components in Your Application

**Package:** `@ghxstship/ui`  
**Architecture:** Atomic Design System  
**Status:** ✅ Production Ready

---

## 🎯 Overview

The UI package provides a **complete component library** with:

- ✅ **Atomic Design** — Atoms, Molecules, Organisms, Templates
- ✅ **UnifiedViews** — 6 pre-built data view components
- ✅ **Sidebar System** — Complete navigation with personalization
- ✅ **Design Tokens** — Centralized theming system
- ✅ **Type Safety** — Full TypeScript support
- ✅ **Accessibility** — WCAG 2.2 AA+ compliant

---

## 📦 Installation

Already installed in monorepo. Import from package root:

```typescript
// ✅ Correct - Import from package root
import { Button, Input, Table, Modal } from '@ghxstship/ui';

// ❌ Wrong - Never use deep imports
import { Button } from '@ghxstship/ui/atoms/Button';
import { Input } from '@ghxstship/ui/unified/Input';
```

---

## 🚀 Quick Start

### **1. Basic Component Usage**

```typescript
import { Button, Input, Card } from '@ghxstship/ui';

export function LoginForm() {
  return (
    <Card>
      <Input label="Email" type="email" required />
      <Input label="Password" type="password" required />
      <Button variant="default">Sign In</Button>
    </Card>
  );
}
```

---

### **2. Using UnifiedViews (Data Display)**

```typescript
import { UnifiedListView } from '@ghxstship/ui';

export function ProjectsList({ projects }) {
  return (
    <UnifiedListView
      items={projects}
      columns={[
        { key: 'name', label: 'Project Name' },
        { key: 'status', label: 'Status' },
        { key: 'dueDate', label: 'Due Date' },
      ]}
      onItemClick={(project) => console.log('Clicked:', project)}
      searchable
      filterable
      sortable
    />
  );
}
```

---

### **3. Using Sidebar Navigation**

```typescript
import { Sidebar, SidebarProvider } from '@ghxstship/ui';
import { Home, Users, Briefcase, Settings } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: Home },
  { id: 'people', label: 'People', href: '/people', icon: Users },
  { id: 'projects', label: 'Projects', href: '/projects', icon: Briefcase },
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
];

export function AppLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar items={navItems} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
```

---

## 📚 Component Categories

### **Atoms (Basic Building Blocks)**

| Component | Usage | Import |
|-----------|-------|--------|
| `Button` | Actions, forms | `import { Button } from '@ghxstship/ui'` |
| `Input` | Text input | `import { Input } from '@ghxstship/ui'` |
| `Checkbox` | Boolean input | `import { Checkbox } from '@ghxstship/ui'` |
| `Badge` | Status indicators | `import { Badge } from '@ghxstship/ui'` |
| `Avatar` | User images | `import { Avatar } from '@ghxstship/ui'` |
| `Icon` | Icons | `import { Icon } from '@ghxstship/ui'` |
| `Label` | Form labels | `import { Label } from '@ghxstship/ui'` |
| `Switch` | Toggle input | `import { Switch } from '@ghxstship/ui'` |
| `Progress` | Progress bars | `import { Progress } from '@ghxstship/ui'` |
| `Separator` | Visual dividers | `import { Separator } from '@ghxstship/ui'` |

---

### **Molecules (Composite Components)**

| Component | Usage | Import |
|-----------|-------|--------|
| `Alert` | Notifications | `import { Alert } from '@ghxstship/ui'` |
| `Tabs` | Tab navigation | `import { Tabs } from '@ghxstship/ui'` |
| `Dropdown` | Dropdown menus | `import { Dropdown } from '@ghxstship/ui'` |
| `SearchBox` | Search input | `import { SearchBox } from '@ghxstship/ui'` |
| `Pagination` | Page navigation | `import { Pagination } from '@ghxstship/ui'` |
| `DatePicker` | Date selection | `import { DatePicker } from '@ghxstship/ui'` |
| `FileUpload` | File uploads | `import { FileUpload } from '@ghxstship/ui'` |
| `Tooltip` | Hover tooltips | `import { Tooltip } from '@ghxstship/ui'` |

---

### **Organisms (Complex Components)**

| Component | Usage | Import |
|-----------|-------|--------|
| `Table` | Data tables | `import { Table } from '@ghxstship/ui'` |
| `Modal` | Dialogs | `import { Modal } from '@ghxstship/ui'` |
| `Drawer` | Side panels | `import { Drawer } from '@ghxstship/ui'` |
| `Card` | Content containers | `import { Card } from '@ghxstship/ui'` |
| `Navigation` | Nav menus | `import { Navigation } from '@ghxstship/ui'` |
| `Sidebar` | Side navigation | `import { Sidebar } from '@ghxstship/ui'` |
| `Form` | Complete forms | `import { Form } from '@ghxstship/ui'` |

---

### **UnifiedViews (Data Display)**

| Component | Usage | Import |
|-----------|-------|--------|
| `UnifiedListView` | List display | `import { UnifiedListView } from '@ghxstship/ui'` |
| `UnifiedGridView` | Grid layout | `import { UnifiedGridView } from '@ghxstship/ui'` |
| `UnifiedKanbanView` | Kanban boards | `import { UnifiedKanbanView } from '@ghxstship/ui'` |
| `UnifiedCalendarView` | Calendar | `import { UnifiedCalendarView } from '@ghxstship/ui'` |
| `UnifiedDashboardView` | Dashboards | `import { UnifiedDashboardView } from '@ghxstship/ui'` |
| `UnifiedTimelineView` | Timeline | `import { UnifiedTimelineView } from '@ghxstship/ui'` |

---

## 🛠️ Common Patterns

### **Pattern 1: Forms with Validation**

```typescript
import { Input, Button, Form } from '@ghxstship/ui';
import { useState } from 'react';

export function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation logic
    if (!formData.email.includes('@')) {
      setErrors({ email: 'Invalid email' });
      return;
    }
    // Submit logic
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        required
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

---

### **Pattern 2: Data Table with Actions**

```typescript
import { Table, Button, Badge } from '@ghxstship/ui';

export function UsersTable({ users }) {
  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'default'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Edit</Button>
          <Button size="sm" variant="destructive">Delete</Button>
        </div>
      ),
    },
  ];
  
  return <Table columns={columns} data={users} />;
}
```

---

### **Pattern 3: Modal Dialogs**

```typescript
import { Modal, Button } from '@ghxstship/ui';
import { useState } from 'react';

export function DeleteConfirmation({ itemName, onConfirm }) {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete
      </Button>
      
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Confirm Deletion"
      >
        <p>Are you sure you want to delete "{itemName}"?</p>
        <p className="text-sm text-muted">This action cannot be undone.</p>
        
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
```

---

### **Pattern 4: Sidebar with Nested Navigation**

```typescript
import { Sidebar, SidebarProvider } from '@ghxstship/ui';

const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: Briefcase,
    children: [
      { id: 'active', label: 'Active', href: '/projects/active' },
      { id: 'archived', label: 'Archived', href: '/projects/archived' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    children: [
      { id: 'profile', label: 'Profile', href: '/settings/profile' },
      { id: 'team', label: 'Team', href: '/settings/team' },
    ],
  },
];

export function AppShell({ children }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar 
          items={navItems}
          collapsible
          searchable
          pinnable
        />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
```

---

### **Pattern 5: Kanban Board**

```typescript
import { UnifiedKanbanView } from '@ghxstship/ui';

export function ProjectBoard({ tasks }) {
  const columns = [
    { id: 'todo', label: 'To Do' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'review', label: 'Review' },
    { id: 'done', label: 'Done' },
  ];
  
  const handleDragEnd = (result) => {
    // Handle task movement
    console.log('Task moved:', result);
  };
  
  return (
    <UnifiedKanbanView
      items={tasks}
      columns={columns}
      onDragEnd={handleDragEnd}
      groupBy="status"
      renderCard={(task) => (
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold">{task.title}</h3>
          <p className="text-sm text-muted">{task.description}</p>
        </div>
      )}
    />
  );
}
```

---

## 🎨 Theming & Customization

### **Using Design Tokens**

All components use centralized design tokens:

```typescript
// Components automatically use tokens
<Button variant="default" /> 
// Uses: var(--color-primary), var(--spacing-md), etc.

// Custom styling with tokens
<div className="bg-primary text-primary-foreground p-4 rounded-md">
  Custom themed content
</div>
```

---

### **Component Variants**

Most components support variants:

```typescript
// Button variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon name="plus" /></Button>
```

---

### **Custom Styling**

Use `className` prop with Tailwind:

```typescript
<Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
  Gradient Button
</Button>

<Card className="shadow-xl border-2 border-primary">
  Custom styled card
</Card>
```

---

## 🔌 Integration with Existing Systems

### **With i18n (@ghxstship/i18n)**

```typescript
import { Button, Input } from '@ghxstship/ui';
import { useTranslations } from '@ghxstship/i18n';

export function TranslatedForm() {
  const t = useTranslations('common');
  
  return (
    <form>
      <Input label={t('email')} placeholder={t('emailPlaceholder')} />
      <Input label={t('password')} type="password" />
      <Button>{t('submit')}</Button>
    </form>
  );
}
```

---

### **With Branding (@ghxstship/shared/platform/brand)**

```typescript
import { Button, Card } from '@ghxstship/ui';
import { useBrandColors, BrandLogo } from '@ghxstship/shared/platform/brand';

export function BrandedCard() {
  const colors = useBrandColors();
  
  return (
    <Card style={{ borderColor: colors.primary }}>
      <BrandLogo variant="full" height={40} />
      <Button style={{ backgroundColor: colors.primary }}>
        Branded Action
      </Button>
    </Card>
  );
}
```

---

## ⚡ Performance Optimization

### **Tree Shaking**

Components are tree-shakable by default:

```typescript
// Only imports Button code, not entire library
import { Button } from '@ghxstship/ui';
```

---

### **Code Splitting**

Use dynamic imports for large components:

```typescript
import { lazy, Suspense } from 'react';

const UnifiedKanbanView = lazy(() => 
  import('@ghxstship/ui').then(mod => ({ default: mod.UnifiedKanbanView }))
);

export function ProjectBoard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UnifiedKanbanView {...props} />
    </Suspense>
  );
}
```

---

### **Memoization**

Components use React.memo internally for performance:

```typescript
// Already optimized, no manual memoization needed
<UnifiedListView items={largeDataset} />
```

---

## 🧪 Testing Components

### **Unit Testing**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@ghxstship/ui';

test('button calls onClick when clicked', () => {
  const handleClick = jest.fn();
  
  render(<Button onClick={handleClick}>Click Me</Button>);
  
  const button = screen.getByText('Click Me');
  fireEvent.click(button);
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

---

### **Integration Testing**

```typescript
import { render, screen } from '@testing-library/react';
import { UnifiedListView } from '@ghxstship/ui';

test('list view renders all items', () => {
  const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ];
  
  render(
    <UnifiedListView 
      items={items}
      columns={[{ key: 'name', label: 'Name' }]}
    />
  );
  
  expect(screen.getByText('Item 1')).toBeInTheDocument();
  expect(screen.getByText('Item 2')).toBeInTheDocument();
});
```

---

## 🐛 Troubleshooting

### **Issue: Import not found**

```typescript
// ❌ Wrong - Deep imports deprecated
import { Button } from '@ghxstship/ui/atoms/Button';

// ✅ Correct - Import from package root
import { Button } from '@ghxstship/ui';
```

---

### **Issue: Styles not applying**

```typescript
// Ensure Tailwind is configured
// tailwind.config.ts
export default {
  content: [
    './app/**/*.{ts,tsx}',
    './node_modules/@ghxstship/ui/src/**/*.{ts,tsx}', // Add this
  ],
};
```

---

### **Issue: Type errors**

```typescript
// Ensure @ghxstship/ui is in tsconfig paths
{
  "compilerOptions": {
    "paths": {
      "@ghxstship/ui": ["./packages/ui/src"]
    }
  }
}
```

---

## 📚 API Reference

### **Common Props (All Components)**

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Additional CSS classes |
| `id` | `string` | HTML id attribute |
| `style` | `CSSProperties` | Inline styles |

### **Button Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'destructive' \| 'outline' \| 'ghost' \| 'link'` | `'default'` | Visual variant |
| `size` | `'sm' \| 'default' \| 'lg' \| 'icon'` | `'default'` | Size variant |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state |

### **Input Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `string` | `'text'` | Input type |
| `label` | `string` | - | Input label |
| `error` | `string` | - | Error message |
| `disabled` | `boolean` | `false` | Disabled state |
| `required` | `boolean` | `false` | Required field |

### **UnifiedListView Props**

| Prop | Type | Description |
|------|------|-------------|
| `items` | `T[]` | Data items to display |
| `columns` | `Column[]` | Column definitions |
| `onItemClick` | `(item: T) => void` | Item click handler |
| `searchable` | `boolean` | Enable search |
| `filterable` | `boolean` | Enable filtering |
| `sortable` | `boolean` | Enable sorting |

---

## ✅ Best Practices

1. ✅ **Always import from package root** — Never use deep imports
2. ✅ **Use semantic variants** — `variant="destructive"` for delete buttons
3. ✅ **Provide accessibility props** — `aria-label`, `role`, etc.
4. ✅ **Use UnifiedViews for data** — Don't rebuild data displays
5. ✅ **Leverage design tokens** — Use `className` with Tailwind utilities
6. ✅ **Test components** — Write tests for complex interactions
7. ✅ **Follow TypeScript** — Use provided types for props

---

## 🔗 Additional Resources

- **Component Registry:** `packages/ui/src/COMPONENT_REGISTRY.json`
- **Design Tokens:** `packages/ui/DESIGN_TOKENS.md`
- **Export Patterns:** `EXPORT_PATTERNS.md`
- **Migration Guide:** `MIGRATION_GUIDE_LEGACY_TO_ATOMIC.md`
- **Storybook:** Run `pnpm storybook` in `packages/ui`

---

**Package Status:** ✅ Production Ready  
**Components:** 50+ production-ready components  
**Architecture:** Atomic Design with UnifiedViews
