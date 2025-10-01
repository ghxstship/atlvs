"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Eye,
  Edit,
  Download,
  Share,
  Trash2,
  MoreHorizontal,
  Calendar,
  User,
  FileText,
  Tag,
  Lock,
  Clock,
  HardDrive,
  ArrowLeft,
  History,
} from 'lucide-react';
import { Button, Badge, DropdownMenu, Separator } from '@ghxstship/ui';
import DetailDrawer from '../drawers/ViewFileDrawer';
import EditDrawer from '../drawers/EditDrawer';
import HistoryDrawer from '../drawers/HistoryDrawer';
import { filesQueriesService } from '../lib/queries';
import { filesApiService } from '../lib/api';
import { filesPermissionsService } from '../lib/permissions';
import type { DigitalAsset } from '../types';

export default function FileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fileId = params.id as string;

  const [file, setFile] = useState<DigitalAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string>(''); // Would come from context
  const [userId, setUserId] = useState<string>(''); // Would come from context

  // Drawer states
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  useEffect(() => {
    if (fileId) {
      loadFile();
    }
  }, [fileId]);

  const loadFile = async () => {
    try {
      setIsLoading(true);
      const fileData = await filesQueriesService.getFileById(fileId, orgId);
      setFile(fileData);
    } catch (err) {
      console.error('Failed to load file:', err);
      setError('File not found or access denied');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = () => {
    setShowDetailDrawer(true);
  };

  const handleEdit = () => {
    setShowEditDrawer(true);
  };

  const handleDownload = async () => {
    if (!file) return;

    try {
      const downloadUrl = await filesApiService.getFileUrl(file.file_path, orgId);
      // In a real implementation, trigger download
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = () => {
    // Implement share functionality
  };

  const handleDelete = async () => {
    if (!file || !confirm('Are you sure you want to delete this file?')) return;

    try {
      await filesApiService.deleteFile(file.id, userId);
      router.push('/files');
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleSave = async (id: string, data: unknown) => {
    try {
      await filesApiService.updateFile(id, data, userId);
      await loadFile(); // Reload file data
    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      document: FileText,
      image: FileText, // Would use Image icon in real implementation
      video: FileText, // Would use Video icon in real implementation
      audio: FileText, // Would use Music icon in real implementation
      other: FileText,
    };
    return icons[category as keyof typeof icons] || FileText;
  };

  const getAccessIcon = (level: string) => {
    return Lock; // Simplified
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-icon-lg h-icon-lg border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-icon-2xl h-icon-2xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">File Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested file could not be found.'}</p>
          <Button onClick={() => router.push('/files')}>
            <ArrowLeft className="w-icon-xs h-icon-xs mr-2" />
            Back to Files
          </Button>
        </div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(file.category);
  const AccessIcon = getAccessIcon(file.access_level);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl">
          <div className="flex items-center justify-between h-component-md">
            <div className="flex items-center gap-md">
              <Button
                variant="ghost"
                onClick={() => router.push('/files')}
              >
                <ArrowLeft className="w-icon-xs h-icon-xs mr-2" />
                Back to Files
              </Button>

              <Separator orientation="vertical" className="h-icon-md" />

              <div className="flex items-center gap-sm">
                <div className="w-icon-xl h-icon-xl rounded-lg bg-gray-100 flex items-center justify-center">
                  <CategoryIcon className="w-icon-sm h-icon-sm text-gray-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{file.title}</h1>
                  <p className="text-sm text-gray-500">
                    {file.category} • {formatFileSize(file.file_size || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-xs">
              <Badge variant={file.status === 'active' ? 'default' : 'secondary'}>
                {file.status}
              </Badge>

              <Button variant="outline" onClick={handleView}>
                <Eye className="w-icon-xs h-icon-xs mr-2" />
                View Details
              </Button>

              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-icon-xs h-icon-xs mr-2" />
                Download
              </Button>

              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <Button variant="outline">
                    <MoreHorizontal className="w-icon-xs h-icon-xs" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  <DropdownMenu.Item onClick={handleEdit}>
                    <Edit className="w-icon-xs h-icon-xs mr-2" />
                    Edit
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onClick={handleShare}>
                    <Share className="w-icon-xs h-icon-xs mr-2" />
                    Share
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => setShowHistoryDrawer(true)}>
                    <History className="w-icon-xs h-icon-xs mr-2" />
                    View History
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item
                    onClick={handleDelete}
                    className="text-red-600"
                  >
                    <Trash2 className="w-icon-xs h-icon-xs mr-2" />
                    Delete
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl py-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* File Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">File Preview</h2>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-xsxl text-center">
                {file.category === 'image' ? (
                  <div className="space-y-md">
                    <div className="w-component-lg h-component-lg mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-icon-2xl h-icon-2xl text-gray-400" />
                    </div>
                    <p className="text-gray-500">Image preview not available</p>
                  </div>
                ) : (
                  <div className="space-y-md">
                    <div className="w-component-lg h-component-lg mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                      <CategoryIcon className="w-icon-2xl h-icon-2xl text-gray-400" />
                    </div>
                    <p className="text-gray-500">
                      Preview not available for {file.category} files
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleDownload}
                  className="mt-4"
                >
                  <Download className="w-icon-xs h-icon-xs mr-2" />
                  Download File
                </Button>
              </div>
            </div>
          </div>

          {/* File Information */}
          <div className="space-y-lg">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm p-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">File Information</h3>

              <div className="space-y-md">
                <div>
                  <div className="text-sm font-medium text-gray-500">Title</div>
                  <div className="text-sm text-gray-900 mt-1">{file.title}</div>
                </div>

                {file.description && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Description</div>
                    <div className="text-sm text-gray-900 mt-1">{file.description}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Category</div>
                    <div className="flex items-center gap-xs mt-1">
                      <CategoryIcon className="w-icon-xs h-icon-xs text-gray-400" />
                      <span className="text-sm text-gray-900 capitalize">{file.category}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500">Access</div>
                    <div className="flex items-center gap-xs mt-1">
                      <AccessIcon className="w-icon-xs h-icon-xs text-gray-400" />
                      <span className="text-sm text-gray-900 capitalize">{file.access_level}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Size</div>
                    <div className="text-sm text-gray-900 mt-1">{formatFileSize(file.file_size || 0)}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500">Status</div>
                    <Badge variant={file.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                      {file.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {file.tags && file.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-xs">
                  {file.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow-sm p-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>

              <div className="space-y-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-xs">
                    <User className="w-icon-xs h-icon-xs text-gray-400" />
                    <span className="text-sm text-gray-600">Created by</span>
                  </div>
                  <span className="text-sm text-gray-900">{file.created_by}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-xs">
                    <Calendar className="w-icon-xs h-icon-xs text-gray-400" />
                    <span className="text-sm text-gray-600">Created</span>
                  </div>
                  <span className="text-sm text-gray-900">
                    {new Date(file.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-xs">
                    <Clock className="w-icon-xs h-icon-xs text-gray-400" />
                    <span className="text-sm text-gray-600">Modified</span>
                  </div>
                  <span className="text-sm text-gray-900">
                    {new Date(file.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

              <div className="space-y-xs">
                <Button onClick={handleDownload} className="w-full justify-start">
                  <Download className="w-icon-xs h-icon-xs mr-2" />
                  Download File
                </Button>

                <Button variant="outline" onClick={handleShare} className="w-full justify-start">
                  <Share className="w-icon-xs h-icon-xs mr-2" />
                  Share File
                </Button>

                <Button variant="outline" onClick={handleEdit} className="w-full justify-start">
                  <Edit className="w-icon-xs h-icon-xs mr-2" />
                  Edit Details
                </Button>

                <Button variant="outline" onClick={() => setShowHistoryDrawer(true)} className="w-full justify-start">
                  <History className="w-icon-xs h-icon-xs mr-2" />
                  View History
                </Button>

                <Separator />

                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="w-full justify-start"
                >
                  <Trash2 className="w-icon-xs h-icon-xs mr-2" />
                  Delete File
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawers */}
      <DetailDrawer
        file={file}
        open={showDetailDrawer}
        onOpenChange={() => setShowDetailDrawer(false)}
        onEdit={handleEdit}
        onDownload={handleDownload}
        formatFileSize={formatFileSize}
      />

      <EditDrawer
        file={file}
        isOpen={showEditDrawer}
        onClose={() => setShowEditDrawer(false)}
        onSave={handleSave}
        formatFileSize={formatFileSize}
        getCategoryIcon={getCategoryIcon}
        getAccessIcon={getAccessIcon}
      />

      <HistoryDrawer
        file={file}
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
      />
    </div>
  );
}
