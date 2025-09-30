'use client';

import { MapPin, Calendar, Building, Award, ExternalLink, Download, Printer, Share, GraduationCap, Briefcase, Heart, Star, Phone, Mail, Globe, DollarSign } from "lucide-react";
import { useMemo } from 'react';
import {
 Card,
 Badge,
 Button,
 Separator,
} from '@ghxstship/ui';
import type { HistoryEntry, HistoryEntryType } from '../types';

interface HistoryResumeViewProps {
 entries: HistoryEntry[];
 userProfile?: {
 full_name?: string;
 email?: string;
 phone_primary?: string;
 location?: string;
 bio?: string;
 website_url?: string;
 linkedin_url?: string;
 };
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
 other: Briefcase,
 };
 return iconMap[type] || Briefcase;
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

const groupEntriesByType = (entries: HistoryEntry[]) => {
 const groups: { [key: string]: HistoryEntry[] } = {};
 
 entries.forEach((entry) => {
 const type = entry.entry_type;
 if (!groups[type]) {
 groups[type] = [];
 }
 groups[type].push(entry);
 });

 // Sort entries within each group by start date (most recent first)
 Object.keys(groups).forEach((type) => {
 groups[type].sort((a, b) => {
 if (a.is_current && !b.is_current) return -1;
 if (!a.is_current && b.is_current) return 1;
 return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
 });
 });

 return groups;
};

const getSectionTitle = (type: HistoryEntryType) => {
 const titleMap = {
 employment: 'Professional Experience',
 education: 'Education',
 project: 'Projects',
 achievement: 'Achievements & Awards',
 certification: 'Certifications',
 volunteer: 'Volunteer Experience',
 internship: 'Internships',
 freelance: 'Freelance Work',
 other: 'Other Experience',
 };
 return titleMap[type] || 'Experience';
};

const getSectionOrder = (type: HistoryEntryType) => {
 const orderMap = {
 employment: 1,
 internship: 2,
 freelance: 3,
 education: 4,
 certification: 5,
 project: 6,
 achievement: 7,
 volunteer: 8,
 other: 9,
 };
 return orderMap[type] || 10;
};

