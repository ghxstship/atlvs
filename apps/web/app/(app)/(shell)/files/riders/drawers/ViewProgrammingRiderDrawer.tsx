'use client';

import { Edit, Trash2, Calendar, MapPin, User, Clock, CheckCircle, XCircle, AlertCircle, FileText, Tag, MessageSquare } from "lucide-react";
import {
 Badge,
 Button,
 Card,
 CardContent,
 CardHeader,
 CardTitle,
} from '@ghxstship/ui';
import { AppDrawer } from '@ghxstship/ui';

import type { ProgrammingRider } from '../types';

interface User {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
}

interface ViewProgrammingRiderDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 rider: ProgrammingRider;
 users: User[];
 onEdit: () => void;
 onDelete: () => void;
}

const STATUS_BADGE_CONFIG = {
 draft: { label: 'Draft', variant: 'default' as const },
 pending_review: { label: 'Pending Review', variant: 'warning' as const },
 under_review: { label: 'Under Review', variant: 'info' as const },
 approved: { label: 'Approved', variant: 'success' as const },
 rejected: { label: 'Rejected', variant: 'destructive' as const },
 fulfilled: { label: 'Fulfilled', variant: 'success' as const },
 cancelled: { label: 'Cancelled', variant: 'secondary' as const },
};

const PRIORITY_BADGE_CONFIG = {
 low: { label: 'Low', variant: 'secondary' as const },
 medium: { label: 'Medium', variant: 'default' as const },
 high: { label: 'High', variant: 'warning' as const },
 critical: { label: 'Critical', variant: 'destructive' as const },
 urgent: { label: 'Urgent', variant: 'destructive' as const },
};

const RIDER_KIND_CONFIG = {
 technical: { label: 'Technical', icon: '🔧' },
 hospitality: { label: 'Hospitality', icon: '🍽️' },
 stage_plot: { label: 'Stage Plot', icon: '📋' },
 security: { label: 'Security', icon: '🛡️' },
 catering: { label: 'Catering', icon: '🍴' },
 transportation: { label: 'Transportation', icon: '🚐' },
 accommodation: { label: 'Accommodation', icon: '🏨' },
 production: { label: 'Production', icon: '🎬' },
 artist: { label: 'Artist', icon: '🎤' },
 crew: { label: 'Crew', icon: '👥' },
};

