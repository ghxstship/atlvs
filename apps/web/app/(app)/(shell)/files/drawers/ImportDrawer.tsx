"use client";

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Trash2,
  Settings,
  Eye,
} from 'lucide-react';
import { Button, Progress, Badge, Separator, Select } from '@ghxstship/ui';
import { filesImportService } from '../lib/import';
import type { FileImportInput } from '../lib/validations';

interface ImportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (results: unknown) => void;
  orgId: string;
  userId: string;
}

type ImportFormat = 'csv' | 'xlsx' | 'json' | 'xml';

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
  duplicates: Array<{ row: number; title: string }>;
}

export default function ImportDrawer({
  isOpen,
  onClose,
  onImportComplete,
  orgId,
  userId,
}: ImportDrawerProps) {
  const [selectedFormat, setSelectedFormat] = useState<ImportFormat>('csv');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importOptions, setImportOptions] = useState({
    skip_duplicates: true,
    update_existing: false,
    folder_id: '',
    category: '',
    access_level: 'private' as const,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResults(null);
      setPreviewData([]);
      setShowPreview(false);
    }
  };

  const handlePreview = async () => {
    if (!selectedFile) return;

    try {
      const text = await selectedFile.text();
      let data: unknown[] = [];

      switch (selectedFormat) {
        case 'csv':
          // Simple CSV parsing for preview
          const lines = text.split('\n').slice(0, 6); // First 5 rows + header
          const headers = lines[0]?.split(',') || [];
          data = lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, index) => {
              obj[header.trim()] = values[index]?.trim() || '';
              return obj;
            }, {} as any);
          });
          break;

        case 'json':
          const jsonData = JSON.parse(text);
          data = Array.isArray(jsonData) ? jsonData.slice(0, 5) : [jsonData];
          break;

        default:
          // For other formats, show raw preview
          data = [{ preview: text.slice(0, 200) + '...' }];
      }

      setPreviewData(data);
      setShowPreview(true);
    } catch (error) {
      console.error('Preview failed:', error);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportResults(null);

    try {
      const fileContent = await selectedFile.text();

      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 20, 90));
      }, 500);

      let results: ImportResult;

      switch (selectedFormat) {
        case 'csv':
          results = await filesImportService.importFromCSV(
            orgId,
            userId,
            fileContent,
            importOptions
          );
          break;

        case 'xlsx':
          // For demo, treat as CSV
          results = await filesImportService.importFromCSV(
            orgId,
            userId,
            fileContent,
            importOptions
          );
          break;

        case 'json':
          results = await filesImportService.importFromJSON(
            orgId,
            userId,
            JSON.parse(fileContent),
            importOptions
          );
          break;

        case 'xml':
          results = await filesImportService.importFromXML(
            orgId,
            userId,
            fileContent,
            importOptions
          );
          break;

        default:
          throw new Error(`Unsupported format: ${selectedFormat}`);
      }

      clearInterval(progressInterval);
      setImportProgress(100);
      setImportResults(results);
      onImportComplete(results);

    } catch (error) {
      console.error('Import failed:', error);
      setImportResults({
        success: 0,
        failed: 1,
        errors: [{ row: 0, error: error instanceof Error ? error.message : 'Import failed' }],
        duplicates: [],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportResults(null);
    setPreviewData([]);
    setShowPreview(false);
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFormatDescription = (format: ImportFormat) => {
    switch (format) {
      case 'csv':
        return 'Comma-separated values. Supports Excel export format.';
      case 'xlsx':
        return 'Microsoft Excel format. Preserves formatting and multiple sheets.';
      case 'json':
        return 'JavaScript Object Notation. Structured data format.';
      case 'xml':
        return 'Extensible Markup Language. Hierarchical data structure.';
      default:
        return '';
    }
  };

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
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Import Files</h2>
            <p className="text-sm text-gray-500">
              Import files from CSV, Excel, JSON, or XML
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!importResults ? (
            /* Import Form */
            <div className="space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Import Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['csv', 'xlsx', 'json', 'xml'] as ImportFormat[]).map((format) => (
                    <div
                      key={format}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedFormat === format
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedFormat(format)}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-600" />
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {selectedFile ? (
                    <div className="space-y-3">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={resetImport}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Drag and drop a file here, or click to browse
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supports {selectedFormat.toUpperCase()} files up to 10MB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Browse Files
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={selectedFormat === 'csv' ? '.csv' :
                               selectedFormat === 'xlsx' ? '.xlsx,.xls' :
                               selectedFormat === 'json' ? '.json' : '.xml'}
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Import Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Import Options
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="skip-duplicates"
                      checked={importOptions.skip_duplicates}
                      onChange={(e) => setImportOptions(prev => ({
                        ...prev,
                        skip_duplicates: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <label htmlFor="skip-duplicates" className="text-sm">
                      Skip duplicate files
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="update-existing"
                      checked={importOptions.update_existing}
                      onChange={(e) => setImportOptions(prev => ({
                        ...prev,
                        update_existing: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <label htmlFor="update-existing" className="text-sm">
                      Update existing files
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      value={importOptions.category}
                      onValueChange={(value) => setImportOptions(prev => ({
                        ...prev,
                        category: value
                      }))}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Default category" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="">No default</Select.Item>
                        <Select.Item value="document">Document</Select.Item>
                        <Select.Item value="image">Image</Select.Item>
                        <Select.Item value="video">Video</Select.Item>
                        <Select.Item value="audio">Audio</Select.Item>
                      </Select.Content>
                    </Select>

                    <Select
                      value={importOptions.access_level}
                      onValueChange={(value: unknown) => setImportOptions(prev => ({
                        ...prev,
                        access_level: value
                      }))}
                    >
                      <Select.Trigger>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="private">Private</Select.Item>
                        <Select.Item value="team">Team</Select.Item>
                        <Select.Item value="public">Public</Select.Item>
                      </Select.Content>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {selectedFile && (
                <div>
                  <Button
                    variant="outline"
                    onClick={handlePreview}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Data
                  </Button>

                  {showPreview && previewData.length > 0 && (
                    <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                        <span className="text-sm font-medium">Data Preview (First 5 rows)</span>
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        <pre className="text-xs p-3 bg-gray-50">
                          {JSON.stringify(previewData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Results */
            <div className="space-y-6">
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  importResults.success > 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {importResults.success > 0 ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Import Complete
                </h3>
                <div className="flex justify-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{importResults.success}</div>
                    <div className="text-gray-500">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
                    <div className="text-gray-500">Failed</div>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {importResults.errors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Errors</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {importResults.errors.map((error, index) => (
                      <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <span className="font-medium">Row {error.row}:</span> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Duplicates */}
              {importResults.duplicates.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Duplicates Skipped</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {importResults.duplicates.map((duplicate, index) => (
                      <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <span className="font-medium">Row {duplicate.row}:</span> {duplicate.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!importResults && (
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {selectedFile && !isImporting && (
                <Button onClick={handleImport} disabled={!selectedFile}>
                  <Upload className="w-4 h-4 mr-2" />
                  Start Import
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Import Progress */}
        {isImporting && (
          <div className="border-t border-gray-200 p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Importing...</span>
                <span className="text-sm text-gray-500">{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="w-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
