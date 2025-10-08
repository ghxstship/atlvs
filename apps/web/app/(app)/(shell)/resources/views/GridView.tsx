'use client';

import React from 'react';
import { Badge, Card } from '@ghxstship/ui';
import { FileText, BookOpen, GraduationCap, File, Clipboard, Star, Eye, Download } from 'lucide-react';
import type { Resource } from '../lib/resources-service';

interface GridViewProps {
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

export default function GridView({ resources, onSelect, loading = false }: GridViewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse h-64 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-xl">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-md" />
        <p className="text-muted-foreground">No resources found. Create your first resource to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
      {resources.map((resource) => {
        const IconComponent = resourceTypeIcons[resource.type];
        
        return (
          <Card
            key={resource.id}
            onClick={() => onSelect(resource.id)}
            className="cursor-pointer hover:shadow-lg transition-shadow p-md"
          >
            <div className="flex items-start justify-between mb-sm">
              <div className="flex items-center gap-sm">
                <IconComponent className="w-5 h-5 text-primary" />
                <Badge variant="secondary">{resource.status}</Badge>
                {resource.is_featured && (
                  <Badge variant="default" className="bg-warning/10 text-warning">
                    <Star className="w-3 h-3 mr-xs" />
                    Featured
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-xs text-xs text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span>{resource.view_count}</span>
                <Download className="w-4 h-4 ml-sm" />
                <span>{resource.download_count}</span>
              </div>
            </div>
            
            <h3 className="font-semibold text-foreground mb-sm line-clamp-2">{resource.title}</h3>
            
            {resource.description && (
              <p className="text-sm text-muted-foreground mb-md line-clamp-3">{resource.description}</p>
            )}
            
            <div className="flex items-center justify-between mt-auto pt-md border-t border-border">
              <Badge variant="secondary">{resource.category}</Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(resource.created_at).toLocaleDateString()}
              </span>
            </div>
            
            {resource.tags && resource.tags.length > 0 && (
              <div className="mt-sm flex flex-wrap gap-xs">
                {resource.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {resource.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{resource.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
