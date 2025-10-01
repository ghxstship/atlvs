'use client';

import { User, Ruler, Shirt, Edit, Eye, MoreHorizontal, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState } from 'react';
import { Card, Badge, Button, Avatar, Progress } from '@ghxstship/ui';
import type { UniformSizing } from '../types';
import { getCompletenessColor, formatMeasurement, calculateBMI, getBMICategory } from '../types';

interface UniformSizingGridViewProps {
 sizings: UniformSizing[];
 loading?: boolean;
 selectedIds: string[];
 onSelectionChange: (ids: string[]) => void;
 onEdit: (sizing: UniformSizing) => void;
 onView: (sizing: UniformSizing) => void;
}

export default function UniformSizingGridView({
 sizings,
 loading = false,
 selectedIds,
 onSelectionChange,
 onEdit,
 onView,
}: UniformSizingGridViewProps) {
 const [hoveredCard, setHoveredCard] = useState<string | null>(null);

 const handleCardSelect = (sizingId: string, event: React.MouseEvent) => {
 event.stopPropagation();
 
 if (selectedIds.includes(sizingId)) {
 onSelectionChange(selectedIds.filter(id => id !== sizingId));
 } else {
 onSelectionChange([...selectedIds, sizingId]);
 }
 };

 const handleSelectAll = () => {
 if (selectedIds.length === sizings.length) {
 onSelectionChange([]);
 } else {
 onSelectionChange(sizings.map(s => s.id));
 }
 };

 const getBMITrend = (bmi?: number) => {
 if (!bmi) return { icon: Minus, color: 'color-muted' };
 if (bmi < 18.5) return { icon: TrendingDown, color: 'color-warning' };
 if (bmi > 25) return { icon: TrendingUp, color: 'color-destructive' };
 return { icon: Minus, color: 'color-success' };
 };

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
 {Array.from({ length: 8 }).map((_, i) => (
 <Card key={i} className="p-lg animate-pulse">
 <div className="flex items-center gap-md mb-md">
 <div className="h-icon-2xl w-icon-2xl bg-secondary rounded-full"></div>
 <div className="flex-1">
 <div className="h-icon-xs bg-secondary rounded mb-sm"></div>
 <div className="h-3 bg-secondary rounded w-2/3"></div>
 </div>
 </div>
 <div className="stack-sm">
 <div className="h-3 bg-secondary rounded"></div>
 <div className="h-3 bg-secondary rounded w-3/4"></div>
 <div className="h-3 bg-secondary rounded w-1/2"></div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (sizings.length === 0) {
 return (
 <div className="text-center py-xl">
 <Shirt className="h-icon-2xl w-icon-2xl mx-auto mb-md color-muted" />
 <h3 className="text-heading-4 mb-sm">No uniform sizing records found</h3>
 <p className="color-muted">Try adjusting your search or filter criteria.</p>
 </div>
 );
 }

 return (
 <div className="stack-lg">
 {/* Selection Header */}
 {selectedIds.length > 0 && (
 <div className="flex items-center justify-between p-md bg-accent/10 rounded-lg border border-accent/20">
 <span className="text-body-sm color-accent">
 {selectedIds.length} record{selectedIds.length !== 1 ? 's' : ''} selected
 </span>
 <div className="flex items-center gap-sm">
 <Button
 variant="outline"
 size="sm"
 onClick={() => onSelectionChange([])}
 >
 Clear Selection
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={handleSelectAll}
 >
 {selectedIds.length === sizings.length ? 'Deselect All' : 'Select All'}
 </Button>
 </div>
 </div>
 )}

 {/* Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
 {sizings.map((sizing) => {
 const bmi = calculateBMI(sizing.height_cm, sizing.weight_kg);
 const bmiTrend = getBMITrend(bmi);
 const BMIIcon = bmiTrend.icon;

 return (
 <Card
 key={sizing.id}
 className={`
 relative p-lg cursor-pointer transition-all duration-200 hover:shadow-lg
 ${selectedIds.includes(sizing.id) ? 'ring-2 ring-accent bg-accent/5' : ''}
 ${hoveredCard === sizing.id ? 'scale-[1.02]' : ''}
 `}
 onMouseEnter={() => setHoveredCard(sizing.id)}
 onMouseLeave={() => setHoveredCard(null)}
 onClick={() => onView(sizing)}
 >
 {/* Selection Checkbox */}
 <div className="absolute top-md right-md">
 <input
 type="checkbox"
 checked={selectedIds.includes(sizing.id)}
 onChange={(e) => handleCardSelect(sizing.id, e as unknown)}
 className="h-icon-xs w-icon-xs rounded border-border text-accent focus:ring-accent"
 onClick={(e) => e.stopPropagation()}
 />
 </div>

 {/* User Header */}
 <div className="flex items-center gap-md mb-md">
 <Avatar
 src={sizing.user_avatar}
 alt={sizing.user_name}
 fallback={sizing.user_name?.charAt(0) || 'U'}
 size="md"
 />
 <div className="flex-1 min-w-0">
 <h3 className="text-body font-medium truncate">
 {sizing.user_name || 'Unknown User'}
 </h3>
 <p className="text-body-sm color-muted truncate">
 {sizing.user_email}
 </p>
 </div>
 </div>

 {/* Completeness Progress */}
 <div className="mb-md">
 <div className="flex items-center justify-between mb-xs">
 <span className="text-body-sm">Profile Completeness</span>
 <span className="text-body-sm font-medium">
 {sizing.size_completeness_percentage || 0}%
 </span>
 </div>
 <Progress 
 value={sizing.size_completeness_percentage || 0} 
 className="h-2"
 variant={getCompletenessColor(sizing.size_completeness_percentage || 0) as unknown}
 />
 </div>

 {/* Clothing Sizes */}
 <div className="mb-md">
 <h4 className="text-body-sm font-medium mb-sm">Clothing Sizes</h4>
 <div className="grid grid-cols-2 gap-xs text-body-xs">
 <div className="flex justify-between">
 <span className="color-muted">Shirt:</span>
 <span>{sizing.shirt_size || 'N/A'}</span>
 </div>
 <div className="flex justify-between">
 <span className="color-muted">Pants:</span>
 <span>{sizing.pants_size || 'N/A'}</span>
 </div>
 <div className="flex justify-between">
 <span className="color-muted">Shoes:</span>
 <span>{sizing.shoe_size || 'N/A'}</span>
 </div>
 <div className="flex justify-between">
 <span className="color-muted">Hat:</span>
 <span>{sizing.hat_size || 'N/A'}</span>
 </div>
 </div>
 </div>

 {/* Measurements */}
 <div className="mb-md">
 <h4 className="text-body-sm font-medium mb-sm">Measurements</h4>
 <div className="grid grid-cols-2 gap-xs text-body-xs">
 <div className="flex justify-between">
 <span className="color-muted">Height:</span>
 <span>{formatMeasurement(sizing.height_cm, 'cm')}</span>
 </div>
 <div className="flex justify-between">
 <span className="color-muted">Weight:</span>
 <span>{formatMeasurement(sizing.weight_kg, 'kg')}</span>
 </div>
 <div className="flex justify-between">
 <span className="color-muted">Chest:</span>
 <span>{formatMeasurement(sizing.chest_cm, 'cm')}</span>
 </div>
 <div className="flex justify-between">
 <span className="color-muted">Waist:</span>
 <span>{formatMeasurement(sizing.waist_cm, 'cm')}</span>
 </div>
 </div>
 </div>

 {/* BMI Indicator */}
 {bmi && (
 <div className="mb-md">
 <div className="flex items-center justify-between p-sm bg-secondary/30 rounded">
 <div className="flex items-center gap-xs">
 <BMIIcon className={`h-3 w-3 ${bmiTrend.color}`} />
 <span className="text-body-xs font-medium">BMI</span>
 </div>
 <div className="text-right">
 <div className="text-body-xs font-medium">{bmi}</div>
 <div className="text-body-xs color-muted">{getBMICategory(bmi)}</div>
 </div>
 </div>
 </div>
 )}

 {/* Equipment Preferences */}
 {sizing.equipment_preferences && Object.keys(sizing.equipment_preferences).length > 0 && (
 <div className="mb-md">
 <h4 className="text-body-sm font-medium mb-sm">Equipment</h4>
 <div className="flex flex-wrap gap-xs">
 {Object.keys(sizing.equipment_preferences).slice(0, 3).map((equipment) => (
 <Badge key={equipment} variant="secondary" size="sm">
 {equipment}
 </Badge>
 ))}
 {Object.keys(sizing.equipment_preferences).length > 3 && (
 <Badge variant="outline" size="sm">
 +{Object.keys(sizing.equipment_preferences).length - 3} more
 </Badge>
 )}
 </div>
 </div>
 )}

 {/* Last Updated */}
 <div className="flex items-center gap-xs text-body-xs color-muted mb-md">
 <span>Updated: {new Date(sizing.updated_at).toLocaleDateString()}</span>
 </div>

 {/* Action Buttons */}
 <div className="flex items-center gap-sm">
 <Button
 variant="outline"
 size="sm"
 className="flex-1"
 onClick={(e) => {
 e.stopPropagation();
 onView(sizing);
 }}
 >
 <Eye className="h-3 w-3 mr-xs" />
 View
 </Button>
 
 <Button
 variant="outline"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(sizing);
 }}
 >
 <Edit className="h-3 w-3" />
 </Button>

 <Button
 variant="outline"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 // Additional actions menu could go here
 }}
 >
 <MoreHorizontal className="h-3 w-3" />
 </Button>
 </div>

 {/* Hover Overlay */}
 {hoveredCard === sizing.id && (
 <div className="absolute inset-0 bg-accent/5 rounded-lg pointer-events-none" />
 )}
 </Card>
 );
 })}
 </div>
 </div>
 );
}
