import { z } from 'zod';
import { 
  Briefcase,
  Users,
  DollarSign,
  FileText,
  CheckCircle,
  Target,
  Calendar,
  MapPin,
  Clock,
  Award,
  TrendingUp,
  Plus,
  Settings,
  Download,
  Upload,
  Filter,
  Search,
  AlertCircle,
  Building
} from 'lucide-react';
import type { ModuleConfig } from '@ghxstship/ui/config/types';

// Job Schema
const JobSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  title: z.string().min(1, 'Job title is required'),
  description: z.string().optional(),
  type: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship', 'temporary']),
  category: z.enum(['production', 'technical', 'creative', 'management', 'support', 'other']),
  status: z.enum(['draft', 'open', 'in-progress', 'completed', 'cancelled', 'on-hold']).default('draft'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  project_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  location: z.string().optional(),
  remote_allowed: z.boolean().default(false),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  estimated_hours: z.number().positive().optional(),
  hourly_rate: z.number().positive().optional(),
  total_budget: z.number().positive().optional(),
  currency: z.string().default('USD'),
  requirements: z.array(z.string()).optional(),
  skills_required: z.array(z.string()).optional(),
  experience_level: z.enum(['entry', 'mid', 'senior', 'expert']).optional(),
  assigned_to: z.string().uuid().optional(),
  created_by: z.string().uuid(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  created_at: z.date(),
  updated_at: z.date()
});

