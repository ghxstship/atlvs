"use client";

import Image from 'next/image';
import React, { useState } from 'react';
import { Image as ImageIcon, Video, File, Eye, Download, MoreHorizontal } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@ghxstship/ui";
import { Badge } from '@ghxstship/ui';
import { Card, CardContent } from '@ghxstship/ui';
import { Dropdown,  DropdownItem, DropdownMenuTrigger } from '@ghxstship/ui';

export interface ImageViewProps {
  data: unknown[];
  onItemClick?: (item: unknown) => void;
  onDownload?: (item: unknown) => void;
  onView?: (item: unknown) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  layout?: 'grid' | 'masonry';
  imageField?: string;
  titleField?: string;
  subtitleField?: string;
}

export default function ImageView({
  data,
  onItemClick,
  onDownload,
  onView,
  loading = false,
  emptyMessage = "No media available",
  className = "",
  layout = 'grid',
  imageField = 'file_url',
  titleField = 'name',
  subtitleField = 'description'
}: ImageViewProps) {
  const [selectedItem, setSelectedItem] = useState<(null);

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) return <ImageIcon className="h-icon-lg w-icon-lg" />;
    if (fileType?.startsWith('video/')) return <Video className="h-icon-lg w-icon-lg" />;
    return <File className="h-icon-lg w-icon-lg" />;
  };

  const getFileTypeColor = (fileType: string) => {
    if (fileType?.startsWith('image/')) return 'text-green-500';
    if (fileType?.startsWith('video/')) return 'text-blue-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className={`${layout === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md' : 'columns-2 md:columns-3 lg:columns-4 gap-md'} ${className}`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse break-inside-avoid mb-4">
            <div className="bg-muted rounded-lg aspect-square mb-2"></div>
            <div className="h-3 bg-muted rounded w-3/4 mb-1"></div>
            <div className="h-2 bg-muted rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center p-xl ${className}`}>
        <div className="text-center text-muted-foreground">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${layout === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md' : 'columns-2 md:columns-3 lg:columns-4 gap-md'} ${className}`}>
        {data.map((item) => (
          <Card
            key={item.id}
            className="break-inside-avoid cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => onItemClick?.(item)}
          >
            <CardContent className="p-sm">
              {/* Media Preview */}
              <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {item[imageField] ? (
                  item.file_type?.startsWith('image/') ? (
                    <Image src={item[imageField]} alt={item[titleField]} width={48} height={48} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className={`${getFileTypeColor(item.file_type)}`}>
                      {getFileIcon(item.file_type)}
                    </div>
                  )
                ) : (
                  <div className="text-muted-foreground">
                    <File className="h-icon-lg w-icon-lg" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-xs">
                <h3 className="font-medium text-sm line-clamp-xs">
                  {item[titleField] || item.name || 'Untitled'}
                </h3>

                {item[subtitleField] && (
                  <p className="text-xs text-muted-foreground line-clamp-xs">
                    {item[subtitleField]}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-xs">
                    <Badge variant="outline" className="text-xs">
                      {item.category || 'File'}
                    </Badge>
                    {item.file_size && (
                      <span className="text-xs text-muted-foreground">
                        {(item.file_size / 1024 / 1024).toFixed(1)}MB
                      </span>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                        className="h-icon-md w-icon-md p-0 opacity-60 hover:opacity-100"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(item)}>
                          <Eye className="mr-2 h-3 w-3" />
                          View
                        </DropdownMenuItem>
                      )}
                      {onDownload && (
                        <DropdownMenuItem onClick={() => onDownload(item)}>
                          <Download className="mr-2 h-3 w-3" />
                          Download
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lightbox for full-size viewing */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="max-w-4xl max-h-[90vh] p-md">
            {selectedItem[imageField] && selectedItem.file_type?.startsWith('image/') && (
              <Image src={selectedItem[imageField]} alt={selectedItem[titleField]} width={48} height={48} className="max-w-full max-h-full object-contain" />
            )}
            <Button
              variant="secondary"
              onClick={() => setSelectedItem(null)}
              className="mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
