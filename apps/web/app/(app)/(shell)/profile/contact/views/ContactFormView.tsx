'use client';

import { Save, Phone, MapPin, AlertTriangle, User, Globe, Clock, Shield, CheckCircle } from "lucide-react";
import { useState, type ChangeEvent } from 'react';
import { 
 Card, 
 Button,
 UnifiedInput,
 Textarea,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Checkbox,
 Badge,
} from '@ghxstship/ui';
import type { ContactInfo, ContactFormData, FieldConfig } from '../types';
import { CONTACT_FIELD_CONFIG, COUNTRIES, TIMEZONES, formatPhoneNumber } from '../types';

interface ContactFormViewProps {
 contact: ContactInfo | null;
 formData: ContactFormData;
 formErrors: Record<string, string>;
 loading: boolean;
 saving: boolean;
 onFieldChange: (field: keyof ContactFormData, value: unknown) => void;
 onSave: () => void;
 onVerify?: () => void;
 fieldVisibility?: Record<string, boolean>;
}

export default function ContactFormView({
 contact,
 formData,
 formErrors,
 loading,
 saving,
 onFieldChange,
 onSave,
 onVerify,
 fieldVisibility = {},
}: ContactFormViewProps) {
 const [expandedSections, setExpandedSections] = useState<Record<string, boolean>({
 'Phone Information': true,
 'Primary Address': true,
 'Billing Address': false,
 'Emergency Contact': true,
 'Additional Information': false,
 });

 const toggleSection = (section: string) => {
 setExpandedSections(prev => ({
 ...prev,
 [section]: !prev[section],
 }));
 };

 const handleBillingSameAsPrimary = (checked: boolean) => {
 onFieldChange('billing_same_as_primary', checked);
 if (checked) {
 onFieldChange('billing_address_line1', formData.address_line1);
 onFieldChange('billing_address_line2', formData.address_line2);
 onFieldChange('billing_city', formData.city);
 onFieldChange('billing_state_province', formData.state_province);
 onFieldChange('billing_postal_code', formData.postal_code);
 onFieldChange('billing_country', formData.country);
 }
 };

 const renderField = (config: FieldConfig) => {
 if (fieldVisibility[config.key] === false) return null;

 const value = formData[config.key as keyof ContactFormData] || '';
 const error = formErrors[config.key];

 switch (config.type) {
 case 'tel':
 return (
 <UnifiedInput
 key={config.key}
 label={config.label}
 value={value as string}
 onChange={(e: ChangeEvent<HTMLInputElement>) => 
 onFieldChange(config.key as keyof ContactFormData, e.target.value)
 }
 error={error}
 placeholder={config.placeholder}
 required={config.required}
 onBlur={(e: ChangeEvent<HTMLInputElement>) => {
 const formatted = formatPhoneNumber(e.target.value);
 onFieldChange(config.key as keyof ContactFormData, formatted);
 }}
 />
 );

 case 'textarea':
 return (
 <div key={config.key} className="col-span-2">
 <label className="text-sm font-medium mb-1 block">
 {config.label}
 </label>
 <Textarea
 value={value as string}
 onChange={(e: ChangeEvent<HTMLTextAreaElement>) => 
 onFieldChange(config.key as keyof ContactFormData, e.target.value)
 }
 placeholder={config.placeholder}
 rows={3}
 />
 {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
 </div>
 );

 case 'checkbox':
 return (
 <div key={config.key} className="flex items-center gap-2">
 <Checkbox
 checked={value as boolean}
 onCheckedChange={(checked) => 
 onFieldChange(config.key as keyof ContactFormData, checked)
 }
 />
 <label className="text-sm">{config.label}</label>
 </div>
 );

 default:
 return (
 <UnifiedInput
 key={config.key}
 label={config.label}
 type={config.type}
 value={value as string}
 onChange={(e: ChangeEvent<HTMLInputElement>) => 
 onFieldChange(config.key as keyof ContactFormData, e.target.value)
 }
 error={error}
 placeholder={config.placeholder}
 required={config.required}
 />
 );
 }
 };

 if (loading) {
 return (
 <div className="space-y-4">
 <Card className="p-6">
 <div className="animate-pulse space-y-4">
 <div className="h-4 bg-muted rounded w-1/4"></div>
 <div className="h-10 bg-muted rounded"></div>
 <div className="h-10 bg-muted rounded"></div>
 </div>
 </Card>
 </div>
 );
 }

 const sections = CONTACT_FIELD_CONFIG.reduce((acc, field) => {
 const section = field.section || 'Other';
 if (!acc[section]) acc[section] = [];
 acc[section].push(field);
 return acc;
 }, {} as Record<string, FieldConfig[]);

 return (
 <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-6">
 {/* Verification Status */}
 {contact && (
 <Card className="p-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 {contact.verification_status === 'verified' ? (
 <>
 <CheckCircle className="h-5 w-5 text-green-500" />
 <div>
 <span className="font-medium">Contact Verified</span>
 {contact.last_verified && (
 <span className="text-sm text-muted-foreground ml-2">
 Last verified: {new Date(contact.last_verified).toLocaleDateString()}
 </span>
 )}
 </div>
 </>
 ) : (
 <>
 <AlertTriangle className="h-5 w-5 text-yellow-500" />
 <span className="font-medium">Contact Not Verified</span>
 </>
 )}
 </div>
 {onVerify && contact.verification_status !== 'verified' && (
 <Button variant="outline" size="sm" onClick={onVerify}>
 <Shield className="mr-2 h-4 w-4" />
 Verify Contact
 </Button>
 )}
 </div>
 </Card>
 )}

 {/* Phone Information */}
 <Card>
 <div 
 className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50"
 onClick={() => toggleSection('Phone Information')}
 >
 <div className="flex items-center gap-2">
 <Phone className="h-5 w-5" />
 <h3 className="font-semibold">Phone Information</h3>
 </div>
 <Badge variant="secondary">
 {expandedSections['Phone Information'] ? '−' : '+'}
 </Badge>
 </div>
 {expandedSections['Phone Information'] && (
 <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
 {sections['Phone Information']?.map(renderField)}
 </div>
 )}
 </Card>

 {/* Primary Address */}
 <Card>
 <div 
 className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50"
 onClick={() => toggleSection('Primary Address')}
 >
 <div className="flex items-center gap-2">
 <MapPin className="h-5 w-5" />
 <h3 className="font-semibold">Primary Address</h3>
 </div>
 <Badge variant="secondary">
 {expandedSections['Primary Address'] ? '−' : '+'}
 </Badge>
 </div>
 {expandedSections['Primary Address'] && (
 <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
 {sections['Primary Address']?.map(field => {
 if (field.key === 'country') {
 return (
 <div key={field.key}>
 <label className="text-sm font-medium mb-1 block">
 {field.label}
 </label>
 <Select
 value={formData.country || ''}
 onValueChange={(value) => onFieldChange('country', value)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select country" />
 </SelectTrigger>
 <SelectContent>
 {COUNTRIES.map(country => (
 <SelectItem key={country.value} value={country.value}>
 {country.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 );
 }
 return renderField(field);
 })}
 </div>
 )}
 </Card>

 {/* Billing Address */}
 <Card>
 <div 
 className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50"
 onClick={() => toggleSection('Billing Address')}
 >
 <div className="flex items-center gap-2">
 <MapPin className="h-5 w-5" />
 <h3 className="font-semibold">Billing Address</h3>
 </div>
 <Badge variant="secondary">
 {expandedSections['Billing Address'] ? '−' : '+'}
 </Badge>
 </div>
 {expandedSections['Billing Address'] && (
 <div className="p-4 pt-0 space-y-4">
 <div className="flex items-center gap-2">
 <Checkbox
 checked={formData.billing_same_as_primary || false}
 onCheckedChange={handleBillingSameAsPrimary}
 />
 <label className="text-sm">Same as primary address</label>
 </div>
 {!formData.billing_same_as_primary && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <UnifiedInput
 
 value={formData.billing_address_line1 || ''}
 onChange={(e: ChangeEvent<HTMLInputElement>) => 
 onFieldChange('billing_address_line1', e.target.value)
 }
 placeholder="123 Main Street"
 />
 <UnifiedInput
 
 value={formData.billing_address_line2 || ''}
 onChange={(e: ChangeEvent<HTMLInputElement>) => 
 onFieldChange('billing_address_line2', e.target.value)
 }
 placeholder="Apt 4B"
 />
 <UnifiedInput
 
 value={formData.billing_city || ''}
 onChange={(e: ChangeEvent<HTMLInputElement>) => 
 onFieldChange('billing_city', e.target.value)
 }
 placeholder="San Francisco"
 />
 <UnifiedInput
 
 value={formData.billing_state_province || ''}
 onChange={(e: ChangeEvent<HTMLInputElement>) => 
 onFieldChange('billing_state_province', e.target.value)
 }
 placeholder="California"
 />
 <UnifiedInput
 
 value={formData.billing_postal_code || ''}
 onChange={(e: ChangeEvent<HTMLInputElement>) => 
 onFieldChange('billing_postal_code', e.target.value)
 }
 placeholder="94102"
 />
 <Select
 value={formData.billing_country || ''}
 onValueChange={(value) => onFieldChange('billing_country', value)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select country" />
 </SelectTrigger>
 <SelectContent>
 {COUNTRIES.map(country => (
 <SelectItem key={country.value} value={country.value}>
 {country.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 )}
 </div>
 )}
 </Card>

 {/* Emergency Contact */}
 <Card>
 <div 
 className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50"
 onClick={() => toggleSection('Emergency Contact')}
 >
 <div className="flex items-center gap-2">
 <AlertTriangle className="h-5 w-5" />
 <h3 className="font-semibold">Emergency Contact</h3>
 </div>
 <Badge variant="secondary">
 {expandedSections['Emergency Contact'] ? '−' : '+'}
 </Badge>
 </div>
 {expandedSections['Emergency Contact'] && (
 <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
 {sections['Emergency Contact']?.map(renderField)}
 </div>
 )}
 </Card>

 {/* Additional Information */}
 <Card>
 <div 
 className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50"
 onClick={() => toggleSection('Additional Information')}
 >
 <div className="flex items-center gap-2">
 <Globe className="h-5 w-5" />
 <h3 className="font-semibold">Additional Information</h3>
 </div>
 <Badge variant="secondary">
 {expandedSections['Additional Information'] ? '−' : '+'}
 </Badge>
 </div>
 {expandedSections['Additional Information'] && (
 <div className="p-4 pt-0 space-y-4">
 <div>
 <label className="text-sm font-medium mb-1 block">Timezone</label>
 <Select
 value={formData.timezone || ''}
 onValueChange={(value) => onFieldChange('timezone', value)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select timezone" />
 </SelectTrigger>
 <SelectContent>
 {TIMEZONES.map(tz => (
 <SelectItem key={tz.value} value={tz.value}>
 {tz.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 
 <div>
 <label className="text-sm font-medium mb-1 block">Preferred Contact Method</label>
 <Select
 value={formData.preferred_contact_method || 'email'}
 onValueChange={(value) => onFieldChange('preferred_contact_method', value)}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="email">Email</SelectItem>
 <SelectItem value="phone">Phone</SelectItem>
 <SelectItem value="sms">SMS</SelectItem>
 <SelectItem value="mail">Mail</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="flex items-center gap-2">
 <Checkbox
 checked={formData.do_not_contact || false}
 onCheckedChange={(checked) => onFieldChange('do_not_contact', checked)}
 />
 <label className="text-sm">Do not contact</label>
 </div>

 <div>
 <label className="text-sm font-medium mb-1 block">Contact Notes</label>
 <Textarea
 value={formData.contact_notes || ''}
 onChange={(e: ChangeEvent<HTMLTextAreaElement>) => 
 onFieldChange('contact_notes', e.target.value)
 }
 placeholder="Additional notes about contact preferences..."
 rows={3}
 />
 </div>
 </div>
 )}
 </Card>

 {/* Save Button */}
 <div className="flex justify-end">
 <Button type="submit" disabled={saving}>
 <Save className="mr-2 h-4 w-4" />
 {saving ? 'Saving...' : 'Save Contact Information'}
 </Button>
 </div>
 </form>
 );
}
