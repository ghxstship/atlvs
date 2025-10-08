'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
 Button,
 CalendarView,
 DataActions,
 DataGrid,
 DataViewProvider,
 DashboardView,
 KanbanBoard,
 ListView,
 StateManagerProvider,
 TimelineView,
 ViewSwitcher
} from '@ghxstship/ui';
import type {
 DataViewConfig,
 SortConfig,
 ViewType,
 FilterConfig
} from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import {
 fetchMarketplaceListings,
 createMarketplaceListing,
 updateMarketplaceListing,
 deleteMarketplaceListings,
 normalizeListingForDataView
} from './lib/marketplace-service';
import type {
 ListingFilters,
 MarketplaceListing,
 MarketplaceStats,
 UpsertListingDto
} from './types';
import { LISTING_FIELD_CONFIGS } from './field-config';
import { MarketplaceDashboard } from './views/MarketplaceDashboard';
import { CreateListingDrawer } from './drawers/CreateListingDrawer';
import { EditListingDrawer } from './drawers/EditListingDrawer';
import { VendorProfileDrawer } from './drawers/VendorProfileDrawer';

export default function MarketplaceClient({ orgId }: { orgId: string }) {
 const t = useTranslations('marketplace');

 const [listings, setListings] = useState<MarketplaceListing[]>([]);
 const [stats, setStats] = useState<MarketplaceStats | null>(null);
 const [loading, setLoading] = useState<boolean>(false);
 const [error, setError] = useState<string | null>(null);

 const [filters, setFilters] = useState<ListingFilters>({});
 const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
 const [searchQuery, setSearchQuery] = useState<string>('');
 const [viewMode, setViewMode] = useState<ViewType>('grid');
 const [selectedIds, setSelectedIds] = useState<string[]>([]);

 const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
 const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
 const [createLoading, setCreateLoading] = useState(false);
 const [editLoading, setEditLoading] = useState(false);
 const [activeListing, setActiveListing] = useState<MarketplaceListing | null>(null);

 const [vendorDrawerOpen, setVendorDrawerOpen] = useState(false);
 const [vendorDrawerVendorId, setVendorDrawerVendorId] = useState<string | null>(null);

 const normalizedListings = useMemo(
 () => listings.map(normalizeListingForDataView),
 [listings],
 );

 const loadListings = useCallback(async () => {
 setLoading(true);
 setError(null);
 try {
 const { listings: responseListings, stats: responseStats } =
 await fetchMarketplaceListings(orgId, {
 ...filters,
 search: searchQuery || undefined
 });

 const sortedListings = (() => {
 if (!sortConfig) return responseListings;
 const { key, direction } = sortConfig;
 const sorted = [...responseListings].sort((a: unknown, b: unknown) => {
 const valueA = key.split('.').reduce<unknown>((acc, part) => acc?.[part], a);
 const valueB = key.split('.').reduce<unknown>((acc, part) => acc?.[part], b);

 if (valueA == null && valueB == null) return 0;
 if (valueA == null) return direction === 'asc' ? -1 : 1;
 if (valueB == null) return direction === 'asc' ? 1 : -1;

 if (valueA > valueB) return direction === 'asc' ? 1 : -1;
 if (valueA < valueB) return direction === 'asc' ? -1 : 1;
 return 0;
 });
 return sorted;
 })();

 setListings(sortedListings);
 setStats(responseStats);
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Failed to load listings');
 } finally {
 setLoading(false);
 }
 }, [filters, orgId, searchQuery, sortConfig]);

 useEffect(() => {
 void loadListings();
 }, [loadListings]);

 const handleRefresh = useCallback(async () => {
 await loadListings();
 }, [loadListings]);

 const handleSearch = useCallback((query: string) => {
 setSearchQuery(query);
 }, []);

 const handleFilter = useCallback((nextFilters: FilterConfig[]) => {
 const normalized = nextFilters.reduce<ListingFilters>((acc, filter) => {
 if (filter.value === undefined || filter.value === null || filter.value === '') {
 return acc;
 }
 return {
 ...acc,
 [filter.field]: filter.value
 } as ListingFilters;
 }, {} as ListingFilters);

 setFilters((prev: unknown) => ({ ...prev, ...normalized }));
 }, []);

 const handleSort = useCallback((nextSort: SortConfig | null) => {
 setSortConfig(nextSort);
 }, []);

 const handleViewChange = useCallback((nextView: ViewType) => {
 setViewMode(nextView);
 }, []);

 const handleSelectionChange = useCallback((ids: string[]) => {
 setSelectedIds(ids);
 }, []);

 const openCreateDrawer = useCallback(() => {
 setActiveListing(null);
 setIsCreateDrawerOpen(true);
 }, []);

 const openEditDrawer = useCallback((listing: MarketplaceListing) => {
 setActiveListing(listing);
 setIsEditDrawerOpen(true);
 }, []);

 const closeCreateDrawer = useCallback(() => {
 setIsCreateDrawerOpen(false);
 }, []);

 const closeEditDrawer = useCallback(() => {
 setIsEditDrawerOpen(false);
 setActiveListing(null);
 }, []);

 const handleCreateSubmit = useCallback(
 async (dto: UpsertListingDto) => {
 setCreateLoading(true);
 try {
 const created = await createMarketplaceListing(orgId, dto);
 setListings((prev: unknown) => [created, ...prev]);
 setStats((prev: unknown) =>
 prev
 ? {
 ...prev,
 totalListings: prev.totalListings + 1,
 featuredListings: dto.featured
 ? prev.featuredListings + 1
 : prev.featuredListings,
 lastUpdated: new Date().toISOString()
 }
 : prev,
 );
 closeCreateDrawer();
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Failed to create listing');
 } finally {
 setCreateLoading(false);
 }
 },
 [closeCreateDrawer, orgId],
 );

 const handleEditSubmit = useCallback(
 async (dto: UpsertListingDto) => {
 if (!dto.id) return;

 setEditLoading(true);
 try {
 const updated = await updateMarketplaceListing(orgId, dto);
 setListings((prev: unknown) =>
 prev.map((listing) =>
 listing.id === updated.id ? { ...listing, ...updated } : listing,
 ),
 );
 closeEditDrawer();
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Failed to update listing');
 } finally {
 setEditLoading(false);
 }
 },
 [closeEditDrawer, orgId],
 );

 const handleDelete = useCallback(
 async (ids: string[]) => {
 if (ids.length === 0) return;
 try {
 await deleteMarketplaceListings(orgId, ids);
 setListings((prev: unknown) => prev.filter((listing) => !ids.includes(listing.id)));
 setSelectedIds((prev: unknown) => prev.filter((id) => !ids.includes(id)));
 await handleRefresh();
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Failed to delete listings');
 }
 },
 [handleRefresh, orgId],
 );

 const handleExport = useCallback(
 (format: 'json' | 'csv') => {
 const data = normalizedListings;
 if (data.length === 0) return;

 if (format === 'json') {
 const blob = new Blob([JSON.stringify(data, null, 2)], {
 type: 'application/json'
 });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = `marketplace-listings-${Date.now()}.json`;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);
 return;
 }

 const headers = LISTING_FIELD_CONFIGS.map((field) => field.label);
 const csvRows = data.map((listing) =>
 LISTING_FIELD_CONFIGS.map((field) => {
 const value = field.key
 .split('.')
 .reduce<unknown>((acc, part) =>
 acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined,
 listing as unknown);
 if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
 if (value == null) return '';
 return String(value);
 }).join(','),
 );

 const csvContent = [headers.join(','), ...csvRows].join('\n');
 const blob = new Blob([csvContent], { type: 'text/csv' });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = `marketplace-listings-${Date.now()}.csv`;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);
 },
 [normalizedListings],
 );

 const handleImport = useCallback(
 async (file: File) => {
 try {
 const text = await file.text();
 const imported = JSON.parse(text) as UpsertListingDto[];
 await Promise.all(
 imported.map((payload) => createMarketplaceListing(orgId, payload)),
 );
 await handleRefresh();
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Failed to import listings');
 }
 },
 [handleRefresh, orgId],
 );

 const openVendorDrawer = useCallback((vendorId: string | null | undefined) => {
 if (!vendorId) return;
 setVendorDrawerVendorId(vendorId);
 setVendorDrawerOpen(true);
 }, []);

 const handleRowClick = useCallback(
 (record: MarketplaceListing) => {
 openEditDrawer(record);
 },
 [openEditDrawer],
 );

 const dataViewConfig = useMemo<DataViewConfig>(
 () => ({
 id: 'marketplace-listings-view',
 name: t('listings.title'),
 fields: LISTING_FIELD_CONFIGS,
 data: normalizedListings,
 loading,
 error: error ?? undefined,
 viewType: viewMode,
 defaultView: 'grid',
 onViewChange: handleViewChange,
 selectedItems: selectedIds,
 onSelectionChange: handleSelectionChange,
 onSearch: handleSearch,
 onFilter: handleFilter,
 onSort: handleSort,
 onRefresh: handleRefresh,
 onExport: handleExport,
 onImport: handleImport,
 onCreate: openCreateDrawer,
 onEdit: (record) => openEditDrawer(record as MarketplaceListing),
 onView: (record) => openEditDrawer(record as MarketplaceListing),
 onDelete: handleDelete,
 bulkActions: [
 {
 id: 'delete',
 label: t('actions.deleteSelected'),
 onClick: handleDelete,
 variant: 'destructive'
 },
 ],
 actions: [
 {
 id: 'view-vendor',
 label: t('actions.viewVendor'),
 onClick: (record) =>
 openVendorDrawer((record as MarketplaceListing).creator?.id ?? null),
 show: (record) => Boolean((record as MarketplaceListing).creator?.id)
 },
 ]
 }),
 [
 error,
 handleDelete,
 handleExport,
 handleFilter,
 handleImport,
 handleRefresh,
 handleSearch,
 handleSelectionChange,
 handleSort,
 handleViewChange,
 loading,
 normalizedListings,
 openCreateDrawer,
 openEditDrawer,
 openVendorDrawer,
 selectedIds,
 t,
 viewMode,
 ],
 );

 return (
 <StateManagerProvider>
 <div className="stack-lg h-full">
 <MarketplaceDashboard
 stats={stats}
 loading={loading}
 onRefresh={handleRefresh}
 />

 <DataViewProvider config={dataViewConfig}>
 <div className="flex items-center justify-between">
 <ViewSwitcher />
 <div className="flex items-center gap-sm">
 <DataActions />
 <Button onClick={openCreateDrawer} className="flex items-center gap-xs">
 {t('actions.createListing')}
 </Button>
 </div>
 </div>

 <div className="flex-1 min-h-0">
 {viewMode === 'grid' && <DataGrid />}

 {viewMode === 'kanban' && (
 <KanbanBoard
 columns={[
 { id: 'draft', title: t('status.draft') },
 { id: 'active', title: t('status.active') },
 { id: 'archived', title: t('status.archived') },
 ]}
 statusField="status"
 titleField="title"
 />
 )}

 {viewMode === 'calendar' && (
 <CalendarView
 startDateField="availability.startDate"
 endDateField="availability.endDate"
 titleField="title"
 />
 )}

 {viewMode === 'list' && (
 <ListView titleField="title" subtitleField="status" />
 )}

 {viewMode === 'timeline' && (
 <TimelineView startDateField="created_at" endDateField="expires_at" titleField="title" />
 )}

 {viewMode === 'dashboard' && <DashboardView />}
 </div>
 </DataViewProvider>

 <CreateListingDrawer
 open={isCreateDrawerOpen}
 loading={createLoading}
 onClose={closeCreateDrawer}
 onSubmit={handleCreateSubmit}
 />

 <EditListingDrawer
 open={isEditDrawerOpen}
 listing={activeListing}
 loading={editLoading}
 onClose={closeEditDrawer}
 onSubmit={handleEditSubmit}
 />

 <VendorProfileDrawer
 orgId={orgId}
 vendorId={vendorDrawerVendorId}
 open={vendorDrawerOpen}
 onClose={() => setVendorDrawerOpen(false)}
 />
 </div>
 </StateManagerProvider>
 );
}
