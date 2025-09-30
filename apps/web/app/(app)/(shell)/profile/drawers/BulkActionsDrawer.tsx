'use client';

import { Users, UserCheck, UserX, Trash2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useState } from 'react';
import {
 Drawer,
 Button,
 Card,
 Badge,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Label,
 Checkbox,
 useToast,
 Alert,
 AlertDescription,
} from '@ghxstship/ui';

import type { UserProfile, BulkActionConfig } from '../types';

const BULK_ACTIONS: BulkActionConfig[] = [
 {
 action: 'activate',
 label: 'Activate Profiles',
 description: 'Set selected profiles to active status',
 confirmationRequired: false,
 variant: 'default',
 },
 {
 action: 'deactivate',
 label: 'Deactivate Profiles',
 description: 'Set selected profiles to inactive status',
 confirmationRequired: true,
 variant: 'warning',
 },
 {
 action: 'suspend',
 label: 'Suspend Profiles',
 description: 'Suspend selected profiles temporarily',
 confirmationRequired: true,
 variant: 'warning',
 },
 {
 action: 'delete',
 label: 'Delete Profiles',
 description: 'Permanently delete selected profiles and all associated data',
 confirmationRequired: true,
 variant: 'destructive',
 },
 {
 action: 'export',
 label: 'Export Profiles',
 description: 'Export selected profiles to CSV or JSON format',
 confirmationRequired: false,
 variant: 'default',
 },
 {
 action: 'send_notification',
 label: 'Send Notification',
 description: 'Send email notification to selected profiles',
 confirmationRequired: false,
 variant: 'default',
 },
];

interface BulkActionsDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 selectedProfiles: UserProfile[];
 onExecute: (action: string, profileIds: string[]) => Promise<void>;
}

