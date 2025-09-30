#!/usr/bin/env zsh

# Generate all missing view and drawer components
set -e

SHELL_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web/app/(app)/(shell)"

echo "🚀 GENERATING MISSING COMPONENTS"
echo "=================================="

# Generate placeholder views for modules
MODULES_NEEDING_VIEWS=("pipeline" "finance" "jobs")

for module in "${MODULES_NEEDING_VIEWS[@]}"; do
  echo "Creating views for $module..."
  
  # Create index file
  cat > "$SHELL_DIR/$module/views/index.ts" << 'EOF'
export * from './GridView';
export * from './KanbanView';
export * from './CalendarView';
export * from './GalleryView';
export * from './TimelineView';
export * from './ChartView';
export * from './FormView';
export * from './ListView';
EOF
  
  # Create GridView
  cat > "$SHELL_DIR/$module/views/GridView.tsx" << 'EOF'
'use client';

import { DataGrid } from '@ghxstship/ui';

export function GridView({ data, onRowClick }: any) {
  return <DataGrid data={data} onRowClick={onRowClick} />;
}
EOF

  # Create KanbanView
  cat > "$SHELL_DIR/$module/views/KanbanView.tsx" << 'EOF'
'use client';

import { KanbanBoard } from '@ghxstship/ui';

export function KanbanView({ data, onCardClick }: any) {
  return <KanbanBoard data={data} onCardClick={onCardClick} />;
}
EOF

  # Create CalendarView
  cat > "$SHELL_DIR/$module/views/CalendarView.tsx" << 'EOF'
'use client';

import { Calendar } from '@ghxstship/ui';

export function CalendarView({ data, onEventClick }: any) {
  return <Calendar events={data} onEventClick={onEventClick} />;
}
EOF

  # Create GalleryView
  cat > "$SHELL_DIR/$module/views/GalleryView.tsx" << 'EOF'
'use client';

export function GalleryView({ data }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data?.map((item: any) => (
        <div key={item.id} className="p-4 border rounded-lg">
          <h3 className="font-semibold">{item.title || item.name}</h3>
        </div>
      ))}
    </div>
  );
}
EOF

  # Create TimelineView
  cat > "$SHELL_DIR/$module/views/TimelineView.tsx" << 'EOF'
'use client';

export function TimelineView({ data }: any) {
  return (
    <div className="space-y-4">
      {data?.map((item: any) => (
        <div key={item.id} className="flex gap-4">
          <div className="w-2 bg-blue-500 rounded" />
          <div>
            <h4 className="font-semibold">{item.title || item.name}</h4>
            <p className="text-sm text-gray-600">{item.created_at}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
EOF

  # Create ChartView
  cat > "$SHELL_DIR/$module/views/ChartView.tsx" << 'EOF'
'use client';

export function ChartView({ data }: any) {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Analytics</h3>
      <p>Chart visualization coming soon</p>
    </div>
  );
}
EOF

  # Create FormView
  cat > "$SHELL_DIR/$module/views/FormView.tsx" << 'EOF'
'use client';

export function FormView({ data, onSubmit }: any) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 p-4">
      <p>Form view</p>
    </form>
  );
}
EOF

  # Create ListView
  cat > "$SHELL_DIR/$module/views/ListView.tsx" << 'EOF'
'use client';

export function ListView({ data }: any) {
  return (
    <div className="space-y-2">
      {data?.map((item: any) => (
        <div key={item.id} className="p-3 border-b">
          {item.title || item.name}
        </div>
      ))}
    </div>
  );
}
EOF

  echo "  ✅ Created 8 views for $module"
done

# Generate drawers
MODULES_NEEDING_DRAWERS=("pipeline" "finance" "jobs" "people" "programming" "projects")

for module in "${MODULES_NEEDING_DRAWERS[@]}"; do
  echo "Creating drawers for $module..."
  
  # Create index
  cat > "$SHELL_DIR/$module/drawers/index.ts" << 'EOF'
export * from './CreateDrawer';
export * from './EditDrawer';
export * from './ViewDrawer';
EOF

  # Create CreateDrawer
  cat > "$SHELL_DIR/$module/drawers/CreateDrawer.tsx" << 'EOF'
'use client';

import { AppDrawer, Button } from '@ghxstship/ui';

export function CreateDrawer({ isOpen, onClose, onSuccess }: any) {
  return (
    <AppDrawer isOpen={isOpen} onClose={onClose} title="Create">
      <div className="p-4">
        <p>Create form</p>
        <div className="flex gap-2 mt-4">
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={onSuccess}>Create</Button>
        </div>
      </div>
    </AppDrawer>
  );
}
EOF

  # Create EditDrawer
  cat > "$SHELL_DIR/$module/drawers/EditDrawer.tsx" << 'EOF'
'use client';

import { AppDrawer, Button } from '@ghxstship/ui';

export function EditDrawer({ isOpen, onClose, onSuccess, recordId }: any) {
  return (
    <AppDrawer isOpen={isOpen} onClose={onClose} title="Edit">
      <div className="p-4">
        <p>Edit form for {recordId}</p>
        <div className="flex gap-2 mt-4">
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={onSuccess}>Save</Button>
        </div>
      </div>
    </AppDrawer>
  );
}
EOF

  # Create ViewDrawer
  cat > "$SHELL_DIR/$module/drawers/ViewDrawer.tsx" << 'EOF'
'use client';

import { AppDrawer, Button } from '@ghxstship/ui';

export function ViewDrawer({ isOpen, onClose, recordId }: any) {
  return (
    <AppDrawer isOpen={isOpen} onClose={onClose} title="Details">
      <div className="p-4">
        <p>Details for {recordId}</p>
        <div className="flex gap-2 mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </AppDrawer>
  );
}
EOF

  echo "  ✅ Created 3 drawers for $module"
done

echo ""
echo "✅ Component generation complete!"
echo "Created:"
echo "  - 24 view components (3 modules × 8 views)"
echo "  - 18 drawer components (6 modules × 3 drawers)"
echo "  - Total: 42 new component files"
