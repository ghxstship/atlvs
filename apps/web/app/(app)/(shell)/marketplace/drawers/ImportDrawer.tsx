import React, { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@ghxstship/ui';
import { Button } from '@ghxstship/ui';
import { Input } from '@ghxstship/ui';
import { Label } from '@ghxstship/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ghxstship/ui';
import { Checkbox } from '@ghxstship/ui';
import { Separator } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { marketplaceService } from '../lib/marketplace-service';
import type { ListingFilters } from '../types';

interface ImportDrawerProps {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: (results: unknown) => void;
}

export default function ImportDrawer({
  orgId,
  open,
  onOpenChange,
  onImportComplete,
}: ImportDrawerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'csv' | 'json' | 'excel'>('csv');
  const [options, setOptions] = useState({
    skipDuplicates: true,
    updateExisting: false,
    validateOnly: false,
  });
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<(null);
  const [preview, setPreview] = useState<(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResults(null);
      generatePreview(selectedFile);
    }
  };

  const generatePreview = async (selectedFile: File) => {
    try {
      const text = await selectedFile.text();
      const previewData = await marketplaceService.previewImport(format, text, 3);
      setPreview(previewData);
    } catch (error) {
      console.error('Failed to generate preview:', error);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setResults(null);

    try {
      const fileContent = await file.text();
      const importResults = await marketplaceService.importListings(orgId, '', format, fileContent, options);
      setResults(importResults);
      onImportComplete?.(importResults);
    } catch (error) {
      setResults({
        success: false,
        imported: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : 'Import failed'],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setFormat('csv');
    setOptions({ skipDuplicates: true, updateExisting: false, validateOnly: false });
    setResults(null);
    setPreview(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Listings
          </DrawerTitle>
          <DrawerDescription>
            Import marketplace listings from CSV, JSON, or Excel files
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Format Selection */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="format">Import Format</Label>
                <Select value={format} onValueChange={(value: 'csv' | 'json' | 'excel') => setFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                    <SelectItem value="json">JSON (JavaScript Object Notation)</SelectItem>
                    <SelectItem value="excel">Excel (XLSX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <div>
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  accept={format === 'csv' ? '.csv' : format === 'json' ? '.json' : '.xlsx,.xls'}
                  onChange={handleFileChange}
                  className="mt-1"
                />
                {file && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Import Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Import Options</h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skip-duplicates"
                    checked={options.skipDuplicates}
                    onCheckedChange={(checked) => setOptions(prev => ({ ...prev, skipDuplicates: !!checked }))}
                  />
                  <Label htmlFor="skip-duplicates" className="text-sm">
                    Skip duplicate listings (based on title)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="update-existing"
                    checked={options.updateExisting}
                    onCheckedChange={(checked) => setOptions(prev => ({ ...prev, updateExisting: !!checked }))}
                  />
                  <Label htmlFor="update-existing" className="text-sm">
                    Update existing listings with matching data
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="validate-only"
                    checked={options.validateOnly}
                    onCheckedChange={(checked) => setOptions(prev => ({ ...prev, validateOnly: !!checked }))}
                  />
                  <Label htmlFor="validate-only" className="text-sm">
                    Validate only (don't import data)
                  </Label>
                </div>
              </div>
            </div>

            {/* Preview */}
            {preview && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Data Preview</h3>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm font-medium mb-2">Columns Found:</div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {preview.headers.map((header: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {header}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-sm font-medium mb-2">Sample Data (first 3 rows):</div>
                    <div className="space-y-2">
                      {preview.preview.map((row: unknown, index: number) => (
                        <div key={index} className="text-xs bg-background p-2 rounded border">
                          <div className="font-medium">Row {index + 1}:</div>
                          <div className="mt-1 text-muted-foreground">
                            {Object.entries(row).slice(0, 3).map(([key, value]) => (
                              <span key={key}>{key}: {String(value)} </span>
                            ))}
                            {Object.keys(row).length > 3 && <span>... (+{Object.keys(row).length - 3} more)</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Results */}
            {results && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Import Results</h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">{results.imported || 0}</div>
                      <div className="text-sm text-green-700">Imported</div>
                    </div>

                    <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <AlertCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{results.skipped || 0}</div>
                      <div className="text-sm text-blue-700">Skipped</div>
                    </div>

                    {results.errors?.length > 0 && (
                      <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                        <X className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-red-600">{results.errors.length}</div>
                        <div className="text-sm text-red-700">Errors</div>
                      </div>
                    )}
                  </div>

                  {results.errors?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-900">Errors:</h4>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {results.errors.map((error: string, index: number) => (
                          <div key={index} className="text-sm text-red-700 bg-red-50 p-2 rounded">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Import Templates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Import Templates</h3>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(marketplaceService.getImportTemplates()).map(([key, template]) => (
                  <div key={key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <Button size="sm" variant="outline">
                        Download Template
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                    <div className="text-xs text-muted-foreground">
                      Required: {template.requiredFields.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-6">
          <div className="flex gap-3">
            {file && !results && (
              <Button
                onClick={handleImport}
                disabled={isImporting}
                className="flex-1"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {options.validateOnly ? 'Validate' : 'Import'} Listings
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
