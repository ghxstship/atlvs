'use client';

import { Edit, Eye, User, Briefcase, Plus, Trash2 } from "lucide-react";
import { useState } from 'react';
import { 
 Card, 
 Badge, 
 Button, 
 Avatar
} from '@ghxstship/ui';
import type { ProfessionalProfile } from '../types';

interface ProfessionalKanbanViewProps {
 profiles: ProfessionalProfile[];
 selectedIds: string[];
 onSelectItem: (id: string, selected: boolean) => void;
 onView: (profile: ProfessionalProfile) => void;
 onEdit: (profile: ProfessionalProfile) => void;
 onDelete: (profile: ProfessionalProfile) => void;
 loading: boolean;
}

// Kanban columns based on profile status and completion
const KANBAN_COLUMNS = [
 {
 id: 'draft',
 title: 'Draft',
 description: 'Incomplete profiles',
 color: 'bg-gray-50 border-gray-200',
 headerColor: 'bg-gray-100',
 statusFilter: (profile: ProfessionalProfile) => 
 profile.status === 'draft' || (profile.profile_completion_percentage || 0) < 50
 },
 {
 id: 'in_progress',
 title: 'In Progress',
 description: 'Profiles being completed',
 color: 'bg-yellow-50 border-yellow-200',
 headerColor: 'bg-yellow-100',
 statusFilter: (profile: ProfessionalProfile) => 
 profile.status === 'active' && (profile.profile_completion_percentage || 0) >= 50 && (profile.profile_completion_percentage || 0) < 90
 },
 {
 id: 'review',
 title: 'Review',
 description: 'Nearly complete profiles',
 color: 'bg-blue-50 border-blue-200',
 headerColor: 'bg-blue-100',
 statusFilter: (profile: ProfessionalProfile) => 
 profile.status === 'active' && (profile.profile_completion_percentage || 0) >= 90
 },
 {
 id: 'inactive',
 title: 'Inactive',
 description: 'Inactive or archived profiles',
 color: 'bg-red-50 border-red-200',
 headerColor: 'bg-red-100',
 statusFilter: (profile: ProfessionalProfile) => 
 profile.status === 'inactive' || profile.status === 'archived'
 },
];

