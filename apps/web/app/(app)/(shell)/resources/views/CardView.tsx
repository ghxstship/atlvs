/**
 * Resources Card View
 * Enhanced card-based view with expanded details and actions
 */

'use client';

import React from 'react';
import { Badge, Card, Button } from '@ghxstship/ui';
import { BookOpen, Calendar, Clipboard, Download, ExternalEye, Eye, File, FileText, GraduationCap, Star, User } from 'lucide-react';
import type { Resource } from '../lib/resources-service';

interface CardViewProps {
  resources: Resource[];
  onSelect: (id: string) => void;
  onDownload?: (id: string) => void;
  onView?: (id: string) => void;
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

const resourceTypeColors = {
  policy: 'bg-blue-100 text-blue-700',
  guide: 'bg-green-100 text-green-700',
  training: 'bg-purple-100 text-purple-700',
  template: 'bg-orange-100 text-orange-700',
  procedure: 'bg-pink-100 text-pink-700',
  featured: 'bg-yellow-100 text-yellow-700'
};

export default function CardView({ 
  resources, 
  onSelect, 
  onDownload,
  onView,
  loading = false 
}: CardViewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse h-80 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-xl">
        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-md" />
        <h3 className="text-lg font-semibold mb-sm">No Resources Available</h3>
        <p className="text-muted-foreground">Create your first resource to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
      {resources.map((resource) => {
        const IconComponent = resourceTypeIcons[resource.type];
        const colorClass = resourceTypeColors[resource.type];
        
        return (
          <Card
            key={resource.id}
            className="flex flex-col h-full hover:shadow-xl transition-all duration-200 overflow-hidden"
          >
            {/* Header with Icon and Status */}
            <div className={`p-md ${colorClass} flex items-center justify-between`}>
              <div className="flex items-center gap-sm">
                <IconComponent className="w-6 h-6" />
                <span className="font-semibold capitalize">{resource.type}</span>
              </div>
              {resource.is_featured && (
                <Badge variant="default" className="bg-white/20 text-current">
                  <Star className="w-3 h-3 mr-xs" />
                  Featured
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-lg">
              <div className="mb-sm">
                <h3 
                  className="font-bold text-lg text-foreground mb-xs line-clamp-2 cursor-pointer hover:text-primary"
                  onClick={() => onSelect(resource.id)}
                >
                  {resource.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {resource.category}
                </Badge>
              </div>
              
              {resource.description && (
                <p className="text-sm text-muted-foreground mb-md line-clamp-4">
                  {resource.description}
                </p>
              )}

              {/* Metadata */}
              <div className="space-y-xs text-xs text-muted-foreground">
                <div className="flex items-center gap-xs">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(resource.created_at).toLocaleDateString()}</span>
                </div>
                {resource.author && (
                  <div className="flex items-center gap-xs">
                    <User className="w-4 h-4" />
                    <span>{resource.author}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {resource.tags && resource.tags.length > 0 && (
                <div className="mt-md flex flex-wrap gap-xs">
                  {resource.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                  {resource.tags.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{resource.tags.length - 4} more
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Footer with Stats and Actions */}
            <div className="border-t border-border p-md">
              <div className="flex items-center justify-between mb-sm">
                <div className="flex items-center gap-md text-xs text-muted-foreground">
                  <div className="flex items-center gap-xs">
                    <Eye className="w-4 h-4" />
                    <span>{resource.view_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <Download className="w-4 h-4" />
                    <span>{resource.download_count || 0}</span>
                  </div>
                </div>
                <Badge 
                  variant={resource.status === 'published' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {resource.status}
                </Badge>
              </div>

              <div className="flex gap-sm">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onView ? onView(resource.id) : onSelect(resource.id)}
                >
                  <Eye className="w-4 h-4 mr-xs" />
                  View
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => onDownload ? onDownload(resource.id) : onSelect(resource.id)}
                >
                  <Download className="w-4 h-4 mr-xs" />
                  Download
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
