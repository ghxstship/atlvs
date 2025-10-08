import { z } from 'zod';
import { 
  Users,
  User,
  UserCheck,
  Award,
  Star,
  List,
  Network,
  UserPlus,
  BookOpen,
  Shield,
  Target,
  TrendingUp,
  Download,
  Upload,
  Plus
} from 'lucide-react';
import type { ModuleConfig } from '@ghxstship/ui/config/types';

// Schemas
const PersonSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  hire_date: z.date().optional(),
  employment_type: z.enum(['full_time', 'part_time', 'contractor', 'intern', 'volunteer']),
  status: z.enum(['active', 'inactive', 'on_leave', 'terminated']),
  manager_id: z.string().uuid().optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
  avatar_url: z.string().url().optional(),
  emergency_contact: z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string(),
    email: z.string().email().optional()
  }).optional(),
  created_at: z.date(),
  updated_at: z.date()
});

const RoleSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  department: z.string().optional(),
  level: z.enum(['entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive']),
  salary_range_min: z.number().positive().optional(),
  salary_range_max: z.number().positive().optional(),
  required_skills: z.array(z.string()).optional(),
  preferred_skills: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'draft']),
  created_at: z.date(),
  updated_at: z.date()
});

const CompetencySchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Competency name is required'),
  description: z.string().optional(),
  category: z.enum(['technical', 'soft_skills', 'leadership', 'domain_knowledge', 'certifications']),
  level_definitions: z.array(z.object({
    level: z.number().int().min(1).max(5),
    name: z.string(),
    description: z.string(),
    criteria: z.array(z.string()).optional()
  })).optional(),
  assessment_method: z.enum(['self_assessment', 'manager_review', 'peer_review', 'test', 'certification']),
  status: z.enum(['active', 'inactive', 'draft']),
  created_at: z.date(),
  updated_at: z.date()
});

const EndorsementSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  endorser_id: z.string().uuid(),
  endorsee_id: z.string().uuid(),
  competency_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  project_context: z.string().optional(),
  verified: z.boolean().default(false),
  verified_by: z.string().uuid().optional(),
  verified_at: z.date().optional(),
  status: z.enum(['pending', 'approved', 'rejected']),
  created_at: z.date(),
  updated_at: z.date()
});

const AssignmentSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  person_id: z.string().uuid(),
  project_id: z.string().uuid(),
  role_id: z.string().uuid().optional(),
  title: z.string().min(1, 'Assignment title is required'),
  description: z.string().optional(),
  start_date: z.date(),
  end_date: z.date().optional(),
  allocation_percentage: z.number().min(0).max(100).default(100),
  hourly_rate: z.number().positive().optional(),
  status: z.enum(['pending', 'active', 'completed', 'cancelled']),
  notes: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export const peopleModuleConfig: ModuleConfig = {
  id: 'people',
  name: 'People',
  description: 'Manage team members, roles, and competencies',
  icon: Users,
  color: 'purple',
  path: '/people',
  
  entities: {
    people: {
      table: 'people',
      singular: 'Person',
      plural: 'People',
      schema: PersonSchema,
      includes: ['manager:people(first_name,last_name)', 'user:users(avatar_url)'],
      searchFields: ['first_name', 'last_name', 'email', 'title', 'department'],
      orderBy: 'last_name.asc',
      
      fields: [
        { 
          key: 'first_name', 
          label: 'First Name', 
          type: 'text', 
          required: true,
          group: 'basic'
        },
        { 
          key: 'last_name', 
          label: 'Last Name', 
          type: 'text', 
          required: true,
          group: 'basic'
        },
        { 
          key: 'email', 
          label: 'Email', 
          type: 'email', 
          required: true,
          group: 'basic'
        },
        { 
          key: 'phone', 
          label: 'Phone', 
          type: 'text',
          group: 'basic'
        },
        { 
          key: 'title', 
          label: 'Job Title', 
          type: 'text',
          group: 'work'
        },
        { 
          key: 'department', 
          label: 'Department', 
          type: 'select',
          options: [
            { label: 'Engineering', value: 'engineering' },
            { label: 'Design', value: 'design' },
            { label: 'Product', value: 'product' },
            { label: 'Marketing', value: 'marketing' },
            { label: 'Sales', value: 'sales' },
            { label: 'Operations', value: 'operations' },
            { label: 'Finance', value: 'finance' },
            { label: 'HR', value: 'hr' },
            { label: 'Legal', value: 'legal' },
            { label: 'Other', value: 'other' },
          ],
          group: 'work'
        },
        { 
          key: 'employment_type', 
          label: 'Employment Type', 
          type: 'select',
          required: true,
          defaultValue: 'full_time',
          options: [
            { label: 'Full Time', value: 'full_time' },
            { label: 'Part Time', value: 'part_time' },
            { label: 'Contractor', value: 'contractor' },
            { label: 'Intern', value: 'intern' },
            { label: 'Volunteer', value: 'volunteer' },
          ],
          group: 'work'
        },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'active',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'On Leave', value: 'on_leave' },
            { label: 'Terminated', value: 'terminated' },
          ],
          group: 'work'
        },
        { 
          key: 'hire_date', 
          label: 'Hire Date', 
          type: 'date',
          group: 'work'
        },
        { 
          key: 'manager_id', 
          label: 'Manager', 
          type: 'select',
          options: 'people',
          group: 'work'
        },
        { 
          key: 'location', 
          label: 'Location', 
          type: 'text',
          group: 'work'
        },
        { 
          key: 'skills', 
          label: 'Skills', 
          type: 'tags',
          placeholder: 'Add skills...',
          group: 'skills'
        },
        { 
          key: 'bio', 
          label: 'Bio', 
          type: 'textarea',
          rows: 3,
          placeholder: 'Brief professional bio...',
          group: 'personal'
        },
        { 
          key: 'avatar_url', 
          label: 'Profile Photo', 
          type: 'file',
          accept: 'image/*',
          maxSize: 2 * 1024 * 1024, // 2MB
          group: 'personal'
        }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'lg',
      deleteConfirmation: true,
      
      defaultViews: ['grid', 'list', 'table'],
      
      filters: [
        {
          key: 'department',
          label: 'Department',
          type: 'multiselect',
          options: ['engineering', 'design', 'product', 'marketing', 'sales', 'operations', 'finance', 'hr', 'legal', 'other']
        },
        {
          key: 'employment_type',
          label: 'Employment Type',
          type: 'multiselect',
          options: ['full_time', 'part_time', 'contractor', 'intern', 'volunteer']
        },
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          options: ['active', 'inactive', 'on_leave', 'terminated']
        }
      ],
      
      emptyState: {
        title: 'No team members yet',
        description: 'Add your first team member to get started',
        icon: UserPlus,
        action: {
          label: 'Add Person',
          onClick: () => console.log('Add person')
        }
      }
    },
    
    roles: {
      table: 'people_roles',
      singular: 'Role',
      plural: 'Roles',
      schema: RoleSchema,
      searchFields: ['name', 'description', 'department'],
      orderBy: 'name.asc',
      
      fields: [
        { key: 'name', label: 'Role Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { key: 'department', label: 'Department', type: 'text' },
        { 
          key: 'level', 
          label: 'Level', 
          type: 'select',
          required: true,
          options: [
            { label: 'Entry', value: 'entry' },
            { label: 'Junior', value: 'junior' },
            { label: 'Mid', value: 'mid' },
            { label: 'Senior', value: 'senior' },
            { label: 'Lead', value: 'lead' },
            { label: 'Manager', value: 'manager' },
            { label: 'Director', value: 'director' },
            { label: 'Executive', value: 'executive' },
          ]
        },
        { key: 'salary_range_min', label: 'Min Salary', type: 'currency' },
        { key: 'salary_range_max', label: 'Max Salary', type: 'currency' },
        { key: 'required_skills', label: 'Required Skills', type: 'tags' },
        { key: 'preferred_skills', label: 'Preferred Skills', type: 'tags' },
        { key: 'responsibilities', label: 'Responsibilities', type: 'tags' },
        { key: 'qualifications', label: 'Qualifications', type: 'tags' },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'active',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Draft', value: 'draft' },
          ]
        }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'lg',
      
      defaultViews: ['list', 'grid']
    },
    
    competencies: {
      table: 'people_competencies',
      singular: 'Competency',
      plural: 'Competencies',
      schema: CompetencySchema,
      searchFields: ['name', 'description', 'category'],
      orderBy: 'name.asc',
      
      fields: [
        { key: 'name', label: 'Competency Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { 
          key: 'category', 
          label: 'Category', 
          type: 'select',
          required: true,
          options: [
            { label: 'Technical', value: 'technical' },
            { label: 'Soft Skills', value: 'soft_skills' },
            { label: 'Leadership', value: 'leadership' },
            { label: 'Domain Knowledge', value: 'domain_knowledge' },
            { label: 'Certifications', value: 'certifications' },
          ]
        },
        { 
          key: 'assessment_method', 
          label: 'Assessment Method', 
          type: 'select',
          required: true,
          options: [
            { label: 'Self Assessment', value: 'self_assessment' },
            { label: 'Manager Review', value: 'manager_review' },
            { label: 'Peer Review', value: 'peer_review' },
            { label: 'Test', value: 'test' },
            { label: 'Certification', value: 'certification' },
          ]
        },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'active',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Draft', value: 'draft' },
          ]
        }
      ],
      
      drawerLayout: 'single',
      drawerSize: 'md',
      
      defaultViews: ['list', 'grid']
    },
    
    endorsements: {
      table: 'people_endorsements',
      singular: 'Endorsement',
      plural: 'Endorsements',
      schema: EndorsementSchema,
      includes: [
        'endorser:people(first_name,last_name)',
        'endorsee:people(first_name,last_name)',
        'competency:people_competencies(name)'
      ],
      searchFields: ['comment', 'project_context'],
      orderBy: 'created_at.desc',
      
      fields: [
        { key: 'endorsee_id', label: 'Person', type: 'select', required: true, options: 'people' },
        { key: 'competency_id', label: 'Competency', type: 'select', required: true, options: 'competencies' },
        { 
          key: 'rating', 
          label: 'Rating', 
          type: 'select',
          required: true,
          options: [
            { label: '1 - Beginner', value: '1' },
            { label: '2 - Developing', value: '2' },
            { label: '3 - Proficient', value: '3' },
            { label: '4 - Advanced', value: '4' },
            { label: '5 - Expert', value: '5' },
          ]
        },
        { key: 'comment', label: 'Comment', type: 'textarea', rows: 3 },
        { key: 'project_context', label: 'Project Context', type: 'text' },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'pending',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
          ]
        }
      ],
      
      drawerLayout: 'single',
      drawerSize: 'md',
      
      defaultViews: ['list', 'grid'],
      
      customActions: [
        {
          id: 'approve',
          label: 'Approve',
          onClick: async (endorsement) => {
            console.log('Approving endorsement:', endorsement);
          },
          condition: (endorsement) => endorsement.status === 'pending'
        },
        {
          id: 'reject',
          label: 'Reject',
          onClick: async (endorsement) => {
            console.log('Rejecting endorsement:', endorsement);
          },
          condition: (endorsement) => endorsement.status === 'pending'
        }
      ]
    },
    
    assignments: {
      table: 'people_assignments',
      singular: 'Assignment',
      plural: 'Assignments',
      schema: AssignmentSchema,
      includes: [
        'person:people(first_name,last_name)',
        'project:projects(name)',
        'role:people_roles(name)'
      ],
      searchFields: ['title', 'description'],
      orderBy: 'start_date.desc',
      
      fields: [
        { key: 'person_id', label: 'Person', type: 'select', required: true, options: 'people' },
        { key: 'project_id', label: 'Project', type: 'select', required: true, options: 'projects' },
        { key: 'role_id', label: 'Role', type: 'select', options: 'roles' },
        { key: 'title', label: 'Assignment Title', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { key: 'start_date', label: 'Start Date', type: 'date', required: true },
        { key: 'end_date', label: 'End Date', type: 'date' },
        { 
          key: 'allocation_percentage', 
          label: 'Allocation %', 
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 100
        },
        { key: 'hourly_rate', label: 'Hourly Rate', type: 'currency' },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'pending',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Active', value: 'active' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
          ]
        },
        { key: 'notes', label: 'Notes', type: 'textarea', rows: 3 }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'lg',
      
      defaultViews: ['list', 'kanban', 'calendar']
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
            id: 'total-people',
            type: 'metric',
            title: 'Total People',
            metric: 'total_people',
            icon: Users,
            color: 'primary',
            span: 3
          },
          {
            id: 'active-assignments',
            type: 'metric',
            title: 'Active Assignments',
            metric: 'active_assignments',
            icon: UserCheck,
            color: 'success',
            span: 3
          },
          {
            id: 'pending-endorsements',
            type: 'metric',
            title: 'Pending Endorsements',
            metric: 'pending_endorsements',
            icon: Star,
            color: 'warning',
            span: 3
          },
          {
            id: 'team-utilization',
            type: 'metric',
            title: 'Team Utilization',
            metric: 'team_utilization',
            icon: TrendingUp,
            color: 'primary',
            span: 3
          },
          {
            id: 'department-breakdown',
            type: 'chart',
            title: 'Department Breakdown',
            chart: 'department_breakdown',
            chartType: 'donut',
            span: 6
          },
          {
            id: 'skills-matrix',
            type: 'chart',
            title: 'Skills Matrix',
            chart: 'skills_matrix',
            chartType: 'bar',
            span: 6
          },
          {
            id: 'recent-hires',
            type: 'list',
            title: 'Recent Hires',
            entity: 'people',
            filters: { status: 'active' },
            limit: 5,
            span: 6
          },
          {
            id: 'upcoming-reviews',
            type: 'list',
            title: 'Upcoming Reviews',
            entity: 'assignments',
            filters: { status: 'active' },
            limit: 5,
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
      id: 'directory',
      label: 'Directory',
      icon: Users,
      entity: 'people',
      views: ['grid', 'list', 'table']
    },
    {
      id: 'roles',
      label: 'Roles',
      icon: Shield,
      entity: 'roles',
      views: ['list', 'grid']
    },
    {
      id: 'competencies',
      label: 'Competencies',
      icon: Award,
      entity: 'competencies',
      views: ['list', 'grid']
    },
    {
      id: 'endorsements',
      label: 'Endorsements',
      icon: Star,
      entity: 'endorsements',
      views: ['list', 'grid']
    },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: UserCheck,
      entity: 'assignments',
      views: ['list', 'kanban', 'calendar']
    },
    {
      id: 'network',
      label: 'Network',
      icon: Network,
      type: 'custom',
      component: () => null // Will be implemented separately
    },
    {
      id: 'onboarding',
      label: 'Onboarding',
      icon: UserPlus,
      type: 'custom',
      component: () => null // Will be implemented separately
    },
    {
      id: 'training',
      label: 'Training',
      icon: BookOpen,
      type: 'custom',
      component: () => null // Will be implemented separately
    }
  ],
  
  defaultTab: 'overview',
  
  headerActions: [
    {
      id: 'add-person',
      label: 'Add Person',
      icon: Plus,
      variant: 'default',
      onClick: () => console.log('Add new person')
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      variant: 'outline',
      onClick: () => console.log('Export people data')
    },
    {
      id: 'import',
      label: 'Import',
      icon: Upload,
      variant: 'outline',
      onClick: () => console.log('Import people data')
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
    notifications: true
  },
  
  permissions: {
    view: ['owner', 'admin', 'manager', 'member', 'viewer'],
    create: ['owner', 'admin', 'manager'],
    update: ['owner', 'admin', 'manager'],
    delete: ['owner', 'admin']
  }
};

export default peopleModuleConfig;
