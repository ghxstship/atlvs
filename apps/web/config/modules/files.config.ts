import { z } from 'zod';
import { 
  Files,
  Folder,
  Upload,
  Download,
  Share,
  Lock,
  Unlock,
  Star,
  Archive,
  Trash2,
  Search,
  Filter,
  Grid,
  List,
  Image,
  FileText,
  Video,
  Music,
  Plus,
  Settings,
  Tag,
  Calendar,
  User
} from 'lucide-react';
import type { ModuleConfig } from '@ghxstship/ui/config/types';

// File Schema
const FileSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'File name is required'),
  original_name: z.string(),
  description: z.string().optional(),
  file_path: z.string().min(1, 'File path is required'),
  file_url: z.string().url().optional(),
  file_size: z.number().int().positive(),
  mime_type: z.string().min(1, 'MIME type is required'),
  file_type: z.enum(['document', 'image', 'video', 'audio', 'archive', 'other']),
  category: z.enum(['contract', 'policy', 'procedure', 'template', 'media', 'call-sheet', 'rider', 'other']),
  status: z.enum(['active', 'archived', 'deleted', 'processing']).default('active'),
  visibility: z.enum(['public', 'private', 'shared', 'organization']).default('private'),
  access_level: z.enum(['view', 'edit', 'admin']).default('view'),
  folder_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  uploaded_by: z.string().uuid(),
  owner_id: z.string().uuid(),
  shared_with: z.array(z.string().uuid()).optional(),
  permissions: z.object({
    view: z.array(z.string()),
    edit: z.array(z.string()),
    delete: z.array(z.string())
  }).optional(),
  metadata: z.record(z.any()).optional(),
  version: z.number().int().positive().default(1),
  parent_version_id: z.string().uuid().optional(),
  checksum: z.string().optional(),
  encryption_key: z.string().optional(),
  is_encrypted: z.boolean().default(false),
  is_favorite: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  download_count: z.number().int().default(0),
  view_count: z.number().int().default(0),
  last_accessed_at: z.date().optional(),
  expires_at: z.date().optional(),
  tags: z.array(z.string()).optional(),
  created_at: z.date(),
  updated_at: z.date()
});

