# CRITICAL MODULE FIX GUIDE
## Step-by-Step Implementation for Finance, Jobs & Pipeline Modules

**Target Modules**: Finance (62%), Jobs (62%), Pipeline (48%)  
**Goal**: Bring all to ≥85% compliance  
**Timeline**: 2 weeks (Phase 1)

---

## STANDARDIZED MODULE STRUCTURE

### Reference Implementation (Use Dashboard/Analytics as template)

```
/module-name/
├── page.tsx                          # Root page with client component
├── types.ts                          # TypeScript definitions
├── ModuleClient.tsx                  # Main client component
├── lib/
│   ├── module-service.ts            # Service layer with API calls
│   └── field-config.ts              # ATLVS field configurations
├── views/
│   ├── ModuleGridView.tsx           # Table/Grid view
│   ├── ModuleKanbanView.tsx         # Kanban board view
│   ├── ModuleCalendarView.tsx       # Calendar view
│   ├── ModuleGalleryView.tsx        # Gallery/Card view
│   ├── ModuleTimelineView.tsx       # Timeline/Gantt view
│   ├── ModuleChartView.tsx          # Analytics/Chart view
│   ├── ModuleFormView.tsx           # Form view
│   └── ModuleListView.tsx           # List view
├── drawers/
│   ├── CreateModuleDrawer.tsx       # Create drawer
│   ├── EditModuleDrawer.tsx         # Edit drawer
│   └── ViewModuleDrawer.tsx         # View drawer
├── create/
│   └── page.tsx                     # Create route
└── [id]/
    ├── page.tsx                     # View route
    └── edit/
        └── page.tsx                 # Edit route
```

---

## FINANCE MODULE REMEDIATION

### Current State Analysis
- ✅ Has: page.tsx (1,211 bytes), types.ts (9,900 bytes), lib/ (10 files), API routes (7 endpoints)
- ❌ Missing: views/, drawers/, create/, [id]/

### Step 1: Create Views Directory (Day 1-2)

#### 1.1 Create FinanceGridView.tsx
```typescript
// apps/web/app/(app)/(shell)/finance/views/FinanceGridView.tsx
'use client';

import { DataGrid } from '@ghxstship/ui';
import { FinanceRecord } from '../types';

interface FinanceGridViewProps {
  data: FinanceRecord[];
  onRowClick?: (record: FinanceRecord) => void;
}

export function FinanceGridView({ data, onRowClick }: FinanceGridViewProps) {
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, type: 'currency' },
    { key: 'status', label: 'Status', sortable: true, type: 'badge' },
    { key: 'date', label: 'Date', sortable: true, type: 'date' },
    { key: 'category', label: 'Category', sortable: true },
  ];

  return (
    <DataGrid
      columns={columns}
      data={data}
      onRowClick={onRowClick}
      enableSelection
      enableFiltering
      enableSorting
    />
  );
}
```

#### 1.2 Create FinanceKanbanView.tsx
```typescript
// apps/web/app/(app)/(shell)/finance/views/FinanceKanbanView.tsx
'use client';

import { KanbanBoard } from '@ghxstship/ui';
import { FinanceRecord } from '../types';

interface FinanceKanbanViewProps {
  data: FinanceRecord[];
  onCardClick?: (record: FinanceRecord) => void;
  onStatusChange?: (id: string, newStatus: string) => void;
}

export function FinanceKanbanView({ 
  data, 
  onCardClick, 
  onStatusChange 
}: FinanceKanbanViewProps) {
  const columns = [
    { id: 'draft', title: 'Draft', status: 'draft' },
    { id: 'pending', title: 'Pending', status: 'pending' },
    { id: 'approved', title: 'Approved', status: 'approved' },
    { id: 'paid', title: 'Paid', status: 'paid' },
  ];

  return (
    <KanbanBoard
      columns={columns}
      data={data}
      onCardClick={onCardClick}
      onStatusChange={onStatusChange}
      groupBy="status"
    />
  );
}
```

