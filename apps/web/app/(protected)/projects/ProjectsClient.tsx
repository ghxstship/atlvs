'use client';

import { useEffect, useState } from 'react';
import { 
  StateManagerProvider, 
  ViewSwitcher, 
  DataActions, 
  DataGrid, 
  KanbanBoard, 
  CalendarView, 
  ListView 
} from '@ghxstship/ui';
import { 
  SupabaseDataProvider
} from '@ghxstship/ui/components/DataViews/providers/SupabaseDataProvider';
import { useAuth } from '@ghxstship/application/lib/supabase/auth-service';
import { 
  DataViewProvider, 
  Drawer,
  type FieldConfig,
  type DataViewConfig,
  type DataRecord
} from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';

const projectsConfig: Omit<DataViewConfig, 'data' | 'onRefresh' | 'onExport' | 'onImport'> = {
  id: 'projects-management',
  name: 'Projects Management',
  viewType: 'grid',
  defaultView: 'grid',
  fields: [
    {
      key: 'name',
      label: 'Project Name',
      type: 'text',
      required: true,
      sortable: true,
      filterable: true,
      width: 200
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      sortable: false,
      filterable: true,
      width: 300
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'planning', label: 'Planning' },
        { value: 'active', label: 'Active' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ],
      sortable: true,
      filterable: true,
      groupable: true,
      width: 120
    },
    {
      key: 'budget',
      label: 'Budget',
      type: 'currency',
      sortable: true,
      filterable: true,
      width: 120
    },
    {
      key: 'startsAt',
      label: 'Start Date',
      type: 'date',
      sortable: true,
      filterable: true,
      width: 120
    },
    {
      key: 'endsAt',
      label: 'End Date',
      type: 'date',
      sortable: true,
      filterable: true,
      width: 120
    },
    {
      key: 'created_at',
      label: 'Created',
      type: 'date',
      sortable: true,
      filterable: true,
      width: 120
    }
  ] as FieldConfig[]
};

export default function ProjectsClient({ orgId, userId, userEmail }: { orgId: string, userId: string, userEmail: string }) {
  const t = useTranslations('projects');
  const { profile } = useAuth();
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');
  const sb = createBrowserClient();
  
  const [projects, setProjects] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [orgId]);

  async function loadProjects() {
    setLoading(true);
    try {
      const { data } = await sb
        .from('projects')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });
      
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport(data: DataRecord[], format: string) {
    console.log(`Exporting ${data.length} projects as ${format}`);
    // Implement export logic here
  }

  async function handleImport(data: any[]) {
    console.log(`Importing ${data.length} projects`);
    // Implement import logic here
  }

  const configWithData: DataViewConfig = {
    ...projectsConfig,
    data: projects,
    onRefresh: loadProjects,
    onExport: handleExport,
    onImport: handleImport
  };

  return (
    <div className="h-full">
      <StateManagerProvider>
        <SupabaseDataProvider 
          config={{
            table: 'projects',
            enableOptimistic: true,
            pageSize: 50
          }}
        >
          <div className="space-y-4">
            {/* View Controls */}
            <div className="flex items-center justify-between gap-4">
              <ViewSwitcher />
              <DataActions />
            </div>

            {/* Data Views */}
            <DataGrid />
            <KanbanBoard 
              columns={[
                { id: 'todo', title: 'To Do' },
                { id: 'in-progress', title: 'In Progress' },
                { id: 'done', title: 'Done' }
              ]}
              statusField="status"
              titleField="name"
            />
            <CalendarView 
              startDateField="startsAt"
              titleField="name"
            />
            <ListView titleField="name" />
            
            {/* Universal Drawer for record interactions */}
            <Drawer
              open={false}
              onClose={() => {}}
              title="Project Details"
             
            >
              <div className="p-6">
                <p className="text-muted-foreground">Project details will be displayed here.</p>
              </div>
            </Drawer>
          </div>
        </SupabaseDataProvider>
      </StateManagerProvider>
    </div>
  );
}
