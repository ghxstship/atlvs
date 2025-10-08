'use client';

import { ChevronDown, ChevronRight, Edit, Eye, Ruler, Calendar, User, Shirt } from "lucide-react";
import { useState } from 'react';
import { 
 Card, 
 Badge, 
 Button, 
 Checkbox,
 Avatar
} from '@ghxstship/ui';
import type { UniformSizing } from '../types';
import { 
 getBMICategory, 
 getCompletenessColor, 
 formatMeasurement,
 calculateSizeCompleteness 
} from '../types';

interface UniformSizingListViewProps {
 sizings: UniformSizing[];
 loading: boolean;
 selectedIds: string[];
 onSelectionChange: (ids: string[]) => void;
 onEdit: (sizing: UniformSizing) => void;
 onView: (sizing: UniformSizing) => void;
}

export default function UniformSizingListView({
 sizings,
 loading,
 selectedIds,
 onSelectionChange,
 onEdit,
 onView
}: UniformSizingListViewProps) {
 const [expandedIds, setExpandedIds] = useState<string[]>([]);

 const toggleExpanded = (id: string) => {
 setExpandedIds(prev => 
 prev.includes(id) 
 ? prev.filter(expandedId => expandedId !== id)
 : [...prev, id]
 );
 };

 const handleSelectAll = (checked: boolean) => {
 onSelectionChange(checked ? sizings.map(s => s.user_id) : []);
 };

 const handleSelectItem = (userId: string, checked: boolean) => {
 onSelectionChange(
 checked 
 ? [...selectedIds, userId]
 : selectedIds.filter(id => id !== userId)
 );
 };

 const isAllSelected = sizings.length > 0 && selectedIds.length === sizings.length;
 const isIndeterminate = selectedIds.length > 0 && selectedIds.length < sizings.length;

 if (loading) {
 return (
 <div className="space-y-md">
 {[...Array(5)].map((_, i) => (
 <Card key={i} className="p-lg">
 <div className="animate-pulse">
 <div className="flex items-center space-x-md">
 <div className="w-icon-xs h-icon-xs bg-muted rounded"></div>
 <div className="w-icon-xl h-icon-xl bg-muted rounded-full"></div>
 <div className="flex-1 space-y-xs">
 <div className="h-icon-xs bg-muted rounded w-1/4"></div>
 <div className="h-3 bg-muted rounded w-1/6"></div>
 </div>
 <div className="w-component-lg h-icon-lg bg-muted rounded"></div>
 </div>
 </div>
 </Card>
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
 <div className="space-y-xs">
 {/* Header with select all */}
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-md">
 <Checkbox
 checked={isAllSelected}
 indeterminate={isIndeterminate}
 onCheckedChange={handleSelectAll}
 />
 <span className="text-sm font-medium">
 {selectedIds.length > 0 
 ? `${selectedIds.length} of ${sizings.length} selected`
 : `${sizings.length} uniform sizing records`
 }
 </span>
 </div>
 </div>
 </Card>

 {/* List items */}
 <div className="space-y-xs">
 {sizings.map((sizing) => {
 const isExpanded = expandedIds.includes(sizing.user_id);
 const isSelected = selectedIds.includes(sizing.user_id);
 const completeness = calculateSizeCompleteness(sizing);
 const bmiCategory = sizing.height && sizing.weight 
 ? getBMICategory(sizing.height, sizing.weight)
 : null;

 return (
 <Card 
 key={sizing.user_id} 
 className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
 >
 <div className="p-lg">
 {/* Main row */}
 <div className="flex items-center space-x-md">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => 
 handleSelectItem(sizing.user_id, checked as boolean)
 }
 />
 
 <Avatar className="h-icon-xl w-icon-xl">
 <User className="h-icon-sm w-icon-sm" />
 </Avatar>

 <div className="flex-1 min-w-0">
 <div className="flex items-center space-x-sm mb-xs">
 <h3 className="font-semibold truncate">
 {sizing.first_name} {sizing.last_name}
 </h3>
 <Badge variant="outline" className="text-xs">
 {sizing.size_category || 'Uncategorized'}
 </Badge>
 </div>
 
 <div className="flex items-center space-x-lg text-sm text-muted-foreground">
 <div className="flex items-center space-x-xs">
 <Ruler className="h-3 w-3" />
 <span>
 {sizing.height ? formatMeasurement(sizing.height, 'height') : 'No height'}
 </span>
 </div>
 
 <div className="flex items-center space-x-xs">
 <Calendar className="h-3 w-3" />
 <span>
 Updated {new Date(sizing.updated_at).toLocaleDateString()}
 </span>
 </div>
 
 <Badge 
 variant={getCompletenessColor(completeness) as unknown}
 className="text-xs"
 >
 {completeness}% Complete
 </Badge>
 
 {bmiCategory && (
 <Badge variant="outline" className="text-xs">
 BMI: {bmiCategory}
 </Badge>
 )}
 </div>
 </div>

 <div className="flex items-center space-x-sm">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => toggleExpanded(sizing.user_id)}
 >
 {isExpanded ? (
 <ChevronDown className="h-icon-xs w-icon-xs" />
 ) : (
 <ChevronRight className="h-icon-xs w-icon-xs" />
 )}
 </Button>
 
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(sizing)}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(sizing)}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>

 {/* Expanded content */}
 {isExpanded && (
 <div className="mt-lg pt-lg border-t border-border">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
 {/* Body Measurements */}
 <div>
 <h4 className="font-medium mb-sm">Body Measurements</h4>
 <div className="space-y-xs text-sm">
 <div className="flex justify-between">
 <span className="text-muted-foreground">Height:</span>
 <span>{sizing.height ? formatMeasurement(sizing.height, 'height') : 'Not set'}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Weight:</span>
 <span>{sizing.weight ? `${sizing.weight} lbs` : 'Not set'}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Chest:</span>
 <span>{sizing.chest ? formatMeasurement(sizing.chest, 'chest') : 'Not set'}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Waist:</span>
 <span>{sizing.waist ? formatMeasurement(sizing.waist, 'waist') : 'Not set'}</span>
 </div>
 </div>
 </div>

 {/* Clothing Sizes */}
 <div>
 <h4 className="font-medium mb-sm">Clothing Sizes</h4>
 <div className="space-y-xs text-sm">
 <div className="flex justify-between">
 <span className="text-muted-foreground">Shirt:</span>
 <span>{sizing.shirt_size || 'Not set'}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Pants:</span>
 <span>{sizing.pants_size || 'Not set'}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Shoe:</span>
 <span>{sizing.shoe_size || 'Not set'}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Hat:</span>
 <span>{sizing.hat_size || 'Not set'}</span>
 </div>
 </div>
 </div>

 {/* Equipment Preferences */}
 <div>
 <h4 className="font-medium mb-sm">Equipment Preferences</h4>
 <div className="space-y-xs text-sm">
 {sizing.equipment_preferences && Object.keys(sizing.equipment_preferences).length > 0 ? (
 Object.entries(sizing.equipment_preferences).map(([key, value]) => (
 <div key={key} className="flex justify-between">
 <span className="text-muted-foreground capitalize">
 {key.replace('_', ' ')}:
 </span>
 <span>{value as string}</span>
 </div>
 ))
 ) : (
 <span className="text-muted-foreground text-xs">No preferences set</span>
 )}
 </div>
 </div>
 </div>

 {/* Notes */}
 {sizing.notes && (
 <div className="mt-lg">
 <h4 className="font-medium mb-sm">Notes</h4>
 <p className="text-sm text-muted-foreground bg-muted p-sm rounded">
 {sizing.notes}
 </p>
 </div>
 )}
 </div>
 )}
 </div>
 </Card>
 );
 })}
 </div>
 </div>
 );
}
