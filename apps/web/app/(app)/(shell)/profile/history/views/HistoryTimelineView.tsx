'use client';

import { ArrowDown, Award, Briefcase, Building, Calendar, CheckCircle, Circle, Clock, DollarSign, Edit, ExternalEdit, ExternalLink, Eye, GraduationCap, Heart, MapPin, Pause, Star, Trash2, X } from 'lucide-react';
import { useMemo } from 'react';
import {
 Card,
 Badge,
 Button,
 Avatar,
 AvatarFallback
} from '@ghxstship/ui';
import type { HistoryEntry, HistoryEntryType, EmploymentType, EducationLevel, ProjectStatus } from '../types';

interface HistoryTimelineViewProps {
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

export default function HistoryTimelineView({
 entries,
 selectedIds,
 onSelect,
 onEdit,
 onDelete,
 onView,
 loading = false
}: HistoryTimelineViewProps) {
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
 const grouped: { [year: string]: HistoryEntry[] } = {};
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
 <h3 className="text-lg font-semibold mb-sm">No History Entries</h3>
 <p className="text-muted-foreground mb-lg max-w-md">
 Start building your professional timeline by adding your work experience, education, projects, and achievements.
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
 {timelineEntries[year].length} entr{timelineEntries[year].length === 1 ? 'y' : 'ies'}
 </p>
 </div>
 </div>

 {/* Year entries */}
 {timelineEntries[year].map((entry, entryIndex) => {
 const EntryIcon = getEntryTypeIcon(entry.entry_type);
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
 <AvatarFallback className={`bg-${getEntryTypeColor(entry.entry_type)}-100 text-${getEntryTypeColor(entry.entry_type)}-600`}>
 <EntryIcon className="h-icon-md w-icon-md" />
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
 <Badge variant="secondary">
 {entry.entry_type.replace('_', ' ').toUpperCase()}
 </Badge>
 {entry.is_current && (
 <Badge variant="primary">Current</Badge>
 )}
 </div>
 <h3 className="font-semibold text-lg mb-xs">
 {entry.title}
 </h3>
 {entry.organization && (
 <div className="flex items-center gap-xs text-muted-foreground mb-xs">
 <Building className="h-icon-xs w-icon-xs" />
 <span>{entry.organization}</span>
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
 </div>

 {/* Description */}
 {entry.description && (
 <p className="text-muted-foreground mb-md">
 {entry.description}
 </p>
 )}

 {/* Skills and Achievements */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
 {entry.skills_gained.length > 0 && (
 <div>
 <h4 className="text-sm font-medium mb-xs">Skills Gained</h4>
 <div className="flex flex-wrap gap-xs">
 {entry.skills_gained.map((skill, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {skill}
 </Badge>
 ))}
 </div>
 </div>
 )}
 
 {entry.achievements.length > 0 && (
 <div>
 <h4 className="text-sm font-medium mb-xs">Achievements</h4>
 <div className="space-y-xs">
 {entry.achievements.map((achievement, index) => (
 <div key={index} className="flex items-start gap-xs">
 <Award className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
 <span className="text-xs text-muted-foreground">{achievement}</span>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="flex items-center justify-between pt-md border-t">
 <div className="flex items-center gap-xs">
 {entry.tags.map((tag, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 </div>
 
 <div className="flex items-center gap-xs">
 {entry.salary_range && (
 <div className="flex items-center gap-xs text-xs text-muted-foreground">
 <DollarSign className="h-3 w-3" />
 <span>{entry.salary_range}</span>
 </div>
 )}
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
