"use client";

import { Edit, Eye, Trash2, Clock, MapPin, DollarSign, Phone, Mail, User, Calendar, Music } from "lucide-react";
import {
 Badge,
 Button,
 Card,
 Checkbox,
} from "@ghxstship/ui";
import type { ProgrammingLineup, LineupSort, LineupProject, LineupEvent } from "../types";
import { STATUS_BADGE, PERFORMER_TYPE_BADGE } from "../types";

type User = {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
};

type ProgrammingLineupsGridViewProps = {
 lineups: ProgrammingLineup[];
 loading: boolean;
 selectedLineups: Set<string>;
 onSelectionChange: (id: string, selected: boolean) => void;
 onSelectAll: (selected: boolean) => void;
 onEdit: (lineup: ProgrammingLineup) => void;
 onView: (lineup: ProgrammingLineup) => void;
 onDelete: (lineup: ProgrammingLineup) => void;
 sortConfig: LineupSort;
 onSort: (sort: LineupSort) => void;
 users: User[];
 projects: LineupProject[];
 events: LineupEvent[];
};

export default function ProgrammingLineupsGridView({
 lineups,
 loading,
 selectedLineups,
 onSelectionChange,
 onSelectAll,
 onEdit,
 onView,
 onDelete,
 sortConfig,
 onSort,
 users,
 projects,
 events,
}: ProgrammingLineupsGridViewProps) {

 const formatTime = (timeString: string | null) => {
 if (!timeString) return "TBD";
 return new Date(timeString).toLocaleTimeString("en-US", {
 hour: "2-digit",
 minute: "2-digit",
 });
 };

 const formatDate = (dateString: string | null) => {
 if (!dateString) return "TBD";
 return new Date(dateString).toLocaleDateString();
 };

 const formatCurrency = (amount: number | null, currency: string | null) => {
 if (!amount || !currency) return null;
 return new Intl.NumberFormat("en-US", {
 style: "currency",
 currency: currency,
 }).format(amount);
 };

 const getUserName = (userId: string) => {
 const user = users.find((u) => u.id === userId);
 return user?.full_name || user?.email || "Unknown User";
 };

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {Array.from({ length: 8 }).map((_, i) => (
 <Card key={i} className="p-md">
 <div className="animate-pulse">
 <div className="h-icon-xs bg-muted rounded mb-2"></div>
 <div className="h-3 bg-muted rounded mb-1"></div>
 <div className="h-3 bg-muted rounded mb-4"></div>
 <div className="flex gap-xs">
 <div className="h-icon-md bg-muted rounded flex-1"></div>
 <div className="h-icon-md bg-muted rounded flex-1"></div>
 </div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (lineups.length === 0) {
 return (
 <Card className="p-lg">
 <div className="text-center py-xsxl">
 <Music className="h-icon-2xl w-icon-2xl text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-medium mb-2">No lineups found</h3>
 <p className="text-muted-foreground">Create your first lineup to get started</p>
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-md">
 {/* Grid Controls */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <Checkbox
 checked={lineups.length > 0 && selectedLineups.size === lineups.length}
 indeterminate={selectedLineups.size > 0 && selectedLineups.size < lineups.length}
 onChange={(checked) => onSelectAll(checked)}
 />
 <span className="text-sm text-muted-foreground">
 {selectedLineups.size > 0 ? `${selectedLineups.size} selected` : `${lineups.length} lineups`}
 </span>
 </div>
 </div>

 {/* Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {lineups.map((lineup) => {
 const statusConfig = STATUS_BADGE[lineup.status];
 const typeConfig = PERFORMER_TYPE_BADGE[lineup.performer_type || 'other'];
 const isSelected = selectedLineups.has(lineup.id);
 const fee = formatCurrency(lineup.contract_details.fee, lineup.contract_details.currency);

 return (
 <Card
 key={lineup.id}
 className={`p-md transition-all hover:shadow-md cursor-pointer ${
 isSelected ? 'ring-2 ring-primary/20 bg-primary/5' : ''
 }`}
 onClick={() => onView(lineup)}
 >
 {/* Header */}
 <div className="flex items-start justify-between mb-sm">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-sm mb-1">
 <Checkbox
 checked={isSelected}
 onChange={(checked) => onSelectionChange(lineup.id, checked)}
 onClick={(e) => e.stopPropagation()}
 />
 <Badge variant="secondary" className="text-xs">
 {typeConfig.icon} {typeConfig.label}
 </Badge>
 </div>
 <h3 className="font-medium text-sm truncate">{lineup.performer_name}</h3>
 {lineup.role && (
 <p className="text-xs text-muted-foreground truncate">{lineup.role}</p>
 )}
 </div>

 <div className="flex items-center gap-xs ml-sm">
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(lineup);
 }}
 >
 <Edit className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDelete(lineup);
 }}
 >
 <Trash2 className="h-3 w-3 text-destructive" />
 </Button>
 </div>
 </div>

 {/* Status */}
 <div className="mb-sm">
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 </div>

 {/* Event & Time */}
 {lineup.event && (
 <div className="mb-sm">
 <div className="flex items-center gap-xs text-xs text-muted-foreground mb-1">
 <Calendar className="h-3 w-3" />
 <span className="truncate">{lineup.event.title}</span>
 </div>
 <div className="text-xs text-muted-foreground">
 {formatDate(lineup.event.start_at)}
 </div>
 </div>
 )}

 {/* Set Time & Duration */}
 <div className="grid grid-cols-2 gap-sm mb-sm text-xs">
 <div>
 <div className="text-muted-foreground">Set Time</div>
 <div className="flex items-center gap-xs">
 <Clock className="h-3 w-3" />
 {formatTime(lineup.set_time)}
 </div>
 </div>
 <div>
 <div className="text-muted-foreground">Duration</div>
 <div>{lineup.duration_minutes ? `${lineup.duration_minutes}m` : "TBD"}</div>
 </div>
 </div>

 {/* Stage */}
 {lineup.stage && (
 <div className="mb-sm">
 <div className="flex items-center gap-xs text-xs">
 <MapPin className="h-3 w-3 text-muted-foreground" />
 <span className="truncate">{lineup.stage}</span>
 </div>
 </div>
 )}

 {/* Fee */}
 {fee && (
 <div className="mb-sm">
 <div className="flex items-center gap-xs text-xs">
 <DollarSign className="h-3 w-3 text-muted-foreground" />
 <span className="font-medium">{fee}</span>
 {lineup.contract_details.contract_signed && (
 <Badge variant="success" className="text-small px-xs py-0">
 Signed
 </Badge>
 )}
 </div>
 </div>
 )}

 {/* Contact Info */}
 {(lineup.contact_info.email || lineup.contact_info.phone) && (
 <div className="mb-sm">
 <div className="space-y-xs">
 {lineup.contact_info.email && (
 <div className="flex items-center gap-xs text-xs text-muted-foreground">
 <Mail className="h-3 w-3" />
 <span className="truncate">{lineup.contact_info.email}</span>
 </div>
 )}
 {lineup.contact_info.phone && (
 <div className="flex items-center gap-xs text-xs text-muted-foreground">
 <Phone className="h-3 w-3" />
 <span>{lineup.contact_info.phone}</span>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Technical Requirements */}
 {lineup.technical_requirements.equipment?.length > 0 && (
 <div className="mb-sm">
 <div className="text-xs text-muted-foreground mb-1">Equipment</div>
 <div className="flex flex-wrap gap-xs">
 {lineup.technical_requirements.equipment.slice(0, 2).map((item, index) => (
 <Badge key={index} variant="outline" className="text-small px-xs py-0">
 {item}
 </Badge>
 ))}
 {lineup.technical_requirements.equipment.length > 2 && (
 <Badge variant="outline" className="text-small px-xs py-0">
 +{lineup.technical_requirements.equipment.length - 2}
 </Badge>
 )}
 </div>
 </div>
 )}

 {/* Project */}
 {lineup.project && (
 <div className="mb-sm">
 <div className="text-xs text-muted-foreground mb-1">Project</div>
 <div className="text-xs font-medium truncate">{lineup.project.name}</div>
 </div>
 )}

 {/* Tags */}
 {lineup.tags.length > 0 && (
 <div className="mb-sm">
 <div className="flex flex-wrap gap-xs">
 {lineup.tags.slice(0, 3).map((tag) => (
 <Badge key={tag} variant="secondary" className="text-small px-xs py-0">
 {tag}
 </Badge>
 ))}
 {lineup.tags.length > 3 && (
 <Badge variant="secondary" className="text-small px-xs py-0">
 +{lineup.tags.length - 3}
 </Badge>
 )}
 </div>
 </div>
 )}

 {/* Notes */}
 {lineup.notes && (
 <div className="mb-sm">
 <p className="text-xs text-muted-foreground line-clamp-xs">{lineup.notes}</p>
 </div>
 )}

 {/* Footer */}
 <div className="pt-sm border-t text-xs text-muted-foreground">
 <div className="flex justify-between">
 <span>By {getUserName(lineup.created_by)}</span>
 <span>{new Date(lineup.created_at).toLocaleDateString()}</span>
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 </div>
 );
}
