import { z } from 'zod';
import { 
  ShoppingCart,
  Package,
  Users,
  FileText,
  CheckCircle,
  TrendingUp,
  MapPin,
  BarChart3,
  Plus,
  Settings
} from 'lucide-react';
import type { ModuleConfig } from '@ghxstship/ui/config/types';

const PurchaseOrderSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  po_number: z.string().min(1, 'PO number is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  vendor_id: z.string().uuid(),
  status: z.enum(['draft', 'pending', 'approved', 'ordered', 'received', 'cancelled']).default('draft'),
  total_amount: z.number().positive(),
  currency: z.string().default('USD'),
  requested_by: z.string().uuid(),
  approved_by: z.string().uuid().optional(),
  delivery_date: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

const VendorSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Vendor name is required'),
  contact_email: z.string().email(),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  rating: z.number().min(1).max(5).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const procurementModuleConfig: ModuleConfig = {
  id: 'procurement',
  name: 'Procurement',
  description: 'Purchase orders, vendor management, and procurement tracking',
  icon: ShoppingCart,
  color: 'purple',
  path: '/procurement',
  
  entities: {
    orders: {
      table: 'purchase_orders',
      singular: 'Purchase Order',
      plural: 'Purchase Orders',
      schema: PurchaseOrderSchema,
      includes: ['vendor:vendors(name)', 'requested_by:users(name,avatar)'],
      searchFields: ['po_number', 'title', 'description'],
      orderBy: 'created_at.desc',
      
      fields: [
        { key: 'po_number', label: 'PO Number', type: 'text', required: true, group: 'basic' },
        { key: 'title', label: 'Title', type: 'text', required: true, group: 'basic' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3, group: 'basic' },
        { key: 'vendor_id', label: 'Vendor', type: 'select', options: 'vendors', required: true, group: 'vendor' },
        { key: 'status', label: 'Status', type: 'select', defaultValue: 'draft', 
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Pending', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Ordered', value: 'ordered' },
            { label: 'Received', value: 'received' },
            { label: 'Cancelled', value: 'cancelled' }
          ], group: 'status' },
        { key: 'total_amount', label: 'Total Amount', type: 'currency', required: true, group: 'financial' },
        { key: 'delivery_date', label: 'Delivery Date', type: 'date', group: 'logistics' }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'lg',
      deleteConfirmation: true,
      defaultViews: ['list', 'kanban'],
      
      emptyState: {
        title: 'No purchase orders yet',
        description: 'Create your first purchase order',
        action: { label: 'Create Order', icon: Plus }
      }
    },
    
    vendors: {
      table: 'vendors',
      singular: 'Vendor',
      plural: 'Vendors',
      schema: VendorSchema,
      searchFields: ['name', 'contact_email'],
      orderBy: 'name.asc',
      
      fields: [
        { key: 'name', label: 'Vendor Name', type: 'text', required: true, group: 'basic' },
        { key: 'contact_email', label: 'Email', type: 'email', required: true, group: 'contact' },
        { key: 'contact_phone', label: 'Phone', type: 'text', group: 'contact' },
        { key: 'address', label: 'Address', type: 'textarea', rows: 3, group: 'contact' },
        { key: 'status', label: 'Status', type: 'select', defaultValue: 'active',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Pending', value: 'pending' }
          ], group: 'status' },
        { key: 'rating', label: 'Rating', type: 'number', min: 1, max: 5, group: 'performance' }
      ],
      
      drawerLayout: 'single',
      drawerSize: 'md',
      defaultViews: ['list', 'grid'],
      
      emptyState: {
        title: 'No vendors yet',
        description: 'Add vendors to start procurement',
        action: { label: 'Add Vendor', icon: Plus }
      }
    }
  },
  
  tabs: [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      type: 'overview',
      config: {
        widgets: [
          { type: 'metric', title: 'Total Orders', metric: 'total_orders' },
          { type: 'metric', title: 'Pending Orders', metric: 'pending_orders' },
          { type: 'metric', title: 'Active Vendors', metric: 'active_vendors' },
          { type: 'metric', title: 'Monthly Spend', metric: 'monthly_spend' }
        ]
      }
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      entity: 'orders',
      views: ['list', 'kanban']
    },
    {
      id: 'vendors',
      label: 'Vendors',
      icon: Users,
      entity: 'vendors',
      views: ['list', 'grid']
    }
  ],
  
  defaultTab: 'overview',
  
  headerActions: [
    {
      id: 'create-order',
      label: 'New Order',
      icon: Plus,
      variant: 'default',
      onClick: () => console.log('Create order')
    }
  ],
  
  features: {
    search: true,
    filters: true,
    sort: true,
    export: true,
    import: false,
    bulkActions: true,
    realtime: true,
    audit: true,
    versioning: false,
    notifications: true
  },
  
  permissions: {
    view: ['owner', 'admin', 'manager', 'member', 'viewer'],
    create: ['owner', 'admin', 'manager', 'member'],
    update: ['owner', 'admin', 'manager', 'member'],
    delete: ['owner', 'admin', 'manager']
  }
};

export default procurementModuleConfig;
