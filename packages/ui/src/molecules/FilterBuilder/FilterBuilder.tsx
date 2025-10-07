'use client';

import { Filter, X } from 'lucide-react';
import { Button } from '../../components/atomic/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/Select';
import { Input } from '../../components/atomic/Input';
import { Badge } from '../../components/Badge';

export interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string | number | boolean;
}

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'boolean';
  operators?: string[];
  options?: Array<{ value: string; label: string }>;
}

export interface FilterBuilderProps {
  fields: FilterField[];
  filters: FilterCondition[];
  onChange: (filters: FilterCondition[]) => void;
  className?: string;
}

const DEFAULT_OPERATORS = {
  text: ['contains', 'equals', 'starts_with', 'ends_with'],
  number: ['equals', 'greater_than', 'less_than', 'between'],
  select: ['equals', 'not_equals'],
  date: ['equals', 'before', 'after', 'between'],
  boolean: ['equals'],
};

const OPERATOR_LABELS: Record<string, string> = {
  contains: 'Contains',
  equals: 'Equals',
  not_equals: 'Not Equals',
  starts_with: 'Starts With',
  ends_with: 'Ends With',
  greater_than: 'Greater Than',
  less_than: 'Less Than',
  before: 'Before',
  after: 'After',
  between: 'Between',
};

export function FilterBuilder({
  fields,
  filters,
  onChange,
  className = '',
}: FilterBuilderProps) {

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: `filter-${Date.now()}`,
      field: fields[0]?.key || '',
      operator: DEFAULT_OPERATORS[fields[0]?.type || 'text'][0],
      value: '',
    };
    onChange([...filters, newFilter]);
  };

  const updateFilter = (id: string, updates: Partial<FilterCondition>) => {
    onChange(
      filters.map((filter) =>
        filter.id === id ? { ...filter, ...updates } : filter
      )
    );
  };

  const removeFilter = (id: string) => {
    onChange(filters.filter((filter) => filter.id !== id));
  };

  const getFieldOperators = (fieldKey: string) => {
    const field = fields.find((f) => f.key === fieldKey);
    if (!field) return [];
    return field.operators || DEFAULT_OPERATORS[field.type];
  };

  const renderValueInput = (filter: FilterCondition) => {
    const field = fields.find((f) => f.key === filter.field);
    if (!field) return null;

    switch (field.type) {
      case 'select':
        return (
          <Select
            value={String(filter.value)}
            onValueChange={(value) => updateFilter(filter.id, { value })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={String(filter.value)}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            placeholder="Enter value"
            className="w-[200px]"
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={String(filter.value)}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className="w-[200px]"
          />
        );

      case 'boolean':
        return (
          <Select
            value={filter.value === true ? 'true' : 'false'}
            onValueChange={(value) => updateFilter(filter.id, { value: value === 'true' })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            type="text"
            value={String(filter.value)}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            placeholder="Enter value"
            className="w-[200px]"
          />
        );
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addFilter}
        >
          <Filter className="mr-2 h-4 w-4" />
          Add Filter
        </Button>
        {filters.length > 0 && (
          <Badge variant="secondary">
            {filters.length} filter{filters.length !== 1 ? 's' : ''} active
          </Badge>
        )}
      </div>

      {filters.length > 0 && (
        <div className="space-y-2 p-4 border rounded-md bg-muted/50">
          {filters.map((filter) => (
            <div key={filter.id} className="flex items-center gap-2 bg-background p-2 rounded-md">
              <Select
                value={filter.field}
                onValueChange={(value) => {
                  const field = fields.find((f) => f.key === value);
                  const operators = field ? (field.operators || DEFAULT_OPERATORS[field.type]) : [];
                  updateFilter(filter.id, {
                    field: value,
                    operator: operators[0],
                    value: '',
                  });
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.key} value={field.key}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filter.operator}
                onValueChange={(value) => updateFilter(filter.id, { operator: value })}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getFieldOperators(filter.field).map((op) => (
                    <SelectItem key={op} value={op}>
                      {OPERATOR_LABELS[op] || op}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {renderValueInput(filter)}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFilter(filter.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