// Folder Schema
const FolderSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Folder name is required'),
  description: z.string().optional(),
  path: z.string().min(1, 'Folder path is required'),
  parent_id: z.string().uuid().optional(),
  level: z.number().int().min(0).default(0),
  color: z.string().optional(),
  icon: z.string().optional(),
  visibility: z.enum(['public', 'private', 'shared', 'organization']).default('private'),
  owner_id: z.string().uuid(),
  shared_with: z.array(z.string().uuid()).optional(),
  permissions: z.object({
    view: z.array(z.string()),
    edit: z.array(z.string()),
    delete: z.array(z.string())
  }).optional(),
  file_count: z.number().int().default(0),
  total_size: z.number().int().default(0),
  is_system: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export const filesModuleConfig: ModuleConfig = {
  id: 'files',
  name: 'Files',
  description: 'Digital asset management and file organization',
  icon: Files,
  color: 'green',
  path: '/files',
  
  entities: {
    files: {
      table: 'files',
      singular: 'File',
      plural: 'Files',
      schema: FileSchema,
      includes: [
        'uploaded_by:users(name,avatar)',
        'owner:users(name,avatar)',
        'folder:folders(name,path)',
        'project:projects(name)'
      ],
      searchFields: ['name', 'original_name', 'description'],
      orderBy: 'updated_at.desc',
      
      fields: [
        { 
          key: 'name', 
          label: 'File Name', 
          type: 'text', 
          required: true,
          placeholder: 'Enter file name',
          group: 'basic'
        },
        { 
          key: 'description', 
          label: 'Description', 
          type: 'textarea',
          rows: 3,
          placeholder: 'Describe this file...',
          group: 'basic'
        },
        { 
          key: 'category', 
          label: 'Category', 
          type: 'select',
          required: true,
          options: [
            { label: 'Contract', value: 'contract' },
            { label: 'Policy', value: 'policy' },
            { label: 'Procedure', value: 'procedure' },
            { label: 'Template', value: 'template' },
            { label: 'Media', value: 'media' },
            { label: 'Call Sheet', value: 'call-sheet' },
            { label: 'Rider', value: 'rider' },
            { label: 'Other', value: 'other' },
          ],
          group: 'classification'
        },
        { 
          key: 'visibility', 
          label: 'Visibility', 
          type: 'select',
          defaultValue: 'private',
          options: [
            { label: 'Public', value: 'public' },
            { label: 'Private', value: 'private' },
            { label: 'Shared', value: 'shared' },
            { label: 'Organization', value: 'organization' },
          ],
          group: 'access'
        },
        { 
          key: 'access_level', 
          label: 'Access Level', 
          type: 'select',
          defaultValue: 'view',
          options: [
            { label: 'View Only', value: 'view' },
            { label: 'Edit', value: 'edit' },
            { label: 'Admin', value: 'admin' },
          ],
          group: 'access'
        },
        { 
          key: 'folder_id', 
          label: 'Folder', 
          type: 'select',
          options: 'folders',
          group: 'organization'
        },
        { 
          key: 'project_id', 
          label: 'Project', 
          type: 'select',
          options: 'projects',
          group: 'organization'
        },
        { 
          key: 'shared_with', 
          label: 'Share With Users', 
          type: 'multiselect',
          options: 'users',
          group: 'sharing'
        },
        { 
          key: 'is_favorite', 
          label: 'Add to Favorites', 
          type: 'switch',
          defaultValue: false,
          group: 'metadata'
        },
        { 
          key: 'is_featured', 
          label: 'Featured File', 
          type: 'switch',
          defaultValue: false,
          group: 'metadata'
        },
        { 
          key: 'expires_at', 
          label: 'Expiration Date', 
          type: 'date',
          description: 'When this file should expire (optional)',
          group: 'metadata'
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
      drawerSize: 'lg',
      deleteConfirmation: true,
      
      defaultViews: ['grid', 'list', 'gallery'],
      
      filters: [
        {
          key: 'category',
          label: 'Category',
          type: 'multiselect',
          options: ['contract', 'policy', 'procedure', 'template', 'media', 'call-sheet', 'rider', 'other']
        },
        {
          key: 'file_type',
          label: 'File Type',
          type: 'multiselect',
          options: ['document', 'image', 'video', 'audio', 'archive', 'other']
        },
        {
          key: 'visibility',
          label: 'Visibility',
          type: 'multiselect',
          options: ['public', 'private', 'shared', 'organization']
        },
        {
          key: 'owner_id',
          label: 'Owner',
          type: 'select',
          options: 'users'
        },
        {
          key: 'folder_id',
          label: 'Folder',
          type: 'select',
          options: 'folders'
        },
        {
          key: 'is_favorite',
          label: 'Favorites',
          type: 'select',
          options: [
            { label: 'Favorites Only', value: 'true' },
            { label: 'All Files', value: 'false' }
          ]
        }
      ],
      
      emptyState: {
        title: 'No files uploaded yet',
        description: 'Upload your first file to get started',
        action: {
          label: 'Upload File',
          icon: Upload
        }
      },
      
      permissions: {
        create: true,
        read: true,
        update: true,
        delete: true
      },
      
      customActions: [
        {
          id: 'download',
          label: 'Download',
          icon: Download,
          variant: 'outline'
        },
        {
          id: 'share',
          label: 'Share',
          icon: Share,
          variant: 'outline'
        },
        {
          id: 'favorite',
          label: 'Add to Favorites',
          icon: Star,
          variant: 'ghost'
        }
      ]
    },
    
    folders: {
      table: 'folders',
      singular: 'Folder',
      plural: 'Folders',
      schema: FolderSchema,
      includes: ['owner:users(name,avatar)', 'parent:folders(name,path)'],
      searchFields: ['name', 'description', 'path'],
      orderBy: 'name.asc',
      
      fields: [
        { 
          key: 'name', 
          label: 'Folder Name', 
          type: 'text', 
          required: true,
          placeholder: 'Enter folder name',
          group: 'basic'
        },
        { 
          key: 'description', 
          label: 'Description', 
          type: 'textarea',
          rows: 3,
          placeholder: 'Describe this folder...',
          group: 'basic'
        },
        { 
          key: 'parent_id', 
          label: 'Parent Folder', 
          type: 'select',
          options: 'folders',
          group: 'organization'
        },
        { 
          key: 'color', 
          label: 'Color', 
          type: 'color',
          group: 'appearance'
        },
        { 
          key: 'visibility', 
          label: 'Visibility', 
          type: 'select',
          defaultValue: 'private',
          options: [
            { label: 'Public', value: 'public' },
            { label: 'Private', value: 'private' },
            { label: 'Shared', value: 'shared' },
            { label: 'Organization', value: 'organization' },
          ],
          group: 'access'
        },
        { 
          key: 'shared_with', 
          label: 'Share With Users', 
          type: 'multiselect',
          options: 'users',
          group: 'sharing'
        },
        { 
          key: 'tags', 
          label: 'Tags', 
          type: 'tags',
          placeholder: 'Add tags...',
          group: 'metadata'
        }
      ],
      
      drawerLayout: 'single',
      drawerSize: 'md',
      deleteConfirmation: true,
      
      defaultViews: ['list', 'grid'],
      
      emptyState: {
        title: 'No folders created yet',
        description: 'Create folders to organize your files',
        action: {
          label: 'Create Folder',
          icon: Folder
        }
      }
    }
  },
  
  tabs: [
    {
      id: 'overview',
      label: 'Overview',
      icon: Files,
      type: 'overview',
      config: {
        widgets: [
          { type: 'metric', title: 'Total Files', metric: 'total_files' },
          { type: 'metric', title: 'Total Storage', metric: 'total_storage' },
          { type: 'metric', title: 'Shared Files', metric: 'shared_files' },
          { type: 'metric', title: 'Recent Uploads', metric: 'recent_uploads' },
          { type: 'chart', title: 'Storage Usage', chart: 'storage_usage_trend' },
          { type: 'chart', title: 'File Types', chart: 'file_type_distribution' },
          { type: 'list', title: 'Recent Files', entity: 'files', limit: 5 },
          { type: 'list', title: 'Popular Files', entity: 'popular_files', limit: 5 }
        ],
        quickActions: [
          {
            label: 'Upload File',
            icon: Upload,
            action: 'upload'
          },
          {
            label: 'Create Folder',
            icon: Folder,
            action: 'create',
            entity: 'folders'
          }
        ]
      }
    },
    {
      id: 'all-files',
      label: 'All Files',
      icon: Files,
      entity: 'files',
      views: ['grid', 'list', 'gallery']
    },
    {
      id: 'folders',
      label: 'Folders',
      icon: Folder,
      entity: 'folders',
      views: ['list', 'grid']
    },
    {
      id: 'featured',
      label: 'Featured',
      icon: Star,
      type: 'custom',
      component: () => null // Will be implemented separately
    },
    {
      id: 'contracts',
      label: 'Contracts',
      icon: FileText,
      type: 'custom',
      component: () => null // Will be implemented separately
    },
    {
      id: 'policies',
      label: 'Policies',
      icon: Lock,
      type: 'custom',
      component: () => null // Will be implemented separately
    },
    {
      id: 'procedures',
      label: 'Procedures',
      icon: List,
      type: 'custom',
      component: () => null // Will be implemented separately
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: Grid,
      type: 'custom',
      component: () => null // Will be implemented separately
    },
    {
      id: 'media',
      label: 'Media',
      icon: Image,
      type: 'custom',
      component: () => null // Will be implemented separately
    },
    {
      id: 'call-sheets',
      label: 'Call Sheets',
      icon: Calendar,
      type: 'custom',
      component: () => null // Will be implemented separately
    },
    {
      id: 'riders',
      label: 'Riders',
      icon: User,
      type: 'custom',
      component: () => null // Will be implemented separately
    }
  ],
  
  defaultTab: 'overview',
  
  headerActions: [
    {
      id: 'upload-file',
      label: 'Upload File',
      icon: Upload,
      variant: 'default',
      onClick: () => console.log('Upload file')
    },
    {
      id: 'create-folder',
      label: 'New Folder',
      icon: Folder,
      variant: 'outline',
      onClick: () => console.log('Create folder')
    },
    {
      id: 'bulk-upload',
      label: 'Bulk Upload',
      icon: Archive,
      variant: 'outline',
      onClick: () => console.log('Bulk upload')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      variant: 'ghost',
      onClick: () => console.log('File settings')
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
    notifications: true,
    sharing: true,
    favorites: true,
    preview: true,
    encryption: true
  },
  
  permissions: {
    view: ['owner', 'admin', 'manager', 'member', 'viewer'],
    create: ['owner', 'admin', 'manager', 'member'],
    update: ['owner', 'admin', 'manager', 'member'],
    delete: ['owner', 'admin', 'manager'],
    share: ['owner', 'admin', 'manager', 'member']
  }
};

export default filesModuleConfig;
