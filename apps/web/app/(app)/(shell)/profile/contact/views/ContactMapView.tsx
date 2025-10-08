'use client';

import { MapPin, Phone, ShieldCheck } from "lucide-react";
import { Card, Badge } from '@ghxstship/ui';
import type { ContactInfo } from '../types';
import { formatPhoneNumber, formatAddress } from '../types';

interface ContactMapViewProps {
 contacts: ContactInfo[];
 loading: boolean;
 selectedContactId?: string | null;
 onSelectContact?: (contact: ContactInfo) => void;
}

export default function ContactMapView({
 contacts,
 loading,
 selectedContactId,
 onSelectContact
}: ContactMapViewProps) {
 if (loading) {
 return (
 <Card className="p-lg space-y-md">
 <div className="h-icon-xs bg-muted rounded w-1/3 animate-pulse"></div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 {Array.from({ length: 4 }).map((_, i) => (
 <div key={i} className="h-component-lg bg-muted rounded animate-pulse"></div>
 ))}
 </div>
 </Card>
 );
 }

 if (contacts.length === 0) {
 return (
 <Card className="p-lg text-center text-muted-foreground">
 No contacts available to display on the map.
 </Card>
 );
 }

 return (
 <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-lg">
 <Card className="p-lg space-y-md">
 <div className="flex items-center gap-xs">
 <MapPin className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="font-semibold">Contact Locations</h3>
 </div>
 <div className="space-y-sm">
 {contacts.map(contact => {
 const isSelected = selectedContactId === contact.id;
 const isVerified = contact.verification_status === 'verified';
 return (
 <button
 key={contact.id}
 type="button"
 onClick={() => onSelectContact?.(contact)}
 className={`w-full text-left p-sm rounded-lg border transition-colors ${
 isSelected
 ? 'border-primary bg-primary/10'
 : 'border-border hover:bg-muted/50'
 }`}
 >
 <div className="flex items-center justify-between">
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm font-medium">
 <MapPin className="h-icon-xs w-icon-xs text-primary" />
 <span>{contact.address_line1 || 'Unknown address'}</span>
 </div>
 <div className="text-xs text-muted-foreground">
 {formatAddress(contact) || 'No address details available'}
 </div>
 </div>
 <Badge variant={isVerified ? 'default' : 'secondary'}>
 {isVerified ? 'Verified' : 'Unverified'}
 </Badge>
 </div>
 </button>
 );
 })}
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center gap-xs mb-4">
 <MapPin className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="font-semibold">Selected Contact Details</h3>
 </div>
 {selectedContactId ? (
 (() => {
 const contact = contacts.find(c => c.id === selectedContactId);
 if (!contact) return null;
 const isVerified = contact.verification_status === 'verified';
 return (
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <Badge variant={isVerified ? 'default' : 'secondary'} className="flex items-center gap-xs">
 <ShieldCheck className="h-icon-xs w-icon-xs" />
 {isVerified ? 'Verified Contact' : 'Pending Verification'}
 </Badge>
 </div>

 <div className="space-y-sm">
 <div>
 <div className="text-sm font-medium">Primary Address</div>
 <div className="text-sm text-muted-foreground">
 {formatAddress(contact) || 'No address details available'}
 </div>
 </div>

 <div>
 <div className="text-sm font-medium">Primary Phone</div>
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Phone className="h-icon-xs w-icon-xs" />
 {contact.phone_primary ? formatPhoneNumber(contact.phone_primary) : 'No phone number provided'}
 </div>
 </div>

 {contact.emergency_contact_name && (
 <div>
 <div className="text-sm font-medium">Emergency Contact</div>
 <div className="text-sm text-muted-foreground">
 {contact.emergency_contact_name}
 </div>
 </div>
 )}
 </div>
 </div>
 );
 })()
 ) : (
 <div className="text-sm text-muted-foreground">
 Select a contact from the list to view detailed information.
 </div>
 )}
 </Card>
 </div>
 );
}
