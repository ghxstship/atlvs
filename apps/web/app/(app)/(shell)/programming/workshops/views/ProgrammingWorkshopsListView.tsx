'use client';

import { MoreHorizontal, Edit, Eye, Trash2, ChevronDown, ChevronRight, Calendar, Users, Clock, MapPin, DollarSign, Award } from "lucide-react";
import { useState } from 'react';
import {
 Badge,
 Button,
 Card,
 Checkbox,
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
 Collapsible,
 CollapsibleContent,
 CollapsibleTrigger
} from '@ghxstship/ui';

import type { ProgrammingWorkshop, WorkshopSort } from '../types';

interface ProgrammingWorkshopsListViewProps {
 workshops: ProgrammingWorkshop[];
 loading: boolean;
 selectedWorkshops: string[];
 onSelectionChange: (selected: string[]) => void;
 onEdit: (workshop: ProgrammingWorkshop) => void;
 onView: (workshop: ProgrammingWorkshop) => void;
 onDelete: (workshopId: string) => void;
 sort: WorkshopSort;
 onSortChange: (sort: WorkshopSort) => void;
}

const STATUS_BADGE_CONFIG = {
 planning: { label: 'Planning', variant: 'secondary' as const },
 open_registration: { label: 'Open Registration', variant: 'success' as const },
 registration_closed: { label: 'Registration Closed', variant: 'warning' as const },
 full: { label: 'Full', variant: 'destructive' as const },
 in_progress: { label: 'In Progress', variant: 'info' as const },
 completed: { label: 'Completed', variant: 'success' as const },
 cancelled: { label: 'Cancelled', variant: 'destructive' as const },
 postponed: { label: 'Postponed', variant: 'warning' as const }
};

const SKILL_LEVEL_BADGE_CONFIG = {
 beginner: { label: 'Beginner', variant: 'success' as const },
 intermediate: { label: 'Intermediate', variant: 'warning' as const },
 advanced: { label: 'Advanced', variant: 'destructive' as const },
 expert: { label: 'Expert', variant: 'destructive' as const },
 all_levels: { label: 'All Levels', variant: 'default' as const }
};

const CATEGORY_CONFIG = {
 technical: { label: 'Technical', icon: '⚙️' },
 creative: { label: 'Creative', icon: '🎨' },
 business: { label: 'Business', icon: '💼' },
 leadership: { label: 'Leadership', icon: '👑' },
 production: { label: 'Production', icon: '🎬' },
 design: { label: 'Design', icon: '🎨' },
 marketing: { label: 'Marketing', icon: '📢' },
 finance: { label: 'Finance', icon: '💰' },
 legal: { label: 'Legal', icon: '⚖️' },
 other: { label: 'Other', icon: '📚' }
};

const FORMAT_CONFIG = {
 in_person: { label: 'In Person', variant: 'success' as const, icon: '🏢' },
 virtual: { label: 'Virtual', variant: 'info' as const, icon: '💻' },
 hybrid: { label: 'Hybrid', variant: 'warning' as const, icon: '🔄' }
};

