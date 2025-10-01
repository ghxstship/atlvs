import React, { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@ghxstship/ui';
import { Button } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Separator } from '@ghxstship/ui';
import { Checkbox } from '@ghxstship/ui';
import { Label } from '@ghxstship/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ghxstship/ui';
import {
  CheckSquare,
  Trash2,
  Archive,
  Star,
  StarOff,
  Edit,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { marketplaceService } from '../lib/marketplace-service';
import type { MarketplaceListing } from '../types';

interface BulkDrawerProps {
  orgId: string;
  selectedListings: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (action: string, count: number) => void;
}

type BulkAction = 'status' | 'feature' | 'archive' | 'delete';

export default function BulkDrawer({
  orgId,
  selectedListings,
  open,
  onOpenChange,
  onComplete,
}: BulkDrawerProps) {
  const [selectedAction, setSelectedAction] = useState<BulkAction | null>(null);
  const [statusValue, setStatusValue] = useState<'active' | 'archived'>('active');
  const [featureValue, setFeatureValue] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const resetState = () => {
    setSelectedAction(null);
    setStatusValue('active');
    setFeatureValue(false);
    setConfirmDelete(false);
    setResults(null);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleExecuteAction = async () => {
    if (!selectedAction || selectedListings.length === 0) return;

    setIsProcessing(true);
    setResults(null);

    try {
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      switch (selectedAction) {
        case 'status':
          try {
            await marketplaceService.bulkUpdateListings(orgId, '', selectedListings, {
              status: statusValue
            });
            success = selectedListings.length;
          } catch (error) {
            failed = selectedListings.length;
            errors.push(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          break;

        case 'feature':
          try {
            await marketplaceService.bulkUpdateListings(orgId, '', selectedListings, {
              featured: featureValue
            });
            success = selectedListings.length;
          } catch (error) {
            failed = selectedListings.length;
            errors.push(`Failed to update featured status: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          break;

        case 'archive':
          try {
            await marketplaceService.bulkArchiveListings(orgId, '', selectedListings);
            success = selectedListings.length;
          } catch (error) {
            failed = selectedListings.length;
            errors.push(`Failed to archive listings: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          break;

        case 'delete':
          if (!confirmDelete) {
            setConfirmDelete(true);
            setIsProcessing(false);
            return;
          }

          try {
            await marketplaceService.bulkDeleteListings(orgId, '', selectedListings);
            success = selectedListings.length;
          } catch (error) {
            failed = selectedListings.length;
            errors.push(`Failed to delete listings: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          break;
      }

      setResults({ success, failed, errors });

      if (success > 0) {
        onComplete?.(selectedAction, success);
        // Close drawer after successful operation
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error) {
      setResults({
        success: 0,
        failed: selectedListings.length,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getActionTitle = () => {
    switch (selectedAction) {
      case 'status': return `Change Status to ${statusValue === 'active' ? 'Active' : 'Archived'}`;
      case 'feature': return `${featureValue ? 'Feature' : 'Unfeature'} Listings`;
      case 'archive': return 'Archive Listings';
      case 'delete': return 'Delete Listings';
      default: return 'Bulk Action';
    }
  };

  const getActionDescription = () => {
    switch (selectedAction) {
      case 'status':
        return `Change the status of ${selectedListings.length} selected listing${selectedListings.length !== 1 ? 's' : ''} to ${statusValue === 'active' ? 'Active' : 'Archived'}.`;
      case 'feature':
        return `${featureValue ? 'Feature' : 'Unfeature'} ${selectedListings.length} selected listing${selectedListings.length !== 1 ? 's' : ''} to ${featureValue ? 'increase' : 'decrease'} their visibility.`;
      case 'archive':
        return `Move ${selectedListings.length} selected listing${selectedListings.length !== 1 ? 's' : ''} to archived status. They will no longer be visible to other users.`;
      case 'delete':
        return `Permanently delete ${selectedListings.length} selected listing${selectedListings.length !== 1 ? 's' : ''}. This action cannot be undone.`;
      default:
        return `Perform bulk action on ${selectedListings.length} selected listing${selectedListings.length !== 1 ? 's' : ''}.`;
    }
  };

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-xs">
            <CheckSquare className="h-icon-sm w-icon-sm" />
            Bulk Actions
          </DrawerTitle>
          <DrawerDescription>
            Perform actions on multiple listings at once
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-lg">
          <div className="space-y-lg">
            {/* Selection Summary */}
            <div className="bg-muted/50 rounded-lg p-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Selected Listings</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedListings.length} listing{selectedListings.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
                <Badge variant="secondary">
                  {selectedListings.length}
                </Badge>
              </div>
            </div>

            {/* Action Selection */}
            {!selectedAction && (
              <div className="space-y-md">
                <h3 className="text-lg font-semibold">Choose an Action</h3>

                <div className="grid grid-cols-1 gap-sm">
                  <button
                    onClick={() => setSelectedAction('status')}
                    className="flex items-center gap-sm p-md border rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <Edit className="h-icon-sm w-icon-sm text-blue-500" />
                    <div>
                      <div className="font-medium">Change Status</div>
                      <div className="text-sm text-muted-foreground">Update active/archived status</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedAction('feature')}
                    className="flex items-center gap-sm p-md border rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <Star className="h-icon-sm w-icon-sm text-yellow-500" />
                    <div>
                      <div className="font-medium">Feature/Unfeature</div>
                      <div className="text-sm text-muted-foreground">Toggle featured status</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedAction('archive')}
                    className="flex items-center gap-sm p-md border rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <Archive className="h-icon-sm w-icon-sm text-orange-500" />
                    <div>
                      <div className="font-medium">Archive</div>
                      <div className="text-sm text-muted-foreground">Move to archived status</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedAction('delete')}
                    className="flex items-center gap-sm p-md border rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <Trash2 className="h-icon-sm w-icon-sm text-red-500" />
                    <div>
                      <div className="font-medium">Delete</div>
                      <div className="text-sm text-muted-foreground">Permanently remove listings</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Action Configuration */}
            {selectedAction && (
              <div className="space-y-md">
                <div className="flex items-center gap-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAction(null)}
                  >
                    ← Back to Actions
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-md">
                  <h3 className="font-medium text-blue-900 mb-2">{getActionTitle()}</h3>
                  <p className="text-sm text-blue-700">{getActionDescription()}</p>
                </div>

                {/* Action-specific configuration */}
                {selectedAction === 'status' && (
                  <div className="space-y-sm">
                    <Label>New Status</Label>
                    <Select value={statusValue} onValueChange={(value: 'active' | 'archived') => setStatusValue(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active - Visible to all users</SelectItem>
                        <SelectItem value="archived">Archived - Hidden from users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedAction === 'feature' && (
                  <div className="space-y-sm">
                    <Label>Featured Status</Label>
                    <Select value={featureValue.toString()} onValueChange={(value) => setFeatureValue(value === 'true')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Feature - Increase visibility</SelectItem>
                        <SelectItem value="false">Unfeature - Normal visibility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedAction === 'delete' && (
                  <div className="space-y-sm">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-md">
                      <div className="flex items-start gap-sm">
                        <AlertTriangle className="h-icon-sm w-icon-sm text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-900">Danger Zone</h4>
                          <p className="text-sm text-red-700 mt-1">
                            This action cannot be undone. All selected listings will be permanently deleted.
                          </p>
                        </div>
                      </div>
                    </div>

                    {!confirmDelete ? (
                      <Button
                        variant="destructive"
                        onClick={() => setConfirmDelete(true)}
                        className="w-full"
                      >
                        I understand, proceed with deletion
                      </Button>
                    ) : (
                      <div className="space-y-sm">
                        <div className="flex items-center space-x-xs">
                          <Checkbox
                            id="confirm-delete"
                            checked={confirmDelete}
                            onCheckedChange={(checked) => setConfirmDelete(!!checked)}
                          />
                          <Label htmlFor="confirm-delete" className="text-sm">
                            I confirm that I want to permanently delete {selectedListings.length} listing{selectedListings.length !== 1 ? 's' : ''}
                          </Label>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Results */}
            {results && (
              <div className="space-y-md">
                <Separator />

                <div className="space-y-sm">
                  <h3 className="text-lg font-semibold">Results</h3>

                  <div className="grid grid-cols-2 gap-md">
                    <div className="text-center p-md bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-icon-lg w-icon-lg text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">{results.success}</div>
                      <div className="text-sm text-green-700">Successful</div>
                    </div>

                    {results.failed > 0 && (
                      <div className="text-center p-md bg-red-50 border border-red-200 rounded-lg">
                        <X className="h-icon-lg w-icon-lg text-red-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                        <div className="text-sm text-red-700">Failed</div>
                      </div>
                    )}
                  </div>

                  {results.errors.length > 0 && (
                    <div className="space-y-xs">
                      <h4 className="font-medium text-red-900">Errors:</h4>
                      <div className="space-y-xs">
                        {results.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-700 bg-red-50 p-xs rounded">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {selectedAction && (
          <div className="border-t p-lg">
            <div className="flex gap-sm">
              <Button
                onClick={handleExecuteAction}
                disabled={isProcessing || (selectedAction === 'delete' && !confirmDelete)}
                className="flex-1"
                variant={selectedAction === 'delete' ? 'destructive' : 'default'}
              >
                {isProcessing ? 'Processing...' : `Execute ${getActionTitle()}`}
              </Button>
              <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
