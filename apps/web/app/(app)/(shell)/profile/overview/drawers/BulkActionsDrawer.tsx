'use client';

import { CheckCircle, XCircle, Trash2, Download, AlertTriangle, Users, Play, X } from "lucide-react";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import {
 Drawer,
 Form,
 FormField,
 FormItem,
 FormLabel,
 FormControl,
 FormMessage,
 Button,
 Badge,
 Avatar,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Alert,
 AlertDescription,
 Checkbox,
} from '@ghxstship/ui';
import type { ProfileOverview } from '../types';
import { BULK_ACTIONS } from '../types';

const bulkActionSchema = z.object({
 action: z.enum(['activate', 'deactivate', 'delete']),
 confirmAction: z.boolean().refine(val => val === true, {
 message: 'You must confirm this action',
 }),
});

type BulkActionFormData = z.infer<typeof bulkActionSchema>;

interface BulkActionsDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 selectedProfiles: ProfileOverview[];
 onExecute: (action: 'activate' | 'deactivate' | 'delete', profileIds: string[]) => Promise<void>;
 loading?: boolean;
}

export default function BulkActionsDrawer({
 isOpen,
 onClose,
 selectedProfiles,
 onExecute,
 loading = false,
}: BulkActionsDrawerProps) {
 const [selectedAction, setSelectedAction] = useState<'activate' | 'deactivate' | 'delete' | null>(null);

 const form = useForm<BulkActionFormData>({
 resolver: zodResolver(bulkActionSchema),
 defaultValues: {
 action: 'activate',
 confirmAction: false,
 },
 });

 const handleSubmit = async (data: BulkActionFormData) => {
 try {
 const profileIds = selectedProfiles.map(p => p.id);
 await onExecute(data.action, profileIds);
 onClose();
 form.reset();
 setSelectedAction(null);
 } catch (error) {
 console.error('Error executing bulk action:', error);
 }
 };

 const getActionDetails = (action: 'activate' | 'deactivate' | 'delete') => {
 const details = {
 activate: {
 title: 'Activate Profiles',
 description: 'Set the selected profiles to active status',
 icon: CheckCircle,
 color: 'success',
 warning: 'This will make the selected profiles active and accessible.',
 },
 deactivate: {
 title: 'Deactivate Profiles',
 description: 'Set the selected profiles to inactive status',
 icon: XCircle,
 color: 'warning',
 warning: 'This will make the selected profiles inactive and may restrict their access.',
 },
 delete: {
 title: 'Delete Profiles',
 description: 'Permanently remove the selected profiles',
 icon: Trash2,
 color: 'destructive',
 warning: 'This action cannot be undone. All profile data will be permanently deleted.',
 },
 };
 return details[action];
 };

 const getAffectedProfilesByAction = (action: 'activate' | 'deactivate' | 'delete') => {
 switch (action) {
 case 'activate':
 return selectedProfiles.filter(p => p.status !== 'active');
 case 'deactivate':
 return selectedProfiles.filter(p => p.status === 'active');
 case 'delete':
 return selectedProfiles;
 default:
 return [];
 }
 };

 const currentActionDetails = selectedAction ? getActionDetails(selectedAction) : null;
 const affectedProfiles = selectedAction ? getAffectedProfilesByAction(selectedAction) : [];

 return (
 <Drawer
 isOpen={isOpen}
 onClose={onClose}
 title="Bulk Actions"
 size="lg"
 >
 <div className="stack-lg">
 {/* Selection Summary */}
 <div className="p-lg bg-secondary/30 rounded-lg">
 <div className="flex items-center gap-md mb-md">
 <div className="p-sm bg-accent/10 rounded-lg">
 <Users className="h-icon-sm w-icon-sm color-accent" />
 </div>
 <div>
 <h3 className="text-heading-4">
 {selectedProfiles.length} Profile{selectedProfiles.length !== 1 ? 's' : ''} Selected
 </h3>
 <p className="text-body-sm color-muted">
 Choose an action to apply to all selected profiles
 </p>
 </div>
 </div>

 {/* Status Breakdown */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
 {['active', 'inactive', 'pending', 'suspended'].map(status => {
 const count = selectedProfiles.filter(p => p.status === status).length;
 return (
 <div key={status} className="text-center p-sm bg-background rounded">
 <div className="text-body-sm font-medium">{count}</div>
 <div className="text-body-xs color-muted capitalize">{status}</div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Action Selection */}
 <Form {...form}>
 <form onSubmit={form.handleSubmit(handleSubmit)} className="stack-lg">
 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Select Action</FormLabel>
 <FormControl>
 <Select
 value={field.value}
 onValueChange={(value) => {
 field.onChange(value);
 setSelectedAction(value as 'activate' | 'deactivate' | 'delete');
 }}
 >
 <SelectTrigger>
 <SelectValue placeholder="Choose an action" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="activate">
 <div className="flex items-center gap-md">
 <CheckCircle className="h-icon-xs w-icon-xs color-success" />
 <div>
 <div className="font-medium">Activate Profiles</div>
 <div className="text-body-xs color-muted">Set profiles to active status</div>
 </div>
 </div>
 </SelectItem>
 <SelectItem value="deactivate">
 <div className="flex items-center gap-md">
 <XCircle className="h-icon-xs w-icon-xs color-warning" />
 <div>
 <div className="font-medium">Deactivate Profiles</div>
 <div className="text-body-xs color-muted">Set profiles to inactive status</div>
 </div>
 </div>
 </SelectItem>
 <SelectItem value="delete">
 <div className="flex items-center gap-md">
 <Trash2 className="h-icon-xs w-icon-xs color-destructive" />
 <div>
 <div className="font-medium">Delete Profiles</div>
 <div className="text-body-xs color-muted">Permanently remove profiles</div>
 </div>
 </div>
 </SelectItem>
 </SelectContent>
 </Select>
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 {/* Action Details */}
 {currentActionDetails && (
 <div className="stack-lg">
 <Alert variant={currentActionDetails.color as unknown}>
 <AlertTriangle className="h-icon-xs w-icon-xs" />
 <AlertDescription>
 <strong>{currentActionDetails.title}:</strong> {currentActionDetails.warning}
 </AlertDescription>
 </Alert>

 {/* Affected Profiles */}
 <div>
 <h4 className="text-body font-medium mb-md">
 Profiles to be affected ({affectedProfiles.length})
 </h4>
 
 {affectedProfiles.length > 0 ? (
 <div className="max-h-container-sm overflow-y-auto border rounded-lg">
 {affectedProfiles.map((profile) => (
 <div
 key={profile.id}
 className="flex items-center gap-md p-md border-b last:border-b-0"
 >
 <Avatar
 src={profile.avatar_url}
 alt={profile.full_name}
 fallback={profile.full_name.charAt(0)}
 size="sm"
 />
 <div className="flex-1">
 <div className="text-body-sm font-medium">
 {profile.full_name}
 </div>
 <div className="text-body-xs color-muted">
 {profile.email} • {profile.job_title || 'No title'}
 </div>
 </div>
 <Badge variant={profile.status === 'active' ? 'success' : 'secondary'} size="sm">
 {profile.status}
 </Badge>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-lg color-muted">
 <Users className="h-icon-lg w-icon-lg mx-auto mb-md opacity-50" />
 <p className="text-body-sm">
 No profiles will be affected by this action
 </p>
 <p className="text-body-xs">
 {selectedAction === 'activate' && 'All selected profiles are already active'}
 {selectedAction === 'deactivate' && 'No active profiles are selected'}
 </p>
 </div>
 )}
 </div>

 {/* Confirmation */}
 {affectedProfiles.length > 0 && (
 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem className="flex flex-row items-start space-x-sm space-y-0">
 <FormControl>
 <Checkbox
 checked={field.value}
 onCheckedChange={field.onChange}
 />
 </FormControl>
 <div className="space-y-xs leading-none">
 <FormLabel className="text-body-sm">
 I understand the consequences of this action
 </FormLabel>
 <div className="text-body-xs color-muted">
 This action will affect {affectedProfiles.length} profile{affectedProfiles.length !== 1 ? 's' : ''}
 {selectedAction === 'delete' && ' and cannot be undone'}
 </div>
 </div>
 <FormMessage />
 </FormItem>
 )}
 />
 )}
 </div>
 )}

 {/* Form Actions */}
 <div className="flex items-center justify-end gap-md pt-lg border-t">
 <Button
 type="button"
 variant="outline"
 onClick={onClose}
 disabled={loading}
 >
 <X className="h-icon-xs w-icon-xs mr-sm" />
 Cancel
 </Button>
 
 <Button
 type="submit"
 variant={currentActionDetails?.color === 'destructive' ? 'destructive' : 'default'}
 disabled={loading || !selectedAction || affectedProfiles.length === 0}
 loading={loading}
 >
 <Play className="h-icon-xs w-icon-xs mr-sm" />
 Execute Action
 </Button>
 </div>
 </form>
 </Form>

 {/* Quick Stats */}
 <div className="p-md bg-info/10 rounded-lg border border-info/20">
 <h5 className="text-body-sm font-medium mb-sm color-info">
 Bulk Action Guidelines
 </h5>
 <ul className="text-body-sm color-muted stack-xs">
 <li>• Review the affected profiles carefully before executing</li>
 <li>• Bulk actions are logged for audit purposes</li>
 <li>• Users will be notified of status changes via email</li>
 <li>• Deleted profiles cannot be recovered</li>
 </ul>
 </div>
 </div>
 </Drawer>
 );
}
