"use client";

import { Calendar, Clock, Edit, MapPin, Trash2, Users, DollarSign, Settings, Tag, Plane, Building, Car, ExternalLink } from "lucide-react";
import {
 Badge,
 Button,
 Card,
 Modal,
} from "@ghxstship/ui";
import type { ProgrammingItinerary } from "../types";
import { STATUS_BADGE, TYPE_BADGE, TRANSPORTATION_TYPE_LABEL } from "../types";

type ViewProgrammingItineraryDrawerProps = {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 itinerary: ProgrammingItinerary;
 onEdit: () => void;
 onDelete: () => void;
 users: { id: string; email: string; full_name?: string | null; avatar_url?: string | null }[];
};

export default function ViewProgrammingItineraryDrawer({
 open,
 onOpenChange,
 itinerary,
 onEdit,
 onDelete,
 users,
}: ViewProgrammingItineraryDrawerProps) {
 const handleClose = () => onOpenChange(false);
 const statusConfig = STATUS_BADGE[itinerary.status];
 const typeConfig = TYPE_BADGE[itinerary.type];
 
 const formatDateTime = (dateString: string) => {
 const date = new Date(dateString);
 return {
 date: date.toLocaleDateString(),
 time: date.toLocaleTimeString(),
 full: date.toLocaleString(),
 };
 };

 const formatCurrency = (amount: number | null, currency: string | null) => {
 if (!amount || !currency) return null;
 return new Intl.NumberFormat("en-US", {
 style: "currency",
 currency: currency,
 }).format(amount);
 };

 const getUserName = (userId: string) => {
 const user = users.find(u => u.id === userId);
 return user?.full_name || user?.email || "Unknown User";
 };

 const getDuration = () => {
 const start = new Date(itinerary.start_date);
 const end = new Date(itinerary.end_date);
 const diffTime = Math.abs(end.getTime() - start.getTime());
 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 return diffDays;
 };

 return (
 <Modal
 open={open}
 onClose={handleClose}
 title={itinerary.name}
 size="2xl"
 >
 <div className="p-lg">
 <div className="flex items-start justify-between mb-lg">
 <div className="space-y-sm">
 <h2 className="text-heading-4">{itinerary.name}</h2>
 <div className="flex items-center gap-sm">
 <Badge variant="secondary" className="text-xs">
 {typeConfig.icon} {typeConfig.label}
 </Badge>
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 </div>
 </div>
 <div className="flex items-center gap-sm">
 <Button variant="outline" size="sm" onClick={onEdit}>
 <Edit className="h-icon-xs w-icon-xs mr-2" />
 Edit
 </Button>
 <Button variant="outline" size="sm" onClick={onDelete}>
 <Trash2 className="h-icon-xs w-icon-xs mr-2 text-destructive" />
 Delete
 </Button>
 </div>
 </div>

 <div className="space-y-lg">
 {/* Basic Information */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <Settings className="h-icon-xs w-icon-xs" />
 Basic Information
 </h3>
 <div className="space-y-md">
 {itinerary.description && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Description</div>
 <p className="text-sm">{itinerary.description}</p>
 </div>
 )}

 {itinerary.project && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Project</div>
 <div className="flex items-center gap-sm">
 <span className="text-sm">{itinerary.project.name}</span>
 <Badge variant="outline" className="text-xs">
 {itinerary.project.status}
 </Badge>
 </div>
 </div>
 )}

 {itinerary.event && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Related Event</div>
 <div className="text-sm">{itinerary.event.title}</div>
 </div>
 )}
 </div>
 </Card>

 {/* Date & Time Information */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <Calendar className="h-icon-xs w-icon-xs" />
 Schedule
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Start Date & Time</div>
 <div className="flex items-center gap-sm text-sm">
 <Calendar className="h-3 w-3" />
 {formatDateTime(itinerary.start_date).date}
 </div>
 <div className="flex items-center gap-sm text-sm text-muted-foreground">
 <Clock className="h-3 w-3" />
 {formatDateTime(itinerary.start_date).time}
 </div>
 </div>

 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">End Date & Time</div>
 <div className="flex items-center gap-sm text-sm">
 <Calendar className="h-3 w-3" />
 {formatDateTime(itinerary.end_date).date}
 </div>
 <div className="flex items-center gap-sm text-sm text-muted-foreground">
 <Clock className="h-3 w-3" />
 {formatDateTime(itinerary.end_date).time}
 </div>
 </div>

 <div className="md:col-span-2">
 <div className="text-sm font-medium text-muted-foreground mb-1">Duration</div>
 <div className="text-sm">
 {getDuration()} {getDuration() === 1 ? 'day' : 'days'}
 </div>
 </div>
 </div>
 </Card>

 {/* Location & Transportation */}
 {(itinerary.location || itinerary.transportation_type) && (
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <MapPin className="h-icon-xs w-icon-xs" />
 Location & Transportation
 </h3>
 <div className="space-y-md">
 {itinerary.location && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Primary Location</div>
 <div className="flex items-center gap-sm text-sm">
 <MapPin className="h-3 w-3" />
 {itinerary.location}
 </div>
 </div>
 )}

 {itinerary.transportation_type && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Transportation</div>
 <div className="flex items-center gap-sm text-sm">
 <Car className="h-3 w-3" />
 {TRANSPORTATION_TYPE_LABEL[itinerary.transportation_type]}
 </div>
 </div>
 )}
 </div>
 </Card>
 )}

 {/* Cost & Participants */}
 {(itinerary.total_cost || itinerary.participants_count) && (
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <DollarSign className="h-icon-xs w-icon-xs" />
 Cost & Participants
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 {itinerary.total_cost && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Total Cost</div>
 <div className="flex items-center gap-sm text-sm">
 <DollarSign className="h-3 w-3" />
 {formatCurrency(itinerary.total_cost, itinerary.currency || null)}
 </div>
 </div>
 )}

 {itinerary.participants_count && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Participants</div>
 <div className="flex items-center gap-sm text-sm">
 <Users className="h-3 w-3" />
 {itinerary.participants_count} people
 </div>
 </div>
 )}
 </div>
 </Card>
 )}

 {/* Destinations */}
 {itinerary.destinations.length > 0 && (
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <MapPin className="h-icon-xs w-icon-xs" />
 Destinations
 </h3>
 <div className="space-y-sm">
 {itinerary.destinations.map((destination, index) => (
 <div key={index} className="p-sm bg-muted/50 rounded">
 <div className="font-medium text-sm">{destination.name}</div>
 {destination.address && (
 <div className="text-xs text-muted-foreground mt-1">{destination.address}</div>
 )}
 {destination.notes && (
 <div className="text-xs text-muted-foreground mt-1">{destination.notes}</div>
 )}
 {(destination.arrival_time || destination.departure_time) && (
 <div className="flex gap-md mt-1 text-xs text-muted-foreground">
 {destination.arrival_time && (
 <span>Arrival: {formatDateTime(destination.arrival_time).full}</span>
 )}
 {destination.departure_time && (
 <span>Departure: {formatDateTime(destination.departure_time).full}</span>
 )}
 </div>
 )}
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Accommodations */}
 {itinerary.accommodations.length > 0 && (
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <Building className="h-icon-xs w-icon-xs" />
 Accommodations
 </h3>
 <div className="space-y-sm">
 {itinerary.accommodations.map((accommodation, index) => (
 <div key={index} className="p-sm bg-muted/50 rounded">
 <div className="font-medium text-sm">{accommodation.name}</div>
 {accommodation.address && (
 <div className="text-xs text-muted-foreground mt-1">{accommodation.address}</div>
 )}
 {accommodation.confirmation_number && (
 <div className="text-xs text-muted-foreground mt-1">
 Confirmation: {accommodation.confirmation_number}
 </div>
 )}
 {(accommodation.check_in || accommodation.check_out) && (
 <div className="flex gap-md mt-1 text-xs text-muted-foreground">
 {accommodation.check_in && (
 <span>Check-in: {formatDateTime(accommodation.check_in).full}</span>
 )}
 {accommodation.check_out && (
 <span>Check-out: {formatDateTime(accommodation.check_out).full}</span>
 )}
 </div>
 )}
 {accommodation.cost && (
 <div className="text-xs text-muted-foreground mt-1">
 Cost: {formatCurrency(accommodation.cost, itinerary.currency || null)}
 </div>
 )}
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Transportation Details */}
 {itinerary.transportation.length > 0 && (
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <Plane className="h-icon-xs w-icon-xs" />
 Transportation Details
 </h3>
 <div className="space-y-sm">
 {itinerary.transportation.map((transport, index) => (
 <div key={index} className="p-sm bg-muted/50 rounded">
 <div className="font-medium text-sm">{transport.type}</div>
 {transport.provider && (
 <div className="text-xs text-muted-foreground mt-1">Provider: {transport.provider}</div>
 )}
 {transport.confirmation_number && (
 <div className="text-xs text-muted-foreground mt-1">
 Confirmation: {transport.confirmation_number}
 </div>
 )}
 {(transport.departure_time || transport.arrival_time) && (
 <div className="flex gap-md mt-1 text-xs text-muted-foreground">
 {transport.departure_time && (
 <span>Departure: {formatDateTime(transport.departure_time).full}</span>
 )}
 {transport.arrival_time && (
 <span>Arrival: {formatDateTime(transport.arrival_time).full}</span>
 )}
 </div>
 )}
 {transport.cost && (
 <div className="text-xs text-muted-foreground mt-1">
 Cost: {formatCurrency(transport.cost, itinerary.currency || null)}
 </div>
 )}
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Tags */}
 {itinerary.tags.length > 0 && (
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <Tag className="h-icon-xs w-icon-xs" />
 Tags
 </h3>
 <div className="flex flex-wrap gap-sm">
 {itinerary.tags.map((tag) => (
 <Badge key={tag} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 </div>
 </Card>
 )}

 {/* Metadata */}
 {itinerary.metadata && Object.keys(itinerary.metadata).length > 0 && (
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Additional Information</h3>
 <div className="space-y-sm">
 {Object.entries(itinerary.metadata).map(([key, value]) => (
 <div key={key} className="flex justify-between text-sm">
 <span className="font-medium text-muted-foreground">{key}:</span>
 <span>{String(value)}</span>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Timestamps */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Itinerary History</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-sm">
 {itinerary.created_at && (
 <div>
 <div className="font-medium text-muted-foreground mb-1">Created</div>
 <div>{new Date(itinerary.created_at).toLocaleString()}</div>
 <div className="text-xs text-muted-foreground">
 by {getUserName(itinerary.created_by)}
 </div>
 </div>
 )}
 {itinerary.updated_at && (
 <div>
 <div className="font-medium text-muted-foreground mb-1">Last Updated</div>
 <div>{new Date(itinerary.updated_at).toLocaleString()}</div>
 <div className="text-xs text-muted-foreground">
 by {getUserName(itinerary.updated_by)}
 </div>
 </div>
 )}
 </div>
 </Card>
 </div>
 </div>
 </Modal>
 );
}
