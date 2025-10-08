'use client';

import { useEffect, useState, useCallback } from 'react';
import { Drawer } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';

// Type definitions
type DataRecord = Record<string, unknown>;

interface FieldConfig {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
  width?: number;
  options?: Array<{ value: string; label: string }>;
}

// Reserved for future configuration
const _projectsConfig = {
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

export default function ProjectsClient({ orgId, userId: _userId, userEmail: _userEmail }: { orgId: string, userId: string, userEmail: string }) {
  const [projects, setProjects] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient();

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [orgId, supabase]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div className="h-full">
      <div className="flex flex-col h-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Projects</h1>
          <button
            onClick={() => loadProjects()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Refresh
          </button>
        </div>

        {/* Data Display */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const projectId = typeof project.id === 'string' ? project.id : String(project.id);
              const name = typeof project.name === 'string' ? project.name : 'Untitled Project';
              const description = typeof project.description === 'string' ? project.description : '';
              const status = typeof project.status === 'string' ? project.status : 'unknown';
              const budget = typeof project.budget === 'number' ? project.budget : null;
              
              return (
                <div key={projectId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg">{name}</h3>
                  {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      status === 'active' ? 'bg-green-100 text-green-800' :
                      status === 'planning' ? 'bg-blue-100 text-blue-800' :
                      status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {status}
                    </span>
                    {budget && (
                      <span className="text-xs text-gray-600">
                        ${budget.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Universal Drawer for record interactions */}
        <Drawer open={false} onClose={() => {}} title="Project Details">
          <div className="p-4">
            <p className="text-gray-600">Project details will be displayed here.</p>
          </div>
        </Drawer>
      </div>
    </div>
  );
}
