"use client";

import { Badge, Button, Checkbox } from "@ghxstship/ui";
import type { Location } from "../LocationsClient";
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Copy, Edit, Eye, Navigation, Trash2 } from 'lucide-react';

interface LocationListViewProps {
 locations: Location[];
 selectedLocations: Set<string>;
 fieldVisibility: Array<{ id: string; label: string; visible: boolean; sortable: boolean }>;
 sortField: string;
 sortDirection: "asc" | "desc";
 onSelectAll: () => void;
 onSelectLocation: (id: string) => void;
 onSort: (field: string) => void;
 onView: (location: Location) => void;
 onEdit: (location: Location) => void;
 onDelete: (location: Location) => void;
 onDuplicate: (location: Location) => void;
 onNavigate: (location: Location) => void;
 getTypeBadgeVariant: (type: string) => any;
 getAvailabilityBadgeVariant: (status: string) => any;
}

export default function LocationListView({
 locations,
 selectedLocations,
 fieldVisibility,
 sortField,
 sortDirection,
 onSelectAll,
 onSelectLocation,
 onSort,
 onView,
 onEdit,
 onDelete,
 onDuplicate,
 onNavigate,
 getTypeBadgeVariant,
 getAvailabilityBadgeVariant,
}: LocationListViewProps) {
 const visibleFields = fieldVisibility.filter((f) => f.visible);

 const renderFieldValue = (location: Location, fieldId: string) => {
 switch (fieldId) {
 case "name":
 return <span className="font-medium">{location.name}</span>;
 case "type":
 return (
 <Badge variant={getTypeBadgeVariant(location.type || "other")}>
 {location.type || "other"}
 </Badge>
 );
 case "address":
 return location.address || "-";
 case "city":
 return location.city || "-";
 case "state":
 return location.state || "-";
 case "country":
 return location.country || "-";
 case "capacity":
 return location.capacity ? location.capacity.toLocaleString() : "-";
 case "size":
 return location.size ? `${location.size.toLocaleString()} sq ft` : "-";
 case "availability_status":
 return (
 <Badge variant={getAvailabilityBadgeVariant(location.availability_status || "available")}>
 {location.availability_status || "available"}
 </Badge>
 );
 case "rental_rate":
 return location.rental_rate 
 ? `${location.currency || "$"}${location.rental_rate.toLocaleString()}`
 : "-";
 case "project":
 return location.project?.name || "-";
 case "contact_name":
 return location.contact_name || "-";
 case "created_at":
 return new Date(location.created_at).toLocaleDateString();
 case "updated_at":
 return new Date(location.updated_at).toLocaleDateString();
 default:
 return "-";
 }
 };

 return (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b">
 <th className="text-left p-sm">
 <Checkbox
 checked={selectedLocations.size === locations.length && locations.length > 0}
 onChange={onSelectAll}
 />
 </th>
 {visibleFields.map((field) => (
 <th
 key={field.id}
 className={`text-left p-sm ${
 field.sortable ? "cursor-pointer hover:bg-muted/50" : ""
 }`}
 onClick={() => field.sortable && onSort(field.id)}
 >
 <div className="flex items-center gap-xs">
 {field.label}
 {field.sortable && (
 <>
 {sortField === field.id ? (
 sortDirection === "asc" ? (
 <ArrowUp className="h-3 w-3" />
 ) : (
 <ArrowDown className="h-3 w-3" />
 )
 ) : (
 <ArrowUpDown className="h-3 w-3 opacity-30" />
 )}
 </>
 )}
 </div>
 </th>
 ))}
 <th className="text-left p-sm">Actions</th>
 </tr>
 </thead>
 <tbody>
 {locations.map((location) => (
 <tr
 key={location.id}
 className={`border-b hover:bg-muted/50 cursor-pointer ${
 selectedLocations.has(location.id) ? "bg-primary/5" : ""
 }`}
 onClick={() => onView(location)}
 >
 <td className="p-sm" onClick={(e) => e.stopPropagation()}>
 <Checkbox
 checked={selectedLocations.has(location.id)}
 onChange={() => onSelectLocation(location.id)}
 />
 </td>
 {visibleFields.map((field) => (
 <td key={field.id} className="p-sm">
 {renderFieldValue(location, field.id)}
 </td>
 ))}
 <td className="p-sm" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center gap-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onNavigate(location)}
 title="Navigate"
 >
 <Navigation className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(location)}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(location)}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDuplicate(location)}
 >
 <Copy className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(location)}
 className="text-destructive"
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 
 {locations.length === 0 && (
 <div className="text-center py-xl text-muted-foreground">
 No locations to display
 </div>
 )}
 </div>
 );
}
