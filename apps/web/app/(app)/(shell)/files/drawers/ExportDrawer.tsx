"use client";

import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  Settings,
  CheckCircle,
  AlertCircle,
  Calendar,
  Filter
} from 'lucide-react';
import { Button, Select, Checkbox, Badge, Progress, Separator ,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@ghxstship/ui';
import { filesExportService } from '../lib/export';
import type { FileExportInput } from '../lib/validations';

interface ExportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onExportComplete: (jobId: string) => void;
  orgId: string;
  userId: string;
  availableFiles: Array<{ id: string; title: string; category: string }>;
}

type ExportFormat = 'csv' | 'xlsx' | 'json' | 'pdf';

export default function ExportDrawer({
  isOpen,
  onClose,
  onExportComplete,
  orgId,
  userId,
  availableFiles
}: ExportDrawerProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [exportOptions, setExportOptions] = useState({
    include_versions: false,
    include_metadata: true,
    date_range: '',
    selected_files: [] as string[],
    filters: {
      category: '',
      access_level: '',
      status: ''
    }
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportJobId, setExportJobId] = useState<string | null>(null);
  const [exportResults, setExportResults] = useState<{
    success: boolean;
    downloadUrl?: string;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportResults(null);

    try {
      const exportParams: FileExportInput = {
        format: selectedFormat,
        ids: exportOptions.selected_files.length > 0 ? exportOptions.selected_files : undefined,
        filters: {
          category: exportOptions.filters.category || undefined,
          access_level: exportOptions.filters.access_level || undefined,
          status: exportOptions.filters.status || undefined
        },
        include_versions: exportOptions.include_versions,
        include_metadata: exportOptions.include_metadata
      };

      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 25, 90));
      }, 500);

      const jobId = await filesExportService.scheduleExport(orgId, userId, exportParams);

      clearInterval(progressInterval);
      setExportProgress(100);
      setExportJobId(jobId);
      setExportResults({ success: true });
      onExportComplete(jobId);

    } catch (error) {
      console.error('Export failed:', error);
      setExportResults({
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const resetExport = () => {
    setExportOptions({
      include_versions: false,
      include_metadata: true,
      date_range: '',
      selected_files: [],
      filters: {
        category: '',
        access_level: '',
        status: ''
      }
    });
    setExportResults(null);
    setExportJobId(null);
    setExportProgress(0);
  };

  const getFormatDescription = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
        return 'Comma-separated values. Compatible with Excel and most spreadsheet applications.';
      case 'xlsx':
        return 'Microsoft Excel format. Preserves formatting and supports large datasets.';
      case 'json':
        return 'JavaScript Object Notation. Structured data format for developers.';
      case 'pdf':
        return 'Portable Document Format. Formatted report with charts and summaries.';
      default:
        return '';
    }
  };

  const selectedCount = exportOptions.selected_files.length;
  const filteredCount = availableFiles.filter(file => {
    if (selectedCount > 0 && !exportOptions.selected_files.includes(file.id)) return false;
    if (exportOptions.filters.category && file.category !== exportOptions.filters.category) return false;
    return true;
  }).length;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-2xl bg-white shadow-xl transform transition-transform overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-lg border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Export Files</h2>
            <p className="text-sm text-gray-500">
              Export file data in various formats
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-icon-xs h-icon-xs" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-lg">
          {exportResults ? (
            /* Results */
            <div className="text-center py-xl">
              {exportResults.success ? (
                <div className="space-y-md">
                  <CheckCircle className="w-icon-2xl h-icon-2xl text-green-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Export Started</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Your export job has been queued. You'll receive a download link when complete.
                    </p>
                  </div>
                  {exportJobId && (
                    <div className="bg-gray-50 p-sm rounded-lg">
                      <p className="text-sm text-gray-600">
                        Job ID: <code className="bg-gray-200 px-xs rounded text-xs">{exportJobId}</code>
                      </p>
                    </div>
                  )}
                  <Button onClick={resetExport} variant="outline">
                    Start New Export
                  </Button>
                </div>
              ) : (
                <div className="space-y-md">
                  <AlertCircle className="w-icon-2xl h-icon-2xl text-red-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Export Failed</h3>
                    <p className="text-sm text-red-600 mt-1">{exportResults.error}</p>
                  </div>
                  <Button onClick={resetExport} variant="outline">
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Export Form */
            <div className="space-y-lg">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Export Format
                </label>
                <div className="grid grid-cols-2 gap-sm">
                  {(['csv', 'xlsx', 'json', 'pdf'] as ExportFormat[]).map((format) => (
                    <div
                      key={format}
                      className={`p-sm border rounded-lg cursor-pointer transition-colors ${
                        selectedFormat === format
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedFormat(format)}
                    >
                      <div className="flex items-center gap-xs">
                        <FileText className="w-icon-sm h-icon-sm text-gray-600" />
                        <span className="font-medium uppercase">{format}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {getFormatDescription(format)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Files to Export ({filteredCount} selected)
                </label>

                <div className="space-y-sm">
                  {/* Select All */}
                  <div className="flex items-center gap-xs p-xs border border-gray-200 rounded">
                    <Checkbox
                      checked={selectedCount === availableFiles.length}
                      onCheckedChange={(checked) => {
                        setExportOptions(prev => ({
                          ...prev,
                          selected_files: checked ? availableFiles.map(f => f.id) : []
                        }));
                      }}
                    />
                    <span className="text-sm font-medium">Select All Files</span>
                    <Badge variant="secondary" className="ml-auto">
                      {availableFiles.length} total
                    </Badge>
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-3 gap-sm">
                    <Select
                      value={exportOptions.filters.category}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        filters: { ...prev.filters, category: value }
                      }))}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="All Categories" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="">All Categories</Select.Item>
                        <Select.Item value="document">Documents</Select.Item>
                        <Select.Item value="image">Images</Select.Item>
                        <Select.Item value="video">Videos</Select.Item>
                        <Select.Item value="audio">Audio</Select.Item>
                      </Select.Content>
                    </Select>

                    <Select
                      value={exportOptions.filters.access_level}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        filters: { ...prev.filters, access_level: value }
                      }))}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="All Access Levels" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="">All Access Levels</Select.Item>
                        <Select.Item value="public">Public</Select.Item>
                        <Select.Item value="team">Team</Select.Item>
                        <Select.Item value="private">Private</Select.Item>
                      </Select.Content>
                    </Select>

                    <Select
                      value={exportOptions.filters.status}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        filters: { ...prev.filters, status: value }
                      }))}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="All Statuses" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="">All Statuses</Select.Item>
                        <Select.Item value="active">Active</Select.Item>
                        <Select.Item value="archived">Archived</Select.Item>
                        <Select.Item value="processing">Processing</Select.Item>
                      </Select.Content>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Export Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Export Options
                </label>
                <div className="space-y-sm">
                  <div className="flex items-center gap-xs">
                    <Checkbox
                      id="include-metadata"
                      checked={exportOptions.include_metadata}
                      onCheckedChange={(checked) => setExportOptions(prev => ({
                        ...prev,
                        include_metadata: checked || false
                      }))}
                    />
                    <label htmlFor="include-metadata" className="text-sm">
                      Include file metadata
                    </label>
                  </div>

                  <div className="flex items-center gap-xs">
                    <Checkbox
                      id="include-versions"
                      checked={exportOptions.include_versions}
                      onCheckedChange={(checked) => setExportOptions(prev => ({
                        ...prev,
                        include_versions: checked || false
                      }))}
                    />
                    <label htmlFor="include-versions" className="text-sm">
                      Include version history
                    </label>
                  </div>
                </div>
              </div>

              {/* Export Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Export Summary</h4>
                <div className="grid grid-cols-2 gap-md text-sm">
                  <div>
                    <span className="text-blue-700">Files to export:</span>
                    <span className="ml-2 font-medium">{filteredCount}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Format:</span>
                    <span className="ml-2 font-medium uppercase">{selectedFormat}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Include metadata:</span>
                    <span className="ml-2 font-medium">{exportOptions.include_metadata ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Include versions:</span>
                    <span className="ml-2 font-medium">{exportOptions.include_versions ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!exportResults && (
          <div className="border-t border-gray-200 p-lg">
            <div className="flex justify-end gap-sm">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting || filteredCount === 0}
              >
                <Download className="w-icon-xs h-icon-xs mr-2" />
                {isExporting ? 'Starting Export...' : `Export ${filteredCount} Files`}
              </Button>
            </div>
          </div>
        )}

        {/* Export Progress */}
        {isExporting && (
          <div className="border-t border-gray-200 p-lg">
            <div className="space-y-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Preparing export...</span>
                <span className="text-sm text-gray-500">{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
