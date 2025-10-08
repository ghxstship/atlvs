'use client';

import { useState } from 'react';
import { AppDrawer, Badge } from '@ghxstship/ui';
import type { Assignment } from '../types';
import type { FieldConfig } from '@ghxstship/ui';

interface AssignmentDrawerProps {
 assignment: Assignment | null;
 open: boolean;
 onClose: () => void;
 mode?: 'view' | 'edit';
 onSave?: (data: unknown) => void;
}

export default function AssignmentDrawer({
 assignment,
 open,
 onClose,
 mode = 'view',
 onSave
}: AssignmentDrawerProps) {
 const [activeTab, setActiveTab] = useState('details');

 const fields: FieldConfig[] = [
 {
 key: 'role',
 label: 'Role',
 type: 'text',
 required: true
 },
 {
 key: 'project.name',
 label: 'Project',
 type: 'text',
 readonly: true
 },
 {
 key: 'department',
 label: 'Department',
 type: 'text'
 },
 {
 key: 'required_count',
 label: 'Required Count',
 type: 'number',
 required: true
 },
 {
 key: 'filled_count',
 label: 'Filled Count',
 type: 'number'
 },
 {
 key: 'hourly_rate',
 label: 'Hourly Rate',
 type: 'currency'
 },
 {
 key: 'skills_required',
 label: 'Skills Required',
 type: 'tags'
 },
 {
 key: 'notes',
 label: 'Notes',
 type: 'textarea'
 }
 ];

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

 const tabs = [
 {
 key: 'details',
 label: 'Details',
 content: (
 <div className="p-md stack-md">
 <div className="flex items-center justify-between mb-md">
 <h3 className="text-heading-4">{assignment?.role}</h3>
 {assignment && getStatusBadge(assignment)}
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <label className="block text-body-sm form-label mb-xs">Project</label>
 <div className="text-body color-foreground">{assignment?.project?.name || 'N/A'}</div>
 </div>
 <div>
 <label className="block text-body-sm form-label mb-xs">Department</label>
 <div className="text-body color-foreground">{assignment?.department || 'N/A'}</div>
 </div>
 <div>
 <label className="block text-body-sm form-label mb-xs">Required Count</label>
 <div className="text-body color-foreground">{assignment?.required_count || 0}</div>
 </div>
 <div>
 <label className="block text-body-sm form-label mb-xs">Filled Count</label>
 <div className="text-body color-foreground">{assignment?.filled_count || 0}</div>
 </div>
 <div>
 <label className="block text-body-sm form-label mb-xs">Hourly Rate</label>
 <div className="text-body color-foreground">
 {assignment?.hourly_rate ? `$${assignment.hourly_rate}/hr` : 'N/A'}
 </div>
 </div>
 <div>
 <label className="block text-body-sm form-label mb-xs">Progress</label>
 <div className="flex items-center gap-sm">
 <div className="flex-1 bg-secondary rounded-full h-2">
 <div 
 className="bg-primary h-2 rounded-full transition-all duration-300"
 style={{ 
 width: `${assignment?.required_count ? Math.round((assignment.filled_count / assignment.required_count) * 100) : 0}%` 
 }}
 />
 </div>
 <span className="text-body-sm color-muted">
 {assignment?.required_count ? Math.round((assignment.filled_count / assignment.required_count) * 100) : 0}%
 </span>
 </div>
 </div>
 </div>

 {assignment?.skills_required && assignment.skills_required.length > 0 && (
 <div>
 <label className="block text-body-sm form-label mb-xs">Skills Required</label>
 <div className="flex flex-wrap gap-xs">
 {assignment.skills_required.map((skill, index) => (
 <Badge key={index} variant="secondary">{skill}</Badge>
 ))}
 </div>
 </div>
 )}

 {assignment?.notes && (
 <div>
 <label className="block text-body-sm form-label mb-xs">Notes</label>
 <div className="text-body color-foreground p-sm bg-secondary rounded-md">
 {assignment.notes}
 </div>
 </div>
 )}
 </div>
 )
 },
 {
 key: 'candidates',
 label: 'Candidates',
 content: (
 <div className="p-md">
 <p className="color-muted">Candidate applications and assignments will be shown here.</p>
 </div>
 )
 },
 {
 key: 'requirements',
 label: 'Requirements',
 content: (
 <div className="p-md">
 <p className="color-muted">Detailed role requirements and qualifications will be shown here.</p>
 </div>
 )
 }
 ];

 return (
 <AppDrawer
 title={`Assignment: ${assignment?.role || 'Unknown'}`}
 open={open}
 onClose={onClose}
 record={assignment}
 fields={fields}
 mode={mode}
 tabs={tabs}
 onSave={onSave}
 />
 );
}
