"use client";

import React, { useState, useMemo } from 'react';
import {
  Eye,
  Download,
  Share,
  Heart,
  MoreHorizontal,
  ZoomIn,
  Grid3X3,
  List,
  Search,
  Filter,
} from 'lucide-react';
import { Card, Button, Input, Badge, DropdownMenu, Checkbox } from '@ghxstship/ui';
import type { DigitalAsset } from '../types';

interface ImageViewProps {
  files: DigitalAsset[];
  selectedFiles: Set<string>;
  onSelectFile: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onView: (file: DigitalAsset) => void;
  onDownload: (file: DigitalAsset) => void;
  onShare: (file: DigitalAsset) => void;
  onBulkAction: (action: string, files: DigitalAsset[]) => void;
  formatFileSize: (bytes: number) => string;
  getCategoryIcon: (category: string) => React.ComponentType<any>;
}

export default function ImageView({
  files,
  selectedFiles,
  onSelectFile,
  onSelectAll,
  onView,
  onDownload,
  onShare,
  onBulkAction,
  formatFileSize,
  getCategoryIcon,
}: ImageViewProps) {
  const [layout, setLayout] = useState<'grid' | 'masonry'>('masonry');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxFile, setLightboxFile] = useState<DigitalAsset | null>(null);

  // Filter files based on search and category
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesSearch = !searchQuery ||
        file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [files, searchQuery, selectedCategory]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = [...new Set(files.map(f => f.category))];
    return cats.sort();
  }, [files]);

  // Group files by category for better organization
  const groupedFiles = useMemo(() => {
    const grouped: Record<string, DigitalAsset[]> = {};

    filteredFiles.forEach(file => {
      if (!grouped[file.category]) {
        grouped[file.category] = [];
      }
      grouped[file.category].push(file);
    });

    return grouped;
  }, [filteredFiles]);

  // Get file thumbnail URL (placeholder for now)
  const getThumbnailUrl = (file: DigitalAsset) => {
    // In a real implementation, this would generate or fetch thumbnail URLs
    // For now, return a placeholder based on file type
    if (file.category === 'image') {
      return `https://via.placeholder.com/300x200?text=${encodeURIComponent(file.title)}`;
    }
    return `https://via.placeholder.com/300x200/cccccc/666666?text=${encodeURIComponent(file.title)}`;
  };

  // Open lightbox
  const openLightbox = (file: DigitalAsset) => {
    setLightboxFile(file);
  };

  // Close lightbox
  const closeLightbox = () => {
    setLightboxFile(null);
  };

  // Bulk actions
  const selectedFileObjects = files.filter(file => selectedFiles.has(file.id));

  return (
    <div className="space-y-lg">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 text-gray-400 w-icon-xs h-icon-xs" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-container-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-xs">
            <Filter className="w-icon-xs h-icon-xs text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-sm py-xs border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-xs">
          {/* Layout Toggle */}
          <div className="flex items-center gap-xs border border-gray-300 rounded-md">
            <Button
              variant={layout === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayout('grid')}
            >
              <Grid3X3 className="w-icon-xs h-icon-xs" />
            </Button>
            <Button
              variant={layout === 'masonry' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayout('masonry')}
            >
              <List className="w-icon-xs h-icon-xs" />
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedFiles.size > 0 && (
            <div className="flex items-center gap-xs ml-4">
              <span className="text-sm text-gray-600">
                {selectedFiles.size} selected
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkAction('download', selectedFileObjects)}
              >
                Download
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkAction('share', selectedFileObjects)}
              >
                Share
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onBulkAction('delete', selectedFileObjects)}
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Selection Controls */}
      {filteredFiles.length > 0 && (
        <div className="flex items-center gap-xs p-xs border-b">
          <Checkbox
            checked={filteredFiles.length > 0 && filteredFiles.every(file => selectedFiles.has(file.id))}
            onCheckedChange={onSelectAll}
          />
          <span className="text-sm font-medium">
            Select All ({filteredFiles.length} files)
          </span>
        </div>
      )}

      {/* Image Content */}
      {Object.keys(groupedFiles).length === 0 ? (
        <div className="text-center py-xsxl">
          <Search className="w-icon-2xl h-icon-2xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-500">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Upload some files to get started'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-xl">
          {Object.entries(groupedFiles).map(([category, categoryFiles]) => (
            <div key={category}>
              {/* Category Header */}
              <div className="flex items-center gap-xs mb-4">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {category}
                </h3>
                <Badge variant="secondary">
                  {categoryFiles.length}
                </Badge>
              </div>

              {/* Files Grid */}
              <div
                className={
                  layout === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-md'
                    : 'columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-md space-y-md'
                }
              >
                {categoryFiles.map((file) => {
                  const CategoryIcon = getCategoryIcon(file.category);

                  return (
                    <Card
                      key={file.id}
                      className={`relative group overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                        selectedFiles.has(file.id) ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => onView(file)}
                    >
                      {/* Selection Checkbox */}
                      <div className="absolute top-xs left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Checkbox
                          checked={selectedFiles.has(file.id)}
                          onCheckedChange={() => onSelectFile(file.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      {/* Actions Menu */}
                      <div className="absolute top-xs right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenu.Trigger asChild>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                              className="h-icon-lg w-icon-lg p-0"
                            >
                              <MoreHorizontal className="w-icon-xs h-icon-xs" />
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content align="end">
                            <DropdownMenu.Item onClick={() => onView(file)}>
                              <Eye className="w-icon-xs h-icon-xs mr-2" />
                              View
                            </DropdownMenu.Item>
                            <DropdownMenu.Item onClick={() => openLightbox(file)}>
                              <ZoomIn className="w-icon-xs h-icon-xs mr-2" />
                              Preview
                            </DropdownMenu.Item>
                            <DropdownMenu.Item onClick={() => onDownload(file)}>
                              <Download className="w-icon-xs h-icon-xs mr-2" />
                              Download
                            </DropdownMenu.Item>
                            <DropdownMenu.Item onClick={() => onShare(file)}>
                              <Share className="w-icon-xs h-icon-xs mr-2" />
                              Share
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu>
                      </div>

                      {/* File Preview */}
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        {file.category === 'image' ? (
                          <img
                            src={getThumbnailUrl(file)}
                            alt={file.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <CategoryIcon className="w-icon-2xl h-icon-2xl text-gray-400" />
                          </div>
                        )}

                        {/* File Size Overlay */}
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-xs py-xs rounded">
                          {formatFileSize(file.file_size || 0)}
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="p-sm">
                        <h4 className="font-medium text-sm text-gray-900 truncate mb-1">
                          {file.title}
                        </h4>

                        {file.description && (
                          <p className="text-xs text-gray-600 truncate mb-2">
                            {file.description}
                          </p>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{file.access_level}</span>
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
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-md">
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={closeLightbox}
              className="absolute top-md right-4 z-10"
            >
              ✕
            </Button>

            {/* File Content */}
            <div className="bg-white rounded-lg overflow-hidden">
              {lightboxFile.category === 'image' ? (
                <img
                  src={getThumbnailUrl(lightboxFile)}
                  alt={lightboxFile.title}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              ) : (
                <div className="p-xl text-center">
                  <div className="w-component-lg h-component-lg mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                    {React.createElement(getCategoryIcon(lightboxFile.category), {
                      className: 'w-icon-2xl h-icon-2xl text-gray-400'
                    })}
                  </div>
                  <p className="text-gray-500">Preview not available for this file type</p>
                </div>
              )}

              {/* File Details */}
              <div className="p-md border-t">
                <h3 className="font-medium text-lg mb-2">{lightboxFile.title}</h3>
                {lightboxFile.description && (
                  <p className="text-gray-600 mb-3">{lightboxFile.description}</p>
                )}

                <div className="flex items-center gap-md text-sm text-gray-500 mb-4">
                  <span>Size: {formatFileSize(lightboxFile.file_size || 0)}</span>
                  <span>Modified: {new Date(lightboxFile.updated_at).toLocaleDateString()}</span>
                  <Badge variant="outline">{lightboxFile.category}</Badge>
                </div>

                {/* Actions */}
                <div className="flex gap-xs">
                  <Button onClick={() => onDownload(lightboxFile!)}>
                    <Download className="w-icon-xs h-icon-xs mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={() => onShare(lightboxFile!)}>
                    <Share className="w-icon-xs h-icon-xs mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
