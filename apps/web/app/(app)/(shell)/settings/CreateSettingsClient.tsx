'use client';
import {
 User,
 FileText,
 Settings,
 Award,
 Calendar,
 TrendingUp,
 Activity,
 Clock,
 Plus,
 Search,
 Play,
 Trash2,
 RefreshCw,
 Download
} from "lucide-react";
import { useState, useEffect, useCallback } from 'react';
import { Button, useToastContext } from '@ghxstship/ui';
import type { 
 SettingRecord, 
 SettingsFieldConfig,
 SettingsStatistics,
 SettingsSearchParams,
 SettingCategory,
 SettingsFormData
} from './types';
import { settingsService } from './lib/settings-service';
import SettingsGridView from './views/SettingsGridView';
import SettingsListView from './views/SettingsListView';
import SettingsKanbanView from './views/SettingsKanbanView';
import CreateSettingsDrawer from './drawers/CreateSettingsDrawer';
import EditSettingsDrawer from './drawers/EditSettingsDrawer';

const fieldConfig: SettingsFieldConfig[] = [
 {
 key: 'id',
 label: 'ID',
 type: 'text',
 width: 100,
 sortable: true,
 filterable: false
 },
 {
 key: 'name',
 label: 'Setting Name',
 type: 'text',
 width: 200,
 sortable: true,
 filterable: true,
 required: true
 },
 {
 key: 'category',
 label: 'Category',
 type: 'select',
 width: 150,
 sortable: true,
 filterable: true,
 options: [
 { value: 'organization', label: 'Organization' },
 { value: 'security', label: 'Security' },
 { value: 'notifications', label: 'Notifications' },
 { value: 'integrations', label: 'Integrations' },
 { value: 'billing', label: 'Billing' },
 { value: 'permissions', label: 'Permissions' },
 { value: 'automations', label: 'Automations' },
 { value: 'compliance', label: 'Compliance' },
 { value: 'backup', label: 'Backup' },
 ]
 },
 {
 key: 'value',
 label: 'Value',
 type: 'text',
 width: 250,
 sortable: true,
 filterable: true
 },
 {
 key: 'description',
 label: 'Description',
 type: 'textarea',
 width: 300,
 sortable: false,
 filterable: true
 },
 {
 key: 'type',
 label: 'Type',
 type: 'select',
 width: 120,
 sortable: true,
 filterable: true,
 options: [
 { value: 'string', label: 'String' },
 { value: 'number', label: 'Number' },
 { value: 'boolean', label: 'Boolean' },
 { value: 'json', label: 'JSON' },
 { value: 'array', label: 'Array' },
 ]
 },
 {
 key: 'is_public',
 label: 'Public',
 type: 'select',
 width: 100,
 sortable: true,
 filterable: true,
 options: [
 { value: 'true', label: 'Yes' },
 { value: 'false', label: 'No' },
 ]
 },
 {
 key: 'is_editable',
 label: 'Editable',
 type: 'select',
 width: 100,
 sortable: true,
 filterable: true,
 options: [
 { value: 'true', label: 'Yes' },
 { value: 'false', label: 'No' },
 ]
 },
 {
 key: 'created_at',
 label: 'Created',
 type: 'date',
 width: 150,
 sortable: true,
 filterable: true
 },
 {
 key: 'updated_at',
 label: 'Updated',
 type: 'date',
 width: 150,
 sortable: true,
 filterable: true
 },
];

interface CreateSettingsClientProps {
 orgId: string;
 userId: string;
}

