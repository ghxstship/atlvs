'use client';

import { Phone, MapPin, ShieldCheck, AlertTriangle, Mail, Globe, Clock, User } from "lucide-react";
import { Card, Badge, Button } from '@ghxstship/ui';
import type { ContactInfo } from '../types';
import { formatPhoneNumber, formatAddress } from '../types';

interface ContactCardViewProps {
 contact: ContactInfo | null;
 loading: boolean;
 onEdit?: () => void;
 onVerify?: () => void;
}

export default function ContactCardView({
 contact,
 loading,
 onEdit,
 onVerify,
}: ContactCardViewProps) {
 if (loading) {
 return (
 <Card className="p-6 animate-pulse space-y-4">
 <div className="h-6 bg-muted rounded w-1/4"></div>
 <div className="h-4 bg-muted rounded w-1/3"></div>
 <div className="h-4 bg-muted rounded w-1/2"></div>
 </Card>
 );
 }

 if (!contact) {
 return (
 <Card className="p-6 text-center text-muted-foreground">
 Unable to load contact information.
 </Card>
 );
 }

 const isVerified = contact.verification_status === 'verified';

 return (
 <div className="space-y-6">
 <Card className="p-6">
 <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
 <div className="space-y-3">
 <div className="flex items-center gap-3">
 <Phone className="h-5 w-5 text-primary" />
 <h2 className="text-xl font-semibold">Primary Contact</h2>
 </div>
 <div className="space-y-2">
 {contact.phone_primary && (
 <div className="flex items-center gap-2 text-sm">
 <Badge variant="secondary">Primary</Badge>
 {formatPhoneNumber(contact.phone_primary)}
 </div>
 )}
 {contact.phone_mobile && (
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <Badge variant="outline">Mobile</Badge>
 {formatPhoneNumber(contact.phone_mobile)}
 </div>
 )}
 {contact.phone_work && (
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <Badge variant="outline">Work</Badge>
 {formatPhoneNumber(contact.phone_work)}
 {contact.phone_extension && (
 <span className="text-xs text-muted-foreground">ext. {contact.phone_extension}</span>
 )}
 </div>
 )}
 {contact.phone_secondary && (
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <Badge variant="outline">Secondary</Badge>
 {formatPhoneNumber(contact.phone_secondary)}
 </div>
 )}
 </div>
 </div>
 <div className="flex items-center gap-3">
 <Badge variant={isVerified ? 'default' : 'destructive'} className="flex items-center gap-1">
 {isVerified ? <ShieldCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
 {isVerified ? 'Verified' : 'Not Verified'}
 </Badge>
 <Button variant="outline" size="sm" onClick={onEdit}>
 Edit
 </Button>
 {!isVerified && onVerify && (
 <Button size="sm" onClick={onVerify}>
 Verify
 </Button>
 )}
 </div>
 </div>
 </Card>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <Card className="p-6 space-y-3">
 <div className="flex items-center gap-2">
 <MapPin className="h-5 w-5 text-primary" />
 <h3 className="font-semibold">Primary Address</h3>
 </div>
 {contact.address_line1 ? (
 <div className="text-sm text-muted-foreground">
 {formatAddress(contact)}
 </div>
 ) : (
 <div className="text-sm text-muted-foreground">
 No primary address provided.
 </div>
 )}
 </Card>

 <Card className="p-6 space-y-3">
 <div className="flex items-center gap-2">
 <AlertTriangle className="h-5 w-5 text-primary" />
 <h3 className="font-semibold">Emergency Contact</h3>
 </div>
 {contact.emergency_contact_name ? (
 <div className="space-y-2 text-sm">
 <div className="font-medium">{contact.emergency_contact_name}</div>
 {contact.emergency_contact_relationship && (
 <div className="text-muted-foreground">{contact.emergency_contact_relationship}</div>
 )}
 {contact.emergency_contact_phone && (
 <div className="flex items-center gap-2 text-muted-foreground">
 <Phone className="h-4 w-4" />
 {formatPhoneNumber(contact.emergency_contact_phone)}
 </div>
 )}
 {contact.emergency_contact_email && (
 <div className="flex items-center gap-2 text-muted-foreground">
 <Mail className="h-4 w-4" />
 {contact.emergency_contact_email}
 </div>
 )}
 </div>
 ) : (
 <div className="text-sm text-muted-foreground">
 No emergency contact information provided.
 </div>
 )}
 </Card>

 <Card className="p-6 space-y-3">
 <div className="flex items-center gap-2">
 <Globe className="h-5 w-5 text-primary" />
 <h3 className="font-semibold">Contact Preferences</h3>
 </div>
 <div className="space-y-2 text-sm text-muted-foreground">
 <div className="flex items-center gap-2">
 <Badge variant="outline">Preferred Method</Badge>
 {contact.preferred_contact_method || 'Email'}
 </div>
 {contact.timezone && (
 <div className="flex items-center gap-2">
 <Clock className="h-4 w-4" />
 {contact.timezone}
 </div>
 )}
 {contact.do_not_contact && (
 <Badge variant="destructive">Do Not Contact</Badge>
 )}
 </div>
 </Card>

 <Card className="p-6 space-y-3">
 <div className="flex items-center gap-2">
 <User className="h-5 w-5 text-primary" />
 <h3 className="font-semibold">Additional Notes</h3>
 </div>
 <div className="text-sm text-muted-foreground">
 {contact.contact_notes || 'No additional notes provided.'}
 </div>
 </Card>
 </div>
 </div>
 );
}
