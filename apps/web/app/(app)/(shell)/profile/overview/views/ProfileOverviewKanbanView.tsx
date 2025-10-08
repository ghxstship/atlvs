'use client';

import { User, Mail, Phone, MapPin, Briefcase, Calendar, Award, History, Edit, Eye, UserCheck, UserX, Plus } from "lucide-react";
import { useState } from 'react';
import { Card, Badge, Button, Avatar, Progress } from '@ghxstship/ui';
import type { ProfileOverview } from '../types';
import { getStatusColor, getCompletionColor, formatLastLogin } from '../types';

interface ProfileOverviewKanbanViewProps {
 profiles: ProfileOverview[];
 loading?: boolean;
 selectedIds: string[];
 onSelectionChange: (ids: string[]) => void;
 onEdit: (profile: ProfileOverview) => void;
 onView: (profile: ProfileOverview) => void;
 onStatusChange: (profileId: string, status: ProfileOverview['status']) => void;
}

const KANBAN_COLUMNS = [
 { 
 id: 'pending', 
 title: 'Pending', 
 status: 'pending' as const,
 color: 'bg-warning/10 border-warning/20',
 headerColor: 'color-warning'
 },
 { 
 id: 'active', 
 title: 'Active', 
 status: 'active' as const,
 color: 'bg-success/10 border-success/20',
 headerColor: 'color-success'
 },
 { 
 id: 'inactive', 
 title: 'Inactive', 
 status: 'inactive' as const,
 color: 'bg-secondary/10 border-secondary/20',
 headerColor: 'color-muted'
 },
 { 
 id: 'suspended', 
 title: 'Suspended', 
 status: 'suspended' as const,
 color: 'bg-destructive/10 border-destructive/20',
 headerColor: 'color-destructive'
 },
];

