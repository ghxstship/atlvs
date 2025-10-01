/**
 * UnifiedDesignSystem.tsx
 * Single source of truth for all UI components
 * Enterprise-grade design system with zero external dependencies
 */

import React, { forwardRef, ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, LabelHTMLAttributes } from 'react'
import { cn } from './utils/cn'

// ============================================
// Button Component
// ============================================
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading, children, disabled, ...props }, ref) => {
    const variants = {
      default: 'bg-accent text-accent-foreground hover:bg-accent/90',
      primary: 'bg-accent text-accent-foreground hover:bg-accent/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-accent underline-offset-4 hover:underline',
    }

    const sizes = {
      default: 'h-[var(--spacing-10)] px-[var(--spacing-4)] py-[var(--spacing-2)]',
      sm: 'h-[var(--spacing-9)] rounded-md px-[var(--spacing-3)]',
      lg: 'h-[var(--spacing-11)] rounded-md px-[var(--spacing-8)]',
      icon: 'h-[var(--spacing-10)] w-[var(--spacing-10)]',
    }

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md text-[var(--font-size-sm)] font-[var(--font-weight-medium)] ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="mr-[var(--spacing-2)] h-[var(--spacing-4)] w-[var(--spacing-4)] animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

// ============================================
// Card Component
// ============================================
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled'
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  disabled?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', size = 'md', interactive = false, disabled = false, ...props }, ref) => {
    const variants = {
      default: 'border bg-card text-card-foreground shadow-surface',
      outlined: 'border-2 bg-card text-card-foreground shadow-none',
      elevated: 'border-0 bg-card text-card-foreground shadow-floating',
      filled: 'border-0 bg-muted text-card-foreground shadow-surface',
    }

    const sizes = {
      sm: 'rounded-md',
      md: 'rounded-lg',
      lg: 'rounded-xl',
    }

    const interactiveStyles = interactive && !disabled 
      ? 'cursor-pointer transition-all duration-200 hover:shadow-elevated hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      : ''

    const disabledStyles = disabled 
      ? 'opacity-50 cursor-not-allowed'
      : ''

    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          sizes[size],
          interactiveStyles,
          disabledStyles,
          className
        )}
        tabIndex={interactive && !disabled ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        aria-disabled={disabled}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'p-[var(--spacing-4)] space-y-[var(--spacing-1)]',
      md: 'p-[var(--spacing-6)] space-y-[var(--spacing-1-5)]',
      lg: 'p-[var(--spacing-8)] space-y-[var(--spacing-2)]',
    }

    return (
      <div ref={ref} className={cn('flex flex-col', sizes[size], className)} {...props} />
    )
  }
)
CardHeader.displayName = 'CardHeader'

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  size?: 'sm' | 'md' | 'lg'
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, size = 'md', as: Component = 'h3', ...props }, ref) => {
    const sizes = {
      sm: 'text-[var(--font-size-lg)] font-[var(--font-weight-semibold)] leading-[var(--line-height-none)] tracking-[var(--letter-spacing-tight)]',
      md: 'text-[var(--font-size-2xl)] font-[var(--font-weight-semibold)] leading-[var(--line-height-none)] tracking-[var(--letter-spacing-tight)]',
      lg: 'text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] leading-[var(--line-height-none)] tracking-[var(--letter-spacing-tight)]',
    }

    return (
      <Component ref={ref} className={cn(sizes[size], className)} {...props} />
    )
  }
)
CardTitle.displayName = 'CardTitle'

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: 'sm' | 'md' | 'lg'
}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'text-[var(--font-size-xs)] text-muted-foreground',
      md: 'text-[var(--font-size-sm)] text-muted-foreground',
      lg: 'text-[var(--font-size-base)] text-muted-foreground',
    }

    return (
      <p ref={ref} className={cn(sizes[size], className)} {...props} />
    )
  }
)
CardDescription.displayName = 'CardDescription'

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'p-[var(--spacing-4)] pt-0',
      md: 'p-[var(--spacing-6)] pt-0',
      lg: 'p-[var(--spacing-8)] pt-0',
    }

    return (
      <div ref={ref} className={cn(sizes[size], className)} {...props} />
    )
  }
)
CardContent.displayName = 'CardContent'

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  justify?: 'start' | 'center' | 'end' | 'between'
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, size = 'md', justify = 'start', ...props }, ref) => {
    const sizes = {
      sm: 'p-[var(--spacing-4)] pt-0',
      md: 'p-[var(--spacing-6)] pt-0',
      lg: 'p-[var(--spacing-8)] pt-0',
    }

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    }

    return (
      <div 
        ref={ref} 
        className={cn('flex items-center', sizes[size], justifyClasses[justify], className)} 
        {...props} 
      />
    )
  }
)
CardFooter.displayName = 'CardFooter'

