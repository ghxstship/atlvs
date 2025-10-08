'use client';

import { Award, Briefcase, Building, Calendar, CheckCircle, Circle, Clock, DollarSign, Edit, ExternalEdit, ExternalLink, Eye, GraduationCap, Heart, MapPin, Pause, Star, Trash2, X } from 'lucide-react';
import { useMemo } from 'react';
import {
 Card,
 Badge,
 Button,
 Avatar,
 AvatarFallback
} from '@ghxstship/ui';
import type { HistoryEntry, HistoryEntryType, EmploymentType, EducationLevel, ProjectStatus } from '../types';

interface HistoryCardViewProps {
 entries: HistoryEntry[];
 selectedIds: string[];
 onSelect: (id: string) => void;
 onEdit: (entry: HistoryEntry) => void;
 onDelete: (id: string) => void;
 onView: (entry: HistoryEntry) => void;
 loading?: boolean;
}

const getEntryTypeIcon = (type: HistoryEntryType) => {
 const iconMap = {
 employment: Briefcase,
 education: GraduationCap,
 project: Star,
 achievement: Award,
 certification: Award,
 volunteer: Heart,
 internship: Briefcase,
 freelance: Briefcase,
 other: Circle
 };
 return iconMap[type] || Circle;
};

const getEntryTypeColor = (type: HistoryEntryType) => {
 const colorMap = {
 employment: 'blue',
 education: 'green',
 project: 'purple',
 achievement: 'yellow',
 certification: 'orange',
 volunteer: 'red',
 internship: 'cyan',
 freelance: 'pink',
 other: 'gray'
 };
 return colorMap[type] || 'gray';
};

const getEmploymentTypeLabel = (type: EmploymentType) => {
 const labelMap = {
 full_time: 'Full Time',
 part_time: 'Part Time',
 contract: 'Contract',
 freelance: 'Freelance',
 internship: 'Internship',
 volunteer: 'Volunteer'
 };
 return labelMap[type] || type;
};

const getEducationLevelLabel = (level: EducationLevel) => {
 const labelMap = {
 high_school: 'High School',
 associate: 'Associate Degree',
 bachelor: 'Bachelor Degree',
 master: 'Master Degree',
 doctorate: 'Doctorate',
 certificate: 'Certificate',
 bootcamp: 'Bootcamp',
 other: 'Other'
 };
 return labelMap[level] || level;
};

const getProjectStatusIcon = (status: ProjectStatus) => {
 const iconMap = {
 completed: CheckCircle,
 in_progress: Clock,
 on_hold: Pause,
 cancelled: X
 };
 return iconMap[status] || Circle;
};

const getProjectStatusColor = (status: ProjectStatus) => {
 const colorMap = {
 completed: 'green',
 in_progress: 'blue',
 on_hold: 'yellow',
 cancelled: 'red'
 };
 return colorMap[status] || 'gray';
};

const formatDateRange = (startDate: string, endDate?: string | null, isCurrent?: boolean) => {
 const start = new Date(startDate).toLocaleDateString('en-US', { 
 month: 'short', 
 year: 'numeric' 
 });
 
 if (isCurrent) {
 return `${start} - Present`;
 }
 
 if (endDate) {
 const end = new Date(endDate).toLocaleDateString('en-US', { 
 month: 'short', 
 year: 'numeric' 
 });
 return `${start} - ${end}`;
 }
 
 return start;
};

