/**
 * Procurement Timeline View Component
 * Timeline view for procurement entities
 */

'use client';

import React from 'react';

export const TimelineView: React.FC = () => {
  return (
    <div className="p-xl text-center">
      <div className="text-muted-foreground">
        <div className="h-icon-2xl w-icon-2xl mx-auto mb-md bg-muted rounded-lg flex items-center justify-center">
          ⏱️
        </div>
        <p className="mb-sm">Timeline View</p>
        <p className="text-sm">Timeline visualization of procurement activities</p>
      </div>
    </div>
  );
};

export default TimelineView;
