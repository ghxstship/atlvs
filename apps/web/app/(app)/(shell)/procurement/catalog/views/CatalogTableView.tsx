'use client';

import { Package2, Wrench, Edit, Trash2, Eye, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from 'react';
import { Card, Badge, Button, Checkbox } from '@ghxstship/ui';
import type { CatalogItem, CatalogSort } from '../types';
import { formatCurrency, formatDate } from '../types';

interface CatalogTableViewProps {
 items: CatalogItem[];
 loading?: boolean;
 selectedItems: string[];
 onSelectionChange: (itemIds: string[]) => void;
 onItemClick?: (item: CatalogItem) => void;
 onEditItem?: (item: CatalogItem) => void;
 onDeleteItem?: (item: CatalogItem) => void;
 onViewItem?: (item: CatalogItem) => void;
 sort?: CatalogSort;
 onSortChange?: (sort: CatalogSort) => void;
}

export default function CatalogTableView({
 items,
 loading = false,
 selectedItems,
 onSelectionChange,
 onItemClick,
 onEditItem,
 onDeleteItem,
 onViewItem,
 sort,
 onSortChange
}: CatalogTableViewProps) {
 const handleItemSelection = (itemId: string, checked: boolean) => {
 if (checked) {
 onSelectionChange([...selectedItems, itemId]);
 } else {
 onSelectionChange(selectedItems.filter(id => id !== itemId));
 }
 };

 const handleSelectAll = (checked: boolean) => {
 if (checked) {
 onSelectionChange(items.map(item => item.id));
 } else {
 onSelectionChange([]);
 }
 };

 const handleSort = (field: CatalogSort['field']) => {
 if (!onSortChange) return;

 let direction: 'asc' | 'desc' = 'asc';
 if (sort?.field === field && sort.direction === 'asc') {
 direction = 'desc';
 }

 onSortChange({ field, direction });
 };

 const getSortIcon = (field: CatalogSort['field']) => {
 if (sort?.field !== field) {
 return <ArrowUpDown className="h-3 w-3 opacity-50" />;
 }
 return sort.direction === 'asc' 
 ? <ArrowUp className="h-3 w-3" />
 : <ArrowDown className="h-3 w-3" />;
 };

 const getTypeIcon = (type: string) => {
 return type === 'product' ? Package2 : Wrench;
 };

 if (loading) {
 return (
 <Card>
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left p-md w-icon-2xl">
 <div className="h-icon-xs w-icon-xs bg-muted rounded animate-pulse"></div>
 </th>
 <th className="text-left p-md">
 <div className="h-icon-xs bg-muted rounded w-component-lg animate-pulse"></div>
 </th>
 <th className="text-left p-md">
 <div className="h-icon-xs bg-muted rounded w-component-md animate-pulse"></div>
 </th>
 <th className="text-left p-md">
 <div className="h-icon-xs bg-muted rounded w-component-lg animate-pulse"></div>
 </th>
 <th className="text-left p-md">
 <div className="h-icon-xs bg-muted rounded w-component-lg animate-pulse"></div>
 </th>
 <th className="text-left p-md">
 <div className="h-icon-xs bg-muted rounded w-component-md animate-pulse"></div>
 </th>
 <th className="text-left p-md">
 <div className="h-icon-xs bg-muted rounded w-component-lg animate-pulse"></div>
 </th>
 <th className="text-left p-md">
 <div className="h-icon-xs bg-muted rounded w-component-lg animate-pulse"></div>
 </th>
 <th className="text-right p-md w-component-xl">
 <div className="h-icon-xs bg-muted rounded w-component-md ml-auto animate-pulse"></div>
 </th>
 </tr>
 </thead>
 <tbody>
 {Array.from({ length: 8 }).map((_, index) => (
 <tr key={index} className="border-b border-border">
 <td className="p-md">
 <div className="h-icon-xs w-icon-xs bg-muted rounded animate-pulse"></div>
 </td>
 <td className="p-md">
 <div className="h-icon-xs bg-muted rounded w-component-xl animate-pulse"></div>
 </td>
 <td className="p-md">
 <div className="h-icon-xs bg-muted rounded w-component-md animate-pulse"></div>
 </td>
 <td className="p-md">
 <div className="h-icon-xs bg-muted rounded w-component-lg animate-pulse"></div>
 </td>
 <td className="p-md">
 <div className="h-icon-xs bg-muted rounded w-component-lg animate-pulse"></div>
 </td>
 <td className="p-md">
 <div className="h-icon-md bg-muted rounded-full w-component-md animate-pulse"></div>
 </td>
 <td className="p-md">
 <div className="h-icon-xs bg-muted rounded w-component-lg animate-pulse"></div>
 </td>
 <td className="p-md">
 <div className="h-icon-xs bg-muted rounded w-component-md animate-pulse"></div>
 </td>
 <td className="p-md">
 <div className="flex justify-end gap-xs">
 <div className="h-icon-lg w-icon-lg bg-muted rounded animate-pulse"></div>
 <div className="h-icon-lg w-icon-lg bg-muted rounded animate-pulse"></div>
 <div className="h-icon-lg w-icon-lg bg-muted rounded animate-pulse"></div>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>
 );
 }

 if (items.length === 0) {
 return (
 <Card className="p-xl text-center">
 <Package2 className="h-icon-2xl w-icon-2xl mx-auto mb-md text-muted-foreground opacity-50" />
 <h3 className="text-lg font-medium mb-sm">No catalog items found</h3>
 <p className="text-muted-foreground">
 No items match your current filters. Try adjusting your search criteria.
 </p>
 </Card>
 );
 }

 const allSelected = items.length > 0 && selectedItems.length === items.length;
 const someSelected = selectedItems.length > 0 && selectedItems.length < items.length;

 return (
 <div className="space-y-md">
 {/* Selection header */}
 {selectedItems.length > 0 && (
 <div className="flex items-center gap-sm p-sm bg-primary/5 border border-primary/20 rounded-lg">
 <span className="text-sm font-medium">
 {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
 </span>
 <Button
 size="sm"
 variant="secondary"
 onClick={() => onSelectionChange([])}
 >
 Clear selection
 </Button>
 </div>
 )}

 {/* Table */}
 <Card>
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left p-md w-icon-2xl">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected}
 onCheckedChange={handleSelectAll}
 />
 </th>
 <th className="text-left p-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('name')}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 Name
 {getSortIcon('name')}
 </Button>
 </th>
 <th className="text-left p-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('type')}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 Type
 {getSortIcon('type')}
 </Button>
 </th>
 <th className="text-left p-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('category')}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 Category
 {getSortIcon('category')}
 </Button>
 </th>
 <th className="text-left p-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('price')}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 Price
 {getSortIcon('price')}
 </Button>
 </th>
 <th className="text-left p-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('status')}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 Status
 {getSortIcon('status')}
 </Button>
 </th>
 <th className="text-left p-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('supplier')}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 Supplier
 {getSortIcon('supplier')}
 </Button>
 </th>
 <th className="text-left p-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('created_at')}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 Created
 {getSortIcon('created_at')}
 </Button>
 </th>
 <th className="text-right p-md w-component-xl">Actions</th>
 </tr>
 </thead>
 <tbody>
 {items.map((item) => {
 const TypeIcon = getTypeIcon(item.type);
 const isSelected = selectedItems.includes(item.id);

 return (
 <tr
 key={item.id}
 className={`border-b border-border hover:bg-muted/30 transition-colors ${
 isSelected ? 'bg-primary/5' : ''
 }`}
 >
 <td className="p-md">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => handleItemSelection(item.id, checked as boolean)}
 />
 </td>
 <td 
 className="p-md cursor-pointer"
 onClick={() => onItemClick?.(item)}
 >
 <div className="flex items-center gap-sm">
 <TypeIcon className="h-icon-xs w-icon-xs text-muted-foreground flex-shrink-0" />
 <div className="min-w-0">
 <div className="font-medium truncate">{item.name}</div>
 {item.description && (
 <div className="text-sm text-muted-foreground truncate">
 {item.description}
 </div>
 )}
 </div>
 </div>
 </td>
 <td className="p-md">
 <span className={`px-sm py-xs rounded-full text-xs font-medium ${
 item.type === 'product' 
 ? 'bg-primary/10 text-primary' 
 : 'bg-success/10 text-success'
 }`}>
 {item.type}
 </span>
 </td>
 <td className="p-md">
 <span className="text-sm">
 {item.category || '-'}
 </span>
 </td>
 <td className="p-md">
 <div className="font-medium">
 {formatCurrency(item.price || item.rate || 0, item.currency)}
 {item.type === 'service' && item.unit && (
 <span className="text-sm text-muted-foreground font-normal">
 /{item.unit}
 </span>
 )}
 </div>
 </td>
 <td className="p-md">
 <Badge variant={getStatusColor(item.status)}>
 {item.status}
 </Badge>
 </td>
 <td className="p-md">
 <span className="text-sm">
 {item.supplier || '-'}
 </span>
 </td>
 <td className="p-md">
 <span className="text-sm text-muted-foreground">
 {formatDate(item.created_at)}
 </span>
 </td>
 <td className="p-md">
 <div className="flex items-center justify-end gap-xs">
 {onViewItem && (
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 onViewItem(item);
 }}
 title="View item"
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 )}
 {onEditItem && (
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 onEditItem(item);
 }}
 title="Edit item"
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 )}
 {onDeleteItem && (
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 onDeleteItem(item);
 }}
 title="Delete item"
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 )}
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 // Show more options menu
 }}
 title="More options"
 >
 <MoreHorizontal className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </Card>
 </div>
 );
}
