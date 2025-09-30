"use client";

import { X, Edit, Trash2, Calendar, DollarSign, MapPin, Tag, Clock, User, FileText, Activity, TrendingUp, AlertCircle } from "lucide-react";
import React from "react";
import {
 Drawer,
 DrawerContent,
 DrawerHeader,
 DrawerTitle,
 DrawerFooter,
 Button,
 Badge,
 Card,
} from "@ghxstship/ui";
import { format } from "date-fns";
import type { Project } from "../types";

interface ViewProjectDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 project: Project;
 onEdit: () => void;
 onDelete: () => void;
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

export default function ViewProjectDrawer({
 open,
 onOpenChange,
 project,
 onEdit,
 onDelete,
}: ViewProjectDrawerProps) {
 const handleClose = () => {
 onOpenChange(false);
 };

 const handleEdit = () => {
 onEdit();
 handleClose();
 };

 const handleDelete = () => {
 onDelete();
 handleClose();
 };

 return (
 <Drawer open={open} onClose={() => onOpenChange(false)}>
 <DrawerContent className="max-w-2xl mx-auto">
 <DrawerHeader>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-md">
 <DrawerTitle className="text-xl">{project.name}</DrawerTitle>
 <div className="flex items-center gap-sm">
 <Badge 
 variant="outline" 
 className={`bg-${statusColors[project.status]}-50 text-${statusColors[project.status]}-700 border-${statusColors[project.status]}-200`}
 >
 {project.status.replace('_', ' ')}
 </Badge>
 <Badge 
 variant="outline" 
 className={`bg-${priorityColors[project.priority]}-50 text-${priorityColors[project.priority]}-700 border-${priorityColors[project.priority]}-200`}
 >
 {project.priority} priority
 </Badge>
 </div>
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={handleClose}
 className="h-8 w-8 p-0"
 >
 <X className="h-4 w-4" />
 </Button>
 </div>
 </DrawerHeader>

 <div className="px-lg space-y-lg">
 {/* Project Description */}
 {project.description && (
 <Card className="p-md">
 <div className="flex items-start gap-sm">
 <FileText className="h-4 w-4 text-muted-foreground mt-1" />
 <div>
 <h3 className="font-medium mb-sm">Description</h3>
 <p className="text-sm text-muted-foreground leading-relaxed">
 {project.description}
 </p>
 </div>
 </div>
 </Card>
 )}

 {/* Project Details Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 {/* Budget Information */}
 {project.budget && (
 <Card className="p-md">
 <div className="flex items-start gap-sm">
 <DollarSign className="h-4 w-4 text-muted-foreground mt-1" />
 <div>
 <h3 className="font-medium mb-sm">Budget</h3>
 <p className="text-lg font-semibold">
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: project.currency || 'USD',
 }).format(project.budget)}
 </p>
 <p className="text-xs text-muted-foreground">
 {project.currency || 'USD'}
 </p>
 </div>
 </div>
 </Card>
 )}

 {/* Timeline Information */}
 <Card className="p-md">
 <div className="flex items-start gap-sm">
 <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
 <div className="space-y-sm">
 <h3 className="font-medium">Timeline</h3>
 
 {project.starts_at && (
 <div className="flex items-center gap-sm text-sm">
 <span className="text-muted-foreground">Starts:</span>
 <span className="font-medium">
 {format(new Date(project.starts_at), 'MMM dd, yyyy')}
 </span>
 </div>
 )}
 
 {project.ends_at && (
 <div className="flex items-center gap-sm text-sm">
 <span className="text-muted-foreground">Ends:</span>
 <span className="font-medium">
 {format(new Date(project.ends_at), 'MMM dd, yyyy')}
 </span>
 </div>
 )}

 {!project.starts_at && !project.ends_at && (
 <p className="text-sm text-muted-foreground">
 No timeline specified
 </p>
 )}
 </div>
 </div>
 </Card>

 {/* Location Information */}
 {project.location && (
 <Card className="p-md">
 <div className="flex items-start gap-sm">
 <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
 <div>
 <h3 className="font-medium mb-sm">Location</h3>
 <p className="text-sm">{project.location}</p>
 </div>
 </div>
 </Card>
 )}

 {/* Creation Information */}
 <Card className="p-md">
 <div className="flex items-start gap-sm">
 <Clock className="h-4 w-4 text-muted-foreground mt-1" />
 <div className="space-y-sm">
 <h3 className="font-medium">Created</h3>
 <div className="text-sm space-y-xs">
 <p>
 <span className="text-muted-foreground">Date:</span>{' '}
 <span className="font-medium">
 {format(new Date(project.created_at), 'MMM dd, yyyy')}
 </span>
 </p>
 <p>
 <span className="text-muted-foreground">Time:</span>{' '}
 <span className="font-medium">
 {format(new Date(project.created_at), 'h:mm a')}
 </span>
 </p>
 </div>
 </div>
 </div>
 </Card>
 </div>

 {/* Tags */}
 {project.tags && project.tags.length > 0 && (
 <Card className="p-md">
 <div className="flex items-start gap-sm">
 <Tag className="h-4 w-4 text-muted-foreground mt-1" />
 <div>
 <h3 className="font-medium mb-sm">Tags</h3>
 <div className="flex flex-wrap gap-xs">
 {project.tags.map((tag) => (
 <Badge key={tag} variant="secondary">
 {tag}
 </Badge>
 ))}
 </div>
 </div>
 </div>
 </Card>
 )}

 {/* Additional Notes */}
 {project.notes && (
 <Card className="p-md">
 <div className="flex items-start gap-sm">
 <FileText className="h-4 w-4 text-muted-foreground mt-1" />
 <div>
 <h3 className="font-medium mb-sm">Notes</h3>
 <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
 {project.notes}
 </p>
 </div>
 </div>
 </Card>
 )}

 {/* Project Statistics */}
 <Card className="p-md">
 <div className="flex items-start gap-sm">
 <TrendingUp className="h-4 w-4 text-muted-foreground mt-1" />
 <div>
 <h3 className="font-medium mb-sm">Project Statistics</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-md text-center">
 <div className="space-y-xs">
 <p className="text-2xl font-bold text-primary">0</p>
 <p className="text-xs text-muted-foreground">Tasks</p>
 </div>
 <div className="space-y-xs">
 <p className="text-2xl font-bold text-green-600">0</p>
 <p className="text-xs text-muted-foreground">Completed</p>
 </div>
 <div className="space-y-xs">
 <p className="text-2xl font-bold text-blue-600">0</p>
 <p className="text-xs text-muted-foreground">Files</p>
 </div>
 <div className="space-y-xs">
 <p className="text-2xl font-bold text-purple-600">0</p>
 <p className="text-xs text-muted-foreground">Team Members</p>
 </div>
 </div>
 </div>
 </div>
 </Card>

 {/* Status Indicators */}
 <Card className="p-md">
 <div className="flex items-start gap-sm">
 <Activity className="h-4 w-4 text-muted-foreground mt-1" />
 <div>
 <h3 className="font-medium mb-sm">Status Overview</h3>
 <div className="space-y-sm">
 <div className="flex items-center justify-between">
 <span className="text-sm">Overall Progress</span>
 <span className="text-sm font-medium">
 {project.status === 'completed' ? '100%' : 
 project.status === 'active' ? '50%' : 
 project.status === 'planning' ? '10%' : '0%'}
 </span>
 </div>
 <div className="w-full bg-muted rounded-full h-2">
 <div 
 className={`h-2 rounded-full transition-all ${
 project.status === 'completed' ? 'bg-green-500 w-full' :
 project.status === 'active' ? 'bg-blue-500 w-1/2' :
 project.status === 'planning' ? 'bg-yellow-500 w-1/12' :
 'bg-gray-300 w-0'
 }`}
 />
 </div>
 </div>
 </div>
 </div>
 </Card>
 </div>

 <DrawerFooter>
 <div className="flex gap-sm">
 <Button
 variant="outline"
 onClick={handleEdit}
 className="flex-1"
 >
 <Edit className="mr-2 h-4 w-4" />
 Edit Project
 </Button>
 <Button
 variant="destructive"
 onClick={handleDelete}
 className="flex-1"
 >
 <Trash2 className="mr-2 h-4 w-4" />
 Delete Project
 </Button>
 </div>
 </DrawerFooter>
 </DrawerContent>
 </Drawer>
 );
}
