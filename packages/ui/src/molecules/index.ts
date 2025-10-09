/**
 * Molecules — Composite Components Export
 * Complex components built from atoms
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

// Card
export { Card, CardHeader, CardBody, CardFooter, CardTitle, CardDescription, CardContent } from './Card/Card';
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps } from './Card/Card';

// Alert
export { Alert } from './Alert/Alert';
export type { AlertProps } from './Alert/Alert';

// Dialog
export { Dialog, DialogFooter, DialogHeader, DialogTitle, DialogContent } from './Dialog/Dialog';
export type { DialogProps } from './Dialog/Dialog';

// Tooltip
export { Tooltip } from './Tooltip/Tooltip';
export type { TooltipProps } from './Tooltip/Tooltip';

// Tabs
export { Tabs } from './Tabs/Tabs';
export type { TabsProps, Tab } from './Tabs/Tabs';

// Accordion
export { Accordion } from './Accordion/Accordion';
export type { AccordionProps, AccordionItem } from './Accordion/Accordion';

// Dropdown
export { Dropdown } from './Dropdown/Dropdown';
export type { DropdownProps, DropdownItem } from './Dropdown/Dropdown';

// DropdownMenu (Radix UI compatible)
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from './DropdownMenu/DropdownMenu';
export type {
  DropdownMenuProps,
  DropdownMenuTriggerProps,
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuGroupProps,
} from './DropdownMenu/DropdownMenu';

// Pagination
export { Pagination } from './Pagination/Pagination';
export type { PaginationProps } from './Pagination/Pagination';

// Toast
export { Toast, ToastContainer } from './Toast/Toast';
export type { ToastProps, ToastContainerProps } from './Toast/Toast';

// Popover
export { Popover } from './Popover/Popover';
export type { PopoverProps } from './Popover/Popover';

// EmptyState
export { EmptyState } from './EmptyState/EmptyState';
export type { EmptyStateProps } from './EmptyState/EmptyState';

// Modal
export { Modal } from './Modal/Modal';
export type { ModalProps } from './Modal/Modal';

// Table
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Collapsible, CollapsibleTrigger, CollapsibleContent } from './Table/Table';
export type { TableProps, CollapsibleProps } from './Table/Table';
