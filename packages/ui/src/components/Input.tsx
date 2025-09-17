import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Search, X } from 'lucide-react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  showPasswordToggle?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'search' | 'success' | 'error';
  size?: 'sm' | 'md' | 'lg';
  clearable?: boolean;
  loading?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    label, 
    error, 
    helperText, 
    showPasswordToggle, 
    leftIcon,
    rightIcon,
    variant = 'default',
    size = 'md',
    clearable,
    loading,
    value,
    onChange,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value || '');
    
    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password') 
      : type;

    const sizeClasses = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-3 text-sm',
      lg: 'h-12 px-4 text-base'
    };

    const variantClasses = {
      default: '',
      search: 'pl-10',
      success: 'border-success focus:border-success focus:ring-success/20',
      error: 'border-destructive focus:border-destructive focus:ring-destructive/20'
    };

    const handleClear = () => {
      const newValue = '';
      setInternalValue(newValue);
      if (onChange) {
        const syntheticEvent = {
          target: { value: newValue },
          currentTarget: { value: newValue }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    React.useEffect(() => {
      setInternalValue(value || '');
    }, [value]);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium font-body text-foreground mb-2 flex items-center gap-2">
            {label}
            {variant === 'success' && <CheckCircle2 className="h-4 w-4 text-success" />}
            {(variant === 'error' || error) && <AlertCircle className="h-4 w-4 text-destructive" />}
          </label>
        )}
        <div className="relative group">
          {/* Left Icon */}
          {(leftIcon || variant === 'search') && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {variant === 'search' ? (
                <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              ) : (
                <span className="text-muted-foreground group-focus-within:text-foreground transition-colors">
                  {leftIcon}
                </span>
              )}
            </div>
          )}
          
          <input
            type={inputType}
            value={internalValue}
            onChange={handleChange}
            className={twMerge(
              clsx(
                'input font-body transition-all duration-200',
                sizeClasses[size],
                variantClasses[variant],
                leftIcon && 'pl-10',
                (rightIcon || showPasswordToggle || clearable) && 'pr-10',
                error && 'border-destructive focus:ring-destructive/20',
                isFocused && 'ring-2 ring-offset-1',
                loading && 'cursor-wait',
                'hover:border-accent/50 focus:border-accent',
                'placeholder:text-muted-foreground/60',
                className
              )
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            disabled={loading || props.disabled}
            {...props}
          />
          
          {/* Right Icons */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
            {loading && (
              <div className="animate-spin h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full" />
            )}
            
            {clearable && internalValue && !loading && (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-sm hover:bg-muted"
                onClick={handleClear}
                tabIndex={-1}
              >
                <X className="h-3 w-3" />
              </button>
            )}
            
            {showPasswordToggle && type === 'password' && !loading && (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-sm hover:bg-muted"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
            
            {rightIcon && !showPasswordToggle && !clearable && !loading && (
              <span className="text-muted-foreground group-focus-within:text-foreground transition-colors">
                {rightIcon}
              </span>
            )}
          </div>
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-destructive flex items-center gap-1 font-body">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-muted-foreground font-body">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// Search Input variant
export const SearchInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'variant'>>(
  ({ placeholder = 'Search...', ...props }, ref) => (
    <Input 
      ref={ref} 
      variant="search" 
      placeholder={placeholder}
      clearable
      {...props} 
    />
  )
);
SearchInput.displayName = 'SearchInput';

// Password Input variant
export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'showPasswordToggle'>>(
  (props, ref) => (
    <Input 
      ref={ref} 
      type="password" 
      showPasswordToggle
      {...props} 
    />
  )
);
PasswordInput.displayName = 'PasswordInput';
