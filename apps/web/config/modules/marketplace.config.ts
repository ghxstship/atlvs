import { z } from 'zod';
import { 
  Store,
  Package,
  Star,
  DollarSign,
  ShoppingCart,
  Truck,
  Users,
  TrendingUp,
  Download,
  Upload,
  Plus,
  Eye,
  Heart
} from 'lucide-react';
import type { ModuleConfig } from '@ghxstship/ui/config/types';

const ListingSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  title: z.string().min(1, 'Listing title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('USD'),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']),
  availability: z.enum(['available', 'sold', 'reserved', 'unavailable']),
  quantity: z.number().int().positive().default(1),
  vendor_id: z.string().uuid(),
  location: z.string().optional(),
  shipping_included: z.boolean().default(false),
  shipping_cost: z.number().optional(),
  images: z.array(z.string().url()).optional(),
  specifications: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
  views: z.number().int().default(0),
  favorites: z.number().int().default(0),
  rating: z.number().min(1).max(5).optional(),
  review_count: z.number().int().default(0),
  created_at: z.date(),
  updated_at: z.date(),
});

const VendorSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  company_name: z.string().min(1, 'Company name is required'),
  contact_name: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  rating: z.number().min(1).max(5).optional(),
  review_count: z.number().int().default(0),
  total_sales: z.number().default(0),
  active_listings: z.number().int().default(0),
  verified: z.boolean().default(false),
  status: z.enum(['active', 'inactive', 'suspended']),
  created_at: z.date(),
  updated_at: z.date(),
});

export const marketplaceModuleConfig: ModuleConfig = {
  id: 'marketplace',
  name: 'Marketplace',
  description: 'Browse and manage marketplace listings and vendors',
  icon: Store,
  color: 'orange',
  path: '/marketplace',
  
  entities: {
    listings: {
      table: 'marketplace_listings',
      singular: 'Listing',
      plural: 'Listings',
      schema: ListingSchema,
      includes: ['vendor:marketplace_vendors(company_name,rating)'],
      searchFields: ['title', 'description', 'category'],
      orderBy: 'created_at.desc',
      
      fields: [
        { key: 'title', label: 'Title', type: 'text', required: true, group: 'basic' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 4, required: true, group: 'basic' },
        { key: 'category', label: 'Category', type: 'select', required: true, options: 'categories', group: 'basic' },
        { key: 'subcategory', label: 'Subcategory', type: 'text', group: 'basic' },
        { key: 'price', label: 'Price', type: 'currency', required: true, group: 'pricing' },
        { key: 'currency', label: 'Currency', type: 'select', defaultValue: 'USD', options: ['USD', 'EUR', 'GBP'], group: 'pricing' },
        { key: 'condition', label: 'Condition', type: 'select', required: true, options: ['new', 'like_new', 'good', 'fair', 'poor'], group: 'details' },
        { key: 'quantity', label: 'Quantity', type: 'number', min: 1, defaultValue: 1, group: 'inventory' },
        { key: 'location', label: 'Location', type: 'text', group: 'logistics' },
        { key: 'shipping_included', label: 'Free Shipping', type: 'switch', group: 'logistics' },
        { key: 'shipping_cost', label: 'Shipping Cost', type: 'currency', group: 'logistics' },
        { key: 'images', label: 'Images', type: 'file', accept: 'image/*', multiple: true, maxFiles: 10, group: 'media' },
        { key: 'tags', label: 'Tags', type: 'tags', group: 'metadata' }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'xl',
      defaultViews: ['grid', 'list'],
      
      emptyState: {
        title: 'No listings found',
        description: 'Browse available items or create a new listing',
        icon: Package
      }
    },
    
    vendors: {
      table: 'marketplace_vendors',
      singular: 'Vendor',
      plural: 'Vendors',
      schema: VendorSchema,
      searchFields: ['company_name', 'contact_name', 'specialties'],
      orderBy: 'rating.desc',
      
      fields: [
        { key: 'company_name', label: 'Company Name', type: 'text', required: true },
        { key: 'contact_name', label: 'Contact Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'website', label: 'Website', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 4 },
        { key: 'specialties', label: 'Specialties', type: 'tags' },
        { key: 'certifications', label: 'Certifications', type: 'tags' },
        { key: 'verified', label: 'Verified', type: 'switch' },
        { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'suspended'] }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'lg',
      defaultViews: ['grid', 'list']
    }
  },
  
  tabs: [
    {
      id: 'browse',
      label: 'Browse',
      icon: Store,
      entity: 'listings',
      views: ['grid', 'list']
    },
    {
      id: 'vendors',
      label: 'Vendors',
      icon: Users,
      entity: 'vendors',
      views: ['grid', 'list']
    }
  ],
  
  defaultTab: 'browse',
  
  features: {
    search: true,
    filters: true,
    sort: true,
    export: true,
    realtime: true
  }
};

export default marketplaceModuleConfig;
