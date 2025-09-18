import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils'

/**
 * Pixel-Perfect Normalized Input Component
 * Uses only semantic design tokens for all styling
 */

const inputVariants = cva(
  'flex w-full bg-background text-foreground transition-default file:border-0 file:bg-transparent file:text-size-sm file:font-weight-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border border-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        filled: 'bg-muted border border-transparent focus-visible:border-input',
        ghost: 'border-0 focus-visible:ring-2 focus-visible:ring-ring',
        outline: 'border-2 border-input focus-visible:border-primary',
      },
      size: {
        xs: 'h-7 px-xs py-xs text-size-xs rounded-radius-sm',
        sm: 'h-8 px-sm py-xs text-size-sm rounded-radius-sm',
        default: 'h-10 px-md py-sm text-size-md rounded-radius-md',
        lg: 'h-12 px-lg py-md text-size-lg rounded-radius-lg',
        xl: 'h-14 px-xl py-lg text-size-xl rounded-radius-lg',
      },
      state: {
        default: '',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-success focus-visible:ring-success',
        warning: 'border-warning focus-visible:ring-warning',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      state: 'default',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  leftAddon?: React.ReactNode
  rightAddon?: React.ReactNode
  clearable?: boolean
  onClear?: () => void
  loading?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    variant,
    size,
    state,
    leftIcon,
    rightIcon,
    leftAddon,
    rightAddon,
    clearable,
    onClear,
    loading,
    disabled,
    ...props 
  }, ref) => {
    const [showClear, setShowClear] = React.useState(false)
    const [inputValue, setInputValue] = React.useState(props.value || props.defaultValue || '')

    React.useEffect(() => {
      setShowClear(Boolean(clearable && inputValue !== ''))
    }, [clearable, inputValue])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
      props.onChange?.(e)
    }

    const handleClear = () => {
      setInputValue('')
      onClear?.()
      const event = new Event('input', { bubbles: true })
      if (ref && typeof ref === 'object' && 'current' in ref && ref.current) {
        ref.current.dispatchEvent(event)
      }
    }

    const inputElement = (
      <div className="relative flex flex-1 items-center">
        {leftIcon && (
          <div className="absolute left-0 flex h-full items-center pl-md">
            <span className="text-muted-foreground">{leftIcon}</span>
          </div>
        )}
        <input
          type={type}
          className={cn(
            inputVariants({ variant, size, state, className }),
            leftIcon && 'pl-10',
            (rightIcon || clearable || loading) && 'pr-10'
          )}
          ref={ref}
          disabled={disabled || loading}
          onChange={handleChange}
          {...props}
        />
        {loading && (
          <div className="absolute right-0 flex h-full items-center pr-md">
            <svg
              className="animate-spin h-4 w-4 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
        {showClear && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-0 flex h-full items-center pr-md text-muted-foreground hover:text-foreground transition-default"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        {rightIcon && !clearable && !loading && (
          <div className="absolute right-0 flex h-full items-center pr-md">
            <span className="text-muted-foreground">{rightIcon}</span>
          </div>
        )}
      </div>
    )

    if (leftAddon || rightAddon) {
      return (
        <div className="flex">
          {leftAddon && (
            <div className="flex items-center rounded-l-radius-md border border-r-0 border-input bg-muted px-md text-muted-foreground">
              {leftAddon}
            </div>
          )}
          {inputElement}
          {rightAddon && (
            <div className="flex items-center rounded-r-radius-md border border-l-0 border-input bg-muted px-md text-muted-foreground">
              {rightAddon}
            </div>
          )}
        </div>
      )
    }

    return inputElement
  }
)

Input.displayName = 'Input'

// Input Group Component
interface InputGroupProps {
  children: React.ReactNode
  className?: string
  label?: string
  error?: string
  hint?: string
  required?: boolean
}

export const InputGroup: React.FC<InputGroupProps> = ({
  children,
  className,
  label,
  error,
  hint,
  required,
}) => {
  return (
    <div className={cn('space-y-xs', className)}>
      {label && (
        <label className="text-size-sm font-weight-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-xs">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-size-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-size-xs text-destructive">{error}</p>
      )}
    </div>
  )
}

export { Input, inputVariants }
