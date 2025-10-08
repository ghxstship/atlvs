'use client';

import { X, Save, Plane, Calendar, CreditCard, Globe, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from 'react';
import {
 Button,
 Input,
 Textarea,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Label,
 Checkbox,
 Badge
} from '@ghxstship/ui';
import type { TravelRecord, TravelFormData, TravelType, VisaStatus, TravelStatus } from '../types';
import {
 TRAVEL_TYPE_LABELS,
 VISA_STATUS_LABELS,
 TRAVEL_STATUS_LABELS,
 COMMON_COUNTRIES,
 CURRENCIES,
 createEmptyFormData,
 validateTravelForm
} from '../types';

interface CreateTravelRecordDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 onSave: (data: TravelFormData) => Promise<void>;
 record?: TravelRecord | null;
 loading?: boolean;
 recentCountries?: string[];
 recentDestinations?: string[];
}

export default function CreateTravelRecordDrawer({
 isOpen,
 onClose,
 onSave,
 record,
 loading = false,
 recentCountries = [],
 recentDestinations = []
}: CreateTravelRecordDrawerProps) {
 const [formData, setFormData] = useState<TravelFormData>(createEmptyFormData());
 const [formErrors, setFormErrors] = useState<Record<string, string>({});

 useEffect(() => {
 if (!isOpen) {
 return;
 }

 if (record) {
 setFormData({
 travel_type: record.travel_type,
 destination: record.destination,
 country: record.country,
 purpose: record.purpose,
 start_date: record.start_date,
 end_date: record.end_date,
 accommodation: record.accommodation || '',
 transportation: record.transportation || '',
 visa_required: record.visa_required,
 visa_status: record.visa_status,
 passport_used: record.passport_used || '',
 notes: record.notes || '',
 expenses: record.expenses !== null && record.expenses !== undefined ? record.expenses.toString() : '',
 currency: record.currency || 'USD',
 status: record.status,
 booking_reference: record.booking_reference || '',
 emergency_contact: record.emergency_contact || ''
 });
 } else {
 setFormData(createEmptyFormData());
 }

 setFormErrors({});
 }, [isOpen, record]);

 const countryOptions = useMemo(() => {
 const combined = new Set<string>([
 ...recentCountries,
 ...COMMON_COUNTRIES,
 ]);
 return Array.from(combined).sort();
 }, [recentCountries]);

 const destinationSuggestions = useMemo(() => {
 return Array.from(new Set(recentDestinations)).slice(0, 10);
 }, [recentDestinations]);

 if (!isOpen) return null;

 const handleInputChange = (field: keyof TravelFormData, value: string | boolean) => {
 setFormData(prev => ({
 ...prev,
 [field]: value
 }));

 if (formErrors[field as string]) {
 setFormErrors(prev => {
 const next = { ...prev };
 delete next[field as string];
 return next;
 });
 }
 };

 const handleSubmit = async () => {
 const errors = validateTravelForm(formData);
 if (Object.keys(errors).length > 0) {
 setFormErrors(errors);
 return;
 }

 await onSave(formData);
 };

 return (
 <div className="fixed inset-0 z-50 overflow-hidden">
 <div className="absolute inset-0 bg-black/50" onClick={onClose} />
 <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-background shadow-xl">
 <div className="flex h-full flex-col">
 {/* Header */}
 <div className="flex items-center justify-between border-b p-lg">
 <div>
 <h2 className="text-xl font-semibold">
 {record ? 'Edit Travel Record' : 'Create Travel Record'}
 </h2>
 <p className="text-sm text-muted-foreground">
 {record ? 'Update the details of this travel record' : 'Log a new trip with full travel details'}
 </p>
 </div>
 <Button variant="ghost" size="sm" onClick={onClose}>
 <X className="h-icon-xs w-icon-xs" />
 </Button>
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto p-lg">
 <div className="grid grid-cols-1 gap-lg">
 {/* Trip Overview */}
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <Plane className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="font-medium">Trip Overview</h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <Label htmlFor="travel_type">Travel Type</Label>
 <Select
 value={formData.travel_type}
 onValueChange={(value) => handleInputChange('travel_type', value as TravelType)}
 disabled={loading}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(TRAVEL_TYPE_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div>
 <Label htmlFor="status">Travel Status</Label>
 <Select
 value={formData.status}
 onValueChange={(value) => handleInputChange('status', value as TravelStatus)}
 disabled={loading}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(TRAVEL_STATUS_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <Label htmlFor="destination">Destination</Label>
 <Input
 
 placeholder="City or location"
 value={formData.destination}
 onChange={(event) => handleInputChange('destination', event.target.value)}
 disabled={loading}
 list="travel-destination-suggestions"
 />
 {formErrors.destination && (
 <p className="text-sm text-destructive">{formErrors.destination}</p>
 )}
 {destinationSuggestions.length > 0 && (
 <datalist >
 {destinationSuggestions.map(destination => (
 <option key={destination} value={destination} />
 ))}
 </datalist>
 )}
 </div>
 <div>
 <Label htmlFor="country">Country</Label>
 <Select
 value={formData.country || ''}
 onValueChange={(value) => handleInputChange('country', value)}
 disabled={loading}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select country" />
 </SelectTrigger>
 <SelectContent>
 {countryOptions.map(country => (
 <SelectItem key={country} value={country}>
 {country}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 {formErrors.country && (
 <p className="text-sm text-destructive">{formErrors.country}</p>
 )}
 </div>
 </div>

 <div>
 <Label htmlFor="purpose">Purpose</Label>
 <Input
 
 placeholder="Trip purpose"
 value={formData.purpose}
 onChange={(event) => handleInputChange('purpose', event.target.value)}
 disabled={loading}
 />
 {formErrors.purpose && (
 <p className="text-sm text-destructive">{formErrors.purpose}</p>
 )}
 </div>
 </div>

 {/* Travel Dates */}
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <Calendar className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="font-medium">Travel Dates</h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <Label htmlFor="start_date">Start Date</Label>
 <Input
 
 type="date"
 value={formData.start_date}
 onChange={(event) => handleInputChange('start_date', event.target.value)}
 disabled={loading}
 />
 {formErrors.start_date && (
 <p className="text-sm text-destructive">{formErrors.start_date}</p>
 )}
 </div>
 <div>
 <Label htmlFor="end_date">End Date</Label>
 <Input
 
 type="date"
 value={formData.end_date}
 onChange={(event) => handleInputChange('end_date', event.target.value)}
 disabled={loading}
 />
 {formErrors.end_date && (
 <p className="text-sm text-destructive">{formErrors.end_date}</p>
 )}
 </div>
 </div>
 </div>

 {/* Travel Logistics */}
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <Globe className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="font-medium">Travel Logistics</h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <Label htmlFor="accommodation">Accommodation</Label>
 <Input
 
 placeholder="Hotel, Airbnb, etc."
 value={formData.accommodation}
 onChange={(event) => handleInputChange('accommodation', event.target.value)}
 disabled={loading}
 />
 </div>
 <div>
 <Label htmlFor="transportation">Transportation</Label>
 <Input
 
 placeholder="Flight, car, train, etc."
 value={formData.transportation}
 onChange={(event) => handleInputChange('transportation', event.target.value)}
 disabled={loading}
 />
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <Label htmlFor="booking_reference">Booking Reference</Label>
 <Input
 
 placeholder="Booking confirmation number"
 value={formData.booking_reference}
 onChange={(event) => handleInputChange('booking_reference', event.target.value)}
 disabled={loading}
 />
 </div>
 <div>
 <Label htmlFor="emergency_contact">Emergency Contact</Label>
 <Input
 
 placeholder="Name, phone, or email"
 value={formData.emergency_contact}
 onChange={(event) => handleInputChange('emergency_contact', event.target.value)}
 disabled={loading}
 />
 </div>
 </div>
 </div>

 {/* Visa & Passport */}
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <ShieldCheck className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="font-medium">Visa & Passport</h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="flex items-center gap-xs">
 <Checkbox
 
 checked={formData.visa_required}
 onCheckedChange={(checked) => handleInputChange('visa_required', !!checked)}
 disabled={loading}
 />
 <Label htmlFor="visa_required">Visa required for this trip</Label>
 </div>
 {formData.visa_required && (
 <div>
 <Label htmlFor="visa_status">Visa Status</Label>
 <Select
 value={formData.visa_status}
 onValueChange={(value) => handleInputChange('visa_status', value as VisaStatus)}
 disabled={loading}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(VISA_STATUS_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 )}
 </div>
 <div>
 <Label htmlFor="passport_used">Passport Used</Label>
 <Input
 
 placeholder="Passport number or descriptor"
 value={formData.passport_used}
 onChange={(event) => handleInputChange('passport_used', event.target.value)}
 disabled={loading}
 />
 </div>
 </div>

 {/* Expenses */}
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <CreditCard className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="font-medium">Travel Expenses</h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <Label htmlFor="expenses">Total Expenses</Label>
 <Input
 
 type="number"
 min="0"
 placeholder="0"
 value={formData.expenses}
 onChange={(event) => handleInputChange('expenses', event.target.value)}
 disabled={loading}
 />
 {formErrors.expenses && (
 <p className="text-sm text-destructive">{formErrors.expenses}</p>
 )}
 </div>
 <div>
 <Label htmlFor="currency">Currency</Label>
 <Select
 value={formData.currency}
 onValueChange={(value) => handleInputChange('currency', value)}
 disabled={loading}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {CURRENCIES.map(currency => (
 <SelectItem key={currency.code} value={currency.code}>
 {currency.code} — {currency.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>

 {/* Notes */}
 <div className="space-y-xs">
 <Label htmlFor="notes">Notes</Label>
 <Textarea
 
 placeholder="Additional notes, travel instructions, or important details"
 value={formData.notes}
 onChange={(event) => handleInputChange('notes', event.target.value)}
 disabled={loading}
 rows={4}
 />
 </div>
 </div>
 </div>

 {/* Footer */}
 <div className="border-t p-lg">
 <div className="flex items-center justify-end gap-sm">
 <Button variant="outline" onClick={onClose} disabled={loading}>
 Cancel
 </Button>
 <Button onClick={handleSubmit} disabled={loading}>
 <Save className="h-icon-xs w-icon-xs mr-2" />
 {loading ? 'Saving...' : record ? 'Update Trip' : 'Create Trip'}
 </Button>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
