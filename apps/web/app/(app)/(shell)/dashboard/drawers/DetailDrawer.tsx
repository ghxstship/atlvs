'use client';


import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@ghxstship/ui";

import React, { useState, useMemo } from 'react';
import Image from "next/image";
import { AlertCircle, Calendar, CheckCircle, Clock, Copy, Download, Dropdown,  DropdownItem, DropdownMenuSeparator,  Edit, ExternalEye, ExternalLink, Link, MapPin, MoreHorizontal, Share, Tag, Trash2, User, X } from 'lucide-react';
import { cn } from '@ghxstship/ui/lib/utils';
import { format } from 'date-fns';

// Detail Field Configuration
export interface DetailField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'avatar' | 'image' | 'url' | 'email' | 'phone' | 'custom';
  format?: (value: unknown) => string;
  render?: (value: unknown, record: Record<string, unknown>) => React.ReactNode;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Detail Section Configuration
export interface DetailSection {
  id: string;
  title: string;
  fields: DetailField[];
  layout?: 'grid' | 'list';
  columns?: number;
}

// Detail Drawer Props
export interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  record: Record<string, unknown> | null;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  sections?: DetailSection[];
  avatar?: {
    field: string;
    fallbackField?: string;
  };
  status?: {
    field: string;
    badges?: Array<{
      value: unknown;
      label: string;
      variant?: 'default' | 'secondary' | 'destructive' | 'outline';
      color?: string;
    }>;
  };
  metadata?: DetailField[];

  // Actions
  onEdit?: (record: Record<string, unknown>) => void;
  onDelete?: (record: Record<string, unknown>) => void;
  onDuplicate?: (record: Record<string, unknown>) => void;
  onShare?: (record: Record<string, unknown>) => void;
  onExport?: (record: Record<string, unknown>) => void;
  customActions?: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (record: Record<string, unknown>) => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    disabled?: boolean;
  }>;

  // Related Data
  relatedRecords?: Array<{
    title: string;
    records: Record<string, unknown>[];
    onViewAll?: () => void;
    displayField: string;
  }>;

  // Activity/Timeline
  activity?: Array<{
    id: string;
    type: 'created' | 'updated' | 'commented' | 'status_changed' | 'assigned';
    description: string;
    user?: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
  }>;

  // Customization
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showHeader?: boolean;
  showFooter?: boolean;
  showTabs?: boolean;
  tabs?: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
}

