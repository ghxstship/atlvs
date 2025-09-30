'use client';

import { ShieldAlert, PhoneCall, Mail, MapPin, Clock, ShieldCheck, UserPlus, ArrowRight } from "lucide-react";
import { Card, Badge, Button } from '@ghxstship/ui';
import type { EmergencyContact } from '../types';
import { formatPhone, formatAddress } from '../types';

interface EmergencyCardViewProps {
 contact: EmergencyContact | null;
 loading: boolean;
 onEdit?: () => void;
 onVerify?: () => void;
}

const priorityVariants: Record<string, { label: string; variant: 'destructive' | 'default' | 'outline' | 'secondary' }> = {
 critical: { label: 'Critical', variant: 'destructive' },
 high: { label: 'High', variant: 'default' },
 medium: { label: 'Medium', variant: 'secondary' },
 low: { label: 'Low', variant: 'outline' },
};

export default function EmergencyCardView({
 contact,
 loading,
 onEdit,
 onVerify,
}: EmergencyCardViewProps) {
 if (loading) {
 return (
 <Card className="p-6 space-y-4 animate-pulse">
 <div className="h-5 w-1/3 bg-muted rounded" />
 <div className="h-4 w-1/2 bg-muted rounded" />
 <div className="h-4 w-2/3 bg-muted rounded" />
 </Card>
 );
 }

 if (!contact) {
 return (
 <Card className="p-6 text-center text-muted-foreground">
 Select an emergency contact to view details.
 </Card>
 );
 }

 const priorityBadge = priorityVariants[contact.priority_level] ?? priorityVariants.medium;

 return (
 <div className="space-y-6">
 <Card className="p-6 space-y-4">
 <div className="flex items-start justify-between">
 <div className="space-y-2">
 <div className="flex items-center gap-3">
 <h2 className="text-xl font-semibold">{contact.name}</h2>
 <Badge variant={priorityBadge.variant}>{priorityBadge.label}</Badge>
 {contact.is_primary ? <Badge variant="primary">Primary</Badge> : null}
 {contact.is_backup ? <Badge variant="secondary">Backup</Badge> : null}
 </div>
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <UserPlus className="h-4 w-4" />
 <span>{contact.relationship}</span>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <Badge variant={contact.verification_status === 'verified' ? 'default' : 'outline'} className="flex items-center gap-1">
 {contact.verification_status === 'verified' ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
 {contact.verification_status === 'verified' ? 'Verified' : 'Verification Needed'}
 </Badge>
 {onEdit ? (
 <Button variant="outline" size="sm" onClick={onEdit}>
 Edit
 </Button>
 ) : null}
 {onVerify && contact.verification_status !== 'verified' ? (
 <Button size="sm" onClick={onVerify}>
 Verify
 </Button>
 ) : null}
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
 <div className="space-y-3">
 <div className="flex items-center gap-2 text-muted-foreground">
 <PhoneCall className="h-4 w-4" />
 <span>{formatPhone(contact.phone_primary)}</span>
 {contact.phone_secondary ? (
 <span className="text-xs">• {formatPhone(contact.phone_secondary)}</span>
 ) : null}
 </div>
 {contact.email ? (
 <div className="flex items-center gap-2 text-muted-foreground">
 <Mail className="h-4 w-4" />
 <span>{contact.email}</span>
 </div>
 ) : null}
 {formatAddress(contact) ? (
 <div className="flex items-center gap-2 text-muted-foreground">
 <MapPin className="h-4 w-4" />
 <span>{formatAddress(contact)}</span>
 </div>
 ) : null}
 </div>
 <div className="space-y-3">
 {contact.availability ? (
 <div className="flex items-center gap-2 text-muted-foreground">
 <Clock className="h-4 w-4" />
 <span>Availability: {contact.availability.replace('_', ' ')}</span>
 </div>
 ) : null}
 {typeof contact.response_time_minutes === 'number' ? (
 <div className="flex items-center gap-2 text-muted-foreground">
 <ArrowRight className="h-4 w-4" />
 <span>Response in ~{contact.response_time_minutes} minutes</span>
 </div>
 ) : null}
 {contact.notes ? (
 <div className="text-muted-foreground">
 <p className="text-xs uppercase tracking-wide font-semibold mb-1">Notes</p>
 <p>{contact.notes}</p>
 </div>
 ) : null}
 </div>
 </div>
 </Card>
 </div>
 );
}
