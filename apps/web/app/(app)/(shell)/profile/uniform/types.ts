// Profile Uniform Module - Comprehensive Type Definitions

export interface UniformSizing {
  id: string;
  user_id: string;
  organization_id: string;
  
  // Clothing Sizes
  shirt_size?: string;
  pants_size?: string;
  jacket_size?: string;
  dress_size?: string;
  shoe_size?: string;
  hat_size?: string;
  
  // Measurements (in cm/kg)
  height_cm?: number;
  weight_kg?: number;
  chest_cm?: number;
  waist_cm?: number;
  inseam_cm?: number;
  
  // Equipment Preferences
  equipment_preferences: Record<string, unknown>;
  special_requirements?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  
  // Computed fields
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
  bmi?: number;
  size_completeness_percentage?: number;
}

export interface UniformSizingFilters {
  search?: string;
  size_category?: 'clothing' | 'measurements' | 'equipment' | 'all';
  completeness_range?: {
    min: number;
    max: number;
  };
  has_measurements?: boolean;
  has_clothing_sizes?: boolean;
  has_equipment_preferences?: boolean;
  date_from?: string;
  date_to?: string;
  bmi_range?: {
    min: number;
    max: number;
  };
}

export interface UniformSizingSort {
  field: keyof UniformSizing;
  direction: 'asc' | 'desc';
}

export type ViewType = 'grid' | 'list' | 'table' | 'analytics' | 'kanban' | 'form';

export interface UniformSizingStats {
  totalRecords: number;
  completedRecords: number;
  averageCompleteness: number;
  recentUpdates: number;
  sizeDistribution: {
    clothing: Array<{
      size: string;
      count: number;
      percentage: number;
    }>;
    measurements: {
      averageHeight: number;
      averageWeight: number;
      averageBMI: number;
      heightRange: { min: number; max: number };
      weightRange: { min: number; max: number };
    };
  };
  equipmentPreferences: Array<{
    preference: string;
    count: number;
    percentage: number;
  }>;
}

export interface UniformSizingAnalytics {
  completionTrends: Array<{
    date: string;
    averageCompleteness: number;
    recordsUpdated: number;
  }>;
  sizeAnalysis: {
    clothingSizes: Array<{
      category: string;
      sizes: Array<{
        size: string;
        count: number;
        percentage: number;
      }>;
    }>;
    measurementTrends: Array<{
      date: string;
      averageHeight: number;
      averageWeight: number;
      averageBMI: number;
    }>;
  };
  equipmentAnalysis: Array<{
    equipment: string;
    preferences: Array<{
      preference: string;
      count: number;
      percentage: number;
    }>;
  }>;
}

