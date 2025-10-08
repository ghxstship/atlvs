'use client';

import { Edit, Eye, User, MapPin, Plus, Trash2, Plane, Calendar, DollarSign } from "lucide-react";
import { useState } from 'react';
import { 
 Card, 
 Badge, 
 Button, 
 Avatar
} from '@ghxstship/ui';
import type { TravelRecord } from '../types';
import { TRAVEL_STATUS_LABELS, TRAVEL_TYPE_LABELS } from '../types';

interface TravelKanbanViewProps {
 records: TravelRecord[];
 selectedIds: string[];
 onSelectItem: (id: string, selected: boolean) => void;
 onView: (record: TravelRecord) => void;
 onEdit: (record: TravelRecord) => void;
 onDelete: (record: TravelRecord) => void;
 loading: boolean;
}

// Kanban columns based on travel status
const KANBAN_COLUMNS = [
 {
 id: 'planned',
 title: 'Planned',
 description: 'Upcoming trips',
 color: 'bg-blue-50 border-blue-200',
 headerColor: 'bg-blue-100',
 statusFilter: (record: TravelRecord) => record.status === 'planned'
 },
 {
 id: 'confirmed',
 title: 'Confirmed',
 description: 'Confirmed bookings',
 color: 'bg-green-50 border-green-200',
 headerColor: 'bg-green-100',
 statusFilter: (record: TravelRecord) => record.status === 'confirmed'
 },
 {
 id: 'in_progress',
 title: 'In Progress',
 description: 'Currently traveling',
 color: 'bg-yellow-50 border-yellow-200',
 headerColor: 'bg-yellow-100',
 statusFilter: (record: TravelRecord) => record.status === 'in_progress'
 },
 {
 id: 'completed',
 title: 'Completed',
 description: 'Finished trips',
 color: 'bg-gray-50 border-gray-200',
 headerColor: 'bg-gray-100',
 statusFilter: (record: TravelRecord) => record.status === 'completed'
 },
 {
 id: 'cancelled',
 title: 'Cancelled',
 description: 'Cancelled trips',
 color: 'bg-red-50 border-red-200',
 headerColor: 'bg-red-100',
 statusFilter: (record: TravelRecord) => record.status === 'cancelled'
 },
];

