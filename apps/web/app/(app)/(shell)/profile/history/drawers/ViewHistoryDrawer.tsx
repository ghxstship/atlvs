'use client';

import { Calendar, Building, MapPin, Award, Star, Tag, ExternalLink, DollarSign, Edit, Trash2, Share, Download, Clock, Eye, EyeOff, Briefcase, GraduationCap, Heart, CheckCircle, Circle, Pause, X } from "lucide-react";
import {
 Drawer,
 Button,
 Badge,
 Separator,
 Avatar,
 AvatarFallback,
} from '@ghxstship/ui';
import type { 
 HistoryEntry, 
 HistoryEntryType, 
 EmploymentType, 
 EducationLevel, 
 ProjectStatus,
 HistoryVisibility 
} from '../types';

interface ViewHistoryDrawerProps {
 open: boolean;
 onClose: () => void;
 onEdit: (entry: HistoryEntry) => void;
 onDelete: (id: string) => void;
 entry: HistoryEntry | null;
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
 other: Circle,
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
 other: 'gray',
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
 volunteer: 'Volunteer',
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
 other: 'Other',
 };
 return labelMap[level] || level;
};

const getProjectStatusIcon = (status: ProjectStatus) => {
 const iconMap = {
 completed: CheckCircle,
 in_progress: Clock,
 on_hold: Pause,
 cancelled: X,
 };
 return iconMap[status] || Circle;
};

const getProjectStatusColor = (status: ProjectStatus) => {
 const colorMap = {
 completed: 'green',
 in_progress: 'blue',
 on_hold: 'yellow',
 cancelled: 'red',
 };
 return colorMap[status] || 'gray';
};

const getVisibilityIcon = (visibility: HistoryVisibility) => {
 const iconMap = {
 public: Eye,
 organization: Building,
 private: EyeOff,
 };
 return iconMap[visibility] || Eye;
};

const formatDateRange = (startDate: string, endDate?: string | null, isCurrent?: boolean) => {
 const start = new Date(startDate).toLocaleDateString('en-US', { 
 month: 'long', 
 year: 'numeric' 
 });
 
 if (isCurrent) {
 return `${start} - Present`;
 }
 
 if (endDate) {
 const end = new Date(endDate).toLocaleDateString('en-US', { 
 month: 'long', 
 year: 'numeric' 
 });
 return `${start} - ${end}`;
 }
 
 return start;
};

