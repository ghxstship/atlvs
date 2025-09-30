"use client";

import { MoreHorizontal, Edit, Eye, Trash2, ArrowUpDown, ArrowUp, ArrowDown, MapPin, Calendar, Users, DollarSign } from "lucide-react";
import { useState } from "react";
import {
 Badge,
 Button,
 Card,
 Table,
 Checkbox,
} from "@ghxstship/ui";
import type { ProgrammingItinerary, ItinerarySort } from "../types";
import { STATUS_BADGE, TYPE_BADGE, TRANSPORTATION_TYPE_LABEL } from "../types";

type User = {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
};

type ProgrammingItinerariesListViewProps = {
 itineraries: ProgrammingItinerary[];
 loading: boolean;
 selectedItineraries: Set<string>;
 onSelectionChange: (id: string, selected: boolean) => void;
 onSelectAll: (selected: boolean) => void;
 onEdit: (itinerary: ProgrammingItinerary) => void;
 onView: (itinerary: ProgrammingItinerary) => void;
 onDelete: (itinerary: ProgrammingItinerary) => void;
 sortConfig: ItinerarySort;
 onSort: (sort: ItinerarySort) => void;
 users: User[];
};

export default function ProgrammingItinerariesListView({
 itineraries,
 loading,
 selectedItineraries,
 onSelectionChange,
 onSelectAll,
 onEdit,
 onView,
 onDelete,
 sortConfig,
 onSort,
 users,
}: ProgrammingItinerariesListViewProps) {
 const [expandedRows, setExpandedRows] = useState<Set<string>(new Set());

 const handleSort = (field: keyof ProgrammingItinerary) => {
 if (sortConfig.field === field) {
 onSort({
 field,
 direction: sortConfig.direction === "asc" ? "desc" : "asc",
 });
 } else {
 onSort({ field, direction: "asc" });
 }
 };

 const getSortIcon = (field: keyof ProgrammingItinerary) => {
 if (sortConfig.field !== field) {
 return <ArrowUpDown className="h-4 w-4" />;
 }
 return sortConfig.direction === "asc" ? (
 <ArrowUp className="h-4 w-4" />
 ) : (
 <ArrowDown className="h-4 w-4" />
 );
 };

 const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleDateString();
 };

 const formatCurrency = (amount: number | null, currency: string | null) => {
 if (!amount || !currency) return "—";
 return new Intl.NumberFormat("en-US", {
 style: "currency",
 currency: currency,
 }).format(amount);
 };

 const getUserName = (userId: string) => {
 const user = users.find((u) => u.id === userId);
 return user?.full_name || user?.email || "Unknown User";
 };

 const toggleRowExpansion = (id: string) => {
 setExpandedRows((prev: unknown) => {
 const newSet = new Set(prev);
 if (newSet.has(id)) {
 newSet.delete(id);
 } else {
 newSet.add(id);
 }
 return newSet;
 });
 };

 const allSelected = itineraries.length > 0 && selectedItineraries.size === itineraries.length;
 const someSelected = selectedItineraries.size > 0 && selectedItineraries.size < itineraries.length;

 if (loading) {
 return (
 <Card className="p-lg">
 <div className="flex items-center justify-center py-12">
 <div className="text-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
 <p className="text-muted-foreground">Loading itineraries...</p>
 </div>
 </div>
 </Card>
 );
 }

 return (
 <Card>
 <Table>
 <thead>
 <tr>
 <th className="w-12">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected}
 onChange={(checked) => onSelectAll(checked)}
 />
 </th>
 <th>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort("name")}
 className="h-auto p-0 font-medium"
 >
 Name
 {getSortIcon("name")}
 </Button>
 </th>
 <th>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort("type")}
 className="h-auto p-0 font-medium"
 >
 Type
 {getSortIcon("type")}
 </Button>
 </th>
 <th>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort("status")}
 className="h-auto p-0 font-medium"
 >
 Status
 {getSortIcon("status")}
 </Button>
 </th>
 <th>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort("start_date")}
 className="h-auto p-0 font-medium"
 >
 Start Date
 {getSortIcon("start_date")}
 </Button>
 </th>
 <th>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort("end_date")}
 className="h-auto p-0 font-medium"
 >
 End Date
 {getSortIcon("end_date")}
 </Button>
 </th>
 <th>Location</th>
 <th>Project</th>
 <th>Cost</th>
 <th className="w-12">Actions</th>
 </tr>
 </thead>
 <tbody>
 {itineraries.map((itinerary) => {
 const statusConfig = STATUS_BADGE[itinerary.status];
 const typeConfig = TYPE_BADGE[itinerary.type];
 const isExpanded = expandedRows.has(itinerary.id);
 const isSelected = selectedItineraries.has(itinerary.id);

 return (
 <>
 <tr
 key={itinerary.id}
 className={`cursor-pointer hover:bg-muted/50 ${
 isSelected ? "bg-muted/30" : ""
 }`}
 onClick={() => toggleRowExpansion(itinerary.id)}
 >
 <td onClick={(e) => e.stopPropagation()}>
 <Checkbox
 checked={isSelected}
 onChange={(checked) => onSelectionChange(itinerary.id, checked)}
 />
 </td>
 <td>
 <div>
 <div className="font-medium">{itinerary.name}</div>
 {itinerary.description && (
 <div className="text-sm text-muted-foreground truncate max-w-xs">
 {itinerary.description}
 </div>
 )}
 </div>
 </td>
 <td>
 <Badge variant="secondary" className="text-xs">
 {typeConfig.icon} {typeConfig.label}
 </Badge>
 </td>
 <td>
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 </td>
 <td>
 <div className="flex items-center gap-1 text-sm">
 <Calendar className="h-3 w-3" />
 {formatDate(itinerary.start_date)}
 </div>
 </td>
 <td>
 <div className="flex items-center gap-1 text-sm">
 <Calendar className="h-3 w-3" />
 {formatDate(itinerary.end_date)}
 </div>
 </td>
 <td>
 {itinerary.location && (
 <div className="flex items-center gap-1 text-sm">
 <MapPin className="h-3 w-3" />
 <span className="truncate max-w-xs">{itinerary.location}</span>
 </div>
 )}
 </td>
 <td>
 {itinerary.project && (
 <div className="text-sm">
 <div className="font-medium">{itinerary.project.name}</div>
 <Badge variant="outline" className="text-xs">
 {itinerary.project.status}
 </Badge>
 </div>
 )}
 </td>
 <td>
 {itinerary.total_cost && (
 <div className="flex items-center gap-1 text-sm">
 <DollarSign className="h-3 w-3" />
 {formatCurrency(itinerary.total_cost, itinerary.currency)}
 </div>
 )}
 </td>
 <td onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center gap-1">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(itinerary)}
 >
 <Eye className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(itinerary)}
 >
 <Edit className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(itinerary)}
 >
 <Trash2 className="h-4 w-4 text-destructive" />
 </Button>
 </div>
 </td>
 </tr>

 {/* Expanded row details */}
 {isExpanded && (
 <tr>
 <td colSpan={10}>
 <div className="p-md bg-muted/30 border-t">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {/* Transportation */}
 {itinerary.transportation_type && (
 <div>
 <h4 className="font-medium text-sm mb-1">Transportation</h4>
 <p className="text-sm text-muted-foreground">
 {TRANSPORTATION_TYPE_LABEL[itinerary.transportation_type]}
 </p>
 </div>
 )}

 {/* Participants */}
 {itinerary.participants_count && (
 <div>
 <h4 className="font-medium text-sm mb-1">Participants</h4>
 <div className="flex items-center gap-1 text-sm">
 <Users className="h-3 w-3" />
 {itinerary.participants_count}
 </div>
 </div>
 )}

 {/* Event */}
 {itinerary.event && (
 <div>
 <h4 className="font-medium text-sm mb-1">Related Event</h4>
 <p className="text-sm text-muted-foreground">
 {itinerary.event.title}
 </p>
 </div>
 )}

 {/* Tags */}
 {itinerary.tags.length > 0 && (
 <div className="md:col-span-2 lg:col-span-3">
 <h4 className="font-medium text-sm mb-1">Tags</h4>
 <div className="flex flex-wrap gap-1">
 {itinerary.tags.map((tag) => (
 <Badge key={tag} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 </div>
 </div>
 )}

 {/* Destinations */}
 {itinerary.destinations.length > 0 && (
 <div className="md:col-span-2 lg:col-span-3">
 <h4 className="font-medium text-sm mb-1">Destinations</h4>
 <div className="space-y-1">
 {itinerary.destinations.slice(0, 3).map((destination, index) => (
 <div key={index} className="text-sm text-muted-foreground">
 <MapPin className="h-3 w-3 inline mr-1" />
 {destination.name}
 {destination.address && ` - ${destination.address}`}
 </div>
 ))}
 {itinerary.destinations.length > 3 && (
 <div className="text-sm text-muted-foreground">
 +{itinerary.destinations.length - 3} more destinations
 </div>
 )}
 </div>
 </div>
 )}

 {/* Created by */}
 <div className="md:col-span-2 lg:col-span-3 pt-2 border-t">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span>Created by {getUserName(itinerary.created_by)}</span>
 <span>{new Date(itinerary.created_at).toLocaleString()}</span>
 </div>
 </div>
 </div>
 </div>
 </td>
 </tr>
 )}
 </>
 );
 })}
 </tbody>
 </Table>

 {itineraries.length === 0 && (
 <div className="p-lg text-center">
 <p className="text-muted-foreground">No itineraries found</p>
 </div>
 )}
 </Card>
 );
}
