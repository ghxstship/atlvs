'use client';

import { User } from "lucide-react";
import { Card, Badge, Avatar } from '@ghxstship/ui';
import type { UserProfile, FieldConfig } from '../types';

interface ProfileKanbanViewProps {
 profiles: UserProfile[];
 loading: boolean;
 selectedIds: string[];
 onSelectionChange: (ids: string[]) => void;
 onEdit: (profile: UserProfile) => void;
 fieldConfig: FieldConfig[];
}

export default function ProfileKanbanView({
 profiles,
 loading,
 selectedIds,
 onSelectionChange,
 onEdit,
 fieldConfig
}: ProfileKanbanViewProps) {
 const columns = [
 { id: 'pending', title: 'Pending', status: 'pending' },
 { id: 'active', title: 'Active', status: 'active' },
 { id: 'inactive', title: 'Inactive', status: 'inactive' },
 ];

 const getProfilesByStatus = (status: string) => {
 return profiles.filter(profile => profile.status === status);
 };

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
 {columns.map((column) => (
 <div key={column.id} className="space-y-md">
 <h3 className="font-semibold">{column.title}</h3>
 <div className="space-y-sm">
 {Array.from({ length: 3 }).map((_, i) => (
 <Card key={i} className="p-md animate-pulse">
 <div className="flex items-center gap-sm mb-sm">
 <div className="w-8 h-8 bg-muted rounded-full" />
 <div className="w-24 h-4 bg-muted rounded" />
 </div>
 <div className="w-full h-3 bg-muted rounded" />
 </Card>
 ))}
 </div>
 </div>
 ))}
 </div>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
 {columns.map((column) => {
 const columnProfiles = getProfilesByStatus(column.status);
 
 return (
 <div key={column.id} className="space-y-md">
 <div className="flex items-center justify-between">
 <h3 className="font-semibold">{column.title}</h3>
 <Badge variant="outline">{columnProfiles.length}</Badge>
 </div>
 
 <div className="space-y-sm">
 {columnProfiles.map((profile) => (
 <Card
 key={profile.id}
 className="p-md cursor-pointer hover:shadow-sm transition-shadow"
 onClick={() => onEdit(profile)}
 >
 <div className="flex items-center gap-sm mb-sm">
 <Avatar className="h-8 w-8">
 {profile.avatar_url ? (
 <img src={profile.avatar_url} alt={profile.full_name} />
 ) : (
 <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary font-semibold text-xs">
 {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
 </div>
 )}
 </Avatar>
 <div className="flex-1 min-w-0">
 <p className="font-medium text-sm truncate">{profile.full_name}</p>
 <p className="text-xs text-muted-foreground truncate">{profile.position}</p>
 </div>
 </div>
 
 <div className="space-y-xs">
 <div className="flex items-center justify-between text-xs">
 <span className="text-muted-foreground">Completion</span>
 <span className="font-medium">{profile.completion_percentage}%</span>
 </div>
 <div className="w-full bg-muted rounded-full h-1">
 <div 
 className="bg-primary h-1 rounded-full transition-all duration-300" 
 style={{ width: `${profile.completion_percentage}%` }}
 />
 </div>
 </div>
 </Card>
 ))}
 
 {columnProfiles.length === 0 && (
 <Card className="p-md text-center text-muted-foreground">
 <User className="h-8 w-8 mx-auto mb-sm opacity-50" />
 <p className="text-sm">No {column.title.toLowerCase()} profiles</p>
 </Card>
 )}
 </div>
 </div>
 );
 })}
 </div>
 );
}
