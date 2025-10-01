'use client';

import { Users, Trash2, Edit3, Download, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from 'react';
import {
 Drawer,
 Button,
 Badge,
 Card,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Alert,
 AlertDescription
} from '@ghxstship/ui';
import type { UniformSizing } from '../types';
import { BULK_ACTIONS } from '../types';

interface BulkActionsDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 selectedSizings: UniformSizing[];
 onExecute: (action: string, sizingIds: string[]) => Promise<void>;
}

export default function BulkActionsDrawer({
 isOpen,
 onClose,
 selectedSizings,
 onExecute,
}: BulkActionsDrawerProps) {
 const [selectedAction, setSelectedAction] = useState<string>('');
 const [isExecuting, setIsExecuting] = useState(false);
 const [confirmationStep, setConfirmationStep] = useState(false);

 const handleExecute = async () => {
 if (!selectedAction || selectedSizings.length === 0) return;

 try {
 setIsExecuting(true);
 const sizingIds = selectedSizings.map(s => s.user_id);
 await onExecute(selectedAction, sizingIds);
 onClose();
 resetState();
 } catch (error) {
 console.error('Error executing bulk action:', error);
 } finally {
 setIsExecuting(false);
 }
 };

 const resetState = () => {
 setSelectedAction('');
 setConfirmationStep(false);
 setIsExecuting(false);
 };

 const handleClose = () => {
 if (!isExecuting) {
 onClose();
 resetState();
 }
 };

 const selectedActionConfig = BULK_ACTIONS.find(action => action.id === selectedAction);
 const isDestructive = selectedActionConfig?.destructive || false;

 const tabs = [
 {
 key: 'action',
 label: 'Select Action',
 icon: Edit3,
 content: (
 <div className="space-y-lg">
 {/* Selected Items Summary */}
 <Card className="p-lg bg-muted/50">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-sm">
 <Users className="h-icon-sm w-icon-sm text-primary" />
 <span className="font-medium">Selected Items</span>
 </div>
 <Badge variant="secondary">
 {selectedSizings.length} record{selectedSizings.length !== 1 ? 's' : ''}
 </Badge>
 </div>
 
 <div className="mt-md">
 <div className="flex flex-wrap gap-xs">
 {selectedSizings.slice(0, 10).map((sizing) => (
 <Badge key={sizing.user_id} variant="outline" className="text-xs">
 {sizing.first_name} {sizing.last_name}
 </Badge>
 ))}
 {selectedSizings.length > 10 && (
 <Badge variant="outline" className="text-xs">
 +{selectedSizings.length - 10} more
 </Badge>
 )}
 </div>
 </div>
 </Card>

 {/* Action Selection */}
 <div>
 <label className="block text-sm font-medium mb-sm">Choose Action</label>
 <Select value={selectedAction} onValueChange={setSelectedAction}>
 <SelectTrigger>
 <SelectValue placeholder="Select an action to perform" />
 </SelectTrigger>
 <SelectContent>
 {BULK_ACTIONS.map((action) => (
 <SelectItem key={action.id} value={action.id}>
 <div className="flex items-center space-x-sm">
 <action.icon className="h-icon-xs w-icon-xs" />
 <span>{action.label}</span>
 </div>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 {/* Action Description */}
 {selectedActionConfig && (
 <Alert className={isDestructive ? 'border-destructive bg-destructive/10' : ''}>
 <AlertTriangle className={`h-icon-xs w-icon-xs ${isDestructive ? 'text-destructive' : 'text-primary'}`} />
 <AlertDescription>
 <strong>{selectedActionConfig.label}</strong>
 <br />
 {selectedActionConfig.description}
 </AlertDescription>
 </Alert>
 )}

 {/* Action-specific options */}
 {selectedAction === 'update-measurements' && (
 <Card className="p-md">
 <h4 className="font-medium mb-sm">Update Options</h4>
 <p className="text-sm text-muted-foreground">
 This will open individual sizing records for batch editing. 
 You can update measurements for multiple people at once.
 </p>
 </Card>
 )}

 {selectedAction === 'clear-data' && (
 <Card className="p-md border-destructive">
 <h4 className="font-medium mb-sm text-destructive">Clear Data Options</h4>
 <p className="text-sm text-muted-foreground">
 This will permanently remove all measurement data for the selected records. 
 Personal information (names) will be preserved, but all sizing data will be cleared.
 </p>
 </Card>
 )}

 {selectedAction === 'export' && (
 <Card className="p-md">
 <h4 className="font-medium mb-sm">Export Options</h4>
 <p className="text-sm text-muted-foreground">
 Export the selected uniform sizing records to a file. 
 This will include all measurements and clothing sizes for the selected people.
 </p>
 </Card>
 )}
 </div>
 ),
 },
 {
 key: 'confirm',
 label: 'Confirmation',
 icon: CheckCircle,
 content: (
 <div className="space-y-lg">
 {/* Action Summary */}
 <Card className="p-lg">
 <div className="flex items-center space-x-sm mb-md">
 {selectedActionConfig?.icon && (
 <selectedActionConfig.icon className={`h-icon-sm w-icon-sm ${isDestructive ? 'text-destructive' : 'text-primary'}`} />
 )}
 <h3 className="font-semibold">
 {selectedActionConfig?.label || 'No Action Selected'}
 </h3>
 </div>
 
 <div className="space-y-sm">
 <div className="flex justify-between text-sm">
 <span className="text-muted-foreground">Action:</span>
 <span className="font-medium">{selectedActionConfig?.label}</span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-muted-foreground">Records affected:</span>
 <span className="font-medium">{selectedSizings.length}</span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-muted-foreground">Type:</span>
 <Badge variant={isDestructive ? 'destructive' : 'secondary'}>
 {isDestructive ? 'Destructive' : 'Safe'}
 </Badge>
 </div>
 </div>
 </Card>

 {/* Affected Records */}
 <div>
 <h4 className="font-medium mb-sm">Affected Records</h4>
 <div className="max-h-60 overflow-y-auto space-y-xs">
 {selectedSizings.map((sizing) => (
 <Card key={sizing.user_id} className="p-sm">
 <div className="flex items-center justify-between">
 <div>
 <span className="font-medium text-sm">
 {sizing.first_name} {sizing.last_name}
 </span>
 <div className="text-xs text-muted-foreground">
 {sizing.size_category && (
 <Badge variant="outline" className="text-xs mr-xs">
 {sizing.size_category.toUpperCase()}
 </Badge>
 )}
 Updated {new Date(sizing.updated_at).toLocaleDateString()}
 </div>
 </div>
 </div>
 </Card>
 ))}
 </div>
 </div>

 {/* Warning for destructive actions */}
 {isDestructive && (
 <Alert className="border-destructive bg-destructive/10">
 <AlertTriangle className="h-icon-xs w-icon-xs text-destructive" />
 <AlertDescription>
 <strong>Warning:</strong> This action cannot be undone. 
 {selectedAction === 'clear-data' && 
 ' All measurement data for the selected records will be permanently removed.'
 }
 Please confirm that you want to proceed.
 </AlertDescription>
 </Alert>
 )}
 </div>
 ),
 },
 ];

 return (
 <Drawer
 isOpen={isOpen}
 onClose={handleClose}
 title="Bulk Actions"
 tabs={tabs}
 actions={
 <div className="flex items-center space-x-sm">
 <Button variant="outline" onClick={handleClose} disabled={isExecuting}>
 Cancel
 </Button>
 
 {!confirmationStep ? (
 <Button 
 onClick={() => setConfirmationStep(true)}
 disabled={!selectedAction || selectedSizings.length === 0}
 >
 Continue
 </Button>
 ) : (
 <Button 
 onClick={handleExecute}
 disabled={isExecuting}
 variant={isDestructive ? 'destructive' : 'default'}
 >
 {isExecuting ? 'Executing...' : `Execute ${selectedActionConfig?.label}`}
 </Button>
 )}
 </div>
 }
 />
 );
}