const calculateDuration = (startDate: string, endDate?: string | null, isCurrent?: boolean) => {
 const start = new Date(startDate);
 const end = isCurrent ? new Date() : (endDate ? new Date(endDate) : new Date(startDate));
 
 const diffTime = Math.abs(end.getTime() - start.getTime());
 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 const diffMonths = Math.floor(diffDays / 30);
 const diffYears = Math.floor(diffMonths / 12);
 
 if (diffYears > 0) {
 const remainingMonths = diffMonths % 12;
 if (remainingMonths > 0) {
 return `${diffYears} year${diffYears > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
 }
 return `${diffYears} year${diffYears > 1 ? 's' : ''}`;
 }
 
 if (diffMonths > 0) {
 return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
 }
 
 return 'Less than a month';
};

export default function ViewHistoryDrawer({
 open,
 onClose,
 onEdit,
 onDelete,
 entry,
}: ViewHistoryDrawerProps) {
 if (!entry) return null;

 const EntryIcon = getEntryTypeIcon(entry.entry_type);
 const VisibilityIcon = getVisibilityIcon(entry.visibility);

 const handleShare = () => {
 if (navigator.share) {
 navigator.share({
 title: entry.title,
 text: `${entry.title} at ${entry.organization || 'Organization'}`,
 url: window.location.href,
 });
 } else {
 navigator.clipboard.writeText(`${entry.title} at ${entry.organization || 'Organization'}`);
 }
 };

 const handleDownload = () => {
 // In a real implementation, this would generate a PDF or export
 };

 return (
 <Drawer
 open={open}
 onClose={onClose}
 title="History Entry Details"
 description="View detailed information about this history entry"
 >
 <div className="space-y-lg">
 {/* Header */}
 <div className="flex items-start gap-md">
 <Avatar className="w-16 h-16">
 <AvatarFallback className={`bg-${getEntryTypeColor(entry.entry_type)}-100 text-${getEntryTypeColor(entry.entry_type)}-600`}>
 <EntryIcon className="h-8 w-8" />
 </AvatarFallback>
 </Avatar>
 
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-sm mb-xs">
 <Badge variant="secondary">
 {entry.entry_type.replace('_', ' ').toUpperCase()}
 </Badge>
 {entry.is_current && (
 <Badge variant="primary">Current</Badge>
 )}
 <Badge variant="outline" className="flex items-center gap-xs">
 <VisibilityIcon className="h-3 w-3" />
 {entry.visibility.charAt(0).toUpperCase() + entry.visibility.slice(1)}
 </Badge>
 </div>
 
 <h1 className="text-xl font-bold mb-xs">{entry.title}</h1>
 
 {entry.organization && (
 <div className="flex items-center gap-xs text-muted-foreground mb-xs">
 <Building className="h-4 w-4" />
 <span className="font-medium">{entry.organization}</span>
 </div>
 )}
 
 {entry.location && (
 <div className="flex items-center gap-xs text-muted-foreground mb-xs">
 <MapPin className="h-4 w-4" />
 <span>{entry.location}</span>
 </div>
 )}
 
 <div className="flex items-center gap-xs text-muted-foreground">
 <Calendar className="h-4 w-4" />
 <span>{formatDateRange(entry.start_date, entry.end_date, entry.is_current)}</span>
 <span>•</span>
 <Clock className="h-4 w-4" />
 <span>{calculateDuration(entry.start_date, entry.end_date, entry.is_current)}</span>
 </div>
 </div>
 </div>

 {/* Actions */}
 <div className="flex gap-sm">
 <Button onClick={() => onEdit(entry)} size="sm">
 <Edit className="h-4 w-4 mr-xs" />
 Edit
 </Button>
 <Button variant="outline" onClick={handleShare} size="sm">
 <Share className="h-4 w-4 mr-xs" />
 Share
 </Button>
 <Button variant="outline" onClick={handleDownload} size="sm">
 <Download className="h-4 w-4 mr-xs" />
 Export
 </Button>
 <Button 
 variant="destructive" 
 onClick={() => onDelete(entry.id)} 
 size="sm"
 className="ml-auto"
 >
 <Trash2 className="h-4 w-4 mr-xs" />
 Delete
 </Button>
 </div>

 <Separator />

 {/* Type-specific Information */}
 {(entry.employment_type || entry.salary_range) && (
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Employment Details</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 {entry.employment_type && (
 <div className="flex items-center gap-xs">
 <Briefcase className="h-4 w-4 text-muted-foreground" />
 <span className="text-sm text-muted-foreground">Type:</span>
 <span className="font-medium">{getEmploymentTypeLabel(entry.employment_type)}</span>
 </div>
 )}
 {entry.salary_range && (
 <div className="flex items-center gap-xs">
 <DollarSign className="h-4 w-4 text-muted-foreground" />
 <span className="text-sm text-muted-foreground">Salary:</span>
 <span className="font-medium">{entry.salary_range}</span>
 </div>
 )}
 </div>
 </div>
 )}

 {(entry.education_level || entry.grade_gpa) && (
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Education Details</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 {entry.education_level && (
 <div className="flex items-center gap-xs">
 <GraduationCap className="h-4 w-4 text-muted-foreground" />
 <span className="text-sm text-muted-foreground">Level:</span>
 <span className="font-medium">{getEducationLevelLabel(entry.education_level)}</span>
 </div>
 )}
 {entry.grade_gpa && (
 <div className="flex items-center gap-xs">
 <Star className="h-4 w-4 text-muted-foreground" />
 <span className="text-sm text-muted-foreground">Grade/GPA:</span>
 <span className="font-medium">{entry.grade_gpa}</span>
 </div>
 )}
 </div>
 </div>
 )}

 {entry.project_status && (
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Project Details</h3>
 <div className="flex items-center gap-xs">
 {(() => {
 const StatusIcon = getProjectStatusIcon(entry.project_status!);
 return <StatusIcon className={`h-4 w-4 text-${getProjectStatusColor(entry.project_status!)}-500`} />;
 })()}
 <span className="text-sm text-muted-foreground">Status:</span>
 <Badge variant="outline" className="capitalize">
 {entry.project_status.replace('_', ' ')}
 </Badge>
 </div>
 </div>
 )}

 {entry.description && (
 <>
 <Separator />
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Description</h3>
 <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
 {entry.description}
 </p>
 </div>
 </>
 )}

 {entry.skills_gained.length > 0 && (
 <>
 <Separator />
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Skills Gained</h3>
 <div className="flex flex-wrap gap-xs">
 {entry.skills_gained.map((skill, index) => (
 <Badge key={index} variant="secondary">
 {skill}
 </Badge>
 ))}
 </div>
 </div>
 </>
 )}

 {entry.achievements.length > 0 && (
 <>
 <Separator />
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Achievements</h3>
 <div className="space-y-sm">
 {entry.achievements.map((achievement, index) => (
 <div key={index} className="flex items-start gap-sm p-sm bg-muted rounded">
 <Award className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
 <span className="text-sm">{achievement}</span>
 </div>
 ))}
 </div>
 </div>
 </>
 )}

 {entry.tags.length > 0 && (
 <>
 <Separator />
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Tags</h3>
 <div className="flex flex-wrap gap-xs">
 {entry.tags.map((tag, index) => (
 <Badge key={index} variant="outline" className="flex items-center gap-xs">
 <Tag className="h-3 w-3" />
 {tag}
 </Badge>
 ))}
 </div>
 </div>
 </>
 )}

 {(entry.references || entry.website_url) && (
 <>
 <Separator />
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Additional Information</h3>
 
 {entry.references && (
 <div className="space-y-xs">
 <h4 className="font-medium">References</h4>
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">
 {entry.references}
 </p>
 </div>
 )}
 
 {entry.website_url && (
 <div className="space-y-xs">
 <h4 className="font-medium">Website/Portfolio</h4>
 <a 
 href={entry.website_url as any as any} 
 target="_blank" 
 rel="noopener noreferrer"
 className="flex items-center gap-xs text-primary hover:underline"
 >
 <ExternalLink className="h-4 w-4" />
 {entry.website_url}
 </a>
 </div>
 )}
 </div>
 </>
 )}

 {/* Metadata */}
 <Separator />
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Metadata</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-sm text-muted-foreground">
 <div>
 <span className="font-medium">Created:</span>{' '}
 {new Date(entry.created_at).toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'long',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 })}
 </div>
 <div>
 <span className="font-medium">Last Updated:</span>{' '}
 {new Date(entry.updated_at).toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'long',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 })}
 </div>
 </div>
 </div>
 </div>
 </Drawer>
 );
}
