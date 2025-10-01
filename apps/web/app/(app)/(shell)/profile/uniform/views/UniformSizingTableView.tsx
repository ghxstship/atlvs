'use client';

import { ArrowUpDown, Edit, Eye, User, Shirt } from "lucide-react";
import { useState } from 'react';
import { 
 Card, 
 Badge, 
 Button, 
 Checkbox,
 Avatar,
 Table,
 TableHeader,
 TableBody,
 TableRow,
 TableHead,
 TableCell
} from '@ghxstship/ui';
import type { UniformSizing, UniformSizingSort } from '../types';
import { 
 getBMICategory, 
 getCompletenessColor, 
 formatMeasurement,
 calculateSizeCompleteness 
} from '../types';

interface UniformSizingTableViewProps {
 sizings: UniformSizing[];
 loading: boolean;
 selectedIds: string[];
 onSelectionChange: (ids: string[]) => void;
 onEdit: (sizing: UniformSizing) => void;
 onView: (sizing: UniformSizing) => void;
 sort?: UniformSizingSort;
 onSort?: (sort: UniformSizingSort) => void;
}

export default function UniformSizingTableView({
 sizings,
 loading,
 selectedIds,
 onSelectionChange,
 onEdit,
 onView,
 sort,
 onSort,
}: UniformSizingTableViewProps) {
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

 const handleSort = (field: string) => {
 if (!onSort) return;
 
 const direction = sort?.field === field && sort?.direction === 'asc' ? 'desc' : 'asc';
 onSort({ field, direction });
 };

 const getSortIcon = (field: string) => {
 if (sort?.field !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground" />;
 return <ArrowUpDown className={`h-3 w-3 ${sort.direction === 'asc' ? 'rotate-180' : ''}`} />;
 };

 const isAllSelected = sizings.length > 0 && selectedIds.length === sizings.length;
 const isIndeterminate = selectedIds.length > 0 && selectedIds.length < sizings.length;

 if (loading) {
 return (
 <Card>
 <div className="p-lg">
 <div className="animate-pulse space-y-md">
 <div className="h-icon-xl bg-muted rounded"></div>
 {[...Array(5)].map((_, i) => (
 <div key={i} className="h-icon-2xl bg-muted rounded"></div>
 ))}
 </div>
 </div>
 </Card>
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
 <Card>
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead className="w-icon-2xl">
 <Checkbox
 checked={isAllSelected}
 indeterminate={isIndeterminate}
 onCheckedChange={handleSelectAll}
 />
 </TableHead>
 
 <TableHead>
 <Button 
 variant="ghost" 
 size="sm" 
 onClick={() => handleSort('first_name')}
 className="h-auto p-0 font-semibold"
 >
 Name {getSortIcon('first_name')}
 </Button>
 </TableHead>
 
 <TableHead>
 <Button 
 variant="ghost" 
 size="sm" 
 onClick={() => handleSort('size_category')}
 className="h-auto p-0 font-semibold"
 >
 Category {getSortIcon('size_category')}
 </Button>
 </TableHead>
 
 <TableHead>
 <Button 
 variant="ghost" 
 size="sm" 
 onClick={() => handleSort('height')}
 className="h-auto p-0 font-semibold"
 >
 Height {getSortIcon('height')}
 </Button>
 </TableHead>
 
 <TableHead>
 <Button 
 variant="ghost" 
 size="sm" 
 onClick={() => handleSort('weight')}
 className="h-auto p-0 font-semibold"
 >
 Weight {getSortIcon('weight')}
 </Button>
 </TableHead>
 
 <TableHead>Clothing Sizes</TableHead>
 
 <TableHead>
 <Button 
 variant="ghost" 
 size="sm" 
 onClick={() => handleSort('updated_at')}
 className="h-auto p-0 font-semibold"
 >
 Completeness {getSortIcon('updated_at')}
 </Button>
 </TableHead>
 
 <TableHead>
 <Button 
 variant="ghost" 
 size="sm" 
 onClick={() => handleSort('updated_at')}
 className="h-auto p-0 font-semibold"
 >
 Updated {getSortIcon('updated_at')}
 </Button>
 </TableHead>
 
 <TableHead className="w-component-lg">Actions</TableHead>
 </TableRow>
 </TableHeader>
 
 <TableBody>
 {sizings.map((sizing) => {
 const isSelected = selectedIds.includes(sizing.user_id);
 const completeness = calculateSizeCompleteness(sizing);
 const bmiCategory = sizing.height && sizing.weight 
 ? getBMICategory(sizing.height, sizing.weight)
 : null;

 return (
 <TableRow 
 key={sizing.user_id}
 className={isSelected ? 'bg-muted/50' : ''}
 >
 <TableCell>
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => 
 handleSelectItem(sizing.user_id, checked as boolean)
 }
 />
 </TableCell>
 
 <TableCell>
 <div className="flex items-center space-x-sm">
 <Avatar className="h-icon-lg w-icon-lg">
 <User className="h-icon-xs w-icon-xs" />
 </Avatar>
 <div>
 <div className="font-medium">
 {sizing.first_name} {sizing.last_name}
 </div>
 {bmiCategory && (
 <div className="text-xs text-muted-foreground">
 BMI: {bmiCategory}
 </div>
 )}
 </div>
 </div>
 </TableCell>
 
 <TableCell>
 <Badge variant="outline" className="text-xs">
 {sizing.size_category || 'Uncategorized'}
 </Badge>
 </TableCell>
 
 <TableCell>
 <span className="text-sm">
 {sizing.height ? formatMeasurement(sizing.height, 'height') : '-'}
 </span>
 </TableCell>
 
 <TableCell>
 <span className="text-sm">
 {sizing.weight ? `${sizing.weight} lbs` : '-'}
 </span>
 </TableCell>
 
 <TableCell>
 <div className="space-y-xs">
 <div className="flex flex-wrap gap-xs">
 {sizing.shirt_size && (
 <Badge variant="secondary" className="text-xs">
 Shirt: {sizing.shirt_size}
 </Badge>
 )}
 {sizing.pants_size && (
 <Badge variant="secondary" className="text-xs">
 Pants: {sizing.pants_size}
 </Badge>
 )}
 </div>
 <div className="flex flex-wrap gap-xs">
 {sizing.shoe_size && (
 <Badge variant="secondary" className="text-xs">
 Shoe: {sizing.shoe_size}
 </Badge>
 )}
 {sizing.hat_size && (
 <Badge variant="secondary" className="text-xs">
 Hat: {sizing.hat_size}
 </Badge>
 )}
 </div>
 </div>
 </TableCell>
 
 <TableCell>
 <Badge 
 variant={getCompletenessColor(completeness) as unknown}
 className="text-xs"
 >
 {completeness}%
 </Badge>
 </TableCell>
 
 <TableCell>
 <span className="text-sm text-muted-foreground">
 {new Date(sizing.updated_at).toLocaleDateString()}
 </span>
 </TableCell>
 
 <TableCell>
 <div className="flex items-center space-x-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(sizing)}
 >
 <Eye className="h-3 w-3" />
 </Button>
 
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(sizing)}
 >
 <Edit className="h-3 w-3" />
 </Button>
 </div>
 </TableCell>
 </TableRow>
 );
 })}
 </TableBody>
 </Table>
 </Card>
 );
}
