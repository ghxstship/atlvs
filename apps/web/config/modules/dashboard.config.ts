import { z } from 'zod';
import { LayoutDashboard } from 'lucide-react';
import type { ModuleConfig } from '@ghxstship/ui/config/types';

const DashboardSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export const dashboardModuleConfig: ModuleConfig = {
  id: 'dashboard',
  name: 'Dashboard',
  description: 'Centralized dashboard management and data visualization',
  icon: LayoutDashboard,
  color: 'blue',
  path: '/dashboard',

  entities: {
    dashboards: {
      table: 'dashboards',
      singular: 'Dashboard',
      plural: 'Dashboards',
      schema: DashboardSchema,
      searchFields: ['name', 'description'],
      defaultViews: ['grid', 'list'],
      fields: [
        {
          key: 'name',
          label: 'Name',
          type: 'text',
          required: true,
          placeholder: 'Dashboard name'
        },
        {
          key: 'description',
          label: 'Description',
          type: 'textarea',
          rows: 3,
          placeholder: 'Add a description'
        },
      ]
    }
  },

  tabs: [
    {
      id: 'dashboards',
      label: 'Dashboards',
      icon: LayoutDashboard,
      entity: 'dashboards',
      views: ['grid', 'list']
    },
  ],

  defaultTab: 'dashboards'
};

export default dashboardModuleConfig;
