import React, { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@ghxstship/ui';
import { Button } from '@ghxstship/ui';
import { Label } from '@ghxstship/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ghxstship/ui';
import { Checkbox } from '@ghxstship/ui';
import { Separator } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import {
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';
import { marketplaceService } from '../lib/marketplace-service';
import type { ListingFilters } from '../types';

interface ExportDrawerProps {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExportComplete?: (results: unknown) => void;
}

export default function ExportDrawer({
  orgId,
  open,
  onOpenChange,
  onExportComplete,
}: ExportDrawerProps) {
  const [format, setFormat] = useState<'csv' | 'json' | 'excel' | 'pdf'>('csv');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [filters, setFilters] = useState<Partial<ListingFilters>({});
  const [isExporting, setIsExporting] = useState(false);
  const [results, setResults] = useState<(null);
  const [metadata, setMetadata] = useState<(null);

  // Available fields for export
  const availableFields = [
    { key: 'title', label: 'Title', required: true },
    { key: 'description', label: 'Description' },
    { key: 'type', label: 'Type' },
    { key: 'category', label: 'Category' },
    { key: 'subcategory', label: 'Subcategory' },
    { key: 'status', label: 'Status' },
    { key: 'pricing.amount', label: 'Price Amount' },
    { key: 'pricing.currency', label: 'Currency' },
    { key: 'pricing.negotiable', label: 'Negotiable' },
    { key: 'location.city', label: 'City' },
    { key: 'location.country', label: 'Country' },
    { key: 'location.isRemote', label: 'Remote' },
    { key: 'featured', label: 'Featured' },
    { key: 'response_count', label: 'Responses' },
    { key: 'view_count', label: 'Views' },
    { key: 'created_at', label: 'Created Date' },
    { key: 'updated_at', label: 'Updated Date' },
  ];

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldKey)
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handleSelectAllFields = () => {
    setSelectedFields(availableFields.map(f => f.key));
  };

  const handleSelectTemplate = (templateKey: string) => {
    const templates = marketplaceService.getExportTemplates();
    const template = templates[templateKey as keyof typeof templates];
    if (template) {
      setSelectedFields(template.fields);
    }
  };

  const loadMetadata = async () => {
    try {
      const meta = await marketplaceService.getExportMetadata(orgId, filters);
      setMetadata(meta);
    } catch (error) {
      console.error('Failed to load export metadata:', error);
    }
  };

  React.useEffect(() => {
    if (open) {
      loadMetadata();
      // Set default fields
      setSelectedFields(availableFields.filter(f => f.required).map(f => f.key));
    }
  }, [open, filters]);

  const handleExport = async () => {
    setIsExporting(true);
    setResults(null);

    try {
      const exportResults = await marketplaceService.exportListingsBulk(
        orgId,
        '',
        format,
        filters,
        selectedFields
      );

      setResults({
        success: true,
        format,
        recordCount: metadata?.totalRecords || 0,
        fileSize: exportResults.length,
        downloadUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(exportResults)}`,
      });

      onExportComplete?.(exportResults);
    } catch (error) {
      setResults({
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (results?.downloadUrl) {
      const link = document.createElement('a');
      link.href = results.downloadUrl;
      link.download = `marketplace-listings-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetForm = () => {
    setFormat('csv');
    setSelectedFields([]);
    setIncludeMetadata(true);
    setFilters({});
    setResults(null);
    setMetadata(null);
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
            <Download className="h-5 w-5" />
            Export Listings
          </DrawerTitle>
          <DrawerDescription>
            Export marketplace listings to various formats
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Export Summary */}
            {metadata && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4" />
                  <span className="font-medium">Export Summary</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-2xl font-bold">{metadata.totalRecords}</div>
                    <div className="text-muted-foreground">Total Records</div>
                  </div>
                  <div>
                    <div className="text-lg">{metadata.estimatedFileSize}</div>
                    <div className="text-muted-foreground">Estimated Size</div>
                  </div>
                  <div>
                    <div className="text-lg">{metadata.fieldCount}</div>
                    <div className="text-muted-foreground">Available Fields</div>
                  </div>
                </div>
              </div>
            )}

            {/* Format Selection */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="format">Export Format</Label>
                <Select value={format} onValueChange={(value: 'csv' | 'json' | 'excel' | 'pdf') => setFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                    <SelectItem value="json">JSON (JavaScript Object Notation)</SelectItem>
                    <SelectItem value="excel">Excel (XLSX)</SelectItem>
                    <SelectItem value="pdf">PDF (Portable Document Format)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Export Templates */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Quick Templates</h3>
                <Button variant="outline" size="sm" onClick={handleSelectAllFields}>
                  Select All Fields
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {Object.entries(marketplaceService.getExportTemplates()).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => handleSelectTemplate(key)}
                    className="text-left border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {template.fields.length} fields
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Field Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Fields</h3>

              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {availableFields.map((field) => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.key}
                      checked={selectedFields.includes(field.key)}
                      onCheckedChange={() => handleFieldToggle(field.key)}
                      disabled={field.required}
                    />
                    <Label htmlFor={field.key} className="text-sm flex-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="include-metadata"
                  checked={includeMetadata}
                  onCheckedChange={(checked) => setIncludeMetadata(!!checked)}
                />
                <Label htmlFor="include-metadata" className="text-sm">
                  Include export metadata and timestamp
                </Label>
              </div>
            </div>

            {/* Results */}
            {results && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Export Results</h3>

                  {results.success ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-green-900">Export Successful</div>
                          <div className="text-sm text-green-700">
                            {results.recordCount} records exported in {results.format.toUpperCase()} format
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button onClick={handleDownload} className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Download File
                        </Button>
                        <Button variant="outline" onClick={() => setResults(null)}>
                          Export Again
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-red-900">Export Failed</div>
                        <div className="text-sm text-red-700">{results.error}</div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-6">
          <div className="flex gap-3">
            {!results?.success && (
              <Button
                onClick={handleExport}
                disabled={isExporting || selectedFields.length === 0}
                className="flex-1"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export {metadata?.totalRecords || 0} Listings
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
