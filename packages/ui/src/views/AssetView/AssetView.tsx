/**
 * AssetView Component — Media/Asset Management
 * File upload and asset gallery
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React, { useState } from 'react';
import { Upload, Download, Trash, Eye, File, Image, Video, FileText } from 'lucide-react';
import type { ViewProps, DataRecord } from '../types';

export interface AssetViewProps extends ViewProps {
  /** File URL field */
  fileField: string;
  
  /** File type field */
  typeField?: string;
  
  /** File size field */
  sizeField?: string;
  
  /** Upload handler */
  onUpload?: (files: FileList) => void | Promise<void>;
  
  /** Download handler */
  onDownload?: (record: DataRecord) => void;
  
  /** Custom className */
  className?: string;
}

/**
 * AssetView Component
 */
export function AssetView({
  data,
  fields,
  state,
  loading = false,
  error = null,
  onRecordClick,
  onRecordSelect,
  onCreate,
  onDelete,
  fileField,
  typeField,
  sizeField,
  onUpload,
  onDownload,
  className = '',
}: AssetViewProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<DataRecord | null>(null);
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };
  
  // Get file icon
  const getFileIcon = (type: string) => {
    if (type?.startsWith('image/')) return Image;
    if (type?.startsWith('video/')) return Video;
    if (type?.startsWith('text/') || type?.includes('document')) return FileText;
    return File;
  };
  
  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (onUpload && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };
  
  // Handle file input
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onUpload && e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive font-medium">Error loading assets</p>
          <p className="text-muted-foreground text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Upload area */}
      {onUpload && (
        <div
          className={`
            m-4 p-8
            border-2 border-dashed rounded-lg
            ${dragActive ? 'border-primary bg-primary/5' : 'border-border'}
            hover:border-primary
            transition-colors
          `}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">Drop files here or click to upload</p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports images, videos, and documents
              </p>
            </div>
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="
                px-4 py-2 rounded-md
                bg-primary
                text-primary-foreground
                hover:opacity-90
                cursor-pointer
                transition-opacity
              "
            >
              Choose Files
            </label>
          </div>
        </div>
      )}
      
      {/* Asset grid */}
      <div className="flex-1 overflow-auto p-4">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No assets yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {data.map(record => {
              const fileUrl = record[fileField];
              const fileType = typeField ? record[typeField] : '';
              const fileSize = sizeField ? record[sizeField] : 0;
              const FileIcon = getFileIcon(fileType);
              const isImage = fileType?.startsWith('image/');
              
              return (
                <div
                  key={record.id}
                  className={`
                    group relative
                    rounded-lg overflow-hidden
                    border border-border
                    hover:border-primary
                    bg-card
                    transition-all
                    ${state.selectedIds.includes(record.id) ? 'ring-2 ring-primary' : ''}
                  `}
                >
                  {/* Checkbox */}
                  {onRecordSelect && (
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={state.selectedIds.includes(record.id)}
                        onChange={(e) => {
                          const newSelection = e.target.checked
                            ? [...state.selectedIds, record.id]
                            : state.selectedIds.filter(id => id !== record.id);
                          onRecordSelect(newSelection);
                        }}
                        className="rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                  
                  {/* Preview */}
                  <div
                    className="aspect-square bg-muted flex items-center justify-center cursor-pointer"
                    onClick={() => setPreviewAsset(record)}
                  >
                    {isImage ? (
                      <img
                        src={fileUrl}
                        alt={record.name || 'Asset'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileIcon className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="p-2">
                    <p className="text-sm font-medium truncate">
                      {record.name || 'Untitled'}
                    </p>
                    {fileSize > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(fileSize)}
                      </p>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {onDownload && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(record);
                        }}
                        className="
                          p-2 rounded
                          bg-card
                          border border-border
                          hover:bg-muted
                          shadow-sm
                          transition-colors
                        "
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete([record.id]);
                        }}
                        className="
                          p-2 rounded
                          bg-card
                          border border-destructive
                          text-destructive
                          hover:bg-destructive
                          hover:text-destructive-foreground
                          shadow-sm
                          transition-colors
                        "
                        title="Delete"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Preview modal */}
      {previewAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreviewAsset(null)}
        >
          <div className="max-w-4xl max-h-[90vh] p-4">
            <img
              src={previewAsset[fileField]}
              alt={previewAsset.name || 'Asset'}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

AssetView.displayName = 'AssetView';
