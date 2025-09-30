/**
 * Procurement Gantt View Component
 * Gantt chart view for procurement entities
 */

'use client';

import React from 'react';

export const GanttView: React.FC = () => {
  return (
    <div className="p-xl text-center">
      <div className="text-muted-foreground">
        <div className="h-12 w-12 mx-auto mb-md bg-muted rounded-lg flex items-center justify-center">
          📋
        </div>
        <p className="mb-sm">Gantt View</p>
        <p className="text-sm">Project timeline and dependency visualization</p>
      </div>
    </div>
  );
};

export default GanttView;