export default function HistoryCardView({
 entries,
 selectedIds,
 onSelect,
 onEdit,
 onDelete,
 onView,
 loading = false
}: HistoryCardViewProps) {
 const sortedEntries = useMemo(() => {
 return [...entries].sort((a, b) => {
 // Current entries first
 if (a.is_current && !b.is_current) return -1;
 if (!a.is_current && b.is_current) return 1;
 
 // Then by start date (most recent first)
 return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
 });
 }, [entries]);

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {Array.from({ length: 6 }).map((_, i) => (
 <Card key={i} className="p-lg animate-pulse">
 <div className="h-icon-xs bg-muted rounded mb-sm" />
 <div className="h-3 bg-muted rounded mb-sm w-3/4" />
 <div className="h-3 bg-muted rounded mb-md w-1/2" />
 <div className="space-y-xs">
 <div className="h-2 bg-muted rounded w-full" />
 <div className="h-2 bg-muted rounded w-icon-sm/6" />
 <div className="h-2 bg-muted rounded w-icon-xs/6" />
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (entries.length === 0) {
 return (
 <div className="flex flex-col items-center justify-center py-xl text-center">
 <Clock className="h-icon-2xl w-icon-2xl text-muted-foreground mb-md" />
 <h3 className="text-lg font-semibold mb-sm">No History Entries</h3>
 <p className="text-muted-foreground mb-lg max-w-md">
 Start building your professional history by adding your work experience, education, projects, and achievements.
 </p>
 </div>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {sortedEntries.map((entry) => {
 const EntryIcon = getEntryTypeIcon(entry.entry_type);
 const isSelected = selectedIds.includes(entry.id);
 
 return (
 <Card
 key={entry.id}
 className={`p-lg hover:shadow-md transition-all cursor-pointer ${
 isSelected ? 'ring-2 ring-primary' : ''
 }`}
 onClick={() => onSelect(entry.id)}
 >
 {/* Header */}
 <div className="flex items-start justify-between mb-md">
 <div className="flex items-center gap-sm">
 <Avatar className="h-icon-xl w-icon-xl">
 <AvatarFallback className={`bg-${getEntryTypeColor(entry.entry_type)}-100 text-${getEntryTypeColor(entry.entry_type)}-600`}>
 <EntryIcon className="h-icon-sm w-icon-sm" />
 </AvatarFallback>
 </Avatar>
 <div className="flex-1 min-w-0">
 <Badge variant="secondary" className="mb-xs">
 {entry.entry_type.replace('_', ' ').toUpperCase()}
 </Badge>
 {entry.is_current && (
 <Badge variant="primary" className="ml-xs">
 Current
 </Badge>
 )}
 </div>
 </div>
 
 <div className="flex items-center gap-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onView(entry);
 }}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(entry);
 }}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDelete(entry.id);
 }}
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>

 {/* Title and Organization */}
 <div className="mb-md">
 <h3 className="font-semibold text-base mb-xs line-clamp-xs">
 {entry.title}
 </h3>
 {entry.organization && (
 <div className="flex items-center gap-xs text-muted-foreground mb-xs">
 <Building className="h-icon-xs w-icon-xs" />
 <span className="text-sm">{entry.organization}</span>
 </div>
 )}
 {entry.location && (
 <div className="flex items-center gap-xs text-muted-foreground mb-xs">
 <MapPin className="h-icon-xs w-icon-xs" />
 <span className="text-sm">{entry.location}</span>
 </div>
 )}
 <div className="flex items-center gap-xs text-muted-foreground">
 <Calendar className="h-icon-xs w-icon-xs" />
 <span className="text-sm">
 {formatDateRange(entry.start_date, entry.end_date, entry.is_current)}
 </span>
 </div>
 </div>

 {/* Type-specific Information */}
 <div className="mb-md space-y-xs">
 {entry.employment_type && (
 <div className="flex items-center gap-xs">
 <Briefcase className="h-3 w-3 text-muted-foreground" />
 <span className="text-xs text-muted-foreground">
 {getEmploymentTypeLabel(entry.employment_type)}
 </span>
 </div>
 )}
 
 {entry.education_level && (
 <div className="flex items-center gap-xs">
 <GraduationCap className="h-3 w-3 text-muted-foreground" />
 <span className="text-xs text-muted-foreground">
 {getEducationLevelLabel(entry.education_level)}
 </span>
 </div>
 )}
 
 {entry.project_status && (
 <div className="flex items-center gap-xs">
 {(() => {
 const StatusIcon = getProjectStatusIcon(entry.project_status);
 return <StatusIcon className={`h-3 w-3 text-${getProjectStatusColor(entry.project_status)}-500`} />;
 })()}
 <span className="text-xs text-muted-foreground capitalize">
 {entry.project_status.replace('_', ' ')}
 </span>
 </div>
 )}
 
 {entry.salary_range && (
 <div className="flex items-center gap-xs">
 <DollarSign className="h-3 w-3 text-muted-foreground" />
 <span className="text-xs text-muted-foreground">
 {entry.salary_range}
 </span>
 </div>
 )}
 
 {entry.grade_gpa && (
 <div className="flex items-center gap-xs">
 <Star className="h-3 w-3 text-muted-foreground" />
 <span className="text-xs text-muted-foreground">
 GPA: {entry.grade_gpa}
 </span>
 </div>
 )}
 </div>

 {/* Description */}
 {entry.description && (
 <p className="text-sm text-muted-foreground mb-md line-clamp-sm">
 {entry.description}
 </p>
 )}

 {/* Skills and Achievements */}
 <div className="space-y-sm">
 {entry.skills_gained.length > 0 && (
 <div>
 <h4 className="text-xs font-medium text-muted-foreground mb-xs">Skills</h4>
 <div className="flex flex-wrap gap-xs">
 {entry.skills_gained.slice(0, 3).map((skill, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {skill}
 </Badge>
 ))}
 {entry.skills_gained.length > 3 && (
 <Badge variant="outline" className="text-xs">
 +{entry.skills_gained.length - 3}
 </Badge>
 )}
 </div>
 </div>
 )}
 
 {entry.achievements.length > 0 && (
 <div>
 <h4 className="text-xs font-medium text-muted-foreground mb-xs">Achievements</h4>
 <div className="flex flex-wrap gap-xs">
 {entry.achievements.slice(0, 2).map((achievement, index) => (
 <Badge key={index} variant="secondary" className="text-xs">
 <Award className="h-3 w-3 mr-xs" />
 {achievement.length > 20 ? `${achievement.slice(0, 20)}...` : achievement}
 </Badge>
 ))}
 {entry.achievements.length > 2 && (
 <Badge variant="secondary" className="text-xs">
 +{entry.achievements.length - 2}
 </Badge>
 )}
 </div>
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="flex items-center justify-between mt-md pt-md border-t">
 <div className="flex items-center gap-xs">
 {entry.tags.slice(0, 2).map((tag, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 {entry.tags.length > 2 && (
 <span className="text-xs text-muted-foreground">
 +{entry.tags.length - 2}
 </span>
 )}
 </div>
 
 {entry.website_url && (
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 window.open(entry.website_url!, '_blank');
 }}
 >
 <ExternalLink className="h-3 w-3" />
 </Button>
 )}
 </div>
 </Card>
 );
 })}
 </div>
 );
}
