'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useState } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import type { Vendor } from '../types';
import { formatCurrency, formatDate, getStatusColor, getBusinessTypeColor } from '../types';

interface VendorKanbanViewProps {
 vendors: Vendor[];
 loading?: boolean;
 selectedVendors: string[];
 onSelectionChange: (vendorIds: string[]) => void;
 onVendorClick?: (vendor: Vendor) => void;
 onEditVendor?: (vendor: Vendor) => void;
 onDeleteVendor?: (vendor: Vendor) => void;
 onViewVendor?: (vendor: Vendor) => void;
 onStatusChange?: (vendor: Vendor, newStatus: string) => void;
}

const statusColumns = [
 { key: 'active', label: 'Active', color: 'bg-success/10 border-success/20' },
 { key: 'pending', label: 'Pending', color: 'bg-warning/10 border-warning/20' },
 { key: 'inactive', label: 'Inactive', color: 'bg-secondary/10 border-secondary/20' },
 { key: 'suspended', label: 'Suspended', color: 'bg-destructive/10 border-destructive/20' },
];

export default function VendorKanbanView({
 vendors,
 loading = false,
 selectedVendors,
 onSelectionChange,
 onVendorClick,
 onEditVendor,
 onDeleteVendor,
 onViewVendor,
 onStatusChange,
}: VendorKanbanViewProps) {
 const [draggedVendor, setDraggedVendor] = useState<Vendor | null>(null);

 const handleDragStart = (e: React.DragEvent, vendor: Vendor) => {
 setDraggedVendor(vendor);
 e.dataTransfer.effectAllowed = 'move';
 };

 const handleDragEnd = () => {
 setDraggedVendor(null);
 };

 const handleDragOver = (e: React.DragEvent) => {
 e.preventDefault();
 e.dataTransfer.dropEffect = 'move';
 };

 const handleDrop = (e: React.DragEvent, status: string) => {
 e.preventDefault();
 if (draggedVendor && draggedVendor.status !== status) {
 onStatusChange?.(draggedVendor, status);
 }
 setDraggedVendor(null);
 };

 const getVendorsByStatus = (status: string) => {
 return vendors.filter(vendor => vendor.status === status);
 };

 const renderStars = (rating?: number) => {
 if (!rating) return null;
 
 return (
 <div className="flex items-center gap-xs">
 {[1, 2, 3, 4, 5].map((star) => (
 <Star
 key={star}
 className={`h-3 w-3 ${
 star <= rating ? 'text-warning fill-current' : 'text-muted-foreground'
 }`}
 />
 ))}
 <span className="text-xs text-muted-foreground ml-xs">({rating.toFixed(1)})</span>
 </div>
 );
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
 const columnVendors = getVendorsByStatus(column.key);
 
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
 {columnVendors.length}
 </Badge>
 </div>
 </div>

 {/* Column content */}
 <div className="flex-1 p-md space-y-md overflow-y-auto">
 {columnVendors.length === 0 ? (
 <div className="text-center py-lg text-muted-foreground">
 <div className="text-sm">No {column.label.toLowerCase()} vendors</div>
 </div>
 ) : (
 columnVendors.map((vendor) => {
 const isSelected = selectedVendors.includes(vendor.id);
 const isDragging = draggedVendor?.id === vendor.id;

 return (
 <Card
 key={vendor.id}
 className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
 isSelected ? 'ring-2 ring-primary' : ''
 } ${isDragging ? 'opacity-50 rotate-2' : ''}`}
 draggable
 onDragStart={(e) => handleDragStart(e, vendor)}
 onDragEnd={handleDragEnd}
 onClick={() => onVendorClick?.(vendor)}
 >
 <div className="p-md">
 {/* Header */}
 <div className="flex items-start justify-between mb-sm">
 <div className="flex items-center gap-sm min-w-0 flex-1">
 <Building className="h-icon-xs w-icon-xs text-muted-foreground flex-shrink-0" />
 <div className="min-w-0 flex-1">
 <h4 className="font-medium text-sm truncate">{vendor.display_name}</h4>
 <p className="text-xs text-muted-foreground truncate">{vendor.business_name}</p>
 </div>
 </div>
 <div className="flex items-center gap-xs ml-sm">
 {onViewVendor && (
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 onViewVendor(vendor);
 }}
 className="h-icon-md w-icon-md p-0"
 >
 <Eye className="h-3 w-3" />
 </Button>
 )}
 {onEditVendor && (
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 onEditVendor(vendor);
 }}
 className="h-icon-md w-icon-md p-0"
 >
 <Edit className="h-3 w-3" />
 </Button>
 )}
 {onDeleteVendor && (
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 onDeleteVendor(vendor);
 }}
 className="h-icon-md w-icon-md p-0"
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 )}
 </div>
 </div>

 {/* Business type and category */}
 <div className="flex items-center gap-sm mb-sm">
 <span className={`px-sm py-xs rounded-full text-xs font-medium ${getBusinessTypeColor(vendor.business_type)}`}>
 {vendor.business_type}
 </span>
 {vendor.primary_category && (
 <span className="text-xs text-muted-foreground truncate">
 {vendor.primary_category}
 </span>
 )}
 </div>

 {/* Rating */}
 {vendor.rating && (
 <div className="mb-sm">
 {renderStars(vendor.rating)}
 </div>
 )}

 {/* Bio */}
 {vendor.bio && (
 <p className="text-xs text-muted-foreground line-clamp-xs mb-sm">
 {vendor.bio}
 </p>
 )}

 {/* Hourly rate */}
 {vendor.hourly_rate && (
 <div className="flex items-center justify-between mb-sm">
 <div className="font-semibold text-sm">
 {formatCurrency(vendor.hourly_rate, vendor.currency)}/hr
 </div>
 </div>
 )}

 {/* Contact info */}
 <div className="space-y-xs text-xs text-muted-foreground mb-sm">
 {vendor.email && (
 <div className="flex items-center gap-xs">
 <Mail className="h-3 w-3 flex-shrink-0" />
 <span className="truncate">{vendor.email}</span>
 </div>
 )}
 {vendor.phone && (
 <div className="flex items-center gap-xs">
 <Phone className="h-3 w-3 flex-shrink-0" />
 <span className="truncate">{vendor.phone}</span>
 </div>
 )}
 </div>

 {/* Skills */}
 {vendor.skills && vendor.skills.length > 0 && (
 <div className="flex flex-wrap gap-xs mb-sm">
 {vendor.skills.slice(0, 2).map((skill, index) => (
 <span
 key={index}
 className="px-xs py-xs bg-muted rounded text-xs"
 >
 {skill}
 </span>
 ))}
 {vendor.skills.length > 2 && (
 <span className="px-xs py-xs bg-muted rounded text-xs">
 +{vendor.skills.length - 2}
 </span>
 )}
 </div>
 )}

 {/* Stats */}
 {(vendor.total_projects || vendor.total_reviews) && (
 <div className="flex items-center justify-between text-xs text-muted-foreground mb-sm">
 {vendor.total_projects && (
 <span>{vendor.total_projects} projects</span>
 )}
 {vendor.total_reviews && (
 <span>{vendor.total_reviews} reviews</span>
 )}
 </div>
 )}

 {/* Footer */}
 <div className="flex items-center justify-between pt-sm border-t border-border text-xs text-muted-foreground">
 <span>{formatDate(vendor.created_at)}</span>
 <div className="flex items-center gap-xs">
 <div className="w-2 h-2 rounded-full bg-current opacity-50"></div>
 <span>{vendor.id.slice(-6)}</span>
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