export default function ProfessionalKanbanView({
 profiles,
 selectedIds,
 onSelectItem,
 onView,
 onEdit,
 onDelete,
 loading
}: ProfessionalKanbanViewProps) {
 const [draggedItem, setDraggedItem] = useState<string | null>(null);

 // Group profiles by status
 const groupedProfiles = KANBAN_COLUMNS.reduce((acc, column) => {
 acc[column.id] = profiles.filter(column.statusFilter);
 return acc;
 }, {} as Record<string, ProfessionalProfile[]>);

 const handleDragStart = (e: React.DragEvent, profileId: string) => {
 setDraggedItem(profileId);
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
 // In a real implementation, this would update the profile status
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

 if (profiles.length === 0) {
 return (
 <Card className="p-xl text-center">
 <Briefcase className="h-icon-2xl w-icon-2xl text-muted-foreground mx-auto mb-md" />
 <h3 className="text-lg font-semibold mb-sm">No Professional Profiles</h3>
 <p className="text-muted-foreground">
 Start by adding professional profiles for your team members.
 </p>
 </Card>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
 {KANBAN_COLUMNS.map((column) => {
 const columnProfiles = groupedProfiles[column.id] || [];
 
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
 {columnProfiles.length}
 </Badge>
 </div>
 </div>

 {/* Column Content */}
 <div className="p-sm space-y-sm">
 {columnProfiles.map((profile) => {
 const isSelected = selectedIds.includes(profile.id);
 const completionPercentage = profile.profile_completion_percentage || 0;

 return (
 <Card
 key={profile.id}
 className={`p-sm cursor-move transition-all hover:shadow-md ${
 isSelected ? 'ring-2 ring-primary' : ''
 } ${draggedItem === profile.id ? 'opacity-50' : ''}`}
 draggable
 onDragStart={(e) => handleDragStart(e, profile.id)}
 onDragEnd={handleDragEnd}
 onClick={() => {
 const newSelection = isSelected
 ? selectedIds.filter(id => id !== profile.id)
 : [...selectedIds, profile.id];
 onSelectItem(profile.id, !isSelected);
 }}
 >
 {/* Card Header */}
 <div className="flex items-center space-x-sm mb-sm">
 <Avatar className="h-icon-lg w-icon-lg">
 <User className="h-icon-xs w-icon-xs" />
 </Avatar>
 <div className="flex-1 min-w-0">
 <h4 className="font-medium text-sm truncate">
 {profile.user?.first_name} {profile.user?.last_name}
 </h4>
 <p className="text-xs text-muted-foreground truncate">
 {profile.job_title || 'No title'}
 </p>
 </div>
 </div>

 {/* Profile Details */}
 <div className="space-y-xs mb-sm">
 <div className="flex justify-between text-xs">
 <span className="text-muted-foreground">Department:</span>
 <span className="truncate ml-xs">{profile.department || 'N/A'}</span>
 </div>
 <div className="flex justify-between text-xs">
 <span className="text-muted-foreground">Employee ID:</span>
 <span>{profile.employee_id || 'N/A'}</span>
 </div>
 <div className="flex justify-between text-xs">
 <span className="text-muted-foreground">Type:</span>
 <Badge variant="outline" className="text-xs">
 {profile.employment_type || 'N/A'}
 </Badge>
 </div>
 </div>

 {/* Completion Progress */}
 <div className="mb-sm">
 <div className="flex items-center justify-between mb-xs">
 <span className="text-xs text-muted-foreground">Completion</span>
 <Badge 
 variant={
 completionPercentage >= 90 ? 'default' :
 completionPercentage >= 70 ? 'secondary' :
 'outline'
 }
 className="text-xs"
 >
 {completionPercentage}%
 </Badge>
 </div>
 <div className="w-full bg-muted rounded-full h-1.5">
 <div 
 className={`h-1.5 rounded-full transition-all ${
 completionPercentage >= 90 ? 'bg-green-500' :
 completionPercentage >= 70 ? 'bg-blue-500' :
 completionPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
 }`}
 style={{ width: `${completionPercentage}%` }}
 />
 </div>
 </div>

 {/* Skills */}
 {profile.skills && profile.skills.length > 0 && (
 <div className="mb-sm">
 <div className="flex flex-wrap gap-xs">
 {profile.skills.slice(0, 3).map((skill, idx) => (
 <Badge key={idx} variant="secondary" className="text-xs">
 {skill}
 </Badge>
 ))}
 {profile.skills.length > 3 && (
 <Badge variant="outline" className="text-xs">
 +{profile.skills.length - 3}
 </Badge>
 )}
 </div>
 </div>
 )}

 {/* Status Badge */}
 <div className="mb-sm">
 <Badge 
 variant={
 profile.status === 'active' ? 'default' :
 profile.status === 'inactive' ? 'destructive' :
 'secondary'
 }
 className="text-xs"
 >
 {profile.status}
 </Badge>
 </div>

 {/* Actions */}
 <div className="flex items-center justify-between pt-xs border-t border-border">
 <span className="text-xs text-muted-foreground">
 Updated {new Date(profile.updated_at).toLocaleDateString()}
 </span>
 <div className="flex items-center space-x-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onView(profile);
 }}
 >
 <Eye className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(profile);
 }}
 >
 <Edit className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDelete(profile);
 }}
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 </div>
 </div>
 </Card>
 );
 })}

 {/* Add New Button */}
 {column.id === 'draft' && (
 <Card className="p-sm border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
 <Button
 variant="ghost"
 className="w-full h-auto p-md flex flex-col items-center space-y-xs text-muted-foreground hover:text-foreground"
 onClick={() => {
 // In a real implementation, this would open the create dialog
 }}
 >
 <Plus className="h-icon-md w-icon-md" />
 <span className="text-xs">Add New Profile</span>
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
