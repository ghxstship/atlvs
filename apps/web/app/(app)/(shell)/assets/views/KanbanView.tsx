'use client';

/**
 * Assets Kanban View
 *
 * Enterprise-grade kanban board view for asset management.
 * Features drag-and-drop functionality, swimlanes, WIP limits,
 * card customization, and workflow management.
 *
 * @module assets/views/KanbanView
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Asset, AssetViewState } from '../types';
import { apiClient } from '../lib/api';
import { realtimeService } from '../lib/realtime';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Button } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Checkbox } from '@ghxstship/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import {
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Copy,
  Download,
  Plus,
  User,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Package
} from 'lucide-react';

interface KanbanViewProps {
  viewState: AssetViewState;
  onViewStateChange: (newState: Partial<AssetViewState>) => void;
  onAssetSelect?: (asset: Asset, selected: boolean) => void;
  onAssetAction?: (action: string, asset: Asset) => void;
  className?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  assets: Asset[];
  wipLimit?: number;
  color: string;
}

interface KanbanCard {
  asset: Asset;
  isSelected: boolean;
  isDragging: boolean;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'available',
    title: 'Available',
    status: 'available',
    assets: [],
    color: 'bg-green-50 border-green-200'
  },
  {
    id: 'in_use',
    title: 'In Use',
    status: 'in_use',
    assets: [],
    wipLimit: 20,
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    status: 'maintenance',
    assets: [],
    wipLimit: 5,
    color: 'bg-yellow-50 border-yellow-200'
  },
  {
    id: 'retired',
    title: 'Retired',
    status: 'retired',
    assets: [],
    color: 'bg-gray-50 border-gray-200'
  }
];

export default function KanbanView({
  viewState,
  onViewStateChange,
  onAssetSelect,
  onAssetAction,
  className = ''
}: KanbanViewProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Set<string>(new Set());
  const [draggedAsset, setDraggedAsset] = useState<Asset | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Fetch assets
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.getAssets(
        viewState.filters,
        viewState.sort,
        { ...viewState.pagination, pageSize: 200 } // Load more for kanban
      );
      setAssets(response.data);
      onViewStateChange({
        pagination: {
          ...viewState.pagination,
          total: response.pagination.total
        }
      });
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  }, [viewState.filters, viewState.sort, viewState.pagination, onViewStateChange]);

  // Set up realtime subscription
  React.useEffect(() => {
    const unsubscribe = realtimeService.subscribeToAssets(
      'org-id', // Would come from context
      (event, record, oldRecord) => {
        if (event === 'INSERT') {
          setAssets(prev => [record, ...prev]);
        } else if (event === 'UPDATE') {
          setAssets(prev =>
            prev.map(asset =>
              asset.id === record.id ? { ...asset, ...record } : asset
            )
          );
        } else if (event === 'DELETE') {
          setAssets(prev => prev.filter(asset => asset.id !== record.id));
        }
      }
    );

    return unsubscribe;
  }, []);

  // Load data on mount and when filters change
  React.useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Group assets by status for kanban columns
  const kanbanData = useMemo(() => {
    const grouped = assets.reduce((acc, asset) => {
      const status = asset.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(asset);
      return acc;
    }, {} as Record<string, Asset[]>);

    return KANBAN_COLUMNS.map(column => ({
      ...column,
      assets: grouped[column.status] || []
    }));
  }, [assets]);

  // Handle card selection
  const handleCardSelect = useCallback((assetId: string, selected: boolean) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(assetId);
      } else {
        newSet.delete(assetId);
      }
      return newSet;
    });
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      onAssetSelect?.(asset, selected);
    }
  }, [assets, onAssetSelect]);

  // Handle drag start
  const handleDragStart = useCallback((asset: Asset) => {
    setDraggedAsset(asset);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedAsset(null);
    setDragOverColumn(null);
  }, []);

  // Handle drop
  const handleDrop = useCallback(async (columnId: string) => {
    if (!draggedAsset || draggedAsset.status === columnId) return;

    try {
      // Update asset status via API
      await apiClient.updateAsset(draggedAsset.id, { status: columnId as any });

      // Optimistically update local state
      setAssets(prev =>
        prev.map(asset =>
          asset.id === draggedAsset.id
            ? { ...asset, status: columnId as any }
            : asset
        )
      );

      onAssetAction?.('status_changed', { ...draggedAsset, status: columnId as any });
    } catch (error) {
      console.error('Failed to update asset status:', error);
      // Revert optimistic update on error
      setAssets(prev =>
        prev.map(asset =>
          asset.id === draggedAsset.id ? draggedAsset : asset
        )
      );
    }

    setDraggedAsset(null);
    setDragOverColumn(null);
  }, [draggedAsset, onAssetAction]);

  // Handle drag over
  const handleDragOver = useCallback((columnId: string) => {
    setDragOverColumn(columnId);
  }, []);

  // Render kanban card
  const renderKanbanCard = (asset: Asset) => {
    const isSelected = selectedCards.has(asset.id);
    const isDragging = draggedAsset?.id === asset.id;

    return (
      <Card
        key={asset.id}
        className={`mb-3 cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        } ${isDragging ? 'opacity-50 rotate-2' : ''} hover:shadow-md`}
        draggable
        onDragStart={() => handleDragStart(asset)}
        onDragEnd={handleDragEnd}
        onClick={() => onAssetAction?.('view', asset)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-xs">
              <Checkbox
                checked={isSelected}
                onChange={(checked) => handleCardSelect(asset.id, checked)}
                onClick={(e) => e.stopPropagation()}
              />
              {asset.image_urls?.[0] ? (
                <img
                  src={asset.image_urls[0]}
                  alt={asset.name}
                  className="w-icon-lg h-icon-lg rounded object-cover bg-gray-100"
                />
              ) : (
                <div className="w-icon-lg h-icon-lg rounded bg-gray-100 flex items-center justify-center">
                  <Package className="w-icon-xs h-icon-xs text-gray-400" />
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-icon-md w-icon-md p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAssetAction?.('view', asset); }}>
                  <Eye className="mr-2 h-icon-xs w-icon-xs" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAssetAction?.('edit', asset); }}>
                  <Edit className="mr-2 h-icon-xs w-icon-xs" />
                  Edit Asset
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAssetAction?.('duplicate', asset); }}>
                  <Copy className="mr-2 h-icon-xs w-icon-xs" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAssetAction?.('export', asset); }}>
                  <Download className="mr-2 h-icon-xs w-icon-xs" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onAssetAction?.('delete', asset); }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-icon-xs w-icon-xs" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-xs">
            <div>
              <CardTitle className="text-sm font-medium line-clamp-xs">
                {asset.name}
              </CardTitle>
              <div className="flex items-center gap-xs mt-1">
                <Badge variant="outline" className="font-mono text-xs">
                  {asset.asset_tag}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600">
              <Badge variant="secondary" className="text-xs capitalize">
                {asset.category?.replace('_', ' ')}
              </Badge>
              <span className={`capitalize ${
                asset.condition === 'excellent' ? 'text-green-600' :
                asset.condition === 'good' ? 'text-blue-600' :
                asset.condition === 'fair' ? 'text-yellow-600' :
                asset.condition === 'poor' ? 'text-orange-600' :
                'text-red-600'
              }`}>
                {asset.condition?.replace('_', ' ')}
              </span>
            </div>

            {asset.assigned_to && (
              <div className="flex items-center gap-xs text-xs text-gray-600">
                <User className="w-3 h-3" />
                <span className="truncate">
                  {asset.assigned_to.name}
                </span>
              </div>
            )}

            {asset.location && (
              <div className="flex items-center gap-xs text-xs text-gray-600">
                <MapPin className="w-3 h-3" />
                <span className="truncate">
                  {asset.location.name}
                </span>
              </div>
            )}

            {asset.warranty_expiry && (
              <div className="flex items-center gap-xs text-xs text-gray-600">
                <Clock className="w-3 h-3" />
                <span>
                  {new Date(asset.warranty_expiry) > new Date() ? 'Warranty' : 'Expired'}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render kanban column
  const renderKanbanColumn = (column: KanbanColumn & { assets: Asset[] }) => {
    const isDragOver = dragOverColumn === column.id;
    const wipLimitExceeded = column.wipLimit && column.assets.length > column.wipLimit;

    return (
      <div
        key={column.id}
        className={`flex flex-col bg-gray-50 rounded-lg p-md min-h-container-lg ${
          isDragOver ? 'ring-2 ring-blue-300 bg-blue-50' : ''
        } ${column.color}`}
        onDragOver={(e) => {
          e.preventDefault();
          handleDragOver(column.id);
        }}
        onDrop={(e) => {
          e.preventDefault();
          handleDrop(column.id);
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-xs">
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
            <Badge variant="secondary" className="text-xs">
              {column.assets.length}
              {column.wipLimit && ` / ${column.wipLimit}`}
            </Badge>
            {wipLimitExceeded && (
              <AlertTriangle className="w-icon-xs h-icon-xs text-red-500" />
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-icon-md w-icon-md p-0"
            onClick={() => onAssetAction?.('create', { status: column.status } as any)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex-1 space-y-sm overflow-y-auto">
          {column.assets.map(renderKanbanCard)}

          {column.assets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-xl text-gray-400">
              <Package className="w-icon-lg h-icon-lg mb-2" />
              <span className="text-sm">No assets</span>
            </div>
          )}
        </div>

        {wipLimitExceeded && (
          <div className="mt-2 text-xs text-red-600 font-medium">
            WIP limit exceeded ({column.assets.length - (column.wipLimit || 0)} over)
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Kanban Controls */}
      <div className="flex items-center justify-between p-md border-b">
        <div className="flex items-center gap-md">
          <span className="text-sm text-gray-600">
            {assets.length} total assets
          </span>
          {selectedCards.size > 0 && (
            <span className="text-sm text-blue-600 font-medium">
              {selectedCards.size} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-xs">
          {selectedCards.size > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCards(new Set())}
              >
                Clear Selection
              </Button>
              <Button variant="outline" size="sm">
                Bulk Actions
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-md">
        {loading ? (
          <div className="flex items-center justify-center h-container-sm">
            <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading kanban board...</span>
          </div>
        ) : (
          <div className="flex gap-lg min-w-max">
            {kanbanData.map(renderKanbanColumn)}
          </div>
        )}
      </div>

      {/* WIP Limits Indicator */}
      <div className="px-md pb-4">
        <div className="flex gap-xs text-xs text-gray-600">
          <span>WIP Limits:</span>
          {KANBAN_COLUMNS.filter(col => col.wipLimit).map(col => (
            <Badge
              key={col.id}
              variant={kanbanData.find(k => k.id === col.id)?.assets.length > col.wipLimit! ? "destructive" : "secondary"}
              className="text-xs"
            >
              {col.title}: {kanbanData.find(k => k.id === col.id)?.assets.length || 0}/{col.wipLimit}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