export default function TravelKanbanView({
 records,
 selectedIds,
 onSelectItem,
 onView,
 onEdit,
 onDelete,
 loading
}: TravelKanbanViewProps) {
 const [draggedItem, setDraggedItem] = useState<string | null>(null);

 // Group records by status
 const groupedRecords = KANBAN_COLUMNS.reduce((acc, column) => {
 acc[column.id] = records.filter(column.statusFilter);
 return acc;
 }, {} as Record<string, TravelRecord[]>);

 const handleDragStart = (e: React.DragEvent, recordId: string) => {
 setDraggedItem(recordId);
 e.dataTransfer.effectAllowed = 'move';
 };

 const handleDragEnd = () => {
 setDraggedItem(null);
 };

 const handleDragOver = (e: React.DragEvent) => {
 e.preventDefault();
 e.dataTransfer.dropEffect = 'move';
 };

 const handleDrop = (e: React.DragEvent, columnId: string) => {
 e.preventDefault();
 // In a real implementation, this would update the record status
 setDraggedItem(null);
 };

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-lg">
 {KANBAN_COLUMNS.map((column) => (
 <div key={column.id} className="space-y-md">
 <div className="animate-pulse">
 <div className="h-component-md bg-muted rounded-lg mb-md"></div>
 {[...Array(3)].map((_, i) => (
 <div key={i} className="h-component-xl bg-muted rounded-lg mb-sm"></div>
 ))}
 </div>
 </div>
 ))}
 </div>
 );
 }

 if (records.length === 0) {
 return (
 <Card className="p-xl text-center">
 <Plane className="h-icon-2xl w-icon-2xl text-muted-foreground mx-auto mb-md" />
 <h3 className="text-lg font-semibold mb-sm">No Travel Records</h3>
 <p className="text-muted-foreground">
 Start by adding your travel history and upcoming trips.
 </p>
 </Card>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-lg">
 {KANBAN_COLUMNS.map((column) => {
 const columnRecords = groupedRecords[column.id] || [];
 
 return (
 <div
 key={column.id}
 className={`rounded-lg border-2 ${column.color} min-h-container-lg`}
 onDragOver={handleDragOver}
 onDrop={(e) => handleDrop(e, column.id)}
 >
 {/* Column Header */}
 <div className={`p-md rounded-t-lg ${column.headerColor} border-b`}>
 <div className="flex items-center justify-between">
 <div>
 <h3 className="font-semibold text-sm">{column.title}</h3>
 <p className="text-xs text-muted-foreground">{column.description}</p>
 </div>
 <Badge variant="secondary" className="text-xs">
 {columnRecords.length}
 </Badge>
 </div>
 </div>

 {/* Column Content */}
 <div className="p-sm space-y-sm">
 {columnRecords.map((record) => {
 const isSelected = selectedIds.includes(record.id);
 const startDate = new Date(record.start_date);
 const endDate = new Date(record.end_date);
 const isUpcoming = startDate > new Date();
 const isActive = startDate <= new Date() && endDate >= new Date();

 return (
 <Card
 key={record.id}
 className={`p-sm cursor-move transition-all hover:shadow-md ${
 isSelected ? 'ring-2 ring-primary' : ''
 } ${draggedItem === record.id ? 'opacity-50' : ''}`}
 draggable
 onDragStart={(e) => handleDragStart(e, record.id)}
 onDragEnd={handleDragEnd}
 onClick={() => {
 onSelectItem(record.id, !isSelected);
 }}
 >
 {/* Card Header */}
 <div className="flex items-center space-x-sm mb-sm">
 <div className={`h-icon-lg w-icon-lg rounded-full flex items-center justify-center ${
 isActive ? 'bg-green-100 text-green-600' :
 isUpcoming ? 'bg-blue-100 text-blue-600' :
 'bg-gray-100 text-gray-600'
 }`}>
 <MapPin className="h-icon-xs w-icon-xs" />
 </div>
 <div className="flex-1 min-w-0">
 <h4 className="font-medium text-sm truncate">
 {record.destination}
 </h4>
 <p className="text-xs text-muted-foreground truncate">
 {record.country}
 </p>
 </div>
 </div>

 {/* Travel Details */}
 <div className="space-y-xs mb-sm">
 <div className="flex justify-between text-xs">
 <span className="text-muted-foreground">Type:</span>
 <Badge variant="outline" className="text-xs">
 {TRAVEL_TYPE_LABELS[record.travel_type]}
 </Badge>
 </div>
 <div className="flex justify-between text-xs">
 <span className="text-muted-foreground">Duration:</span>
 <span>{record.duration_days} days</span>
 </div>
 {record.expenses && (
 <div className="flex justify-between text-xs">
 <span className="text-muted-foreground">Cost:</span>
 <span>{record.currency} {record.expenses.toLocaleString()}</span>
 </div>
 )}
 </div>

 {/* Dates */}
 <div className="mb-sm">
 <div className="flex items-center justify-between text-xs mb-xs">
 <span className="text-muted-foreground">Dates</span>
 {isActive && (
 <Badge variant="primary" className="text-xs">
 Active
 </Badge>
 )}
 {isUpcoming && (
 <Badge variant="secondary" className="text-xs">
 Upcoming
 </Badge>
 )}
 </div>
 <div className="text-xs space-y-xs">
 <div className="flex items-center space-x-xs">
 <Calendar className="h-3 w-3 text-muted-foreground" />
 <span>{startDate.toLocaleDateString()}</span>
 </div>
 <div className="flex items-center space-x-xs">
 <Calendar className="h-3 w-3 text-muted-foreground" />
 <span>{endDate.toLocaleDateString()}</span>
 </div>
 </div>
 </div>

 {/* Visa Status */}
 {record.visa_required && (
 <div className="mb-sm">
 <Badge 
 variant={
 record.visa_status === 'approved' ? 'default' :
 record.visa_status === 'pending' ? 'secondary' :
 record.visa_status === 'rejected' ? 'destructive' :
 'outline'
 }
 className="text-xs"
 >
 Visa: {record.visa_status || 'Not Applied'}
 </Badge>
 </div>
 )}

 {/* Purpose */}
 {record.purpose && (
 <div className="mb-sm">
 <p className="text-xs text-muted-foreground truncate">
 {record.purpose}
 </p>
 </div>
 )}

 {/* Actions */}
 <div className="flex items-center justify-between pt-xs border-t border-border">
 <Badge 
 variant={
 record.status === 'confirmed' ? 'default' :
 record.status === 'planned' ? 'secondary' :
 record.status === 'in_progress' ? 'default' :
 record.status === 'completed' ? 'outline' :
 'destructive'
 }
 className="text-xs"
 >
 {TRAVEL_STATUS_LABELS[record.status]}
 </Badge>
 <div className="flex items-center space-x-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onView(record);
 }}
 >
 <Eye className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(record);
 }}
 >
 <Edit className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDelete(record);
 }}
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 </div>
 </div>
 </Card>
 );
 })}

 {/* Add New Button */}
 {column.id === 'planned' && (
 <Card className="p-sm border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
 <Button
 variant="ghost"
 className="w-full h-auto p-md flex flex-col items-center space-y-xs text-muted-foreground hover:text-foreground"
 onClick={() => {
 // In a real implementation, this would open the create dialog
 }}
 >
 <Plus className="h-icon-md w-icon-md" />
 <span className="text-xs">Add New Trip</span>
 </Button>
 </Card>
 )}
 </div>
 </div>
 );
 })}
 </div>
 );
}