// ============================================
// Input Component
// ============================================
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-[var(--spacing-10)] w-full rounded-md border border-input bg-background px-[var(--spacing-3)] py-[var(--spacing-2)] text-[var(--font-size-sm)] ring-offset-background file:border-0 file:bg-transparent file:text-[var(--font-size-sm)] file:font-[var(--font-weight-medium)] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

// ============================================
// Select Trigger Component (for compound selects)
// ============================================

export const SelectTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'flex h-[var(--spacing-10)] w-full items-center justify-between rounded-md border border-input bg-background px-[var(--spacing-3)] py-[var(--spacing-2)] text-[var(--font-size-sm)] ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
SelectTrigger.displayName = 'SelectTrigger'

export const SelectContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-elevated',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
SelectContent.displayName = 'SelectContent'

export const SelectItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-[var(--spacing-1-5)] pl-[var(--spacing-8)] pr-[var(--spacing-2)] text-[var(--font-size-sm)] outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
SelectItem.displayName = 'SelectItem'

export const SelectValue = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn('block truncate', className)} {...props} />
  )
)
SelectValue.displayName = 'SelectValue'

// ============================================
// Badge Component
// ============================================
export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'border-transparent bg-accent text-accent-foreground',
      secondary: 'border-transparent bg-secondary text-secondary-foreground',
      destructive: 'border-transparent bg-destructive text-destructive-foreground',
      outline: 'text-foreground',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-[var(--spacing-2-5)] py-[var(--spacing-0-5)] text-[var(--font-size-xs)] font-[var(--font-weight-semibold)] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

// ============================================
// Skeleton Component
// ============================================
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
)
Skeleton.displayName = 'Skeleton'

// ============================================
// Modal Component (Unified Dialog/Modal)
// ============================================
export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  showCloseButton?: boolean
  title?: string
  description?: string
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ 
    open, 
    onOpenChange, 
    children, 
    size = 'md', 
    closeOnOverlayClick = true, 
    showCloseButton = true,
    title,
    description,
    className,
    ...props 
  }, ref) => {
    if (!open) return null

    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-[95vw] max-h-[95vh]',
    }

    const handleOverlayClick = () => {
      if (closeOnOverlayClick) {
        onOpenChange?.(false)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange?.(false)
      }
    }

    return (
      <div 
        ref={ref} 
        className="fixed inset-0 z-50 flex items-center justify-center p-[var(--spacing-4)]"
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        {...props}
      >
        <div 
          className="fixed inset-0 bg-foreground/30 backdrop-blur-sm transition-opacity" 
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
        <div className={cn(
          'relative bg-background rounded-lg shadow-floating w-full transition-all',
          sizes[size],
          className
        )}>
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-[var(--spacing-6)] pb-0">
              {title && (
                <h2 id="modal-title" className="text-[var(--font-size-lg)] font-[var(--font-weight-semibold)] leading-[var(--line-height-none)] tracking-[var(--letter-spacing-tight)]">
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={() => onOpenChange?.(false)}
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Close modal"
                >
                  <svg className="h-[var(--spacing-4)] w-[var(--spacing-4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          {description && (
            <p id="modal-description" className="px-[var(--spacing-6)] text-[var(--font-size-sm)] text-muted-foreground">
              {description}
            </p>
          )}
          <div className="p-[var(--spacing-6)]">
            {children}
          </div>
        </div>
      </div>
    )
  }
)
Modal.displayName = 'Modal'

// Legacy Dialog alias for backward compatibility
export const Dialog = Modal
export type DialogProps = ModalProps

