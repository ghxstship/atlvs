'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useState } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import type { CatalogItem } from '../types';
import { formatCurrency, formatDate, getStatusColor } from '../types';

interface CatalogKanbanViewProps {
 items: CatalogItem[];
 loading?: boolean;
 selectedItems: string[];
 onSelectionChange: (itemIds: string[]) => void;
 onItemClick?: (item: CatalogItem) => void;
 onEditItem?: (item: CatalogItem) => void;
 onDeleteItem?: (item: CatalogItem) => void;
 onViewItem?: (item: CatalogItem) => void;
 onStatusChange?: (item: CatalogItem, newStatus: string) => void;
}

const statusColumns = [
 { key: 'active', label: 'Active', color: 'bg-success/10 border-success/20' },
 { key: 'inactive', label: 'Inactive', color: 'bg-warning/10 border-warning/20' },
 { key: 'discontinued', label: 'Discontinued', color: 'bg-destructive/10 border-destructive/20' },
];

export default function CatalogKanbanView({
 items,
 loading = false,
 selectedItems,
 onSelectionChange,
 onItemClick,
 onEditItem,
 onDeleteItem,
 onViewItem,
 onStatusChange,
}: CatalogKanbanViewProps) {
 const [draggedItem, setDraggedItem] = useState<CatalogItem | null>(null);

 const getTypeIcon = (type: string) => {
 return type === 'product' ? Package2 : Wrench;
 };

 const handleDragStart = (e: React.DragEvent, item: CatalogItem) => {
 setDraggedItem(item);
 e.dataTransfer.effectAllowed = 'move';
 };

 const handleDragEnd = () => {
 setDraggedItem(null);
 };

 const handleDragOver = (e: React.DragEvent) => {
 e.preventDefault();
 e.dataTransfer.dropEffect = 'move';
 };

 const handleDrop = (e: React.DragEvent, status: string) => {
 e.preventDefault();
 if (draggedItem && draggedItem.status !== status) {
 onStatusChange?.(draggedItem, status);
 }
 setDraggedItem(null);
 };

 const getItemsByStatus = (status: string) => {
 return items.filter(item => item.status === status);
 };

 if (loading) {
 return (
 <div className="flex gap-md h-content-xl">
 {statusColumns.map((column) => (
 <div key={column.key} className="flex-1">
 <Card className={`h-full ${column.color}`}>
 <div className="p-md border-b border-border">
 <div className="h-icon-md bg-muted rounded w-component-lg animate-pulse"></div>
 </div>
 <div className="p-md space-y-md">
 {Array.from({ length: 3 }).map((_, index) => (
 <Card key={index} className="p-md">
 <div className="animate-pulse space-y-sm">
 <div className="flex items-center gap-sm">
 <div className="h-icon-xs w-icon-xs bg-muted rounded"></div>
 <div className="h-icon-xs bg-muted rounded w-3/4"></div>
 </div>
 <div className="h-3 bg-muted rounded w-1/2"></div>
 <div className="h-3 bg-muted rounded w-full"></div>
 <div className="h-icon-sm bg-muted rounded w-component-md"></div>
 </div>
 </Card>
 ))}
 </div>
 </Card>
 </div>
 ))}
 </div>
 );
 }

 return (
 <div className="flex gap-md h-content-xl overflow-x-auto">
 {statusColumns.map((column) => {
 const columnItems = getItemsByStatus(column.key);
 
 return (
 <div key={column.key} className="flex-1 min-w-content-medium">
 <Card 
 className={`h-full ${column.color} flex flex-col`}
 onDragOver={handleDragOver}
 onDrop={(e) => handleDrop(e, column.key)}
 >
 {/* Column header */}
 <div className="p-md border-b border-border flex-shrink-0">
 <div className="flex items-center justify-between">
 <h3 className="font-medium">{column.label}</h3>
 <Badge variant="secondary">
 {columnItems.length}
 </Badge>
 </div>
 </div>

 {/* Column content */}
 <div className="flex-1 p-md space-y-md overflow-y-auto">
 {columnItems.length === 0 ? (
 <div className="text-center py-lg text-muted-foreground">
 <div className="text-sm">No {column.label.toLowerCase()} items</div>
 </div>
 ) : (
 columnItems.map((item) => {
 const TypeIcon = getTypeIcon(item.type);
 const isSelected = selectedItems.includes(item.id);
 const isDragging = draggedItem?.id === item.id;

 return (
 <Card
 key={item.id}
 className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
 isSelected ? 'ring-2 ring-primary' : ''
 } ${isDragging ? 'opacity-50 rotate-2' : ''}`}
 draggable
 onDragStart={(e) => handleDragStart(e, item)}
 onDragEnd={handleDragEnd}
 onClick={() => onItemClick?.(item)}
 >
 <div className="p-md">
 {/* Header */}
 <div className="flex items-start justify-between mb-sm">
 <div className="flex items-center gap-sm min-w-0 flex-1">
 <TypeIcon className="h-icon-xs w-icon-xs text-muted-foreground flex-shrink-0" />
 <h4 className="font-medium text-sm truncate">{item.name}</h4>
 </div>
 <div className="flex items-center gap-xs ml-sm">
 {onViewItem && (
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 onViewItem(item);
 }}
 className="h-icon-md w-icon-md p-0"
 >
 <Eye className="h-3 w-3" />
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
 className="h-icon-md w-icon-md p-0"
 >
 <Edit className="h-3 w-3" />
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
 className="h-icon-md w-icon-md p-0"
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 )}
 </div>
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
 <span className="text-xs text-muted-foreground">
 {item.category}
 </span>
 )}
 </div>

 {/* Description */}
 {item.description && (
 <p className="text-xs text-muted-foreground line-clamp-xs mb-sm">
 {item.description}
 </p>
 )}

 {/* Price */}
 <div className="flex items-center justify-between mb-sm">
 <div className="font-semibold text-sm">
 {formatCurrency(item.price || item.rate || 0, item.currency)}
 {item.type === 'service' && item.unit && (
 <span className="text-xs text-muted-foreground font-normal">
 /{item.unit}
 </span>
 )}
 </div>
 </div>

 {/* Supplier */}
 {item.supplier && (
 <div className="text-xs text-muted-foreground mb-sm">
 <strong>Supplier:</strong> {item.supplier}
 </div>
 )}

 {/* SKU */}
 {item.sku && (
 <div className="text-xs text-muted-foreground mb-sm">
 <strong>SKU:</strong> {item.sku}
 </div>
 )}

 {/* Tags */}
 {item.tags && item.tags.length > 0 && (
 <div className="flex flex-wrap gap-xs mb-sm">
 {item.tags.slice(0, 2).map((tag, index) => (
 <span
 key={index}
 className="px-xs py-xs bg-muted rounded text-xs"
 >
 {tag}
 </span>
 ))}
 {item.tags.length > 2 && (
 <span className="px-xs py-xs bg-muted rounded text-xs">
 +{item.tags.length - 2}
 </span>
 )}
 </div>
 )}

 {/* Footer */}
 <div className="flex items-center justify-between pt-sm border-t border-border text-xs text-muted-foreground">
 <span>{formatDate(item.created_at)}</span>
 <div className="flex items-center gap-xs">
 <div className="w-2 h-2 rounded-full bg-current opacity-50"></div>
 <span>{item.id.slice(-6)}</span>
 </div>
 </div>
 </div>
 </Card>
 );
 })
 )}
 </div>
 </Card>
 </div>
 );
 })}
 </div>
 );
}
