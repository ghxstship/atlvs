'use client';

import { ShieldAlert, CheckCircle2 } from "lucide-react";
import { useMemo, type ChangeEvent } from 'react';
import {
 Button,
 Card,
 UnifiedInput,
 Textarea,
 Select,
 SelectTrigger,
 SelectValue,
 SelectContent,
 SelectItem,
 Checkbox,
 Badge,
} from '@ghxstship/ui';
import type { EmergencyContact, EmergencyContactFormData, FieldConfig } from '../types';
import {
 CONTACT_FIELD_CONFIG,
 EmergencyAvailability,
 EmergencyPriority,
 EmergencyVerificationStatus,
} from '../types';

interface EmergencyFormViewProps {
 contact: EmergencyContact | null;
 formData: EmergencyContactFormData;
 formErrors: Record<string, string>;
 loading: boolean;
 saving: boolean;
 onFieldChange: (field: keyof EmergencyContactFormData, value: EmergencyContactFormData[keyof EmergencyContactFormData]) => void;
 onSave: () => void;
 onVerify?: () => void;
}

const sectionOrder = ['Identity', 'Contact Details', 'Availability', 'Status', 'Location', 'Additional Details'];

const selectValues: Record<string, { value: string; label: string }[]> = {
 priority_level: CONTACT_FIELD_CONFIG.find(field => field.key === 'priority_level')?.options ?? [],
 verification_status: CONTACT_FIELD_CONFIG.find(field => field.key === 'verification_status')?.options ?? [],
 availability: CONTACT_FIELD_CONFIG.find(field => field.key === 'availability')?.options ?? [],
};

function renderField(
 config: FieldConfig,
 formData: EmergencyContactFormData,
 formErrors: Record<string, string>,
 onFieldChange: (field: keyof EmergencyContactFormData, value: EmergencyContactFormData[keyof EmergencyContactFormData]) => void
) {
 const value = formData[config.key as keyof EmergencyContactFormData] as string | number | boolean | undefined;
 const error = formErrors[config.key as string];

 switch (config.type) {
 case 'checkbox':
 return (
 <div key={config.key} className="flex items-center gap-2">
 <Checkbox
 checked={Boolean(value)}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 onFieldChange(config.key as keyof EmergencyContactFormData, event.target.checked)
 }
 />
 <div>
 <p className="text-sm font-medium">{config.label}</p>
 {config.description ? (
 <p className="text-xs text-muted-foreground">{config.description}</p>
 ) : null}
 </div>
 </div>
 );

 case 'textarea':
 return (
 <div key={config.key} className="col-span-full">
 <label className="text-sm font-medium text-muted-foreground mb-1 block">
 {config.label}
 </label>
 <Textarea
 value={(value as string) ?? ''}
 onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
 onFieldChange(config.key as keyof EmergencyContactFormData, event.target.value)
 }
 rows={4}
 placeholder={config.placeholder}
 />
 {error ? <p className="text-xs text-destructive mt-1">{error}</p> : null}
 </div>
 );

 case 'select':
 return (
 <div key={config.key}>
 <label className="text-sm font-medium text-muted-foreground mb-1 block">
 {config.label}
 </label>
 <Select
 value={(value as string) ?? ''}
 onValueChange={(selected) =>
 onFieldChange(config.key as keyof EmergencyContactFormData, selected as EmergencyContactFormData[keyof EmergencyContactFormData])
 }
 >
 <SelectTrigger>
 <SelectValue placeholder={config.placeholder ?? `Select ${config.label.toLowerCase()}`} />
 </SelectTrigger>
 <SelectContent>
 {selectValues[config.key as string]?.map(option => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 {error ? <p className="text-xs text-destructive mt-1">{error}</p> : null}
 </div>
 );

 default:
 return (
 <div key={config.key}>
 <label className="text-sm font-medium text-muted-foreground mb-1 block">
 {config.label}
 </label>
 <UnifiedInput
 value={(value as string | number | undefined) ?? ''}
 type={config.type === 'number' ? 'number' : config.type === 'email' ? 'email' : 'text'}
 placeholder={config.placeholder}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 onFieldChange(config.key as keyof EmergencyContactFormData, config.type === 'number'
 ? Number(event.target.value)
 : event.target.value)
 }
 error={error}
 />
 </div>
 );
 }
}

export default function EmergencyFormView({
 contact,
 formData,
 formErrors,
 loading,
 saving,
 onFieldChange,
 onSave,
 onVerify,
}: EmergencyFormViewProps) {
 const sections = useMemo(() => {
 return CONTACT_FIELD_CONFIG.reduce<Record<string, FieldConfig[]((acc, field) => {
 const section = field.section ?? 'Other';
 if (!acc[section]) acc[section] = [];
 acc[section].push(field);
 return acc;
 }, {});
 }, []);

 if (loading) {
 return (
 <Card className="p-6 space-y-4">
 <div className="h-5 w-1/3 bg-muted animate-pulse rounded" />
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {Array.from({ length: 6 }).map((_, index) => (
 <div key={index} className="h-12 bg-muted animate-pulse rounded" />
 ))}
 </div>
 </Card>
 );
 }

 return (
 <form
 className="space-y-6"
 onSubmit={(event) => {
 event.preventDefault();
 onSave();
 }}
 >
 {contact ? (
 <Card className="p-4 flex items-center justify-between">
 <div className="flex items-center gap-3">
 {contact.verification_status === 'verified' ? (
 <>
 <CheckCircle2 className="h-5 w-5 text-success" />
 <div>
 <p className="text-sm font-medium">Emergency contact verified</p>
 {contact.last_verified ? (
 <p className="text-xs text-muted-foreground">
 Last verified {new Date(contact.last_verified).toLocaleDateString()}
 </p>
 ) : null}
 </div>
 </>
 ) : (
 <>
 <ShieldAlert className="h-5 w-5 text-warning" />
 <div>
 <p className="text-sm font-medium">Verification pending</p>
 <p className="text-xs text-muted-foreground">
 Verify emergency contacts regularly to ensure accuracy
 </p>
 </div>
 </>
 )}
 </div>
 {onVerify && contact.verification_status !== 'verified' ? (
 <Button type="button" variant="outline" size="sm" onClick={onVerify}>
 Verify Contact
 </Button>
 ) : null}
 </Card>
 ) : null}

 {sectionOrder.map(section => {
 const fields = sections[section];
 if (!fields?.length) return null;
 return (
 <Card key={section} className="p-6 space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
 {section}
 </h3>
 {section === 'Status' ? (
 <Badge variant="secondary">
 Priority: {formData.priority_level.toUpperCase()}
 </Badge>
 ) : null}
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {fields.map(field =>
 renderField(field, formData, formErrors, onFieldChange)
 )}
 </div>
 </Card>
 );
 })}

 <div className="flex justify-end gap-2">
 <Button type="submit" disabled={saving}>
 {saving ? 'Saving...' : 'Save Emergency Contact'}
 </Button>
 </div>
 </form>
 );
}
