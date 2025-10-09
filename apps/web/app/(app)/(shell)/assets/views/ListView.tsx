'use client';

/**
 * Assets List View
 *
 * Enterprise-grade list view component for asset management.
 * Features hierarchical organization, inline actions, density options,
 * and nested item support.
 *
 * @module assets/views/ListView
 */

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Asset, AssetViewState } from '../types';
import { apiClient } from '../lib/api';
import { realtimeService } from '../lib/realtime';
import {
  Badge,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ListView
} from "@ghxstship/ui";
import {
  Dropdown,
  
  DropdownItem,
  
  DropdownMenuSeparator
} from '@ghxstship/ui';
import {
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Copy,
  Download,
  MapPin,
  User,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';

interface ListViewProps {
  viewState: AssetViewState;
  onViewStateChange: (newState: Partial<AssetViewState>) => void;
  onAssetSelect?: (asset: Asset, selected: boolean) => void;
  onAssetAction?: (action: string, asset: Asset) => void;
  className?: string;
}

interface ListItem {
  asset: Asset;
  level: number;
  expanded: boolean;
  hasChildren: boolean;
  parentId?: string;
}

type Density = 'compact' | 'comfortable' | 'spacious';
type Grouping = 'none' | 'category' | 'status' | 'location';

const DENSITY_CONFIG = {
  compact: {
    itemHeight: 'h-icon-2xl',
    fontSize: 'text-sm',
    padding: 'py-xs px-sm',
    iconSize: 'w-icon-xs h-icon-xs'
  },
  comfortable: {
    itemHeight: 'h-component-md',
    fontSize: 'text-base',
    padding: 'py-sm px-md',
    iconSize: 'w-icon-sm h-icon-sm'
  },
  spacious: {
    itemHeight: 'h-component-lg',
    fontSize: 'text-lg',
    padding: 'py-md px-lg',
    iconSize: 'w-icon-md h-icon-md'
  }
};

export default function ListView({
  viewState,
  onViewStateChange,
  onAssetSelect,
  onAssetAction,
  className = ''
}: ListViewProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>(new Set());
  const [density, setDensity] = useState<Density>('comfortable');
  const [grouping, setGrouping] = useState<Grouping>('none');

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

  // Group assets
  const groupedAssets = useMemo(() => {
    if (grouping === 'none') {
      return [{
        key: 'all',
        label: 'All Assets',
        assets,
        expanded: true,
        count: assets.length
      }];
    }

    const groups: Record<string, Asset[]> = {};

    assets.forEach(asset => {
      let groupKey: string;
      let groupLabel: string;

      switch (grouping) {
        case 'category':
          groupKey = asset.category || 'uncategorized';
          groupLabel = asset.category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Uncategorized';
          break;
        case 'status':
          groupKey = asset.status;
          groupLabel = asset.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          break;
        case 'location':
          groupKey = asset.location?.id || 'unassigned';
          groupLabel = asset.location?.name || 'Unassigned';
          break;
        default:
          groupKey = 'all';
          groupLabel = 'All Assets';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(asset);
    });

    return Object.entries(groups).map(([key, groupAssets]) => ({
      key,
      label: key === 'all' ? 'All Assets' : Object.keys(groups).indexOf(key) >= 0 ?
        Object.values(groups)[Object.keys(groups).indexOf(key)]?.[0]?.category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || key : key,
      assets: groupAssets,
      expanded: expandedGroups.has(key),
      count: groupAssets.length
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [assets, grouping, expandedGroups]);

  // Handle item selection
  const handleItemSelect = useCallback((assetId: string, selected: boolean) => {
    setSelectedItems(prev => {
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
  }, [assets, onAssetSelect, setSelectedItems]);

  // Handle bulk selection
  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      const allIds = new Set(assets.map(a => a.id));
      setSelectedItems(allIds);
      assets.forEach(asset => onAssetSelect?.(asset, true));
    } else {
      setSelectedItems(new Set());
      assets.forEach(asset => onAssetSelect?.(asset, false));
    }
  }, [assets, onAssetSelect, setSelectedItems]);

  // Handle group expansion
  const handleGroupToggle = useCallback((groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  }, [setExpandedGroups]);

  // Get status display
  const getStatusDisplay = (status: string) => {
    const statusConfig = {
      available: { color: 'text-green-600', icon: CheckCircle },
      in_use: { color: 'text-blue-600', icon: User },
      maintenance: { color: 'text-yellow-600', icon: AlertTriangle },
      retired: { color: 'text-gray-600', icon: Package },
      lost: { color: 'text-red-600', icon: AlertTriangle },
      damaged: { color: 'text-orange-600', icon: AlertTriangle }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.retired;
  };

  // Render list item
  const renderListItem = (asset: Asset, level: number = 0) => {
    const isSelected = selectedItems.has(asset.id);
    const statusDisplay = getStatusDisplay(asset.status);
    const StatusIcon = statusDisplay.icon;
    const config = DENSITY_CONFIG[density];

    return (
      <div
        key={asset.id}
        className={`flex items-center border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
          isSelected ? 'bg-blue-50' : ''
        }`}
        style={{ paddingLeft: `${level * 20 + 16}px` }}
        onClick={() => onAssetAction?.('view', asset)}
      >
        {/* Selection checkbox */}
        <div className={`${config.padding} flex items-center`}>
          <Checkbox
            checked={isSelected}
            onChange={(checked) => handleItemSelect(asset.id, checked)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Asset icon */}
        <div className={`${config.padding} flex items-center`}>
          {asset.image_urls?.[0] ? (
            <Image
              src={asset.image_urls[0]}
              alt={asset.name}
              width={48}
              height={48}
              className={`rounded ${config.iconSize} object-cover bg-gray-100`}
            />
          ) : (
            <div className={`rounded bg-gray-100 flex items-center justify-center ${config.iconSize}`}>
              <Package className={`${config.iconSize} text-gray-400`} />
            </div>
          )}
        </div>

        {/* Asset info */}
        <div className="flex-1 min-w-0">
          <div className={`flex items-center gap-sm ${config.padding}`}>
            <div className="flex-1 min-w-0">
              <div className={`font-medium truncate ${config.fontSize}`}>
                {asset.name}
              </div>
              <div className="flex items-center gap-xs mt-1">
                <Badge variant="outline" className="font-mono text-xs">
                  {asset.asset_tag}
                </Badge>
                <Badge variant="secondary" className="text-xs capitalize">
                  {asset.category?.replace('_', ' ')}
                </Badge>
                <div className={`flex items-center gap-xs ${statusDisplay.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  <span className="text-xs capitalize">
                    {asset.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick info */}
            <div className="flex items-center gap-md text-sm text-gray-600">
              {asset.assigned_to && (
                <div className="flex items-center gap-xs">
                  <User className="w-icon-xs h-icon-xs" />
                  <span className="truncate max-w-component-lg">
                    {asset.assigned_to.name}
                  </span>
                </div>
              )}
              {asset.location && (
                <div className="flex items-center gap-xs">
                  <MapPin className="w-icon-xs h-icon-xs" />
                  <span className="truncate max-w-component-lg">
                    {asset.location.name}
                  </span>
                </div>
              )}
              {asset.purchase_price && (
                <div className="flex items-center gap-xs">
                  <DollarSign className="w-icon-xs h-icon-xs" />
                  <span>${asset.purchase_price.toLocaleString()}</span>
                </div>
              )}
              {asset.warranty_expiry && (
                <div className="flex items-center gap-xs">
                  <Clock className="w-icon-xs h-icon-xs" />
                  <span>
                    {new Date(asset.warranty_expiry) > new Date() ? 'Active' : 'Expired'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={`${config.padding} flex items-center`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-icon-lg w-icon-lg p-0"
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
      </div>
    );
  };

  // Render group header
  const renderGroupHeader = (group: { key: string; label: string; assets: Asset[]; expanded: boolean; count: number }) => {
    const config = DENSITY_CONFIG[density];

    return (
      <div
        key={group.key}
        className="bg-gray-50 border-b-2 border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => handleGroupToggle(group.key)}
      >
        <div className={`flex items-center ${config.padding}`}>
          <div className="flex items-center gap-xs">
            {group.expanded ? (
              <ChevronDown className="w-icon-xs h-icon-xs text-gray-500" />
            ) : (
              <ChevronRight className="w-icon-xs h-icon-xs text-gray-500" />
            )}
            <span className={`font-medium text-gray-900 ${config.fontSize}`}>
              {group.label}
            </span>
            <Badge variant="secondary" className="text-xs">
              {group.count}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* List Controls */}
      <div className="flex items-center justify-between p-md border-b">
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-xs">
            <span className="text-sm font-medium">Density:</span>
            <select
              value={density}
              onChange={(e) => setDensity(e.target.value as Density)}
              className="text-sm border rounded px-xs py-xs"
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>
          {grouping !== 'none' && (
            <div className="flex items-center gap-xs">
              <span className="text-sm font-medium">Grouping:</span>
              <select
                value={grouping}
                onChange={(e) => setGrouping(e.target.value as Grouping)}
                className="text-sm border rounded px-xs py-xs"
              >
                <option value="none">None</option>
                <option value="category">Category</option>
                <option value="status">Status</option>
                <option value="location">Location</option>
              </select>
            </div>
          )}
          <span className="text-sm text-gray-600">
            {assets.length} assets
          </span>
          {selectedItems.size > 0 && (
            <span className="text-sm text-blue-600 font-medium">
              {selectedItems.size} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-xs">
          {selectedItems.size > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(false)}
              >
                Clear
              </Button>
              <Button variant="outline" size="sm">
                Bulk Actions
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSelectAll(selectedItems.size !== assets.length)}
          >
            {selectedItems.size === assets.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-container-sm">
            <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading assets...</span>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-container-sm text-gray-500">
            <Package className="w-icon-2xl h-icon-2xl mb-4 text-gray-300" />
            <div className="text-lg font-medium">No assets found</div>
            <div className="text-sm">Try adjusting your filters</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {groupedAssets.map(group => (
              <React.Fragment key={group.key}>
                {grouping !== 'none' && renderGroupHeader(group)}
                {group.expanded && group.assets.map(asset => renderListItem(asset))}
              </React.Fragment>
            ))}
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