#### 1.3 Create FinanceCalendarView.tsx
```typescript
// apps/web/app/(app)/(shell)/finance/views/FinanceCalendarView.tsx
'use client';

import { Calendar } from '@ghxstship/ui';
import { FinanceRecord } from '../types';

interface FinanceCalendarViewProps {
  data: FinanceRecord[];
  onEventClick?: (record: FinanceRecord) => void;
}

export function FinanceCalendarView({ data, onEventClick }: FinanceCalendarViewProps) {
  const events = data.map(record => ({
    id: record.id,
    title: record.name,
    start: record.date,
    end: record.due_date || record.date,
    color: getStatusColor(record.status),
    data: record,
  }));

  return (
    <Calendar
      events={events}
      onEventClick={(event) => onEventClick?.(event.data)}
      view="month"
    />
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'gray',
    pending: 'yellow',
    approved: 'blue',
    paid: 'green',
  };
  return colors[status] || 'gray';
}
```

#### 1.4-1.8 Create Remaining Views
Follow similar patterns for:
- FinanceGalleryView.tsx (card-based layout)
- FinanceTimelineView.tsx (chronological timeline)
- FinanceChartView.tsx (analytics charts)
- FinanceFormView.tsx (form-based view)
- FinanceListView.tsx (compact list)

### Step 2: Create Drawers Directory (Day 3-4)

#### 2.1 Create CreateFinanceDrawer.tsx
```typescript
// apps/web/app/(app)/(shell)/finance/drawers/CreateFinanceDrawer.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppDrawer, Button, Input, Select } from '@ghxstship/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFinanceRecordSchema } from '../types';
import { financeService } from '../lib/finance-service';

interface CreateFinanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateFinanceDrawer({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateFinanceDrawerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createFinanceRecordSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await financeService.create(data);
      reset();
      onSuccess?.();
      onClose();
      router.refresh();
    } catch (error) {
      console.error('Failed to create finance record:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Create Finance Record"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name"
          {...register('name')}
          error={errors.name?.message}
          required
        />
        
        <Input
          label="Amount"
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true })}
          error={errors.amount?.message}
          required
        />
        
        <Select
          label="Category"
          {...register('category')}
          error={errors.category?.message}
          options={[
            { value: 'budget', label: 'Budget' },
            { value: 'expense', label: 'Expense' },
            { value: 'revenue', label: 'Revenue' },
            { value: 'invoice', label: 'Invoice' },
          ]}
          required
        />
        
        <Select
          label="Status"
          {...register('status')}
          error={errors.status?.message}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'paid', label: 'Paid' },
          ]}
          required
        />
        
        <Input
          label="Date"
          type="date"
          {...register('date')}
          error={errors.date?.message}
          required
        />
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Create
          </Button>
        </div>
      </form>
    </AppDrawer>
  );
}
```

#### 2.2 Create EditFinanceDrawer.tsx
Similar to CreateFinanceDrawer but with:
- Pre-populated form data
- Update API call instead of create
- Additional validation for existing record

#### 2.3 Create ViewFinanceDrawer.tsx
Read-only drawer with:
- Display all record details
- Action buttons (Edit, Delete)
- Audit trail information

### Step 3: Create Routing Structure (Day 5)

#### 3.1 Create create/page.tsx
```typescript
// apps/web/app/(app)/(shell)/finance/create/page.tsx
import { redirect } from 'next/navigation';

export default function CreateFinancePage() {
  // Redirect to main page with create drawer open
  redirect('/finance?action=create');
}
```

#### 3.2 Create [id]/page.tsx
```typescript
// apps/web/app/(app)/(shell)/finance/[id]/page.tsx
import { redirect } from 'next/navigation';

export default function ViewFinancePage({ params }: { params: { id: string } }) {
  // Redirect to main page with view drawer open
  redirect(`/finance?action=view&id=${params.id}`);
}
```

#### 3.3 Create [id]/edit/page.tsx
```typescript
// apps/web/app/(app)/(shell)/finance/[id]/edit/page.tsx
import { redirect } from 'next/navigation';

export default function EditFinancePage({ params }: { params: { id: string } }) {
  // Redirect to main page with edit drawer open
  redirect(`/finance?action=edit&id=${params.id}`);
}
```

### Step 4: Update Main Client Component (Day 5)

Update FinanceClient.tsx to integrate views and drawers:

