'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useDataView } from './DataViewProvider';
import { Button } from '../Button';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { 
  Grid3x3, 
  List, 
  MoreHorizontal, 
  Eye, 
  Download,
  Share,
  Heart,
  Play,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { GalleryItem, DataRecord } from './types';

interface GalleryViewProps {
  className?: string;
  titleField: string;
  thumbnailField?: string;
  imageField?: string;
  videoField?: string;
  descriptionField?: string;
  metadataField?: string;
  tagsField?: string;
  layout?: 'grid' | 'masonry' | 'list';
  columns?: 2 | 3 | 4 | 5 | 6;
  onItemClick?: (item: DataRecord) => void;
  onItemPreview?: (item: DataRecord) => void;
  onItemDownload?: (item: DataRecord) => void;
  onItemShare?: (item: DataRecord) => void;
}

export function GalleryView({
  className = '',
  titleField,
  thumbnailField,
  imageField,
  videoField,
  descriptionField,
  metadataField,
  tagsField,
  layout = 'grid',
  columns = 4,
  onItemClick,
  onItemPreview,
  onItemDownload,
  onItemShare
}: GalleryViewProps) {
  const { state, config, actions } = useDataView();
  const [viewLayout, setViewLayout] = useState<'grid' | 'masonry' | 'list'>(layout);
  const [gridColumns, setGridColumns] = useState(columns);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Convert data records to gallery items
  const galleryItems = useMemo(() => {
    return (config.data || []).map(record => ({
      id: record.id,
      title: record[titleField] || 'Untitled',
      description: descriptionField ? record[descriptionField] : undefined,
      thumbnail: thumbnailField ? record[thumbnailField] : undefined,
      image: imageField ? record[imageField] : undefined,
      video: videoField ? record[videoField] : undefined,
      metadata: metadataField ? record[metadataField] : undefined,
      tags: tagsField ? record[tagsField] : undefined,
      record
    }));
  }, [config.data, titleField, thumbnailField, imageField, videoField, descriptionField, metadataField, tagsField]);

  // Apply search and filters
  const filteredItems = useMemo(() => {
    let filtered = [...galleryItems];

    // Apply search
    if (state.search) {
      const searchLower = state.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower)) ||
        (item.tags && Array.isArray(item.tags) && 
         item.tags.some(tag => String(tag).toLowerCase().includes(searchLower)))
      );
    }

    // Apply filters
    state.filters.forEach(filter => {
      filtered = filtered.filter(item => {
        const value = item.record[filter.field];
        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value);
          default:
            return true;
        }
      });
    });

    return filtered;
  }, [galleryItems, state.search, state.filters]);

  // Pagination
  const paginatedItems = useMemo(() => {
    const start = (state.pagination.page - 1) * state.pagination.pageSize;
    const end = start + state.pagination.pageSize;
    return filteredItems.slice(start, end);
  }, [filteredItems, state.pagination]);

  const handleItemSelect = useCallback((itemId: string, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allSelected = selectedItems.size === paginatedItems.length;
    if (allSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(paginatedItems.map(item => item.id)));
    }
  }, [selectedItems.size, paginatedItems]);

  const getMediaType = useCallback((item: GalleryItem) => {
    if (item.video) return 'video';
    if (item.image || item.thumbnail) return 'image';
    return 'document';
  }, []);

  const renderMediaPreview = useCallback((item: GalleryItem) => {
    const mediaType = getMediaType(item);
    const src = item.thumbnail || item.image;

    if (mediaType === 'video') {
      return (
        <div className="relative group">
          <img
            src={src || '/placeholder-video.jpg'}
            alt={item.title}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="h-12 w-12 text-background" />
          </div>
        </div>
      );
    } else if (mediaType === 'image') {
      return (
        <img
          src={src || '/placeholder-image.jpg'}
          alt={item.title}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      );
    } else {
      return (
        <div className="w-full h-48 bg-muted flex items-center justify-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
      );
    }
  }, [getMediaType]);

  const gridClasses = useMemo(() => {
    const baseClasses = 'gap-md';
    
    switch (viewLayout) {
      case 'grid':
        return `grid ${baseClasses} grid-cols-1 sm:grid-cols-2 md:grid-cols-${Math.min(gridColumns, 3)} lg:grid-cols-${gridColumns}`;
      case 'masonry':
        return `columns-1 sm:columns-2 md:columns-${Math.min(gridColumns, 3)} lg:columns-${gridColumns} ${baseClasses}`;
      case 'list':
        return `gap-md`;
      default:
        return baseClasses;
    }
  }, [viewLayout, gridColumns]);

  const galleryClasses = `
    bg-background border border-border rounded-lg overflow-hidden
    ${className}
  `.trim();

  return (
    <div className={galleryClasses}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-md border-b border-border">
        <div className="flex items-center gap-sm">
          <span className="text-sm text-muted-foreground">
            {selectedItems.size > 0 ? `${selectedItems.size} selected` : `${filteredItems.length} items`}
          </span>
          
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-sm ml-md">
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button variant="ghost" size="sm">
                <Share className="h-4 w-4" />
                Share
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-sm">
          {/* Layout Switcher */}
          <div className="flex items-center bg-muted rounded-lg p-xs">
            <Button
              variant={viewLayout === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewLayout('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewLayout === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewLayout('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Column Count */}
          {viewLayout !== 'list' && (
            <select
              value={gridColumns}
              onChange={(e) => setGridColumns(Number(e.target.value) as any)}
              className="px-sm py-xs text-sm border border-border rounded bg-background"
            >
              <option value={2}>2 columns</option>
              <option value={3}>3 columns</option>
              <option value={4}>4 columns</option>
              <option value={5}>5 columns</option>
              <option value={6}>6 columns</option>
            </select>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedItems.size === paginatedItems.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="p-md">
        {paginatedItems.length === 0 ? (
          <div className="text-center py-2xl text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-md opacity-50" />
            <div className="text-lg font-medium mb-sm">No items found</div>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={gridClasses}>
            {paginatedItems.map((item) => {
              const isSelected = selectedItems.has(item.id);
              const mediaType = getMediaType(item);

              if (viewLayout === 'list') {
                return (
                  <Card
                    key={item.id}
                    className={`
                      cursor-pointer transition-all duration-200 hover:shadow-md
                      ${isSelected ? 'ring-2 ring-primary' : ''}
                    `}
                  >
                    <div className="flex gap-md p-md">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                        {renderMediaPreview(item)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground truncate">
                              {item.title}
                            </h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-xs line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-sm ml-md">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onItemPreview?.(item.record)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleItemSelect(item.id, !isSelected)}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="rounded"
                              />
                            </Button>
                          </div>
                        </div>

                        {/* Tags */}
                        {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-xs mt-sm">
                            {item.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" size="sm">
                                {String(tag)}
                              </Badge>
                            ))}
                            {item.tags.length > 3 && (
                              <Badge variant="outline" size="sm">
                                +{item.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              }

              return (
                <Card
                  key={item.id}
                  className={`
                    cursor-pointer transition-all duration-200 hover:shadow-elevated group
                    ${isSelected ? 'ring-2 ring-primary' : ''}
                    ${viewLayout === 'masonry' ? 'break-inside-avoid mb-md' : ''}
                  `}
                  onClick={() => onItemClick?.(item.record)}
                >
                  {/* Media */}
                  <div className="relative overflow-hidden rounded-t-lg">
                    {renderMediaPreview(item)}
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute top-2 right-2 flex gap-xs">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-background/20 backdrop-blur-sm text-background hover:bg-background/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            onItemPreview?.(item.record);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-background/20 backdrop-blur-sm text-background hover:bg-background/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            onItemDownload?.(item.record);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleItemSelect(item.id, e.target.checked);
                          }}
                          className="rounded"
                        />
                      </div>

                      {mediaType === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="h-12 w-12 text-background" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-sm">
                    <h3 className="font-semibold text-foreground truncate mb-xs">
                      {item.title}
                    </h3>
                    
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-sm">
                        {item.description}
                      </p>
                    )}

                    {/* Tags */}
                    {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-xs">
                        {item.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" size="sm">
                            {String(tag)}
                          </Badge>
                        ))}
                        {item.tags.length > 2 && (
                          <Badge variant="outline" size="sm">
                            +{item.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredItems.length > state.pagination.pageSize && (
        <div className="flex items-center justify-between px-md py-sm border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {((state.pagination.page - 1) * state.pagination.pageSize) + 1} to{' '}
            {Math.min(state.pagination.page * state.pagination.pageSize, filteredItems.length)} of{' '}
            {filteredItems.length} items
          </div>
          
          <div className="flex items-center gap-sm">
            <Button
              variant="ghost"
              size="sm"
              disabled={state.pagination.page === 1}
              onClick={() => actions.setPagination({ 
                ...state.pagination, 
                page: state.pagination.page - 1 
              })}
            >
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Page {state.pagination.page} of {Math.ceil(filteredItems.length / state.pagination.pageSize)}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              disabled={state.pagination.page >= Math.ceil(filteredItems.length / state.pagination.pageSize)}
              onClick={() => actions.setPagination({ 
                ...state.pagination, 
                page: state.pagination.page + 1 
              })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
