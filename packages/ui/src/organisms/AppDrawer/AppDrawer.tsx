/**
 * Distributed App Drawer wrapper that normalizes field configs
 * across legacy consumers. Provides both named and default exports.
 */
'use client';

import { UniversalDrawer } from '../../components/DataViews/UniversalDrawer';
import type {
  DataRecord as UniversalDrawerRecord,
  FieldConfig as UniversalDrawerFieldConfig,
} from '../../components/DataViews/UniversalDrawer';
import type { FieldConfig as DataViewFieldConfig } from './DataViews/types';
import type { ReactNode } from 'react';

export interface DrawerTab {
  key: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
}

export interface DrawerAction {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  onClick?: (record: UniversalDrawerRecord) => void;
}

export type DrawerFieldType = UniversalDrawerFieldConfig['type'];

export interface DrawerFieldConfig {
  key: string;
  label: string;
  type: DrawerFieldType;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  readonly?: boolean;
  hidden?: boolean;
  visible?: boolean;
}

export interface AppDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  record?: UniversalDrawerRecord | null;
  mode?: 'view' | 'create' | 'edit';
  fields?: Array<DrawerFieldConfig | UniversalDrawerFieldConfig | DataViewFieldConfig>;
  tabs?: DrawerTab[];
  actions?: DrawerAction[];
  loading?: boolean;
  error?: string | null;
  success?: string | null;
  onSave?: (data: Record<string, unknown>) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  onDuplicate?: (record: UniversalDrawerRecord) => Promise<void> | void;
}

const SUPPORTED_TYPES: DrawerFieldType[] = [
  'text',
  'number',
  'email',
  'password',
  'textarea',
  'select',
  'checkbox',
  'date',
  'file',
  'boolean',
  'currency',
];

const normalizeFieldType = (type: string): DrawerFieldType =>
  (SUPPORTED_TYPES.includes(type as DrawerFieldType) ? type : 'text') as DrawerFieldType;

const normalizeField = (
  field: DrawerFieldConfig | UniversalDrawerFieldConfig | DataViewFieldConfig,
): UniversalDrawerFieldConfig => {
  const base: UniversalDrawerFieldConfig = {
    key: field.key,
    label: field.label,
    type: normalizeFieldType((field as { type: string }).type),
  };

  if ('required' in field && field.required !== undefined) base.required = field.required;
  if ('placeholder' in field && field.placeholder !== undefined) base.placeholder = field.placeholder;
  if ('options' in field && field.options !== undefined) base.options = field.options as Array<{ label: string; value: any }>;
  if ('readonly' in field && field.readonly !== undefined) base.readonly = field.readonly;
  if ('hidden' in field && field.hidden !== undefined) base.hidden = field.hidden;
  if ('visible' in field && field.visible !== undefined) base.visible = field.visible;
  return base;
};

export function AppDrawer({
  open,
  onClose,
  title,
  children,
  record = null,
  mode = 'view',
  fields = [],
  tabs,
  actions,
  loading = false,
  error = null,
  success = null,
  onSave,
  onDelete,
  onDuplicate,
}: AppDrawerProps) {
  const resolvedTabs: DrawerTab[] = tabs ?? [
    {
      key: 'details',
      label: 'Details',
      content: <div className="p-lg">{children}</div>,
    },
  ];

  const resolvedFields: UniversalDrawerFieldConfig[] = (fields ?? []).map(normalizeField);

  const resolvedActions = actions?.map(action => {
    const mapped: {
      key: string;
      label: string;
      icon?: ReactNode;
      variant?: 'default' | 'destructive' | 'outline' | 'ghost';
      onClick: (record: UniversalDrawerRecord) => void;
    } = {
      key: action.key,
      label: action.label,
      onClick: (recordArg: UniversalDrawerRecord) => {
        (action.onClick ?? (() => {}))(recordArg);
      },
    };

    if (typeof action.icon !== 'undefined') {
      mapped.icon = action.icon;
    }

    if (typeof action.variant !== 'undefined') {
      mapped.variant = action.variant;
    }

    return mapped;
  });

  const optionalProps = {
    ...(resolvedActions ? { actions: resolvedActions } : {}),
    ...(error ? { error } : {}),
    ...(success ? { success } : {}),
    ...(onSave ? { onSave } : {}),
    ...(onDelete ? { onDelete } : {}),
    ...(onDuplicate ? { onDuplicate } : {}),
  } as const;

  return (
    <UniversalDrawer
      open={open}
      onClose={onClose}
      title={title}
      record={record ?? null}
      fields={resolvedFields}
      mode={mode}
      tabs={resolvedTabs}
      loading={loading}
      {...optionalProps}
    />
  );
}

export default AppDrawer;