export default function ViewProgrammingRiderDrawer({
 open,
 onOpenChange,
 rider,
 users,
 onEdit,
 onDelete,
}: ViewProgrammingRiderDrawerProps) {
 const getUserName = (userId: string) => {
 const user = users.find(u => u.id === userId);
 return user?.full_name || user?.email || 'Unknown User';
 };

 const kindConfig = RIDER_KIND_CONFIG[rider.kind];
 const statusConfig = STATUS_BADGE_CONFIG[rider.status];
 const priorityConfig = PRIORITY_BADGE_CONFIG[rider.priority];

 const actions = [
 {
 key: 'edit',
 label: 'Edit',
 icon: <Edit className="h-icon-xs w-icon-xs" />,
 variant: 'outline' as const,
 onClick: () => onEdit(),
 },
 {
 key: 'delete',
 label: 'Delete',
 icon: <Trash2 className="h-icon-xs w-icon-xs" />,
 variant: 'destructive' as const,
 onClick: () => onDelete(),
 },
 ];

 const content = (
 <div className="space-y-lg">
 {/* Event Information */}
 {rider.event && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <Calendar className="h-icon-sm w-icon-sm" />
 Event Details
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-sm">
 <div>
 <h4 className="font-semibold">{rider.event.title}</h4>
 <div className="flex items-center gap-md text-sm text-muted-foreground mt-1">
 <div className="flex items-center gap-xs">
 <Clock className="h-icon-xs w-icon-xs" />
 {new Date(rider.event.start_at).toLocaleDateString()} - {new Date(rider.event.end_at || rider.event.start_at).toLocaleDateString()}
 </div>
 {rider.event.location && (
 <div className="flex items-center gap-xs">
 <MapPin className="h-icon-xs w-icon-xs" />
 {rider.event.location}
 </div>
 )}
 </div>
 </div>
 </CardContent>
 </Card>
 )}

 {/* Project Information */}
 {rider.project && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <User className="h-icon-sm w-icon-sm" />
 Project Details
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex items-center gap-xs">
 <span className="font-medium">{rider.project.name}</span>
 <Badge variant="outline">{rider.project.status}</Badge>
 </div>
 </CardContent>
 </Card>
 )}

 {/* Requirements */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <FileText className="h-icon-sm w-icon-sm" />
 Requirements
 </CardTitle>
 </CardHeader>
 <CardContent>
 <p className="whitespace-pre-wrap">{rider.requirements}</p>
 </CardContent>
 </Card>

 {/* Specific Requirements based on type */}
 {rider.kind === 'technical' && rider.technical_requirements && Object.keys(rider.technical_requirements).length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle>Technical Requirements</CardTitle>
 </CardHeader>
 <CardContent className="space-y-sm">
 {rider.technical_requirements.sound_system && (
 <div>
 <h5 className="font-medium">Sound System</h5>
 <p className="text-sm text-muted-foreground">{rider.technical_requirements.sound_system}</p>
 </div>
 )}
 {rider.technical_requirements.lighting && (
 <div>
 <h5 className="font-medium">Lighting</h5>
 <p className="text-sm text-muted-foreground">{rider.technical_requirements.lighting}</p>
 </div>
 )}
 {rider.technical_requirements.power_requirements && (
 <div>
 <h5 className="font-medium">Power Requirements</h5>
 <p className="text-sm text-muted-foreground">{rider.technical_requirements.power_requirements}</p>
 </div>
 )}
 {rider.technical_requirements.crew_requirements && (
 <div>
 <h5 className="font-medium">Crew Requirements</h5>
 <p className="text-sm text-muted-foreground">{rider.technical_requirements.crew_requirements}</p>
 </div>
 )}
 {rider.technical_requirements.equipment_list && rider.technical_requirements.equipment_list.length > 0 && (
 <div>
 <h5 className="font-medium">Equipment List</h5>
 <ul className="text-sm text-muted-foreground list-disc list-inside">
 {rider.technical_requirements.equipment_list.map((item, index) => (
 <li key={index}>{item}</li>
 ))}
 </ul>
 </div>
 )}
 </CardContent>
 </Card>
 )}

 {rider.kind === 'hospitality' && rider.hospitality_requirements && Object.keys(rider.hospitality_requirements).length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle>Hospitality Requirements</CardTitle>
 </CardHeader>
 <CardContent className="space-y-sm">
 {rider.hospitality_requirements.catering && (
 <div>
 <h5 className="font-medium">Catering</h5>
 <p className="text-sm text-muted-foreground">{rider.hospitality_requirements.catering}</p>
 </div>
 )}
 {rider.hospitality_requirements.beverages && (
 <div>
 <h5 className="font-medium">Beverages</h5>
 <p className="text-sm text-muted-foreground">{rider.hospitality_requirements.beverages}</p>
 </div>
 )}
 {rider.hospitality_requirements.green_room_setup && (
 <div>
 <h5 className="font-medium">Green Room Setup</h5>
 <p className="text-sm text-muted-foreground">{rider.hospitality_requirements.green_room_setup}</p>
 </div>
 )}
 {rider.hospitality_requirements.dietary_restrictions && rider.hospitality_requirements.dietary_restrictions.length > 0 && (
 <div>
 <h5 className="font-medium">Dietary Restrictions</h5>
 <div className="flex flex-wrap gap-xs">
 {rider.hospitality_requirements.dietary_restrictions.map((restriction, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {restriction}
 </Badge>
 ))}
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 )}

 {/* Fulfillment Status */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <CheckCircle className="h-icon-sm w-icon-sm" />
 Fulfillment Status
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-sm">
 <div className="flex items-center gap-xs">
 {rider.fulfilled_at ? (
 <>
 <CheckCircle className="h-icon-sm w-icon-sm text-green-600" />
 <div>
 <p className="font-medium text-green-600">Fulfilled</p>
 <p className="text-sm text-muted-foreground">
 Completed on {new Date(rider.fulfilled_at).toLocaleDateString()}
 {rider.fulfilled_by && ` by ${getUserName(rider.fulfilled_by)}`}
 </p>
 </div>
 </>
 ) : rider.approved_at ? (
 <>
 <AlertCircle className="h-icon-sm w-icon-sm text-yellow-600" />
 <div>
 <p className="font-medium text-yellow-600">Approved - Pending Fulfillment</p>
 <p className="text-sm text-muted-foreground">
 Approved on {new Date(rider.approved_at).toLocaleDateString()}
 {rider.approved_by && ` by ${getUserName(rider.approved_by)}`}
 </p>
 </div>
 </>
 ) : (
 <>
 <XCircle className="h-icon-sm w-icon-sm text-gray-400" />
 <div>
 <p className="font-medium text-gray-600">Not Fulfilled</p>
 <p className="text-sm text-muted-foreground">Awaiting approval and fulfillment</p>
 </div>
 </>
 )}
 </div>

 {rider.fulfillment_notes && (
 <div>
 <h5 className="font-medium">Fulfillment Notes</h5>
 <p className="text-sm text-muted-foreground">{rider.fulfillment_notes}</p>
 </div>
 )}
 </CardContent>
 </Card>

 {/* Review Information */}
 {(rider.reviewed_at || rider.review_notes) && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <MessageSquare className="h-icon-sm w-icon-sm" />
 Review Information
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-sm">
 {rider.reviewed_at && (
 <div>
 <p className="font-medium">
 Reviewed on {new Date(rider.reviewed_at).toLocaleDateString()}
 {rider.reviewed_by && ` by ${getUserName(rider.reviewed_by)}`}
 </p>
 </div>
 )}
 {rider.review_notes && (
 <div>
 <h5 className="font-medium">Review Notes</h5>
 <p className="text-sm text-muted-foreground">{rider.review_notes}</p>
 </div>
 )}
 </CardContent>
 </Card>
 )}

 {/* Notes */}
 {rider.notes && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <MessageSquare className="h-icon-sm w-icon-sm" />
 Notes
 </CardTitle>
 </CardHeader>
 <CardContent>
 <p className="whitespace-pre-wrap">{rider.notes}</p>
 </CardContent>
 </Card>
 )}

 {/* Tags */}
 {rider.tags && rider.tags.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <Tag className="h-icon-sm w-icon-sm" />
 Tags
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex flex-wrap gap-xs">
 {rider.tags.map((tag, index) => (
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
 <span>{new Date(rider.created_at).toLocaleString()}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Updated:</span>
 <span>{new Date(rider.updated_at).toLocaleString()}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Created by:</span>
 <span>{getUserName(rider.created_by)}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Updated by:</span>
 <span>{getUserName(rider.updated_by)}</span>
 </div>
 </CardContent>
 </Card>
 </div>
 );

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title={`${kindConfig.icon} ${rider.title}`}
 mode="view"
 actions={actions}
 >
 {content}
 </AppDrawer>
 );
}
