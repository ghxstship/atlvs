'use client';
import { Activity, Award, Calendar, Clock, Edit, Eye, FileText, MoreHorizontal, Package2, Play, Plus, Search, Settings, Trash2, TrendingUp, User } from 'lucide-react';
import { useState } from 'react';
import { Card, Badge, Button, Checkbox } from '@ghxstship/ui';
import type { CatalogItem } from '../types';
import { formatCurrency, formatDate, getTypeColor } from '../types';

interface CatalogGridViewProps {
 items: CatalogItem[];
 loading?: boolean;
 selectedItems: string[];
 onSelectionChange: (itemIds: string[]) => void;
 onItemClick?: (item: CatalogItem) => void;
 onEditItem?: (item: CatalogItem) => void;
 onDeleteItem?: (item: CatalogItem) => void;
 onViewItem?: (item: CatalogItem) => void;
}

export default function CatalogGridView({
 items,
 loading = false,
 selectedItems,
 onSelectionChange,
 onItemClick,
 onEditItem,
 onDeleteItem,
 onViewItem
}: CatalogGridViewProps) {
 const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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

 const getTypeIcon = (type: string) => {
 return type === 'product' ? Package2 : Wrench;
 };

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {Array.from({ length: 8 }).map((_, index) => (
 <Card key={index} className="p-md">
 <div className="animate-pulse">
 <div className="flex items-center justify-between mb-sm">
 <div className="h-icon-xs bg-muted rounded w-3/4"></div>
 <div className="h-icon-md bg-muted rounded-full w-component-md"></div>
 </div>
 <div className="h-3 bg-muted rounded w-1/2 mb-sm"></div>
 <div className="h-3 bg-muted rounded w-full mb-sm"></div>
 <div className="h-3 bg-muted rounded w-2/3 mb-md"></div>
 <div className="flex justify-between items-center">
 <div className="h-icon-sm bg-muted rounded w-component-lg"></div>
 <div className="flex gap-xs">
 <div className="h-icon-lg w-icon-lg bg-muted rounded"></div>
 <div className="h-icon-lg w-icon-lg bg-muted rounded"></div>
 </div>
 </div>
 </div>
 </Card>
 ))}
 </div>
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

 {/* Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {items.map((item) => {
 const TypeIcon = getTypeIcon(item.type);
 const isSelected = selectedItems.includes(item.id);
 const isHovered = hoveredItem === item.id;

 return (
 <Card
 key={item.id}
 className={`relative transition-all duration-200 cursor-pointer hover:shadow-md ${
 isSelected ? 'ring-2 ring-primary' : ''
 }`}
 onMouseEnter={() => setHoveredItem(item.id)}
 onMouseLeave={() => setHoveredItem(null)}
 onClick={() => onItemClick?.(item)}
 >
 {/* Selection checkbox */}
 <div className="absolute top-sm left-sm z-10">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => handleItemSelection(item.id, checked as boolean)}
 onClick={(e) => e.stopPropagation()}
 />
 </div>

 {/* Action buttons */}
 {isHovered && (
 <div className="absolute top-sm right-sm z-10 flex gap-xs">
 {onViewItem && (
 <Button
 size="sm"
 variant="secondary"
 onClick={(e) => {
 e.stopPropagation();
 onViewItem(item);
 }}
 >
 <Eye className="h-3 w-3" />
 </Button>
 )}
 {onEditItem && (
 <Button
 size="sm"
 variant="secondary"
 onClick={(e) => {
 e.stopPropagation();
 onEditItem(item);
 }}
 >
 <Edit className="h-3 w-3" />
 </Button>
 )}
 {onDeleteItem && (
 <Button
 size="sm"
 variant="error"
 onClick={(e) => {
 e.stopPropagation();
 onDeleteItem(item);
 }}
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 )}
 </div>
 )}

 <div className="p-md pt-lg">
 {/* Header */}
 <div className="flex items-start justify-between mb-sm">
 <div className="flex items-center gap-sm min-w-0 flex-1">
 <TypeIcon className="h-icon-xs w-icon-xs text-muted-foreground flex-shrink-0" />
 <h4 className="font-medium truncate">{item.name}</h4>
 </div>
 <Badge variant={getStatusColor(item.status)} className="ml-sm">
 {item.status}
 </Badge>
 </div>

 {/* Type and category */}
 <div className="flex items-center gap-sm mb-sm">
 <span className={`px-sm py-xs rounded-full text-xs font-medium ${
 item.type === 'product' 
 ? 'bg-primary/10 text-primary' 
 : 'bg-success/10 text-success'
 }`}>
 {item.type}
 </span>
 {item.category && (
 <span className="text-xs text-muted-foreground uppercase tracking-wide">
 {item.category}
 </span>
 )}
 </div>

 {/* Description */}
 {item.description && (
 <p className="text-sm text-muted-foreground line-clamp-xs mb-sm">
 {item.description}
 </p>
 )}

 {/* Price */}
 <div className="flex items-center justify-between mb-sm">
 <div className="text-lg font-semibold">
 {formatCurrency(item.price || item.rate || 0, item.currency)}
 {item.type === 'service' && item.unit && (
 <span className="text-sm text-muted-foreground font-normal">
 /{item.unit}
 </span>
 )}
 </div>
 </div>

 {/* Supplier and SKU */}
 <div className="space-y-xs text-xs text-muted-foreground">
 {item.supplier && (
 <div>
 <strong>Supplier:</strong> {item.supplier}
 </div>
 )}
 {item.sku && (
 <div>
 <strong>SKU:</strong> {item.sku}
 </div>
 )}
 </div>

 {/* Tags */}
 {item.tags && item.tags.length > 0 && (
 <div className="flex flex-wrap gap-xs mt-sm">
 {item.tags.slice(0, 3).map((tag, index) => (
 <span
 key={index}
 className="px-xs py-xs bg-muted rounded text-xs"
 >
 {tag}
 </span>
 ))}
 {item.tags.length > 3 && (
 <span className="px-xs py-xs bg-muted rounded text-xs">
 +{item.tags.length - 3} more
 </span>
 )}
 </div>
 )}

 {/* Footer */}
 <div className="flex items-center justify-between mt-md pt-sm border-t border-border">
 <span className="text-xs text-muted-foreground">
 {formatDate(item.created_at)}
 </span>
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 // Show more options menu
 }}
 >
 <MoreHorizontal className="h-3 w-3" />
 </Button>
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 </div>
 );
}
