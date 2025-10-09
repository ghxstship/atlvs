'use client';

import { Award, Briefcase, Building, Calendar, CheckCircle, Clock, DollarSign, Edit, Eye, History, MapPin, Star, Trash2, Users } from "lucide-react";
import { useMemo } from 'react';
import {
 Card,
 Badge,
 Button,
 Avatar,
 AvatarFallback
} from '@ghxstship/ui';
import type { JobHistoryEntry, EmploymentType, CompanySize } from '../types';

interface JobHistoryTimelineViewProps {
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
 consultant: 'yellow'
 };
 return colorMap[type] || 'gray';
};

const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleDateString('en-US', {
 month: 'long',
 year: 'numeric'
 });
};

const formatDateRange = (startDate: string, endDate?: string | null, isCurrent?: boolean) => {
 const start = formatDate(startDate);
 
 if (isCurrent) {
 return `${start} - Present`;
 }
 
 if (endDate) {
 const end = formatDate(endDate);
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

export default function JobHistoryTimelineView({
 entries,
 selectedIds,
 onSelect,
 onEdit,
 onDelete,
 onView,
 loading = false
}: JobHistoryTimelineViewProps) {
 const timelineEntries = useMemo(() => {
 // Sort entries by start date (most recent first)
 const sorted = [...entries].sort((a, b) => {
 // Current entries first
 if (a.is_current && !b.is_current) return -1;
 if (!a.is_current && b.is_current) return 1;
 
 // Then by start date (most recent first)
 return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
 });

 // Group by year
 const grouped: { [year: string]: JobHistoryEntry[] } = {};
 sorted.forEach((entry) => {
 const year = new Date(entry.start_date).getFullYear().toString();
 if (!grouped[year]) {
 grouped[year] = [];
 }
 grouped[year].push(entry);
 });

 return grouped;
 }, [entries]);

 if (loading) {
 return (
 <div className="max-w-4xl mx-auto">
 <div className="relative">
 {/* Timeline line */}
 <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-muted" />
 
 {Array.from({ length: 4 }).map((_, i) => (
 <div key={i} className="relative flex items-start mb-lg">
 <div className="flex-shrink-0 w-component-md h-component-md bg-muted rounded-full animate-pulse" />
 <div className="ml-lg flex-1">
 <Card className="p-lg animate-pulse">
 <div className="h-icon-xs bg-muted rounded mb-sm" />
 <div className="h-3 bg-muted rounded mb-sm w-3/4" />
 <div className="h-3 bg-muted rounded mb-md w-1/2" />
 <div className="space-y-xs">
 <div className="h-2 bg-muted rounded w-full" />
 <div className="h-2 bg-muted rounded w-icon-sm/6" />
 </div>
 </Card>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
 }

 if (entries.length === 0) {
 return (
 <div className="flex flex-col items-center justify-center py-xl text-center">
 <Clock className="h-icon-2xl w-icon-2xl text-muted-foreground mb-md" />
 <h3 className="text-lg font-semibold mb-sm">No Job History</h3>
 <p className="text-muted-foreground mb-lg max-w-md">
 Start building your career timeline by adding your work experience and professional journey.
 </p>
 </div>
 );
 }

 const years = Object.keys(timelineEntries).sort((a, b) => parseInt(b) - parseInt(a));

 return (
 <div className="max-w-4xl mx-auto">
 <div className="relative">
 {/* Timeline line */}
 <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
 
 {years.map((year, yearIndex) => (
 <div key={year} className="mb-xl">
 {/* Year header */}
 <div className="relative flex items-center mb-lg">
 <div className="flex-shrink-0 w-component-md h-component-md bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm z-10">
 {year}
 </div>
 <div className="ml-lg">
 <h2 className="text-xl font-bold">{year}</h2>
 <p className="text-muted-foreground">
 {timelineEntries[year].length} position{timelineEntries[year].length === 1 ? '' : 's'}
 </p>
 </div>
 </div>

 {/* Year entries */}
 {timelineEntries[year].map((entry, entryIndex) => {
 const isSelected = selectedIds.includes(entry.id);
 const isLast = yearIndex === years.length - 1 && entryIndex === timelineEntries[year].length - 1;
 
 return (
 <div key={entry.id} className="relative flex items-start mb-lg">
 {/* Timeline node */}
 <div className="flex-shrink-0 relative">
 <Avatar 
 className={`w-component-md h-component-md border-4 border-background shadow-md cursor-pointer transition-all hover:scale-105 ${
 isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
 }`}
 onClick={() => onSelect(entry.id)}
 >
 <AvatarFallback className={`bg-${getEmploymentTypeColor(entry.employment_type)}-100 text-${getEmploymentTypeColor(entry.employment_type)}-600`}>
 <Briefcase className="h-icon-md w-icon-md" />
 </AvatarFallback>
 </Avatar>
 
 {entry.is_current && (
 <div className="absolute -top-xs -right-1 w-icon-xs h-icon-xs bg-green-500 rounded-full border-2 border-background animate-pulse" />
 )}
 </div>

 {/* Entry content */}
 <div className="ml-lg flex-1">
 <Card 
 className={`p-lg hover:shadow-md transition-all cursor-pointer ${
 isSelected ? 'ring-2 ring-primary' : ''
 }`}
 onClick={() => onSelect(entry.id)}
 >
 {/* Header */}
 <div className="flex items-start justify-between mb-md">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-sm mb-xs">
 <Badge 
 variant="secondary" 
 className={`bg-${getEmploymentTypeColor(entry.employment_type)}-100 text-${getEmploymentTypeColor(entry.employment_type)}-600`}
 >
 {entry.employment_type.replace('_', ' ').toUpperCase()}
 </Badge>
 {entry.is_current && (
 <Badge variant="primary">Current</Badge>
 )}
 </div>
 <h3 className="font-semibold text-lg mb-xs">
 {entry.job_title}
 </h3>
 <div className="flex items-center gap-xs text-muted-foreground mb-xs">
 <Building className="h-icon-xs w-icon-xs" />
 <span className="font-medium">{entry.company_name}</span>
 </div>
 {entry.department && (
 <div className="flex items-center gap-xs text-muted-foreground mb-xs">
 <Users className="h-icon-xs w-icon-xs" />
 <span>{entry.department}</span>
 </div>
 )}
 {entry.location && (
 <div className="flex items-center gap-xs text-muted-foreground mb-xs">
 <MapPin className="h-icon-xs w-icon-xs" />
 <span>{entry.location}</span>
 </div>
 )}
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

 {/* Date and Duration */}
 <div className="flex items-center gap-md mb-md text-sm text-muted-foreground">
 <div className="flex items-center gap-xs">
 <Calendar className="h-icon-xs w-icon-xs" />
 <span>{formatDateRange(entry.start_date, entry.end_date, entry.is_current)}</span>
 </div>
 <div className="flex items-center gap-xs">
 <Clock className="h-icon-xs w-icon-xs" />
 <span>{calculateDuration(entry.start_date, entry.end_date, entry.is_current)}</span>
 </div>
 {entry.salary_range && (
 <div className="flex items-center gap-xs">
 <DollarSign className="h-icon-xs w-icon-xs" />
 <span>{entry.salary_range}</span>
 </div>
 )}
 </div>

 {/* Description */}
 {entry.description && (
 <p className="text-muted-foreground mb-md">
 {entry.description}
 </p>
 )}

 {/* Key Information Grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-md">
 {entry.responsibilities.length > 0 && (
 <div>
 <h4 className="text-sm font-medium mb-xs">Key Responsibilities</h4>
 <div className="space-y-xs">
 {entry.responsibilities.slice(0, 3).map((responsibility, index) => (
 <div key={index} className="flex items-start gap-xs">
 <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
 <span className="text-xs text-muted-foreground">{responsibility}</span>
 </div>
 ))}
 {entry.responsibilities.length > 3 && (
 <span className="text-xs text-muted-foreground">
 +{entry.responsibilities.length - 3} more
 </span>
 )}
 </div>
 </div>
 )}
 
 {entry.skills_used.length > 0 && (
 <div>
 <h4 className="text-sm font-medium mb-xs">Skills Used</h4>
 <div className="flex flex-wrap gap-xs">
 {entry.skills_used.slice(0, 4).map((skill, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {skill}
 </Badge>
 ))}
 {entry.skills_used.length > 4 && (
 <Badge variant="outline" className="text-xs">
 +{entry.skills_used.length - 4}
 </Badge>
 )}
 </div>
 </div>
 )}
 
 {entry.achievements.length > 0 && (
 <div>
 <h4 className="text-sm font-medium mb-xs">Achievements</h4>
 <div className="space-y-xs">
 {entry.achievements.slice(0, 2).map((achievement, index) => (
 <div key={index} className="flex items-start gap-xs">
 <Award className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
 <span className="text-xs text-muted-foreground">{achievement}</span>
 </div>
 ))}
 {entry.achievements.length > 2 && (
 <span className="text-xs text-muted-foreground">
 +{entry.achievements.length - 2} more
 </span>
 )}
 </div>
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="flex items-center justify-between pt-md border-t">
 <div className="flex items-center gap-xs">
 {entry.tags.slice(0, 3).map((tag, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 {entry.tags.length > 3 && (
 <span className="text-xs text-muted-foreground">
 +{entry.tags.length - 3}
 </span>
 )}
 </div>
 
 <div className="flex items-center gap-md text-xs text-muted-foreground">
 {entry.industry && (
 <span>{entry.industry}</span>
 )}
 {entry.supervisor_name && (
 <span>Manager: {entry.supervisor_name}</span>
 )}
 </div>
 </div>
 </Card>
 </div>

 {/* Connection line to next entry */}
 {!isLast && (
 <div className="absolute left-8 top-smxl w-0.5 h-icon-lg bg-border" />
 )}
 </div>
 );
 })}
 </div>
 ))}
 </div>
 </div>
 );
}
