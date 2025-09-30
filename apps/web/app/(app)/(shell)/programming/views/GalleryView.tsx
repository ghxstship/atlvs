'use client';

import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Eye, ZoomIn, Download } from 'lucide-react';
import { Button } from '@ghxstship/ui';
import { Card, CardContent } from '@ghxstship/ui';
import { Checkbox } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ghxstship/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@ghxstship/ui';
import type { ProgrammingEntity } from '../types';

interface ImageViewProps<T extends ProgrammingEntity> {
  data: T[];
  loading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  getImageUrl?: (item: T) => string | null;
  getThumbnailUrl?: (item: T) => string | null;
  renderImageItem?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
  columns?: number; // 2-6 columns
}

export function ImageView<T extends ProgrammingEntity>({
  data,
  loading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onEdit,
  onDelete,
  onView,
  getImageUrl,
  getThumbnailUrl,
  renderImageItem,
  emptyMessage = 'No items to display',
  className,
  columns = 4,
}: ImageViewProps<T>) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>(selectedIds);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<T | null>(null);

  const selectedIdsToUse = onSelectionChange ? selectedIds : internalSelectedIds;
  const setSelectedIds = onSelectionChange || setInternalSelectedIds;

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIdsToUse, itemId]);
    } else {
      setSelectedIds(selectedIdsToUse.filter(id => id !== itemId));
    }
  };

  const openLightbox = (item: T) => {
    setLightboxItem(item);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxItem(null);
  };

  const getGridClass = () => {
    switch (columns) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      case 6: return 'grid-cols-6';
      default: return 'grid-cols-4';
    }
  };

  // Default gallery item renderer
  const defaultRenderImageItem = (item: T) => {
    const imageUrl = getImageUrl?.(item) || getThumbnailUrl?.(item);
    const isEvent = 'start_date' in item && 'end_date' in item;
    const isPerformance = 'date' in item && 'venue' in item;
    const isWorkshop = 'instructor' in item;

    return (
      <Card className={`group relative overflow-hidden hover:shadow-lg transition-shadow ${
        selectedIdsToUse.includes(item.id) ? 'ring-2 ring-blue-500' : ''
      }`}>
        {/* Image/Thumbnail */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title || 'Item'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 cursor-pointer"
              onClick={() => openLightbox(item)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-2">📷</div>
                <div className="text-sm">No image</div>
              </div>
            </div>
          )}

          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                {imageUrl && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openLightbox(item)}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(item)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(item)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Selection checkbox */}
          {selectable && (
            <div className="absolute top-2 left-2">
              <Checkbox
                checked={selectedIdsToUse.includes(item.id)}
                onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-3">
          <div className="space-y-2">
            <h3 className="font-medium text-sm line-clamp-2">
              {item.title || 'Untitled'}
            </h3>

            {/* Status and type badges */}
            <div className="flex items-center gap-1">
              {'status' in item && (
                <Badge variant="secondary" className="text-xs">
                  {item.status}
                </Badge>
              )}
              {'type' in item && (
                <Badge variant="outline" className="text-xs">
                  {item.type}
                </Badge>
              )}
            </div>

            {/* Date information */}
            <div className="text-xs text-gray-500">
              {isEvent && (
                <div>
                  {new Date((item as any).start_date).toLocaleDateString()} - {' '}
                  {new Date((item as any).end_date).toLocaleDateString()}
                </div>
              )}
              {isPerformance && (
                <div>
                  {new Date((item as any).date).toLocaleDateString()}
                </div>
              )}
              {isWorkshop && (
                <div>
                  {new Date((item as any).start_date).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Additional metadata */}
            <div className="text-xs text-gray-500">
              {('location' in item || 'venue' in item) && (
                <div>{(item as any).location || (item as any).venue}</div>
              )}
              {('instructor' in item) && (
                <div>Instructor: {(item as any).instructor}</div>
              )}
              {('capacity' in item) && (
                <div>Capacity: {(item as any).capacity}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className={`grid ${getGridClass()} gap-4 ${className}`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 bg-gray-200 animate-pulse rounded w-2/3" />
                <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className={`grid ${getGridClass()} gap-4 ${className}`}>
        {data.map((item) => (
          <div key={item.id}>
            {renderImageItem ? renderImageItem(item) : defaultRenderImageItem(item)}
          </div>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{lightboxItem?.title || 'Item Details'}</DialogTitle>
          </DialogHeader>
          <div className="p-4 pt-0">
            {lightboxItem && (
              <div className="space-y-4">
                {/* Large image */}
                {(getImageUrl?.(lightboxItem) || getThumbnailUrl?.(lightboxItem)) && (
                  <div className="relative">
                    <img
                      src={getImageUrl?.(lightboxItem) || getThumbnailUrl?.(lightboxItem) || ''}
                      alt={lightboxItem.title || 'Item'}
                      className="w-full max-h-96 object-contain rounded-lg"
                    />
                  </div>
                )}

                {/* Item details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Details</h3>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Title:</dt>
                        <dd className="font-medium">{lightboxItem.title || 'Untitled'}</dd>
                      </div>
                      {lightboxItem.description && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Description:</dt>
                          <dd className="font-medium">{lightboxItem.description}</dd>
                        </div>
                      )}
                      {'status' in lightboxItem && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Status:</dt>
                          <dd className="font-medium">{lightboxItem.status}</dd>
                        </div>
                      )}
                      {'type' in lightboxItem && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Type:</dt>
                          <dd className="font-medium">{lightboxItem.type}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Actions</h3>
                    <div className="flex gap-2">
                      {onView && (
                        <Button variant="outline" onClick={() => { onView(lightboxItem); closeLightbox(); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      )}
                      {onEdit && (
                        <Button variant="outline" onClick={() => { onEdit(lightboxItem); closeLightbox(); }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button variant="outline" onClick={() => { onDelete(lightboxItem); closeLightbox(); }} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ImageView;
