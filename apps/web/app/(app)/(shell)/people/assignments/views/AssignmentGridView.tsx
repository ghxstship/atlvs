'use client';

import { useMemo } from 'react';
import { DataGrid } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import type { Assignment } from '../types';

interface AssignmentGridViewProps {
 assignments: Assignment[];
 onSelect?: (assignment: Assignment) => void;
 selectedIds?: string[];
 onSelectionChange?: (ids: string[]) => void;
}

export default function AssignmentGridView({ 
 assignments, 
 onSelect, 
 selectedIds = [], 
 onSelectionChange 
}: AssignmentGridViewProps) {
 
 const getStatusBadge = (assignment: Assignment) => {
 const { required_count, filled_count } = assignment;
 
 if (filled_count >= required_count) {
 return <Badge variant="success">Filled</Badge>;
 } else if (filled_count > 0) {
 return <Badge variant="warning">Partial</Badge>;
 } else {
 return <Badge variant="secondary">Open</Badge>;
 }
 };

 const getProgressPercentage = (assignment: Assignment) => {
 const { required_count, filled_count } = assignment;
 return required_count > 0 ? Math.round((filled_count / required_count) * 100) : 0;
 };

 const customRenderers = useMemo(() => ({
 status: (assignment: Assignment) => getStatusBadge(assignment),
 progress: (assignment: Assignment) => (
 <div className="flex items-center gap-sm">
 <div className="flex-1 bg-secondary rounded-full h-2">
 <div 
 className="bg-primary h-2 rounded-full transition-all duration-300"
 style={{ width: `${getProgressPercentage(assignment)}%` }}
 />
 </div>
 <span className="text-body-sm color-muted min-w-[3rem]">
 {assignment.filled_count}/{assignment.required_count}
 </span>
 </div>
 ),
 project: (assignment: Assignment) => (
 <div>
 <div className="text-body color-foreground">{assignment.project?.name || 'N/A'}</div>
 <div className="text-body-sm color-muted">{assignment.project?.status || ''}</div>
 </div>
 ),
 hourly_rate: (assignment: Assignment) => (
 assignment.hourly_rate ? `$${assignment.hourly_rate}/hr` : 'N/A'
 )
 }), []);

 return (
 <DataGrid
 data={assignments}
 selectedIds={selectedIds}
 onSelectionChange={onSelectionChange}
 onRowClick={onSelect}
 customRenderers={customRenderers}
 className="assignment-grid-view"
 />
 );
}
