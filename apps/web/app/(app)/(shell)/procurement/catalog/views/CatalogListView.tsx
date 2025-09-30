'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useState } from 'react';
import { Card, Badge, Button, Checkbox } from '@ghxstship/ui';
import type { CatalogItem } from '../types';
import { formatCurrency, formatDate, getStatusColor } from '../types';

interface CatalogListViewProps {
 items: CatalogItem[];
 loading?: boolean;
 selectedItems: string[];
 onSelectionChange: (itemIds: string[]) => void;
 onItemClick?: (item: CatalogItem) => void;
 onEditItem?: (item: CatalogItem) => void;
 onDeleteItem?: (item: CatalogItem) => void;
 onViewItem?: (item: CatalogItem) => void;
}

export default function CatalogListView({
 items,
 loading = false,
 selectedItems,
 onSelectionChange,
 onItemClick,
 onEditItem,
 onDeleteItem,
 onViewItem,
}: CatalogListViewProps) {
 const [expandedItems, setExpandedItems] = useState<Set<string>(new Set());

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

 const toggleExpanded = (itemId: string) => {
 const newExpanded = new Set(expandedItems);
 if (newExpanded.has(itemId)) {
 newExpanded.delete(itemId);
 } else {
 newExpanded.add(itemId);
 }
 setExpandedItems(newExpanded);
 };

 const getTypeIcon = (type: string) => {
 return type === 'product' ? Package2 : Wrench;
 };

 if (loading) {
 return (
 <Card>
 <div className="divide-y divide-border">
 {Array.from({ length: 6 }).map((_, index) => (
 <div key={index} className="p-md">
 <div className="animate-pulse flex items-center gap-md">
 <div className="h-4 w-4 bg-muted rounded"></div>
 <div className="h-4 w-4 bg-muted rounded"></div>
 <div className="flex-1 space-y-sm">
 <div className="h-4 bg-muted rounded w-1/3"></div>
 <div className="h-3 bg-muted rounded w-2/3"></div>
 </div>
 <div className="h-6 bg-muted rounded-full w-16"></div>
 <div className="h-4 bg-muted rounded w-20"></div>
 </div>
 </div>
 ))}
 </div>
 </Card>
 );
 }

 if (items.length === 0) {
 return (
 <Card className="p-xl text-center">
 <Package2 className="h-12 w-12 mx-auto mb-md text-muted-foreground opacity-50" />
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
 {items.length > 0 && (
 <div className="flex items-center gap-sm p-sm bg-muted/30 rounded-lg">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected}
 onCheckedChange={handleSelectAll}
 />
 <span className="text-sm text-muted-foreground">
 {selectedItems.length > 0 
 ? `${selectedItems.length} of ${items.length} items selected`
 : `Select all ${items.length} items`
 }
 </span>
 </div>
 )}

 {/* List */}
 <Card>
 <div className="divide-y divide-border">
 {items.map((item) => {
 const TypeIcon = getTypeIcon(item.type);
 const isSelected = selectedItems.includes(item.id);
 const isExpanded = expandedItems.has(item.id);

 return (
 <div key={item.id} className={`transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
 {/* Main row */}
 <div className="p-md hover:bg-muted/30 transition-colors">
 <div className="flex items-center gap-md">
 {/* Selection checkbox */}
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => handleItemSelection(item.id, checked as boolean)}
 />

 {/* Expand/collapse button */}
 <Button
 size="sm"
 variant="ghost"
 onClick={() => toggleExpanded(item.id)}
 className="p-0 h-auto"
 >
 {isExpanded ? (
 <ChevronDown className="h-4 w-4" />
 ) : (
 <ChevronRight className="h-4 w-4" />
 )}
 </Button>

 {/* Type icon */}
 <TypeIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />

 {/* Main content */}
 <div 
 className="flex-1 min-w-0 cursor-pointer"
 onClick={() => onItemClick?.(item)}
 >
 <div className="flex items-center gap-sm mb-xs">
 <h4 className="font-medium truncate">{item.name}</h4>
 <span className={`px-sm py-xs rounded-full text-xs font-medium ${
 item.type === 'product' 
 ? 'bg-primary/10 text-primary' 
 : 'bg-success/10 text-success'
 }`}>
 {item.type}
 </span>
 <Badge variant={getStatusColor(item.status)}>
 {item.status}
 </Badge>
 </div>
 
 <div className="flex items-center gap-md text-sm text-muted-foreground">
 {item.category && <span>Category: {item.category}</span>}
 {item.supplier && <span>Supplier: {item.supplier}</span>}
 {item.sku && <span>SKU: {item.sku}</span>}
 <span>Created: {formatDate(item.created_at)}</span>
 </div>
 </div>

 {/* Price */}
 <div className="text-right">
 <div className="font-semibold">
 {formatCurrency(item.price || item.rate || 0, item.currency)}
 {item.type === 'service' && item.unit && (
 <span className="text-sm text-muted-foreground font-normal">
 /{item.unit}
 </span>
 )}
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center gap-xs">
 {onViewItem && (
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 onViewItem(item);
 }}
 >
 <Eye className="h-4 w-4" />
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
 >
 <Edit className="h-4 w-4" />
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
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 )}
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 // Show more options menu
 }}
 >
 <MoreHorizontal className="h-4 w-4" />
 </Button>
 </div>
 </div>
 </div>

 {/* Expanded details */}
 {isExpanded && (
 <div className="px-md pb-md ml-[4.5rem] border-l-2 border-muted">
 <div className="bg-muted/30 rounded-lg p-md space-y-md">
 {/* Description */}
 {item.description && (
 <div>
 <h5 className="font-medium mb-xs">Description</h5>
 <p className="text-sm text-muted-foreground">{item.description}</p>
 </div>
 )}

 {/* Specifications */}
 {item.specifications && (
 <div>
 <h5 className="font-medium mb-xs">Specifications</h5>
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">
 {item.specifications}
 </p>
 </div>
 )}

 {/* Tags */}
 {item.tags && item.tags.length > 0 && (
 <div>
 <h5 className="font-medium mb-xs">Tags</h5>
 <div className="flex flex-wrap gap-xs">
 {item.tags.map((tag, index) => (
 <span
 key={index}
 className="px-sm py-xs bg-background border rounded text-xs"
 >
 {tag}
 </span>
 ))}
 </div>
 </div>
 )}

 {/* Additional details */}
 <div className="grid grid-cols-2 gap-md text-sm">
 <div>
 <h5 className="font-medium mb-xs">Details</h5>
 <div className="space-y-xs text-muted-foreground">
 <div>Type: {item.type}</div>
 <div>Status: {item.status}</div>
 {item.category && <div>Category: {item.category}</div>}
 {item.supplier && <div>Supplier: {item.supplier}</div>}
 {item.sku && <div>SKU: {item.sku}</div>}
 {item.unit && <div>Unit: {item.unit}</div>}
 </div>
 </div>
 <div>
 <h5 className="font-medium mb-xs">Pricing</h5>
 <div className="space-y-xs text-muted-foreground">
 <div>
 {item.type === 'product' ? 'Price' : 'Rate'}: {' '}
 {formatCurrency(item.price || item.rate || 0, item.currency)}
 </div>
 <div>Currency: {item.currency}</div>
 {item.type === 'service' && item.unit && (
 <div>Unit: {item.unit}</div>
 )}
 </div>
 </div>
 </div>

 {/* Timestamps */}
 <div className="flex justify-between text-xs text-muted-foreground pt-sm border-t border-border">
 <span>Created: {formatDate(item.created_at)}</span>
 <span>Updated: {formatDate(item.updated_at)}</span>
 </div>
 </div>
 </div>
 )}
 </div>
 );
 })}
 </div>
 </Card>
 </div>
 );
}
