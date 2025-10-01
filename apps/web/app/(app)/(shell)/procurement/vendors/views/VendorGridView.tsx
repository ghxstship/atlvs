'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useState } from 'react';
import { Card, Badge, Button, Checkbox } from '@ghxstship/ui';
import type { Vendor } from '../types';
import { formatCurrency, formatDate, getStatusColor, getBusinessTypeColor, formatAddress } from '../types';

interface VendorGridViewProps {
 vendors: Vendor[];
 loading?: boolean;
 selectedVendors: string[];
 onSelectionChange: (vendorIds: string[]) => void;
 onVendorClick?: (vendor: Vendor) => void;
 onEditVendor?: (vendor: Vendor) => void;
 onDeleteVendor?: (vendor: Vendor) => void;
 onViewVendor?: (vendor: Vendor) => void;
}

export default function VendorGridView({
 vendors,
 loading = false,
 selectedVendors,
 onSelectionChange,
 onVendorClick,
 onEditVendor,
 onDeleteVendor,
 onViewVendor,
}: VendorGridViewProps) {
 const [hoveredVendor, setHoveredVendor] = useState<string | null>(null);

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
 {vendors.length > 0 && (
 <div className="flex items-center gap-sm p-sm bg-muted/30 rounded-lg">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected}
 onCheckedChange={handleSelectAll}
 />
 <span className="text-sm text-muted-foreground">
 {selectedVendors.length > 0 
 ? `${selectedVendors.length} of ${vendors.length} vendors selected`
 : `Select all ${vendors.length} vendors`
 }
 </span>
 </div>
 )}

 {/* Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {vendors.map((vendor) => {
 const isSelected = selectedVendors.includes(vendor.id);
 const isHovered = hoveredVendor === vendor.id;

 return (
 <Card
 key={vendor.id}
 className={`relative transition-all duration-200 cursor-pointer hover:shadow-md ${
 isSelected ? 'ring-2 ring-primary' : ''
 }`}
 onMouseEnter={() => setHoveredVendor(vendor.id)}
 onMouseLeave={() => setHoveredVendor(null)}
 onClick={() => onVendorClick?.(vendor)}
 >
 {/* Selection checkbox */}
 <div className="absolute top-sm left-sm z-10">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => handleVendorSelection(vendor.id, checked as boolean)}
 onClick={(e) => e.stopPropagation()}
 />
 </div>

 {/* Action buttons */}
 {isHovered && (
 <div className="absolute top-sm right-sm z-10 flex gap-xs">
 {onViewVendor && (
 <Button
 size="sm"
 variant="secondary"
 onClick={(e) => {
 e.stopPropagation();
 onViewVendor(vendor);
 }}
 >
 <Eye className="h-3 w-3" />
 </Button>
 )}
 {onEditVendor && (
 <Button
 size="sm"
 variant="secondary"
 onClick={(e) => {
 e.stopPropagation();
 onEditVendor(vendor);
 }}
 >
 <Edit className="h-3 w-3" />
 </Button>
 )}
 {onDeleteVendor && (
 <Button
 size="sm"
 variant="destructive"
 onClick={(e) => {
 e.stopPropagation();
 onDeleteVendor(vendor);
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
 <div className="p-sm bg-primary/10 rounded-lg">
 <Building className="h-icon-xs w-icon-xs text-primary flex-shrink-0" />
 </div>
 <div className="min-w-0 flex-1">
 <h4 className="font-medium truncate">{vendor.display_name}</h4>
 <p className="text-sm text-muted-foreground truncate">{vendor.business_name}</p>
 </div>
 </div>
 <Badge variant={getStatusColor(vendor.status)} className="ml-sm">
 {vendor.status}
 </Badge>
 </div>

 {/* Business type and category */}
 <div className="flex items-center gap-sm mb-sm">
 <span className={`px-sm py-xs rounded-full text-xs font-medium ${getBusinessTypeColor(vendor.business_type)}`}>
 {vendor.business_type}
 </span>
 {vendor.primary_category && (
 <span className="text-xs text-muted-foreground uppercase tracking-wide truncate">
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

 {/* Bio/Description */}
 {vendor.bio && (
 <p className="text-sm text-muted-foreground line-clamp-xs mb-sm">
 {vendor.bio}
 </p>
 )}

 {/* Hourly rate */}
 {vendor.hourly_rate && (
 <div className="flex items-center justify-between mb-sm">
 <div className="text-lg font-semibold">
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
 {vendor.website && (
 <div className="flex items-center gap-xs">
 <Globe className="h-3 w-3 flex-shrink-0" />
 <span className="truncate">Website</span>
 </div>
 )}
 {vendor.address && (
 <div className="flex items-center gap-xs">
 <MapPin className="h-3 w-3 flex-shrink-0" />
 <span className="truncate">{formatAddress(vendor.address)}</span>
 </div>
 )}
 </div>

 {/* Skills */}
 {vendor.skills && vendor.skills.length > 0 && (
 <div className="flex flex-wrap gap-xs mb-sm">
 {vendor.skills.slice(0, 3).map((skill, index) => (
 <span
 key={index}
 className="px-xs py-xs bg-muted rounded text-xs"
 >
 {skill}
 </span>
 ))}
 {vendor.skills.length > 3 && (
 <span className="px-xs py-xs bg-muted rounded text-xs">
 +{vendor.skills.length - 3} more
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
 <div className="flex items-center justify-between mt-md pt-sm border-t border-border">
 <span className="text-xs text-muted-foreground">
 {formatDate(vendor.created_at)}
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