// ============================================
// Drawer Component (Unified Sheet/Drawer)
// ============================================
export interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  position?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  showCloseButton?: boolean
  title?: string
  description?: string
  footer?: React.ReactNode
}

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  ({ 
    open, 
    onOpenChange, 
    children, 
    position = 'right',
    size = 'lg', 
    closeOnOverlayClick = true, 
    showCloseButton = true,
    title,
    description,
    footer,
    className,
    ...props 
  }, ref) => {
    if (!open) return null

    const sizes = {
      sm: {
        left: 'w-container-md',
        right: 'w-container-md', 
        top: 'h-container-md',
        bottom: 'h-container-md'
      },
      md: {
        left: 'w-container-lg',
        right: 'w-container-lg',
        top: 'h-container-lg', 
        bottom: 'h-container-lg'
      },
      lg: {
        left: 'w-[32rem]',
        right: 'w-[32rem]',
        top: 'h-[32rem]',
        bottom: 'h-[32rem]'
      },
      xl: {
        left: 'w-[48rem]',
        right: 'w-[48rem]',
        top: 'h-[48rem]',
        bottom: 'h-[48rem]'
      },
      full: {
        left: 'w-full',
        right: 'w-full',
        top: 'h-full',
        bottom: 'h-full'
      }
    }

    const positions = {
      left: 'left-0 top-0 h-full',
      right: 'right-0 top-0 h-full',
      top: 'top-0 left-0 w-full',
      bottom: 'bottom-0 left-0 w-full'
    }

    const animations = {
      left: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
      right: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
      top: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
      bottom: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom'
    }

    const handleOverlayClick = () => {
      if (closeOnOverlayClick) {
        onOpenChange?.(false)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange?.(false)
      }
    }

    return (
      <div 
        className="fixed inset-0 z-50"
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        aria-describedby={description ? 'drawer-description' : undefined}
        data-state={open ? 'open' : 'closed'}
      >
        <div 
          className="fixed inset-0 bg-foreground/30 backdrop-blur-sm transition-opacity data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" 
          onClick={handleOverlayClick}
          aria-hidden="true"
          data-state={open ? 'open' : 'closed'}
        />
        <div 
          ref={ref}
          className={cn(
            'fixed bg-background shadow-floating transition-all duration-300',
            positions[position],
            sizes[size][position],
            animations[position],
            className
          )}
          data-state={open ? 'open' : 'closed'}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-[var(--spacing-6)] border-b">
              <div className="min-w-0 flex-1">
                {title && (
                  <h2 id="drawer-title" className="text-[var(--font-size-lg)] font-[var(--font-weight-semibold)] leading-[var(--line-height-none)] tracking-[var(--letter-spacing-tight)]">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="drawer-description" className="text-[var(--font-size-sm)] text-muted-foreground mt-[var(--spacing-1)]">
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={() => onOpenChange?.(false)}
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Close drawer"
                >
                  <svg className="h-[var(--spacing-4)] w-[var(--spacing-4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className={cn(
            'flex-1 overflow-y-auto p-[var(--spacing-6)]',
            footer ? 'pb-0' : ''
          )}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t p-[var(--spacing-6)] flex items-center justify-end gap-[var(--spacing-2)]">
              {footer}
            </div>
          )}
        </div>
      </div>
    )
  }
)
Drawer.displayName = 'Drawer'

// Legacy Sheet alias for backward compatibility
export const Sheet = Drawer
export type SheetProps = DrawerProps

// ============================================
// Table Component
// ============================================
export interface TableColumn<T = any> {
  key: string
  title: string
  dataIndex?: keyof T
  render?: (value: any, record: T, index: number) => React.ReactNode
  sortable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
}

