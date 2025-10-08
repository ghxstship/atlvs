"use client";

import { Activity, Calendar, Clock, Download, Edit, Eye, FileText, Globe, HardDrive, Link, Lock, MessageSquare, Share2, Tag, User, Users } from 'lucide-react';
import {
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  AppDrawer
} from "@ghxstship/ui";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import type { DigitalAsset } from "../types";

// Type alias for backward compatibility with existing code
type ProjectFile = DigitalAsset & {
  name: string;
  uploaded_by_user?: {
    id: string;
    email: string;
    full_name?: string;
  };
  project?: {
    id: string;
    name: string;
  };
  is_latest?: boolean;
};

interface ViewFileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: ProjectFile;
  onEdit?: () => void;
  onDownload?: () => void;
  formatFileSize: (bytes: number) => string;
}

export default function ViewFileDrawer({
  open,
  onOpenChange,
  file,
  onEdit,
  onDownload,
  formatFileSize
}: ViewFileDrawerProps) {
  const getAccessIcon = (level: string) => {
    switch (level) {
      case "public":
        return Globe;
      case "team":
        return Users;
      case "restricted":
        return Lock;
      default:
        return Lock;
    }
  };

  const getAccessBadgeVariant = (level: string) => {
    switch (level) {
      case "public":
        return "success";
      case "team":
        return "info";
      case "restricted":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case "document":
        return "info";
      case "image":
        return "success";
      case "video":
        return "warning";
      case "audio":
        return "secondary";
      default:
        return "default";
    }
  };

  const AccessIcon = getAccessIcon(file.access_level);

  // Custom tabs for file details
  const tabs = [
    {
      key: "overview",
      label: "Overview",
      content: (
        <div className="space-y-md">
          {/* File Preview (for images) */}
          {file.category === "image" && (
            <div className="bg-muted rounded-lg p-md">
              <img
                src={file.file_url || ''}
                alt={file.name}
                className="max-w-full max-h-content-lg mx-auto object-contain rounded"
              />
            </div>
          )}

          {/* File Information */}
          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-xs">
              <div className="flex items-center gap-xs text-sm text-muted-foreground">
                <FileText className="h-icon-xs w-icon-xs" />
                <span>File Type</span>
              </div>
              <p className="font-medium">{file.file_type || 'Unknown'}</p>
            </div>

            <div className="space-y-xs">
              <div className="flex items-center gap-xs text-sm text-muted-foreground">
                <HardDrive className="h-icon-xs w-icon-xs" />
                <span>File Size</span>
              </div>
              <p className="font-medium">{formatFileSize(file.file_size || 0)}</p>
            </div>

            <div className="space-y-xs">
              <div className="flex items-center gap-xs text-sm text-muted-foreground">
                <AccessIcon className="h-icon-xs w-icon-xs" />
                <span>Access Level</span>
              </div>
              <Badge variant={getAccessBadgeVariant(file.access_level)}>
                {file.access_level}
              </Badge>
            </div>

            <div className="space-y-xs">
              <div className="flex items-center gap-xs text-sm text-muted-foreground">
                <Tag className="h-icon-xs w-icon-xs" />
                <span>Category</span>
              </div>
              <Badge variant={getCategoryBadgeVariant(file.category)}>
                {file.category}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {file.description && (
            <div className="space-y-xs">
              <div className="flex items-center gap-xs text-sm text-muted-foreground">
                <FileText className="h-icon-xs w-icon-xs" />
                <span>Description</span>
              </div>
              <p className="text-sm">{file.description}</p>
            </div>
          )}

          {/* Tags */}
          {file.tags && file.tags.length > 0 && (
            <div className="space-y-xs">
              <div className="flex items-center gap-xs text-sm text-muted-foreground">
                <Tag className="h-icon-xs w-icon-xs" />
                <span>Tags</span>
              </div>
              <div className="flex flex-wrap gap-xs">
                {file.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Project */}
          {file.project && (
            <div className="space-y-xs">
              <div className="flex items-center gap-xs text-sm text-muted-foreground">
                <Link className="h-icon-xs w-icon-xs" />
                <span>Project</span>
              </div>
              <p className="font-medium">{file.project.name}</p>
            </div>
          )}
        </div>
      )
    },
    {
      key: "details",
      label: "Details",
      content: (
        <div className="space-y-md">
          {/* Version Information */}
          <div className="space-y-sm">
            <h4 className="font-semibold">Version Information</h4>
            <div className="grid grid-cols-2 gap-md">
              <div className="space-y-xs">
                <span className="text-sm text-muted-foreground">Version</span>
                <p className="font-medium">v{file.version}</p>
              </div>
              <div className="space-y-xs">
                <span className="text-sm text-muted-foreground">Latest</span>
                <Badge variant={file.is_latest ? "success" : "secondary"}>
                  {file.is_latest ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Upload Information */}
          <div className="space-y-sm">
            <h4 className="font-semibold">Upload Information</h4>
            <div className="space-y-sm">
              <div className="flex items-center justify-between p-sm bg-muted rounded-lg">
                <div className="flex items-center gap-sm">
                  <User className="h-icon-xs w-icon-xs text-muted-foreground" />
                  <span className="text-sm">Uploaded By</span>
                </div>
                <span className="font-medium">
                  {file.uploaded_by_user?.full_name || file.uploaded_by_user?.email || "Unknown"}
                </span>
              </div>

              <div className="flex items-center justify-between p-sm bg-muted rounded-lg">
                <div className="flex items-center gap-sm">
                  <Calendar className="h-icon-xs w-icon-xs text-muted-foreground" />
                  <span className="text-sm">Upload Date</span>
                </div>
                <span className="font-medium">
                  {format(parseISO(file.created_at), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>

              <div className="flex items-center justify-between p-sm bg-muted rounded-lg">
                <div className="flex items-center gap-sm">
                  <Clock className="h-icon-xs w-icon-xs text-muted-foreground" />
                  <span className="text-sm">Last Modified</span>
                </div>
                <span className="font-medium">
                  {formatDistanceToNow(parseISO(file.updated_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="space-y-sm">
            <h4 className="font-semibold">Usage Statistics</h4>
            <div className="p-sm bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <Download className="h-icon-xs w-icon-xs text-muted-foreground" />
                  <span className="text-sm">Total Downloads</span>
                </div>
                <span className="font-medium">{file.download_count}</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      key: "activity",
      label: "Activity",
      content: (
        <div className="text-center py-lg text-muted-foreground">
          <MessageSquare className="mx-auto h-icon-2xl w-icon-2xl mb-sm opacity-50" />
          <p>Activity tracking coming soon</p>
        </div>
      )
    },
  ];

  return (
    <AppDrawer
      open={open}
      onClose={() => onOpenChange(false)}
      title={file.name}
      mode="view"
      tabs={tabs}
      actions={[
        {
          key: "download",
          label: "Download",
          icon: <Download className="h-icon-xs w-icon-xs" />,
          onClick: onDownload
        },
        {
          key: "share",
          label: "Share",
          icon: <Share2 className="h-icon-xs w-icon-xs" />,
          onClick: async () => {
            await navigator.clipboard.writeText(file.file_url || '');
            // Toast would show "Link copied to clipboard"
          }
        },
        {
          key: "edit",
          label: "Edit",
          icon: <Edit className="h-icon-xs w-icon-xs" />,
          onClick: onEdit
        },
      ]}
    />
  );
}
