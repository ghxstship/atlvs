import type { DashboardListItem } from '../types';

export const dashboardFields = [
  {
    key: 'name',
    label: 'Dashboard Name',
    type: 'text',
    sortable: true,
    searchable: true,
    required: true,
    width: 200,
  },
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    sortable: true,
    filterable: true,
    width: 120,
    options: [
      { label: 'System', value: 'system' },
      { label: 'Custom', value: 'custom' },
      { label: 'Template', value: 'template' },
    ],
  },
  {
    key: 'access_level',
    label: 'Access Level',
    type: 'select',
    sortable: true,
    filterable: true,
    width: 120,
    options: [
      { label: 'Public', value: 'public' },
      { label: 'Private', value: 'private' },
      { label: 'Team', value: 'team' },
      { label: 'Organization', value: 'organization' },
    ],
  },
  {
    key: 'created_at',
    label: 'Created',
    type: 'date',
    sortable: true,
    width: 140,
  },
];
