/**
 * FileManager Component — File Browser
 * Browse and manage files with upload support
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { File, Folder, Upload, Download, Trash2, MoreVertical } from 'lucide-react';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified?: Date;
  icon?: React.ReactNode;
}

export interface FileManagerProps {
  /** Files and folders */
  items: FileItem[];
  
  /** Current path */
  path?: string[];
  
  /** Item click handler */
  onItemClick?: (item: FileItem) => void;
  
  /** Upload handler */
  onUpload?: (files: FileList) => void;
  
  /** Delete handler */
  onDelete?: (item: FileItem) => void;
  
  /** Download handler */
  onDownload?: (item: FileItem) => void;
  
  /** View mode */
  view?: 'grid' | 'list';
}

/**
 * FileManager Component
 */
export const FileManager: React.FC<FileManagerProps> = ({
  items,
  path = [],
  onItemClick,
  onUpload,
  onDelete,
  onDownload,
  view = 'list',
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onUpload) {
      onUpload(e.target.files);
    }
  };
  
  if (view === 'grid') {
    return (
      <div>
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 p-4 border-b border-[var(--color-border)]">
          <div className="text-sm text-[var(--color-foreground-secondary)]">
            {path.length > 0 ? path.join(' / ') : 'Root'}
          </div>
          {onUpload && (
            <label className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] cursor-pointer hover:opacity-90 transition-opacity">
              <Upload className="w-4 h-4 inline mr-2" />
              Upload
              <input type="file" multiple onChange={handleFileInput} className="hidden" />
            </label>
          )}
        </div>
        
        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className="
                p-4 rounded-lg border border-[var(--color-border)]
                hover:border-[var(--color-primary)] hover:bg-[var(--color-muted)]
                cursor-pointer transition-all
              "
            >
              <div className="flex flex-col items-center text-center">
                {item.type === 'folder' ? (
                  <Folder className="w-12 h-12 text-[var(--color-primary)] mb-2" />
                ) : (
                  <File className="w-12 h-12 text-[var(--color-foreground-muted)] mb-2" />
                )}
                <div className="text-sm font-medium truncate w-full">{item.name}</div>
                {item.size && (
                  <div className="text-xs text-[var(--color-foreground-secondary)] mt-1">
                    {formatFileSize(item.size)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
        <div className="text-sm text-[var(--color-foreground-secondary)]">
          {path.length > 0 ? path.join(' / ') : 'Root'}
        </div>
        {onUpload && (
          <label className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] cursor-pointer hover:opacity-90 transition-opacity">
            <Upload className="w-4 h-4 inline mr-2" />
            Upload
            <input type="file" multiple onChange={handleFileInput} className="hidden" />
          </label>
        )}
      </div>
      
      {/* List */}
      <div className="divide-y divide-[var(--color-border)]">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-4 hover:bg-[var(--color-muted)] transition-colors"
          >
            <div onClick={() => onItemClick?.(item)} className="flex items-center gap-3 flex-1 cursor-pointer">
              {item.type === 'folder' ? (
                <Folder className="w-5 h-5 text-[var(--color-primary)]" />
              ) : (
                <File className="w-5 h-5 text-[var(--color-foreground-muted)]" />
              )}
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-[var(--color-foreground-secondary)]">
                  {item.size && formatFileSize(item.size)}
                  {item.modified && ` • ${item.modified.toLocaleDateString()}`}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {onDownload && item.type === 'file' && (
                <button
                  onClick={() => onDownload(item)}
                  className="p-2 rounded hover:bg-[var(--color-muted)] transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(item)}
                  className="p-2 rounded hover:bg-[var(--color-error)]/10 text-[var(--color-error)] transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

FileManager.displayName = 'FileManager';
