'use client';

import {
  AppDrawer,
  Drawer
} from "@ghxstship/ui";
import type {
 DataRecord as DrawerRecord,
 FieldConfig as DrawerFieldConfig
} from '@ghxstship/ui';
import type { FieldConfig as DataViewFieldConfig } from '@ghxstship/ui';
import type { ReactNode } from 'react';

interface DrawerTab {
 key: string;
 label: string;
 content: ReactNode;
 icon?: ReactNode;
}

interface DrawerAction {
 key: string;
 label: string;
 icon?: ReactNode;
 variant?: 'default' | 'destructive' | 'outline' | 'ghost';
 onClick?: (record: DrawerRecord) => void;
}

export type DrawerFieldType = DrawerFieldConfig['type'];

export interface DrawerFieldConfig {
 key: string;
 label: string;
 type: DrawerFieldType;
 required?: boolean;
 placeholder?: string;
 options?: Array<{ label: string; value: unknown }>;
 readonly?: boolean;
 hidden?: boolean;
 visible?: boolean;
}

interface AppDrawerProps {
 open: boolean;
 onClose: () => void;
 title: string;
 children?: ReactNode;
 record?: DrawerRecord | null;
 mode?: 'view' | 'create' | 'edit';
 fields?: Array<DrawerFieldConfig | DrawerFieldConfig | DataViewFieldConfig>;
 tabs?: DrawerTab[];
 actions?: DrawerAction[];
 loading?: boolean;
 error?: string | null;
 success?: string | null;
 onSave?: (data: Record<string, unknown>) => Promise<void> | void;
 onDelete?: (id: string) => Promise<void> | void;
 onDuplicate?: (record: DrawerRecord) => Promise<void> | void;
}

export type { DrawerAction, DrawerTab };

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
 field: DrawerFieldConfig | DrawerFieldConfig | DataViewFieldConfig,
): DrawerFieldConfig => {
 const base: DrawerFieldConfig = {
 key: field.key,
 label: field.label,
 type: normalizeFieldType((field as { type: string }).type)
 };

 if ('required' in field) base.required = field.required;
 if ('placeholder' in field) base.placeholder = field.placeholder;
 if ('options' in field && field.options) base.options = field.options as Array<{ label: string; value: unknown }>;
 if ('readonly' in field) base.readonly = field.readonly;
 if ('hidden' in field) base.hidden = field.hidden;
 if ('visible' in field && field.visible !== undefined) base.visible = field.visible;
 return base;
};

export default function AppDrawer({
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
 onDuplicate
}: AppDrawerProps) {
 const resolvedTabs: DrawerTab[] = tabs ?? [
 {
 key: 'details',
 label: 'Details',
 content: <div className="p-lg">{children}</div>
 },
 ];

 const resolvedFields: DrawerFieldConfig[] = (fields ?? []).map(normalizeField);

 const resolvedActions = actions?.map(action => ({
 key: action.key,
 label: action.label,
 icon: action.icon,
 variant: action.variant,
 onClick: (recordArg: DrawerRecord) => {
 (action.onClick ?? (() => {}))(recordArg);
 }
 }));

 return (
 <Drawer
 open={open}
 onClose={onClose}
 title={title}
 record={record ?? null}
 fields={resolvedFields}
 mode={mode}
 tabs={resolvedTabs}
 actions={resolvedActions}
 loading={loading}
 error={error ?? undefined}
 success={success ?? undefined}
 onSave={onSave}
 onDelete={onDelete}
 onDuplicate={onDuplicate}
 />
 );
}