// Job Assignment Schema
const JobAssignmentSchema = z.object({
  id: z.string().uuid(),
  job_id: z.string().uuid(),
  assignee_id: z.string().uuid(),
  role: z.string().optional(),
  status: z.enum(['pending', 'accepted', 'declined', 'in-progress', 'completed']).default('pending'),
  assigned_at: z.date(),
  started_at: z.date().optional(),
  completed_at: z.date().optional(),
  notes: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

// Job Bid Schema
const JobBidSchema = z.object({
  id: z.string().uuid(),
  job_id: z.string().uuid(),
  bidder_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  proposed_timeline: z.string().optional(),
  cover_letter: z.string().optional(),
  status: z.enum(['submitted', 'under-review', 'accepted', 'rejected', 'withdrawn']).default('submitted'),
  submitted_at: z.date(),
  reviewed_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

// Job Contract Schema
const JobContractSchema = z.object({
  id: z.string().uuid(),
  job_id: z.string().uuid(),
  contractor_id: z.string().uuid(),
  title: z.string().min(1, 'Contract title is required'),
  type: z.enum(['fixed-price', 'hourly', 'milestone-based', 'retainer']),
  status: z.enum(['draft', 'pending', 'active', 'completed', 'terminated', 'expired']).default('draft'),
  start_date: z.date(),
  end_date: z.date().optional(),
  total_value: z.number().positive(),
  currency: z.string().default('USD'),
  payment_terms: z.string().optional(),
  deliverables: z.array(z.string()).optional(),
  terms_and_conditions: z.string().optional(),
  signed_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export const jobsModuleConfig: ModuleConfig = {
  id: 'jobs',
  name: 'Jobs',
  description: 'Job management, assignments, and workforce coordination',
  icon: Briefcase,
  color: 'orange',
  path: '/jobs',
  
  entities: {
    jobs: {
      table: 'jobs',
      singular: 'Job',
      plural: 'Jobs',
      schema: JobSchema,
      includes: [
        'project:projects(name)',
        'client:companies(name)',
        'assigned_to:users(name,avatar)',
        'created_by:users(name,avatar)'
      ],
      searchFields: ['title', 'description', 'location'],
      orderBy: 'created_at.desc',
      
      fields: [
        { 
          key: 'title', 
          label: 'Job Title', 
          type: 'text', 
          required: true,
          placeholder: 'Enter job title',
          group: 'basic'
        },
        { 
          key: 'description', 
          label: 'Description', 
          type: 'textarea',
          rows: 4,
          placeholder: 'Describe the job requirements and responsibilities...',
          group: 'basic'
        },
        { 
          key: 'type', 
          label: 'Job Type', 
          type: 'select',
          required: true,
          options: [
            { label: 'Full-time', value: 'full-time' },
            { label: 'Part-time', value: 'part-time' },
            { label: 'Contract', value: 'contract' },
            { label: 'Freelance', value: 'freelance' },
            { label: 'Internship', value: 'internship' },
            { label: 'Temporary', value: 'temporary' },
          ],
          group: 'details'
        },
        { 
          key: 'category', 
          label: 'Category', 
          type: 'select',
          required: true,
          options: [
            { label: 'Production', value: 'production' },
            { label: 'Technical', value: 'technical' },
            { label: 'Creative', value: 'creative' },
            { label: 'Management', value: 'management' },
            { label: 'Support', value: 'support' },
            { label: 'Other', value: 'other' },
          ],
          group: 'details'
        },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'draft',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Open', value: 'open' },
            { label: 'In Progress', value: 'in-progress' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
            { label: 'On Hold', value: 'on-hold' },
          ],
          group: 'status'
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
            { label: 'Urgent', value: 'urgent' },
          ],
          group: 'status'
        },
        { 
          key: 'project_id', 
          label: 'Project', 
          type: 'select',
          options: 'projects',
          group: 'associations'
        },
        { 
          key: 'client_id', 
          label: 'Client', 
          type: 'select',
          options: 'companies',
          group: 'associations'
        },
        { 
          key: 'location', 
          label: 'Location', 
          type: 'text',
          placeholder: 'Job location',
          group: 'logistics'
        },
        { 
          key: 'remote_allowed', 
          label: 'Remote Work Allowed', 
          type: 'switch',
          defaultValue: false,
          group: 'logistics'
        },
        { 
          key: 'start_date', 
          label: 'Start Date', 
          type: 'date',
          group: 'timeline'
        },
        { 
          key: 'end_date', 
          label: 'End Date', 
          type: 'date',
          group: 'timeline'
        },
        { 
          key: 'estimated_hours', 
          label: 'Estimated Hours', 
          type: 'number',
          min: 0,
          group: 'budget'
        },
        { 
          key: 'hourly_rate', 
          label: 'Hourly Rate', 
          type: 'currency',
          group: 'budget'
        },
        { 
          key: 'total_budget', 
          label: 'Total Budget', 
          type: 'currency',
          group: 'budget'
        },
        { 
          key: 'experience_level', 
          label: 'Experience Level', 
          type: 'select',
          options: [
            { label: 'Entry Level', value: 'entry' },
            { label: 'Mid Level', value: 'mid' },
            { label: 'Senior Level', value: 'senior' },
            { label: 'Expert Level', value: 'expert' },
          ],
          group: 'requirements'
        },
        { 
          key: 'skills_required', 
          label: 'Required Skills', 
          type: 'tags',
          placeholder: 'Add required skills...',
          group: 'requirements'
        },
        { 
          key: 'assigned_to', 
          label: 'Assigned To', 
          type: 'select',
          options: 'users',
          group: 'assignment'
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
      
      defaultViews: ['list', 'kanban', 'calendar'],
      
      filters: [
        {
          key: 'status',
          label: 'Status',
          type: 'multiselect',
          options: ['draft', 'open', 'in-progress', 'completed', 'cancelled', 'on-hold']
        },
        {
          key: 'type',
          label: 'Job Type',
          type: 'multiselect',
          options: ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'temporary']
        },
        {
          key: 'category',
          label: 'Category',
          type: 'multiselect',
          options: ['production', 'technical', 'creative', 'management', 'support', 'other']
        },
        {
          key: 'priority',
          label: 'Priority',
          type: 'multiselect',
          options: ['low', 'medium', 'high', 'urgent']
        },
        {
          key: 'project_id',
          label: 'Project',
          type: 'select',
          options: 'projects'
        },
        {
          key: 'assigned_to',
          label: 'Assigned To',
          type: 'select',
          options: 'users'
        }
      ],
      
      emptyState: {
        title: 'No jobs posted yet',
        description: 'Create your first job posting to start hiring',
        action: {
          label: 'Create Job',
          icon: Plus
        }
      },
      
      permissions: {
        create: true,
        read: true,
        update: true,
        delete: true
      }
    },
    
    assignments: {
      table: 'job_assignments',
      singular: 'Assignment',
      plural: 'Assignments',
      schema: JobAssignmentSchema,
      includes: [
        'job:jobs(title,status)',
        'assignee:users(name,avatar)'
      ],
      searchFields: ['role', 'notes'],
      orderBy: 'assigned_at.desc',
      
      fields: [
        { 
          key: 'job_id', 
          label: 'Job', 
          type: 'select',
          options: 'jobs',
          required: true,
          group: 'basic'
        },
        { 
          key: 'assignee_id', 
          label: 'Assignee', 
          type: 'select',
          options: 'users',
          required: true,
          group: 'basic'
        },
        { 
          key: 'role', 
          label: 'Role', 
          type: 'text',
          placeholder: 'Specific role or responsibility',
          group: 'basic'
        },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'pending',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'Declined', value: 'declined' },
            { label: 'In Progress', value: 'in-progress' },
            { label: 'Completed', value: 'completed' },
          ],
          group: 'status'
        },
        { 
          key: 'notes', 
          label: 'Notes', 
          type: 'textarea',
          rows: 3,
          placeholder: 'Additional notes...',
          group: 'details'
        }
      ],
      
      drawerLayout: 'single',
      drawerSize: 'md',
      
      defaultViews: ['list', 'kanban'],
      
      emptyState: {
        title: 'No assignments yet',
        description: 'Assign jobs to team members to get started',
        action: {
          label: 'Create Assignment',
          icon: Users
        }
      }
    },
    
    bids: {
      table: 'job_bids',
      singular: 'Bid',
      plural: 'Bids',
      schema: JobBidSchema,
      includes: [
        'job:jobs(title,total_budget)',
        'bidder:users(name,avatar)'
      ],
      searchFields: ['cover_letter', 'proposed_timeline'],
      orderBy: 'submitted_at.desc',
      
      fields: [
        { 
          key: 'job_id', 
          label: 'Job', 
          type: 'select',
          options: 'jobs',
          required: true,
          group: 'basic'
        },
        { 
          key: 'bidder_id', 
          label: 'Bidder', 
          type: 'select',
          options: 'users',
          required: true,
          group: 'basic'
        },
        { 
          key: 'amount', 
          label: 'Bid Amount', 
          type: 'currency',
          required: true,
          group: 'proposal'
        },
        { 
          key: 'proposed_timeline', 
          label: 'Proposed Timeline', 
          type: 'text',
          placeholder: 'e.g., 2 weeks, 1 month',
          group: 'proposal'
        },
        { 
          key: 'cover_letter', 
          label: 'Cover Letter', 
          type: 'textarea',
          rows: 4,
          placeholder: 'Explain why you are the best fit for this job...',
          group: 'proposal'
        },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'submitted',
          options: [
            { label: 'Submitted', value: 'submitted' },
            { label: 'Under Review', value: 'under-review' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Withdrawn', value: 'withdrawn' },
          ],
          group: 'status'
        }
      ],
      
      drawerLayout: 'single',
      drawerSize: 'lg',
      
      defaultViews: ['list', 'kanban'],
      
      emptyState: {
        title: 'No bids submitted yet',
        description: 'Bids will appear here when submitted for jobs',
        action: {
          label: 'View Jobs',
          icon: Briefcase
        }
      }
    },
    
    contracts: {
      table: 'job_contracts',
      singular: 'Contract',
      plural: 'Contracts',
      schema: JobContractSchema,
      includes: [
        'job:jobs(title)',
        'contractor:users(name,avatar)'
      ],
      searchFields: ['title', 'terms_and_conditions'],
      orderBy: 'created_at.desc',
      
      fields: [
        { 
          key: 'job_id', 
          label: 'Job', 
          type: 'select',
          options: 'jobs',
          required: true,
          group: 'basic'
        },
        { 
          key: 'contractor_id', 
          label: 'Contractor', 
          type: 'select',
          options: 'users',
          required: true,
          group: 'basic'
        },
        { 
          key: 'title', 
          label: 'Contract Title', 
          type: 'text',
          required: true,
          placeholder: 'Enter contract title',
          group: 'basic'
        },
        { 
          key: 'type', 
          label: 'Contract Type', 
          type: 'select',
          required: true,
          options: [
            { label: 'Fixed Price', value: 'fixed-price' },
            { label: 'Hourly', value: 'hourly' },
            { label: 'Milestone Based', value: 'milestone-based' },
            { label: 'Retainer', value: 'retainer' },
          ],
          group: 'terms'
        },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'draft',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Pending', value: 'pending' },
            { label: 'Active', value: 'active' },
            { label: 'Completed', value: 'completed' },
            { label: 'Terminated', value: 'terminated' },
            { label: 'Expired', value: 'expired' },
          ],
          group: 'status'
        },
        { 
          key: 'start_date', 
          label: 'Start Date', 
          type: 'date',
          required: true,
          group: 'timeline'
        },
        { 
          key: 'end_date', 
          label: 'End Date', 
          type: 'date',
          group: 'timeline'
        },
        { 
          key: 'total_value', 
          label: 'Total Value', 
          type: 'currency',
          required: true,
          group: 'financial'
        },
        { 
          key: 'payment_terms', 
          label: 'Payment Terms', 
          type: 'textarea',
          rows: 3,
          placeholder: 'Describe payment terms and schedule...',
          group: 'financial'
        },
        { 
          key: 'deliverables', 
          label: 'Deliverables', 
          type: 'tags',
          placeholder: 'Add deliverables...',
          group: 'scope'
        },
        { 
          key: 'terms_and_conditions', 
          label: 'Terms and Conditions', 
          type: 'textarea',
          rows: 6,
          placeholder: 'Enter contract terms and conditions...',
          group: 'legal'
        }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'xl',
      deleteConfirmation: true,
      
      defaultViews: ['list', 'kanban'],
      
      emptyState: {
        title: 'No contracts created yet',
        description: 'Create contracts to formalize job agreements',
        action: {
          label: 'Create Contract',
          icon: FileText
        }
      }
    }
  },
  
  tabs: [
    {
      id: 'overview',
      label: 'Overview',
      icon: Briefcase,
      type: 'overview',
      config: {
        widgets: [
          { type: 'metric', title: 'Total Jobs', metric: 'total_jobs' },
          { type: 'metric', title: 'Open Jobs', metric: 'open_jobs' },
          { type: 'metric', title: 'Active Assignments', metric: 'active_assignments' },
          { type: 'metric', title: 'Total Bids', metric: 'total_bids' },
          { type: 'chart', title: 'Job Status Distribution', chart: 'job_status_distribution' },
          { type: 'chart', title: 'Jobs by Category', chart: 'jobs_by_category' },
          { type: 'list', title: 'Recent Jobs', entity: 'jobs', limit: 5 },
          { type: 'list', title: 'Pending Assignments', entity: 'pending_assignments', limit: 5 }
        ],
        quickActions: [
          {
            label: 'Create Job',
            icon: Plus,
            action: 'create',
            entity: 'jobs'
          },
          {
            label: 'View Applications',
            icon: Users,
            action: 'view_applications'
          }
        ]
      }
    },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: Briefcase,
      entity: 'jobs',
      views: ['list', 'kanban', 'calendar']
    },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: Users,
      entity: 'assignments',
      views: ['list', 'kanban']
    },
    {
      id: 'bids',
      label: 'Bids',
      icon: DollarSign,
      entity: 'bids',
      views: ['list', 'kanban']
    },
    {
      id: 'contracts',
      label: 'Contracts',
      icon: FileText,
      entity: 'contracts',
      views: ['list', 'kanban']
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: CheckCircle,
      type: 'custom',
      component: () => null // Will be implemented separately
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      icon: Target,
      type: 'custom',
      component: () => null // Will be implemented separately
    },
    {
      id: 'rfps',
      label: 'RFPs',
      icon: AlertCircle,
      type: 'custom',
      component: () => null // Will be implemented separately
    }
  ],
  
  defaultTab: 'overview',
  
  headerActions: [
    {
      id: 'create-job',
      label: 'New Job',
      icon: Plus,
      variant: 'default',
      onClick: () => console.log('Create new job')
    },
    {
      id: 'bulk-assign',
      label: 'Bulk Assign',
      icon: Users,
      variant: 'outline',
      onClick: () => console.log('Bulk assign jobs')
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      variant: 'outline',
      onClick: () => console.log('Export jobs data')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      variant: 'ghost',
      onClick: () => console.log('Jobs settings')
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
    versioning: false,
    notifications: true,
    calendar: true,
    kanban: true
  },
  
  permissions: {
    view: ['owner', 'admin', 'manager', 'member', 'viewer'],
    create: ['owner', 'admin', 'manager', 'member'],
    update: ['owner', 'admin', 'manager', 'member'],
    delete: ['owner', 'admin', 'manager'],
    assign: ['owner', 'admin', 'manager']
  }
};

export default jobsModuleConfig;
