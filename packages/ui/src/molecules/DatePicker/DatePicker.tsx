/**
 * DatePicker Component - Date selection component
 */
import React from 'react';
import { cn } from '../../lib/utils';
import { Input } from '../../components/atomic/Input';

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'size'> {
  value?: Date | string;
  onDateChange?: (date: Date | null) => void;
  size?: 'default' | 'xs' | 'sm' | 'lg' | 'xl';
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, value, onDateChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const dateValue = e.target.value;
      const date = dateValue ? new Date(dateValue) : null;
      
      if (onDateChange) {
        onDateChange(date);
      }
      
      if (onChange) {
        onChange(e);
      }
    };

    const formatDateValue = (val: Date | string | undefined) => {
      if (!val) return '';
      
      if (val instanceof Date) {
        return val.toISOString().split('T')[0];
      }
      
      if (typeof val === 'string') {
        try {
          const date = new Date(val);
          return date.toISOString().split('T')[0];
        } catch {
          return val;
        }
      }
      
      return '';
    };

    return (
      <Input
        ref={ref}
        type="date"
        className={cn("", className)}
        value={formatDateValue(value)}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
DatePicker.displayName = "DatePicker";

export { DatePicker };