export default function BulkActionsDrawer({
 isOpen,
 onClose,
 selectedProfiles,
 onExecute
}: BulkActionsDrawerProps) {
 const { toast } = useToast();
 const [selectedAction, setSelectedAction] = useState<string>('');
 const [confirmationChecked, setConfirmationChecked] = useState(false);
 const [loading, setLoading] = useState(false);

 const selectedActionConfig = BULK_ACTIONS.find(action => action.action === selectedAction);
 const profileIds = selectedProfiles.map(p => p.id);

 const handleExecute = async () => {
 if (!selectedAction || !selectedActionConfig) {
 toast({
 title: 'Error',
 description: 'Please select an action to perform',
 variant: 'destructive',
 });
 return;
 }

 if (selectedActionConfig.confirmationRequired && !confirmationChecked) {
 toast({
 title: 'Confirmation Required',
 description: 'Please confirm that you want to perform this action',
 variant: 'destructive',
 });
 return;
 }

 try {
 setLoading(true);
 await onExecute(selectedAction, profileIds);
 toast({
 title: 'Success',
 description: `${selectedActionConfig.label} completed successfully`,
 });
 onClose();
 } catch (error) {
 toast({
 title: 'Error',
 description: `Failed to ${selectedActionConfig.label.toLowerCase()}`,
 variant: 'destructive',
 });
 } finally {
 setLoading(false);
 }
 };

 const handleClose = () => {
 setSelectedAction('');
 setConfirmationChecked(false);
 onClose();
 };

 const getActionIcon = (action: string) => {
 switch (action) {
 case 'activate':
 return <UserCheck className="h-4 w-4 text-green-600" />;
 case 'deactivate':
 return <UserX className="h-4 w-4 text-yellow-600" />;
 case 'suspend':
 return <XCircle className="h-4 w-4 text-orange-600" />;
 case 'delete':
 return <Trash2 className="h-4 w-4 text-red-600" />;
 default:
 return <CheckCircle className="h-4 w-4 text-blue-600" />;
 }
 };

 const getStatusCounts = () => {
 const counts = selectedProfiles.reduce((acc, profile) => {
 acc[profile.status] = (acc[profile.status] || 0) + 1;
 return acc;
 }, {} as Record<string, number>);

 return counts;
 };

 const statusCounts = getStatusCounts();

 return (
 <Drawer
 isOpen={isOpen}
 onClose={handleClose}
 title="Bulk Actions"
 description={`Perform actions on ${selectedProfiles.length} selected profile${selectedProfiles.length !== 1 ? 's' : ''}`}
 size="md"
 >
 <div className="space-y-lg">
 {/* Selected Profiles Summary */}
 <Card className="p-md">
 <div className="flex items-center gap-sm mb-md">
 <Users className="h-5 w-5 text-primary" />
 <h3 className="font-semibold">Selected Profiles ({selectedProfiles.length})</h3>
 </div>
 
 <div className="space-y-sm">
 <div className="flex flex-wrap gap-sm">
 {Object.entries(statusCounts).map(([status, count]) => (
 <Badge 
 key={status}
 variant={status === 'active' ? 'success' : status === 'inactive' ? 'destructive' : 'warning'}
 >
 {count} {status}
 </Badge>
 ))}
 </div>
 
 <div className="text-sm text-muted-foreground">
 <p>Profiles: {selectedProfiles.slice(0, 3).map(p => p.full_name).join(', ')}
 {selectedProfiles.length > 3 && ` and ${selectedProfiles.length - 3} more`}
 </p>
 </div>
 </div>
 </Card>

 {/* Action Selection */}
 <div className="space-y-md">
 <div className="space-y-sm">
 <Label htmlFor="action">Select Action</Label>
 <Select value={selectedAction} onValueChange={setSelectedAction}>
 <SelectTrigger>
 <SelectValue placeholder="Choose an action to perform" />
 </SelectTrigger>
 <SelectContent>
 {BULK_ACTIONS.map((action) => (
 <SelectItem key={action.action} value={action.action}>
 <div className="flex items-center gap-sm">
 {getActionIcon(action.action)}
 <div>
 <p className="font-medium">{action.label}</p>
 <p className="text-xs text-muted-foreground">{action.description}</p>
 </div>
 </div>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 {/* Action Details */}
 {selectedActionConfig && (
 <Card className="p-md">
 <div className="flex items-start gap-sm">
 {getActionIcon(selectedAction)}
 <div className="flex-1">
 <h4 className="font-semibold">{selectedActionConfig.label}</h4>
 <p className="text-sm text-muted-foreground mb-sm">
 {selectedActionConfig.description}
 </p>
 
 {/* Action-specific warnings */}
 {selectedAction === 'delete' && (
 <Alert className="mt-sm">
 <AlertTriangle className="h-4 w-4" />
 <AlertDescription>
 <strong>Warning:</strong> This action cannot be undone. All profile data, 
 including certifications, endorsements, and activity history will be permanently deleted.
 </AlertDescription>
 </Alert>
 )}
 
 {selectedAction === 'deactivate' && (
 <Alert className="mt-sm">
 <AlertTriangle className="h-4 w-4" />
 <AlertDescription>
 Deactivated profiles will lose access to the system and won't appear in active user lists.
 </AlertDescription>
 </Alert>
 )}
 
 {selectedAction === 'suspend' && (
 <Alert className="mt-sm">
 <AlertTriangle className="h-4 w-4" />
 <AlertDescription>
 Suspended profiles will be temporarily blocked from accessing the system.
 </AlertDescription>
 </Alert>
 )}
 </div>
 </div>
 </Card>
 )}

 {/* Confirmation Checkbox */}
 {selectedActionConfig?.confirmationRequired && (
 <div className="flex items-start gap-sm p-md bg-muted/50 rounded-lg">
 <Checkbox
 
 checked={confirmationChecked}
 onCheckedChange={setConfirmationChecked}
 />
 <div className="flex-1">
 <Label htmlFor="confirmation" className="text-sm font-medium cursor-pointer">
 I understand the consequences of this action
 </Label>
 <p className="text-xs text-muted-foreground mt-xs">
 {selectedAction === 'delete' 
 ? 'I confirm that I want to permanently delete the selected profiles and all associated data.'
 : `I confirm that I want to ${selectedActionConfig.label.toLowerCase()}.`
 }
 </p>
 </div>
 </div>
 )}
 </div>

 {/* Action Buttons */}
 <div className="flex justify-end gap-sm pt-md border-t border-border">
 <Button
 variant="outline"
 onClick={handleClose}
 disabled={loading}
 >
 Cancel
 </Button>
 <Button
 onClick={handleExecute}
 loading={loading}
 disabled={!selectedAction || (selectedActionConfig?.confirmationRequired && !confirmationChecked)}
 variant={selectedActionConfig?.variant === 'destructive' ? 'destructive' : 'default'}
 >
 {selectedActionConfig ? selectedActionConfig.label : 'Execute Action'}
 </Button>
 </div>
 </div>
 </Drawer>
 );
}