```typescript
// apps/web/app/(app)/(shell)/finance/FinanceClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ViewSwitcher } from '@ghxstship/ui';
import { FinanceGridView } from './views/FinanceGridView';
import { FinanceKanbanView } from './views/FinanceKanbanView';
// ... import other views
import { CreateFinanceDrawer } from './drawers/CreateFinanceDrawer';
import { EditFinanceDrawer } from './drawers/EditFinanceDrawer';
import { ViewFinanceDrawer } from './drawers/ViewFinanceDrawer';
import { financeService } from './lib/finance-service';

export function FinanceClient() {
  const searchParams = useSearchParams();
  const [data, setData] = useState([]);
  const [currentView, setCurrentView] = useState('grid');
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Handle drawer state from URL params
  const action = searchParams.get('action');
  const recordId = searchParams.get('id');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    const records = await financeService.list();
    setData(records);
  };
  
  const renderView = () => {
    const viewProps = {
      data,
      onRowClick: setSelectedRecord,
    };
    
    switch (currentView) {
      case 'grid':
        return <FinanceGridView {...viewProps} />;
      case 'kanban':
        return <FinanceKanbanView {...viewProps} />;
      // ... other views
      default:
        return <FinanceGridView {...viewProps} />;
    }
  };
  
  return (
    <div>
      <ViewSwitcher
        currentView={currentView}
        onViewChange={setCurrentView}
        views={['grid', 'kanban', 'calendar', 'gallery', 'timeline', 'chart', 'form', 'list']}
      />
      
      {renderView()}
      
      <CreateFinanceDrawer
        isOpen={action === 'create'}
        onClose={() => window.history.back()}
        onSuccess={loadData}
      />
      
      <EditFinanceDrawer
        isOpen={action === 'edit' && !!recordId}
        recordId={recordId}
        onClose={() => window.history.back()}
        onSuccess={loadData}
      />
      
      <ViewFinanceDrawer
        isOpen={action === 'view' && !!recordId}
        recordId={recordId}
        onClose={() => window.history.back()}
      />
    </div>
  );
}
```

---

## JOBS MODULE REMEDIATION

### Implementation Steps
Follow the exact same pattern as Finance module:

1. **Day 1-2**: Create 8 view components in `views/`
   - JobsGridView, JobsKanbanView, JobsCalendarView, etc.

2. **Day 3-4**: Create 3 drawer components in `drawers/`
   - CreateJobDrawer, EditJobDrawer, ViewJobDrawer

3. **Day 5**: Create routing structure
   - create/page.tsx, [id]/page.tsx, [id]/edit/page.tsx

4. **Day 5**: Update JobsClient.tsx to integrate views and drawers

### Jobs-Specific Considerations
- Job status workflow: open → in_progress → blocked → done → cancelled
- Integration with opportunities and bids
- Assignment tracking with users
- Timeline view should show job duration and milestones

---

## PIPELINE MODULE REMEDIATION

### Current State Analysis
- ✅ Has: page.tsx (1,202 bytes), API routes (5 endpoints)
- ❌ Missing: types.ts, lib/, views/, drawers/, create/, [id]/

### Step 1: Create types.ts (Day 1)

```typescript
// apps/web/app/(app)/(shell)/pipeline/types.ts
import { z } from 'zod';

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineOpportunity {
  id: string;
  title: string;
  description: string;
  stage_id: string;
  value: number;
  probability: number;
  expected_close_date: string;
  company_id: string;
  assigned_to: string;
  status: 'active' | 'won' | 'lost' | 'on_hold';
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export const createPipelineOpportunitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  stage_id: z.string().uuid(),
  value: z.number().min(0),
  probability: z.number().min(0).max(100),
  expected_close_date: z.string(),
  company_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
});

export type CreatePipelineOpportunity = z.infer<typeof createPipelineOpportunitySchema>;
```

### Step 2: Create lib/pipeline-service.ts (Day 1-2)