export interface TableProps<T = any> extends HTMLAttributes<HTMLTableElement> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  variant?: 'default' | 'striped' | 'bordered'
  size?: 'sm' | 'md' | 'lg'
  rowKey?: string | ((record: T) => string | number)
  onRowClick?: (record: T, index: number) => void
  sortable?: boolean
  onSort?: (key: string, direction: 'asc' | 'desc' | null) => void
  selectedRowKeys?: (string | number)[]
  onSelectionChange?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void
  emptyText?: string
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ 
    columns,
    data,
    loading = false,
    variant = 'default',
    size = 'md',
    rowKey = 'id',
    onRowClick,
    sortable = true,
    onSort,
    selectedRowKeys = [],
    onSelectionChange,
    emptyText = 'No data available',
    className,
    ...props 
  }, ref) => {
    const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

    const getRowKey = React.useCallback((record: any, index: number): string | number => {
      if (typeof rowKey === 'function') {
        return rowKey(record)
      }
      return record[rowKey as string] || index
    }, [rowKey])

    const handleSort = React.useCallback((key: string) => {
      if (!sortable) return
      
      let direction: 'asc' | 'desc' | null = 'asc'
      
      if (sortConfig?.key === key) {
        if (sortConfig.direction === 'asc') {
          direction = 'desc'
        } else if (sortConfig.direction === 'desc') {
          direction = null
        }
      }
      
      if (direction) {
        setSortConfig({ key, direction })
      } else {
        setSortConfig(null)
      }
      
      onSort?.(key, direction)
    }, [sortable, sortConfig, onSort])

    const handleRowSelection = React.useCallback((key: string | number, selected: boolean) => {
      const newSelectedKeys = [...selectedRowKeys]
      const index = newSelectedKeys.indexOf(key)
      
      if (selected && index === -1) {
        newSelectedKeys.push(key)
      } else if (!selected && index > -1) {
        newSelectedKeys.splice(index, 1)
      }
      
      const selectedRows = data.filter((record, idx) => 
        newSelectedKeys.includes(getRowKey(record, idx))
      )
      
      onSelectionChange?.(newSelectedKeys, selectedRows)
    }, [selectedRowKeys, data, getRowKey, onSelectionChange])

    const handleSelectAll = React.useCallback((selected: boolean) => {
      if (selected) {
        const allKeys = data.map((record, index) => getRowKey(record, index))
        onSelectionChange?.(allKeys, data)
      } else {
        onSelectionChange?.([], [])
      }
    }, [data, getRowKey, onSelectionChange])

    const renderSortIcon = (column: TableColumn) => {
      if (!column.sortable || !sortable) return null
      
      const isActive = sortConfig?.key === column.key
      const direction = isActive ? sortConfig.direction : null
      
      return (
        <button
          type="button"
          className="ml-[var(--spacing-1)] inline-flex items-center justify-center w-[var(--spacing-4)] h-[var(--spacing-4)] hover:bg-muted rounded transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => handleSort(column.key)}
          aria-label={`Sort by ${column.title}`}
        >
          {direction === 'asc' ? (
            <svg className="h-[var(--spacing-3)] w-[var(--spacing-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : direction === 'desc' ? (
            <svg className="h-[var(--spacing-3)] w-[var(--spacing-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="h-[var(--spacing-3)] w-[var(--spacing-3)] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          )}
        </button>
      )
    }

    const hasSelection = onSelectionChange !== undefined
    const allSelected = selectedRowKeys.length === data.length && data.length > 0
    const someSelected = selectedRowKeys.length > 0 && selectedRowKeys.length < data.length

    const tableClasses = cn(
      'w-full caption-bottom text-[var(--font-size-sm)]',
      {
        'text-[var(--font-size-xs)]': size === 'sm',
        'text-[var(--font-size-sm)]': size === 'md', 
        'text-[var(--font-size-base)]': size === 'lg',
        'border border-border rounded-lg overflow-hidden': variant === 'bordered',
      },
      className
    )

    const thClasses = cn(
      'h-[var(--spacing-12)] px-[var(--spacing-4)] text-left align-middle font-[var(--font-weight-medium)] text-muted-foreground border-b',
      {
        'h-[var(--spacing-10)] px-[var(--spacing-3)]': size === 'sm',
        'h-[var(--spacing-12)] px-[var(--spacing-4)]': size === 'md',
        'h-[var(--spacing-14)] px-[var(--spacing-6)]': size === 'lg',
      }
    )

    const tdClasses = cn(
      'p-[var(--spacing-4)] align-middle border-b',
      {
        'p-[var(--spacing-3)]': size === 'sm',
        'p-[var(--spacing-4)]': size === 'md', 
        'p-[var(--spacing-6)]': size === 'lg',
      }
    )

    if (loading) {
      return (
        <div className="space-y-[var(--spacing-3)]">
          <Skeleton className="h-[var(--spacing-12)] w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[var(--spacing-16)] w-full" />
          ))}
        </div>
      )
    }

    return (
      <div className="relative w-full overflow-auto">
        <table ref={ref} className={tableClasses} {...props}>
          <thead>
            <tr className={variant === 'striped' ? 'bg-muted/50' : ''}>
              {hasSelection && (
                <th className={thClasses} style={{ width: '48px' }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input: any) => {
                      if (input) input.indeterminate = someSelected
                    }}
                    onChange={(e: any) => handleSelectAll(e.target.checked)}
                    className="rounded border-border text-accent focus:ring-primary"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((column: any) => (
                <th 
                  key={column.key} 
                  className={cn(thClasses, {
                    'text-center': column.align === 'center',
                    'text-right': column.align === 'right',
                    'cursor-pointer select-none': column.sortable && sortable,
                  })}
                  style={{ width: column.width }}
                  onClick={column.sortable && sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center">
                    {column.title}
                    {renderSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (hasSelection ? 1 : 0)} 
                  className={cn(tdClasses, 'text-center text-muted-foreground')}
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((record, index) => {
                const key = getRowKey(record, index)
                const isSelected = selectedRowKeys.includes(key)
                
                return (
                  <tr 
                    key={key}
                    className={cn(
                      'transition-colors hover:bg-muted/50',
                      {
                        'bg-muted/50': variant === 'striped' && index % 2 === 1,
                        'bg-accent/5': isSelected,
                        'cursor-pointer': onRowClick,
                      }
                    )}
                    onClick={onRowClick ? () => onRowClick(record, index) : undefined}
                  >
                    {hasSelection && (
                      <td className={tdClasses}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e: any) => handleRowSelection(key, e.target.checked)}
                          className="rounded border-border text-accent focus:ring-primary"
                          aria-label={`Select row ${index + 1}`}
                        />
                      </td>
                    )}
                    {columns.map((column: any) => {
                      const value = column.dataIndex ? record[column.dataIndex] : record[column.key]
                      const content = column.render ? column.render(value, record, index) : value
                      
                      return (
                        <td 
                          key={column.key} 
                          className={cn(tdClasses, {
                            'text-center': column.align === 'center',
                            'text-right': column.align === 'right',
                          })}
                        >
                          {content}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    )
  }
)
Table.displayName = 'Table'

// ============================================
// Form Components
// ============================================
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-[var(--font-size-sm)] font-[var(--font-weight-medium)] leading-[var(--line-height-none)] peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-[var(--spacing-1)]">*</span>}
    </label>
  )
)
Label.displayName = 'Label'

// ============================================
// Textarea Component
// ============================================
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error'
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', resize = 'vertical', ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-header-sm w-full rounded-md border border-input bg-background px-[var(--spacing-3)] py-[var(--spacing-2)] text-[var(--font-size-sm)] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        {
          'border-destructive focus-visible:ring-destructive': variant === 'error',
          'resize-none': resize === 'none',
          'resize-y': resize === 'vertical',
          'resize-x': resize === 'horizontal',
          'resize': resize === 'both',
        },
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'

// ============================================
// Breadcrumbs Component
// ============================================
export interface BreadcrumbItem {
  id?: string
  label: string
  href?: string
  current?: boolean
  icon?: React.ComponentType<{ className?: string }>
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  showHome?: boolean
  homeHref?: string
  onNavigate?: (href: string) => void
  LinkComponent?: React.ComponentType<any> | string
}

export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ 
    className,
    items,
    separator = '/',
    showHome = true,
    homeHref = '/',
    onNavigate,
    LinkComponent,
    ...props 
  }, ref) => {
    const Link = LinkComponent || 'a'
    
    const handleClick = (href: string, e: React.MouseEvent) => {
      if (onNavigate) {
        e.preventDefault()
        onNavigate(href)
      }
    }

    const allItems = showHome 
      ? [{ label: 'Home', href: homeHref, icon: undefined }, ...items]
      : items

    return (
      <nav 
        ref={ref}
        className={cn(
          'flex items-center gap-[var(--spacing-1-5)] text-[var(--font-size-sm)] text-muted-foreground',
          className
        )}
        aria-label="Breadcrumb"
        {...props}
      >
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-[var(--spacing-2)] focus:left-[var(--spacing-2)] z-50 bg-background text-foreground p-[var(--spacing-2)] rounded border shadow-floating"
        >
          Skip to main content
        </a>
        <ol className="flex items-center gap-[var(--spacing-1-5)]">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1
            const isCurrent = item.current || isLast
            const Icon = item.icon

            return (
              <li key={item.id || index} className="flex items-center">
                {index > 0 && (
                  <span className="mx-[var(--spacing-2)] text-muted-foreground/60" aria-hidden="true">
                    {separator}
                  </span>
                )}
                
                {item.href && !isCurrent ? (
                  <Link
                    href={item.href}
                    onClick={(e: React.MouseEvent) => handleClick(item.href!, e)}
                    className="flex items-center gap-[var(--spacing-1)] hover:text-foreground transition-colors rounded px-[var(--spacing-1)] py-[var(--spacing-0-5)] hover:bg-muted/50"
                  >
                    {Icon && <Icon className="h-[var(--spacing-4)] w-[var(--spacing-4)]" />}
                    <span className="truncate max-w-content-narrow">{item.label}</span>
                  </Link>
                ) : (
                  <span 
                    className={cn(
                      'flex items-center gap-[var(--spacing-1)] px-[var(--spacing-1)] py-[var(--spacing-0-5)]',
                      isCurrent && 'text-foreground font-[var(--font-weight-medium)]'
                    )}
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    {Icon && <Icon className="h-[var(--spacing-4)] w-[var(--spacing-4)]" />}
                    <span className="truncate max-w-content-narrow">{item.label}</span>
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }
)
Breadcrumbs.displayName = 'Breadcrumbs'

// ============================================
// Toggle Component
// ============================================
export interface ToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant = 'default', size = 'default', pressed, onPressedChange, ...props }, ref) => {
    const variants = {
      default: 'bg-transparent hover:bg-muted data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
      outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
    }

    const sizes = {
      default: 'h-[var(--spacing-10)] px-[var(--spacing-3)]',
      sm: 'h-[var(--spacing-9)] px-[var(--spacing-2-5)]',
      lg: 'h-[var(--spacing-11)] px-[var(--spacing-5)]',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-[var(--font-size-sm)] font-[var(--font-weight-medium)] ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground',
          variants[variant],
          sizes[size],
          className
        )}
        data-state={pressed ? 'on' : 'off'}
        onClick={() => onPressedChange?.(!pressed)}
        {...props}
      />
    )
  }
)
Toggle.displayName = 'Toggle'