export interface RecentActivity {
  id: string;
  user_id: string;
  activity_type: 'sizing_updated' | 'measurements_added' | 'equipment_preferences_updated' | 'sizes_completed';
  activity_description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

// Field configuration for display and editing
export interface FieldConfig {
  key: keyof UniformSizing;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'json' | 'measurement' | 'size';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  section: 'clothing' | 'measurements' | 'equipment' | 'metadata';
  visible?: boolean;
  editable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  unit?: string;
}

export const UNIFORM_SIZING_FIELD_CONFIG: FieldConfig[] = [
  // Clothing Sizes
  {
    key: 'shirt_size',
    label: 'Shirt Size',
    type: 'select',
    options: [
      { value: 'XS', label: 'Extra Small (XS)' },
      { value: 'S', label: 'Small (S)' },
      { value: 'M', label: 'Medium (M)' },
      { value: 'L', label: 'Large (L)' },
      { value: 'XL', label: 'Extra Large (XL)' },
      { value: 'XXL', label: 'Double Extra Large (XXL)' },
      { value: 'XXXL', label: 'Triple Extra Large (XXXL)' },
    ],
    section: 'clothing',
    visible: true,
    editable: true,
    sortable: true,
    filterable: true
  },
  {
    key: 'pants_size',
    label: 'Pants Size',
    type: 'text',
    placeholder: 'e.g., 32x34, M, L',
    section: 'clothing',
    visible: true,
    editable: true,
    sortable: true,
    filterable: true
  },
  {
    key: 'jacket_size',
    label: 'Jacket Size',
    type: 'select',
    options: [
      { value: 'XS', label: 'Extra Small (XS)' },
      { value: 'S', label: 'Small (S)' },
      { value: 'M', label: 'Medium (M)' },
      { value: 'L', label: 'Large (L)' },
      { value: 'XL', label: 'Extra Large (XL)' },
      { value: 'XXL', label: 'Double Extra Large (XXL)' },
      { value: 'XXXL', label: 'Triple Extra Large (XXXL)' },
    ],
    section: 'clothing',
    visible: true,
    editable: true,
    sortable: true,
    filterable: true
  },
  {
    key: 'dress_size',
    label: 'Dress Size',
    type: 'text',
    placeholder: 'e.g., 8, 10, 12',
    section: 'clothing',
    visible: true,
    editable: true,
    sortable: true,
    filterable: true
  },
  {
    key: 'shoe_size',
    label: 'Shoe Size',
    type: 'text',
    placeholder: 'e.g., 9, 10.5, 42',
    section: 'clothing',
    visible: true,
    editable: true,
    sortable: true,
    filterable: true
  },
  {
    key: 'hat_size',
    label: 'Hat Size',
    type: 'text',
    placeholder: 'e.g., 7 1/4, M, L',
    section: 'clothing',
    visible: true,
    editable: true,
    sortable: true,
    filterable: true
  },
  
  // Measurements
  {
    key: 'height_cm',
    label: 'Height',
    type: 'number',
    validation: { min: 100, max: 250 },
    unit: 'cm',
    section: 'measurements',
    visible: true,
    editable: true,
    sortable: true,
    filterable: true
  },
  {
    key: 'weight_kg',
    label: 'Weight',
    type: 'number',
    validation: { min: 30, max: 300 },
    unit: 'kg',
    section: 'measurements',
    visible: true,
    editable: true,
    sortable: true,
    filterable: true
  },
  {
    key: 'chest_cm',
    label: 'Chest',
    type: 'number',
    validation: { min: 60, max: 200 },
    unit: 'cm',
    section: 'measurements',
    visible: true,
    editable: true,
    sortable: true,
    filterable: true
  },
  {
    key: 'waist_cm',
    label: 'Waist',
    type: 'number',
    validation: { min: 50, max: 180 },
    unit: 'cm',
    section: 'measurements',
    visible: true,
    editable: true,
    sortable: true,
    filterable: true
  },
  {
    key: 'inseam_cm',
    label: 'Inseam',
    type: 'number',
    validation: { min: 60, max: 120 },
    unit: 'cm',
    section: 'measurements',
    visible: true,
    editable: true,
    sortable: true,
    filterable: true
  },
  
  // Equipment Preferences
  {
    key: 'equipment_preferences',
    label: 'Equipment Preferences',
    type: 'json',
    section: 'equipment',
    visible: true,
    editable: true,
    sortable: false,
    filterable: false
  },
  {
    key: 'special_requirements',
    label: 'Special Requirements',
    type: 'textarea',
    placeholder: 'Any special sizing requirements or notes...',
    validation: { maxLength: 500 },
    section: 'equipment',
    visible: true,
    editable: true,
    sortable: false,
    filterable: false
  },
  
  // Metadata
  {
    key: 'created_at',
    label: 'Created',
    type: 'text',
    section: 'metadata',
    visible: true,
    editable: false,
    sortable: true,
    filterable: true
  },
  {
    key: 'updated_at',
    label: 'Last Updated',
    type: 'text',
    section: 'metadata',
    visible: true,
    editable: false,
    sortable: true,
    filterable: true
  },
];

export const VIEW_CONFIG = {
  grid: { label: 'Grid', icon: 'Grid3X3' },
  list: { label: 'List', icon: 'List' },
  table: { label: 'Table', icon: 'Table' },
  analytics: { label: 'Analytics', icon: 'BarChart3' },
  kanban: { label: 'Kanban', icon: 'Kanban' },
  form: { label: 'Form', icon: 'FileText' }
} as const;

export const QUICK_FILTERS = [
  { label: 'All Records', value: 'all', count: 0 },
  { label: 'Complete Profiles', value: 'complete', count: 0 },
  { label: 'Missing Measurements', value: 'no-measurements', count: 0 },
  { label: 'Missing Clothing Sizes', value: 'no-clothing', count: 0 },
  { label: 'Recent Updates', value: 'recent', count: 0 },
  { label: 'Has Equipment Preferences', value: 'has-equipment', count: 0 },
] as const;

export const BULK_ACTIONS = [
  { id: 'export', label: 'Export Selected', icon: 'Download', variant: 'outline' as const },
  { id: 'update-measurements', label: 'Bulk Update Measurements', icon: 'Ruler', variant: 'default' as const },
  { id: 'clear-data', label: 'Clear Selected Data', icon: 'Trash2', variant: 'destructive' as const },
] as const;

export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV', description: 'Comma-separated values' },
  { value: 'xlsx', label: 'Excel', description: 'Microsoft Excel format' },
  { value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
  { value: 'pdf', label: 'PDF', description: 'Portable Document Format' },
] as const;

export const SIZE_CATEGORIES = [
  { value: 'clothing', label: 'Clothing Sizes', description: 'Shirt, pants, jacket, dress, shoes, hat' },
  { value: 'measurements', label: 'Body Measurements', description: 'Height, weight, chest, waist, inseam' },
  { value: 'equipment', label: 'Equipment Preferences', description: 'Special equipment and requirements' },
] as const;

export const EQUIPMENT_TYPES = [
  'Safety Helmet',
  'Safety Vest',
  'Work Boots',
  'Gloves',
  'Eye Protection',
  'Hearing Protection',
  'Respirator',
  'Hard Hat',
  'Tool Belt',
  'Knee Pads',
  'Back Support',
  'Rain Gear',
] as const;

export function createEmptyUniformSizing(): Partial<UniformSizing> {
  return {
    shirt_size: '',
    pants_size: '',
    jacket_size: '',
    dress_size: '',
    shoe_size: '',
    hat_size: '',
    height_cm: undefined,
    weight_kg: undefined,
    chest_cm: undefined,
    waist_cm: undefined,
    inseam_cm: undefined,
    equipment_preferences: {},
    special_requirements: ''
  };
}

export function createEmptyUniformSizingStats(): UniformSizingStats {
  return {
    totalRecords: 0,
    completedRecords: 0,
    averageCompleteness: 0,
    recentUpdates: 0,
    sizeDistribution: {
      clothing: [],
      measurements: {
        averageHeight: 0,
        averageWeight: 0,
        averageBMI: 0,
        heightRange: { min: 0, max: 0 },
        weightRange: { min: 0, max: 0 }
      }
    },
    equipmentPreferences: []
  };
}

export function createEmptyUniformSizingAnalytics(): UniformSizingAnalytics {
  return {
    completionTrends: [],
    sizeAnalysis: {
      clothingSizes: [],
      measurementTrends: []
    },
    equipmentAnalysis: []
  };
}

// Utility functions
export function calculateBMI(height_cm?: number, weight_kg?: number): number | undefined {
  if (!height_cm || !weight_kg) return undefined;
  const heightM = height_cm / 100;
  return Math.round((weight_kg / (heightM * heightM)) * 10) / 10;
}

export function getBMICategory(bmi?: number): string {
  if (!bmi) return 'Unknown';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function calculateSizeCompleteness(sizing: UniformSizing): number {
  const clothingFields = ['shirt_size', 'pants_size', 'jacket_size', 'shoe_size'];
  const measurementFields = ['height_cm', 'weight_kg', 'chest_cm', 'waist_cm', 'inseam_cm'];
  
  let completedFields = 0;
  let totalFields = clothingFields.length + measurementFields.length;
  
  // Check clothing sizes
  clothingFields.forEach(field => {
    if (sizing[field as keyof UniformSizing] && 
        String(sizing[field as keyof UniformSizing]).trim() !== '') {
      completedFields++;
    }
  });
  
  // Check measurements
  measurementFields.forEach(field => {
    if (sizing[field as keyof UniformSizing] && 
        Number(sizing[field as keyof UniformSizing]) > 0) {
      completedFields++;
    }
  });
  
  // Bonus for equipment preferences
  if (sizing.equipment_preferences && Object.keys(sizing.equipment_preferences).length > 0) {
    completedFields += 0.5;
    totalFields += 0.5;
  }
  
  return Math.round((completedFields / totalFields) * 100);
}

export function getCompletenessColor(percentage: number): string {
  if (percentage >= 80) return 'success';
  if (percentage >= 50) return 'warning';
  return 'destructive';
}

export function formatMeasurement(value?: number, unit?: string): string {
  if (!value) return 'Not specified';
  return `${value}${unit ? ` ${unit}` : ''}`;
}

export function getSizeRecommendations(sizing: UniformSizing): Array<{
  category: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}> {
  const recommendations: Array<{
    category: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];
  
  // Check for missing critical sizes
  if (!sizing.shirt_size) {
    recommendations.push({
      category: 'Clothing',
      recommendation: 'Add shirt size for uniform ordering',
      priority: 'high' as const
    });
  }
  
  if (!sizing.pants_size) {
    recommendations.push({
      category: 'Clothing',
      recommendation: 'Add pants size for uniform ordering',
      priority: 'high' as const
    });
  }
  
  if (!sizing.shoe_size) {
    recommendations.push({
      category: 'Safety',
      recommendation: 'Add shoe size for safety footwear',
      priority: 'high' as const
    });
  }
  
  // Check for missing measurements
  if (!sizing.height_cm || !sizing.weight_kg) {
    recommendations.push({
      category: 'Measurements',
      recommendation: 'Add height and weight for accurate sizing',
      priority: 'medium' as const
    });
  }
  
  // Check BMI concerns
  const bmi = calculateBMI(sizing.height_cm, sizing.weight_kg);
  if (bmi && (bmi < 18.5 || bmi > 30)) {
    recommendations.push({
      category: 'Health',
      recommendation: 'Consider health consultation for optimal uniform fit',
      priority: 'low' as const
    });
  }
  
  return recommendations;
}
