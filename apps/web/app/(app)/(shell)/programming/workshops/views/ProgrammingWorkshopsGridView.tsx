'use client';

import { MoreHorizontal, Edit, Eye, Trash2, Calendar, Users, Clock, MapPin, DollarSign, Award, User } from "lucide-react";
import {
 Badge,
 Button,
 Card,
 CardContent,
 CardFooter,
 CardHeader,
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger
} from '@ghxstship/ui';

import type { ProgrammingWorkshop } from '../types';

interface ProgrammingWorkshopsGridViewProps {
 workshops: ProgrammingWorkshop[];
 loading: boolean;
 onEdit: (workshop: ProgrammingWorkshop) => void;
 onView: (workshop: ProgrammingWorkshop) => void;
 onDelete: (workshopId: string) => void;
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
 technical: { label: 'Technical', icon: '⚙️', color: 'bg-blue-100 text-blue-800' },
 creative: { label: 'Creative', icon: '🎨', color: 'bg-pink-100 text-pink-800' },
 business: { label: 'Business', icon: '💼', color: 'bg-gray-100 text-gray-800' },
 leadership: { label: 'Leadership', icon: '👑', color: 'bg-yellow-100 text-yellow-800' },
 production: { label: 'Production', icon: '🎬', color: 'bg-red-100 text-red-800' },
 design: { label: 'Design', icon: '🎨', color: 'bg-purple-100 text-purple-800' },
 marketing: { label: 'Marketing', icon: '📢', color: 'bg-green-100 text-green-800' },
 finance: { label: 'Finance', icon: '💰', color: 'bg-emerald-100 text-emerald-800' },
 legal: { label: 'Legal', icon: '⚖️', color: 'bg-slate-100 text-slate-800' },
 other: { label: 'Other', icon: '📚', color: 'bg-gray-100 text-gray-800' }
};

const FORMAT_CONFIG = {
 in_person: { label: 'In Person', variant: 'success' as const, icon: '🏢' },
 virtual: { label: 'Virtual', variant: 'info' as const, icon: '💻' },
 hybrid: { label: 'Hybrid', variant: 'warning' as const, icon: '🔄' }
};

