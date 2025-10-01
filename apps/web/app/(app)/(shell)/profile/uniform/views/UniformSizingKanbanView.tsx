'use client';

import { Edit, Eye, User, Shirt, Plus } from "lucide-react";
import { useState } from 'react';
import { 
 Card, 
 Badge, 
 Button, 
 Avatar
} from '@ghxstship/ui';
import type { UniformSizing } from '../types';
import { 
 getBMICategory, 
 getCompletenessColor, 
 formatMeasurement,
 calculateSizeCompleteness 
} from '../types';

interface UniformSizingKanbanViewProps {
 sizings: UniformSizing[];
 loading: boolean;
 selectedIds: string[];
 onSelectionChange: (ids: string[]) => void;
 onEdit: (sizing: UniformSizing) => void;
 onView: (sizing: UniformSizing) => void;
}

// Kanban columns based on completeness levels
const KANBAN_COLUMNS = [
 {
 id: 'incomplete',
 title: 'Incomplete',
 description: '0-50% complete',
 color: 'bg-red-50 border-red-200',
 headerColor: 'bg-red-100',
 minCompleteness: 0,
 maxCompleteness: 50,
 },
 {
 id: 'partial',
 title: 'Partial',
 description: '51-75% complete',
 color: 'bg-yellow-50 border-yellow-200',
 headerColor: 'bg-yellow-100',
 minCompleteness: 51,
 maxCompleteness: 75,
 },
 {
 id: 'nearly_complete',
 title: 'Nearly Complete',
 description: '76-90% complete',
 color: 'bg-blue-50 border-blue-200',
 headerColor: 'bg-blue-100',
 minCompleteness: 76,
 maxCompleteness: 90,
 },
 {
 id: 'complete',
 title: 'Complete',
 description: '91-100% complete',
 color: 'bg-green-50 border-green-200',
 headerColor: 'bg-green-100',
 minCompleteness: 91,
 maxCompleteness: 100,
 },
];

