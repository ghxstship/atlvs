'use client';

import { AlertTriangle, Clock, Edit, Globe, Mail, MapPin, Phone, ShieldCheck, User } from "lucide-react";
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
 onVerify
}: ContactCardViewProps) {
 if (loading) {
 return (
 <Card className="p-lg animate-pulse space-y-md">
 <div className="h-icon-md bg-muted rounded w-1/4"></div>
 <div className="h-icon-xs bg-muted rounded w-1/3"></div>
 <div className="h-icon-xs bg-muted rounded w-1/2"></div>
 </Card>
 );
 }

 if (!contact) {
 return (
 <Card className="p-lg text-center text-muted-foreground">
 Unable to load contact information.
 </Card>
 );
 }

 const isVerified = contact.verification_status === 'verified';

 return (
 <div className="space-y-lg">
 <Card className="p-lg">
 <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-lg">
 <div className="space-y-sm">
 <div className="flex items-center gap-sm">
 <Phone className="h-icon-sm w-icon-sm text-primary" />
 <h2 className="text-xl font-semibold">Primary Contact</h2>
 </div>
 <div className="space-y-xs">
 {contact.phone_primary && (
 <div className="flex items-center gap-xs text-sm">
 <Badge variant="secondary">Primary</Badge>
 {formatPhoneNumber(contact.phone_primary)}
 </div>
 )}
 {contact.phone_mobile && (
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Badge variant="outline">Mobile</Badge>
 {formatPhoneNumber(contact.phone_mobile)}
 </div>
 )}
 {contact.phone_work && (
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Badge variant="outline">Work</Badge>
 {formatPhoneNumber(contact.phone_work)}
 {contact.phone_extension && (
 <span className="text-xs text-muted-foreground">ext. {contact.phone_extension}</span>
 )}
 </div>
 )}
 {contact.phone_secondary && (
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Badge variant="outline">Secondary</Badge>
 {formatPhoneNumber(contact.phone_secondary)}
 </div>
 )}
 </div>
 </div>
 <div className="flex items-center gap-sm">
 <Badge variant={isVerified ? 'default' : 'destructive'} className="flex items-center gap-xs">
 {isVerified ? <ShieldCheck className="h-icon-xs w-icon-xs" /> : <AlertTriangle className="h-icon-xs w-icon-xs" />}
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

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 <Card className="p-lg space-y-sm">
 <div className="flex items-center gap-xs">
 <MapPin className="h-icon-sm w-icon-sm text-primary" />
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

 <Card className="p-lg space-y-sm">
 <div className="flex items-center gap-xs">
 <AlertTriangle className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="font-semibold">Emergency Contact</h3>
 </div>
 {contact.emergency_contact_name ? (
 <div className="space-y-xs text-sm">
 <div className="font-medium">{contact.emergency_contact_name}</div>
 {contact.emergency_contact_relationship && (
 <div className="text-muted-foreground">{contact.emergency_contact_relationship}</div>
 )}
 {contact.emergency_contact_phone && (
 <div className="flex items-center gap-xs text-muted-foreground">
 <Phone className="h-icon-xs w-icon-xs" />
 {formatPhoneNumber(contact.emergency_contact_phone)}
 </div>
 )}
 {contact.emergency_contact_email && (
 <div className="flex items-center gap-xs text-muted-foreground">
 <Mail className="h-icon-xs w-icon-xs" />
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

 <Card className="p-lg space-y-sm">
 <div className="flex items-center gap-xs">
 <Globe className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="font-semibold">Contact Preferences</h3>
 </div>
 <div className="space-y-xs text-sm text-muted-foreground">
 <div className="flex items-center gap-xs">
 <Badge variant="outline">Preferred Method</Badge>
 {contact.preferred_contact_method || 'Email'}
 </div>
 {contact.timezone && (
 <div className="flex items-center gap-xs">
 <Clock className="h-icon-xs w-icon-xs" />
 {contact.timezone}
 </div>
 )}
 {contact.do_not_contact && (
 <Badge variant="destructive">Do Not Contact</Badge>
 )}
 </div>
 </Card>

 <Card className="p-lg space-y-sm">
 <div className="flex items-center gap-xs">
 <User className="h-icon-sm w-icon-sm text-primary" />
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
