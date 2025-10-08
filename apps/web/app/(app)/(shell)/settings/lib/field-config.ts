import type {
  SettingCategory,
  SettingType,
  SettingsFieldConfig
} from '../types';

export type SettingsCategoryOption = {
  value: SettingCategory;
  label: string;
};

export type SettingsTypeOption = {
  value: SettingType;
  label: string;
  description: string;
};

export const SETTINGS_CATEGORY_OPTIONS: SettingsCategoryOption[] = [
  { value: 'organization', label: 'Organization' },
  { value: 'security', label: 'Security' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'integrations', label: 'Integrations' },
  { value: 'billing', label: 'Billing' },
  { value: 'permissions', label: 'Permissions' },
  { value: 'automations', label: 'Automations' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'backup', label: 'Backup' },
];

export const SETTINGS_TYPE_OPTIONS: SettingsTypeOption[] = [
  { value: 'string', label: 'String', description: 'Text value' },
  { value: 'number', label: 'Number', description: 'Numeric value' },
  { value: 'boolean', label: 'Boolean', description: 'True/false value' },
  { value: 'json', label: 'JSON', description: 'JSON object' },
  { value: 'array', label: 'Array', description: 'Array of values' },
];

export const SETTINGS_FIELD_CONFIG: SettingsFieldConfig[] = [
  {
    key: 'id',
    label: 'ID',
    type: 'text',
    width: 100,
    sortable: true,
    filterable: false
  },
  {
    key: 'name',
    label: 'Setting Name',
    type: 'text',
    width: 200,
    sortable: true,
    filterable: true,
    required: true
  },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    width: 150,
    sortable: true,
    filterable: true,
    options: SETTINGS_CATEGORY_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label
    }))
  },
  {
    key: 'value',
    label: 'Value',
    type: 'text',
    width: 250,
    sortable: true,
    filterable: true
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    width: 300,
    sortable: false,
    filterable: true
  },
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    width: 120,
    sortable: true,
    filterable: true,
    options: SETTINGS_TYPE_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label
    }))
  },
  {
    key: 'is_public',
    label: 'Public',
    type: 'select',
    width: 100,
    sortable: true,
    filterable: true,
    options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' },
    ]
  },
  {
    key: 'is_editable',
    label: 'Editable',
    type: 'select',
    width: 100,
    sortable: true,
    filterable: true,
    options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' },
    ]
  },
  {
    key: 'created_at',
    label: 'Created',
    type: 'date',
    width: 150,
    sortable: true,
    filterable: true
  },
  {
    key: 'updated_at',
    label: 'Updated',
    type: 'date',
    width: 150,
    sortable: true,
    filterable: true
  },
];