// Detail Drawer Component
export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  isOpen,
  onClose,
  record,
  loading = false,
  title,
  subtitle,
  sections = [],
  avatar,
  status,
  metadata = [],

  // Actions
  onEdit,
  onDelete,
  onDuplicate,
  onShare,
  onExport,
  customActions = [],

  // Related Data
  relatedRecords = [],

  // Activity
  activity = [],

  // Customization
  width = 'lg',
  showHeader = true,
  showFooter = true,
  showTabs = false,
  tabs = []
}) => {
  const [activeTab, setActiveTab] = useState('details');

  // Drawer width classes
  const widthClasses = {
    sm: 'w-container-lg',
    md: 'w-[32rem]',
    lg: 'w-[40rem]',
    xl: 'w-[48rem]',
    full: 'w-full max-w-6xl'
  };

  // Render field value
  const renderField = useCallback((field: DetailField, record: Record<string, unknown>) => {
    const value = record[field.key];
    const Icon = field.icon;

    if (field.render) {
      return field.render(value, record);
    }

    switch (field.type) {
      case 'text':
        return (
          <div className={cn('flex items-center gap-xs', field.className)}>
            {Icon && <Icon className="h-icon-xs w-icon-xs text-muted-foreground flex-shrink-0" />}
            <span className="break-words">{field.format ? field.format(value) : String(value || '—')}</span>
          </div>
        );

      case 'number':
        return (
          <div className={cn('flex items-center gap-xs', field.className)}>
            {Icon && <Icon className="h-icon-xs w-icon-xs text-muted-foreground flex-shrink-0" />}
            <span className="font-mono">{field.format ? field.format(value) : String(value || '—')}</span>
          </div>
        );

      case 'date':
        return (
          <div className={cn('flex items-center gap-xs', field.className)}>
            <Calendar className="h-icon-xs w-icon-xs text-muted-foreground flex-shrink-0" />
            <span>{value ? format(new Date(String(value)), 'PPP') : '—'}</span>
          </div>
        );

      case 'boolean':
        return (
          <div className={cn('flex items-center gap-xs', field.className)}>
            {value ? (
              <CheckCircle className="h-icon-xs w-icon-xs text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-icon-xs w-icon-xs text-muted-foreground flex-shrink-0" />
            )}
            <span>{value ? 'Yes' : 'No'}</span>
          </div>
        );

      case 'badge':
        return (
          <Badge variant="secondary" className={field.className}>
            {field.format ? field.format(value) : String(value || '—')}
          </Badge>
        );

      case 'avatar':
        const avatarUrl = String(value || '');
        const fallback = field.key === avatar?.fallbackField
          ? String(record[avatar.field] || '')
          : String(value || '');
        return (
          <Avatar className={cn('h-icon-lg w-icon-lg', field.className)}>
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{fallback.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        );

      case 'image':
        return (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={String(value || '')}
              alt=""
              className={cn('w-component-md h-component-md object-cover rounded border', field.className)}
            />
          </>
        );

      case 'url':
        return (
          <div className={cn('flex items-center gap-xs', field.className)}>
            <Link className="h-icon-xs w-icon-xs text-muted-foreground flex-shrink-0" />
            <a
              href={String(value || '')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              {String(value || '—')}
            </a>
            <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          </div>
        );

      case 'email':
        return (
          <div className={cn('flex items-center gap-xs', field.className)}>
            <User className="h-icon-xs w-icon-xs text-muted-foreground flex-shrink-0" />
            <a
              href={`mailto:${String(value || '')}`}
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              {String(value || '—')}
            </a>
          </div>
        );

      case 'phone':
        return (
          <div className={cn('flex items-center gap-xs', field.className)}>
            <User className="h-icon-xs w-icon-xs text-muted-foreground flex-shrink-0" />
            <a
              href={`tel:${String(value || '')}`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {String(value || '—')}
            </a>
          </div>
        );

      default:
        return (
          <div className={cn('flex items-center gap-xs', field.className)}>
            {Icon && <Icon className="h-icon-xs w-icon-xs text-muted-foreground flex-shrink-0" />}
            <span className="break-words">{field.format ? field.format(value) : String(value || '—')}</span>
          </div>
        );
    }
  }, [avatar]);

  // Render section
  const renderSection = useCallback((section: DetailSection) => {
    if (!record) return null;

    return (
      <div key={section.id} className="space-y-md">
        <div>
          <h3 className="text-lg font-medium">{section.title}</h3>
        </div>

        <div className={cn(
          section.layout === 'grid' && section.columns
            ? `grid grid-cols-${section.columns} gap-md`
            : 'space-y-md'
        )}>
          {section.fields.map((field) => (
            <div key={field.key} className="space-y-xs">
              <label className="text-sm font-medium text-muted-foreground">
                {field.label}
              </label>
              <div className="text-sm">
                {renderField(field, record)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [record, renderField]);

  // Render activity item
  const renderActivityItem = useCallback((item: DetailDrawerProps['activity'][0]) => {
    const getActivityIcon = (type: string) => {
      switch (type) {
        case 'created': return CheckCircle;
        case 'updated': return Edit;
        case 'commented': return Eye;
        case 'status_changed': return AlertCircle;
        case 'assigned': return User;
        default: return Clock;
      }
    };

    const Icon = getActivityIcon(item.type);

    return (
      <div key={item.id} className="flex items-start gap-sm pb-4">
        <div className="flex-shrink-0">
          <Icon className="h-icon-xs w-icon-xs text-muted-foreground mt-0.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm">{item.description}</p>
          <div className="flex items-center gap-xs mt-1 text-xs text-muted-foreground">
            {item.user && <span>{item.user}</span>}
            <span>•</span>
            <span>{format(new Date(item.timestamp), 'MMM d, h:mm a')}</span>
          </div>
        </div>
      </div>
    );
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className={cn(
        'bg-background shadow-xl transform transition-transform duration-300 ease-in-out',
        'flex flex-col h-full',
        widthClasses[width]
      )}>
        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between p-lg border-b">
            <div className="flex items-center gap-md flex-1 min-w-0">
              {/* Avatar */}
              {avatar && record && (
                <Avatar className="h-icon-2xl w-icon-2xl flex-shrink-0">
                  <AvatarImage src={String(record[avatar.field] || '')} />
                  <AvatarFallback>
                    {avatar.fallbackField
                      ? String(record[avatar.fallbackField] || '').slice(0, 2).toUpperCase()
                      : '—'
                    }
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Title and Subtitle */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold truncate">
                  {title || (record ? String(record.name || record.title || 'Details') : 'Loading...')}
                </h2>
                {subtitle && (
                  <p className="text-sm text-muted-foreground truncate mt-1">{subtitle}</p>
                )}

                {/* Status Badges */}
                {status && record && (
                  <div className="flex gap-xs mt-2">
                    {status.badges?.map((badge, idx) => {
                      const currentValue = record[status.field];
                      if (currentValue === badge.value) {
                        return (
                          <Badge
                            key={idx}
                            variant={badge.variant || 'secondary'}
                            style={badge.color ? { backgroundColor: badge.color } : undefined}
                          >
                            {badge.label}
                          </Badge>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-xs">
              {/* Quick Actions */}
              {onEdit && (
                <Button variant="ghost" size="sm" onClick={() => record && onEdit(record)}>
                  <Edit className="h-icon-xs w-icon-xs" />
                </Button>
              )}

              {/* More Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-icon-xs w-icon-xs" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onDuplicate && (
                    <DropdownMenuItem onClick={() => record && onDuplicate(record)}>
                      <Copy className="h-icon-xs w-icon-xs mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                  )}
                  {onShare && (
                    <DropdownMenuItem onClick={() => record && onShare(record)}>
                      <Share className="h-icon-xs w-icon-xs mr-2" />
                      Share
                    </DropdownMenuItem>
                  )}
                  {onExport && (
                    <DropdownMenuItem onClick={() => record && onExport(record)}>
                      <Download className="h-icon-xs w-icon-xs mr-2" />
                      Export
                    </DropdownMenuItem>
                  )}
                  {customActions.length > 0 && <DropdownMenuSeparator />}
                  {customActions.map((action, idx) => {
                    const Icon = action.icon;
                    return (
                      <DropdownMenuItem
                        key={idx}
                        onClick={() => record && action.onClick(record)}
                        disabled={action.disabled}
                        className={action.variant === 'destructive' ? 'text-destructive' : ''}
                      >
                        {Icon && <Icon className="h-icon-xs w-icon-xs mr-2" />}
                        {action.label}
                      </DropdownMenuItem>
                    );
                  })}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => record && onDelete(record)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-icon-xs w-icon-xs mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Close Button */}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-icon-xs w-icon-xs" />
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-lg">
            {loading ? (
              <div className="space-y-md">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-sm">
                    <div className="h-icon-xs bg-muted animate-pulse rounded w-1/4" />
                    <div className="h-icon-md bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-icon-xs bg-muted animate-pulse rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : record ? (
              showTabs && tabs.length > 0 ? (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    {tabs.map((tab) => (
                      <TabsTrigger key={tab.id} value={tab.id}>
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {tabs.map((tab) => (
                    <TabsContent key={tab.id} value={tab.id} className="mt-6">
                      {tab.content}
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <div className="space-y-xl">
                  {/* Main Details */}
                  {sections.map((section) => renderSection(section))}

                  {/* Metadata */}
                  {metadata.length > 0 && (
                    <div className="space-y-md">
                      <h3 className="text-lg font-medium">Metadata</h3>
                      <div className="grid grid-cols-2 gap-md">
                        {metadata.map((field) => (
                          <div key={field.key} className="space-y-xs">
                            <label className="text-sm font-medium text-muted-foreground">
                              {field.label}
                            </label>
                            <div className="text-sm">
                              {renderField(field, record)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related Records */}
                  {relatedRecords.map((related, idx) => (
                    <div key={idx} className="space-y-md">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">{related.title}</h3>
                        {related.onViewAll && (
                          <Button variant="ghost" size="sm" onClick={related.onViewAll}>
                            View All
                          </Button>
                        )}
                      </div>

                      <div className="space-y-xs">
                        {related.records.slice(0, 5).map((relatedRecord, recordIdx) => (
                          <div key={recordIdx} className="flex items-center gap-sm p-sm border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">
                                {String(relatedRecord[related.displayField] || '—')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Activity Timeline */}
                  {activity.length > 0 && (
                    <div className="space-y-md">
                      <h3 className="text-lg font-medium">Activity</h3>
                      <div className="space-y-0">
                        {activity.map((item) => renderActivityItem(item))}
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-component-xl">
                <div className="text-muted-foreground">No record selected</div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {showFooter && record && (
          <div className="border-t p-lg">
            <div className="flex items-center justify-end gap-sm">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              {onEdit && (
                <Button onClick={() => onEdit(record)}>
                  <Edit className="h-icon-xs w-icon-xs mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export type { DetailDrawerProps, DetailSection, DetailField };
