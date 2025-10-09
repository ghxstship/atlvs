import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  ScrollArea,
  Separator
} from "@ghxstship/ui";
import { Badge ,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@ghxstship/ui';
import { Separator ,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@ghxstship/ui';
import { ScrollArea ,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@ghxstship/ui';
import { AlertCircle, Archive, CheckCircle, Clock, Edit, Eye, History, Plus, Star, Trash2, User, Users } from "lucide-react";
import { marketplaceService } from '../lib/marketplace-service';

interface HistoryDrawerProps {
  orgId: string;
  listingId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AuditLogEntry {
  id: string;
  action: string;
  user_id: string;
  user_name?: string;
  timestamp: string;
  details?: unknown;
  ip_address?: string;
  user_agent?: string;
}

const actionIcons = {
  create: { icon: Plus, color: 'text-green-500' },
  update: { icon: Edit, color: 'text-blue-500' },
  delete: { icon: Trash2, color: 'text-red-500' },
  archive: { icon: Archive, color: 'text-orange-500' },
  feature: { icon: Star, color: 'text-yellow-500' },
  view: { icon: Eye, color: 'text-gray-500' },
  export: { icon: History, color: 'text-purple-500' },
  import: { icon: Plus, color: 'text-indigo-500' }
};

const actionLabels = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  archive: 'Archived',
  feature: 'Featured Status Changed',
  view: 'Viewed',
  export: 'Exported',
  import: 'Imported'
};

export default function HistoryDrawer({
  orgId,
  listingId,
  open,
  onOpenChange
}: HistoryDrawerProps) {
  // Fetch audit history
  const { data: history, isLoading, error } = useQuery({
    queryKey: ['marketplace-history', orgId, listingId],
    queryFn: () => {
      // This would typically fetch from an audit log API
      // For now, returning mock data
      return new Promise<AuditLogEntry[]>((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: '1',
              action: 'update',
              user_id: 'user1',
              user_name: 'John Doe',
              timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              details: { field: 'status', oldValue: 'draft', newValue: 'active' },
              ip_address: '192.168.1.100'
            },
            {
              id: '2',
              action: 'create',
              user_id: 'user1',
              user_name: 'John Doe',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
              details: { title: 'Professional Photography Services' },
              ip_address: '192.168.1.100'
            },
            {
              id: '3',
              action: 'view',
              user_id: 'user2',
              user_name: 'Jane Smith',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
              details: { duration: 120 },
              ip_address: '192.168.1.101'
            },
          ]);
        }, 500);
      });
    },
    enabled: open
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getActionDetails = (entry: AuditLogEntry) => {
    switch (entry.action) {
      case 'update':
        if (entry.details?.field) {
          return `Changed ${entry.details.field} from "${entry.details.oldValue}" to "${entry.details.newValue}"`;
        }
        return 'Updated listing details';
      case 'create':
        return entry.details?.title ? `Created listing "${entry.details.title}"` : 'Created new listing';
      case 'delete':
        return 'Permanently deleted listing';
      case 'archive':
        return 'Moved listing to archived status';
      case 'feature':
        return entry.details?.featured ? 'Marked as featured' : 'Removed featured status';
      case 'view':
        return `Viewed listing for ${entry.details?.duration || 0} seconds`;
      case 'export':
        return `Exported ${entry.details?.count || 0} listings`;
      case 'import':
        return `Imported ${entry.details?.count || 0} listings`;
      default:
        return 'Unknown action';
    }
  };

  if (isLoading) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-xs">
              <History className="h-icon-sm w-icon-sm" />
              Audit History
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 p-lg">
            <div className="space-y-md">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-md">
                  <div className="w-icon-lg h-icon-lg bg-muted animate-pulse rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-xs">
                    <div className="h-icon-xs bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  if (error) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-xs">
              <History className="h-icon-sm w-icon-sm" />
              Audit History
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 p-lg">
            <div className="text-center py-xl">
              <AlertCircle className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Failed to load history</h3>
              <p className="text-muted-foreground">
                There was an error loading the audit history
              </p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-xs">
            <History className="h-icon-sm w-icon-sm" />
            Audit History
          </DrawerTitle>
          <DrawerDescription>
            Complete activity log and change history
            {listingId && ' for this listing'}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-lg">
              {history && history.length > 0 ? (
                <div className="space-y-lg">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-md">
                    <div className="text-center p-md bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{history.length}</div>
                      <div className="text-sm text-muted-foreground">Total Actions</div>
                    </div>
                    <div className="text-center p-md bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {history.filter(h => h.action === 'update').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Updates</div>
                    </div>
                    <div className="text-center p-md bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {new Set(history.map(h => h.user_id)).size}
                      </div>
                      <div className="text-sm text-muted-foreground">Users</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Timeline */}
                  <div className="space-y-md">
                    <h3 className="text-lg font-semibold">Activity Timeline</h3>

                    <div className="relative">
                      {history.map((entry, index) => {
                        const ActionIcon = actionIcons[entry.action as keyof typeof actionIcons]?.icon || History;
                        const iconColor = actionIcons[entry.action as keyof typeof actionIcons]?.color || 'text-gray-500';
                        const isLast = index === history.length - 1;

                        return (
                          <div key={entry.id} className="flex gap-md pb-6">
                            {/* Timeline line */}
                            <div className="flex flex-col items-center">
                              <div className={`w-icon-lg h-icon-lg rounded-full bg-background border-2 flex items-center justify-center ${iconColor}`}>
                                <ActionIcon className="h-icon-xs w-icon-xs" />
                              </div>
                              {!isLast && <div className="w-px h-full bg-border mt-2" />}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-4">
                              <div className="flex items-start justify-between gap-md">
                                <div className="flex-1">
                                  <div className="flex items-center gap-xs mb-1">
                                    <span className="font-medium">
                                      {entry.user_name || 'Unknown User'}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {actionLabels[entry.action as keyof typeof actionLabels] || entry.action}
                                    </Badge>
                                  </div>

                                  <p className="text-muted-foreground text-sm mb-2">
                                    {getActionDetails(entry)}
                                  </p>

                                  <div className="flex items-center gap-md text-xs text-muted-foreground">
                                    <div className="flex items-center gap-xs">
                                      <Clock className="h-3 w-3" />
                                      <span>{formatTimestamp(entry.timestamp)}</span>
                                    </div>
                                    {entry.ip_address && (
                                      <div className="flex items-center gap-xs">
                                        <User className="h-3 w-3" />
                                        <span>{entry.ip_address}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Status indicator */}
                                <div className="flex-shrink-0">
                                  {entry.action === 'create' && (
                                    <CheckCircle className="h-icon-sm w-icon-sm text-green-500" />
                                  )}
                                  {entry.action === 'update' && (
                                    <Edit className="h-icon-sm w-icon-sm text-blue-500" />
                                  )}
                                  {entry.action === 'delete' && (
                                    <Trash2 className="h-icon-sm w-icon-sm text-red-500" />
                                  )}
                                </div>
                              </div>

                              {/* Additional details */}
                              {entry.details && Object.keys(entry.details).length > 0 && (
                                <div className="mt-3 p-sm bg-muted/50 rounded-lg">
                                  <div className="text-xs font-medium text-muted-foreground mb-1">
                                    Details:
                                  </div>
                                  <div className="text-xs space-y-xs">
                                    {Object.entries(entry.details).map(([key, value]) => (
                                      <div key={key} className="flex justify-between">
                                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                        <span className="font-medium">{String(value)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-xsxl">
                  <History className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No history available</h3>
                  <p className="text-muted-foreground">
                    {listingId
                      ? 'No audit history found for this listing'
                      : 'No recent activity in the marketplace'
                    }
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
