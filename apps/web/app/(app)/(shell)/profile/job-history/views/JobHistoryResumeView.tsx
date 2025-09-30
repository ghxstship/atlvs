'use client';

import { MapPin, Calendar, Building, Award, Download, Printer, Share, Briefcase, Users, Phone, Mail, Globe, DollarSign, CheckCircle } from "lucide-react";
import { useMemo } from 'react';
import {
 Card,
 Badge,
 Button,
 Separator,
} from '@ghxstship/ui';
import type { JobHistoryEntry, EmploymentType, CompanySize } from '../types';

interface JobHistoryResumeViewProps {
 entries: JobHistoryEntry[];
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
 startup: 'Startup',
 small: 'Small Company',
 medium: 'Medium Company',
 large: 'Large Company',
 enterprise: 'Enterprise',
 };
 return labelMap[size] || size;
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

export default function JobHistoryResumeView({
 entries,
 userProfile,
 loading = false,
}: JobHistoryResumeViewProps) {
 const sortedEntries = useMemo(() => {
 return [...entries].sort((a, b) => {
 // Current entries first
 if (a.is_current && !b.is_current) return -1;
 if (!a.is_current && b.is_current) return 1;
 
 // Then by start date (most recent first)
 return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
 });
 }, [entries]);

 const allSkills = useMemo(() => {
 const skillsSet = new Set<string>();
 entries.forEach((entry) => {
 entry.skills_used.forEach((skill) => skillsSet.add(skill));
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
 <Briefcase className="h-5 w-5" />
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

 {/* Professional Experience */}
 <div className="mb-xl">
 <h2 className="text-xl font-bold mb-lg flex items-center gap-sm">
 <Briefcase className="h-5 w-5" />
 Professional Experience
 </h2>

 <div className="space-y-lg">
 {sortedEntries.map((entry, index) => (
 <div key={entry.id} className="relative">
 {/* Entry header */}
 <div className="flex justify-between items-start mb-sm">
 <div className="flex-1">
 <h3 className="text-lg font-semibold">
 {entry.job_title}
 {entry.is_current && (
 <Badge variant="primary" className="ml-sm text-xs">
 Current
 </Badge>
 )}
 </h3>
 <div className="flex items-center gap-xs text-muted-foreground mb-xs">
 <Building className="h-4 w-4" />
 <span className="font-medium">{entry.company_name}</span>
 {entry.department && (
 <>
 <span>•</span>
 <Users className="h-4 w-4" />
 <span>{entry.department}</span>
 </>
 )}
 {entry.location && (
 <>
 <span>•</span>
 <MapPin className="h-4 w-4" />
 <span>{entry.location}</span>
 </>
 )}
 </div>
 </div>
 
 <div className="text-right text-muted-foreground">
 <div className="flex items-center gap-xs">
 <Calendar className="h-4 w-4" />
 <span className="font-medium">
 {formatDateRange(entry.start_date, entry.end_date, entry.is_current)}
 </span>
 </div>
 <div className="flex items-center gap-xs mt-xs text-sm">
 <span>{getEmploymentTypeLabel(entry.employment_type)}</span>
 {entry.salary_range && (
 <>
 <span>•</span>
 <DollarSign className="h-3 w-3" />
 <span>{entry.salary_range}</span>
 </>
 )}
 </div>
 </div>
 </div>

 {/* Company info */}
 <div className="flex items-center gap-md text-sm text-muted-foreground mb-md">
 {entry.company_size && (
 <span>{getCompanySizeLabel(entry.company_size)}</span>
 )}
 {entry.industry && (
 <>
 {entry.company_size && <span>•</span>}
 <span>{entry.industry}</span>
 </>
 )}
 {entry.supervisor_name && (
 <>
 <span>•</span>
 <span>Manager: {entry.supervisor_name}</span>
 </>
 )}
 </div>

 {/* Entry description */}
 {entry.description && (
 <p className="text-muted-foreground mb-md leading-relaxed">
 {entry.description}
 </p>
 )}

 {/* Key Responsibilities */}
 {entry.responsibilities.length > 0 && (
 <div className="mb-md">
 <h4 className="font-medium mb-xs">Key Responsibilities:</h4>
 <ul className="list-none space-y-xs text-muted-foreground">
 {entry.responsibilities.map((responsibility, responsibilityIndex) => (
 <li key={responsibilityIndex} className="flex items-start gap-xs">
 <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
 <span>{responsibility}</span>
 </li>
 ))}
 </ul>
 </div>
 )}

 {/* Achievements */}
 {entry.achievements.length > 0 && (
 <div className="mb-md">
 <h4 className="font-medium mb-xs">Key Achievements:</h4>
 <ul className="list-none space-y-xs text-muted-foreground">
 {entry.achievements.map((achievement, achievementIndex) => (
 <li key={achievementIndex} className="flex items-start gap-xs">
 <Award className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
 <span>{achievement}</span>
 </li>
 ))}
 </ul>
 </div>
 )}

 {/* Skills for this position */}
 {entry.skills_used.length > 0 && (
 <div className="mb-md">
 <h4 className="font-medium mb-xs">Technologies & Skills:</h4>
 <div className="flex flex-wrap gap-xs">
 {entry.skills_used.map((skill, skillIndex) => (
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
 {entry.reason_for_leaving && !entry.is_current && (
 <span>Left for: {entry.reason_for_leaving}</span>
 )}
 {entry.tags.length > 0 && (
 <div className="flex items-center gap-xs">
 <span>Tags:</span>
 {entry.tags.map((tag, tagIndex) => (
 <Badge key={tagIndex} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 </div>
 )}
 </div>

 {/* Separator between entries */}
 {index < sortedEntries.length - 1 && (
 <Separator className="mt-lg" />
 )}
 </div>
 ))}
 </div>
 </div>

 {/* Footer */}
 <div className="text-center text-sm text-muted-foreground mt-xl pt-lg border-t print:border-gray-300">
 <p>
 Generated on {new Date().toLocaleDateString('en-US', { 
 year: 'numeric', 
 month: 'long', 
 day: 'numeric' 
 })}
 </p>
 <p className="mt-xs">
 Total Experience: {entries.length} position{entries.length === 1 ? '' : 's'} • 
 Current Roles: {entries.filter(e => e.is_current).length}
 </p>
 </div>
 </Card>
 </div>
 );
}
