/**
 * Procurement Gallery View Component
 * Gallery/media view for procurement entities
 */

'use client';

import React from 'react';

export const GalleryView: React.FC = () => {
  return (
    <div className="p-xl text-center">
      <div className="text-muted-foreground">
        <div className="h-icon-2xl w-icon-2xl mx-auto mb-md bg-muted rounded-lg flex items-center justify-center">
          🖼️
        </div>
        <p className="mb-sm">Gallery View</p>
        <p className="text-sm">Media gallery for procurement items</p>
      </div>
    </div>
  );
};

export default GalleryView;
