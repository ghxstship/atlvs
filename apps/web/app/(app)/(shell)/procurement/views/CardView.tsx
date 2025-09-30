/**
 * Procurement Card View Component
 * Card/tile grid view for procurement entities
 */

'use client';

import React from 'react';
import { Card } from '@ghxstship/ui/components/Card';
import { Badge } from '@ghxstship/ui/components/Badge';
import { Button } from '@ghxstship/ui/components/Button';
import { useATLVS } from '../../core/providers/ATLVSProvider';
import type { FieldConfig } from '../../unified/drawers/UnifiedDrawer';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface CardViewProps {
  entity?: string;
  fields?: FieldConfig[];
  columns?: number;
  gap?: 'sm' | 'md' | 'lg';
  showActions?: boolean;
  compact?: boolean;
}

export const CardView: React.FC<CardViewProps> = ({
  entity,
  fields,
  columns = 3,
  gap = 'md',
  showActions = true,
  compact = false,
}) => {
  const {
    data,
    loading,
    error,
    handleEdit,
    handleView,
    handleDelete,
    config,
  } = useATLVS();

  if (loading) {
    return (
      <div className={`grid grid-cols-${columns} gap-${gap} p-md`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-muted rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-md text-center text-destructive">
        <p>Error loading data: {error}</p>
      </div>
    );
  }

  const displayFields = fields || config.fields || [];

  return (
    <div className={`grid grid-cols-${columns} gap-${gap} p-md`}>
      {data.map((item: unknown) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <div className="p-md">
            {/* Title */}
            <h3 className="font-semibold text-lg mb-sm">
              {item.title || item.name || item.po_number || `Item ${item.id}`}
            </h3>

            {/* Status Badge */}
            {item.status && (
              <Badge variant="secondary" className="mb-sm">
                {item.status}
              </Badge>
            )}

            {/* Key Fields */}
            <div className="space-y-xs mb-md">
              {displayFields.slice(0, 3).map((field) => (
                <div key={field.key} className="text-sm">
                  <span className="font-medium text-muted-foreground">
                    {field.label}:
                  </span>{' '}
                  {item[field.key] || 'N/A'}
                </div>
              ))}
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex gap-xs">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleView(item)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      ))}

      {data.length === 0 && config.emptyState && (
        <div className="col-span-full text-center py-xl">
          <div className="text-muted-foreground">
            <div className="h-12 w-12 mx-auto mb-md bg-muted rounded-lg flex items-center justify-center">
              📋
            </div>
            <p className="mb-sm">{config.emptyState.title}</p>
            <p className="text-sm">{config.emptyState.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardView;
