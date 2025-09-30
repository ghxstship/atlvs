'use client';

import { MapPin, Calendar, Building, Award, Edit, Trash2, Eye, Clock, DollarSign, Briefcase, Users, Star, CheckCircle } from "lucide-react";
import { useMemo } from 'react';
import {
 Card,
 Badge,
 Button,
 Avatar,
 AvatarFallback,
} from '@ghxstship/ui';
import type { JobHistoryEntry, EmploymentType, CompanySize } from '../types';

interface JobHistoryCardViewProps {
 entries: JobHistoryEntry[];
 selectedIds: string[];
 onSelect: (id: string) => void;
 onEdit: (entry: JobHistoryEntry) => void;
 onDelete: (id: string) => void;
 onView: (entry: JobHistoryEntry) => void;
 loading?: boolean;
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

const getCompanySizeLabel = (size: CompanySize) => {
 const labelMap = {
 startup: 'Startup',
 small: 'Small',
 medium: 'Medium',
 large: 'Large',
 enterprise: 'Enterprise',
 };
 return labelMap[size] || size;
};

const getCompanySizeIcon = (size: CompanySize) => {
 const iconMap = {
 startup: '🚀',
 small: '🏢',
 medium: '🏬',
 large: '🏭',
 enterprise: '🌆',
 };
 return iconMap[size] || '🏢';
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

const calculateDuration = (startDate: string, endDate?: string | null, isCurrent?: boolean) => {
 const start = new Date(startDate);
 const end = isCurrent ? new Date() : (endDate ? new Date(endDate) : new Date(startDate));
 
 const diffTime = Math.abs(end.getTime() - start.getTime());
 const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
 const diffYears = Math.floor(diffMonths / 12);
 
 if (diffYears > 0) {
 const remainingMonths = diffMonths % 12;
 if (remainingMonths > 0) {
 return `${diffYears}y ${remainingMonths}m`;
 }
 return `${diffYears}y`;
 }
 
 return `${diffMonths}m`;
};

export default function JobHistoryCardView({
 entries,
 selectedIds,
 onSelect,
 onEdit,
 onDelete,
 onView,
 loading = false,
}: JobHistoryCardViewProps) {
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
 <div className="h-4 bg-muted rounded mb-sm" />
 <div className="h-3 bg-muted rounded mb-sm w-3/4" />
 <div className="h-3 bg-muted rounded mb-md w-1/2" />
 <div className="space-y-xs">
 <div className="h-2 bg-muted rounded w-full" />
 <div className="h-2 bg-muted rounded w-5/6" />
 <div className="h-2 bg-muted rounded w-4/6" />
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (entries.length === 0) {
 return (
 <div className="flex flex-col items-center justify-center py-xl text-center">
 <Briefcase className="h-12 w-12 text-muted-foreground mb-md" />
 <h3 className="text-lg font-semibold mb-sm">No Job History</h3>
 <p className="text-muted-foreground mb-lg max-w-md">
 Start building your professional history by adding your work experience and career journey.
 </p>
 </div>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {sortedEntries.map((entry) => {
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
 <Avatar className="h-12 w-12">
 <AvatarFallback className="bg-blue-100 text-blue-600">
 <Building className="h-6 w-6" />
 </AvatarFallback>
 </Avatar>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-xs mb-xs">
 <Badge 
 variant="secondary" 
 className={`bg-${getEmploymentTypeColor(entry.employment_type)}-100 text-${getEmploymentTypeColor(entry.employment_type)}-600`}
 >
 {entry.employment_type.replace('_', ' ').toUpperCase()}
 </Badge>
 {entry.is_current && (
 <Badge variant="primary">
 Current
 </Badge>
 )}
 </div>
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
 <Eye className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(entry);
 }}
 >
 <Edit className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDelete(entry.id);
 }}
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </div>

 {/* Job Title and Company */}
 <div className="mb-md">
 <h3 className="font-semibold text-base mb-xs line-clamp-2">
 {entry.job_title}
 </h3>
 <div className="flex items-center gap-xs text-muted-foreground mb-xs">
 <Building className="h-4 w-4" />
 <span className="text-sm font-medium">{entry.company_name}</span>
 </div>
 {entry.department && (
 <div className="flex items-center gap-xs text-muted-foreground mb-xs">
 <Users className="h-4 w-4" />
 <span className="text-sm">{entry.department}</span>
 </div>
 )}
 {entry.location && (
 <div className="flex items-center gap-xs text-muted-foreground mb-xs">
 <MapPin className="h-4 w-4" />
 <span className="text-sm">{entry.location}</span>
 </div>
 )}
 <div className="flex items-center gap-xs text-muted-foreground">
 <Calendar className="h-4 w-4" />
 <span className="text-sm">
 {formatDateRange(entry.start_date, entry.end_date, entry.is_current)}
 </span>
 <span>•</span>
 <Clock className="h-4 w-4" />
 <span className="text-sm">
 {calculateDuration(entry.start_date, entry.end_date, entry.is_current)}
 </span>
 </div>
 </div>

 {/* Company Details */}
 <div className="mb-md space-y-xs">
 {entry.company_size && (
 <div className="flex items-center gap-xs">
 <span className="text-lg">{getCompanySizeIcon(entry.company_size)}</span>
 <span className="text-xs text-muted-foreground">
 {getCompanySizeLabel(entry.company_size)} Company
 </span>
 </div>
 )}
 
 {entry.industry && (
 <div className="flex items-center gap-xs">
 <span className="text-xs text-muted-foreground">Industry:</span>
 <Badge variant="outline" className="text-xs">
 {entry.industry}
 </Badge>
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
 </div>

 {/* Description */}
 {entry.description && (
 <p className="text-sm text-muted-foreground mb-md line-clamp-3">
 {entry.description}
 </p>
 )}

 {/* Skills and Achievements */}
 <div className="space-y-sm">
 {entry.skills_used.length > 0 && (
 <div>
 <h4 className="text-xs font-medium text-muted-foreground mb-xs">Skills</h4>
 <div className="flex flex-wrap gap-xs">
 {entry.skills_used.slice(0, 3).map((skill, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {skill}
 </Badge>
 ))}
 {entry.skills_used.length > 3 && (
 <Badge variant="outline" className="text-xs">
 +{entry.skills_used.length - 3}
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

 {entry.responsibilities.length > 0 && (
 <div>
 <h4 className="text-xs font-medium text-muted-foreground mb-xs">Key Responsibilities</h4>
 <div className="space-y-xs">
 {entry.responsibilities.slice(0, 2).map((responsibility, index) => (
 <div key={index} className="flex items-start gap-xs">
 <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
 <span className="text-xs text-muted-foreground line-clamp-1">
 {responsibility}
 </span>
 </div>
 ))}
 {entry.responsibilities.length > 2 && (
 <span className="text-xs text-muted-foreground">
 +{entry.responsibilities.length - 2} more responsibilities
 </span>
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
 
 {entry.supervisor_name && (
 <div className="text-xs text-muted-foreground">
 Manager: {entry.supervisor_name}
 </div>
 )}
 </div>
 </Card>
 );
 })}
 </div>
 );
}
