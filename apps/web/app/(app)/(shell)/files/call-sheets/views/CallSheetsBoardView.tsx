"use client";

import { Badge, Button, Card } from "@ghxstship/ui";
import type { CallSheet } from "../types";
import { STATUS_BADGE, CALL_TYPE_LABEL } from "../ProgrammingCallSheetsClient";
import { Calendar, Edit, Eye, Trash2 } from 'lucide-react';

type CallSheetsBoardViewProps = {
 callSheets: CallSheet[];
 selected: Set<string>;
 onSelect: (id: string) => void;
 onView: (callSheet: CallSheet) => void;
 onEdit: (callSheet: CallSheet) => void;
 onDelete: (callSheet: CallSheet) => void;
};

const STATUS_COLUMNS: CallSheet["status"][] = [
 "draft",
 "published",
 "distributed",
 "updated",
 "cancelled",
];

export default function CallSheetsBoardView({
 callSheets,
 selected,
 onSelect,
 onView,
 onEdit,
 onDelete,
}: CallSheetsBoardViewProps) {
 return (
 <div className="flex gap-md overflow-x-auto pb-md">
 {STATUS_COLUMNS.map((status) => {
 const columnCallSheets = callSheets.filter((callSheet) => callSheet.status === status);
 const statusConfig = STATUS_BADGE[status];

 return (
 <section key={status} className="flex w-container-md flex-shrink-0 flex-col gap-sm">
 <header className="flex items-center justify-between">
 <h3 className="text-sm font-semibold text-muted-foreground">{statusConfig.label}</h3>
 <Badge variant={statusConfig.variant} className="text-xs">
 {columnCallSheets.length}
 </Badge>
 </header>

 <div className="space-y-sm">
 {columnCallSheets.length === 0 ? (
 <Card className="p-md text-center text-xs text-muted-foreground">No call sheets</Card>
 ) : (
 columnCallSheets.map((callSheet) => {
 const isSelected = selected.has(callSheet.id);

 return (
 <Card key={callSheet.id} className={`space-y-sm p-sm ${isSelected ? "ring-2 ring-primary" : ""}`}>
 <div className="flex items-start justify-between gap-sm">
 <div className="space-y-xs">
 <div className="text-sm font-medium leading-tight">{callSheet.name}</div>
 <div className="text-xs text-muted-foreground">{CALL_TYPE_LABEL[callSheet.call_type]}</div>
 <div className="flex flex-col gap-xs text-xs text-muted-foreground">
 <span className="flex items-center gap-xs">
 <Calendar className="h-3 w-3" />
 {callSheet.event_date}
 </span>
 <span className="flex items-center gap-xs">
 <Clock className="h-3 w-3" />
 {callSheet.call_time}
 </span>
 {callSheet.location ? (
 <span className="flex items-center gap-xs">
 <MapPin className="h-3 w-3" />
 {callSheet.location}
 </span>
 ) : null}
 </div>
 {callSheet.project ? (
 <div className="text-xs text-muted-foreground">Project: {callSheet.project.name}</div>
 ) : null}
 {callSheet.event ? (
 <div className="text-xs text-muted-foreground">Event: {callSheet.event.title}</div>
 ) : null}
 </div>
 <div className="flex items-center gap-xs">
 <Button size="icon" variant="ghost" onClick={() => onView(callSheet)}>
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button size="icon" variant="ghost" onClick={() => onEdit(callSheet)}>
 <Pencil className="h-icon-xs w-icon-xs" />
 </Button>
 <Button size="icon" variant="ghost" onClick={() => onDelete(callSheet)}>
 <Trash2 className="h-icon-xs w-icon-xs text-destructive" />
 </Button>
 </div>
 </div>
 <Button
 variant="outline"
 size="sm"
 className="w-full"
 onClick={() => onSelect(callSheet.id)}
 >
 {isSelected ? "Selected" : "Select"}
 </Button>
 </Card>
 );
 })
 )}
 </div>
 </section>
 );
 })}
 </div>
 );
}
