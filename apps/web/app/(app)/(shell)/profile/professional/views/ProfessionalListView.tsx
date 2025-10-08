'use client';

import { Building, Calendar, Edit, ExternalAward, ExternalLink, Eye, MapPin, MoreHorizontal, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import {
 Card,
 Badge,
 Button,
 Checkbox
} from '@ghxstship/ui';
import type { ProfessionalProfile } from '../types';
import {
 formatDate,
 calculateTenure,
 getStatusBadgeVariant,
 getCompletionColor,
 EMPLOYMENT_TYPE_LABELS,
 PROFILE_STATUS_LABELS
} from '../types';

interface ProfessionalListViewProps {
 profiles: ProfessionalProfile[];
 selectedIds: string[];
 onSelectItem: (id: string, selected: boolean) => void;
 onSelectAll: (selected: boolean) => void;
 onView: (profile: ProfessionalProfile) => void;
 onEdit: (profile: ProfessionalProfile) => void;
 onDelete: (profile: ProfessionalProfile) => void;
 loading?: boolean;
}

export default function ProfessionalListView({
 profiles,
 selectedIds,
 onSelectItem,
 onSelectAll,
 onView,
 onEdit,
 onDelete,
 loading = false
}: ProfessionalListViewProps) {
 const [expandedIds, setExpandedIds] = useState<Set<string>(new Set());

 const toggleExpanded = (id: string) => {
 const newExpanded = new Set(expandedIds);
 if (newExpanded.has(id)) {
 newExpanded.delete(id);
 } else {
 newExpanded.add(id);
 }
 setExpandedIds(newExpanded);
 };

 const allSelected = profiles.length > 0 && selectedIds.length === profiles.length;
 const someSelected = selectedIds.length > 0 && selectedIds.length < profiles.length;

 if (loading) {
 return (
 <div className="space-y-md">
 {[...Array(3)].map((_, i) => (
 <Card key={i} className="p-md">
 <div className="animate-pulse">
 <div className="h-icon-xs bg-muted rounded w-3/4 mb-2"></div>
 <div className="h-3 bg-muted rounded w-1/2"></div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (profiles.length === 0) {
 return (
 <Card className="p-xsxl text-center">
 <div className="flex flex-col items-center gap-md">
 <User className="h-icon-2xl w-icon-2xl text-muted-foreground" />
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
 <div className="space-y-md">
 {/* Header with bulk selection */}
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
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
 <div className="flex items-center gap-xs">
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

 {/* Profile List */}
 {profiles.map((profile) => {
 const isSelected = selectedIds.includes(profile.id);
 const isExpanded = expandedIds.has(profile.id);
 const completion = profile.profile_completion_percentage;

 return (
 <Card key={profile.id} className={`p-md ${isSelected ? 'ring-2 ring-primary' : ''}`}>
 <div className="space-y-md">
 {/* Header Row */}
 <div className="flex items-start justify-between">
 <div className="flex items-start gap-sm flex-1">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => onSelectItem(profile.id, !!checked)}
 />
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-xs mb-2">
 <h3 className="font-semibold text-lg">
 {profile.job_title || 'No Job Title'}
 </h3>
 <Badge variant={getStatusBadgeVariant(profile.status)}>
 {PROFILE_STATUS_LABELS[profile.status]}
 </Badge>
 {profile.employment_type && (
 <Badge variant="outline">
 {EMPLOYMENT_TYPE_LABELS[profile.employment_type]}
 </Badge>
 )}
 </div>
 
 <div className="flex items-center gap-md text-sm text-muted-foreground mb-2">
 {profile.department && (
 <div className="flex items-center gap-xs">
 <Building className="h-icon-xs w-icon-xs" />
 {profile.department}
 </div>
 )}
 {profile.employee_id && (
 <div className="flex items-center gap-xs">
 <User className="h-icon-xs w-icon-xs" />
 ID: {profile.employee_id}
 </div>
 )}
 {profile.hire_date && (
 <div className="flex items-center gap-xs">
 <Calendar className="h-icon-xs w-icon-xs" />
 {calculateTenure(profile.hire_date)}
 </div>
 )}
 </div>

 {/* Profile Completion */}
 <div className="flex items-center gap-xs">
 <div className="flex-1 bg-muted rounded-full h-2">
 <div 
 className={`h-2 rounded-full bg-${getCompletionColor(completion)}-500`}
 style={{ width: `${completion}%` }}
 ></div>
 </div>
 <span className="text-sm font-medium">
 {completion}% complete
 </span>
 </div>
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center gap-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => toggleExpanded(profile.id)}
 >
 {isExpanded ? 'Less' : 'More'}
 </Button>
 <div className="flex items-center">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(profile)}
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
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(profile)}
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>
 </div>

 {/* Expanded Content */}
 {isExpanded && (
 <div className="border-t pt-4 space-y-md">
 {/* Manager and Contact Info */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 {profile.manager_name && (
 <div>
 <h4 className="font-medium text-sm mb-1">Manager</h4>
 <p className="text-sm text-muted-foreground">{profile.manager_name}</p>
 </div>
 )}
 {profile.hire_date && (
 <div>
 <h4 className="font-medium text-sm mb-1">Hire Date</h4>
 <p className="text-sm text-muted-foreground">{formatDate(profile.hire_date)}</p>
 </div>
 )}
 </div>

 {/* Bio */}
 {profile.bio && (
 <div>
 <h4 className="font-medium text-sm mb-2">Bio</h4>
 <p className="text-sm text-muted-foreground bg-muted p-sm rounded">
 {profile.bio}
 </p>
 </div>
 )}

 {/* Skills */}
 {profile.skills && profile.skills.length > 0 && (
 <div>
 <h4 className="font-medium text-sm mb-2">Skills ({profile.skills.length})</h4>
 <div className="flex flex-wrap gap-xs">
 {profile.skills.slice(0, 10).map((skill) => (
 <Badge key={skill} variant="outline" className="text-xs">
 {skill}
 </Badge>
 ))}
 {profile.skills.length > 10 && (
 <Badge variant="outline" className="text-xs">
 +{profile.skills.length - 10} more
 </Badge>
 )}
 </div>
 </div>
 )}

 {/* Online Presence */}
 {(profile.linkedin_url || profile.website_url) && (
 <div>
 <h4 className="font-medium text-sm mb-2">Online Presence</h4>
 <div className="flex gap-xs">
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
 </div>
 )}

 {/* Metadata */}
 <div className="grid grid-cols-2 gap-md text-xs text-muted-foreground">
 <div>
 <span className="font-medium">Created:</span> {formatDate(profile.created_at)}
 </div>
 <div>
 <span className="font-medium">Updated:</span> {formatDate(profile.updated_at)}
 </div>
 </div>
 </div>
 )}
 </div>
 </Card>
 );
 })}
 </div>
 );
}
