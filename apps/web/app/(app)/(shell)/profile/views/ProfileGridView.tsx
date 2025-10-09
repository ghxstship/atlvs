'use client';

import Image from 'next/image';
import { User, Mail, Phone, MapPin, Calendar, MoreHorizontal, Edit, Eye, Trash2, UserCheck, Building } from "lucide-react";
import { useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@ghxstship/ui";

import type { UserProfile, FieldConfig } from '../types';

interface ProfileGridViewProps {
 profiles: UserProfile[];
 loading: boolean;
 selectedIds: string[];
 onSelectionChange: (ids: string[]) => void;
 onEdit: (profile: UserProfile) => void;
 fieldConfig: FieldConfig[];
}

export default function ProfileGridView({
 profiles,
 loading,
 selectedIds,
 onSelectionChange,
 onEdit,
 fieldConfig
}: ProfileGridViewProps) {
 const [hoveredId, setHoveredId] = useState<string | null>(null);

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

 const getCompletionColor = (percentage: number) => {
 if (percentage >= 90) return 'text-green-600';
 if (percentage >= 70) return 'text-yellow-600';
 return 'text-red-600';
 };

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {Array.from({ length: 8 }).map((_, i) => (
 <Card key={i} className="p-lg animate-pulse">
 <div className="flex items-start gap-md">
 <div className="w-icon-2xl h-icon-2xl bg-muted rounded-full" />
 <div className="flex-1 space-y-sm">
 <div className="h-icon-xs bg-muted rounded w-3/4" />
 <div className="h-3 bg-muted rounded w-1/2" />
 <div className="h-3 bg-muted rounded w-2/3" />
 </div>
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

 {/* Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {profiles.map((profile) => (
 <Card
 key={profile.id}
 className={`p-lg transition-all duration-200 hover:shadow-md cursor-pointer ${
 selectedIds.includes(profile.id) ? 'ring-2 ring-primary' : ''
 }`}
 onMouseEnter={() => setHoveredId(profile.id)}
 onMouseLeave={() => setHoveredId(null)}
 >
 {/* Header with selection and actions */}
 <div className="flex items-start justify-between mb-md">
 <Checkbox
 checked={selectedIds.includes(profile.id)}
 onCheckedChange={(checked) => handleSelectProfile(profile.id, checked as boolean)}
 onClick={(e) => e.stopPropagation()}
 />
 
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button
 variant="ghost"
 size="sm"
 className={`h-icon-lg w-icon-lg p-0 transition-opacity ${
 hoveredId === profile.id ? 'opacity-100' : 'opacity-0'
 }`}
 onClick={(e) => e.stopPropagation()}
 >
 <MoreHorizontal className="h-icon-xs w-icon-xs" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuItem onClick={() => onEdit(profile)}>
 <Eye className="h-icon-xs w-icon-xs mr-sm" />
 View Details
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => onEdit(profile)}>
 <Edit className="h-icon-xs w-icon-xs mr-sm" />
 Edit Profile
 </DropdownMenuItem>
 <DropdownMenuItem className="text-destructive">
 <Trash2 className="h-icon-xs w-icon-xs mr-sm" />
 Delete Profile
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>

 {/* Profile Avatar and Basic Info */}
 <div className="flex items-start gap-md mb-md">
 <Avatar className="h-icon-2xl w-icon-2xl">
 {profile.avatar_url ? (
 <Image src={profile.avatar_url} alt={profile.full_name} width={48} height={48} />
 ) : (
 <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary font-semibold">
 {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
 </div>
 )}
 </Avatar>
 
 <div className="flex-1 min-w-0">
 <h3 className="font-semibold text-sm truncate" title={profile.full_name}>
 {profile.full_name}
 </h3>
 <p className="text-xs text-muted-foreground truncate" title={profile.position}>
 {profile.position || 'No position set'}
 </p>
 <Badge 
 variant={getStatusColor(profile.status) as unknown} 
 size="sm" 
 className="mt-xs"
 >
 {profile.status}
 </Badge>
 </div>
 </div>

 {/* Contact Information */}
 <div className="space-y-xs mb-md">
 <div className="flex items-center gap-xs text-xs text-muted-foreground">
 <Mail className="h-3 w-3 flex-shrink-0" />
 <span className="truncate" title={profile.email}>
 {profile.email}
 </span>
 </div>
 
 {profile.phone && (
 <div className="flex items-center gap-xs text-xs text-muted-foreground">
 <Phone className="h-3 w-3 flex-shrink-0" />
 <span>{profile.phone}</span>
 </div>
 )}
 
 {profile.department && (
 <div className="flex items-center gap-xs text-xs text-muted-foreground">
 <Building className="h-3 w-3 flex-shrink-0" />
 <span className="truncate">{profile.department}</span>
 </div>
 )}
 </div>

 {/* Profile Completion */}
 <div className="space-y-xs mb-md">
 <div className="flex items-center justify-between text-xs">
 <span className="text-muted-foreground">Profile Completion</span>
 <span className={`font-medium ${getCompletionColor(profile.completion_percentage)}`}>
 {profile.completion_percentage}%
 </span>
 </div>
 <div className="w-full bg-muted rounded-full h-1.5">
 <div 
 className="bg-primary h-1.5 rounded-full transition-all duration-300" 
 style={{ width: `${profile.completion_percentage}%` }}
 />
 </div>
 </div>

 {/* Additional Stats */}
 <div className="grid grid-cols-2 gap-md text-center">
 <div>
 <p className="text-xs font-medium">{profile.certifications_count || 0}</p>
 <p className="text-xs text-muted-foreground">Certifications</p>
 </div>
 <div>
 <p className="text-xs font-medium">{profile.endorsements_count || 0}</p>
 <p className="text-xs text-muted-foreground">Endorsements</p>
 </div>
 </div>

 {/* Last Activity */}
 {profile.last_login && (
 <div className="mt-md pt-md border-t border-border">
 <div className="flex items-center gap-xs text-xs text-muted-foreground">
 <Calendar className="h-3 w-3" />
 <span>
 Last login: {new Date(profile.last_login).toLocaleDateString()}
 </span>
 </div>
 </div>
 )}
 </Card>
 ))}
 </div>

 {/* Load More / Pagination */}
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
