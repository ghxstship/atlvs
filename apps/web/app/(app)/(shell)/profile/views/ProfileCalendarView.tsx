'use client';

import { Calendar, User } from "lucide-react";
import { Card, Badge, Avatar } from '@ghxstship/ui';
import type { UserProfile, FieldConfig } from '../types';

interface ProfileCalendarViewProps {
 profiles: UserProfile[];
 loading: boolean;
 selectedIds: string[];
 onSelectionChange: (ids: string[]) => void;
 onEdit: (profile: UserProfile) => void;
 fieldConfig: FieldConfig[];
}

export default function ProfileCalendarView({
 profiles,
 loading,
 selectedIds,
 onSelectionChange,
 onEdit,
 fieldConfig
}: ProfileCalendarViewProps) {
 if (loading) {
 return (
 <Card className="p-xl text-center">
 <div className="animate-pulse space-y-md">
 <div className="w-12 h-12 bg-muted rounded-full mx-auto" />
 <div className="w-48 h-4 bg-muted rounded mx-auto" />
 <div className="w-32 h-3 bg-muted rounded mx-auto" />
 </div>
 </Card>
 );
 }

 // Group profiles by hire date for calendar view
 const profilesByDate = profiles.reduce((acc, profile) => {
 if (profile.hire_date) {
 const date = new Date(profile.hire_date).toDateString();
 if (!acc[date]) {
 acc[date] = [];
 }
 acc[date].push(profile);
 }
 return acc;
 }, {} as Record<string, UserProfile[]>);

 const sortedDates = Object.keys(profilesByDate).sort((a, b) => 
 new Date(b).getTime() - new Date(a).getTime()
 );

 return (
 <div className="space-y-lg">
 <div className="flex items-center gap-sm mb-lg">
 <Calendar className="h-5 w-5" />
 <h2 className="text-lg font-semibold">Profiles by Hire Date</h2>
 </div>

 {sortedDates.length === 0 ? (
 <Card className="p-xl text-center">
 <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-md" />
 <h3 className="text-lg font-semibold mb-sm">No hire dates available</h3>
 <p className="text-muted-foreground">
 Profiles with hire dates will appear here in a timeline view.
 </p>
 </Card>
 ) : (
 <div className="space-y-md">
 {sortedDates.map((dateString) => {
 const date = new Date(dateString);
 const dateProfiles = profilesByDate[dateString];
 
 return (
 <Card key={dateString} className="p-md">
 <div className="flex items-center gap-md mb-md">
 <div className="flex-shrink-0">
 <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
 <Calendar className="h-6 w-6 text-primary" />
 </div>
 </div>
 <div>
 <h3 className="font-semibold">
 {date.toLocaleDateString('en-US', { 
 weekday: 'long',
 year: 'numeric',
 month: 'long',
 day: 'numeric'
 })}
 </h3>
 <p className="text-sm text-muted-foreground">
 {dateProfiles.length} profile{dateProfiles.length !== 1 ? 's' : ''} hired
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {dateProfiles.map((profile) => (
 <div
 key={profile.id}
 className="flex items-center gap-sm p-sm rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
 onClick={() => onEdit(profile)}
 >
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
 <p className="text-xs text-muted-foreground truncate">
 {profile.position} • {profile.department}
 </p>
 </div>
 <Badge 
 variant={profile.status === 'active' ? 'success' : 'secondary'}
 size="sm"
 >
 {profile.status}
 </Badge>
 </div>
 ))}
 </div>
 </Card>
 );
 })}
 </div>
 )}
 </div>
 );
}
