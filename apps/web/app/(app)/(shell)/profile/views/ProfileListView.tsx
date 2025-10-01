'use client';

import { User, Mail, Phone, Building, Calendar, Edit, Eye, MoreHorizontal } from "lucide-react";
import {
 Card,
 Badge,
 Button,
 Avatar,
 Checkbox,
} from '@ghxstship/ui';

import type { UserProfile, FieldConfig } from '../types';

interface ProfileListViewProps {
 profiles: UserProfile[];
 loading: boolean;
 selectedIds: string[];
 onSelectionChange: (ids: string[]) => void;
 onEdit: (profile: UserProfile) => void;
 fieldConfig: FieldConfig[];
}

export default function ProfileListView({
 profiles,
 loading,
 selectedIds,
 onSelectionChange,
 onEdit,
 fieldConfig
}: ProfileListViewProps) {
 const handleSelectProfile = (profileId: string, checked: boolean) => {
 if (checked) {
 onSelectionChange([...selectedIds, profileId]);
 } else {
 onSelectionChange(selectedIds.filter(id => id !== profileId));
 }
 };

 const handleSelectAll = (checked: boolean) => {
 if (checked) {
 onSelectionChange(profiles.map(p => p.id));
 } else {
 onSelectionChange([]);
 }
 };

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'active':
 return 'success';
 case 'inactive':
 return 'destructive';
 case 'pending':
 return 'warning';
 case 'suspended':
 return 'destructive';
 default:
 return 'secondary';
 }
 };

 if (loading) {
 return (
 <div className="space-y-sm">
 {Array.from({ length: 10 }).map((_, i) => (
 <Card key={i} className="p-md animate-pulse">
 <div className="flex items-center gap-md">
 <div className="w-icon-xl h-icon-xl bg-muted rounded-full" />
 <div className="flex-1 space-y-sm">
 <div className="h-icon-xs bg-muted rounded w-1/4" />
 <div className="h-3 bg-muted rounded w-1/3" />
 </div>
 <div className="w-component-lg h-icon-md bg-muted rounded" />
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (profiles.length === 0) {
 return (
 <Card className="p-xl text-center">
 <User className="h-icon-2xl w-icon-2xl text-muted-foreground mx-auto mb-md" />
 <h3 className="text-lg font-semibold mb-sm">No profiles found</h3>
 <p className="text-muted-foreground mb-lg">
 Get started by creating your first profile or adjust your filters.
 </p>
 <Button>Create Profile</Button>
 </Card>
 );
 }

 return (
 <div className="space-y-md">
 {/* Header with bulk selection */}
 <div className="flex items-center gap-sm">
 <Checkbox
 checked={selectedIds.length === profiles.length}
 onCheckedChange={handleSelectAll}
 indeterminate={selectedIds.length > 0 && selectedIds.length < profiles.length}
 />
 <span className="text-sm text-muted-foreground">
 {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select all'}
 </span>
 </div>

 {/* List */}
 <div className="space-y-sm">
 {profiles.map((profile) => (
 <Card
 key={profile.id}
 className={`p-md transition-all duration-200 hover:shadow-sm cursor-pointer ${
 selectedIds.includes(profile.id) ? 'ring-2 ring-primary' : ''
 }`}
 >
 <div className="flex items-center gap-md">
 {/* Selection Checkbox */}
 <Checkbox
 checked={selectedIds.includes(profile.id)}
 onCheckedChange={(checked) => handleSelectProfile(profile.id, checked as boolean)}
 onClick={(e) => e.stopPropagation()}
 />

 {/* Avatar */}
 <Avatar className="h-icon-xl w-icon-xl">
 {profile.avatar_url ? (
 <img src={profile.avatar_url} alt={profile.full_name} />
 ) : (
 <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary font-semibold">
 {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
 </div>
 )}
 </Avatar>

 {/* Basic Info */}
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-sm mb-xs">
 <h3 className="font-semibold truncate" title={profile.full_name}>
 {profile.full_name}
 </h3>
 <Badge 
 variant={getStatusColor(profile.status) as unknown} 
 size="sm"
 >
 {profile.status}
 </Badge>
 </div>
 
 <div className="flex items-center gap-md text-sm text-muted-foreground">
 <div className="flex items-center gap-xs">
 <Mail className="h-3 w-3" />
 <span className="truncate" title={profile.email}>
 {profile.email}
 </span>
 </div>
 
 {profile.position && (
 <div className="flex items-center gap-xs">
 <User className="h-3 w-3" />
 <span className="truncate">{profile.position}</span>
 </div>
 )}
 
 {profile.department && (
 <div className="flex items-center gap-xs">
 <Building className="h-3 w-3" />
 <span className="truncate">{profile.department}</span>
 </div>
 )}
 </div>
 </div>

 {/* Profile Completion */}
 <div className="hidden md:flex items-center gap-sm">
 <div className="text-right">
 <p className="text-sm font-medium">{profile.completion_percentage}%</p>
 <p className="text-xs text-muted-foreground">Complete</p>
 </div>
 <div className="w-component-md bg-muted rounded-full h-2">
 <div 
 className="bg-primary h-2 rounded-full transition-all duration-300" 
 style={{ width: `${profile.completion_percentage}%` }}
 />
 </div>
 </div>

 {/* Stats */}
 <div className="hidden lg:flex items-center gap-md text-sm">
 <div className="text-center">
 <p className="font-medium">{profile.certifications_count || 0}</p>
 <p className="text-xs text-muted-foreground">Certs</p>
 </div>
 <div className="text-center">
 <p className="font-medium">{profile.endorsements_count || 0}</p>
 <p className="text-xs text-muted-foreground">Endorsements</p>
 </div>
 </div>

 {/* Last Login */}
 {profile.last_login && (
 <div className="hidden xl:block text-sm text-muted-foreground">
 <div className="flex items-center gap-xs">
 <Calendar className="h-3 w-3" />
 <span>{new Date(profile.last_login).toLocaleDateString()}</span>
 </div>
 </div>
 )}

 {/* Actions */}
 <div className="flex items-center gap-sm">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(profile)}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(profile)}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>
 </Card>
 ))}
 </div>

 {/* Load More */}
 {profiles.length > 0 && (
 <div className="text-center pt-lg">
 <Button variant="outline">
 Load More Profiles
 </Button>
 </div>
 )}
 </div>
 );
}
