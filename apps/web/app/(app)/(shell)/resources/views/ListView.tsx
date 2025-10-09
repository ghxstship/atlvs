'use client';

import React from 'react';
import {
  Badge,
  ListView
} from "@ghxstship/ui";
import { FileText, BookOpen, GraduationCap, File, Clipboard, Star } from 'lucide-react';
import type { Resource } from '../lib/resources-service';

interface ListViewProps {
  resources: Resource[];
  onSelect: (id: string) => void;
  loading?: boolean;
}

const resourceTypeIcons = {
  policy: FileText,
  guide: BookOpen,
  training: GraduationCap,
  template: File,
  procedure: Clipboard,
  featured: Star
};

export default function ListView({ resources, onSelect, loading = false }: ListViewProps) {
  if (loading) {
    return (
      <div className="space-y-sm">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-xl">
        <p className="text-muted-foreground">No resources found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-sm">
      {resources.map((resource) => {
        const IconComponent = resourceTypeIcons[resource.type];
        
        return (
          <div
            key={resource.id}
            onClick={() => onSelect(resource.id)}
            className="flex items-center gap-md p-md border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <IconComponent className="w-5 h-5 text-primary flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-sm mb-xs">
                <h3 className="font-medium text-foreground truncate">{resource.title}</h3>
                {resource.is_featured && (
                  <Star className="w-4 h-4 text-warning flex-shrink-0" />
                )}
              </div>
              {resource.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {resource.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-md flex-shrink-0">
              <Badge variant="secondary">{resource.type}</Badge>
              <Badge variant="secondary">{resource.status}</Badge>
              <div className="text-sm text-muted-foreground">
                {resource.view_count} views
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