// ============================================
// Accessibility System
// ============================================
export const ariaTemplates = {
  // Button patterns
  button: {
    basic: {
      role: 'button',
      tabIndex: 0,
    },
    toggle: (pressed: boolean) => ({
      role: 'button',
      'aria-pressed': pressed,
      tabIndex: 0,
    }),
    menu: (expanded: boolean, controls?: string) => ({
      role: 'button',
      'aria-expanded': expanded,
      'aria-haspopup': 'menu',
      'aria-controls': controls,
      tabIndex: 0,
    }),
  },
  
  // Navigation patterns
  navigation: {
    main: {
      role: 'navigation',
      'aria-label': 'Main navigation',
    },
    breadcrumb: {
      role: 'navigation',
      'aria-label': 'Breadcrumb',
    },
    pagination: {
      role: 'navigation',
      'aria-label': 'Pagination',
    },
    tabs: (selected: boolean, controls: string) => ({
      role: 'tab',
      'aria-selected': selected,
      'aria-controls': controls,
      tabIndex: selected ? 0 : -1,
    }),
    tablist: {
      role: 'tablist',
    },
    tabpanel: (labelledby: string) => ({
      role: 'tabpanel',
      'aria-labelledby': labelledby,
      tabIndex: 0,
    }),
  },
  
  // Form patterns
  form: {
    field: (labelledby?: string, describedby?: string, invalid?: boolean) => ({
      'aria-labelledby': labelledby,
      'aria-describedby': describedby,
      'aria-invalid': invalid,
    }),
    label: (htmlFor: string, required?: boolean) => ({
      htmlFor,
      'aria-required': required,
    }),
    error: (id: string) => ({
      id,
      role: 'alert',
      'aria-live': 'polite',
    }),
    description: (id: string) => ({
      id,
    }),
  },
  
  // Dialog patterns
  dialog: {
    modal: (labelledby?: string, describedby?: string) => ({
      role: 'dialog',
      'aria-modal': true,
      'aria-labelledby': labelledby,
      'aria-describedby': describedby,
      tabIndex: -1,
    }),
    alertdialog: (labelledby?: string, describedby?: string) => ({
      role: 'alertdialog',
      'aria-modal': true,
      'aria-labelledby': labelledby,
      'aria-describedby': describedby,
      tabIndex: -1,
    }),
  },
  
  // List patterns
  list: {
    basic: {
      role: 'list',
    },
    item: {
      role: 'listitem',
    },
    menu: {
      role: 'menu',
    },
    menuitem: (disabled?: boolean) => ({
      role: 'menuitem',
      'aria-disabled': disabled,
      tabIndex: disabled ? -1 : 0,
    }),
  },
  
  // Status patterns
  status: {
    alert: {
      role: 'alert',
      'aria-live': 'assertive',
    },
    status: {
      role: 'status',
      'aria-live': 'polite',
    },
    log: {
      role: 'log',
      'aria-live': 'polite',
    },
  },
  
  // Table patterns
  table: {
    table: {
      role: 'table',
    },
    row: (selected?: boolean) => ({
      role: 'row',
      'aria-selected': selected,
    }),
    cell: {
      role: 'cell',
    },
    columnheader: (sort?: 'ascending' | 'descending' | 'none') => ({
      role: 'columnheader',
      'aria-sort': sort,
      tabIndex: 0,
    }),
  },
} as const

