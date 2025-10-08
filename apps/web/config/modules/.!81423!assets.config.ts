import { z } from 'zod';
import { 
  Package,
  Truck,
  MapPin,
  QrCode,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  FileText,
  Camera,
  TrendingUp,
  Download,
  Upload,
  Plus,
  Settings
} from 'lucide-react';
import type { ModuleConfig } from '@ghxstship/ui/config/types';

// Schemas
const AssetSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Asset name is required'),
  asset_tag: z.string().min(1, 'Asset tag is required'),
  serial_number: z.string().optional(),
  barcode: z.string().optional(),
  qr_code: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['available', 'in_use', 'maintenance', 'retired', 'lost', 'damaged']),
  condition: z.enum(['excellent', 'good', 'fair', 'poor', 'needs_repair']),
  location_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
  purchase_date: z.date().optional(),
  purchase_price: z.number().positive().optional(),
  warranty_expiry: z.date().optional(),
  depreciation_rate: z.number().min(0).max(100).optional(),
  current_value: z.number().positive().optional(),
  supplier_id: z.string().uuid().optional(),
  notes: z.string().optional(),
  image_urls: z.array(z.string().url()).optional(),
  specifications: z.record(z.any()).optional(),
  created_at: z.date(),
  updated_at: z.date()
});

const LocationSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Location name is required'),
  type: z.enum(['building', 'floor', 'room', 'area', 'storage', 'vehicle', 'site']),
  parent_location_id: z.string().uuid().optional(),
  address: z.string().optional(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number()
  }).optional(),
  capacity: z.number().int().positive().optional(),
  manager_id: z.string().uuid().optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.date(),
  updated_at: z.date()
});

const MaintenanceSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  asset_id: z.string().uuid(),
  type: z.enum(['preventive', 'corrective', 'emergency', 'inspection', 'calibration']),
  title: z.string().min(1, 'Maintenance title is required'),
  description: z.string().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'overdue']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  scheduled_date: z.date(),
  completed_date: z.date().optional(),
  assigned_to: z.string().uuid().optional(),
  estimated_hours: z.number().positive().optional(),
  actual_hours: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  parts_used: z.array(z.object({
    part_name: z.string(),
    quantity: z.number().int().positive(),
    cost: z.number().positive().optional()
  })).optional(),
  notes: z.string().optional(),
  attachments: z.array(z.string().url()).optional(),
  next_maintenance_date: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

const AssignmentSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  asset_id: z.string().uuid(),
  assigned_to: z.string().uuid(),
  assigned_by: z.string().uuid(),
  assignment_date: z.date(),
  return_date: z.date().optional(),
  expected_return_date: z.date().optional(),
  purpose: z.string().optional(),
  location_id: z.string().uuid().optional(),
  status: z.enum(['active', 'returned', 'overdue', 'lost']),
  condition_at_assignment: z.enum(['excellent', 'good', 'fair', 'poor']),
  condition_at_return: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  notes: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

const AuditSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Audit name is required'),
  description: z.string().optional(),
  audit_date: z.date(),
  auditor_id: z.string().uuid(),
  location_ids: z.array(z.string().uuid()).optional(),
  category_filter: z.string().optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']),
  total_assets_expected: z.number().int().optional(),
  total_assets_found: z.number().int().optional(),
  discrepancies_found: z.number().int().optional(),
  completion_percentage: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export const assetsModuleConfig: ModuleConfig = {
  id: 'assets',
  name: 'Assets',
  description: 'Manage physical assets, inventory, and equipment lifecycle',
  icon: Package,
  color: 'green',
  path: '/assets',
  
  entities: {
    assets: {
      table: 'assets',
      singular: 'Asset',
      plural: 'Assets',
      schema: AssetSchema,
      includes: [
        'location:asset_locations(name)',
        'assigned_to:users(name,avatar)',
        'supplier:companies(name)'
      ],
      searchFields: ['name', 'asset_tag', 'serial_number', 'barcode', 'brand', 'model'],
      orderBy: 'asset_tag.asc',
      
      fields: [
        { 
          key: 'name', 
          label: 'Asset Name', 
          type: 'text', 
          required: true,
          placeholder: 'Enter asset name',
          group: 'basic'
        },
        { 
          key: 'asset_tag', 
          label: 'Asset Tag', 
          type: 'text', 
          required: true,
          placeholder: 'Unique identifier',
          group: 'basic'
        },
        { 
          key: 'serial_number', 
          label: 'Serial Number', 
          type: 'text',
          group: 'basic'
        },
        { 
          key: 'barcode', 
          label: 'Barcode', 
          type: 'text',
          group: 'identification'
        },
        { 
          key: 'qr_code', 
          label: 'QR Code', 
          type: 'text',
          group: 'identification'
        },
        { 
          key: 'category', 
          label: 'Category', 
          type: 'select',
          required: true,
          options: [
            { label: 'IT Equipment', value: 'it_equipment' },
            { label: 'Office Furniture', value: 'office_furniture' },
            { label: 'Vehicles', value: 'vehicles' },
            { label: 'Machinery', value: 'machinery' },
            { label: 'Tools', value: 'tools' },
            { label: 'Electronics', value: 'electronics' },
            { label: 'Safety Equipment', value: 'safety_equipment' },
            { label: 'Other', value: 'other' },
          ],
          group: 'classification'
        },
        { 
          key: 'subcategory', 
          label: 'Subcategory', 
          type: 'text',
          group: 'classification'
        },
        { 
          key: 'brand', 
          label: 'Brand', 
          type: 'text',
          group: 'details'
        },
        { 
          key: 'model', 
          label: 'Model', 
          type: 'text',
          group: 'details'
        },
        { 
          key: 'description', 
          label: 'Description', 
          type: 'textarea',
          rows: 3,
          group: 'details'
        },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'available',
          options: [
            { label: 'Available', value: 'available' },
            { label: 'In Use', value: 'in_use' },
            { label: 'Maintenance', value: 'maintenance' },
            { label: 'Retired', value: 'retired' },
            { label: 'Lost', value: 'lost' },
            { label: 'Damaged', value: 'damaged' },
          ],
          group: 'status'
        },
        { 
          key: 'condition', 
          label: 'Condition', 
          type: 'select',
          defaultValue: 'good',
          options: [
            { label: 'Excellent', value: 'excellent' },
            { label: 'Good', value: 'good' },
            { label: 'Fair', value: 'fair' },
            { label: 'Poor', value: 'poor' },
            { label: 'Needs Repair', value: 'needs_repair' },
          ],
          group: 'status'
        },
        { 
          key: 'location_id', 
          label: 'Location', 
          type: 'select',
          options: 'locations',
          group: 'assignment'
        },
        { 
          key: 'assigned_to', 
          label: 'Assigned To', 
          type: 'select',
          options: 'users',
          group: 'assignment'
        },
        { 
          key: 'purchase_date', 
          label: 'Purchase Date', 
          type: 'date',
          group: 'financial'
        },
        { 
          key: 'purchase_price', 
          label: 'Purchase Price', 
          type: 'currency',
          group: 'financial'
        },
        { 
          key: 'current_value', 
          label: 'Current Value', 
          type: 'currency',
          group: 'financial'
        },
        { 
          key: 'depreciation_rate', 
          label: 'Depreciation Rate (%)', 
          type: 'number',
          min: 0,
          max: 100,
          group: 'financial'
        },
        { 
          key: 'warranty_expiry', 
          label: 'Warranty Expiry', 
          type: 'date',
          group: 'warranty'
        },
        { 
          key: 'supplier_id', 
          label: 'Supplier', 
          type: 'select',
          options: 'companies',
          group: 'procurement'
        },
        { 
          key: 'image_urls', 
          label: 'Asset Images', 
          type: 'file',
          accept: 'image/*',
          multiple: true,
          maxFiles: 5,
          group: 'media'
        },
        { 
          key: 'notes', 
          label: 'Notes', 
          type: 'textarea',
          rows: 4,
          group: 'additional'
        }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'xl',
      deleteConfirmation: true,
      
      defaultViews: ['grid', 'list', 'table'],
      
      filters: [
        {
          key: 'category',
          label: 'Category',
          type: 'multiselect',
          options: ['it_equipment', 'office_furniture', 'vehicles', 'machinery', 'tools', 'electronics', 'safety_equipment', 'other']
        },
        {
          key: 'status',
          label: 'Status',
          type: 'multiselect',
          options: ['available', 'in_use', 'maintenance', 'retired', 'lost', 'damaged']
        },
        {
          key: 'condition',
          label: 'Condition',
          type: 'select',
          options: ['excellent', 'good', 'fair', 'poor', 'needs_repair']
        },
        {
          key: 'location_id',
          label: 'Location',
          type: 'select',
          options: 'locations'
        }
      ],
      
      emptyState: {
        title: 'No assets yet',
        description: 'Add your first asset to start tracking inventory',
        icon: Package,
        action: {
          label: 'Add Asset',
          onClick: () => console.log('Add asset')
        }
      },
      
      bulkActions: {
        assign: async (ids: string[]) => {
          console.log('Bulk assigning assets:', ids);
        },
        move: async (ids: string[]) => {
          console.log('Bulk moving assets:', ids);
        },
        retire: async (ids: string[]) => {
          console.log('Bulk retiring assets:', ids);
        },
        export: async (ids: string[]) => {
          console.log('Exporting assets:', ids);
        }
      },
      
      customActions: [
        {
          id: 'assign',
          label: 'Assign',
          onClick: async (asset) => {
            console.log('Assigning asset:', asset);
          },
          condition: (asset) => asset.status === 'available'
        },
        {
          id: 'maintenance',
          label: 'Schedule Maintenance',
          onClick: async (asset) => {
            console.log('Scheduling maintenance for:', asset);
          }
        },
        {
          id: 'print_label',
          label: 'Print Label',
          onClick: async (asset) => {
            console.log('Printing label for:', asset);
          }
        }
      ]
    },
    
    locations: {
      table: 'asset_locations',
      singular: 'Location',
      plural: 'Locations',
      schema: LocationSchema,
      includes: ['parent_location:asset_locations(name)', 'manager:users(name)'],
      searchFields: ['name', 'address'],
      orderBy: 'name.asc',
      
      fields: [
        { key: 'name', label: 'Location Name', type: 'text', required: true },
        { 
          key: 'type', 
          label: 'Location Type', 
          type: 'select',
          required: true,
          options: [
            { label: 'Building', value: 'building' },
            { label: 'Floor', value: 'floor' },
            { label: 'Room', value: 'room' },
            { label: 'Area', value: 'area' },
            { label: 'Storage', value: 'storage' },
            { label: 'Vehicle', value: 'vehicle' },
            { label: 'Site', value: 'site' },
          ]
        },
        { key: 'parent_location_id', label: 'Parent Location', type: 'select', options: 'locations' },
        { key: 'address', label: 'Address', type: 'text' },
        { key: 'capacity', label: 'Capacity', type: 'number', min: 1 },
        { key: 'manager_id', label: 'Manager', type: 'select', options: 'users' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { key: 'is_active', label: 'Active', type: 'switch', defaultValue: true }
      ],
      
      drawerLayout: 'single',
      drawerSize: 'md',
      
      defaultViews: ['list', 'tree']
    },
    
    maintenance: {
      table: 'asset_maintenance',
      singular: 'Maintenance',
      plural: 'Maintenance',
      schema: MaintenanceSchema,
      includes: ['asset:assets(name,asset_tag)', 'assigned_to:users(name)'],
      searchFields: ['title', 'description'],
      orderBy: 'scheduled_date.asc',
      
      fields: [
        { key: 'asset_id', label: 'Asset', type: 'select', required: true, options: 'assets' },
        { key: 'title', label: 'Maintenance Title', type: 'text', required: true },
        { 
          key: 'type', 
          label: 'Type', 
          type: 'select',
          required: true,
          options: [
            { label: 'Preventive', value: 'preventive' },
            { label: 'Corrective', value: 'corrective' },
            { label: 'Emergency', value: 'emergency' },
            { label: 'Inspection', value: 'inspection' },
            { label: 'Calibration', value: 'calibration' },
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
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'scheduled',
          options: [
            { label: 'Scheduled', value: 'scheduled' },
            { label: 'In Progress', value: 'in_progress' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
            { label: 'Overdue', value: 'overdue' },
          ]
        },
        { key: 'scheduled_date', label: 'Scheduled Date', type: 'date', required: true },
        { key: 'completed_date', label: 'Completed Date', type: 'date' },
        { key: 'assigned_to', label: 'Assigned To', type: 'select', options: 'users' },
        { key: 'estimated_hours', label: 'Estimated Hours', type: 'number', min: 0, step: 0.5 },
        { key: 'actual_hours', label: 'Actual Hours', type: 'number', min: 0, step: 0.5 },
        { key: 'cost', label: 'Cost', type: 'currency' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { key: 'notes', label: 'Notes', type: 'textarea', rows: 3 },
        { key: 'next_maintenance_date', label: 'Next Maintenance Date', type: 'date' }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'lg',
      
      defaultViews: ['list', 'kanban', 'calendar']
    },
    
    assignments: {
      table: 'asset_assignments',
      singular: 'Assignment',
      plural: 'Assignments',
      schema: AssignmentSchema,
      includes: [
        'asset:assets(name,asset_tag)',
        'assigned_to:users(name,avatar)',
        'assigned_by:users(name)',
        'location:asset_locations(name)'
      ],
      searchFields: ['purpose'],
      orderBy: 'assignment_date.desc',
      
      fields: [
        { key: 'asset_id', label: 'Asset', type: 'select', required: true, options: 'assets' },
        { key: 'assigned_to', label: 'Assigned To', type: 'select', required: true, options: 'users' },
        { key: 'assignment_date', label: 'Assignment Date', type: 'date', required: true },
        { key: 'expected_return_date', label: 'Expected Return Date', type: 'date' },
        { key: 'return_date', label: 'Actual Return Date', type: 'date' },
        { key: 'purpose', label: 'Purpose', type: 'text' },
        { key: 'location_id', label: 'Location', type: 'select', options: 'locations' },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'active',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Returned', value: 'returned' },
            { label: 'Overdue', value: 'overdue' },
            { label: 'Lost', value: 'lost' },
          ]
        },
        { 
          key: 'condition_at_assignment', 
          label: 'Condition at Assignment', 
          type: 'select',
          required: true,
          options: [
            { label: 'Excellent', value: 'excellent' },
            { label: 'Good', value: 'good' },
            { label: 'Fair', value: 'fair' },
            { label: 'Poor', value: 'poor' },
          ]
        },
        { 
          key: 'condition_at_return', 
          label: 'Condition at Return', 
          type: 'select',
          options: [
            { label: 'Excellent', value: 'excellent' },
            { label: 'Good', value: 'good' },
            { label: 'Fair', value: 'fair' },
            { label: 'Poor', value: 'poor' },
          ]
        },
        { key: 'notes', label: 'Notes', type: 'textarea', rows: 3 }
      ],
      
      drawerLayout: 'single',
      drawerSize: 'md',
      
      defaultViews: ['list', 'calendar'],
      
      customActions: [
        {
          id: 'return',
          label: 'Return Asset',
          onClick: async (assignment) => {
            console.log('Returning asset:', assignment);
          },
          condition: (assignment) => assignment.status === 'active'
        }
      ]
    },
    
    audits: {
      table: 'asset_audits',
      singular: 'Audit',
      plural: 'Audits',
      schema: AuditSchema,
      includes: ['auditor:users(name)'],
      searchFields: ['name', 'description'],
      orderBy: 'audit_date.desc',
      
      fields: [
        { key: 'name', label: 'Audit Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { key: 'audit_date', label: 'Audit Date', type: 'date', required: true },
        { key: 'auditor_id', label: 'Auditor', type: 'select', required: true, options: 'users' },
        { key: 'location_ids', label: 'Locations', type: 'multiselect', options: 'locations' },
        { key: 'category_filter', label: 'Category Filter', type: 'text' },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'planned',
          options: [
            { label: 'Planned', value: 'planned' },
            { label: 'In Progress', value: 'in_progress' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
          ]
        },
        { key: 'total_assets_expected', label: 'Expected Assets', type: 'number', min: 0 },
        { key: 'total_assets_found', label: 'Assets Found', type: 'number', min: 0 },
        { key: 'discrepancies_found