"use client";

import React from 'react';
import { Badge, Button, Checkbox } from '@ghxstship/ui';
import { format } from 'date-fns';
import type { Project, FieldConfig } from '../types';
import { ArrowDown, ArrowUp, ArrowUpDown, Calendar, Check, DollarSign, Edit, Eye, MapPin, Trash2 } from 'lucide-react';

interface ProjectListViewProps {
 projects: Project[];
 selectedProjects: Set<string>;
 fieldVisibility: FieldConfig[];
 sortField: string;
 sortDirection: 'asc' | 'desc';
 onSelectAll: () => void;
 onSelectProject: (id: string) => void;
 onSort: (field: string) => void;
 onView: (project: Project) => void;
 onEdit: (project: Project) => void;
 onDelete: (project: Project) => void;
}

const statusColors = {
 planning: 'blue',
 active: 'green',
 on_hold: 'yellow',
 completed: 'gray',
 cancelled: 'red',
} as const;

const priorityColors = {
 low: 'green',
 medium: 'yellow',
 high: 'orange',
 critical: 'red',
} as const;

export default function ProjectListView({
 projects,
 selectedProjects,
 fieldVisibility,
 sortField,
 sortDirection,
 onSelectAll,
 onSelectProject,
 onSort,
 onView,
 onEdit,
 onDelete,
}: ProjectListViewProps) {
 const visibleFields = fieldVisibility.filter(field => field.visible);

 const renderCellContent = (project: Project, field: FieldConfig) => {
 switch (field.key) {
 case 'name':
 return (
 <div className="min-w-0">
 <div className="font-medium text-sm truncate">{project.name}</div>
 {project.description && (
 <div className="text-xs text-muted-foreground truncate mt-1">
 {project.description}
 </div>
 )}
 </div>
 );

 case 'status':
 return (
 <Badge 
 variant="outline" 
 className={`bg-${statusColors[project.status]}-50 text-${statusColors[project.status]}-700 border-${statusColors[project.status]}-200`}
 >
 {project.status.replace('_', ' ')}
 </Badge>
 );

 case 'priority':
 return (
 <Badge 
 variant="outline" 
 className={`bg-${priorityColors[project.priority]}-50 text-${priorityColors[project.priority]}-700 border-${priorityColors[project.priority]}-200`}
 >
 {project.priority}
 </Badge>
 );

 case 'budget':
 return project.budget ? (
 <div className="flex items-center gap-xs text-sm">
 <DollarSign className="h-3 w-3" />
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: project.currency || 'USD',
 notation: 'compact',
 }).format(project.budget)}
 </div>
 ) : (
 <span className="text-muted-foreground">-</span>
 );

 case 'startsAt':
 return project.starts_at ? (
 <div className="flex items-center gap-xs text-sm">
 <Calendar className="h-3 w-3" />
 {format(new Date(project.starts_at), 'MMM dd, yyyy')}
 </div>
 ) : (
 <span className="text-muted-foreground">-</span>
 );

 case 'endsAt':
 return project.ends_at ? (
 <div className="flex items-center gap-xs text-sm">
 <Calendar className="h-3 w-3" />
 {format(new Date(project.ends_at), 'MMM dd, yyyy')}
 </div>
 ) : (
 <span className="text-muted-foreground">-</span>
 );

 case 'location':
 return project.location ? (
 <div className="flex items-center gap-xs text-sm">
 <MapPin className="h-3 w-3" />
 <span className="truncate">{project.location}</span>
 </div>
 ) : (
 <span className="text-muted-foreground">-</span>
 );

 case 'created_at':
 return (
 <div className="text-sm text-muted-foreground">
 {format(new Date(project.created_at), 'MMM dd, yyyy')}
 </div>
 );

 case 'tags':
 return project.tags && project.tags.length > 0 ? (
 <div className="flex flex-wrap gap-xs">
 {project.tags.slice(0, 2).map((tag) => (
 <Badge key={tag} variant="secondary" className="text-xs">
 {tag}
 </Badge>
 ))}
 {project.tags.length > 2 && (
 <Badge variant="secondary" className="text-xs">
 +{project.tags.length - 2}
 </Badge>
 )}
 </div>
 ) : (
 <span className="text-muted-foreground">-</span>
 );

 default:
 return <span className="text-muted-foreground">-</span>;
 }
 };

 return (
 <div className="border rounded-lg overflow-hidden">
 {/* Table Header */}
 <div className="bg-muted/50 border-b">
 <div className="flex items-center px-md py-sm">
 <div className="flex items-center gap-sm">
 <Checkbox
 checked={selectedProjects.size === projects.length && projects.length > 0}
 indeterminate={selectedProjects.size > 0 && selectedProjects.size < projects.length}
 onChange={onSelectAll}
 />
 <span className="text-sm font-medium">
 {selectedProjects.size > 0 ? `${selectedProjects.size} selected` : 'Select all'}
 </span>
 </div>
 </div>
 </div>

 {/* Column Headers */}
 <div className="bg-muted/30 border-b">
 <div className="grid gap-md px-md py-sm" style={{
 gridTemplateColumns: `40px ${visibleFields.map(() => '1fr').join(' ')} 120px`
 }}>
 <div></div> {/* Checkbox column */}
 
 {visibleFields.map((field) => (
 <div key={field.key} className="flex items-center gap-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => field.sortable && onSort(field.key)}
 className="h-auto p-0 font-medium text-sm hover:bg-transparent"
 disabled={!field.sortable}
 >
 {field.label}
 {field.sortable && sortField === field.key && (
 <ArrowUpDown className={`ml-xs h-3 w-3 ${
 sortDirection === 'asc' ? 'rotate-180' : ''
 }`} />
 )}
 </Button>
 </div>
 ))}
 
 <div className="text-sm font-medium">Actions</div>
 </div>
 </div>

 {/* Table Body */}
 <div className="divide-y">
 {projects.map((project) => (
 <div
 key={project.id}
 className={`grid gap-md px-md py-sm hover:bg-muted/30 transition-colors ${
 selectedProjects.has(project.id) ? 'bg-primary/5' : ''
 }`}
 style={{
 gridTemplateColumns: `40px ${visibleFields.map(() => '1fr').join(' ')} 120px`
 }}
 >
 {/* Checkbox */}
 <div className="flex items-center">
 <Checkbox
 checked={selectedProjects.has(project.id)}
 onChange={() => onSelectProject(project.id)}
 />
 </div>

 {/* Field Columns */}
 {visibleFields.map((field) => (
 <div key={field.key} className="flex items-center min-w-0">
 {renderCellContent(project, field)}
 </div>
 ))}

 {/* Actions */}
 <div className="flex items-center gap-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(project)}
 className="h-icon-lg w-icon-lg p-0"
 title="View project"
 >
 <Eye className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(project)}
 className="h-icon-lg w-icon-lg p-0"
 title="Edit project"
 >
 <Edit className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(project)}
 className="h-icon-lg w-icon-lg p-0 text-destructive hover:text-destructive"
 title="Delete project"
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 </div>
 </div>
 ))}
 </div>

 {/* Empty State */}
 {projects.length === 0 && (
 <div className="text-center py-xl">
 <div className="text-muted-foreground">
 <div className="text-lg font-medium mb-sm">No projects found</div>
 <div className="text-sm">Try adjusting your search or filter criteria</div>
 </div>
 </div>
 )}
 </div>
 );
}
