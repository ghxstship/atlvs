import { z } from 'zod';
import { 
  Folder,
  FolderOpen,
  CheckSquare,
  FileText,
  MapPin,
  Calendar,
  AlertTriangle,
  Shield,
  Zap,
  Users,
  Clock,
  Target,
  TrendingUp,
  Download,
  Upload,
  Plus
} from 'lucide-react';
import type { ModuleConfig } from '@ghxstship/ui/config/types';

// Schemas
const ProjectSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  type: z.enum(['event', 'production', 'marketing', 'development', 'other']),
  start_date: z.date(),
  end_date: z.date(),
  budget: z.number().positive().optional(),
  client_id: z.string().uuid().optional(),
  manager_id: z.string().uuid(),
  team_ids: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  created_at: z.date(),
  updated_at: z.date()
});

const TaskSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done', 'blocked']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  assignee_id: z.string().uuid().optional(),
  due_date: z.date().optional(),
  estimated_hours: z.number().positive().optional(),
  actual_hours: z.number().positive().optional(),
  dependencies: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
  created_at: z.date(),
  updated_at: z.date()
});

const FileSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  name: z.string().min(1),
  type: z.string(),
  size: z.number(),
  url: z.string().url(),
  uploaded_by: z.string().uuid(),
  folder: z.string().optional(),
  description: z.string().optional(),
  version: z.number().default(1),
  created_at: z.date(),
  updated_at: z.date()
});

const LocationSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  name: z.string().min(1),
  address: z.string(),
  city: z.string(),
  state: z.string().optional(),
  country: z.string(),
  postal_code: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  type: z.enum(['venue', 'office', 'warehouse', 'outdoor', 'other']),
  capacity: z.number().optional(),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional(),
  notes: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

const RiskSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  category: z.enum(['technical', 'financial', 'operational', 'legal', 'environmental', 'other']),
  probability: z.enum(['very_low', 'low', 'medium', 'high', 'very_high']),
  impact: z.enum(['negligible', 'minor', 'moderate', 'major', 'critical']),
  status: z.enum(['identified', 'analyzing', 'mitigating', 'accepted', 'closed']),
  mitigation_plan: z.string().optional(),
  owner_id: z.string().uuid(),
  identified_date: z.date(),
  review_date: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export const projectsModuleConfig: ModuleConfig = {
  id: 'projects',
  name: 'Projects',
  description: 'Manage projects, tasks, and deliverables',
  icon: Folder,
  color: 'blue',
  path: '/projects',
  
  entities: {
    projects: {
      table: 'projects',
      singular: 'Project',
      plural: 'Projects',
      schema: ProjectSchema,
      includes: ['client:companies(name)', 'manager:users(name,avatar)'],
      searchFields: ['name', 'description'],
      orderBy: 'created_at.desc',
      
      fields: [
        { 
          key: 'name', 
          label: 'Project Name', 
          type: 'text', 
          required: true,
          placeholder: 'Enter project name',
          group: 'basic'
        },
        { 
          key: 'description', 
          label: 'Description', 
          type: 'textarea',
          rows: 3,
          placeholder: 'Describe the project objectives and scope',
          group: 'basic'
        },
        { 
          key: 'type', 
          label: 'Type', 
          type: 'select',
          required: true,
          options: [
            { label: 'Event', value: 'event' },
            { label: 'Production', value: 'production' },
            { label: 'Marketing', value: 'marketing' },
            { label: 'Development', value: 'development' },
            { label: 'Other', value: 'other' },
          ],
          group: 'basic'
        },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'planning',
          options: [
            { label: 'Planning', value: 'planning' },
            { label: 'Active', value: 'active' },
            { label: 'On Hold', value: 'on_hold' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
          group: 'basic'
        },
        { 
          key: 'priority', 
          label: 'Priority', 
          type: 'select',
          defaultValue: 'medium',
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Critical', value: 'critical' },
          ],
          group: 'basic'
        },
        { 
          key: 'start_date', 
          label: 'Start Date', 
          type: 'date',
          required: true,
          group: 'schedule'
        },
        { 
          key: 'end_date', 
          label: 'End Date', 
          type: 'date',
          required: true,
          group: 'schedule'
        },
        { 
          key: 'budget', 
          label: 'Budget', 
          type: 'currency',
          placeholder: '0.00',
          group: 'financial'
        },
        { 
          key: 'client_id', 
          label: 'Client', 
          type: 'select',
          options: 'clients',
          group: 'stakeholders'
        },
        { 
          key: 'manager_id', 
          label: 'Project Manager', 
          type: 'select',
          required: true,
          options: 'users',
          group: 'stakeholders'
        },
        { 
          key: 'team_ids', 
          label: 'Team Members', 
          type: 'multiselect',
          options: 'users',
          group: 'stakeholders'
        },
        { 
          key: 'tags', 
          label: 'Tags', 
          type: 'tags',
          placeholder: 'Add tags...',
          group: 'metadata'
        }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'xl',
      deleteConfirmation: true,
      
      defaultViews: ['grid', 'list', 'kanban', 'timeline'],
      
      filters: [
        {
          key: 'status',
          label: 'Status',
          type: 'multiselect',
          options: ['planning', 'active', 'on_hold', 'completed', 'cancelled']
        },
        {
          key: 'priority',
          label: 'Priority',
          type: 'select',
          options: ['low', 'medium', 'high', 'critical']
        },
        {
          key: 'type',
          label: 'Type',
          type: 'multiselect',
          options: ['event', 'production', 'marketing', 'development', 'other']
        },
        {
          key: 'date_range',
          label: 'Date Range',
          type: 'daterange'
        }
      ],
      
      emptyState: {
        title: 'No projects yet',
        description: 'Create your first project to get started',
        icon: FolderOpen,
        action: {
          label: 'Create Project',
          onClick: () => console.log('Create project')
        }
      },
      
      bulkActions: {
        archive: async (ids: string[]) => {
          console.log('Archiving projects:', ids);
        },
        export: async (ids: string[]) => {
          console.log('Exporting projects:', ids);
        }
      }
    },
    
    tasks: {
      table: 'tasks',
      singular: 'Task',
      plural: 'Tasks',
      schema: TaskSchema,
      includes: ['project:projects(name)', 'assignee:users(name,avatar)'],
      searchFields: ['title', 'description'],
      orderBy: 'created_at.desc',
      
      fields: [
        { key: 'title', label: 'Task Title', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { key: 'project_id', label: 'Project', type: 'select', required: true, options: 'projects' },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'todo',
          options: [
            { label: 'To Do', value: 'todo' },
            { label: 'In Progress', value: 'in_progress' },
            { label: 'Review', value: 'review' },
            { label: 'Done', value: 'done' },
            { label: 'Blocked', value: 'blocked' },
          ]
        },
        { 
          key: 'priority', 
          label: 'Priority', 
          type: 'select',
          defaultValue: 'medium',
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Critical', value: 'critical' },
          ]
        },
        { key: 'assignee_id', label: 'Assignee', type: 'select', options: 'users' },
        { key: 'due_date', label: 'Due Date', type: 'date' },
        { key: 'estimated_hours', label: 'Estimated Hours', type: 'number', min: 0, step: 0.5 },
        { key: 'actual_hours', label: 'Actual Hours', type: 'number', min: 0, step: 0.5 },
        { key: 'dependencies', label: 'Dependencies', type: 'multiselect', options: 'tasks' },
        { key: 'tags', label: 'Tags', type: 'tags' }
      ],
      
      drawerLayout: 'single',
      drawerSize: 'md',
      
      defaultViews: ['kanban', 'list', 'calendar'],
      
      customActions: [
        {
          id: 'start',
          label: 'Start Task',
          onClick: async (task) => {
            console.log('Starting task:', task);
          },
          condition: (task) => task.status === 'todo'
        },
        {
          id: 'complete',
          label: 'Mark Complete',
          onClick: async (task) => {
            console.log('Completing task:', task);
          },
          condition: (task) => task.status !== 'done'
        }
      ]
    },
    
    files: {
      table: 'files',
      singular: 'File',
      plural: 'Files',
      schema: FileSchema,
      includes: ['project:projects(name)', 'uploaded_by:users(name,avatar)'],
      searchFields: ['name', 'description'],
      orderBy: 'created_at.desc',
      
      fields: [
        { key: 'name', label: 'File Name', type: 'text', required: true },
        { key: 'project_id', label: 'Project', type: 'select', required: true, options: 'projects' },
        { key: 'folder', label: 'Folder', type: 'text', placeholder: 'e.g., /documents/contracts' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 2 },
        { key: 'file', label: 'Upload File', type: 'file', required: true }
      ],
      
      drawerLayout: 'single',
      drawerSize: 'sm',
      
      defaultViews: ['grid', 'list'],
      
      customActions: [
        {
          id: 'download',
          label: 'Download',
          icon: Download,
          onClick: async (file) => {
            window.open(file.url, '_blank');
          }
        }
      ]
    },
    
    locations: {
      table: 'locations',
      singular: 'Location',
      plural: 'Locations',
      schema: LocationSchema,
      includes: ['project:projects(name)'],
      searchFields: ['name', 'address', 'city'],
      orderBy: 'name.asc',
      
      fields: [
        { key: 'name', label: 'Location Name', type: 'text', required: true },
        { key: 'project_id', label: 'Project', type: 'select', required: true, options: 'projects' },
        { 
          key: 'type', 
          label: 'Type', 
          type: 'select',
          required: true,
          options: [
            { label: 'Venue', value: 'venue' },
            { label: 'Office', value: 'office' },
            { label: 'Warehouse', value: 'warehouse' },
            { label: 'Outdoor', value: 'outdoor' },
            { label: 'Other', value: 'other' },
          ]
        },
        { key: 'address', label: 'Address', type: 'text', required: true },
        { key: 'city', label: 'City', type: 'text', required: true },
        { key: 'state', label: 'State/Province', type: 'text' },
        { key: 'country', label: 'Country', type: 'text', required: true },
        { key: 'postal_code', label: 'Postal Code', type: 'text' },
        { key: 'capacity', label: 'Capacity', type: 'number', min: 0 },
        { key: 'contact_name', label: 'Contact Name', type: 'text' },
        { key: 'contact_phone', label: 'Contact Phone', type: 'text' },
        { key: 'contact_email', label: 'Contact Email', type: 'email' },
        { key: 'notes', label: 'Notes', type: 'textarea', rows: 3 }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'lg',
      
      defaultViews: ['list', 'map']
    },
    
    risks: {
      table: 'risks',
      singular: 'Risk',
      plural: 'Risks',
      schema: RiskSchema,
      includes: ['project:projects(name)', 'owner:users(name,avatar)'],
      searchFields: ['title', 'description'],
      orderBy: 'probability.desc',
      
      fields: [
        { key: 'title', label: 'Risk Title', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea', required: true, rows: 3 },
        { key: 'project_id', label: 'Project', type: 'select', required: true, options: 'projects' },
        { 
          key: 'category', 
          label: 'Category', 
          type: 'select',
          required: true,
          options: [
            { label: 'Technical', value: 'technical' },
            { label: 'Financial', value: 'financial' },
            { label: 'Operational', value: 'operational' },
            { label: 'Legal', value: 'legal' },
            { label: 'Environmental', value: 'environmental' },
            { label: 'Other', value: 'other' },
          ]
        },
        { 
          key: 'probability', 
          label: 'Probability', 
          type: 'select',
          required: true,
          options: [
            { label: 'Very Low', value: 'very_low' },
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Very High', value: 'very_high' },
          ]
        },
        { 
          key: 'impact', 
          label: 'Impact', 
          type: 'select',
          required: true,
          options: [
            { label: 'Negligible', value: 'negligible' },
            { label: 'Minor', value: 'minor' },
            { label: 'Moderate', value: 'moderate' },
            { label: 'Major', value: 'major' },
            { label: 'Critical', value: 'critical' },
          ]
        },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'identified',
          options: [
            { label: 'Identified', value: 'identified' },
            { label: 'Analyzing', value: 'analyzing' },
            { label: 'Mitigating', value: 'mitigating' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'Closed', value: 'closed' },
          ]
        },
        { key: 'mitigation_plan', label: 'Mitigation Plan', type: 'textarea', rows: 3 },
        { key: 'owner_id', label: 'Risk Owner', type: 'select', required: true, options: 'users' },
        { key: 'identified_date', label: 'Identified Date', type: 'date', required: true },
        { key: 'review_date', label: 'Review Date', type: 'date' }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'lg',
      
      defaultViews: ['list', 'kanban']
    }
  },
  
  tabs: [
    {
      id: 'overview',
      label: 'Overview',
      icon: Target,
      type: 'overview',
      config: {
        widgets: [
          {
            id: 'active-projects',
            type: 'metric',
            title: 'Active Projects',
            metric: 'active_projects',
            icon: Folder,
            color: 'primary',
            span: 3
          },
          {
            id: 'tasks-completed',
            type: 'metric',
            title: 'Tasks Completed',
            metric: 'tasks_completed',
            icon: CheckSquare,
            color: 'success',
            span: 3
          },
          {
            id: 'on-time-delivery',
            type: 'metric',
            title: 'On-Time Delivery',
            metric: 'on_time_delivery',
            icon: Clock,
            color: 'warning',
            span: 3
          },
          {
            id: 'team-utilization',
            type: 'metric',
            title: 'Team Utilization',
            metric: 'team_utilization',
            icon: Users,
            color: 'primary',
            span: 3
          },
          {
            id: 'project-timeline',
            type: 'chart',
            title: 'Project Timeline',
            chart: 'project_timeline',
            chartType: 'line',
            span: 6
          },
          {
            id: 'task-distribution',
            type: 'chart',
            title: 'Task Distribution',
            chart: 'task_distribution',
            chartType: 'donut',
            span: 6
          },
          {
            id: 'upcoming-deadlines',
            type: 'list',
            title: 'Upcoming Deadlines',
            entity: 'tasks',
            filters: { status: ['todo', 'in_progress'] },
            limit: 5,
            span: 6
          },
          {
            id: 'recent-activities',
            type: 'activity',
            title: 'Recent Activities',
            span: 6
          }
        ],
        layout: 'grid',
        columns: 12,
        gap: 'md',
        refresh: true,
        refreshInterval: 300000 // 5 minutes
      }
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Folder,
      entity: 'projects',
      views: ['grid', 'list', 'kanban', 'timeline']
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      entity: 'tasks',
      views: ['kanban', 'list', 'calendar']
    },
    {
      id: 'files',
      label: 'Files',
      icon: FileText,
      entity: 'files',
      views: ['grid', 'list']
    },
    {
      id: 'locations',
      label: 'Locations',
      icon: MapPin,
      entity: 'locations',
      views: ['list', 'map']
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Calendar,
      entity: 'tasks',
      views: ['calendar', 'timeline']
    },
    {
      id: 'risks',
      label: 'Risks',
      icon: AlertTriangle,
      entity: 'risks',
      views: ['list', 'kanban']
    },
    {
      id: 'inspections',
      label: 'Inspections',
      icon: Shield,
      type: 'custom',
      component: () => null // Will be implemented separately
    },
    {
      id: 'activations',
      label: 'Activations',
      icon: Zap,
      type: 'custom',
      component: () => null // Will be implemented separately
    }
  ],
  
  defaultTab: 'overview',
  
  headerActions: [
    {
      id: 'create-project',
      label: 'New Project',
      icon: Plus,
      variant: 'default',
      onClick: () => console.log('Create new project')
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      variant: 'outline',
      onClick: () => console.log('Export projects data')
    },
    {
      id: 'import',
      label: 'Import',
      icon: Upload,
      variant: 'outline',
      onClick: () => console.log('Import projects data')
    }
  ],
  
  features: {
    search: true,
    filters: true,
    sort: true,
    export: true,
    import: true,
    bulkActions: true,
    realtime: true,
    audit: true,
    versioning: true,
    comments: true,
    attachments: true,
    notifications: true
  },
  
  permissions: {
    view: ['owner', 'admin', 'manager', 'member', 'viewer'],
    create: ['owner', 'admin', 'manager'],
    update: ['owner', 'admin', 'manager'],
    delete: ['owner', 'admin']
  }
};

export default projectsModuleConfig;