```typescript
// apps/web/app/(app)/(shell)/pipeline/lib/pipeline-service.ts
import { createClient } from '@/lib/supabase/client';
import { PipelineOpportunity, CreatePipelineOpportunity } from '../types';

class PipelineService {
  private supabase = createClient();

  async list(): Promise<PipelineOpportunity[]> {
    const { data, error } = await this.supabase
      .from('pipeline_opportunities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async get(id: string): Promise<PipelineOpportunity | null> {
    const { data, error } = await this.supabase
      .from('pipeline_opportunities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(opportunity: CreatePipelineOpportunity): Promise<PipelineOpportunity> {
    const { data, error } = await this.supabase
      .from('pipeline_opportunities')
      .insert(opportunity)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Partial<PipelineOpportunity>): Promise<PipelineOpportunity> {
    const { data, error } = await this.supabase
      .from('pipeline_opportunities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('pipeline_opportunities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async moveToStage(id: string, stageId: string): Promise<void> {
    await this.update(id, { stage_id: stageId });
  }
}

export const pipelineService = new PipelineService();
```

### Step 3-5: Follow Finance Module Pattern
- Day 2-3: Create 8 views
- Day 4: Create 3 drawers
- Day 5: Create routing and update client

### Pipeline-Specific Considerations
- Kanban view is PRIMARY view (stage-based pipeline)
- Drag-and-drop between stages
- Probability-weighted value calculations
- Integration with companies and contacts
- Real-time Supabase subscriptions for collaborative updates

---

## TESTING CHECKLIST

### Per Module Testing
- [ ] All 8 views render correctly
- [ ] View switching works seamlessly
- [ ] Create drawer opens and submits successfully
- [ ] Edit drawer pre-populates and updates correctly
- [ ] View drawer displays all record details
- [ ] Nested routes redirect properly
- [ ] API integration works (CRUD operations)
- [ ] Real-time updates reflect in UI
- [ ] Error handling displays user-friendly messages
- [ ] Loading states show during async operations

### Integration Testing
- [ ] Module integrates with navigation
- [ ] Module respects RLS policies
- [ ] Module enforces user permissions
- [ ] Module logs audit trails
- [ ] Module works across different screen sizes
- [ ] Module is accessible (WCAG 2.2 AA)

---

## VALIDATION COMMANDS

After completing each module, run validation:

```bash
# Structure validation
./scripts/zero-tolerance-module-audit.sh

# Deep validation
./scripts/deep-module-validation.sh

# Check specific module score
grep -A 20 "MODULE: finance" DEEP_MODULE_VALIDATION.md
grep -A 20 "MODULE: jobs" DEEP_MODULE_VALIDATION.md
grep -A 20 "MODULE: pipeline" DEEP_MODULE_VALIDATION.md
```

---

## SUCCESS CRITERIA

### Finance Module
- [ ] Score increases from 62% to ≥85%
- [ ] All 8 data views implemented and functional
- [ ] Complete drawer system with CRUD operations
- [ ] Nested routing working correctly
- [ ] No TypeScript errors
- [ ] Passes all validation checks

### Jobs Module
- [ ] Score increases from 62% to ≥85%
- [ ] All 8 data views implemented and functional
- [ ] Complete drawer system with CRUD operations
- [ ] Nested routing working correctly
- [ ] No TypeScript errors
- [ ] Passes all validation checks

### Pipeline Module
- [ ] Score increases from 48% to ≥85%
- [ ] types.ts created with comprehensive definitions
- [ ] lib/ directory with complete service layer
- [ ] All 8 data views implemented and functional
- [ ] Complete drawer system with CRUD operations
- [ ] Nested routing working correctly
- [ ] Real-time Supabase integration
- [ ] No TypeScript errors
- [ ] Passes all validation checks

---

## TIMELINE SUMMARY

### Week 1
- **Days 1-2**: Finance views
- **Days 3-4**: Finance drawers
- **Day 5**: Finance routes + integration

### Week 2
- **Days 1-2**: Jobs views + Pipeline foundation
- **Days 3-4**: Jobs drawers + Pipeline views
- **Day 5**: Jobs routes + Pipeline drawers/routes

### End of Week 2
- [ ] All 3 modules at ≥85% compliance
- [ ] Zero modules in FAIL status
- [ ] Ready for Phase 2 remediation

---

**Last Updated**: 2025-09-30  
**Owner**: Development Team  
**Status**: READY FOR IMPLEMENTATION
