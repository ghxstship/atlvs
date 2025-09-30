'use client';

import { Calendar, Building, MapPin, Award, Star, Tag, Edit, Trash2, Share, Download, Clock, DollarSign, Briefcase, Users, Eye, EyeOff, CheckCircle } from "lucide-react";
import {
 Drawer,
 Button,
 Badge,
 Separator,
 Avatar,
 AvatarFallback,
} from '@ghxstship/ui';
import type { 
 JobHistoryEntry, 
 EmploymentType, 
 CompanySize,
 JobVisibility 
} from '../types';

interface ViewJobHistoryDrawerProps {
 open: boolean;
 onClose: () => void;
 onEdit: (entry: JobHistoryEntry) => void;
 onDelete: (id: string) => void;
 entry: JobHistoryEntry | null;
}

const getEmploymentTypeColor = (type: EmploymentType) => {
 const colorMap = {
 full_time: 'blue',
 part_time: 'green',
 contract: 'purple',
 freelance: 'pink',
 internship: 'cyan',
 temporary: 'orange',
 consultant: 'yellow',
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
 temporary: 'Temporary',
 consultant: 'Consultant',
 };
 return labelMap[type] || type;
};

const getCompanySizeLabel = (size: CompanySize) => {
 const labelMap = {
 startup: 'Startup (1-10)',
 small: 'Small Company (11-50)',
 medium: 'Medium Company (51-200)',
 large: 'Large Company (201-1000)',
 enterprise: 'Enterprise (1000+)',
 };
 return labelMap[size] || size;
};

const getVisibilityIcon = (visibility: JobVisibility) => {
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

export default function ViewJobHistoryDrawer({
 open,
 onClose,
 onEdit,
 onDelete,
 entry,
}: ViewJobHistoryDrawerProps) {
 if (!entry) return null;

 const VisibilityIcon = getVisibilityIcon(entry.visibility);

 const handleShare = () => {
 if (navigator.share) {
 navigator.share({
 title: `${entry.job_title} at ${entry.company_name}`,
 text: `${entry.job_title} at ${entry.company_name}`,
 url: window.location.href,
 });
 } else {
 navigator.clipboard.writeText(`${entry.job_title} at ${entry.company_name}`);
 }
 };

 const handleDownload = () => {
 // In a real implementation, this would generate a PDF or export
 };

 return (
 <Drawer
 open={open}
 onClose={onClose}
 title="Job History Details"
 description="View detailed information about this job history entry"
 >
 <div className="space-y-lg">
 {/* Header */}
 <div className="flex items-start gap-md">
 <Avatar className="w-16 h-16">
 <AvatarFallback className={`bg-${getEmploymentTypeColor(entry.employment_type)}-100 text-${getEmploymentTypeColor(entry.employment_type)}-600`}>
 <Briefcase className="h-8 w-8" />
 </AvatarFallback>
 </Avatar>
 
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-sm mb-xs">
 <Badge 
 variant="secondary" 
 className={`bg-${getEmploymentTypeColor(entry.employment_type)}-100 text-${getEmploymentTypeColor(entry.employment_type)}-600`}
 >
 {getEmploymentTypeLabel(entry.employment_type)}
 </Badge>
 {entry.is_current && (
 <Badge variant="primary">Current</Badge>
 )}
 <Badge variant="outline" className="flex items-center gap-xs">
 <VisibilityIcon className="h-3 w-3" />
 {entry.visibility.charAt(0).toUpperCase() + entry.visibility.slice(1)}
 </Badge>
 </div>
 
 <h1 className="text-xl font-bold mb-xs">{entry.job_title}</h1>
 
 <div className="flex items-center gap-xs text-muted-foreground mb-xs">
 <Building className="h-4 w-4" />
 <span className="font-medium">{entry.company_name}</span>
 </div>
 
 {entry.department && (
 <div className="flex items-center gap-xs text-muted-foreground mb-xs">
 <Users className="h-4 w-4" />
 <span>{entry.department}</span>
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

 {/* Company Information */}
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Company Information</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 {entry.company_size && (
 <div className="flex items-center gap-xs">
 <Building className="h-4 w-4 text-muted-foreground" />
 <span className="text-sm text-muted-foreground">Size:</span>
 <span className="font-medium">{getCompanySizeLabel(entry.company_size)}</span>
 </div>
 )}
 {entry.industry && (
 <div className="flex items-center gap-xs">
 <Star className="h-4 w-4 text-muted-foreground" />
 <span className="text-sm text-muted-foreground">Industry:</span>
 <span className="font-medium">{entry.industry}</span>
 </div>
 )}
 {entry.salary_range && (
 <div className="flex items-center gap-xs">
 <DollarSign className="h-4 w-4 text-muted-foreground" />
 <span className="text-sm text-muted-foreground">Salary:</span>
 <span className="font-medium">{entry.salary_range}</span>
 </div>
 )}
 {entry.supervisor_name && (
 <div className="flex items-center gap-xs">
 <Users className="h-4 w-4 text-muted-foreground" />
 <span className="text-sm text-muted-foreground">Manager:</span>
 <span className="font-medium">{entry.supervisor_name}</span>
 </div>
 )}
 </div>
 </div>

 {entry.description && (
 <>
 <Separator />
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Job Description</h3>
 <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
 {entry.description}
 </p>
 </div>
 </>
 )}

 {entry.responsibilities.length > 0 && (
 <>
 <Separator />
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Key Responsibilities</h3>
 <div className="space-y-sm">
 {entry.responsibilities.map((responsibility, index) => (
 <div key={index} className="flex items-start gap-sm p-sm bg-muted rounded">
 <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
 <span className="text-sm">{responsibility}</span>
 </div>
 ))}
 </div>
 </div>
 </>
 )}

 {entry.skills_used.length > 0 && (
 <>
 <Separator />
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Skills Used</h3>
 <div className="flex flex-wrap gap-xs">
 {entry.skills_used.map((skill, index) => (
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

 {(entry.supervisor_contact || entry.reason_for_leaving) && (
 <>
 <Separator />
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Additional Information</h3>
 
 {entry.supervisor_contact && (
 <div className="space-y-xs">
 <h4 className="font-medium">Supervisor Contact</h4>
 <p className="text-sm text-muted-foreground">
 {entry.supervisor_contact}
 </p>
 </div>
 )}
 
 {entry.reason_for_leaving && !entry.is_current && (
 <div className="space-y-xs">
 <h4 className="font-medium">Reason for Leaving</h4>
 <p className="text-sm text-muted-foreground">
 {entry.reason_for_leaving}
 </p>
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
