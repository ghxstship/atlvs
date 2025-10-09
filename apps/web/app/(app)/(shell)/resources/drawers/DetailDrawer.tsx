/**
 * Resources Detail Drawer
 * Detailed view of resource with metadata and actions
 */

'use client';

import React from 'react';
import { Badge, Button, Card ,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@ghxstship/ui';
import { BookOpen, Calendar, Clipboard, Download, Edit, ExternalEye, ExternalLink, Eye, File, FileText, GraduationCap, Share, Share2, Star, Tag, User, X } from "lucide-react";
import type { Resource } from '../lib/resources-service';

interface DetailDrawerProps {
  resource: Resource | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (resource: Resource) => void;
  onDownload?: (resource: Resource) => void;
  onShare?: (resource: Resource) => void;
  loading?: boolean;
}

const resourceTypeIcons = {
  policy: FileText,
  guide: BookOpen,
  training: GraduationCap,
  template: File,
  procedure: Clipboard,
  featured: Star
};

const resourceTypeColors = {
  policy: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  guide: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  training: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  template: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  procedure: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  featured: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
};

export default function DetailDrawer({
  resource,
  open,
  onClose,
  onEdit,
  onDownload,
  onShare,
  loading = false
}: DetailDrawerProps) {
  if (!open) return null;

  if (loading || !resource) {
    return (
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-background border-l border-border shadow-2xl z-50 overflow-y-auto">
        <div className="p-lg">
          <div className="animate-pulse space-y-md">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = resourceTypeIcons[resource.type];
  const colorClass = resourceTypeColors[resource.type];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-background border-l border-border shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border p-lg flex items-center justify-between z-10">
        <div className="flex items-center gap-sm">
          <div className={`p-sm rounded-lg ${colorClass}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Resource Details</h2>
            <p className="text-sm text-muted-foreground">Full resource information</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-lg space-y-lg">
        {/* Title and Status */}
        <div>
          <div className="flex items-start justify-between gap-md mb-sm">
            <h1 className="text-2xl font-bold text-foreground">{resource.title}</h1>
            {resource.is_featured && (
              <Badge variant="default" className="bg-warning/10 text-warning">
                <Star className="w-3 h-3 mr-xs" />
                Featured
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-sm flex-wrap">
            <Badge variant="secondary" className="capitalize">
              {resource.type}
            </Badge>
            <Badge 
              variant={resource.status === 'published' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {resource.status}
            </Badge>
            <Badge variant="outline">{resource.category}</Badge>
          </div>
        </div>

        {/* Description */}
        {resource.description && (
          <Card className="p-md">
            <h3 className="font-semibold mb-sm">Description</h3>
            <p className="text-sm text-muted-foreground">{resource.description}</p>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-sm flex-wrap">
          {onDownload && (
            <Button
              variant="default"
              onClick={() => onDownload(resource)}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-xs" />
              Download
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              onClick={() => onEdit(resource)}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-xs" />
              Edit
            </Button>
          )}
          {onShare && (
            <Button
              variant="outline"
              onClick={() => onShare(resource)}
            >
              <Share2 className="w-4 h-4 mr-xs" />
              Share
            </Button>
          )}
        </div>

        {/* Metadata Grid */}
        <Card className="p-md">
          <h3 className="font-semibold mb-md">Resource Information</h3>
          <div className="grid grid-cols-2 gap-md text-sm">
            <div>
              <div className="flex items-center gap-xs text-muted-foreground mb-xs">
                <Eye className="w-4 h-4" />
                <span>Views</span>
              </div>
              <p className="font-medium">{resource.view_count || 0}</p>
            </div>
            <div>
              <div className="flex items-center gap-xs text-muted-foreground mb-xs">
                <Download className="w-4 h-4" />
                <span>Downloads</span>
              </div>
              <p className="font-medium">{resource.download_count || 0}</p>
            </div>
            <div>
              <div className="flex items-center gap-xs text-muted-foreground mb-xs">
                <Calendar className="w-4 h-4" />
                <span>Created</span>
              </div>
              <p className="font-medium">
                {new Date(resource.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-xs text-muted-foreground mb-xs">
                <Calendar className="w-4 h-4" />
                <span>Updated</span>
              </div>
              <p className="font-medium">
                {new Date(resource.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* File Information */}
        {(resource.file_url || resource.file_size || resource.file_type) && (
          <Card className="p-md">
            <h3 className="font-semibold mb-md">File Information</h3>
            <div className="space-y-sm text-sm">
              {resource.file_type && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File Type</span>
                  <span className="font-medium uppercase">{resource.file_type}</span>
                </div>
              )}
              {resource.file_size && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File Size</span>
                  <span className="font-medium">{formatFileSize(resource.file_size)}</span>
                </div>
              )}
              {resource.version && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">{resource.version}</span>
                </div>
              )}
              {resource.language && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language</span>
                  <span className="font-medium">{resource.language}</span>
                </div>
              )}
              {resource.file_url && (
                <div className="pt-sm">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(resource.file_url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-xs" />
                    Open File
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <Card className="p-md">
            <h3 className="font-semibold mb-md flex items-center gap-xs">
              <Tag className="w-4 h-4" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-xs">
              {resource.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Author Information */}
        {(resource.created_by || resource.updated_by) && (
          <Card className="p-md">
            <h3 className="font-semibold mb-md flex items-center gap-xs">
              <User className="w-4 h-4" />
              Contributors
            </h3>
            <div className="space-y-sm text-sm">
              {resource.created_by && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created By</span>
                  <span className="font-medium">{resource.created_by}</span>
                </div>
              )}
              {resource.updated_by && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated By</span>
                  <span className="font-medium">{resource.updated_by}</span>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
