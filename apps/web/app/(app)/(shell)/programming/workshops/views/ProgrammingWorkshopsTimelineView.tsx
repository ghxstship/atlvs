'use client';

import { MoreHorizontal, Edit, Eye, Calendar, Users, Clock, MapPin, DollarSign, Award, User } from "lucide-react";
import {
 Badge,
 Button,
 Card,
 CardContent,
 CardHeader,
 CardTitle,
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from '@ghxstship/ui';

import type { ProgrammingWorkshop } from '../types';

interface ProgrammingWorkshopsTimelineViewProps {
 workshops: ProgrammingWorkshop[];
 loading: boolean;
 onEdit: (workshop: ProgrammingWorkshop) => void;
 onView: (workshop: ProgrammingWorkshop) => void;
}

const STATUS_BADGE_CONFIG = {
 planning: { label: 'Planning', variant: 'secondary' as const },
 open_registration: { label: 'Open Registration', variant: 'success' as const },
 registration_closed: { label: 'Registration Closed', variant: 'warning' as const },
 full: { label: 'Full', variant: 'destructive' as const },
 in_progress: { label: 'In Progress', variant: 'info' as const },
 completed: { label: 'Completed', variant: 'success' as const },
 cancelled: { label: 'Cancelled', variant: 'destructive' as const },
 postponed: { label: 'Postponed', variant: 'warning' as const },
};

const SKILL_LEVEL_BADGE_CONFIG = {
 beginner: { label: 'Beginner', variant: 'success' as const },
 intermediate: { label: 'Intermediate', variant: 'warning' as const },
 advanced: { label: 'Advanced', variant: 'destructive' as const },
 expert: { label: 'Expert', variant: 'destructive' as const },
 all_levels: { label: 'All Levels', variant: 'default' as const },
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
 other: { label: 'Other', icon: '📚' },
};

const FORMAT_CONFIG = {
 in_person: { label: 'In Person', variant: 'success' as const, icon: '🏢' },
 virtual: { label: 'Virtual', variant: 'info' as const, icon: '💻' },
 hybrid: { label: 'Hybrid', variant: 'warning' as const, icon: '🔄' },
};

interface GroupedWorkshops {
 [key: string]: ProgrammingWorkshop[];
}

export default function ProgrammingWorkshopsTimelineView({
 workshops,
 loading,
 onEdit,
 onView,
}: ProgrammingWorkshopsTimelineViewProps) {
 // Group workshops by month and year
 const groupedWorkshops: GroupedWorkshops = workshops.reduce((groups, workshop) => {
 const date = new Date(workshop.start_date);
 const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
 
 if (!groups[key]) {
 groups[key] = [];
 }
 groups[key].push(workshop);
 return groups;
 }, {} as GroupedWorkshops);

 // Sort groups by date
 const sortedGroups = Object.entries(groupedWorkshops).sort(([keyA], [keyB]) => {
 const dateA = new Date(keyA + ' 1');
 const dateB = new Date(keyB + ' 1');
 return dateA.getTime() - dateB.getTime();
 });

 if (loading) {
 return (
 <div className="space-y-8">
 {Array.from({ length: 3 }).map((_, index) => (
 <div key={index} className="space-y-4">
 <div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div>
 <div className="space-y-3">
 {Array.from({ length: 2 }).map((_, workshopIndex) => (
 <Card key={workshopIndex} className="animate-pulse">
 <CardHeader>
 <div className="h-4 bg-muted rounded w-3/4"></div>
 <div className="h-3 bg-muted rounded w-1/2"></div>
 </CardHeader>
 <CardContent>
 <div className="h-3 bg-muted rounded"></div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 ))}
 </div>
 );
 }

 if (workshops.length === 0) {
 return (
 <Card className="p-8">
 <div className="text-center">
 <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
 <h3 className="text-lg font-semibold">No workshops found</h3>
 <p className="text-muted-foreground">
 No workshops match your current filters. Try adjusting your search criteria.
 </p>
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-8">
 {sortedGroups.map(([groupKey, groupWorkshops]) => {
 const totalParticipants = groupWorkshops.reduce((sum, w) => sum + w.current_participants, 0);
 const totalCapacity = groupWorkshops.reduce((sum, w) => sum + (w.max_participants || 0), 0);

 return (
 <div key={groupKey} className="space-y-4">
 {/* Group Header */}
 <div className="flex items-center gap-4">
 <div className="flex-1">
 <h3 className="text-lg font-semibold flex items-center gap-2">
 <Calendar className="h-5 w-5" />
 {groupKey}
 </h3>
 <p className="text-sm text-muted-foreground mt-1">
 {groupWorkshops.length} workshop{groupWorkshops.length !== 1 ? 's' : ''} • 
 {totalParticipants} participants
 {totalCapacity > 0 && ` of ${totalCapacity} capacity`}
 </p>
 </div>
 <Badge variant="outline">
 {groupWorkshops.length} workshop{groupWorkshops.length !== 1 ? 's' : ''}
 </Badge>
 </div>

 {/* Timeline Items */}
 <div className="relative">
 {/* Timeline Line */}
 <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

 <div className="space-y-6">
 {groupWorkshops
 .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
 .map((workshop, index) => {
 const categoryConfig = CATEGORY_CONFIG[workshop.category];
 const statusConfig = STATUS_BADGE_CONFIG[workshop.status];
 const skillLevelConfig = SKILL_LEVEL_BADGE_CONFIG[workshop.skill_level];
 const formatConfig = FORMAT_CONFIG[workshop.format];

 return (
 <div key={workshop.id} className="relative flex gap-4">
 {/* Timeline Dot */}
 <div className="relative z-10">
 <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-background bg-card shadow">
 <span className="text-lg">{categoryConfig.icon}</span>
 </div>
 </div>

 {/* Content */}
 <Card className="flex-1">
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-2">
 <Badge variant="outline" className="text-xs">
 {categoryConfig.label}
 </Badge>
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 <Badge variant={skillLevelConfig.variant} className="text-xs">
 {skillLevelConfig.label}
 </Badge>
 <div className="flex items-center gap-1">
 <span className="text-xs">{formatConfig.icon}</span>
 <Badge variant={formatConfig.variant} className="text-xs">
 {formatConfig.label}
 </Badge>
 </div>
 </div>
 <h4 className="font-semibold">{workshop.title}</h4>
 {workshop.description && (
 <p className="text-sm text-muted-foreground mt-1">
 {workshop.description}
 </p>
 )}
 </div>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
 <MoreHorizontal className="h-4 w-4" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuItem onClick={() => onView(workshop)}>
 <Eye className="mr-2 h-4 w-4" />
 View
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => onEdit(workshop)}>
 <Edit className="mr-2 h-4 w-4" />
 Edit
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </CardHeader>

 <CardContent>
 <div className="space-y-3">
 {/* Date and Time */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
 <div className="space-y-1">
 <div className="flex items-center gap-1">
 <Calendar className="h-4 w-4 text-muted-foreground" />
 <span className="font-medium">
 {new Date(workshop.start_date).toLocaleDateString()}
 </span>
 </div>
 {workshop.end_date && workshop.end_date !== workshop.start_date && (
 <div className="text-muted-foreground text-xs">
 to {new Date(workshop.end_date).toLocaleDateString()}
 </div>
 )}
 {workshop.duration_minutes && (
 <div className="flex items-center gap-1 text-xs text-muted-foreground">
 <Clock className="h-3 w-3" />
 <span>{workshop.duration_minutes} minutes</span>
 </div>
 )}
 </div>

 {/* Participants and Capacity */}
 <div className="space-y-1">
 <div className="flex items-center gap-1">
 <Users className="h-4 w-4 text-muted-foreground" />
 <span>
 {workshop.current_participants}
 {workshop.max_participants && `/${workshop.max_participants}`}
 {' '}participants
 </span>
 </div>
 {workshop.waitlist_count > 0 && (
 <div className="text-xs text-muted-foreground">
 +{workshop.waitlist_count} on waitlist
 </div>
 )}
 {workshop.registration_deadline && (
 <div className="text-xs text-muted-foreground">
 Reg. deadline: {new Date(workshop.registration_deadline).toLocaleDateString()}
 </div>
 )}
 </div>

 {/* Location and Price */}
 <div className="space-y-1">
 {(workshop.location || workshop.venue) && (
 <div className="flex items-center gap-1">
 <MapPin className="h-4 w-4 text-muted-foreground" />
 <span className="text-sm truncate">
 {workshop.venue || workshop.location}
 </span>
 </div>
 )}
 {workshop.price ? (
 <div className="flex items-center gap-1">
 <DollarSign className="h-4 w-4 text-muted-foreground" />
 <span>
 {workshop.currency || '$'}{workshop.price}
 {workshop.early_bird_price && (
 <span className="text-muted-foreground text-xs ml-1">
 (Early: {workshop.currency || '$'}{workshop.early_bird_price})
 </span>
 )}
 </span>
 </div>
 ) : (
 <Badge variant="outline" className="text-xs">Free</Badge>
 )}
 </div>
 </div>

 {/* Instructor */}
 {workshop.primary_instructor && (
 <div>
 <h5 className="text-sm font-medium mb-1">Instructor</h5>
 <div className="flex items-center gap-1 text-sm">
 <User className="h-4 w-4 text-muted-foreground" />
 <span>
 {workshop.primary_instructor.full_name || workshop.primary_instructor.email}
 </span>
 </div>
 </div>
 )}

 {/* Project & Event */}
 {(workshop.project || workshop.event) && (
 <div>
 <h5 className="text-sm font-medium mb-1">Associated</h5>
 <div className="flex flex-wrap gap-2">
 {workshop.project && (
 <div className="flex items-center gap-1">
 <span className="text-xs text-muted-foreground">Project:</span>
 <Badge variant="outline" className="text-xs">
 {workshop.project.name}
 </Badge>
 </div>
 )}
 {workshop.event && (
 <div className="flex items-center gap-1">
 <span className="text-xs text-muted-foreground">Event:</span>
 <Badge variant="outline" className="text-xs">
 {workshop.event.title}
 </Badge>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Learning Objectives */}
 {workshop.objectives && workshop.objectives.length > 0 && (
 <div>
 <h5 className="text-sm font-medium mb-1">Learning Objectives</h5>
 <ul className="text-sm list-disc list-inside space-y-1 text-muted-foreground">
 {workshop.objectives.slice(0, 3).map((objective, index) => (
 <li key={index}>{objective}</li>
 ))}
 {workshop.objectives.length > 3 && (
 <li className="text-xs">
 +{workshop.objectives.length - 3} more objectives
 </li>
 )}
 </ul>
 </div>
 )}

 {/* Features */}
 <div className="flex flex-wrap gap-2">
 {workshop.certification_available && (
 <Badge variant="outline" className="text-xs">
 <Award className="h-3 w-3 mr-1" />
 Certificate Available
 </Badge>
 )}
 {workshop.has_assessment && (
 <Badge variant="outline" className="text-xs">
 📝 Assessment
 </Badge>
 )}
 {workshop.materials_provided && workshop.materials_provided.length > 0 && (
 <Badge variant="outline" className="text-xs">
 📦 Materials Provided
 </Badge>
 )}
 {workshop.recording_url && (
 <Badge variant="outline" className="text-xs">
 🎥 Recording Available
 </Badge>
 )}
 </div>

 {/* Tags */}
 {workshop.tags && workshop.tags.length > 0 && (
 <div>
 <h5 className="text-sm font-medium mb-1">Tags</h5>
 <div className="flex flex-wrap gap-1">
 {workshop.tags.slice(0, 5).map((tag, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 {workshop.tags.length > 5 && (
 <Badge variant="outline" className="text-xs">
 +{workshop.tags.length - 5} more
 </Badge>
 )}
 </div>
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 );
 })}
 </div>
 );
}
