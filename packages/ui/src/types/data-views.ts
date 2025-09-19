export interface DataRecord {
  id: string;
  [key: string]: any;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'email' | 'url' | 'textarea' | 'currency' | 'array' | 'object' | 'toggle' | 'password';
  sortable?: boolean;
  filterable?: boolean;
  required?: boolean;
  readonly?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ label: string; value: string | number }>;
  defaultValue?: any;
  // Textarea specific
  rows?: number;
  maxLength?: number;
  // Number specific
  min?: number;
  max?: number;
  step?: number;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface ViewConfig {
  type: 'grid' | 'list' | 'kanban' | 'calendar' | 'timeline';
  fields: FieldConfig[];
  pagination?: {
    pageSize: number;
    showSizeChanger?: boolean;
  };
  sorting?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  filtering?: {
    [key: string]: any;
  };
}

export interface ViewProps {
  data: DataRecord[];
  config: ViewConfig;
  loading?: boolean;
  onEdit?: (record: DataRecord) => void;
  onDelete?: (id: string) => void;
  onCreate?: () => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  onPageChange?: (page: number, pageSize: number) => void;
}

export interface FormSection {
  id?: string;
  title: string;
  description?: string;
  fields: FieldConfig[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  type?: 'required' | 'pattern' | 'min' | 'max' | 'custom' | 'type' | 'constraint' | 'foreign_key' | 'unique';
  value?: any;
}
