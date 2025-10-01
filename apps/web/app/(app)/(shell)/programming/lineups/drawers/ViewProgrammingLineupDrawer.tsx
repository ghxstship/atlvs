"use client";

import { Calendar, Clock, Edit, MapPin, Trash2, DollarSign, Settings, Tag, Music, Phone, Mail, User, Wrench, FileText, ExternalLink } from "lucide-react";
import {
 Badge,
 Button,
 Card,
 Modal,
} from "@ghxstship/ui";
import type { ProgrammingLineup, LineupProject, LineupEvent } from "../types";
import { STATUS_BADGE, PERFORMER_TYPE_BADGE } from "../types";

type User = {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
};

type ViewProgrammingLineupDrawerProps = {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 lineup: ProgrammingLineup;
 onEdit: () => void;
 onDelete: () => void;
 users: User[];
 projects: LineupProject[];
 events: LineupEvent[];
};

export default function ViewProgrammingLineupDrawer({
 open,
 onOpenChange,
 lineup,
 onEdit,
 onDelete,
 users,
 projects,
 events,
}: ViewProgrammingLineupDrawerProps) {
 const handleClose = () => onOpenChange(false);
 const statusConfig = STATUS_BADGE[lineup.status];
 const typeConfig = PERFORMER_TYPE_BADGE[lineup.performer_type || 'other'];
 
 const formatDateTime = (dateString: string | null) => {
 if (!dateString) return null;
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

 const setTime = formatDateTime(lineup.set_time || null);
 const soundCheck = formatDateTime(lineup.technical_requirements.sound_check || null);
 const fee = formatCurrency(lineup.contract_details.fee || null, lineup.contract_details.currency || null);

 return (
 <Modal
 open={open}
 onClose={handleClose}
 title={lineup.performer_name}
 size="2xl"
 >
 <div className="p-lg">
 <div className="flex items-start justify-between mb-lg">
 <div className="space-y-sm">
 <h2 className="text-heading-4">{lineup.performer_name}</h2>
 <div className="flex items-center gap-sm">
 <Badge variant="secondary" className="text-xs">
 {typeConfig.icon} {typeConfig.label}
 </Badge>
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 </div>
 {lineup.role && (
 <p className="text-sm text-muted-foreground">{lineup.role}</p>
 )}
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
 {/* Event & Project Information */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <Calendar className="h-icon-xs w-icon-xs" />
 Event & Project
 </h3>
 <div className="space-y-md">
 {lineup.event && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Event</div>
 <div className="text-sm">
 <div className="font-medium">{lineup.event.title}</div>
 <div className="text-muted-foreground">
 {formatDateTime(lineup.event.start_at)?.full} - {formatDateTime(lineup.event.end_at)?.full}
 </div>
 {lineup.event.location && (
 <div className="flex items-center gap-xs text-muted-foreground">
 <MapPin className="h-3 w-3" />
 {lineup.event.location}
 </div>
 )}
 </div>
 </div>
 )}

 {lineup.project && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Project</div>
 <div className="flex items-center gap-sm">
 <span className="text-sm">{lineup.project.name}</span>
 <Badge variant="outline" className="text-xs">
 {lineup.project.status}
 </Badge>
 </div>
 </div>
 )}
 </div>
 </Card>

 {/* Schedule Information */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <Clock className="h-icon-xs w-icon-xs" />
 Schedule
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 {setTime && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Set Time</div>
 <div className="flex items-center gap-sm text-sm">
 <Clock className="h-3 w-3" />
 {setTime.full}
 </div>
 </div>
 )}

 {lineup.duration_minutes && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Duration</div>
 <div className="text-sm">
 {lineup.duration_minutes} minutes
 </div>
 </div>
 )}

 {lineup.stage && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Stage/Location</div>
 <div className="flex items-center gap-sm text-sm">
 <MapPin className="h-3 w-3" />
 {lineup.stage}
 </div>
 </div>
 )}

 {soundCheck && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Sound Check</div>
 <div className="text-sm">{soundCheck.full}</div>
 </div>
 )}
 </div>
 </Card>

 {/* Contact Information */}
 {(lineup.contact_info.email || lineup.contact_info.phone || lineup.contact_info.agent || lineup.contact_info.manager) && (
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <Phone className="h-icon-xs w-icon-xs" />
 Contact Information
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 {lineup.contact_info.email && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
 <div className="flex items-center gap-sm text-sm">
 <Mail className="h-3 w-3" />
 <a href={`mailto:${lineup.contact_info.email as any as any}`} className="text-primary hover:underline">
 {lineup.contact_info.email}
 </a>
 </div>
 </div>
 )}

 {lineup.contact_info.phone && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Phone</div>
 <div className="flex items-center gap-sm text-sm">
 <Phone className="h-3 w-3" />
 <a href={`tel:${lineup.contact_info.phone as any as any}`} className="text-primary hover:underline">
 {lineup.contact_info.phone}
 </a>
 </div>
 </div>
 )}

 {lineup.contact_info.agent && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Agent</div>
 <div className="flex items-center gap-sm text-sm">
 <User className="h-3 w-3" />
 {lineup.contact_info.agent}
 </div>
 </div>
 )}

 {lineup.contact_info.manager && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Manager</div>
 <div className="flex items-center gap-sm text-sm">
 <User className="h-3 w-3" />
 {lineup.contact_info.manager}
 </div>
 </div>
 )}
 </div>
 </Card>
 )}

 {/* Technical Requirements */}
 {((lineup.technical_requirements.equipment && lineup.technical_requirements.equipment.length > 0) || lineup.technical_requirements.special_requests) && (
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <Wrench className="h-icon-xs w-icon-xs" />
 Technical Requirements
 </h3>
 <div className="space-y-md">
 {lineup.technical_requirements.equipment && lineup.technical_requirements.equipment.length > 0 && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Equipment</div>
 <div className="flex flex-wrap gap-xs">
 {lineup.technical_requirements.equipment.map((item, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {item}
 </Badge>
 ))}
 </div>
 </div>
 )}

 {lineup.technical_requirements.special_requests && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Special Requests</div>
 <p className="text-sm">{lineup.technical_requirements.special_requests}</p>
 </div>
 )}
 </div>
 </Card>
 )}

 {/* Contract Details */}
 {(fee || lineup.contract_details.payment_terms || lineup.contract_details.contract_signed) && (
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <DollarSign className="h-icon-xs w-icon-xs" />
 Contract Details
 </h3>
 <div className="space-y-md">
 {fee && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Performance Fee</div>
 <div className="flex items-center gap-sm text-sm">
 <DollarSign className="h-3 w-3" />
 <span className="font-medium">{fee}</span>
 {lineup.contract_details.contract_signed && (
 <Badge variant="success" className="text-xs">
 Contract Signed
 </Badge>
 )}
 </div>
 </div>
 )}

 {lineup.contract_details.payment_terms && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Payment Terms</div>
 <p className="text-sm">{lineup.contract_details.payment_terms}</p>
 </div>
 )}
 </div>
 </Card>
 )}

 {/* Tags */}
 {lineup.tags.length > 0 && (
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <Tag className="h-icon-xs w-icon-xs" />
 Tags
 </h3>
 <div className="flex flex-wrap gap-sm">
 {lineup.tags.map((tag) => (
 <Badge key={tag} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 </div>
 </Card>
 )}

 {/* Notes */}
 {lineup.notes && (
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <FileText className="h-icon-xs w-icon-xs" />
 Notes
 </h3>
 <p className="text-sm whitespace-pre-wrap">{lineup.notes}</p>
 </Card>
 )}

 {/* Metadata */}
 {lineup.metadata && Object.keys(lineup.metadata).length > 0 && (
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Additional Information</h3>
 <div className="space-y-sm">
 {Object.entries(lineup.metadata).map(([key, value]) => (
 <div key={key} className="flex justify-between text-sm">
 <span className="font-medium text-muted-foreground">{key}:</span>
 <span>{String(value)}</span>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Lineup History */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Lineup History</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-sm">
 {lineup.created_at && (
 <div>
 <div className="font-medium text-muted-foreground mb-1">Created</div>
 <div>{new Date(lineup.created_at).toLocaleString()}</div>
 <div className="text-xs text-muted-foreground">
 by {getUserName(lineup.created_by)}
 </div>
 </div>
 )}
 {lineup.updated_at && (
 <div>
 <div className="font-medium text-muted-foreground mb-1">Last Updated</div>
 <div>{new Date(lineup.updated_at).toLocaleString()}</div>
 <div className="text-xs text-muted-foreground">
 by {getUserName(lineup.updated_by)}
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
