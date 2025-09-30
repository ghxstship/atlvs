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
 onSelectContact,
}: ContactMapViewProps) {
 if (loading) {
 return (
 <Card className="p-6 space-y-4">
 <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {Array.from({ length: 4 }).map((_, i) => (
 <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
 ))}
 </div>
 </Card>
 );
 }

 if (contacts.length === 0) {
 return (
 <Card className="p-6 text-center text-muted-foreground">
 No contacts available to display on the map.
 </Card>
 );
 }

 return (
 <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
 <Card className="p-6 space-y-4">
 <div className="flex items-center gap-2">
 <MapPin className="h-5 w-5 text-primary" />
 <h3 className="font-semibold">Contact Locations</h3>
 </div>
 <div className="space-y-3">
 {contacts.map(contact => {
 const isSelected = selectedContactId === contact.id;
 const isVerified = contact.verification_status === 'verified';
 return (
 <button
 key={contact.id}
 type="button"
 onClick={() => onSelectContact?.(contact)}
 className={`w-full text-left p-3 rounded-lg border transition-colors ${
 isSelected
 ? 'border-primary bg-primary/10'
 : 'border-border hover:bg-muted/50'
 }`}
 >
 <div className="flex items-center justify-between">
 <div className="space-y-1">
 <div className="flex items-center gap-2 text-sm font-medium">
 <MapPin className="h-4 w-4 text-primary" />
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

 <Card className="p-6">
 <div className="flex items-center gap-2 mb-4">
 <MapPin className="h-5 w-5 text-primary" />
 <h3 className="font-semibold">Selected Contact Details</h3>
 </div>
 {selectedContactId ? (
 (() => {
 const contact = contacts.find(c => c.id === selectedContactId);
 if (!contact) return null;
 const isVerified = contact.verification_status === 'verified';
 return (
 <div className="space-y-4">
 <div className="flex items-center gap-2">
 <Badge variant={isVerified ? 'default' : 'secondary'} className="flex items-center gap-1">
 <ShieldCheck className="h-4 w-4" />
 {isVerified ? 'Verified Contact' : 'Pending Verification'}
 </Badge>
 </div>

 <div className="space-y-3">
 <div>
 <div className="text-sm font-medium">Primary Address</div>
 <div className="text-sm text-muted-foreground">
 {formatAddress(contact) || 'No address details available'}
 </div>
 </div>

 <div>
 <div className="text-sm font-medium">Primary Phone</div>
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <Phone className="h-4 w-4" />
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
