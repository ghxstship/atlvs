"use client";

import React, { useState, useMemo } from 'react';
import {
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Trash2,
  Share,
  GripVertical,
} from 'lucide-react';
import { Card, Button, Badge, DropdownMenu } from '@ghxstship/ui';
import type { DigitalAsset } from '../types';

interface KanbanViewProps {
  files: DigitalAsset[];
  onView: (file: DigitalAsset) => void;
  onEdit: (file: DigitalAsset) => void;
  onDownload: (file: DigitalAsset) => void;
  onDelete: (file: DigitalAsset) => void;
  onShare: (file: DigitalAsset) => void;
  onMoveFile: (fileId: string, newStatus: string) => void;
  groupBy: 'status' | 'category' | 'access_level';
  formatFileSize: (bytes: number) => string;
  getCategoryIcon: (category: string) => React.ComponentType<any>;
}

export default function KanbanView({
  files,
  onView,
  onEdit,
  onDownload,
  onDelete,
  onShare,
  onMoveFile,
  groupBy,
  formatFileSize,
  getCategoryIcon,
}: KanbanViewProps) {
  const [draggedFile, setDraggedFile] = useState<string | null>(null);
  const [wipLimits, setWipLimits] = useState<Record<string, number>({});

  // Group files by the specified criteria
  const groupedFiles = useMemo(() => {
    const groups: Record<string, DigitalAsset[]> = {};

    files.forEach(file => {
      let groupKey: string;

      switch (groupBy) {
        case 'status':
          groupKey = file.status;
          break;
        case 'category':
          groupKey = file.category;
          break;
        case 'access_level':
          groupKey = file.access_level;
          break;
        default:
          groupKey = 'other';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(file);
    });

    return groups;
  }, [files, groupBy]);

  // Define column configurations
  const getColumnConfig = (groupKey: string) => {
    const configs = {
      // Status columns
      active: { title: 'Active', color: 'bg-green-100 border-green-300' },
      archived: { title: 'Archived', color: 'bg-gray-100 border-gray-300' },
      processing: { title: 'Processing', color: 'bg-yellow-100 border-yellow-300' },
      error: { title: 'Error', color: 'bg-red-100 border-red-300' },

      // Category columns
      document: { title: 'Documents', color: 'bg-blue-100 border-blue-300' },
      image: { title: 'Images', color: 'bg-green-100 border-green-300' },
      video: { title: 'Videos', color: 'bg-purple-100 border-purple-300' },
      audio: { title: 'Audio', color: 'bg-yellow-100 border-yellow-300' },
      drawing: { title: 'Drawings', color: 'bg-indigo-100 border-indigo-300' },
      specification: { title: 'Specifications', color: 'bg-pink-100 border-pink-300' },
      report: { title: 'Reports', color: 'bg-orange-100 border-orange-300' },
      template: { title: 'Templates', color: 'bg-cyan-100 border-cyan-300' },
      policy: { title: 'Policies', color: 'bg-red-100 border-red-300' },
      other: { title: 'Other', color: 'bg-gray-100 border-gray-300' },

      // Access level columns
      public: { title: 'Public', color: 'bg-green-100 border-green-300' },
      team: { title: 'Team', color: 'bg-blue-100 border-blue-300' },
      restricted: { title: 'Restricted', color: 'bg-yellow-100 border-yellow-300' },
      private: { title: 'Private', color: 'bg-red-100 border-red-300' },
    };

    return configs[groupKey as keyof typeof configs] || configs.other;
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, fileId: string) => {
    setDraggedFile(fileId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, newGroupKey: string) => {
    e.preventDefault();

    if (draggedFile) {
      // Convert group key back to the appropriate field value
      let fieldValue: string;

      if (groupBy === 'status') {
        fieldValue = newGroupKey;
      } else if (groupBy === 'category') {
        fieldValue = newGroupKey;
      } else if (groupBy === 'access_level') {
        fieldValue = newGroupKey;
      } else {
        fieldValue = newGroupKey;
      }

      onMoveFile(draggedFile, fieldValue);
      setDraggedFile(null);
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedFile(null);
  };

  // Get WIP limit for a column
  const getWipLimit = (groupKey: string) => {
    return wipLimits[groupKey] || 0;
  };

  // Check if column is over WIP limit
  const isOverWipLimit = (groupKey: string, fileCount: number) => {
    const limit = getWipLimit(groupKey);
    return limit > 0 && fileCount > limit;
  };

  // Get column order based on groupBy
  const getColumnOrder = () => {
    if (groupBy === 'status') {
      return ['active', 'processing', 'archived', 'error'];
    } else if (groupBy === 'access_level') {
      return ['public', 'team', 'restricted', 'private'];
    } else {
      // For category, use a reasonable order
      return ['document', 'image', 'video', 'audio', 'drawing', 'specification', 'report', 'template', 'policy', 'other'];
    }
  };

  const columnOrder = getColumnOrder();

  return (
    <div className="flex gap-lg overflow-x-auto pb-6">
      {columnOrder.map((groupKey) => {
        const config = getColumnConfig(groupKey);
        const columnFiles = groupedFiles[groupKey] || [];
        const isOverLimit = isOverWipLimit(groupKey, columnFiles.length);

        return (
          <div
            key={groupKey}
            className={`flex-shrink-0 w-container-md ${config.color} rounded-lg p-md min-h-content-xl`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, groupKey)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-xs">
                <h3 className="font-semibold text-gray-900">{config.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {columnFiles.length}
                  {getWipLimit(groupKey) > 0 && ` / ${getWipLimit(groupKey)}`}
                </Badge>
                {isOverLimit && (
                  <Badge variant="destructive" className="text-xs">
                    Over limit
                  </Badge>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-icon-xs h-icon-xs" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  <DropdownMenu.Item
                    onClick={() => setWipLimits(prev => ({
                      ...prev,
                      [groupKey]: (prev[groupKey] || 0) + 1
                    }))}
                  >
                    Increase WIP Limit
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onClick={() => setWipLimits(prev => ({
                      ...prev,
                      [groupKey]: Math.max(0, (prev[groupKey] || 0) - 1)
                    }))}
                  >
                    Decrease WIP Limit
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onClick={() => setWipLimits(prev => ({
                      ...prev,
                      [groupKey]: 0
                    }))}
                  >
                    Remove WIP Limit
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu>
            </div>

            {/* Cards */}
            <div className="space-y-sm">
              {columnFiles.map((file) => {
                const CategoryIcon = getCategoryIcon(file.category);

                return (
                  <Card
                    key={file.id}
                    className={`p-sm cursor-pointer hover:shadow-md transition-shadow ${
                      draggedFile === file.id ? 'opacity-50' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, file.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onView(file)}
                  >
                    <div className="flex items-start gap-sm">
                      {/* Drag Handle */}
                      <div className="mt-1">
                        <GripVertical className="w-icon-xs h-icon-xs text-gray-400" />
                      </div>

                      {/* File Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-icon-lg h-icon-lg rounded bg-white flex items-center justify-center">
                          <CategoryIcon className="w-icon-xs h-icon-xs text-gray-600" />
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {file.title}
                        </h4>

                        {file.description && (
                          <p className="text-xs text-gray-600 truncate mt-1">
                            {file.description}
                          </p>
                        )}

                        <div className="flex items-center gap-xs mt-2 text-xs text-gray-500">
                          <span>{formatFileSize(file.file_size || 0)}</span>
                          <span>•</span>
                          <span>{new Date(file.updated_at).toLocaleDateString()}</span>
                        </div>

                        {/* Tags */}
                        {file.tags && file.tags.length > 0 && (
                          <div className="flex flex-wrap gap-xs mt-2">
                            {file.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {file.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{file.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenu.Trigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            className="h-icon-md w-icon-md p-0"
                          >
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="end">
                          <DropdownMenu.Item onClick={() => onView(file)}>
                            <Eye className="w-icon-xs h-icon-xs mr-2" />
                            View
                          </DropdownMenu.Item>
                          <DropdownMenu.Item onClick={() => onEdit(file)}>
                            <Edit className="w-icon-xs h-icon-xs mr-2" />
                            Edit
                          </DropdownMenu.Item>
                          <DropdownMenu.Item onClick={() => onDownload(file)}>
                            <Download className="w-icon-xs h-icon-xs mr-2" />
                            Download
                          </DropdownMenu.Item>
                          <DropdownMenu.Item onClick={() => onShare(file)}>
                            <Share className="w-icon-xs h-icon-xs mr-2" />
                            Share
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator />
                          <DropdownMenu.Item
                            onClick={() => onDelete(file)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-icon-xs h-icon-xs mr-2" />
                            Delete
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu>
                    </div>
                  </Card>
                );
              })}

              {/* Add Card Placeholder */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-md text-center hover:border-gray-400 transition-colors">
                <Button variant="ghost" size="sm" className="w-full">
                  <Plus className="w-icon-xs h-icon-xs mr-2" />
                  Add file
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