export default function UniformSizingKanbanView({
 sizings,
 loading,
 selectedIds,
 onSelectionChange,
 onEdit,
 onView,
}: UniformSizingKanbanViewProps) {
 const [draggedItem, setDraggedItem] = useState<string | null>(null);

 // Group sizings by completeness level
 const groupedSizings = KANBAN_COLUMNS.reduce((acc, column) => {
 acc[column.id] = sizings.filter(sizing => {
 const completeness = calculateSizeCompleteness(sizing);
 return completeness >= column.minCompleteness && completeness <= column.maxCompleteness;
 });
 return acc;
 }, {} as Record<string, UniformSizing[]>);

 const handleDragStart = (e: React.DragEvent, userId: string) => {
 setDraggedItem(userId);
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
 // In a real implementation, this would update the sizing record
 // to move it to the appropriate completeness level
 setDraggedItem(null);
 };

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
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

 if (sizings.length === 0) {
 return (
 <Card className="p-xl text-center">
 <Shirt className="h-icon-2xl w-icon-2xl text-muted-foreground mx-auto mb-md" />
 <h3 className="text-lg font-semibold mb-sm">No Uniform Sizing Records</h3>
 <p className="text-muted-foreground">
 Start by adding uniform sizing information for your team members.
 </p>
 </Card>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
 {KANBAN_COLUMNS.map((column) => {
 const columnSizings = groupedSizings[column.id] || [];
 
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
 {columnSizings.length}
 </Badge>
 </div>
 </div>

 {/* Column Content */}
 <div className="p-sm space-y-sm">
 {columnSizings.map((sizing) => {
 const isSelected = selectedIds.includes(sizing.user_id);
 const completeness = calculateSizeCompleteness(sizing);
 const bmiCategory = sizing.height && sizing.weight 
 ? getBMICategory(sizing.height, sizing.weight)
 : null;

 return (
 <Card
 key={sizing.user_id}
 className={`p-sm cursor-move transition-all hover:shadow-md ${
 isSelected ? 'ring-2 ring-primary' : ''
 } ${draggedItem === sizing.user_id ? 'opacity-50' : ''}`}
 draggable
 onDragStart={(e) => handleDragStart(e, sizing.user_id)}
 onDragEnd={handleDragEnd}
 onClick={() => {
 const newSelection = isSelected
 ? selectedIds.filter(id => id !== sizing.user_id)
 : [...selectedIds, sizing.user_id];
 onSelectionChange(newSelection);
 }}
 >
 {/* Card Header */}
 <div className="flex items-center space-x-sm mb-sm">
 <Avatar className="h-icon-lg w-icon-lg">
 <User className="h-icon-xs w-icon-xs" />
 </Avatar>
 <div className="flex-1 min-w-0">
 <h4 className="font-medium text-sm truncate">
 {sizing.first_name} {sizing.last_name}
 </h4>
 <p className="text-xs text-muted-foreground">
 {sizing.size_category || 'Uncategorized'}
 </p>
 </div>
 </div>

 {/* Completeness Progress */}
 <div className="mb-sm">
 <div className="flex items-center justify-between mb-xs">
 <span className="text-xs text-muted-foreground">Completeness</span>
 <Badge 
 variant={getCompletenessColor(completeness) as unknown}
 className="text-xs"
 >
 {completeness}%
 </Badge>
 </div>
 <div className="w-full bg-muted rounded-full h-1.5">
 <div 
 className={`h-1.5 rounded-full transition-all ${
 completeness >= 90 ? 'bg-green-500' :
 completeness >= 75 ? 'bg-blue-500' :
 completeness >= 50 ? 'bg-yellow-500' : 'bg-red-500'
 }`}
 style={{ width: `${completeness}%` }}
 />
 </div>
 </div>

 {/* Key Measurements */}
 <div className="space-y-xs mb-sm">
 <div className="flex justify-between text-xs">
 <span className="text-muted-foreground">Height:</span>
 <span>{sizing.height ? formatMeasurement(sizing.height, 'height') : 'Not set'}</span>
 </div>
 <div className="flex justify-between text-xs">
 <span className="text-muted-foreground">Weight:</span>
 <span>{sizing.weight ? `${sizing.weight} lbs` : 'Not set'}</span>
 </div>
 {bmiCategory && (
 <div className="flex justify-between text-xs">
 <span className="text-muted-foreground">BMI:</span>
 <Badge variant="outline" className="text-xs">
 {bmiCategory}
 </Badge>
 </div>
 )}
 </div>

 {/* Clothing Sizes */}
 <div className="mb-sm">
 <div className="flex flex-wrap gap-xs">
 {sizing.shirt_size && (
 <Badge variant="secondary" className="text-xs">
 S: {sizing.shirt_size}
 </Badge>
 )}
 {sizing.pants_size && (
 <Badge variant="secondary" className="text-xs">
 P: {sizing.pants_size}
 </Badge>
 )}
 {sizing.shoe_size && (
 <Badge variant="secondary" className="text-xs">
 Sh: {sizing.shoe_size}
 </Badge>
 )}
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center justify-between pt-xs border-t border-border">
 <span className="text-xs text-muted-foreground">
 Updated {new Date(sizing.updated_at).toLocaleDateString()}
 </span>
 <div className="flex items-center space-x-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onView(sizing);
 }}
 >
 <Eye className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(sizing);
 }}
 >
 <Edit className="h-3 w-3" />
 </Button>
 </div>
 </div>
 </Card>
 );
 })}

 {/* Add New Button */}
 {column.id === 'incomplete' && (
 <Card className="p-sm border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
 <Button
 variant="ghost"
 className="w-full h-auto p-md flex flex-col items-center space-y-xs text-muted-foreground hover:text-foreground"
 onClick={() => {
 // In a real implementation, this would open the create dialog
 }}
 >
 <Plus className="h-icon-md w-icon-md" />
 <span className="text-xs">Add New Record</span>
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