export const keyboardHandlers = {
  // Arrow key navigation
  arrowNavigation: (
    currentIndex: number,
    itemCount: number,
    orientation: 'horizontal' | 'vertical' = 'vertical'
  ) => ({
    onKeyDown: (e: React.KeyboardEvent) => {
      const { key } = e
      let newIndex = currentIndex
      
      if (orientation === 'vertical') {
        if (key === 'ArrowDown') {
          newIndex = (currentIndex + 1) % itemCount
          e.preventDefault()
        } else if (key === 'ArrowUp') {
          newIndex = currentIndex === 0 ? itemCount - 1 : currentIndex - 1
          e.preventDefault()
        }
      } else {
        if (key === 'ArrowRight') {
          newIndex = (currentIndex + 1) % itemCount
          e.preventDefault()
        } else if (key === 'ArrowLeft') {
          newIndex = currentIndex === 0 ? itemCount - 1 : currentIndex - 1
          e.preventDefault()
        }
      }
      
      // Focus the new item
      const items = document.querySelectorAll('[role="menuitem"], [role="tab"], [role="option"]')
      const targetItem = items[newIndex] as HTMLElement
      if (targetItem) {
        targetItem.focus()
      }
      
      return newIndex
    }
  }),
  
  // Escape key handling
  escapeHandler: (onEscape: () => void) => ({
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape()
        e.preventDefault()
        e.stopPropagation()
      }
    }
  }),
  
  // Enter/Space activation
  activationHandler: (onActivate: () => void) => ({
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onActivate()
        e.preventDefault()
      }
    }
  }),
  
  // Tab trapping for modals
  trapFocus: (containerRef: React.RefObject<HTMLElement>) => ({
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Tab') {
        const container = containerRef.current
        if (!container) return
        
        const focusableElements = container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
        
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus()
            e.preventDefault()
          }
        }
      }
    }
  }),
} as const