export default function CreateSettingsClient({ orgId, userId }: CreateSettingsClientProps) {
 const { toast } = useToastContext();
 
 // State management
 const [settings, setSettings] = useState<SettingRecord[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [selectedSettings, setSelectedSettings] = useState<string[]>([]);
 const [statistics, setStatistics] = useState<SettingsStatistics | null>(null);
 
 // View state
 const [currentView, setCurrentView] = useState<'grid' | 'list' | 'kanban'>('grid');
 const [searchParams, setSearchParams] = useState<SettingsSearchParams>({});
 
 // Drawer state
 const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
 const [editDrawerOpen, setEditDrawerOpen] = useState(false);
 const [editingSetting, setEditingSetting] = useState<SettingRecord | null>(null);
 const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create');

 useEffect(() => {
 setSelectedSettings([]);
 }, [currentView]);

 // Load settings data
 const loadSettings = useCallback(async (params?: SettingsSearchParams) => {
 try {
 setLoading(true);
 setError(null);
 const data = await settingsService.getSettings(params);
 setSettings(data);
 } catch (err) {
 const message = err instanceof Error ? err.message : 'Failed to load settings';
 setError(message);
 toast.error(message);
 } finally {
 setLoading(false);
 }
 }, [toast]);

 // Load statistics
 const loadStatistics = useCallback(async () => {
 try {
 const stats = await settingsService.getStatistics();
 setStatistics(stats);
 } catch (err) {
 console.error('Failed to load statistics:', err);
 }
 }, []);

 // Initial data load
 useEffect(() => {
 loadSettings();
 loadStatistics();
 }, [loadSettings, loadStatistics]);

 // Event handlers
 const handleCreateSetting = () => {
 setDrawerMode('create');
 setCreateDrawerOpen(true);
 };

 const handleEditSetting = (setting: SettingRecord) => {
 setEditingSetting(setting);
 setDrawerMode('edit');
 setEditDrawerOpen(true);
 };

 const handleViewSetting = (setting: SettingRecord) => {
 setEditingSetting(setting);
 setDrawerMode('view');
 setEditDrawerOpen(true);
 };

 const handleDeleteSetting = async (id: string) => {
 try {
 await settingsService.deleteSetting(id);
 toast.success('Setting deleted successfully');
 await loadSettings(searchParams);
 await loadStatistics();
 } catch (err) {
 const message = err instanceof Error ? err.message : 'Failed to delete setting';
 toast.error(message);
 }
 };

 const handleSaveSetting = async (data: SettingsFormData) => {
 if (!editingSetting) return;
 
 try {
 await settingsService.updateSetting(editingSetting.id, data);
 await loadSettings(searchParams);
 await loadStatistics();
 } catch (err) {
 throw err; // Re-throw to be handled by the drawer
 }
 };

 const handleMoveSetting = async (settingId: string, newCategory: SettingCategory) => {
 try {
 await settingsService.updateSetting(settingId, { category: newCategory });
 toast.success('Setting moved successfully');
 await loadSettings(searchParams);
 } catch (err) {
 const message = err instanceof Error ? err.message : 'Failed to move setting';
 toast.error(message);
 }
 };

 const handleExport = async (format: 'csv' | 'json') => {
 try {
 const blob = await settingsService.exportSettings({
 format,
 includeMetadata: true,
 categories: searchParams.category ? [searchParams.category] : undefined
 });

 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `settings-export.${format}`;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);

 toast.success(`Settings exported as ${format.toUpperCase()}`);
 } catch (err) {
 const message = err instanceof Error ? err.message : 'Failed to export settings';
 toast.error(message);
 }
 };

 const handleRefresh = async () => {
 await loadSettings(searchParams);
 await loadStatistics();
 };

 const handleSearchChange = (value: string) => {
 const params = { ...searchParams, query: value || undefined };
 setSearchParams(params);
 void loadSettings(params);
 };

 const handleCategoryFilter = (value: SettingCategory | 'all') => {
 const params = {
 ...searchParams,
 category: value === 'all' ? undefined : value
 };
 setSearchParams(params);
 void loadSettings(params);
 };

 const viewOptions: Array<{ id: 'grid' | 'list' | 'kanban'; label: string }> = [
 { id: 'grid', label: 'Grid' },
 { id: 'list', label: 'List' },
 { id: 'kanban', label: 'Kanban' },
 ];

 // Render current view
 const renderCurrentView = () => {
 switch (currentView) {
 case 'grid':
 return (
 <SettingsGridView
 settings={settings}
 loading={loading}
 onEdit={handleEditSetting}
 onDelete={(id) => {
 void handleDeleteSetting(id);
 }}
 onSelect={setSelectedSettings}
 selectedIds={selectedSettings}
 />
 );
 case 'list':
 return (
 <SettingsListView
 settings={settings}
 loading={loading}
 onEdit={handleEditSetting}
 onView={handleViewSetting}
 />
 );
 case 'kanban':
 return (
 <SettingsKanbanView
 settings={settings}
 loading={loading}
 onEdit={handleEditSetting}
 onMove={(id, category) => {
 void handleMoveSetting(id, category);
 }}
 />
 );
 default:
 return null;
 }
 };

 if (error) {
 return (
 <div className="flex items-center justify-center h-container-lg">
 <div className="text-center">
 <p className="text-destructive mb-4">{error}</p>
 <Button onClick={() => loadSettings()}>
 <RefreshCw className="h-icon-xs w-icon-xs mr-2" />
 Retry
 </Button>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold">Settings Management</h1>
 <p className="text-muted-foreground mt-1">
 Manage your organization&apos;s configuration settings and preferences
 </p>
 </div>
 <div className="flex items-center gap-sm">
 <Button variant="outline" onClick={handleRefresh} disabled={loading}>
 <RefreshCw className="h-icon-xs w-icon-xs mr-2" />
 Refresh
 </Button>
 <Button variant="outline" onClick={() => handleExport('csv')}>
 <Download className="h-icon-xs w-icon-xs mr-2" />
 Export
 </Button>
 <Button onClick={handleCreateSetting}>
 <Plus className="h-icon-xs w-icon-xs mr-2" />
 Create Setting
 </Button>
 </div>
 </div>

 {/* Statistics */}
 {statistics && (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 <div className="bg-card p-md rounded-lg border">
 <div className="text-2xl font-bold">{statistics.totalSettings}</div>
 <div className="text-sm text-muted-foreground">Total Settings</div>
 </div>
 <div className="bg-card p-md rounded-lg border">
 <div className="text-2xl font-bold">{statistics.publicSettings}</div>
 <div className="text-sm text-muted-foreground">Public Settings</div>
 </div>
 <div className="bg-card p-md rounded-lg border">
 <div className="text-2xl font-bold">{statistics.editableSettings}</div>
 <div className="text-sm text-muted-foreground">Editable Settings</div>
 </div>
 <div className="bg-card p-md rounded-lg border">
 <div className="text-2xl font-bold">{statistics.recentlyUpdated}</div>
 <div className="text-sm text-muted-foreground">Updated This Week</div>
 </div>
 </div>
 )}

 {/* View Controls */}
 <div className="flex items-center justify-between gap-md flex-wrap">
 <div className="flex flex-1 items-center gap-xs">
 <div className="relative flex-1 min-w-content-narrow">
 <Search className="absolute left-3 top-xs/2 h-icon-xs w-icon-xs -translate-y-1/2 text-muted-foreground" />
 <input
 type="text"
 placeholder="Search settings..."
 value={searchParams.query ?? ''}
 onChange={(event) => handleSearchChange(event.target.value)}
 className="w-full rounded-md border border-border bg-background py-xs pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
 />
 </div>
 <select
 value={searchParams.category ?? 'all'}
 onChange={(event) => handleCategoryFilter(event.target.value as SettingCategory | 'all')}
 className="rounded-md border border-border bg-background px-sm py-xs text-sm outline-none focus:ring-2 focus:ring-primary"
 >
 <option value="all">All Categories</option>
 {fieldConfig
 .find((field) => field.key === 'category')
 ?.options?.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </select>
 </div>
 <div className="flex items-center gap-xs rounded-lg border p-xs bg-muted">
 {viewOptions.map((option) => (
 <button
 key={option.id}
 type="button"
 onClick={() => setCurrentView(option.id)}
 className={`px-sm py-xs text-sm rounded-md transition-colors ${
 currentView === option.id
 ? 'bg-background text-foreground shadow-sm'
 : 'text-muted-foreground hover:text-foreground'
 }`}
 >
 {option.label}
 </button>
 ))}
 </div>
 <div className="flex items-center gap-xs">
 <Button
 variant="outline"
 disabled={!selectedSettings.length}
 onClick={() => {
 if (!selectedSettings.length) return;
 if (!window.confirm(`Delete ${selectedSettings.length} settings?`)) return;
 Promise.all(selectedSettings.map((id) => settingsService.deleteSetting(id)))
 .then(async () => {
 toast.success(`Deleted ${selectedSettings.length} settings`);
 setSelectedSettings([]);
 await loadSettings(searchParams);
 await loadStatistics();
 })
 .catch(() => {
 toast.error('Failed to delete some settings');
 });
 }}
 >
 <Trash2 className="h-icon-xs w-icon-xs mr-2" />
 Delete Selected
 </Button>
 <Button
 variant="outline"
 disabled={!selectedSettings.length}
 onClick={() => handleExport('csv')}
 >
 <Download className="h-icon-xs w-icon-xs mr-2" />
 Export Selected
 </Button>
 </div>
 </div>

 {renderCurrentView()}

 {/* Drawers */}
 <CreateSettingsDrawer
 isOpen={createDrawerOpen}
 onClose={() => setCreateDrawerOpen(false)}
 onSuccess={() => {
 void loadSettings(searchParams);
 void loadStatistics();
 }}
 />

 <EditSettingsDrawer
 mode={drawerMode}
 setting={editingSetting ?? undefined}
 isOpen={editDrawerOpen}
 onClose={() => {
 setEditDrawerOpen(false);
 setEditingSetting(null);
 }}
 onSave={handleSaveSetting}
 onDelete={(id) => handleDeleteSetting(id)}
 />
 </div>
 );
}
