'use client';

/**
 * Assets Card View
 *
 * Enterprise-grade card/tile grid view component for asset management.
 * Features responsive grid layouts, rich asset previews, interactive cards,
 * and masonry-style arrangements.
 *
 * @module assets/views/CardView
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
  MapPin,
  User,
  Calendar,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface CardViewProps {
  viewState: AssetViewState;
  onViewStateChange: (newState: Partial<AssetViewState>) => void;
  onAssetSelect?: (asset: Asset, selected: boolean) => void;
  onAssetAction?: (action: string, asset: Asset) => void;
  className?: string;
}

interface CardLayout {
  columns: number;
  gap: string;
  cardHeight?: string;
}

const LAYOUTS: Record<string, CardLayout> = {
  compact: { columns: 4, gap: '0.75rem', cardHeight: '200px' },
  comfortable: { columns: 3, gap: '1rem', cardHeight: '240px' },
  spacious: { columns: 2, gap: '1.5rem', cardHeight: '280px' }
};

export default function CardView({
  viewState,
  onViewStateChange,
  onAssetSelect,
  onAssetAction,
  className = ''
}: CardViewProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Set<string>(new Set());
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Fetch assets
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.getAssets(
        viewState.filters,
        viewState.sort,
        viewState.pagination
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

  // Load data on mount and when filters/sort change
  React.useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

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

  // Handle bulk selection
  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      const allIds = new Set(assets.map(a => a.id));
      setSelectedCards(allIds);
      assets.forEach(asset => onAssetSelect?.(asset, true));
    } else {
      setSelectedCards(new Set());
      assets.forEach(asset => onAssetSelect?.(asset, false));
    }
  }, [assets, onAssetSelect]);

  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    const statusConfig = {
      available: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      in_use: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: User },
      maintenance: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle },
      retired: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Package },
      lost: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle },
      damaged: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.retired;
  };

  // Get condition color
  const getConditionColor = (condition: string) => {
    const conditionColors = {
      excellent: 'text-emerald-600',
      good: 'text-green-600',
      fair: 'text-yellow-600',
      poor: 'text-orange-600',
      needs_repair: 'text-red-600'
    };
    return conditionColors[condition as keyof typeof conditionColors] || 'text-gray-600';
  };

  // Render asset card
  const renderAssetCard = (asset: Asset) => {
    const statusDisplay = getStatusDisplay(asset.status);
    const StatusIcon = statusDisplay.icon;
    const isSelected = selectedCards.has(asset.id);
    const isHovered = hoveredCard === asset.id;

    return (
      <Card
        key={asset.id}
        className={`relative transition-all duration-200 cursor-pointer ${
          isSelected
            ? 'ring-2 ring-blue-500 shadow-lg'
            : isHovered
              ? 'shadow-lg scale-[1.02]'
              : 'hover:shadow-md'
        } ${selectedCards.size > 0 && !isSelected ? 'opacity-60' : ''}`}
        onMouseEnter={() => setHoveredCard(asset.id)}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => onAssetAction?.('view', asset)}
      >
        {/* Selection checkbox */}
        <div className="absolute top-sm left-3 z-10">
          <Checkbox
            checked={isSelected}
            onChange={(checked) => {
              handleCardSelect(asset.id, checked);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Actions menu */}
        <div className="absolute top-sm right-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="h-icon-lg w-icon-lg p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-icon-xs w-icon-xs" />
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

        <CardHeader className="pb-3">
          {/* Asset image or icon */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-sm">
              {asset.image_urls?.[0] ? (
                <img
                  src={asset.image_urls[0]}
                  alt={asset.name}
                  className="w-icon-2xl h-icon-2xl rounded-lg object-cover bg-gray-100"
                />
              ) : (
                <div className="w-icon-2xl h-icon-2xl rounded-lg bg-gray-100 flex items-center justify-center">
                  <Package className="w-icon-md h-icon-md text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold truncate">
                  {asset.name}
                </CardTitle>
                <div className="flex items-center gap-xs mt-1">
                  <Badge variant="outline" className="font-mono text-xs">
                    {asset.asset_tag}
                  </Badge>
                  <Badge
                    className={`text-xs border ${statusDisplay.color}`}
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {asset.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-sm">
            {/* Category and condition */}
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs capitalize">
                {asset.category?.replace('_', ' ')}
              </Badge>
              <span className={`text-xs font-medium ${getConditionColor(asset.condition)}`}>
                {asset.condition?.replace('_', ' ')}
              </span>
            </div>

            {/* Assignment info */}
            {asset.assigned_to && (
              <div className="flex items-center gap-xs text-sm text-gray-600">
                <User className="w-icon-xs h-icon-xs" />
                <span className="truncate">
                  {asset.assigned_to.name || 'Assigned'}
                </span>
              </div>
            )}

            {/* Location info */}
            {asset.location && (
              <div className="flex items-center gap-xs text-sm text-gray-600">
                <MapPin className="w-icon-xs h-icon-xs" />
                <span className="truncate">{asset.location.name}</span>
              </div>
            )}

            {/* Financial info */}
            <div className="flex items-center justify-between pt-2 border-t">
              {asset.purchase_price && (
                <div className="flex items-center gap-xs text-sm">
                  <DollarSign className="w-icon-xs h-icon-xs text-gray-400" />
                  <span className="font-medium">
                    ${asset.purchase_price.toLocaleString()}
                  </span>
                </div>
              )}
              {asset.warranty_expiry && (
                <div className="flex items-center gap-xs text-sm text-gray-600">
                  <Calendar className="w-icon-xs h-icon-xs" />
                  <span>
                    {new Date(asset.warranty_expiry).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex gap-xs pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onAssetAction?.('assign', asset);
                }}
              >
                Assign
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onAssetAction?.('maintenance', asset);
                }}
              >
                Service
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Get current layout
  const currentLayout = LAYOUTS.comfortable; // Could be configurable

  // Calculate grid columns class
  const gridColsClass = `grid-cols-${Math.min(currentLayout.columns, 4)}`;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* View Controls */}
      <div className="flex items-center justify-between p-md border-b">
        <div className="flex items-center gap-xs">
          <span className="text-sm text-gray-600">
            {assets.length} assets
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
                onClick={() => handleSelectAll(false)}
              >
                Clear Selection
              </Button>
              <Button variant="outline" size="sm">
                Bulk Actions
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSelectAll(selectedCards.size !== assets.length)}
          >
            {selectedCards.size === assets.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="flex-1 overflow-auto p-md">
        {loading ? (
          <div className="flex items-center justify-center h-container-sm">
            <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading assets...</span>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-container-sm text-gray-500">
            <Package className="w-icon-2xl h-icon-2xl mb-4 text-gray-300" />
            <div className="text-lg font-medium">No assets found</div>
            <div className="text-sm">Add your first asset to get started</div>
          </div>
        ) : (
          <div
            className={`grid gap-${currentLayout.gap} ${gridColsClass}`}
            style={{
              gridTemplateColumns: `repeat(${currentLayout.columns}, minmax(0, 1fr))`
            }}
          >
            {assets.map(renderAssetCard)}
          </div>
        )}
      </div>

      {/* Load More */}
      {viewState.pagination.total &&
       viewState.pagination.page * viewState.pagination.pageSize < viewState.pagination.total && (
        <div className="flex justify-center p-md border-t">
          <Button
            variant="outline"
            onClick={() => onViewStateChange({
              pagination: {
                ...viewState.pagination,
                page: viewState.pagination.page + 1
              }
            })}
          >
            Load More Assets
          </Button>
        </div>
      )}
    </div>
  );
}
