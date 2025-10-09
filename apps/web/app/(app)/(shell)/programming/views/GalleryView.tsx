'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Eye, ZoomIn, Download } from 'lucide-react';
import { Button, Card, CardContent, Checkbox, Badge, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Dialog, DialogContent, DialogHeader, DialogTitle } from '@ghxstship/ui';
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
  columns?: number;
}

const resolveTitle = (entity: ProgrammingEntity | null | undefined): string => {
  if (!entity) return 'Untitled';
  if ('title' in entity && entity.title) return entity.title;
  if ('name' in entity && typeof entity.name === 'string') return entity.name;
  return 'Untitled';
};

const resolveDescription = (entity: ProgrammingEntity | null | undefined): string | undefined => {
  if (!entity) return undefined;
  if ('description' in entity && entity.description) {
    return entity.description;
  }
  return undefined;
};

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

  useEffect(() => {
    if (!onSelectionChange) {
      setInternalSelectedIds(selectedIds);
    }
  }, [onSelectionChange, selectedIds]);

  const selectedIdsToUse = onSelectionChange ? selectedIds : internalSelectedIds;
  const setSelectedIds = onSelectionChange || setInternalSelectedIds;

  const gridClass = useMemo(() => {
    switch (columns) {
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 5:
        return 'grid-cols-5';
      case 6:
        return 'grid-cols-6';
      case 4:
      default:
        return 'grid-cols-4';
    }
  }, [columns]);

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      if (!selectedIdsToUse.includes(itemId)) {
        setSelectedIds([...selectedIdsToUse, itemId]);
      }
      return;
    }

    setSelectedIds(selectedIdsToUse.filter((id) => id !== itemId));
  };

  const openLightbox = (item: T) => {
    setLightboxItem(item);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxItem(null);
  };

  const renderDefaultImageItem = (item: T) => {
    const primaryImage = getImageUrl?.(item) ?? getThumbnailUrl?.(item) ?? null;
    const title = resolveTitle(item);

    return (
      <Card
        className={`group relative overflow-hidden transition-shadow hover:shadow-lg ${
          selectedIdsToUse.includes(item.id) ? 'ring-2 ring-primary' : ''
        }`}
      >
        <div className="aspect-square bg-muted relative overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={title}
              className="h-full w-full cursor-pointer object-cover transition-transform duration-200 group-hover:scale-105"
              onClick={() => openLightbox(item)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
              <div className="text-center text-muted-foreground">
                <div className="mb-2 text-4xl">📷</div>
                <div className="text-sm">No image</div>
              </div>
            </div>
          )}

          {(onView || onEdit || onDelete || primaryImage) && (
            <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/40">
              <div className="absolute top-xs right-2 flex gap-xs opacity-0 transition-opacity group-hover:opacity-100">
                {primaryImage && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openLightbox(item)}
                    className="h-icon-lg w-icon-lg p-0"
                  >
                    <ZoomIn className="h-icon-xs w-icon-xs" />
                  </Button>
                )}
                {(onView || onEdit || onDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="sm" className="h-icon-lg w-icon-lg p-0">
                        <MoreHorizontal className="h-icon-xs w-icon-xs" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(item)}>
                          <Eye className="mr-2 h-icon-xs w-icon-xs" />
                          View
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Edit className="mr-2 h-icon-xs w-icon-xs" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive">
                          <Trash2 className="mr-2 h-icon-xs w-icon-xs" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          )}

          {selectable && (
            <div className="absolute top-xs left-2">
              <Checkbox
                checked={selectedIdsToUse.includes(item.id)}
                onCheckedChange={(checked) => handleSelectItem(item.id, checked)}
                aria-label={`Select ${title}`}
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>
          )}
        </div>

        <CardContent className="p-sm">
          <div className="space-y-xxs">
            <h3 className="text-sm font-medium line-clamp-xs">{title}</h3>

            <div className="flex items-center gap-xs">
              {'status' in item && item.status && (
                <Badge variant="secondary" className="text-xs">
                  {item.status}
                </Badge>
              )}
              {'type' in item && item.type && (
                <Badge variant="outline" className="text-xs">
                  {item.type}
                </Badge>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              {'start_date' in item && 'end_date' in item && item.start_date && item.end_date && (
                <div>
                  {new Date(item.start_date).toLocaleDateString()} –{' '}
                  {new Date(item.end_date).toLocaleDateString()}
                </div>
              )}
              {'date' in item && item.date && (
                <div>{new Date(item.date).toLocaleDateString()}</div>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              {('location' in item && item.location) || ('venue' in item && item.venue) ? (
                <div>{('location' in item && item.location) || ('venue' in item && item.venue)}</div>
              ) : null}
              {'instructor' in item && item.instructor && <div>Instructor: {item.instructor}</div>}
              {'capacity' in item && typeof item.capacity === 'number' && <div>Capacity: {item.capacity}</div>}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className={`grid ${gridClass} gap-md ${className ?? ''}`}>
        {Array.from({ length: 12 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-square animate-pulse bg-muted" />
            <CardContent className="p-sm">
              <div className="space-y-xxs">
                <div className="h-icon-xs w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`py-xxl text-center ${className ?? ''}`}>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className={`grid ${gridClass} gap-md ${className ?? ''}`}>
        {data.map((item) => (
          <div key={item.id}>{renderImageItem ? renderImageItem(item) : renderDefaultImageItem(item)}</div>
        ))}
      </div>

      <Dialog open={lightboxOpen} onClose={closeLightbox}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-md pb-0">
            <DialogTitle>{resolveTitle(lightboxItem)}</DialogTitle>
          </DialogHeader>
          <div className="p-md pt-0">
            {lightboxItem && (
              <div className="space-y-md">
                {(getImageUrl?.(lightboxItem) || getThumbnailUrl?.(lightboxItem)) && (
                  <div className="relative">
                    <img
                      src={getImageUrl?.(lightboxItem) || getThumbnailUrl?.(lightboxItem) || ''}
                      alt={resolveTitle(lightboxItem)}
                      className="max-h-container-lg w-full rounded-lg object-contain"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <h3 className="mb-2 font-medium">Details</h3>
                    <dl className="space-y-xs text-sm">
                      <div className="flex justify-between gap-sm">
                        <dt className="text-muted-foreground">Title:</dt>
                      </div>
                      {resolveDescription(lightboxItem) && (
                        <div className="flex justify-between gap-sm">
                          <dt className="text-muted-foreground">Description:</dt>
                          <dd className="font-medium">{resolveDescription(lightboxItem)}</dd>
                        </div>
                      )}
                      {'status' in lightboxItem && lightboxItem.status && (
                        <div className="flex justify-between gap-sm">
                          <dt className="text-muted-foreground">Status:</dt>
                          <dd className="font-medium">{lightboxItem.status}</dd>
                        </div>
                      )}
                      {'type' in lightboxItem && lightboxItem.type && (
                        <div className="flex justify-between gap-sm">
                          <dt className="text-muted-foreground">Type:</dt>
                          <dd className="font-medium">{lightboxItem.type}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="flex flex-wrap items-center gap-xs">
                    {onView && (
                      <Button variant="outline" onClick={() => { onView(lightboxItem); closeLightbox(); }}>
                        <Eye className="mr-2 h-icon-xs w-icon-xs" />
                        View Details
                      </Button>
                    )}
                    {onEdit && (
                      <Button variant="outline" onClick={() => { onEdit(lightboxItem); closeLightbox(); }}>
                        <Edit className="mr-2 h-icon-xs w-icon-xs" />
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outline"
                        className="text-destructive"
                        onClick={() => {
                          onDelete(lightboxItem);
                          closeLightbox();
                        }}
                      >
                        <Trash2 className="mr-2 h-icon-xs w-icon-xs" />
                        Delete
                      </Button>
                    )}
                    {getImageUrl?.(lightboxItem) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const href = getImageUrl?.(lightboxItem);
                          if (!href) return;
                          const link = document.createElement('a');
                          link.href = href;
                          link.download = `${resolveTitle(lightboxItem)}.jpg`;
                          link.click();
                        }}
                      >
                        <Download className="mr-2 h-icon-xs w-icon-xs" />
                        Download
                      </Button>
                    )}
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
