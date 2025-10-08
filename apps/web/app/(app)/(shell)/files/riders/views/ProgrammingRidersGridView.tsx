'use client';

import { MoreHorizontal, Edit, Eye, Trash2, Calendar, MapPin, User, Clock, CheckCircle, XCircle, AlertCircle, FileText } from "lucide-react";
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

import type { ProgrammingRider } from '../types';

interface ProgrammingRidersGridViewProps {
 riders: ProgrammingRider[];
 loading: boolean;
 onEdit: (rider: ProgrammingRider) => void;
 onView: (rider: ProgrammingRider) => void;
 onDelete: (riderId: string) => void;
}

const STATUS_BADGE_CONFIG = {
 draft: { label: 'Draft', variant: 'default' as const },
 pending_review: { label: 'Pending Review', variant: 'warning' as const },
 under_review: { label: 'Under Review', variant: 'info' as const },
 approved: { label: 'Approved', variant: 'success' as const },
 rejected: { label: 'Rejected', variant: 'destructive' as const },
 fulfilled: { label: 'Fulfilled', variant: 'success' as const },
 cancelled: { label: 'Cancelled', variant: 'secondary' as const }
};

const PRIORITY_BADGE_CONFIG = {
 low: { label: 'Low', variant: 'secondary' as const },
 medium: { label: 'Medium', variant: 'default' as const },
 high: { label: 'High', variant: 'warning' as const },
 critical: { label: 'Critical', variant: 'destructive' as const },
 urgent: { label: 'Urgent', variant: 'destructive' as const }
};

const RIDER_KIND_CONFIG = {
 technical: { label: 'Technical', icon: '🔧', color: 'bg-blue-100 text-blue-800' },
 hospitality: { label: 'Hospitality', icon: '🍽️', color: 'bg-green-100 text-green-800' },
 stage_plot: { label: 'Stage Plot', icon: '📋', color: 'bg-purple-100 text-purple-800' },
 security: { label: 'Security', icon: '🛡️', color: 'bg-red-100 text-red-800' },
 catering: { label: 'Catering', icon: '🍴', color: 'bg-orange-100 text-orange-800' },
 transportation: { label: 'Transportation', icon: '🚐', color: 'bg-yellow-100 text-yellow-800' },
 accommodation: { label: 'Accommodation', icon: '🏨', color: 'bg-pink-100 text-pink-800' },
 production: { label: 'Production', icon: '🎬', color: 'bg-indigo-100 text-indigo-800' },
 artist: { label: 'Artist', icon: '🎤', color: 'bg-teal-100 text-teal-800' },
 crew: { label: 'Crew', icon: '👥', color: 'bg-gray-100 text-gray-800' }
};

export default function ProgrammingRidersGridView({
 riders,
 loading,
 onEdit,
 onView,
 onDelete
}: ProgrammingRidersGridViewProps) {
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

 if (riders.length === 0) {
 return (
 <Card className="p-xl">
 <div className="text-center">
 <FileText className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-4" />
 <h3 className="text-lg font-semibold">No riders found</h3>
 <p className="text-muted-foreground">
 No riders match your current filters. Try adjusting your search criteria.
 </p>
 </div>
 </Card>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
 {riders.map((rider) => {
 const kindConfig = RIDER_KIND_CONFIG[rider.kind];
 const statusConfig = STATUS_BADGE_CONFIG[rider.status];
 const priorityConfig = PRIORITY_BADGE_CONFIG[rider.priority];

 return (
 <Card key={rider.id} className="hover:shadow-md transition-shadow">
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-xs mb-2">
 <div className={`px-xs py-xs rounded-full text-xs font-medium ${kindConfig.color}`}>
 <span className="mr-1">{kindConfig.icon}</span>
 {kindConfig.label}
 </div>
 </div>
 <h3 className="font-semibold text-sm line-clamp-xs">{rider.title}</h3>
 {rider.description && (
 <p className="text-xs text-muted-foreground mt-1 line-clamp-xs">
 {rider.description}
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
 <DropdownMenuItem onClick={() => onView(rider)}>
 <Eye className="mr-2 h-icon-xs w-icon-xs" />
 View
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => onEdit(rider)}>
 <Edit className="mr-2 h-icon-xs w-icon-xs" />
 Edit
 </DropdownMenuItem>
 <DropdownMenuItem
 onClick={() => onDelete(rider.id)}
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
 {/* Status and Priority */}
 <div className="flex items-center gap-xs">
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 <Badge variant={priorityConfig.variant} className="text-xs">
 {priorityConfig.label}
 </Badge>
 </div>

 {/* Event Information */}
 {rider.event && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-xs text-muted-foreground">
 <Calendar className="h-3 w-3" />
 <span className="font-medium">{rider.event.title}</span>
 </div>
 <div className="flex items-center gap-xs text-xs text-muted-foreground">
 <Clock className="h-3 w-3" />
 {new Date(rider.event.start_at).toLocaleDateString()}
 </div>
 {rider.event.location && (
 <div className="flex items-center gap-xs text-xs text-muted-foreground">
 <MapPin className="h-3 w-3" />
 {rider.event.location}
 </div>
 )}
 </div>
 )}

 {/* Project */}
 {rider.project && (
 <div className="flex items-center gap-xs text-xs">
 <User className="h-3 w-3 text-muted-foreground" />
 <span className="text-muted-foreground">Project:</span>
 <Badge variant="outline" className="text-xs">
 {rider.project.name}
 </Badge>
 </div>
 )}

 {/* Fulfillment Status */}
 <div className="flex items-center gap-xs text-xs">
 {rider.fulfilled_at ? (
 <>
 <CheckCircle className="h-3 w-3 text-green-600" />
 <span className="text-green-600">Fulfilled</span>
 </>
 ) : rider.approved_at ? (
 <>
 <AlertCircle className="h-3 w-3 text-yellow-600" />
 <span className="text-yellow-600">Approved</span>
 </>
 ) : (
 <>
 <XCircle className="h-3 w-3 text-gray-400" />
 <span className="text-gray-400">Pending</span>
 </>
 )}
 </div>

 {/* Requirements Preview */}
 <div className="text-xs text-muted-foreground">
 <p className="line-clamp-xs">{rider.requirements}</p>
 </div>

 {/* Tags */}
 {rider.tags && rider.tags.length > 0 && (
 <div className="flex flex-wrap gap-xs">
 {rider.tags.slice(0, 3).map((tag, index) => (
 <Badge key={index} variant="outline" className="text-xs px-xs py-0">
 {tag}
 </Badge>
 ))}
 {rider.tags.length > 3 && (
 <Badge variant="outline" className="text-xs px-xs py-0">
 +{rider.tags.length - 3}
 </Badge>
 )}
 </div>
 )}
 </div>
 </CardContent>

 <CardFooter className="pt-3">
 <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
 <span>Created {new Date(rider.created_at).toLocaleDateString()}</span>
 <div className="flex gap-xs">
 <Button
 variant="outline"
 size="sm"
 onClick={() => onView(rider)}
 className="h-7 px-xs text-xs"
 >
 <Eye className="h-3 w-3 mr-1" />
 View
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => onEdit(rider)}
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