export default function ProgrammingWorkshopsGridView({
 workshops,
 loading,
 onEdit,
 onView,
 onDelete
}: ProgrammingWorkshopsGridViewProps) {
 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
 {Array.from({ length: 8 }).map((_, index) => (
 <Card key={index} className="animate-pulse">
 <CardHeader>
 <div className="h-icon-xs bg-muted rounded w-3/4"></div>
 <div className="h-3 bg-muted rounded w-1/2"></div>
 </CardHeader>
 <CardContent>
 <div className="space-y-xs">
 <div className="h-3 bg-muted rounded"></div>
 <div className="h-3 bg-muted rounded w-2/3"></div>
 </div>
 </CardContent>
 <CardFooter>
 <div className="h-icon-lg bg-muted rounded w-full"></div>
 </CardFooter>
 </Card>
 ))}
 </div>
 );
 }

 if (workshops.length === 0) {
 return (
 <Card className="p-xl">
 <div className="text-center">
 <Calendar className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-4" />
 <h3 className="text-lg font-semibold">No workshops found</h3>
 <p className="text-muted-foreground">
 No workshops match your current filters. Try adjusting your search criteria.
 </p>
 </div>
 </Card>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
 {workshops.map((workshop) => {
 const categoryConfig = CATEGORY_CONFIG[workshop.category];
 const statusConfig = STATUS_BADGE_CONFIG[workshop.status];
 const skillLevelConfig = SKILL_LEVEL_BADGE_CONFIG[workshop.skill_level];
 const formatConfig = FORMAT_CONFIG[workshop.format];

 return (
 <Card key={workshop.id} className="hover:shadow-md transition-shadow">
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-xs mb-2">
 <div className={`px-xs py-xs rounded-full text-xs font-medium ${categoryConfig.color}`}>
 <span className="mr-1">{categoryConfig.icon}</span>
 {categoryConfig.label}
 </div>
 </div>
 <h3 className="font-semibold text-sm line-clamp-xs">{workshop.title}</h3>
 {workshop.description && (
 <p className="text-xs text-muted-foreground mt-1 line-clamp-xs">
 {workshop.description}
 </p>
 )}
 </div>
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
 </div>
 </CardHeader>

 <CardContent className="py-sm">
 <div className="space-y-sm">
 {/* Status and Skill Level */}
 <div className="flex items-center gap-xs">
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 <Badge variant={skillLevelConfig.variant} className="text-xs">
 {skillLevelConfig.label}
 </Badge>
 </div>

 {/* Format */}
 <div className="flex items-center gap-xs">
 <span>{formatConfig.icon}</span>
 <Badge variant={formatConfig.variant} className="text-xs">
 {formatConfig.label}
 </Badge>
 </div>

 {/* Date and Duration */}
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-xs">
 <Calendar className="h-3 w-3 text-muted-foreground" />
 <span>{new Date(workshop.start_date).toLocaleDateString()}</span>
 {workshop.end_date && workshop.end_date !== workshop.start_date && (
 <span className="text-muted-foreground">
 - {new Date(workshop.end_date).toLocaleDateString()}
 </span>
 )}
 </div>
 {workshop.duration_minutes && (
 <div className="flex items-center gap-xs text-xs text-muted-foreground">
 <Clock className="h-3 w-3" />
 <span>{workshop.duration_minutes} minutes</span>
 </div>
 )}
 </div>

 {/* Participants */}
 <div className="flex items-center gap-xs text-xs">
 <Users className="h-3 w-3 text-muted-foreground" />
 <span>
 {workshop.current_participants}
 {workshop.max_participants && `/${workshop.max_participants}`}
 {' '}participants
 </span>
 {workshop.waitlist_count > 0 && (
 <span className="text-muted-foreground">
 (+{workshop.waitlist_count} waitlist)
 </span>
 )}
 </div>

 {/* Location */}
 {(workshop.location || workshop.venue) && (
 <div className="flex items-center gap-xs text-xs text-muted-foreground">
 <MapPin className="h-3 w-3" />
 <span className="truncate">
 {workshop.venue || workshop.location}
 </span>
 </div>
 )}

 {/* Instructor */}
 {workshop.primary_instructor && (
 <div className="flex items-center gap-xs text-xs">
 <User className="h-3 w-3 text-muted-foreground" />
 <span className="truncate">
 {workshop.primary_instructor.full_name || workshop.primary_instructor.email}
 </span>
 </div>
 )}

 {/* Price */}
 <div className="flex items-center gap-xs text-xs">
 {workshop.price ? (
 <>
 <DollarSign className="h-3 w-3 text-muted-foreground" />
 <span>
 {workshop.currency || '$'}{workshop.price}
 {workshop.early_bird_price && (
 <span className="text-muted-foreground ml-1">
 (Early: {workshop.currency || '$'}{workshop.early_bird_price})
 </span>
 )}
 </span>
 </>
 ) : (
 <Badge variant="outline" className="text-xs">Free</Badge>
 )}
 </div>

 {/* Project & Event */}
 {(workshop.project || workshop.event) && (
 <div className="space-y-xs">
 {workshop.project && (
 <div className="flex items-center gap-xs text-xs">
 <span className="text-muted-foreground">Project:</span>
 <Badge variant="outline" className="text-xs">
 {workshop.project.name}
 </Badge>
 </div>
 )}
 {workshop.event && (
 <div className="flex items-center gap-xs text-xs">
 <span className="text-muted-foreground">Event:</span>
 <Badge variant="outline" className="text-xs">
 {workshop.event.title}
 </Badge>
 </div>
 )}
 </div>
 )}

 {/* Features */}
 <div className="flex flex-wrap gap-xs">
 {workshop.certification_available && (
 <Badge variant="outline" className="text-xs px-xs py-0">
 <Award className="h-3 w-3 mr-1" />
 Cert
 </Badge>
 )}
 {workshop.has_assessment && (
 <Badge variant="outline" className="text-xs px-xs py-0">
 📝 Assessment
 </Badge>
 )}
 {workshop.materials_provided && workshop.materials_provided.length > 0 && (
 <Badge variant="outline" className="text-xs px-xs py-0">
 📦 Materials
 </Badge>
 )}
 {workshop.recording_url && (
 <Badge variant="outline" className="text-xs px-xs py-0">
 🎥 Recorded
 </Badge>
 )}
 </div>
 </div>
 </CardContent>

 <CardFooter className="pt-3">
 <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
 <span>
 {workshop.status === 'open_registration' && workshop.registration_deadline && (
 <>Reg. ends {new Date(workshop.registration_deadline).toLocaleDateString()}</>
 )}
 {workshop.status === 'planning' && (
 <>Planning phase</>
 )}
 {workshop.status === 'completed' && (
 <>Completed {new Date(workshop.end_date || workshop.start_date).toLocaleDateString()}</>
 )}
 </span>
 <div className="flex gap-xs">
 <Button
 variant="outline"
 size="sm"
 onClick={() => onView(workshop)}
 className="h-7 px-xs text-xs"
 >
 <Eye className="h-3 w-3 mr-1" />
 View
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => onEdit(workshop)}
 className="h-7 px-xs text-xs"
 >
 <Edit className="h-3 w-3 mr-1" />
 Edit
 </Button>
 </div>
 </div>
 </CardFooter>
 </Card>
 );
 })}
 </div>
 );
}