export default function HistoryResumeView({
 entries,
 userProfile,
 loading = false,
}: HistoryResumeViewProps) {
 const groupedEntries = useMemo(() => {
 const groups = groupEntriesByType(entries);
 
 // Sort groups by priority
 return Object.entries(groups).sort(([a], [b]) => {
 return getSectionOrder(a as HistoryEntryType) - getSectionOrder(b as HistoryEntryType);
 });
 }, [entries]);

 const allSkills = useMemo(() => {
 const skillsSet = new Set<string>();
 entries.forEach((entry) => {
 entry.skills_gained.forEach((skill) => skillsSet.add(skill));
 });
 return Array.from(skillsSet);
 }, [entries]);

 if (loading) {
 return (
 <div className="max-w-4xl mx-auto">
 <Card className="p-xl animate-pulse">
 <div className="space-y-lg">
 <div className="h-8 bg-muted rounded w-1/3" />
 <div className="h-4 bg-muted rounded w-1/2" />
 <div className="space-y-md">
 {Array.from({ length: 5 }).map((_, i) => (
 <div key={i} className="space-y-sm">
 <div className="h-4 bg-muted rounded w-1/4" />
 <div className="h-3 bg-muted rounded w-full" />
 <div className="h-3 bg-muted rounded w-3/4" />
 </div>
 ))}
 </div>
 </div>
 </Card>
 </div>
 );
 }

 const handlePrint = () => {
 window.print();
 };

 const handleDownload = () => {
 // In a real implementation, this would generate a PDF
 };

 const handleShare = () => {
 if (navigator.share) {
 navigator.share({
 title: `${userProfile?.full_name || 'Professional'} Resume`,
 text: 'Check out my professional resume',
 url: window.location.href,
 });
 } else {
 navigator.clipboard.writeText(window.location.href);
 }
 };

 return (
 <div className="max-w-4xl mx-auto">
 {/* Action buttons */}
 <div className="flex justify-end gap-sm mb-lg print:hidden">
 <Button variant="outline" size="sm" onClick={handleShare}>
 <Share className="h-4 w-4 mr-xs" />
 Share
 </Button>
 <Button variant="outline" size="sm" onClick={handleDownload}>
 <Download className="h-4 w-4 mr-xs" />
 Download PDF
 </Button>
 <Button variant="outline" size="sm" onClick={handlePrint}>
 <Printer className="h-4 w-4 mr-xs" />
 Print
 </Button>
 </div>

 <Card className="p-xl print:shadow-none print:border-none">
 {/* Header */}
 <div className="text-center mb-xl">
 <h1 className="text-3xl font-bold mb-sm">
 {userProfile?.full_name || 'Professional Resume'}
 </h1>
 
 <div className="flex flex-wrap justify-center gap-md text-muted-foreground mb-md">
 {userProfile?.email && (
 <div className="flex items-center gap-xs">
 <Mail className="h-4 w-4" />
 <span>{userProfile.email}</span>
 </div>
 )}
 {userProfile?.phone_primary && (
 <div className="flex items-center gap-xs">
 <Phone className="h-4 w-4" />
 <span>{userProfile.phone_primary}</span>
 </div>
 )}
 {userProfile?.location && (
 <div className="flex items-center gap-xs">
 <MapPin className="h-4 w-4" />
 <span>{userProfile.location}</span>
 </div>
 )}
 {userProfile?.website_url && (
 <div className="flex items-center gap-xs">
 <Globe className="h-4 w-4" />
 <a 
 href={userProfile.website_url as any as any} 
 target="_blank" 
 rel="noopener noreferrer"
 className="hover:underline"
 >
 Website
 </a>
 </div>
 )}
 </div>

 {userProfile?.bio && (
 <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
 {userProfile.bio}
 </p>
 )}
 </div>

 <Separator className="mb-xl" />

 {/* Skills Summary */}
 {allSkills.length > 0 && (
 <div className="mb-xl">
 <h2 className="text-xl font-bold mb-md flex items-center gap-sm">
 <Star className="h-5 w-5" />
 Core Skills
 </h2>
 <div className="flex flex-wrap gap-sm">
 {allSkills.map((skill, index) => (
 <Badge key={index} variant="secondary" className="print:border print:border-gray-300">
 {skill}
 </Badge>
 ))}
 </div>
 </div>
 )}

 {/* Experience Sections */}
 {groupedEntries.map(([type, typeEntries]) => {
 const SectionIcon = getEntryTypeIcon(type as HistoryEntryType);
 
 return (
 <div key={type} className="mb-xl">
 <h2 className="text-xl font-bold mb-lg flex items-center gap-sm">
 <SectionIcon className="h-5 w-5" />
 {getSectionTitle(type as HistoryEntryType)}
 </h2>

 <div className="space-y-lg">
 {typeEntries.map((entry, index) => (
 <div key={entry.id} className="relative">
 {/* Entry header */}
 <div className="flex justify-between items-start mb-sm">
 <div className="flex-1">
 <h3 className="text-lg font-semibold">
 {entry.title}
 {entry.is_current && (
 <Badge variant="primary" className="ml-sm text-xs">
 Current
 </Badge>
 )}
 </h3>
 {entry.organization && (
 <div className="flex items-center gap-xs text-muted-foreground mb-xs">
 <Building className="h-4 w-4" />
 <span className="font-medium">{entry.organization}</span>
 {entry.location && (
 <>
 <span>•</span>
 <span>{entry.location}</span>
 </>
 )}
 </div>
 )}
 </div>
 
 <div className="text-right text-muted-foreground">
 <div className="flex items-center gap-xs">
 <Calendar className="h-4 w-4" />
 <span className="font-medium">
 {formatDateRange(entry.start_date, entry.end_date, entry.is_current)}
 </span>
 </div>
 {entry.salary_range && (
 <div className="flex items-center gap-xs mt-xs">
 <DollarSign className="h-4 w-4" />
 <span className="text-sm">{entry.salary_range}</span>
 </div>
 )}
 </div>
 </div>

 {/* Entry description */}
 {entry.description && (
 <p className="text-muted-foreground mb-md leading-relaxed">
 {entry.description}
 </p>
 )}

 {/* Achievements */}
 {entry.achievements.length > 0 && (
 <div className="mb-md">
 <h4 className="font-medium mb-xs">Key Achievements:</h4>
 <ul className="list-disc list-inside space-y-xs text-muted-foreground">
 {entry.achievements.map((achievement, achievementIndex) => (
 <li key={achievementIndex}>{achievement}</li>
 ))}
 </ul>
 </div>
 )}

 {/* Skills for this entry */}
 {entry.skills_gained.length > 0 && (
 <div className="mb-md">
 <h4 className="font-medium mb-xs">Skills & Technologies:</h4>
 <div className="flex flex-wrap gap-xs">
 {entry.skills_gained.map((skill, skillIndex) => (
 <Badge 
 key={skillIndex} 
 variant="outline" 
 className="text-xs print:border print:border-gray-300"
 >
 {skill}
 </Badge>
 ))}
 </div>
 </div>
 )}

 {/* Additional info */}
 <div className="flex flex-wrap gap-md text-sm text-muted-foreground">
 {entry.employment_type && (
 <span className="capitalize">
 {entry.employment_type.replace('_', ' ')}
 </span>
 )}
 {entry.education_level && (
 <span className="capitalize">
 {entry.education_level.replace('_', ' ')}
 </span>
 )}
 {entry.grade_gpa && (
 <span>GPA: {entry.grade_gpa}</span>
 )}
 {entry.project_status && (
 <span className="capitalize">
 Status: {entry.project_status.replace('_', ' ')}
 </span>
 )}
 {entry.website_url && (
 <a 
 href={entry.website_url as any as any} 
 target="_blank" 
 rel="noopener noreferrer"
 className="flex items-center gap-xs hover:underline"
 >
 <ExternalLink className="h-3 w-3" />
 View Project
 </a>
 )}
 </div>

 {/* Separator between entries */}
 {index < typeEntries.length - 1 && (
 <Separator className="mt-lg" />
 )}
 </div>
 ))}
 </div>
 </div>
 );
 })}

 {/* Footer */}
 <div className="text-center text-sm text-muted-foreground mt-xl pt-lg border-t print:border-gray-300">
 <p>
 Generated on {new Date().toLocaleDateString('en-US', { 
 year: 'numeric', 
 month: 'long', 
 day: 'numeric' 
 })}
 </p>
 </div>
 </Card>
 </div>
 );
}