export default function ProgrammingWorkshopsListView({
 workshops,
 loading,
 selectedWorkshops,
 onSelectionChange,
 onEdit,
 onView,
 onDelete,
 sort,
 onSortChange
}: ProgrammingWorkshopsListViewProps) {
 const [expandedRows, setExpandedRows] = useState<string[]>([]);

 const handleSelectAll = (checked: boolean) => {
 if (checked) {
 onSelectionChange(workshops.map((workshop) => workshop.id));
 } else {
 onSelectionChange([]);
 }
 };

 const handleSelectWorkshop = (workshopId: string, checked: boolean) => {
 if (checked) {
 onSelectionChange([...selectedWorkshops, workshopId]);
 } else {
 onSelectionChange(selectedWorkshops.filter((id) => id !== workshopId));
 }
 };

 const toggleRowExpansion = (workshopId: string) => {
 setExpandedRows((prev: unknown) =>
 prev.includes(workshopId)
 ? prev.filter((id) => id !== workshopId)
 : [...prev, workshopId]
 );
 };

 const handleSort = (field: keyof ProgrammingWorkshop) => {
 const direction = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
 onSortChange({ field, direction });
 };

 const getSortIcon = (field: keyof ProgrammingWorkshop) => {
 if (sort.field !== field) return null;
 return sort.direction === 'asc' ? '↑' : '↓';
 };

 if (loading) {
 return (
 <Card className="p-xl">
 <div className="flex items-center justify-center">
 <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary"></div>
 <span className="ml-2">Loading workshops...</span>
 </div>
 </Card>
 );
 }

 if (workshops.length === 0) {
 return (
 <Card className="p-xl">
 <div className="text-center">
 <h3 className="text-lg font-semibold">No workshops found</h3>
 <p className="text-muted-foreground">
 No workshops match your current filters. Try adjusting your search criteria.
 </p>
 </div>
 </Card>
 );
 }

 return (
 <Card>
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead className="w-icon-2xl">
 <Checkbox
 checked={selectedWorkshops.length === workshops.length}
 onCheckedChange={handleSelectAll}
 aria-
 />
 </TableHead>
 <TableHead className="w-icon-2xl"></TableHead>
 <TableHead 
 className="cursor-pointer hover:bg-muted/50"
 onClick={() => handleSort('title')}
 >
 Title {getSortIcon('title')}
 </TableHead>
 <TableHead>Category</TableHead>
 <TableHead 
 className="cursor-pointer hover:bg-muted/50"
 onClick={() => handleSort('status')}
 >
 Status {getSortIcon('status')}
 </TableHead>
 <TableHead>Skill Level</TableHead>
 <TableHead>Format</TableHead>
 <TableHead 
 className="cursor-pointer hover:bg-muted/50"
 onClick={() => handleSort('start_date')}
 >
 Start Date {getSortIcon('start_date')}
 </TableHead>
 <TableHead>Participants</TableHead>
 <TableHead>Price</TableHead>
 <TableHead className="w-icon-2xl"></TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {workshops.map((workshop) => {
 const isExpanded = expandedRows.includes(workshop.id);
 const isSelected = selectedWorkshops.includes(workshop.id);

 return (
 <>
 <TableRow key={workshop.id} className={isSelected ? 'bg-muted/50' : ''}>
 <TableCell>
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => handleSelectWorkshop(workshop.id, checked as boolean)}
 aria-label={`Select workshop ${workshop.title}`}
 />
 </TableCell>
 <TableCell>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => toggleRowExpansion(workshop.id)}
 className="h-icon-md w-icon-md p-0"
 >
 {isExpanded ? (
 <ChevronDown className="h-icon-xs w-icon-xs" />
 ) : (
 <ChevronRight className="h-icon-xs w-icon-xs" />
 )}
 </Button>
 </TableCell>
 <TableCell>
 <div className="font-medium">{workshop.title}</div>
 {workshop.description && (
 <div className="text-sm text-muted-foreground line-clamp-xs">
 {workshop.description}
 </div>
 )}
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-xs">
 <span className="text-lg">{CATEGORY_CONFIG[workshop.category]?.icon}</span>
 <span className="text-sm">{CATEGORY_CONFIG[workshop.category]?.label}</span>
 </div>
 </TableCell>
 <TableCell>
 <Badge variant={STATUS_BADGE_CONFIG[workshop.status]?.variant}>
 {STATUS_BADGE_CONFIG[workshop.status]?.label}
 </Badge>
 </TableCell>
 <TableCell>
 <Badge variant={SKILL_LEVEL_BADGE_CONFIG[workshop.skill_level]?.variant}>
 {SKILL_LEVEL_BADGE_CONFIG[workshop.skill_level]?.label}
 </Badge>
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-xs">
 <span>{FORMAT_CONFIG[workshop.format]?.icon}</span>
 <Badge variant={FORMAT_CONFIG[workshop.format]?.variant}>
 {FORMAT_CONFIG[workshop.format]?.label}
 </Badge>
 </div>
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-xs">
 <Calendar className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="text-sm">
 {new Date(workshop.start_date).toLocaleDateString()}
 </span>
 </div>
 {workshop.duration_minutes && (
 <div className="flex items-center gap-xs text-xs text-muted-foreground">
 <Clock className="h-3 w-3" />
 <span>{workshop.duration_minutes}min</span>
 </div>
 )}
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-xs">
 <Users className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="text-sm">
 {workshop.current_participants}
 {workshop.max_participants && `/${workshop.max_participants}`}
 </span>
 </div>
 {workshop.waitlist_count > 0 && (
 <div className="text-xs text-muted-foreground">
 +{workshop.waitlist_count} waitlist
 </div>
 )}
 </TableCell>
 <TableCell>
 {workshop.price ? (
 <div className="flex items-center gap-xs">
 <DollarSign className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="text-sm">
 {workshop.currency || '$'}{workshop.price}
 </span>
 </div>
 ) : (
 <Badge variant="outline" className="text-xs">Free</Badge>
 )}
 {workshop.early_bird_price && (
 <div className="text-xs text-muted-foreground">
 Early: {workshop.currency || '$'}{workshop.early_bird_price}
 </div>
 )}
 </TableCell>
 <TableCell>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="sm" className="h-icon-lg w-icon-lg p-0">
 <MoreHorizontal className="h-icon-xs w-icon-xs" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuItem onClick={() => onView(workshop)}>
 <Eye className="mr-2 h-icon-xs w-icon-xs" />
 View
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => onEdit(workshop)}>
 <Edit className="mr-2 h-icon-xs w-icon-xs" />
 Edit
 </DropdownMenuItem>
 <DropdownMenuItem
 onClick={() => onDelete(workshop.id)}
 className="text-destructive"
 >
 <Trash2 className="mr-2 h-icon-xs w-icon-xs" />
 Delete
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </TableCell>
 </TableRow>

 {/* Expanded Row Content */}
 {isExpanded && (
 <TableRow>
 <TableCell colSpan={11} className="bg-muted/25">
 <div className="p-md space-y-md">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {/* Location & Venue */}
 {(workshop.location || workshop.venue || workshop.virtual_link) && (
 <div>
 <h4 className="font-semibold mb-2">Location</h4>
 <div className="space-y-xs text-sm">
 {workshop.venue && (
 <div className="flex items-center gap-xs">
 <MapPin className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span>{workshop.venue}</span>
 </div>
 )}
 {workshop.location && (
 <div>{workshop.location}</div>
 )}
 {workshop.virtual_link && (
 <div>
 <a 
 href={workshop.virtual_link as any as any} 
 target="_blank" 
 rel="noopener noreferrer"
 className="text-blue-600 hover:underline"
 >
 Virtual Link
 </a>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Project & Event */}
 {(workshop.project || workshop.event) && (
 <div>
 <h4 className="font-semibold mb-2">Associated</h4>
 <div className="space-y-xs text-sm">
 {workshop.project && (
 <div>
 <span className="text-muted-foreground">Project: </span>
 <Badge variant="outline">{workshop.project.name}</Badge>
 </div>
 )}
 {workshop.event && (
 <div>
 <span className="text-muted-foreground">Event: </span>
 <Badge variant="outline">{workshop.event.title}</Badge>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Instructor */}
 {workshop.primary_instructor && (
 <div>
 <h4 className="font-semibold mb-2">Instructor</h4>
 <div className="text-sm">
 {workshop.primary_instructor.full_name || workshop.primary_instructor.email}
 </div>
 </div>
 )}

 {/* Registration */}
 {(workshop.registration_opens_at || workshop.registration_deadline) && (
 <div>
 <h4 className="font-semibold mb-2">Registration</h4>
 <div className="space-y-xs text-sm">
 {workshop.registration_opens_at && (
 <div>
 Opens: {new Date(workshop.registration_opens_at).toLocaleDateString()}
 </div>
 )}
 {workshop.registration_deadline && (
 <div>
 Deadline: {new Date(workshop.registration_deadline).toLocaleDateString()}
 </div>
 )}
 </div>
 </div>
 )}

 {/* Certification */}
 {workshop.certification_available && (
 <div>
 <h4 className="font-semibold mb-2">Certification</h4>
 <div className="flex items-center gap-xs">
 <Award className="h-icon-xs w-icon-xs text-yellow-600" />
 <span className="text-sm">Certificate Available</span>
 </div>
 {workshop.certification_criteria && (
 <div className="text-xs text-muted-foreground mt-1">
 {workshop.certification_criteria}
 </div>
 )}
 </div>
 )}

 {/* Assessment */}
 {workshop.has_assessment && (
 <div>
 <h4 className="font-semibold mb-2">Assessment</h4>
 <div className="text-sm">
 Type: {workshop.assessment_type || 'Not specified'}
 </div>
 </div>
 )}
 </div>

 {/* Objectives */}
 {workshop.objectives && workshop.objectives.length > 0 && (
 <div>
 <h4 className="font-semibold mb-2">Learning Objectives</h4>
 <ul className="text-sm list-disc list-inside space-y-xs">
 {workshop.objectives.map((objective, index) => (
 <li key={index}>{objective}</li>
 ))}
 </ul>
 </div>
 )}

 {/* Prerequisites */}
 {workshop.prerequisites && workshop.prerequisites.length > 0 && (
 <div>
 <h4 className="font-semibold mb-2">Prerequisites</h4>
 <ul className="text-sm list-disc list-inside space-y-xs">
 {workshop.prerequisites.map((prerequisite, index) => (
 <li key={index}>{prerequisite}</li>
 ))}
 </ul>
 </div>
 )}

 {/* Materials */}
 {((workshop.materials_provided && workshop.materials_provided.length > 0) ||
 (workshop.materials_required && workshop.materials_required.length > 0)) && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 {workshop.materials_provided && workshop.materials_provided.length > 0 && (
 <div>
 <h4 className="font-semibold mb-2">Materials Provided</h4>
 <ul className="text-sm list-disc list-inside space-y-xs">
 {workshop.materials_provided.map((material, index) => (
 <li key={index}>{material}</li>
 ))}
 </ul>
 </div>
 )}
 {workshop.materials_required && workshop.materials_required.length > 0 && (
 <div>
 <h4 className="font-semibold mb-2">Materials Required</h4>
 <ul className="text-sm list-disc list-inside space-y-xs">
 {workshop.materials_required.map((material, index) => (
 <li key={index}>{material}</li>
 ))}
 </ul>
 </div>
 )}
 </div>
 )}

 {/* Tags */}
 {workshop.tags && workshop.tags.length > 0 && (
 <div>
 <h4 className="font-semibold mb-2">Tags</h4>
 <div className="flex flex-wrap gap-xs">
 {workshop.tags.map((tag, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 </div>
 </div>
 )}
 </div>
 </TableCell>
 </TableRow>
 )}
 </>
 );
 })}
 </TableBody>
 </Table>
 </Card>
 );
}
