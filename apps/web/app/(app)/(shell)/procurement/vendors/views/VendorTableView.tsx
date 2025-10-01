'use client';

import { Building, Star, Edit, Trash2, Eye, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Mail, Phone } from "lucide-react";
import { useState } from 'react';
import { Card, Badge, Button, Checkbox } from '@ghxstship/ui';
import type { Vendor, VendorSort } from '../types';
import { formatCurrency, formatDate, getStatusColor, getBusinessTypeColor } from '../types';

interface VendorTableViewProps {
 vendors: Vendor[];
 loading?: boolean;
 selectedVendors: string[];
 onSelectionChange: (vendorIds: string[]) => void;
 onVendorClick?: (vendor: Vendor) => void;
 onEditVendor?: (vendor: Vendor) => void;
 onDeleteVendor?: (vendor: Vendor) => void;
 onViewVendor?: (vendor: Vendor) => void;
 sort?: VendorSort;
 onSortChange?: (sort: VendorSort) => void;
}

export default function VendorTableView({
 vendors,
 loading = false,
 selectedVendors,
 onSelectionChange,
 onVendorClick,
 onEditVendor,
 onDeleteVendor,
 onViewVendor,
 sort,
 onSortChange,
}: VendorTableViewProps) {
 const handleVendorSelection = (vendorId: string, checked: boolean) => {
 if (checked) {
 onSelectionChange([...selectedVendors, vendorId]);
 } else {
 onSelectionChange(selectedVendors.filter(id => id !== vendorId));
 }
 };

 const handleSelectAll = (checked: boolean) => {
 if (checked) {
 onSelectionChange(vendors.map(vendor => vendor.id));
 } else {
 onSelectionChange([]);
 }
 };

 const handleSort = (field: VendorSort['field']) => {
 if (!onSortChange) return;

 let direction: 'asc' | 'desc' = 'asc';
 if (sort?.field === field && sort.direction === 'asc') {
 direction = 'desc';
 }

 onSortChange({ field, direction });
 };

 const getSortIcon = (field: VendorSort['field']) => {
 if (sort?.field !== field) {
 return <ArrowUpDown className="h-3 w-3 opacity-50" />;
 }
 return sort.direction === 'asc' 
 ? <ArrowUp className="h-3 w-3" />
 : <ArrowDown className="h-3 w-3" />;
 };

 const renderStars = (rating?: number) => {
 if (!rating) return <span className="text-muted-foreground">-</span>;
 
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
 <Card>
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left p-md w-icon-2xl">
 <div className="h-icon-xs w-icon-xs bg-muted rounded animate-pulse"></div>
 </th>
 <th className="text-left p-md">
 <div className="h-icon-xs bg-muted rounded w-component-xl animate-pulse"></div>
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
 <div className="h-icon-md bg-muted rounded-full w-component-md animate-pulse"></div>
 </td>
 <td className="p-md">
 <div className="h-icon-xs bg-muted rounded w-component-lg animate-pulse"></div>
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

 if (vendors.length === 0) {
 return (
 <Card className="p-xl text-center">
 <Building className="h-icon-2xl w-icon-2xl mx-auto mb-md text-muted-foreground opacity-50" />
 <h3 className="text-lg font-medium mb-sm">No vendors found</h3>
 <p className="text-muted-foreground">
 No vendors match your current filters. Try adjusting your search criteria.
 </p>
 </Card>
 );
 }

 const allSelected = vendors.length > 0 && selectedVendors.length === vendors.length;
 const someSelected = selectedVendors.length > 0 && selectedVendors.length < vendors.length;

 return (
 <div className="space-y-md">
 {/* Selection header */}
 {selectedVendors.length > 0 && (
 <div className="flex items-center gap-sm p-sm bg-primary/5 border border-primary/20 rounded-lg">
 <span className="text-sm font-medium">
 {selectedVendors.length} vendor{selectedVendors.length !== 1 ? 's' : ''} selected
 </span>
 <Button
 size="sm"
 variant="outline"
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
 onClick={() => handleSort('business_name')}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 Business Name
 {getSortIcon('business_name')}
 </Button>
 </th>
 <th className="text-left p-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('business_type')}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 Type
 {getSortIcon('business_type')}
 </Button>
 </th>
 <th className="text-left p-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('primary_category')}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 Category
 {getSortIcon('primary_category')}
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
 onClick={() => handleSort('rating')}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 Rating
 {getSortIcon('rating')}
 </Button>
 </th>
 <th className="text-left p-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('hourly_rate')}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 Rate
 {getSortIcon('hourly_rate')}
 </Button>
 </th>
 <th className="text-left p-md">Contact</th>
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
 {vendors.map((vendor) => {
 const isSelected = selectedVendors.includes(vendor.id);

 return (
 <tr
 key={vendor.id}
 className={`border-b border-border hover:bg-muted/30 transition-colors ${
 isSelected ? 'bg-primary/5' : ''
 }`}
 >
 <td className="p-md">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => handleVendorSelection(vendor.id, checked as boolean)}
 />
 </td>
 <td 
 className="p-md cursor-pointer"
 onClick={() => onVendorClick?.(vendor)}
 >
 <div className="flex items-center gap-sm">
 <Building className="h-icon-xs w-icon-xs text-muted-foreground flex-shrink-0" />
 <div className="min-w-0">
 <div className="font-medium truncate">{vendor.display_name}</div>
 <div className="text-sm text-muted-foreground truncate">
 {vendor.business_name}
 </div>
 </div>
 </div>
 </td>
 <td className="p-md">
 <span className={`px-sm py-xs rounded-full text-xs font-medium ${getBusinessTypeColor(vendor.business_type)}`}>
 {vendor.business_type}
 </span>
 </td>
 <td className="p-md">
 <span className="text-sm">
 {vendor.primary_category || '-'}
 </span>
 </td>
 <td className="p-md">
 <Badge variant={getStatusColor(vendor.status)}>
 {vendor.status}
 </Badge>
 </td>
 <td className="p-md">
 {renderStars(vendor.rating)}
 </td>
 <td className="p-md">
 {vendor.hourly_rate ? (
 <div className="font-medium">
 {formatCurrency(vendor.hourly_rate, vendor.currency)}/hr
 </div>
 ) : (
 <span className="text-muted-foreground">-</span>
 )}
 </td>
 <td className="p-md">
 <div className="space-y-xs">
 {vendor.email && (
 <div className="flex items-center gap-xs text-sm">
 <Mail className="h-3 w-3 text-muted-foreground" />
 <span className="truncate max-w-narrow">{vendor.email}</span>
 </div>
 )}
 {vendor.phone && (
 <div className="flex items-center gap-xs text-sm">
 <Phone className="h-3 w-3 text-muted-foreground" />
 <span className="truncate">{vendor.phone}</span>
 </div>
 )}
 </div>
 </td>
 <td className="p-md">
 <span className="text-sm text-muted-foreground">
 {formatDate(vendor.created_at)}
 </span>
 </td>
 <td className="p-md">
 <div className="flex items-center justify-end gap-xs">
 {onViewVendor && (
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 onViewVendor(vendor);
 }}
 title="View vendor"
 >
 <Eye className="h-icon-xs w-icon-xs" />
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
 title="Edit vendor"
 >
 <Edit className="h-icon-xs w-icon-xs" />
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
 title="Delete vendor"
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