// Color contrast utilities
export const contrastUtils = {
  // Calculate relative luminance
  getLuminance: (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = (rgb >> 0) & 0xff
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  },
  
  // Calculate contrast ratio
  getContrastRatio: (color1: string, color2: string): number => {
    const lum1 = contrastUtils.getLuminance(color1)
    const lum2 = contrastUtils.getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  },
  
  // Check WCAG compliance
  checkWCAG: (foreground: string, background: string, level: 'AA' | 'AAA' = 'AA') => {
    const ratio = contrastUtils.getContrastRatio(foreground, background)
    const thresholds = {
      AA: { normal: 4.5, large: 3 },
      AAA: { normal: 7, large: 4.5 }
    }
    
    return {
      ratio,
      passNormal: ratio >= thresholds[level].normal,
      passLarge: ratio >= thresholds[level].large,
      grade: ratio >= thresholds.AAA.normal ? 'AAA' : ratio >= thresholds.AA.normal ? 'AA' : 'Fail'
    }
  }
} as const

// Accessibility hook
export const useAccessibility = () => {
  const [announcements, setAnnouncements] = React.useState<string[]>([])
  
  const announce = React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(prev => [...prev, message])
    
    // Create live region for screen readers
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    liveRegion.textContent = message
    
    document.body.appendChild(liveRegion)
    
    // Clean up after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion)
      setAnnouncements(prev => prev.filter(a => a !== message))
    }, 1000)
  }, [])
  
  const generateId = React.useCallback((prefix: string = 'a11y') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  }, [])
  
  return {
    announce,
    generateId,
    announcements,
    ariaTemplates,
    keyboardHandlers,
    contrastUtils,
  }
}

