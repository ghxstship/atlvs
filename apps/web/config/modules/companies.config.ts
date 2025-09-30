import { z } from 'zod';
import { 
  Building2,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  FileText,
  CreditCard,
  Handshake,
  Star,
  TrendingUp,
  Download,
  Upload,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import type { ModuleConfig } from '@ghxstship/ui/config/types';

// Schemas
const CompanySchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Company name is required'),
  legal_name: z.string().optional(),
  type: z.enum(['client', 'vendor', 'partner', 'competitor', 'prospect']),
  industry: z.string().optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  status: z.enum(['active', 'inactive', 'prospect', 'archived']),
  website: z.string().url().optional(),
  description: z.string().optional(),
  logo_url: z.string().url().optional(),
  founded_year: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  employee_count: z.number().int().positive().optional(),
  annual_revenue: z.number().positive().optional(),
  tax_id: z.string().optional(),
  registration_number: z.string().optional(),
  tags: z.array(z.string()).optional(),
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

const ContactSchema = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  title: z.string().optional(),
  department: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  is_primary: z.boolean().default(false),
  is_decision_maker: z.boolean().default(false),
  linkedin_url: z.string().url().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive', 'left_company']),
  created_at: z.date(),
  updated_at: z.date(),
});

const AddressSchema = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  type: z.enum(['headquarters', 'office', 'warehouse', 'retail', 'other']),
  name: z.string().optional(),
  address_line_1: z.string().min(1, 'Address is required'),
  address_line_2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  is_primary: z.boolean().default(false),
  is_billing: z.boolean().default(false),
  is_shipping: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date(),
});

const ContractSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  company_id: z.string().uuid(),
  title: z.string().min(1, 'Contract title is required'),
  type: z.enum(['service', 'product', 'nda', 'partnership', 'employment', 'other']),
  status: z.enum(['draft', 'pending', 'active', 'expired', 'terminated', 'renewed']),
  value: z.number().positive().optional(),
  currency: z.string().default('USD'),
  start_date: z.date(),
  end_date: z.date().optional(),
  renewal_date: z.date().optional(),
  auto_renew: z.boolean().default(false),
  renewal_period_months: z.number().int().positive().optional(),
  payment_terms: z.string().optional(),
  description: z.string().optional(),
  file_url: z.string().url().optional(),
  signed_by_company: z.boolean().default(false),
  signed_by_client: z.boolean().default(false),
  signed_date: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

const OpportunitySchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  company_id: z.string().uuid(),
  title: z.string().min(1, 'Opportunity title is required'),
  description: z.string().optional(),
  stage: z.enum(['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
  value: z.number().positive().optional(),
  probability: z.number().min(0).max(100).optional(),
  expected_close_date: z.date().optional(),
  actual_close_date: z.date().optional(),
  source: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
  next_action: z.string().optional(),
  next_action_date: z.date().optional(),
  tags: z.array(z.string()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const companiesModuleConfig: ModuleConfig = {
  id: 'companies',
  name: 'Companies',
  description: 'Manage clients, vendors, partners, and business relationships',
  icon: Building2,
  color: 'blue',
  path: '/companies',
  
  entities: {
    companies: {
      table: 'companies',
      singular: 'Company',
      plural: 'Companies',
      schema: CompanySchema,
      searchFields: ['name', 'legal_name', 'industry', 'description'],
      orderBy: 'name.asc',
      
      fields: [
        { 
          key: 'name', 
          label: 'Company Name', 
          type: 'text', 
          required: true,
          placeholder: 'Enter company name',
          group: 'basic'
        },
        { 
          key: 'legal_name', 
          label: 'Legal Name', 
          type: 'text',
          placeholder: 'Legal business name',
          group: 'basic'
        },
        { 
          key: 'type', 
          label: 'Company Type', 
          type: 'select',
          required: true,
          options: [
            { label: 'Client', value: 'client' },
            { label: 'Vendor', value: 'vendor' },
            { label: 'Partner', value: 'partner' },
            { label: 'Competitor', value: 'competitor' },
            { label: 'Prospect', value: 'prospect' },
          ],
          group: 'basic'
        },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'active',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Prospect', value: 'prospect' },
            { label: 'Archived', value: 'archived' },
          ],
          group: 'basic'
        },
        { 
          key: 'industry', 
          label: 'Industry', 
          type: 'select',
          options: [
            { label: 'Technology', value: 'technology' },
            { label: 'Healthcare', value: 'healthcare' },
            { label: 'Finance', value: 'finance' },
            { label: 'Manufacturing', value: 'manufacturing' },
            { label: 'Retail', value: 'retail' },
            { label: 'Education', value: 'education' },
            { label: 'Entertainment', value: 'entertainment' },
            { label: 'Real Estate', value: 'real_estate' },
            { label: 'Construction', value: 'construction' },
            { label: 'Other', value: 'other' },
          ],
          group: 'details'
        },
        { 
          key: 'size', 
          label: 'Company Size', 
          type: 'select',
          options: [
            { label: 'Startup (1-10)', value: 'startup' },
            { label: 'Small (11-50)', value: 'small' },
            { label: 'Medium (51-200)', value: 'medium' },
            { label: 'Large (201-1000)', value: 'large' },
            { label: 'Enterprise (1000+)', value: 'enterprise' },
          ],
          group: 'details'
        },
        { 
          key: 'website', 
          label: 'Website', 
          type: 'text',
          placeholder: 'https://example.com',
          group: 'contact'
        },
        { 
          key: 'description', 
          label: 'Description', 
          type: 'textarea',
          rows: 3,
          placeholder: 'Brief description of the company...',
          group: 'details'
        },
        { 
          key: 'founded_year', 
          label: 'Founded Year', 
          type: 'number',
          min: 1800,
          max: new Date().getFullYear(),
          group: 'details'
        },
        { 
          key: 'employee_count', 
          label: 'Employee Count', 
          type: 'number',
          min: 1,
          group: 'details'
        },
        { 
          key: 'annual_revenue', 
          label: 'Annual Revenue', 
          type: 'currency',
          group: 'financial'
        },
        { 
          key: 'tax_id', 
          label: 'Tax ID', 
          type: 'text',
          group: 'legal'
        },
        { 
          key: 'registration_number', 
          label: 'Registration Number', 
          type: 'text',
          group: 'legal'
        },
        { 
          key: 'rating', 
          label: 'Rating', 
          type: 'select',
          options: [
            { label: '1 Star', value: '1' },
            { label: '2 Stars', value: '2' },
            { label: '3 Stars', value: '3' },
            { label: '4 Stars', value: '4' },
            { label: '5 Stars', value: '5' },
          ],
          group: 'assessment'
        },
        { 
          key: 'tags', 
          label: 'Tags', 
          type: 'tags',
          placeholder: 'Add tags...',
          group: 'metadata'
        },
        { 
          key: 'logo_url', 
          label: 'Company Logo', 
          type: 'file',
          accept: 'image/*',
          maxSize: 2 * 1024 * 1024, // 2MB
          group: 'branding'
        },
        { 
          key: 'notes', 
          label: 'Notes', 
          type: 'textarea',
          rows: 4,
          placeholder: 'Internal notes...',
          group: 'metadata'
        }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'xl',
      deleteConfirmation: true,
      
      defaultViews: ['grid', 'list', 'table'],
      
      filters: [
        {
          key: 'type',
          label: 'Company Type',
          type: 'multiselect',
          options: ['client', 'vendor', 'partner', 'competitor', 'prospect']
        },
        {
          key: 'industry',
          label: 'Industry',
          type: 'multiselect',
          options: ['technology', 'healthcare', 'finance', 'manufacturing', 'retail', 'education', 'entertainment', 'real_estate', 'construction', 'other']
        },
        {
          key: 'size',
          label: 'Company Size',
          type: 'select',
          options: ['startup', 'small', 'medium', 'large', 'enterprise']
        },
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          options: ['active', 'inactive', 'prospect', 'archived']
        }
      ],
      
      emptyState: {
        title: 'No companies yet',
        description: 'Add your first company to start building relationships',
        icon: Building,
        action: {
          label: 'Add Company',
          onClick: () => console.log('Add company')
        }
      },
      
      bulkActions: {
        archive: async (ids: string[]) => {
          console.log('Archiving companies:', ids);
        },
        export: async (ids: string[]) => {
          console.log('Exporting companies:', ids);
        },
        tag: async (ids: string[]) => {
          console.log('Tagging companies:', ids);
        }
      }
    },
    
    contacts: {
      table: 'company_contacts',
      singular: 'Contact',
      plural: 'Contacts',
      schema: ContactSchema,
      includes: ['company:companies(name)'],
      searchFields: ['first_name', 'last_name', 'email', 'title'],
      orderBy: 'last_name.asc',
      
      fields: [
        { key: 'company_id', label: 'Company', type: 'select', required: true, options: 'companies' },
        { key: 'first_name', label: 'First Name', type: 'text', required: true },
        { key: 'last_name', label: 'Last Name', type: 'text', required: true },
        { key: 'title', label: 'Job Title', type: 'text' },
        { key: 'department', label: 'Department', type: 'text' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'mobile', label: 'Mobile', type: 'text' },
        { key: 'linkedin_url', label: 'LinkedIn', type: 'text' },
        { key: 'is_primary', label: 'Primary Contact', type: 'switch' },
        { key: 'is_decision_maker', label: 'Decision Maker', type: 'switch' },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'active',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Left Company', value: 'left_company' },
          ]
        },
        { key: 'notes', label: 'Notes', type: 'textarea', rows: 3 }
      ],
      
      drawerLayout: 'single',
      drawerSize: 'md',
      
      defaultViews: ['list', 'grid']
    },
    
    addresses: {
      table: 'company_addresses',
      singular: 'Address',
      plural: 'Addresses',
      schema: AddressSchema,
      includes: ['company:companies(name)'],
      searchFields: ['name', 'address_line_1', 'city', 'country'],
      orderBy: 'is_primary.desc',
      
      fields: [
        { key: 'company_id', label: 'Company', type: 'select', required: true, options: 'companies' },
        { 
          key: 'type', 
          label: 'Address Type', 
          type: 'select',
          required: true,
          options: [
            { label: 'Headquarters', value: 'headquarters' },
            { label: 'Office', value: 'office' },
            { label: 'Warehouse', value: 'warehouse' },
            { label: 'Retail', value: 'retail' },
            { label: 'Other', value: 'other' },
          ]
        },
        { key: 'name', label: 'Location Name', type: 'text' },
        { key: 'address_line_1', label: 'Address Line 1', type: 'text', required: true },
        { key: 'address_line_2', label: 'Address Line 2', type: 'text' },
        { key: 'city', label: 'City', type: 'text', required: true },
        { key: 'state', label: 'State/Province', type: 'text' },
        { key: 'postal_code', label: 'Postal Code', type: 'text' },
        { key: 'country', label: 'Country', type: 'text', required: true },
        { key: 'is_primary', label: 'Primary Address', type: 'switch' },
        { key: 'is_billing', label: 'Billing Address', type: 'switch' },
        { key: 'is_shipping', label: 'Shipping Address', type: 'switch' }
      ],
      
      drawerLayout: 'single',
      drawerSize: 'md',
      
      defaultViews: ['list']
    },
    
    contracts: {
      table: 'company_contracts',
      singular: 'Contract',
      plural: 'Contracts',
      schema: ContractSchema,
      includes: ['company:companies(name)'],
      searchFields: ['title', 'description'],
      orderBy: 'start_date.desc',
      
      fields: [
        { key: 'company_id', label: 'Company', type: 'select', required: true, options: 'companies' },
        { key: 'title', label: 'Contract Title', type: 'text', required: true },
        { 
          key: 'type', 
          label: 'Contract Type', 
          type: 'select',
          required: true,
          options: [
            { label: 'Service Agreement', value: 'service' },
            { label: 'Product Purchase', value: 'product' },
            { label: 'NDA', value: 'nda' },
            { label: 'Partnership', value: 'partnership' },
            { label: 'Employment', value: 'employment' },
            { label: 'Other', value: 'other' },
          ]
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
            { label: 'Expired', value: 'expired' },
            { label: 'Terminated', value: 'terminated' },
            { label: 'Renewed', value: 'renewed' },
          ]
        },
        { key: 'value', label: 'Contract Value', type: 'currency' },
        { key: 'start_date', label: 'Start Date', type: 'date', required: true },
        { key: 'end_date', label: 'End Date', type: 'date' },
        { key: 'renewal_date', label: 'Renewal Date', type: 'date' },
        { key: 'auto_renew', label: 'Auto Renew', type: 'switch' },
        { key: 'renewal_period_months', label: 'Renewal Period (Months)', type: 'number', min: 1 },
        { key: 'payment_terms', label: 'Payment Terms', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { key: 'file_url', label: 'Contract File', type: 'file', accept: 'application/pdf,.doc,.docx' },
        { key: 'signed_by_company', label: 'Signed by Company', type: 'switch' },
        { key: 'signed_by_client', label: 'Signed by Client', type: 'switch' },
        { key: 'signed_date', label: 'Signed Date', type: 'date' }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'lg',
      
      defaultViews: ['list', 'kanban'],
      
      customActions: [
        {
          id: 'renew',
          label: 'Renew Contract',
          onClick: async (contract) => {
            console.log('Renewing contract:', contract);
          },
          condition: (contract) => contract.status === 'active' && contract.end_date
        },
        {
          id: 'terminate',
          label: 'Terminate',
          onClick: async (contract) => {
            console.log('Terminating contract:', contract);
          },
          condition: (contract) => contract.status === 'active'
        }
      ]
    },
    
    opportunities: {
      table: 'company_opportunities',
      singular: 'Opportunity',
      plural: 'Opportunities',
      schema: OpportunitySchema,
      includes: ['company:companies(name)', 'assigned_to:users(name)'],
      searchFields: ['title', 'description', 'source'],
      orderBy: 'expected_close_date.asc',
      
      fields: [
        { key: 'company_id', label: 'Company', type: 'select', required: true, options: 'companies' },
        { key: 'title', label: 'Opportunity Title', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { 
          key: 'stage', 
          label: 'Stage', 
          type: 'select',
          required: true,
          options: [
            { label: 'Lead', value: 'lead' },
            { label: 'Qualified', value: 'qualified' },
            { label: 'Proposal', value: 'proposal' },
            { label: 'Negotiation', value: 'negotiation' },
            { label: 'Closed Won', value: 'closed_won' },
            { label: 'Closed Lost', value: 'closed_lost' },
          ]
        },
        { key: 'value', label: 'Opportunity Value', type: 'currency' },
        { key: 'probability', label: 'Probability (%)', type: 'number', min: 0, max: 100 },
        { key: 'expected_close_date', label: 'Expected Close Date', type: 'date' },
        { key: 'actual_close_date', label: 'Actual Close Date', type: 'date' },
        { key: 'source', label: 'Lead Source', type: 'text' },
        { key: 'assigned_to', label: 'Assigned To', type: 'select', options: 'users' },
        { key: 'next_action', label: 'Next Action', type: 'text' },
        { key: 'next_action_date', label: 'Next Action Date', type: 'date' },
        { key: 'tags', label: 'Tags', type: 'tags' }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'lg',
      
      defaultViews: ['kanban', 'list', 'calendar']
    }
  },
  
  tabs: [
    {
      id: 'overview',
      label: 'Overview',
      icon: TrendingUp,
      type: 'overview',
      config: {
        widgets: [
          {
            id: 'total-companies',
            type: 'metric',
            title: 'Total Companies',
            metric: 'total_companies',
            icon: Building2,
            color: 'primary',
            span: 3
          },
          {
            id: 'active-contracts',
            type: 'metric',
            title: 'Active Contracts',
            metric: 'active_contracts',
            icon: FileText,
            color: 'success',
            span: 3
          },
          {
            id: 'open-opportunities',
            type: 'metric',
            title: 'Open Opportunities',
            metric: 'open_opportunities',
            icon: Handshake,
            color: 'warning',
            span: 3
          },
          {
            id: 'pipeline-value',
            type: 'metric',
            title: 'Pipeline Value',
            metric: 'pipeline_value',
            icon: CreditCard,
            color: 'success',
            span: 3
          },
          {
            id: 'company-types',
            type: 'chart',
            title: 'Company Types',
            chart: 'company_types',
            chartType: 'donut',
            span: 6
          },
          {
            id: 'revenue-trend',
            type: 'chart',
            title: 'Revenue Trend',
            chart: 'revenue_trend',
            chartType: 'line',
            span: 6
          },
          {
            id: 'recent-companies',
            type: 'list',
            title: 'Recent Companies',
            entity: 'companies',
            limit: 5,
            span: 6
          },
          {
            id: 'expiring-contracts',
            type: 'list',
            title: 'Expiring Contracts',
            entity: 'contracts',
            filters: { status: 'active' },
            limit: 5,
            span: 6
          }
        ],
        layout: 'grid',
        columns: 12,
        gap: 'md',
        refresh: true,
        refreshInterval: 300000
      }
    },
    {
      id: 'directory',
      label: 'Directory',
      icon: Building2,
      entity: 'companies',
      views: ['grid', 'list', 'table']
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: Users,
      entity: 'contacts',
      views: ['list', 'grid']
    },
    {
      id: 'addresses',
      label: 'Addresses',
      icon: MapPin,
      entity: 'addresses',
      views: ['list', 'map']
    },
    {
      id: 'contracts',
      label: 'Contracts',
      icon: FileText,
      entity: 'contracts',
      views: ['list', 'kanban']
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      icon: Handshake,
      entity: 'opportunities',
      views: ['kanban', 'list', 'calendar']
    }
  ],
  
  defaultTab: 'overview',
  
  headerActions: [
    {
      id: 'add-company',
      label: 'Add Company',
      icon: Plus,
      variant: 'default',
      onClick: () => console.log('Add new company')
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      variant: 'outline',
      onClick: () => console.log('Export companies data')
    },
    {
      id: 'import',
      label: 'Import',
      icon: Upload,
      variant: 'outline',
      onClick: () => console.log('Import companies data')
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

export default companiesModuleConfig;
