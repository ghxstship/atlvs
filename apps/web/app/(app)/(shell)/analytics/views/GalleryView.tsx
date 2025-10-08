'use client';

import React from 'react';
import { Card } from '@ghxstship/ui';
import { Grid3X3, FileText, BarChart3 } from 'lucide-react';

interface GalleryViewProps {
  data?: unknown[];
  onItemClick?: (item: unknown) => void;
}

export default function GalleryView({ data = [], onItemClick }: GalleryViewProps) {
  const items = Array.isArray(data) ? data : [];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Grid3X3 className="h-5 w-5" />
          Gallery View
        </h3>
        <div className="text-sm text-muted-foreground">
          {items.length} items
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.length === 0 ? (
          <Card className="col-span-full p-12 text-center">
            <div className="text-muted-foreground space-y-2">
              <Grid3X3 className="h-12 w-12 mx-auto opacity-50" />
              <p>No items to display</p>
            </div>
          </Card>
        ) : (
          items.map((item: any, index) => (
            <Card
              key={item?.id || index}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onItemClick?.(item)}
            >
              <div className="aspect-video bg-muted flex items-center justify-center">
                {item?.type === 'report' ? (
                  <FileText className="h-12 w-12 text-muted-foreground" />
                ) : (
                  <BarChart3 className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <div className="p-4">
                <h4 className="font-medium truncate">
                  {item?.name || item?.title || 'Untitled'}
                </h4>
                {item?.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