// ============================================
// Design Lint & Consistency System
// ============================================
export const designLintRules = {
  // Component consistency rules
  components: {
    // Button rules
    button: {
      requiredProps: ['children'],
      allowedVariants: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      allowedSizes: ['default', 'sm', 'lg', 'icon'],
      disallowedPatterns: [
        { pattern: /style=/, message: 'Use className and design tokens instead of inline styles' },
        { pattern: /color:\s*#[0-9a-f]{6}/i, message: 'Use semantic color tokens instead of hardcoded hex values' },
      ]
    },
    
    // Typography rules
    typography: {
      requiredFonts: ['title', 'body', 'mono'],
      disallowedPatterns: [
        { pattern: /font-family:\s*[^v]/i, message: 'Use typography.fonts tokens instead of hardcoded font families' },
        { pattern: /font-size:\s*\d+px/i, message: 'Use typography.sizes tokens instead of hardcoded pixel values' },
      ]
    },
    
    // Color rules
    color: {
      requiredTokens: ['foreground', 'background', 'primary', 'secondary'],
      disallowedPatterns: [
        { pattern: /#[0-9a-f]{6}/gi, message: 'Use color tokens instead of hardcoded hex values' },
        { pattern: /rgb\(/gi, message: 'Use color tokens instead of hardcoded RGB values' },
        { pattern: /hsl\(/gi, message: 'Use color tokens instead of hardcoded HSL values' },
      ]
    },
    
    // Spacing rules
    spacing: {
      allowedUnits: ['rem', 'em', '%', 'vh', 'vw'],
      disallowedPatterns: [
        { pattern: /margin:\s*\d+px/gi, message: 'Use spacing tokens instead of hardcoded pixel margins' },
        { pattern: /padding:\s*\d+px/gi, message: 'Use spacing tokens instead of hardcoded pixel padding' },
      ]
    }
  },
  
  // Accessibility rules
  accessibility: {
    required: [
      { rule: 'aria-label', components: ['button', 'input', 'select'] },
      { rule: 'tabIndex', components: ['interactive'] },
      { rule: 'role', components: ['custom'] },
    ],
    disallowed: [
      { pattern: /tabindex="-1"(?!\s+aria-hidden="true")/gi, message: 'Elements with tabindex="-1" should have aria-hidden="true"' },
      { pattern: /<div[^>]*onclick/gi, message: 'Use semantic button elements instead of clickable divs' },
    ]
  },
  
  // Performance rules
  performance: {
    disallowedPatterns: [
      { pattern: /style={{.*}}/gi, message: 'Avoid inline styles for better performance' },
      { pattern: /className={.*\+.*}/gi, message: 'Use cn() utility for conditional classes' },
    ]
  }
} as const

// Multi-brand theming system
export const brandThemes = {
  ghxstship: {
    name: 'GHXSTSHIP',
    colors: {
      primary: colorTokens.brand[600],
      secondary: colorTokens.gray[600],
      accent: colorTokens.brand[500],
      background: themeTokens.light.background,
      foreground: themeTokens.light.foreground,
    },
    typography: {
      title: typography.fonts.title, // ANTON
      body: typography.fonts.body,   // Share Tech
      mono: typography.fonts.mono,   // Share Tech Mono
    },
    spacing: {
      unit: '0.25rem', // 4px base unit
      scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64],
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    }
  },
  
  opendeck: {
    name: 'OPENDECK',
    colors: {
      primary: '#8b5cf6', // Purple
      secondary: '#06b6d4', // Cyan
      accent: '#a855f7',
      background: '#fafafa',
      foreground: '#0a0a0a',
    },
    typography: {
      title: typography.fonts.title,
      body: typography.fonts.body,
      mono: typography.fonts.mono,
    },
    spacing: {
      unit: '0.25rem',
      scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64],
    },
    borderRadius: {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 3px 0 rgba(139, 92, 246, 0.1)',
      md: '0 4px 6px -1px rgba(139, 92, 246, 0.1)',
      lg: '0 10px 15px -3px rgba(139, 92, 246, 0.1)',
      xl: '0 20px 25px -5px rgba(139, 92, 246, 0.1)',
    }
  },
  
  atlvs: {
    name: 'ATLVS',
    colors: {
      primary: 'var(--color-warning)', // Amber
      secondary: 'var(--color-success)', // Emerald
      accent: '#fbbf24',
      background: '#fffbeb',
      foreground: '#0c0a09',
    },
    typography: {
      title: typography.fonts.title,
      body: typography.fonts.body,
      mono: typography.fonts.mono,
    },
    spacing: {
      unit: '0.25rem',
      scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64],
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.375rem',
      xl: '0.5rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(245, 158, 11, 0.1)',
      md: '0 4px 6px -1px rgba(245, 158, 11, 0.1)',
      lg: '0 10px 15px -3px rgba(245, 158, 11, 0.1)',
      xl: '0 20px 25px -5px rgba(245, 158, 11, 0.1)',
    }
  }
} as const

// AI-adaptive UI groundwork
export const adaptiveUISystem = {
  // User behavior tracking
  behaviorMetrics: {
    clickPatterns: 'track user interaction patterns',
    navigationFlow: 'monitor user journey paths',
    timeSpent: 'measure engagement duration',
    errorRates: 'track user errors and friction points',
    preferredComponents: 'identify most-used UI elements',
  },
  
  // Adaptive suggestions
  suggestions: {
    layoutOptimization: 'suggest layout improvements based on usage',
    componentRecommendations: 'recommend better component choices',
    accessibilityEnhancements: 'suggest a11y improvements',
    performanceOptimizations: 'identify performance bottlenecks',
    designConsistency: 'flag design inconsistencies',
  },
  
  // Future enhancement hooks
  enhancementHooks: {
    aiColorGeneration: 'AI-powered color palette generation',
    smartSpacing: 'Intelligent spacing recommendations',
    adaptiveTypography: 'Dynamic typography scaling',
    contextualComponents: 'Context-aware component suggestions',
    predictiveUX: 'Predictive user experience optimization',
  },
  
  // Integration points
  integrationPoints: {
    analytics: 'Connect to analytics platforms',
    userFeedback: 'Integrate user feedback systems',
    performanceMonitoring: 'Connect to performance tools',
    designSystems: 'Sync with design system updates',
    mlPipeline: 'Machine learning pipeline integration',
  }
} as const

// Theme provider hook
export const useTheme = (brandName: keyof typeof brandThemes = 'ghxstship') => {
  const [currentBrand, setCurrentBrand] = React.useState(brandName)
  const [isDarkMode, setIsDarkMode] = React.useState(false)
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  const currentTheme = brandThemes[currentBrand]
  const colorScheme = isDarkMode ? themeTokens.dark : themeTokens.light
  
  const switchBrand = React.useCallback((newBrand: keyof typeof brandThemes) => {
    setCurrentBrand(newBrand)
  }, [])
  
  const toggleDarkMode = React.useCallback(() => {
    setIsDarkMode(prev => !prev)
  }, [])
  
  return {
    currentBrand,
    currentTheme,
    colorScheme,
    isDarkMode,
    switchBrand,
    toggleDarkMode,
    brandThemes,
    themeTokens,
    colorTokens,
    typography,
    motionTokens,
  }
}

// ============================================
// Export all components and types
// ============================================
export default {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Badge,
  Skeleton,
  Dialog,
  Modal,
  Checkbox,
  Switch,
  Tooltip,
  Loader,
  Toggle,
}

// Export all types
export type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  LabelHTMLAttributes,
}
