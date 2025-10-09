'use client';

import { Edit, Trash2, Calendar, Users, Clock, MapPin, DollarSign, Award, User, Target, BookOpen, CheckCircle } from "lucide-react";
import {
  AppDrawer,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@ghxstship/ui";
import AppDrawer, { type DrawerAction } from '@ghxstship/ui';

import type { ProgrammingWorkshop } from '../types';

interface User {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
}

interface ViewProgrammingWorkshopDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 workshop: ProgrammingWorkshop;
 users: User[];
 onEdit: () => void;
 onDelete: () => void;
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

export default function ViewProgrammingWorkshopDrawer({
 open,
 onOpenChange,
 workshop,
 users,
 onEdit,
 onDelete
}: ViewProgrammingWorkshopDrawerProps) {
 const getUserName = (userId: string | undefined | null) => {
 if (!userId) return 'Unknown';
 const user = users.find((u) => u.id === userId);
 return user?.full_name || user?.email || 'Unknown';
 };

 const categoryConfig = CATEGORY_CONFIG[workshop.category];
 const statusConfig = STATUS_BADGE_CONFIG[workshop.status];
 const skillLevelConfig = SKILL_LEVEL_BADGE_CONFIG[workshop.skill_level];
 const formatConfig = FORMAT_CONFIG[workshop.format];

 const actions: DrawerAction[] = [
 {
 key: 'edit',
 label: 'Edit',
 icon: <Edit className="h-icon-xs w-icon-xs" />,
 variant: 'outline',
 onClick: () => onEdit()
 },
 {
 key: 'delete',
 label: 'Delete',
 icon: <Trash2 className="h-icon-xs w-icon-xs" />,
 variant: 'destructive',
 onClick: () => onDelete()
 },
 ];

 const content = (
 <div className="space-y-lg">
 {/* Basic Information */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <span className="text-2xl">{categoryConfig.icon}</span>
 {workshop.title}
 </CardTitle>
 <div className="flex flex-wrap gap-xs mt-2">
 <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
 <Badge variant={skillLevelConfig.variant}>{skillLevelConfig.label}</Badge>
 <div className="flex items-center gap-xs">
 <span>{formatConfig.icon}</span>
 <Badge variant={formatConfig.variant}>{formatConfig.label}</Badge>
 </div>
 <Badge variant="outline">{categoryConfig.label}</Badge>
 </div>
 </CardHeader>
 <CardContent className="space-y-sm">
 {workshop.description && (
 <p className="text-muted-foreground">{workshop.description}</p>
 )}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-sm">
 <div className="space-y-xs">
 <div className="flex items-center gap-xs">
 <Calendar className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="font-medium">
 {new Date(workshop.start_date).toLocaleDateString()}
 </span>
 {workshop.end_date && workshop.end_date !== workshop.start_date && (
 <span className="text-muted-foreground">
 - {new Date(workshop.end_date).toLocaleDateString()}
 </span>
 )}
 </div>
 {workshop.duration_minutes && (
 <div className="flex items-center gap-xs">
 <Clock className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span>{workshop.duration_minutes} minutes</span>
 </div>
 )}
 </div>
 <div className="space-y-xs">
 <div className="flex items-center gap-xs">
 <Users className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span>
 {workshop.current_participants}
 {workshop.max_participants && `/${workshop.max_participants}`}
 {' '}participants
 </span>
 </div>
 {workshop.waitlist_count > 0 && (
 <div className="text-muted-foreground text-xs">
 +{workshop.waitlist_count} on waitlist
 </div>
 )}
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Location & Venue */}
 {(workshop.location || workshop.venue || workshop.virtual_link) && (
 <Card>
 <CardHeader>
 <CardTitle>Location & Venue</CardTitle>
 </CardHeader>
 <CardContent className="space-y-xs">
 {workshop.venue && (
 <div className="flex items-center gap-xs">
 <MapPin className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="font-medium">{workshop.venue}</span>
 </div>
 )}
 {workshop.location && (
 <div className="text-sm text-muted-foreground">{workshop.location}</div>
 )}
 {workshop.virtual_link && (
 <div>
 <span className="text-sm font-medium">Virtual Link: </span>
 <a 
 href={workshop.virtual_link as any as any} 
 target="_blank" 
 rel="noopener noreferrer"
 className="text-blue-600 hover:underline text-sm"
 >
 {workshop.virtual_link}
 </a>
 </div>
 )}
 </CardContent>
 </Card>
 )}

 {/* Instructor */}
 {workshop.primary_instructor && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <User className="h-icon-sm w-icon-sm" />
 Instructor
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-sm">
 {workshop.primary_instructor.full_name || workshop.primary_instructor.email}
 </div>
 </CardContent>
 </Card>
 )}

 {/* Registration & Pricing */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <DollarSign className="h-icon-sm w-icon-sm" />
 Registration & Pricing
 </CardTitle>
 </CardHeader>
 <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-md text-sm">
 <div className="space-y-xs">
 {workshop.registration_opens_at && (
 <div>
 <span className="font-medium">Registration Opens:</span>{' '}
 {new Date(workshop.registration_opens_at).toLocaleDateString()}
 </div>
 )}
 {workshop.registration_deadline && (
 <div>
 <span className="font-medium">Registration Deadline:</span>{' '}
 {new Date(workshop.registration_deadline).toLocaleDateString()}
 </div>
 )}
 {workshop.min_participants && (
 <div>
 <span className="font-medium">Min Participants:</span> {workshop.min_participants}
 </div>
 )}
 </div>
 <div className="space-y-xs">
 {workshop.price ? (
 <div>
 <span className="font-medium">Price:</span>{' '}
 {workshop.currency || '$'}{workshop.price}
 </div>
 ) : (
 <div>
 <span className="font-medium">Price:</span> Free
 </div>
 )}
 {workshop.early_bird_price && (
 <div>
 <span className="font-medium">Early Bird:</span>{' '}
 {workshop.currency || '$'}{workshop.early_bird_price}
 {workshop.early_bird_deadline && (
 <span className="text-muted-foreground text-xs ml-1">
 (until {new Date(workshop.early_bird_deadline).toLocaleDateString()})
 </span>
 )}
 </div>
 )}
 {workshop.member_discount && (
 <div>
 <span className="font-medium">Member Discount:</span> {workshop.member_discount}%
 </div>
 )}
 </div>
 </CardContent>
 </Card>

 {/* Learning Objectives */}
 {workshop.objectives && workshop.objectives.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <Target className="h-icon-sm w-icon-sm" />
 Learning Objectives
 </CardTitle>
 </CardHeader>
 <CardContent>
 <ul className="space-y-xs text-sm list-disc list-inside">
 {workshop.objectives.map((objective, index) => (
 <li key={index}>{objective}</li>
 ))}
 </ul>
 </CardContent>
 </Card>
 )}

 {/* Prerequisites */}
 {workshop.prerequisites && workshop.prerequisites.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <CheckCircle className="h-icon-sm w-icon-sm" />
 Prerequisites
 </CardTitle>
 </CardHeader>
 <CardContent>
 <ul className="space-y-xs text-sm list-disc list-inside">
 {workshop.prerequisites.map((prerequisite, index) => (
 <li key={index}>{prerequisite}</li>
 ))}
 </ul>
 </CardContent>
 </Card>
 )}

 {/* Materials */}
 {((workshop.materials_provided && workshop.materials_provided.length > 0) ||
 (workshop.materials_required && workshop.materials_required.length > 0)) && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <BookOpen className="h-icon-sm w-icon-sm" />
 Materials
 </CardTitle>
 </CardHeader>
 <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-md">
 {workshop.materials_provided && workshop.materials_provided.length > 0 && (
 <div>
 <h4 className="font-semibold mb-2">Materials Provided</h4>
 <ul className="space-y-xs text-sm list-disc list-inside">
 {workshop.materials_provided.map((material, index) => (
 <li key={index}>{material}</li>
 ))}
 </ul>
 </div>
 )}
 {workshop.materials_required && workshop.materials_required.length > 0 && (
 <div>
 <h4 className="font-semibold mb-2">Materials Required</h4>
 <ul className="space-y-xs text-sm list-disc list-inside">
 {workshop.materials_required.map((material, index) => (
 <li key={index}>{material}</li>
 ))}
 </ul>
 </div>
 )}
 </CardContent>
 </Card>
 )}

 {/* Agenda */}
 {workshop.agenda && (
 <Card>
 <CardHeader>
 <CardTitle>Agenda</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="whitespace-pre-wrap text-sm">{workshop.agenda}</div>
 </CardContent>
 </Card>
 )}

 {/* Assessment & Certification */}
 {(workshop.has_assessment || workshop.certification_available) && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <Award className="h-icon-sm w-icon-sm" />
 Assessment & Certification
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-sm">
 {workshop.has_assessment && (
 <div>
 <h4 className="font-semibold">Assessment</h4>
 <p className="text-sm text-muted-foreground">
 Type: {workshop.assessment_type || 'Not specified'}
 </p>
 </div>
 )}
 {workshop.certification_available && (
 <div>
 <h4 className="font-semibold">Certification Available</h4>
 {workshop.certification_criteria && (
 <p className="text-sm text-muted-foreground">
 {workshop.certification_criteria}
 </p>
 )}
 </div>
 )}
 </CardContent>
 </Card>
 )}

 {/* Project & Event */}
 {(workshop.project || workshop.event) && (
 <Card>
 <CardHeader>
 <CardTitle>Associated</CardTitle>
 </CardHeader>
 <CardContent className="space-y-xs">
 {workshop.project && (
 <div>
 <span className="font-medium">Project: </span>
 <Badge variant="outline">{workshop.project.name}</Badge>
 <Badge variant="secondary" className="ml-2">{workshop.project.status}</Badge>
 </div>
 )}
 {workshop.event && (
 <div>
 <span className="font-medium">Event: </span>
 <Badge variant="outline">{workshop.event.title}</Badge>
 </div>
 )}
 </CardContent>
 </Card>
 )}

 {/* Notes & Policies */}
 {(workshop.public_notes || workshop.cancellation_policy || workshop.refund_policy) && (
 <Card>
 <CardHeader>
 <CardTitle>Notes & Policies</CardTitle>
 </CardHeader>
 <CardContent className="space-y-sm">
 {workshop.public_notes && (
 <div>
 <h4 className="font-semibold">Public Notes</h4>
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">
 {workshop.public_notes}
 </p>
 </div>
 )}
 {workshop.cancellation_policy && (
 <div>
 <h4 className="font-semibold">Cancellation Policy</h4>
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">
 {workshop.cancellation_policy}
 </p>
 </div>
 )}
 {workshop.refund_policy && (
 <div>
 <h4 className="font-semibold">Refund Policy</h4>
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">
 {workshop.refund_policy}
 </p>
 </div>
 )}
 </CardContent>
 </Card>
 )}

 {/* Internal Notes */}
 {workshop.internal_notes && (
 <Card>
 <CardHeader>
 <CardTitle>Internal Notes</CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">
 {workshop.internal_notes}
 </p>
 </CardContent>
 </Card>
 )}

 {/* Tags */}
 {workshop.tags && workshop.tags.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle>Tags</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex flex-wrap gap-xs">
 {workshop.tags.map((tag, index) => (
 <Badge key={index} variant="outline">
 {tag}
 </Badge>
 ))}
 </div>
 </CardContent>
 </Card>
 )}

 {/* Metadata */}
 <Card>
 <CardHeader>
 <CardTitle>Metadata</CardTitle>
 </CardHeader>
 <CardContent className="space-y-xs text-sm">
 <div className="flex justify-between">
 <span className="text-muted-foreground">Created:</span>
 <span>{new Date(workshop.created_at).toLocaleString()}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Updated:</span>
 <span>{new Date(workshop.updated_at).toLocaleString()}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Created by:</span>
 <span>{getUserName(workshop.created_by)}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Updated by:</span>
 <span>{getUserName(workshop.updated_by)}</span>
 </div>
 </CardContent>
 </Card>
 </div>
 );

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title={workshop.title}
 mode="view"
 actions={actions}
 >
 {content}
 </AppDrawer>
 );
}
