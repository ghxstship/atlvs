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
import Image from 'next/image';
import { Asset, AssetViewState } from '../types';
import { apiClient } from '../lib/api';
import { subscribeToAssets, unsubscribe, type AssetChangePayload } from '../lib/realtime';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox
} from "@ghxstship/ui";
import { Dropdown, type DropdownItem } from '@ghxstship/ui';
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

type AssetRecord = Asset & {
  assignedToUser?: { name: string; avatar?: string; email?: string };
  locationInfo?: { name: string };
  supplierInfo?: { name: string };
  warrantyExpiry?: Date | null;
};

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  assets: AssetRecord[];
  wipLimit?: number;
  color: string;
}

interface KanbanCard {
  asset: AssetRecord;
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
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [draggedAsset, setDraggedAsset] = useState<AssetRecord | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const normalizeAsset = useCallback((record: any): AssetRecord => {
    const assignedRelation = record?.assigned_to;
    const locationRelation = record?.location;
    const supplierRelation = record?.supplier;

    return {
      ...record,
      assigned_to:
        typeof assignedRelation === 'string'
          ? assignedRelation
          : assignedRelation?.id ?? record?.assigned_to ?? undefined,
      assignedToUser:
        assignedRelation && typeof assignedRelation === 'object'
          ? {
              name: assignedRelation.name as string,
              avatar: assignedRelation.avatar as string | undefined,
              email: assignedRelation.email as string | undefined
            }
          : undefined,
      locationInfo:
        locationRelation && typeof locationRelation === 'object'
          ? { name: locationRelation.name as string }
          : undefined,
      supplierInfo:
        supplierRelation && typeof supplierRelation === 'object'
          ? { name: supplierRelation.name as string }
          : undefined,
      warrantyExpiry: record?.warranty_expiry
        ? new Date(record.warranty_expiry as string | number | Date)
        : undefined
    } as AssetRecord;
  }, []);

  // Fetch assets
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.getAssets(
        viewState.filters,
        viewState.sort,
        { ...viewState.pagination, pageSize: 200 } // Load more for kanban
      );
      const enriched = (response.data ?? []).map((item: any) => normalizeAsset(item));
      setAssets(enriched);
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
  }, [viewState.filters, viewState.sort, viewState.pagination, onViewStateChange, normalizeAsset]);

  // Set up realtime subscription
  React.useEffect(() => {
    const channel = subscribeToAssets(
      'org-id', // Would come from context
      (payload: AssetChangePayload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          const next = normalizeAsset(payload.new);
          setAssets(prev => {
            if (prev.some(asset => asset.id === next.id)) {
              return prev.map(asset => (asset.id === next.id ? { ...asset, ...next } : asset));
            }
            return [next, ...prev];
          });
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const updated = normalizeAsset(payload.new);
          setAssets(prev =>
            prev.map(asset => (asset.id === updated.id ? { ...asset, ...updated } : asset))
          );
        } else if (payload.eventType === 'DELETE' && payload.old) {
          const removed = payload.old as AssetRecord;
          setAssets(prev => prev.filter(asset => asset.id !== removed.id));
        }
      }
    );

    return () => {
      void unsubscribe(channel);
    };
  }, [normalizeAsset]);

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
    }, {} as Record<string, AssetRecord[]>);

    return KANBAN_COLUMNS.map(column => ({
      ...column,
      assets: grouped[column.status] || []
    }));
  }, [assets]);

  const buildDropdownItems = useCallback((asset: AssetRecord): DropdownItem[] => [
    {
      id: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: () => onAssetAction?.('view', asset)
    },
    {
      id: 'edit',
      label: 'Edit Asset',
      icon: Edit,
      onClick: () => onAssetAction?.('edit', asset)
    },
    {
      id: 'separator-1',
      label: 'separator',
      separator: true
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      onClick: () => onAssetAction?.('duplicate', asset)
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      onClick: () => onAssetAction?.('export', asset)
    },
    {
      id: 'separator-2',
      label: 'separator',
      separator: true
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: () => onAssetAction?.('delete', asset)
    }
  ], [onAssetAction]);

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
  }, [assets, onAssetSelect, setSelectedCards]);

  // Handle drag start
  const handleDragStart = useCallback((asset: AssetRecord) => {
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
  const renderKanbanCard = (asset: AssetRecord) => {
    const isSelected = selectedCards.has(asset.id);
    const isDragging = draggedAsset?.id === asset.id;
    const assignee = asset.assignedToUser;
    const location = asset.locationInfo;
    const warrantyExpiry = asset.warrantyExpiry ?? null;

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
                onChange={(event) => handleCardSelect(asset.id, event.target.checked)}
                onClick={(event) => event.stopPropagation()}
              />
              {asset.image_urls?.[0] ? (
                <Image
                  src={asset.image_urls[0]}
                  alt={asset.name}
                  width={48}
                  height={48}
                  className="w-icon-lg h-icon-lg rounded object-cover bg-gray-100"
                />
              ) : (
                <div className="w-icon-lg h-icon-lg rounded bg-gray-100 flex items-center justify-center">
                  <Package className="w-icon-xs h-icon-xs text-gray-400" />
                </div>
              )}
            </div>
            <div onClick={(event) => event.stopPropagation()}>
              <Dropdown
                align="end"
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-icon-md w-icon-md p-0"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                }
                items={buildDropdownItems(asset)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-xs">
            <div>
              <CardTitle className="text-sm font-medium line-clamp-xs">
                {asset.name}
              </CardTitle>
              <div className="flex items-center gap-xs mt-1">
                <Badge variant="secondary" className="font-mono text-xs">
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

            {assignee?.name && (
              <div className="flex items-center gap-xs text-xs text-gray-600">
                <User className="w-3 h-3" />
                <span className="truncate">
                  {assignee.name}
                </span>
              </div>
            )}

            {location?.name && (
              <div className="flex items-center gap-xs text-xs text-gray-600">
                <MapPin className="w-3 h-3" />
                <span className="truncate">
                  {location?.name}
                </span>
              </div>
            )}

            {warrantyExpiry && (
              <div className="flex items-center gap-xs text-xs text-gray-600">
                <Clock className="w-3 h-3" />
                <span>
                  {warrantyExpiry > new Date() ? 'Warranty Active' : 'Warranty Expired'}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render kanban column
  const renderKanbanColumn = (column: KanbanColumn & { assets: AssetRecord[] }) => {
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
        onDrop={(event) => {
          event.preventDefault();
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
              variant={(kanbanData.find(k => k.id === col.id)?.assets.length ?? 0) > (col.wipLimit ?? 0) ? 'error' : 'secondary'}
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
