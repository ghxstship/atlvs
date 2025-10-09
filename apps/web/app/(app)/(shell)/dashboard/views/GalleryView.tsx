'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Image from "next/image";
import {
  Search,
  Filter,
  MoreHorizontal,
  Grid,
  List,
  Maximize2,
  Download,
  Heart,
  Share,
  Eye,
  CheckSquare,
  Square,
  Image as ImageIcon,
  Video,
  FileText,
  Music
} from 'lucide-react';
import {
  Badge,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input
} from "@ghxstship/ui";
import { Input ,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import { Checkbox ,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import { Badge ,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import {
  Dropdown,
  
  DropdownItem,
  
  DropdownMenuSeparator
} from '@ghxstship/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ghxstship/ui';
import { cn } from '@ghxstship/ui/lib/utils';

// Image Item Types
export type ImageItemType = 'image' | 'video' | 'document' | 'audio' | 'other';

export interface ImageFieldMapping {
  id: string;
  title: string;
  image: string;
  thumbnail?: string;
  type?: string;
  size?: string;
  description?: string;
  tags?: string;
  metadata?: Record<string, string>;
}

// Image View Props
export interface ImageViewProps {
  data: Record<string, unknown>[];
  fieldMapping: ImageFieldMapping;
  layout?: 'grid' | 'masonry';
  itemSize?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  emptyMessage?: string;
  className?: string;

  // Search & Filter
  globalSearch?: string;
  onGlobalSearch?: (query: string) => void;
  typeFilter?: ImageItemType[];
  onTypeFilter?: (types: ImageItemType[]) => void;

  // Selection
  selectable?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;

  // Item Actions
  onItemClick?: (item: Record<string, unknown>) => void;
  onItemDownload?: (item: Record<string, unknown>) => void;
  onItemShare?: (item: Record<string, unknown>) => void;
  onItemFavorite?: (item: Record<string, unknown>) => void;

  // Bulk Actions
  bulkActions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (selectedItems: Record<string, unknown>[]) => void;
    disabled?: boolean;
  }[];

  // Pagination
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };

  // Advanced Features
  lightbox?: boolean;
  lazyLoading?: boolean;
  showTitles?: boolean;
  showMetadata?: boolean;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'auto';
}

// Image View Component
export const ImageView: React.FC<ImageViewProps> = ({
  data,
  fieldMapping,
  layout = 'grid',
  itemSize = 'md',
  loading = false,
  emptyMessage = 'No items found',
  className,

  // Search & Filter
  globalSearch = '',
  onGlobalSearch,
  typeFilter = [],
  onTypeFilter,

  // Selection
  selectable = false,
  selectedItems = [],
  onSelectionChange,

  // Item Actions
  onItemClick,
  onItemDownload,
  onItemShare,
  onItemFavorite,

  // Bulk Actions
  bulkActions = [],

  // Pagination
  pagination,

  // Advanced Features
  lightbox = true,
  lazyLoading = true,
  showTitles = true,
  showMetadata = false,
  aspectRatio = 'auto'
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<Record<string, unknown> | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>(new Set());

  // Filtered data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filteredData = useMemo(() => {
    return data.filter(row => {
      // Apply search filter
      if (globalSearch) {
        const searchTerm = globalSearch.toLowerCase();
        const searchableText = [
          String(row[fieldMapping.title] || ''),
          String(row[fieldMapping.description] || ''),
          String(row[fieldMapping.tags] || '')
        ].join(' ').toLowerCase();

        if (!searchableText.includes(searchTerm)) return false;
      }

      // Apply type filter
      if (typeFilter.length > 0) {
        const itemType = getItemType(row, fieldMapping);
        if (!typeFilter.includes(itemType)) return false;
      }

      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, globalSearch, typeFilter, fieldMapping]);

  // Get item type
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getItemType = useCallback((row: Record<string, unknown>, mapping: ImageFieldMapping): ImageItemType => {
    const typeField = row[mapping.type || 'type'] as string;
    if (typeField) {
      const normalizedType = typeField.toLowerCase();
      if (['image', 'video', 'document', 'audio'].includes(normalizedType)) {
        return normalizedType as ImageItemType;
      }
    }

    // Infer from file extension or content
    const imageUrl = String(row[mapping.image] || '');
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(imageUrl)) return 'image';
    if (/\.(mp4|avi|mov|wmv|flv|webm)$/i.test(imageUrl)) return 'video';
    if (/\.(pdf|doc|docx|txt|rtf)$/i.test(imageUrl)) return 'document';
    if (/\.(mp3|wav|ogg|flac)$/i.test(imageUrl)) return 'audio';

    return 'other';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get item icon
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getItemIcon = useCallback((type: ImageItemType) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'document': return FileText;
      case 'audio': return Music;
      default: return FileText;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle selection
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSelectItem = useCallback((itemId: string) => {
    if (!onSelectionChange) return;

    const newSelection = selectedItems.includes(itemId)
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId];

    onSelectionChange(newSelection);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems, onSelectionChange]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;

    const allSelected = filteredData.every(row =>
      selectedItems.includes(String(row[fieldMapping.id] || ''))
    );

    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredData.map(row => String(row[fieldMapping.id] || '')));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData, selectedItems, fieldMapping.id, onSelectionChange]);

  // Handle item click
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleItemClick = useCallback((item: Record<string, unknown>) => {
    if (lightbox && getItemType(item, fieldMapping) === 'image') {
      setLightboxItem(item);
      setLightboxOpen(true);
    } else {
      onItemClick?.(item);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, onItemClick, getItemType, fieldMapping]);

  // Handle image load
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleImageLoad = useCallback((itemId: string) => {
    setLoadedImages(prev => new Set(prev).add(itemId));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Item size classes
  const sizeClasses = {
    sm: 'w-component-lg h-component-lg',
    md: 'w-component-xl h-component-xl',
    lg: 'w-container-xs h-container-xs',
    xl: 'w-container-sm h-container-sm'
  };

  // Aspect ratio classes
  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    auto: 'aspect-auto'
  };

  // Render gallery item
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderImageItem = useCallback((row: Record<string, unknown>, index: number) => {
    const itemId = String(row[fieldMapping.id] || index);
    const isSelected = selectedItems.includes(itemId);
    const itemType = getItemType(row, fieldMapping);
    const Icon = getItemIcon(itemType);
    const imageUrl = String(row[fieldMapping.image] || '');
    const thumbnailUrl = String(row[fieldMapping.thumbnail] || imageUrl);
    const title = String(row[fieldMapping.title] || '');
    const isImageLoaded = loadedImages.has(itemId);

    return (
      <div
        key={itemId}
        className={cn(
          'relative group cursor-pointer transition-all duration-200',
          'hover:scale-105 hover:shadow-lg',
          isSelected && 'ring-2 ring-primary',
          layout === 'masonry' ? 'break-inside-avoid mb-4' : ''
        )}
        onClick={() => handleItemClick(row)}
      >
        {/* Selection Checkbox */}
        {selectable && (
          <div className="absolute top-xs left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleSelectItem(itemId)}
              className="bg-background border-2"
            />
          </div>
        )}

        {/* Item Type Badge */}
        <div className="absolute top-xs right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <Badge variant="secondary" className="text-xs">
            <Icon className="h-3 w-3 mr-1" />
            {itemType}
          </Badge>
        </div>

        {/* Image Container */}
        <div className={cn(
          'relative overflow-hidden rounded-lg border bg-muted',
          sizeClasses[itemSize],
          aspectClasses[aspectRatio]
        )}>
          {itemType === 'image' ? (
            <>
              {!isImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-icon-lg h-icon-lg border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img                 src={thumbnailUrl}
                alt={title}
                className={cn(
                  'w-full h-full object-cover transition-opacity duration-300',
                  isImageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => handleImageLoad(itemId)}
                loading={lazyLoading ? 'lazy' : 'eager'}
              />
            </>
          ) : (
            // Non-image item placeholder
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Icon className="h-icon-lg w-icon-lg text-muted-foreground" />
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
        </div>

        {/* Item Info */}
        {showTitles && (
          <div className="mt-2 px-xs">
            <h3 className="text-sm font-medium truncate" title={title}>
              {title}
            </h3>
            {showMetadata && fieldMapping.size && row[fieldMapping.size] && (
              <p className="text-xs text-muted-foreground">
                {String(row[fieldMapping.size])}
              </p>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute bottom-2 left-2 right-2 flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
          {onItemDownload && (
            <Button
              size="sm"
              variant="secondary"
              className="h-icon-md w-icon-md p-0 flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onItemDownload(row);
              }}
            >
              <Download className="h-3 w-3" />
            </Button>
          )}
          {onItemShare && (
            <Button
              size="sm"
              variant="secondary"
              className="h-icon-md w-icon-md p-0 flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onItemShare(row);
              }}
            >
              <Share className="h-3 w-3" />
            </Button>
          )}
          {onItemFavorite && (
            <Button
              size="sm"
              variant="secondary"
              className="h-icon-md w-icon-md p-0 flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onItemFavorite(row);
              }}
            >
              <Heart className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fieldMapping,
    selectedItems,
    layout,
    itemSize,
    aspectRatio,
    selectable,
    showTitles,
    showMetadata,
    loadedImages,
    getItemType,
    getItemIcon,
    handleItemClick,
    handleSelectItem,
    handleImageLoad,
    lazyLoading,
    onItemDownload,
    onItemShare,
    onItemFavorite
  ]);

  const allSelected = filteredData.length > 0 && filteredData.every(row =>
    selectedItems.includes(String(row[fieldMapping.id] || ''))
  );

  return (
    <div className="space-y-md">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-xs">
          {/* Search */}
          {onGlobalSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground" />
              <Input
                placeholder="Search gallery..."
                value={globalSearch}
                onChange={(e) => onGlobalSearch(e.target.value)}
                className="pl-9 w-container-sm"
              />
            </div>
          )}

          {/* Select All */}
          {selectable && filteredData.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-xs"
            >
              {allSelected ? <CheckSquare className="h-icon-xs w-icon-xs" /> : <Square className="h-icon-xs w-icon-xs" />}
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
          )}

          {/* Bulk Actions */}
          {bulkActions.length > 0 && selectedItems.length > 0 && (
            <div className="flex items-center gap-xs">
              {bulkActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={() => {
                      const selectedData = filteredData.filter(row =>
                        selectedItems.includes(String(row[fieldMapping.id] || ''))
                      );
                      action.onClick(selectedData);
                    }}
                    disabled={action.disabled}
                  >
                    {Icon && <Icon className="h-icon-xs w-icon-xs mr-1" />}
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-xs">
          {/* Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-icon-xs w-icon-xs mr-1" />
                Types
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {(['image', 'video', 'document', 'audio', 'other'] as ImageItemType[]).map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => {
                    const newFilter = typeFilter.includes(type)
                      ? typeFilter.filter(t => t !== type)
                      : [...typeFilter, type];
                    onTypeFilter?.(newFilter);
                  }}
                >
                  <Checkbox
                    checked={typeFilter.includes(type)}
                    className="mr-2"
                    readOnly
                  />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="text-sm text-muted-foreground">
            {selectedItems.length > 0 && `${selectedItems.length} selected`}
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <div className={cn(
        layout === 'grid'
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-md'
          : 'columns-2 md:columns-3 lg:columns-4 xl:columns-6 gap-md',
        className
      )}>
        {loading ? (
          // Loading state
          Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className={cn(
              'relative overflow-hidden rounded-lg border bg-muted animate-pulse',
              sizeClasses[itemSize],
              aspectClasses[aspectRatio]
            )} />
          ))
        ) : filteredData.length === 0 ? (
          // Empty state
          <div className="col-span-full flex items-center justify-center py-xsxl">
            <div className="text-center">
              <div className="text-muted-foreground mb-2">{emptyMessage}</div>
              <Button variant="outline" size="sm">
                Reset Filters
              </Button>
            </div>
          </div>
        ) : (
          // Image items
          filteredData.map((row, index) => renderImageItem(row, index))
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>

          <div className="flex items-center gap-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>

            <span className="text-sm">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === Math.ceil(pagination.total / pagination.pageSize)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightbox && (
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                {lightboxItem ? String(lightboxItem[fieldMapping.title] || '') : ''}
              </DialogTitle>
            </DialogHeader>

            {lightboxItem && (
              <div className="flex flex-col items-center space-y-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img                   src={String(lightboxItem[fieldMapping.image] || '')}
                  alt={String(lightboxItem[fieldMapping.title] || '')}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg"
                />

                {lightboxItem[fieldMapping.description] && (
                  <p className="text-sm text-muted-foreground text-center max-w-2xl">
                    {String(lightboxItem[fieldMapping.description])}
                  </p>
                )}

                <div className="flex gap-xs">
                  {onItemDownload && (
                    <Button onClick={() => onItemDownload(lightboxItem)}>
                      <Download className="h-icon-xs w-icon-xs mr-1" />
                      Download
                    </Button>
                  )}
                  {onItemShare && (
                    <Button variant="outline" onClick={() => onItemShare(lightboxItem)}>
                      <Share className="h-icon-xs w-icon-xs mr-1" />
                      Share
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export type { ImageViewProps, ImageItemType, ImageFieldMapping };
