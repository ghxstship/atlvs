/**
 * Table Component — Data Table
 * Accessible table components
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ children, className = '', ...props }) => {
  return (
    <div className="relative w-full overflow-auto">
      <table
        className={`w-full caption-bottom text-sm ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

Table.displayName = 'Table';

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <thead className={`border-b ${className}`} {...props}>
      {children}
    </thead>
  );
};

TableHeader.displayName = 'TableHeader';

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props}>
      {children}
    </tbody>
  );
};

TableBody.displayName = 'TableBody';

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tr
      className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

TableRow.displayName = 'TableRow';

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <th
      className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    >
      {children}
    </th>
  );
};

TableHead.displayName = 'TableHead';

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <td
      className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    >
      {children}
    </td>
  );
};

TableCell.displayName = 'TableCell';

// Collapsible Components
export interface CollapsibleProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <div data-state={isOpen ? 'open' : 'closed'}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { isOpen, onOpenChange: handleOpenChange } as any);
        }
        return child;
      })}
    </div>
  );
};

Collapsible.displayName = 'Collapsible';

export const CollapsibleTrigger: React.FC<{
  children: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  asChild?: boolean;
  className?: string;
}> = ({ children, isOpen, onOpenChange, asChild, className = '' }) => {
  const handleClick = () => {
    onOpenChange?.(!isOpen);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      'data-state': isOpen ? 'open' : 'closed',
    } as any);
  }

  return (
    <button
      onClick={handleClick}
      data-state={isOpen ? 'open' : 'closed'}
      className={className}
    >
      {children}
    </button>
  );
};

CollapsibleTrigger.displayName = 'CollapsibleTrigger';

export const CollapsibleContent: React.FC<{
  children: React.ReactNode;
  isOpen?: boolean;
  className?: string;
}> = ({ children, isOpen, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div
      data-state={isOpen ? 'open' : 'closed'}
      className={`overflow-hidden transition-all ${className}`}
    >
      {children}
    </div>
  );
};

CollapsibleContent.displayName = 'CollapsibleContent';
