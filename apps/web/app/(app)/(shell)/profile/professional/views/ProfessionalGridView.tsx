'use client';

import { User, Calendar, Building, Eye, Edit, Trash2, ExternalLink, Award, MapPin } from "lucide-react";
import {
 Card,
 Badge,
 Button,
 Checkbox,
} from '@ghxstship/ui';
import type { ProfessionalProfile } from '../types';
import {
 formatDateShort,
 calculateTenure,
 getStatusBadgeVariant,
 getCompletionColor,
 EMPLOYMENT_TYPE_LABELS,
 PROFILE_STATUS_LABELS,
} from '../types';

interface ProfessionalGridViewProps {
 profiles: ProfessionalProfile[];
 selectedIds: string[];
 onSelectItem: (id: string, selected: boolean) => void;
 onSelectAll: (selected: boolean) => void;
 onView: (profile: ProfessionalProfile) => void;
 onEdit: (profile: ProfessionalProfile) => void;
 onDelete: (profile: ProfessionalProfile) => void;
 loading?: boolean;
}

export default function ProfessionalGridView({
 profiles,
 selectedIds,
 onSelectItem,
 onSelectAll,
 onView,
 onEdit,
 onDelete,
 loading = false,
}: ProfessionalGridViewProps) {
 const allSelected = profiles.length > 0 && selectedIds.length === profiles.length;
 const someSelected = selectedIds.length > 0 && selectedIds.length < profiles.length;

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {[...Array(6)].map((_, i) => (
 <Card key={i} className="p-6">
 <div className="animate-pulse space-y-4">
 <div className="h-4 bg-muted rounded w-3/4"></div>
 <div className="h-3 bg-muted rounded w-1/2"></div>
 <div className="h-20 bg-muted rounded"></div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (profiles.length === 0) {
 return (
 <Card className="p-12 text-center">
 <div className="flex flex-col items-center gap-4">
 <User className="h-12 w-12 text-muted-foreground" />
 <div>
 <h3 className="text-lg font-semibold">No Professional Profiles</h3>
 <p className="text-muted-foreground mt-2">
 No professional profiles found matching your criteria.
 </p>
 </div>
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-6">
 {/* Header with bulk selection */}
 <Card className="p-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected}
 onCheckedChange={(checked) => onSelectAll(!!checked)}
 />
 <span className="text-sm text-muted-foreground">
 {selectedIds.length > 0 ? `${selectedIds.length} selected` : `${profiles.length} profiles`}
 </span>
 </div>
 {selectedIds.length > 0 && (
 <div className="flex items-center gap-2">
 <Button variant="outline" size="sm">
 Export Selected
 </Button>
 <Button variant="outline" size="sm">
 Bulk Actions
 </Button>
 </div>
 )}
 </div>
 </Card>

 {/* Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {profiles.map((profile) => {
 const isSelected = selectedIds.includes(profile.id);
 const completion = profile.profile_completion_percentage;

 return (
 <Card 
 key={profile.id} 
 className={`p-6 hover:shadow-md transition-shadow ${
 isSelected ? 'ring-2 ring-primary' : ''
 }`}
 >
 <div className="space-y-4">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-2">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => onSelectItem(profile.id, !!checked)}
 />
 <Badge variant={getStatusBadgeVariant(profile.status)}>
 {PROFILE_STATUS_LABELS[profile.status]}
 </Badge>
 </div>
 <div className="flex items-center gap-1">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(profile)}
 >
 <Eye className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(profile)}
 >
 <Edit className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(profile)}
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </div>

 {/* Profile Info */}
 <div className="text-center">
 <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
 <User className="h-8 w-8 text-primary" />
 </div>
 <h3 className="font-semibold text-lg mb-1">
 {profile.job_title || 'No Job Title'}
 </h3>
 {profile.department && (
 <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-2">
 <Building className="h-4 w-4" />
 {profile.department}
 </div>
 )}
 {profile.employment_type && (
 <Badge variant="outline" className="mb-3">
 {EMPLOYMENT_TYPE_LABELS[profile.employment_type]}
 </Badge>
 )}
 </div>

 {/* Profile Completion */}
 <div className="text-center">
 <div className="text-2xl font-bold text-primary mb-1">
 {completion}%
 </div>
 <div className="text-sm text-muted-foreground mb-2">
 Profile Complete
 </div>
 <div className="w-full bg-muted rounded-full h-2">
 <div 
 className={`h-2 rounded-full bg-${getCompletionColor(completion)}-500`}
 style={{ width: `${completion}%` }}
 ></div>
 </div>
 </div>

 {/* Key Metrics */}
 <div className="grid grid-cols-2 gap-4 text-center">
 <div>
 <div className="flex items-center justify-center gap-1 mb-1">
 <Award className="h-4 w-4 text-blue-500" />
 <span className="text-sm font-medium">Skills</span>
 </div>
 <div className="text-lg font-semibold">
 {profile.skills ? profile.skills.length : 0}
 </div>
 </div>
 <div>
 <div className="flex items-center justify-center gap-1 mb-1">
 <Calendar className="h-4 w-4 text-green-500" />
 <span className="text-sm font-medium">Tenure</span>
 </div>
 <div className="text-lg font-semibold">
 {profile.hire_date ? calculateTenure(profile.hire_date).split(' ')[0] : 'N/A'}
 </div>
 </div>
 </div>

 {/* Manager */}
 {profile.manager_name && (
 <div className="text-center">
 <div className="text-sm text-muted-foreground">
 Reports to {profile.manager_name}
 </div>
 </div>
 )}

 {/* Bio Preview */}
 {profile.bio && (
 <div>
 <h4 className="font-medium text-sm mb-2">About</h4>
 <p className="text-sm text-muted-foreground line-clamp-2">
 {profile.bio}
 </p>
 </div>
 )}

 {/* Skills Preview */}
 {profile.skills && profile.skills.length > 0 && (
 <div>
 <h4 className="font-medium text-sm mb-2">Top Skills</h4>
 <div className="flex flex-wrap gap-1">
 {profile.skills.slice(0, 3).map((skill) => (
 <Badge key={skill} variant="outline" className="text-xs">
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

 {/* Online Presence */}
 {(profile.linkedin_url || profile.website_url) && (
 <div className="flex justify-center gap-2">
 {profile.linkedin_url && (
 <Button
 variant="outline"
 size="sm"
 onClick={() => window.open(profile.linkedin_url!, '_blank')}
 >
 <ExternalLink className="h-3 w-3 mr-1" />
 LinkedIn
 </Button>
 )}
 {profile.website_url && (
 <Button
 variant="outline"
 size="sm"
 onClick={() => window.open(profile.website_url!, '_blank')}
 >
 <ExternalLink className="h-3 w-3 mr-1" />
 Website
 </Button>
 )}
 </div>
 )}

 {/* Action Buttons */}
 <div className="flex gap-2 pt-2">
 <Button
 variant="outline"
 size="sm"
 className="flex-1"
 onClick={() => onView(profile)}
 >
 View Profile
 </Button>
 <Button
 variant="primary"
 size="sm"
 className="flex-1"
 onClick={() => onEdit(profile)}
 >
 Edit Profile
 </Button>
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 </div>
 );
}