export default function ProfileOverviewKanbanView({
 profiles,
 loading = false,
 selectedIds,
 onSelectionChange,
 onEdit,
 onView,
 onStatusChange
}: ProfileOverviewKanbanViewProps) {
 const [draggedProfile, setDraggedProfile] = useState<ProfileOverview | null>(null);

 const handleCardSelect = (profileId: string, event: React.MouseEvent) => {
 event.stopPropagation();
 
 if (selectedIds.includes(profileId)) {
 onSelectionChange(selectedIds.filter(id => id !== profileId));
 } else {
 onSelectionChange([...selectedIds, profileId]);
 }
 };

 const handleDragStart = (profile: ProfileOverview) => {
 setDraggedProfile(profile);
 };

 const handleDragEnd = () => {
 setDraggedProfile(null);
 };

 const handleDragOver = (event: React.DragEvent) => {
 event.preventDefault();
 };

 const handleDrop = (event: React.DragEvent, newStatus: ProfileOverview['status']) => {
 event.preventDefault();
 
 if (draggedProfile && draggedProfile.status !== newStatus) {
 onStatusChange(draggedProfile.id, newStatus);
 }
 
 setDraggedProfile(null);
 };

 const getProfilesByStatus = (status: ProfileOverview['status']) => {
 return profiles.filter(profile => profile.status === status);
 };

 const renderProfileCard = (profile: ProfileOverview) => {
 const isSelected = selectedIds.includes(profile.id);
 const isDragging = draggedProfile?.id === profile.id;

 return (
 <Card
 key={profile.id}
 className={`
 p-md cursor-pointer transition-all duration-200 hover:shadow-md
 ${isSelected ? 'ring-2 ring-accent bg-accent/5' : ''}
 ${isDragging ? 'opacity-50 scale-95' : ''}
 `}
 draggable
 onDragStart={() => handleDragStart(profile)}
 onDragEnd={handleDragEnd}
 onClick={() => onView(profile)}
 >
 {/* Selection Checkbox */}
 <div className="flex items-center justify-between mb-md">
 <input
 type="checkbox"
 checked={isSelected}
 onChange={(e) => handleCardSelect(profile.id, e as unknown)}
 className="h-icon-xs w-icon-xs rounded border-border text-accent focus:ring-accent"
 onClick={(e) => e.stopPropagation()}
 />
 <Badge variant={getStatusColor(profile.status) as unknown} size="sm">
 {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
 </Badge>
 </div>

 {/* Profile Header */}
 <div className="flex items-center gap-md mb-md">
 <Avatar
 src={profile.avatar_url}
 alt={profile.full_name}
 fallback={profile.full_name.charAt(0)}
 size="sm"
 />
 <div className="flex-1 min-w-0">
 <h3 className="text-body-sm font-medium truncate">
 {profile.full_name}
 </h3>
 <p className="text-body-xs color-muted truncate">
 {profile.job_title || 'No title'}
 </p>
 </div>
 </div>

 {/* Profile Completion */}
 <div className="mb-md">
 <div className="flex items-center justify-between mb-xs">
 <span className="text-body-xs">Completion</span>
 <span className="text-body-xs font-medium">
 {profile.profile_completion_percentage}%
 </span>
 </div>
 <Progress 
 value={profile.profile_completion_percentage} 
 className="h-1"
 variant={getCompletionColor(profile.profile_completion_percentage) as unknown}
 />
 </div>

 {/* Contact Info */}
 <div className="stack-xs mb-md text-body-xs color-muted">
 <div className="flex items-center gap-xs">
 <Mail className="h-3 w-3" />
 <span className="truncate">{profile.email}</span>
 </div>
 
 {profile.department && (
 <div className="flex items-center gap-xs">
 <Briefcase className="h-3 w-3" />
 <span className="truncate">{profile.department}</span>
 </div>
 )}
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 gap-sm mb-md">
 <div className="text-center p-xs bg-secondary/50 rounded">
 <div className="flex items-center justify-center gap-xs mb-xs">
 <Award className="h-3 w-3 color-accent" />
 <span className="text-body-xs font-medium">
 {profile.certifications_count}
 </span>
 </div>
 <div className="text-body-xs color-muted">Certs</div>
 </div>
 
 <div className="text-center p-xs bg-secondary/50 rounded">
 <div className="flex items-center justify-center gap-xs mb-xs">
 <History className="h-3 w-3 color-success" />
 <span className="text-body-xs font-medium">
 {profile.job_history_count}
 </span>
 </div>
 <div className="text-body-xs color-muted">Jobs</div>
 </div>
 </div>

 {/* Last Login */}
 <div className="flex items-center gap-xs text-body-xs color-muted mb-md">
 <Calendar className="h-3 w-3" />
 <span className="truncate">{formatLastLogin(profile.last_login)}</span>
 </div>

 {/* Action Buttons */}
 <div className="flex items-center gap-xs">
 <Button
 variant="outline"
 size="sm"
 className="flex-1 text-body-xs"
 onClick={(e) => {
 e.stopPropagation();
 onView(profile);
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
 onEdit(profile);
 }}
 >
 <Edit className="h-3 w-3" />
 </Button>
 </div>
 </Card>
 );
 };

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
 {KANBAN_COLUMNS.map((column) => (
 <div key={column.id} className={`rounded-lg border p-lg ${column.color}`}>
 <div className="flex items-center justify-between mb-lg">
 <div className="h-icon-xs w-component-lg bg-secondary rounded animate-pulse"></div>
 <div className="h-icon-md w-icon-lg bg-secondary rounded animate-pulse"></div>
 </div>
 <div className="stack-md">
 {Array.from({ length: 3 }).map((_, i) => (
 <Card key={i} className="p-md animate-pulse">
 <div className="flex items-center gap-md mb-md">
 <div className="h-icon-lg w-icon-lg bg-secondary rounded-full"></div>
 <div className="flex-1">
 <div className="h-3 bg-secondary rounded mb-xs"></div>
 <div className="h-3 bg-secondary rounded w-2/3"></div>
 </div>
 </div>
 <div className="h-2 bg-secondary rounded mb-md"></div>
 <div className="grid grid-cols-2 gap-sm">
 <div className="h-icon-lg bg-secondary rounded"></div>
 <div className="h-icon-lg bg-secondary rounded"></div>
 </div>
 </Card>
 ))}
 </div>
 </div>
 ))}
 </div>
 );
 }

 return (
 <div className="stack-lg">
 {/* Selection Header */}
 {selectedIds.length > 0 && (
 <div className="flex items-center justify-between p-md bg-accent/10 rounded-lg border border-accent/20">
 <span className="text-body-sm color-accent">
 {selectedIds.length} profile{selectedIds.length !== 1 ? 's' : ''} selected
 </span>
 <div className="flex items-center gap-sm">
 <Button
 variant="outline"
 size="sm"
 onClick={() => onSelectionChange([])}
 >
 Clear Selection
 </Button>
 </div>
 </div>
 )}

 {/* Kanban Board */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
 {KANBAN_COLUMNS.map((column) => {
 const columnProfiles = getProfilesByStatus(column.status);
 
 return (
 <div
 key={column.id}
 className={`rounded-lg border p-lg min-h-container-lg ${column.color}`}
 onDragOver={handleDragOver}
 onDrop={(e) => handleDrop(e, column.status)}
 >
 {/* Column Header */}
 <div className="flex items-center justify-between mb-lg">
 <h3 className={`text-body font-medium ${column.headerColor}`}>
 {column.title}
 </h3>
 <Badge variant="secondary" size="sm">
 {columnProfiles.length}
 </Badge>
 </div>

 {/* Column Content */}
 <div className="stack-md">
 {columnProfiles.length > 0 ? (
 columnProfiles.map(renderProfileCard)
 ) : (
 <div className="text-center py-xl color-muted">
 <User className="h-icon-lg w-icon-lg mx-auto mb-md opacity-50" />
 <p className="text-body-sm">No {column.title.toLowerCase()} profiles</p>
 <p className="text-body-xs">Drag profiles here to change status</p>
 </div>
 )}
 </div>

 {/* Drop Zone Indicator */}
 {draggedProfile && draggedProfile.status !== column.status && (
 <div className="mt-md p-md border-2 border-dashed border-accent/50 rounded-lg text-center">
 <Plus className="h-icon-xs w-icon-xs mx-auto mb-xs color-accent" />
 <p className="text-body-xs color-accent">
 Drop to move to {column.title}
 </p>
 </div>
 )}
 </div>
 );
 })}
 </div>

 {/* Empty State */}
 {profiles.length === 0 && !loading && (
 <div className="text-center py-xl">
 <User className="h-icon-2xl w-icon-2xl mx-auto mb-md color-muted" />
 <h3 className="text-heading-4 mb-sm">No profiles found</h3>
 <p className="color-muted">Try adjusting your search or filter criteria.</p>
 </div>
 )}
 </div>
 );
}
