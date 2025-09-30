'use client';

import { User, Mail, Phone, MapPin, Briefcase, Calendar, Award, History, MoreHorizontal, Edit, Eye, UserCheck, UserX } from "lucide-react";
import { useState } from 'react';
import { Card, Badge, Button, Avatar, Progress } from '@ghxstship/ui';
import type { ProfileOverview } from '../types';
import { getStatusColor, getCompletionColor, formatLastLogin } from '../types';

interface ProfileOverviewGridViewProps {
 profiles: ProfileOverview[];
 loading?: boolean;
 selectedIds: string[];
 onSelectionChange: (ids: string[]) => void;
 onEdit: (profile: ProfileOverview) => void;
 onView: (profile: ProfileOverview) => void;
 onStatusChange: (profileId: string, status: ProfileOverview['status']) => void;
}

export default function ProfileOverviewGridView({
 profiles,
 loading = false,
 selectedIds,
 onSelectionChange,
 onEdit,
 onView,
 onStatusChange,
}: ProfileOverviewGridViewProps) {
 const [hoveredCard, setHoveredCard] = useState<string | null>(null);

 const handleCardSelect = (profileId: string, event: React.MouseEvent) => {
 event.stopPropagation();
 
 if (selectedIds.includes(profileId)) {
 onSelectionChange(selectedIds.filter(id => id !== profileId));
 } else {
 onSelectionChange([...selectedIds, profileId]);
 }
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
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
 {Array.from({ length: 8 }).map((_, i) => (
 <Card key={i} className="p-lg animate-pulse">
 <div className="flex items-center gap-md mb-md">
 <div className="h-12 w-12 bg-secondary rounded-full"></div>
 <div className="flex-1">
 <div className="h-4 bg-secondary rounded mb-sm"></div>
 <div className="h-3 bg-secondary rounded w-2/3"></div>
 </div>
 </div>
 <div className="stack-sm">
 <div className="h-3 bg-secondary rounded"></div>
 <div className="h-3 bg-secondary rounded w-3/4"></div>
 <div className="h-3 bg-secondary rounded w-1/2"></div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (profiles.length === 0) {
 return (
 <div className="text-center py-xl">
 <User className="h-12 w-12 mx-auto mb-md color-muted" />
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

 {/* Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
 {profiles.map((profile) => (
 <Card
 key={profile.id}
 className={`
 relative p-lg cursor-pointer transition-all duration-200 hover:shadow-lg
 ${selectedIds.includes(profile.id) ? 'ring-2 ring-accent bg-accent/5' : ''}
 ${hoveredCard === profile.id ? 'scale-[1.02]' : ''}
 `}
 onMouseEnter={() => setHoveredCard(profile.id)}
 onMouseLeave={() => setHoveredCard(null)}
 onClick={() => onView(profile)}
 >
 {/* Selection Checkbox */}
 <div className="absolute top-md right-md">
 <input
 type="checkbox"
 checked={selectedIds.includes(profile.id)}
 onChange={(e) => handleCardSelect(profile.id, e as unknown)}
 className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
 onClick={(e) => e.stopPropagation()}
 />
 </div>

 {/* Profile Header */}
 <div className="flex items-center gap-md mb-md">
 <Avatar
 src={profile.avatar_url}
 alt={profile.full_name}
 fallback={profile.full_name.charAt(0)}
 size="md"
 />
 <div className="flex-1 min-w-0">
 <h3 className="text-body font-medium truncate">
 {profile.full_name}
 </h3>
 <p className="text-body-sm color-muted truncate">
 {profile.job_title || 'No title'}
 </p>
 </div>
 </div>

 {/* Status Badge */}
 <div className="mb-md">
 <Badge variant={getStatusColor(profile.status) as unknown}>
 {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
 </Badge>
 </div>

 {/* Profile Completion */}
 <div className="mb-md">
 <div className="flex items-center justify-between mb-xs">
 <span className="text-body-sm">Profile Completion</span>
 <span className="text-body-sm font-medium">
 {profile.profile_completion_percentage}%
 </span>
 </div>
 <Progress 
 value={profile.profile_completion_percentage} 
 className="h-2"
 variant={getCompletionColor(profile.profile_completion_percentage) as unknown}
 />
 </div>

 {/* Contact Info */}
 <div className="stack-xs mb-md text-body-sm color-muted">
 <div className="flex items-center gap-xs">
 <Mail className="h-3 w-3" />
 <span className="truncate">{profile.email}</span>
 </div>
 
 {profile.phone_primary && (
 <div className="flex items-center gap-xs">
 <Phone className="h-3 w-3" />
 <span className="truncate">{profile.phone_primary}</span>
 </div>
 )}
 
 {profile.department && (
 <div className="flex items-center gap-xs">
 <Briefcase className="h-3 w-3" />
 <span className="truncate">{profile.department}</span>
 </div>
 )}
 
 {profile.location && (
 <div className="flex items-center gap-xs">
 <MapPin className="h-3 w-3" />
 <span className="truncate">{profile.location}</span>
 </div>
 )}
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 gap-md mb-md">
 <div className="text-center p-sm bg-secondary/50 rounded">
 <div className="flex items-center justify-center gap-xs mb-xs">
 <Award className="h-3 w-3 color-accent" />
 <span className="text-body-sm font-medium">
 {profile.certifications_count}
 </span>
 </div>
 <div className="text-body-xs color-muted">Certs</div>
 </div>
 
 <div className="text-center p-sm bg-secondary/50 rounded">
 <div className="flex items-center justify-center gap-xs mb-xs">
 <History className="h-3 w-3 color-success" />
 <span className="text-body-sm font-medium">
 {profile.job_history_count}
 </span>
 </div>
 <div className="text-body-xs color-muted">Jobs</div>
 </div>
 </div>

 {/* Last Login */}
 <div className="flex items-center gap-xs text-body-xs color-muted mb-md">
 <Calendar className="h-3 w-3" />
 <span>Last login: {formatLastLogin(profile.last_login)}</span>
 </div>

 {/* Action Buttons */}
 <div className="flex items-center gap-sm">
 <Button
 variant="outline"
 size="sm"
 className="flex-1"
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

 {/* Status Toggle */}
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
 </div>

 {/* Hover Overlay */}
 {hoveredCard === profile.id && (
 <div className="absolute inset-0 bg-accent/5 rounded-lg pointer-events-none" />
 )}
 </Card>
 ))}
 </div>
 </div>
 );
}
