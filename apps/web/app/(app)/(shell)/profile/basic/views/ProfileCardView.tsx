'use client';

import { User, Mail, Phone, MapPin, Briefcase, Calendar, Globe, Edit, Eye, Download } from "lucide-react";
import { 
 Card, 
 Avatar, 
 Badge, 
 Button,
 Skeleton,
} from '@ghxstship/ui';
import type { UserProfile } from '../types';

interface ProfileCardViewProps {
 profile: UserProfile | null;
 loading: boolean;
 onEdit?: () => void;
 onView?: () => void;
 onExport?: () => void;
 compact?: boolean;
}

export default function ProfileCardView({
 profile,
 loading,
 onEdit,
 onView,
 onExport,
 compact = false,
}: ProfileCardViewProps) {
 if (loading) {
 return (
 <Card className="p-6">
 <div className="flex items-start gap-4">
 <Skeleton className="h-16 w-16 rounded-full" />
 <div className="flex-1 space-y-2">
 <Skeleton className="h-4 w-48" />
 <Skeleton className="h-3 w-32" />
 <Skeleton className="h-3 w-40" />
 </div>
 </div>
 </Card>
 );
 }

 if (!profile) {
 return (
 <Card className="p-6 text-center">
 <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-semibold mb-2">No Profile Found</h3>
 <p className="text-muted-foreground">
 Profile information is not available.
 </p>
 </Card>
 );
 }

 const formatDate = (dateString?: string) => {
 if (!dateString) return 'Not specified';
 return new Date(dateString).toLocaleDateString();
 };

 const getCompletionColor = (percentage: number) => {
 if (percentage >= 80) return 'text-green-600';
 if (percentage >= 60) return 'text-yellow-600';
 return 'text-red-600';
 };

 return (
 <Card className="p-6">
 <div className="flex items-start justify-between mb-6">
 <div className="flex items-start gap-4">
 <Avatar className="h-16 w-16">
 {profile.avatar_url ? (
 <img 
 src={profile.avatar_url} 
 alt="Profile" 
 className="h-full w-full object-cover" 
 />
 ) : (
 <User className="h-8 w-8" />
 )}
 </Avatar>
 
 <div className="space-y-2">
 <div className="flex items-center gap-2">
 <h3 className="text-lg font-semibold">
 {profile.job_title || 'No Title'}
 </h3>
 <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
 {profile.status}
 </Badge>
 </div>
 
 <div className="flex items-center gap-4 text-sm text-muted-foreground">
 {profile.department && (
 <div className="flex items-center gap-1">
 <Briefcase className="h-4 w-4" />
 <span>{profile.department}</span>
 </div>
 )}
 
 {profile.employment_type && (
 <Badge variant="outline" className="text-xs">
 {profile.employment_type}
 </Badge>
 )}
 </div>

 <div className={`text-sm font-medium ${getCompletionColor(profile.profile_completion_percentage)}`}>
 Profile {profile.profile_completion_percentage}% complete
 </div>
 </div>
 </div>

 <div className="flex items-center gap-2">
 {onView && (
 <Button variant="ghost" size="sm" onClick={onView}>
 <Eye className="h-4 w-4" />
 </Button>
 )}
 {onEdit && (
 <Button variant="ghost" size="sm" onClick={onEdit}>
 <Edit className="h-4 w-4" />
 </Button>
 )}
 {onExport && (
 <Button variant="ghost" size="sm" onClick={onExport}>
 <Download className="h-4 w-4" />
 </Button>
 )}
 </div>
 </div>

 {!compact && (
 <div className="space-y-4">
 {/* Contact Information */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {profile.phone_primary && (
 <div className="flex items-center gap-2 text-sm">
 <Phone className="h-4 w-4 text-muted-foreground" />
 <span>{profile.phone_primary}</span>
 </div>
 )}
 
 {(profile.city || profile.country) && (
 <div className="flex items-center gap-2 text-sm">
 <MapPin className="h-4 w-4 text-muted-foreground" />
 <span>
 {[profile.city, profile.country].filter(Boolean).join(', ')}
 </span>
 </div>
 )}
 
 {profile.hire_date && (
 <div className="flex items-center gap-2 text-sm">
 <Calendar className="h-4 w-4 text-muted-foreground" />
 <span>Hired {formatDate(profile.hire_date)}</span>
 </div>
 )}
 
 {profile.nationality && (
 <div className="flex items-center gap-2 text-sm">
 <Globe className="h-4 w-4 text-muted-foreground" />
 <span>{profile.nationality}</span>
 </div>
 )}
 </div>

 {/* Bio */}
 {profile.bio && (
 <div className="pt-4 border-t">
 <p className="text-sm text-muted-foreground leading-relaxed">
 {profile.bio}
 </p>
 </div>
 )}

 {/* Skills and Languages */}
 <div className="pt-4 border-t space-y-3">
 {profile.skills && profile.skills.length > 0 && (
 <div>
 <h4 className="text-sm font-medium mb-2">Skills</h4>
 <div className="flex flex-wrap gap-1">
 {profile.skills.slice(0, 6).map(skill => (
 <Badge key={skill} variant="secondary" className="text-xs">
 {skill}
 </Badge>
 ))}
 {profile.skills.length > 6 && (
 <Badge variant="outline" className="text-xs">
 +{profile.skills.length - 6} more
 </Badge>
 )}
 </div>
 </div>
 )}

 {profile.languages && profile.languages.length > 0 && (
 <div>
 <h4 className="text-sm font-medium mb-2">Languages</h4>
 <div className="flex flex-wrap gap-1">
 {profile.languages.map(language => (
 <Badge key={language} variant="outline" className="text-xs">
 {language}
 </Badge>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* Links */}
 {(profile.linkedin_url || profile.website_url) && (
 <div className="pt-4 border-t">
 <div className="flex gap-4">
 {profile.linkedin_url && (
 <a
 href={profile.linkedin_url as any as any}
 target="_blank"
 rel="noopener noreferrer"
 className="text-sm text-blue-600 hover:underline"
 >
 LinkedIn
 </a>
 )}
 {profile.website_url && (
 <a
 href={profile.website_url as any as any}
 target="_blank"
 rel="noopener noreferrer"
 className="text-sm text-blue-600 hover:underline"
 >
 Website
 </a>
 )}
 </div>
 </div>
 )}

 {/* Metadata */}
 <div className="pt-4 border-t text-xs text-muted-foreground">
 <div className="flex justify-between">
 <span>Updated: {formatDate(profile.updated_at)}</span>
 <span>ID: {profile.employee_id || 'Not assigned'}</span>
 </div>
 </div>
 </div>
 )}
 </Card>
 );
}
