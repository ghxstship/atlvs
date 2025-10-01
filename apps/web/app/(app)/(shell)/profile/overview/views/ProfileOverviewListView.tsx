'use client';

import { User, Mail, Phone, MapPin, Briefcase, Calendar, Award, History, Edit, Eye, UserCheck, UserX, ChevronRight } from "lucide-react";
import { useState } from 'react';
import { Card, Badge, Button, Avatar, Progress } from '@ghxstship/ui';
import type { ProfileOverview } from '../types';
import { getStatusColor, getCompletionColor, formatLastLogin, getProfileCompletionTasks } from '../types';

interface ProfileOverviewListViewProps {
 profiles: ProfileOverview[];
 loading?: boolean;
 selectedIds: string[];
 onSelectionChange: (ids: string[]) => void;
 onEdit: (profile: ProfileOverview) => void;
 onView: (profile: ProfileOverview) => void;
 onStatusChange: (profileId: string, status: ProfileOverview['status']) => void;
}

export default function ProfileOverviewListView({
 profiles,
 loading = false,
 selectedIds,
 onSelectionChange,
 onEdit,
 onView,
 onStatusChange,
}: ProfileOverviewListViewProps) {
 const [expandedProfiles, setExpandedProfiles] = useState<Set<string>(new Set());

 const handleProfileSelect = (profileId: string, event: React.MouseEvent) => {
 event.stopPropagation();
 
 if (selectedIds.includes(profileId)) {
 onSelectionChange(selectedIds.filter(id => id !== profileId));
 } else {
 onSelectionChange([...selectedIds, profileId]);
 }
 };

 const toggleExpanded = (profileId: string, event: React.MouseEvent) => {
 event.stopPropagation();
 const newExpanded = new Set(expandedProfiles);
 if (newExpanded.has(profileId)) {
 newExpanded.delete(profileId);
 } else {
 newExpanded.add(profileId);
 }
 setExpandedProfiles(newExpanded);
 };

 const handleSelectAll = () => {
 if (selectedIds.length === profiles.length) {
 onSelectionChange([]);
 } else {
 onSelectionChange(profiles.map(p => p.id));
 }
 };

 if (loading) {
 return (
 <div className="stack-md">
 {Array.from({ length: 6 }).map((_, i) => (
 <Card key={i} className="p-lg animate-pulse">
 <div className="flex items-center gap-lg">
 <div className="h-icon-xs w-icon-xs bg-secondary rounded"></div>
 <div className="h-icon-2xl w-icon-2xl bg-secondary rounded-full"></div>
 <div className="flex-1">
 <div className="h-icon-xs bg-secondary rounded mb-sm"></div>
 <div className="h-3 bg-secondary rounded w-2/3"></div>
 </div>
 <div className="h-icon-md w-component-md bg-secondary rounded"></div>
 <div className="h-icon-lg w-component-lg bg-secondary rounded"></div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (profiles.length === 0) {
 return (
 <div className="text-center py-xl">
 <User className="h-icon-2xl w-icon-2xl mx-auto mb-md color-muted" />
 <h3 className="text-heading-4 mb-sm">No profiles found</h3>
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
 <Button
 variant="outline"
 size="sm"
 onClick={handleSelectAll}
 >
 {selectedIds.length === profiles.length ? 'Deselect All' : 'Select All'}
 </Button>
 </div>
 </div>
 )}

 {/* List */}
 <div className="stack-sm">
 {profiles.map((profile) => {
 const isExpanded = expandedProfiles.has(profile.id);
 const isSelected = selectedIds.includes(profile.id);
 const completionTasks = getProfileCompletionTasks(profile);

 return (
 <Card
 key={profile.id}
 className={`
 transition-all duration-200 hover:shadow-md
 ${isSelected ? 'ring-2 ring-accent bg-accent/5' : ''}
 `}
 >
 {/* Main Row */}
 <div 
 className="flex items-center gap-lg p-lg cursor-pointer"
 onClick={() => onView(profile)}
 >
 {/* Selection Checkbox */}
 <input
 type="checkbox"
 checked={isSelected}
 onChange={(e) => handleProfileSelect(profile.id, e as unknown)}
 className="h-icon-xs w-icon-xs rounded border-border text-accent focus:ring-accent"
 onClick={(e) => e.stopPropagation()}
 />

 {/* Avatar and Basic Info */}
 <div className="flex items-center gap-md flex-1 min-w-0">
 <Avatar
 src={profile.avatar_url}
 alt={profile.full_name}
 fallback={profile.full_name.charAt(0)}
 size="md"
 />
 
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-md mb-xs">
 <h3 className="text-body font-medium truncate">
 {profile.full_name}
 </h3>
 <Badge variant={getStatusColor(profile.status) as unknown} size="sm">
 {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
 </Badge>
 </div>
 
 <div className="flex items-center gap-lg text-body-sm color-muted">
 <div className="flex items-center gap-xs">
 <Mail className="h-3 w-3" />
 <span className="truncate">{profile.email}</span>
 </div>
 
 {profile.job_title && (
 <div className="flex items-center gap-xs">
 <Briefcase className="h-3 w-3" />
 <span className="truncate">{profile.job_title}</span>
 </div>
 )}
 
 {profile.department && (
 <div className="flex items-center gap-xs">
 <span className="truncate">{profile.department}</span>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Profile Completion */}
 <div className="flex items-center gap-md min-w-0">
 <div className="text-center">
 <div className="text-body-sm font-medium mb-xs">
 {profile.profile_completion_percentage}%
 </div>
 <Progress 
 value={profile.profile_completion_percentage} 
 className="h-2 w-component-lg"
 variant={getCompletionColor(profile.profile_completion_percentage) as unknown}
 />
 </div>
 </div>

 {/* Stats */}
 <div className="flex items-center gap-lg">
 <div className="text-center">
 <div className="flex items-center gap-xs mb-xs">
 <Award className="h-3 w-3 color-accent" />
 <span className="text-body-sm font-medium">
 {profile.certifications_count}
 </span>
 </div>
 <div className="text-body-xs color-muted">Certifications</div>
 </div>
 
 <div className="text-center">
 <div className="flex items-center gap-xs mb-xs">
 <History className="h-3 w-3 color-success" />
 <span className="text-body-sm font-medium">
 {profile.job_history_count}
 </span>
 </div>
 <div className="text-body-xs color-muted">Job History</div>
 </div>
 </div>

 {/* Last Login */}
 <div className="text-body-sm color-muted min-w-0">
 <div className="flex items-center gap-xs">
 <Calendar className="h-3 w-3" />
 <span className="truncate">{formatLastLogin(profile.last_login)}</span>
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center gap-sm">
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

 <Button
 variant="outline"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 const newStatus = profile.status === 'active' ? 'inactive' : 'active';
 onStatusChange(profile.id, newStatus);
 }}
 >
 {profile.status === 'active' ? (
 <UserX className="h-3 w-3" />
 ) : (
 <UserCheck className="h-3 w-3" />
 )}
 </Button>

 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => toggleExpanded(profile.id, e)}
 >
 <ChevronRight 
 className={`h-icon-xs w-icon-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
 />
 </Button>
 </div>
 </div>

 {/* Expanded Details */}
 {isExpanded && (
 <div className="border-t px-lg pb-lg">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg pt-lg">
 {/* Contact Information */}
 <div>
 <h4 className="text-body-sm font-medium mb-md">Contact Information</h4>
 <div className="stack-sm text-body-sm color-muted">
 <div className="flex items-center gap-xs">
 <Mail className="h-3 w-3" />
 <span>{profile.email}</span>
 </div>
 
 {profile.phone_primary && (
 <div className="flex items-center gap-xs">
 <Phone className="h-3 w-3" />
 <span>{profile.phone_primary}</span>
 </div>
 )}
 
 {profile.location && (
 <div className="flex items-center gap-xs">
 <MapPin className="h-3 w-3" />
 <span>{profile.location}</span>
 </div>
 )}
 </div>
 </div>

 {/* Professional Information */}
 <div>
 <h4 className="text-body-sm font-medium mb-md">Professional Information</h4>
 <div className="stack-sm text-body-sm color-muted">
 {profile.job_title && (
 <div>
 <span className="font-medium">Title:</span> {profile.job_title}
 </div>
 )}
 
 {profile.department && (
 <div>
 <span className="font-medium">Department:</span> {profile.department}
 </div>
 )}
 
 {profile.employee_id && (
 <div>
 <span className="font-medium">Employee ID:</span> {profile.employee_id}
 </div>
 )}
 </div>
 </div>

 {/* Profile Completion Tasks */}
 <div>
 <h4 className="text-body-sm font-medium mb-md">Completion Tasks</h4>
 <div className="stack-xs">
 {completionTasks.slice(0, 4).map((task, index) => (
 <div key={index} className="flex items-center gap-xs text-body-sm">
 <div className={`
 h-2 w-2 rounded-full
 ${task.completed ? 'bg-success' : 'bg-destructive'}
 `} />
 <span className={task.completed ? 'color-muted line-through' : ''}>
 {task.task}
 </span>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Bio */}
 {profile.bio && (
 <div className="mt-lg pt-lg border-t">
 <h4 className="text-body-sm font-medium mb-md">Bio</h4>
 <p className="text-body-sm color-muted">{profile.bio}</p>
 </div>
 )}
 </div>
 )}
 </Card>
 );
 })}
 </div>
 </div>
 );
}
