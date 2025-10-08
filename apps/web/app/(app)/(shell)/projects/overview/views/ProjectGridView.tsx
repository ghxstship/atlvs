"use client";

import React from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import { format } from 'date-fns';
import type { Project } from '../types';
import { Calendar, DollarSign, Edit, Eye, Tag, Trash2, User } from 'lucide-react';

interface ProjectGridViewProps {
 projects: Project[];
 selectedProjects: Set<string>;
 onSelectProject: (id: string) => void;
 onView: (project: Project) => void;
 onEdit: (project: Project) => void;
 onDelete: (project: Project) => void;
}

const statusColors = {
 planning: 'blue',
 active: 'green',
 on_hold: 'yellow',
 completed: 'gray',
 cancelled: 'red'
} as const;

const priorityColors = {
 low: 'green',
 medium: 'yellow',
 high: 'orange',
 critical: 'red'
} as const;

export default function ProjectGridView({
 projects,
 selectedProjects,
 onSelectProject,
 onView,
 onEdit,
 onDelete
}: ProjectGridViewProps) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {projects.map((project) => (
 <Card
 key={project.id}
 className={`p-md cursor-pointer transition-all hover:shadow-md ${
 selectedProjects.has(project.id) ? 'ring-2 ring-primary' : ''
 }`}
 onClick={() => onSelectProject(project.id)}
 >
 <div className="space-y-sm">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div className="flex-1 min-w-0">
 <h3 className="font-semibold text-sm truncate" title={project.name}>
 {project.name}
 </h3>
 {project.description && (
 <p className="text-xs text-muted-foreground mt-1 line-clamp-xs">
 {project.description}
 </p>
 )}
 </div>
 <div className="flex items-center gap-xs ml-sm">
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onView(project);
 }}
 className="h-icon-md w-icon-md p-0"
 >
 <Eye className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(project);
 }}
 className="h-icon-md w-icon-md p-0"
 >
 <Edit className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDelete(project);
 }}
 className="h-icon-md w-icon-md p-0 text-destructive hover:text-destructive"
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 </div>
 </div>

 {/* Status and Priority */}
 <div className="flex items-center gap-xs">
 <Badge variant="outline" className={`text-xs bg-${statusColors[project.status]}-50 text-${statusColors[project.status]}-700 border-${statusColors[project.status]}-200`}>
 {project.status.replace('_', ' ')}
 </Badge>
 <Badge variant="outline" className={`text-xs bg-${priorityColors[project.priority]}-50 text-${priorityColors[project.priority]}-700 border-${priorityColors[project.priority]}-200`}>
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
 currency: project.currency || 'USD'
 }).format(project.budget)}
 </span>
 </div>
 )}

 {project.starts_at && (
 <div className="flex items-center gap-xs">
 <Calendar className="h-3 w-3" />
 <span>
 {format(new Date(project.starts_at), 'MMM dd, yyyy')}
 {project.ends_at && (
 <span> - {format(new Date(project.ends_at), 'MMM dd, yyyy')}</span>
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
 {project.tags.slice(0, 3).map((tag) => (
 <Badge key={tag} variant="secondary" className="text-xs px-xs py-0">
 {tag}
 </Badge>
 ))}
 {project.tags.length > 3 && (
 <Badge variant="secondary" className="text-xs px-xs py-0">
 +{project.tags.length - 3}
 </Badge>
 )}
 </div>
 )}

 {/* Footer */}
 <div className="flex items-center justify-between text-xs text-muted-foreground pt-xs border-t">
 <span>Created {format(new Date(project.created_at), 'MMM dd')}</span>
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
 </div>
 );
}
