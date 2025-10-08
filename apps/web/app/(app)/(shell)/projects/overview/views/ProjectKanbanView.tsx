"use client";

import { Calendar, DollarSign, User, Plus, MoreVertical } from "lucide-react";
import React from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import { format } from 'date-fns';
import type { Project } from '../types';

interface ProjectKanbanViewProps {
 projects: Project[];
 selectedProjects: Set<string>;
 onSelectProject: (id: string) => void;
 onView: (project: Project) => void;
 onEdit: (project: Project) => void;
 onDelete: (project: Project) => void;
 onStatusChange: (project: Project, newStatus: Project['status']) => void;
}

const columns = [
 { id: 'planning', title: 'Planning', color: 'blue' },
 { id: 'active', title: 'Active', color: 'green' },
 { id: 'on_hold', title: 'On Hold', color: 'yellow' },
 { id: 'completed', title: 'Completed', color: 'gray' },
 { id: 'cancelled', title: 'Cancelled', color: 'red' },
] as const;

const priorityColors = {
 low: 'green',
 medium: 'yellow',
 high: 'orange',
 critical: 'red'
} as const;

export default function ProjectKanbanView({
 projects,
 selectedProjects,
 onSelectProject,
 onView,
 onEdit,
 onDelete,
 onStatusChange
}: ProjectKanbanViewProps) {
 const projectsByStatus = React.useMemo(() => {
 return columns.reduce((acc, column) => {
 acc[column.id] = projects.filter(project => project.status === column.id);
 return acc;
 }, {} as Record<string, Project[]>);
 }, [projects]);

 const handleDragStart = (e: React.DragEvent, project: Project) => {
 e.dataTransfer.setData('text/plain', JSON.stringify({
 projectId: project.id,
 sourceStatus: project.status
 }));
 };

 const handleDragOver = (e: React.DragEvent) => {
 e.preventDefault();
 };

 const handleDrop = (e: React.DragEvent, targetStatus: Project['status']) => {
 e.preventDefault();
 const data = JSON.parse(e.dataTransfer.getData('text/plain'));
 const project = projects.find(p => p.id === data.projectId);
 
 if (project && project.status !== targetStatus) {
 onStatusChange(project, targetStatus);
 }
 };

 return (
 <div className="flex gap-md overflow-x-auto pb-md">
 {columns.map((column) => (
 <div
 key={column.id}
 className="flex-shrink-0 w-container-md"
 onDragOver={handleDragOver}
 onDrop={(e) => handleDrop(e, column.id as Project['status'])}
 >
 {/* Column Header */}
 <div className="mb-md">
 <div className="flex items-center justify-between p-sm bg-muted rounded-lg">
 <div className="flex items-center gap-sm">
 <div className={`w-3 h-3 rounded-full bg-${column.color}-500`} />
 <h3 className="font-semibold text-sm">{column.title}</h3>
 <Badge variant="secondary" className="text-xs">
 {projectsByStatus[column.id]?.length || 0}
 </Badge>
 </div>
 <Button variant="ghost" size="sm" className="h-icon-md w-icon-md p-0">
 <Plus className="h-3 w-3" />
 </Button>
 </div>
 </div>

 {/* Column Content */}
 <div className="space-y-sm min-h-content-sm">
 {projectsByStatus[column.id]?.map((project) => (
 <Card
 key={project.id}
 className={`p-sm cursor-move transition-all hover:shadow-md ${
 selectedProjects.has(project.id) ? 'ring-2 ring-primary' : ''
 }`}
 draggable
 onDragStart={(e) => handleDragStart(e, project)}
 onClick={() => onSelectProject(project.id)}
 >
 <div className="space-y-sm">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div className="flex-1 min-w-0">
 <h4 className="font-medium text-sm truncate" title={project.name}>
 {project.name}
 </h4>
 {project.description && (
 <p className="text-xs text-muted-foreground mt-1 line-clamp-xs">
 {project.description}
 </p>
 )}
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 // Show context menu
 }}
 className="h-icon-md w-icon-md p-0 opacity-0 group-hover:opacity-100"
 >
 <MoreVertical className="h-3 w-3" />
 </Button>
 </div>

 {/* Priority */}
 <div className="flex items-center gap-xs">
 <Badge 
 variant="outline" 
 className={`text-xs bg-${priorityColors[project.priority]}-50 text-${priorityColors[project.priority]}-700 border-${priorityColors[project.priority]}-200`}
 >
 {project.priority}
 </Badge>
 </div>

 {/* Project Details */}
 <div className="space-y-xs text-xs text-muted-foreground">
 {project.budget && (
 <div className="flex items-center gap-xs">
 <DollarSign className="h-3 w-3" />
 <span>
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: project.currency || 'USD',
 notation: 'compact'
 }).format(project.budget)}
 </span>
 </div>
 )}

 {project.starts_at && (
 <div className="flex items-center gap-xs">
 <Calendar className="h-3 w-3" />
 <span>
 {format(new Date(project.starts_at), 'MMM dd')}
 {project.ends_at && (
 <span> - {format(new Date(project.ends_at), 'MMM dd')}</span>
 )}
 </span>
 </div>
 )}

 {project.location && (
 <div className="flex items-center gap-xs">
 <User className="h-3 w-3" />
 <span className="truncate">{project.location}</span>
 </div>
 )}
 </div>

 {/* Tags */}
 {project.tags && project.tags.length > 0 && (
 <div className="flex flex-wrap gap-xs">
 {project.tags.slice(0, 2).map((tag) => (
 <Badge key={tag} variant="secondary" className="text-xs px-xs py-0">
 {tag}
 </Badge>
 ))}
 {project.tags.length > 2 && (
 <Badge variant="secondary" className="text-xs px-xs py-0">
 +{project.tags.length - 2}
 </Badge>
 )}
 </div>
 )}

 {/* Footer */}
 <div className="flex items-center justify-between text-xs text-muted-foreground pt-xs border-t">
 <span>{format(new Date(project.created_at), 'MMM dd')}</span>
 <input
 type="checkbox"
 checked={selectedProjects.has(project.id)}
 onChange={(e) => {
 e.stopPropagation();
 onSelectProject(project.id);
 }}
 className="rounded"
 />
 </div>
 </div>
 </Card>
 ))}

 {/* Empty State */}
 {(!projectsByStatus[column.id] || projectsByStatus[column.id].length === 0) && (
 <div className="text-center py-lg text-muted-foreground">
 <p className="text-sm">No projects</p>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 );
}
