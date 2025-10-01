'use client';

import { Users, UserPlus, Mail, Shield, RefreshCw, Download, Settings } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
 DataViewProvider,
 StateManagerProvider,
 Button,
 useToastContext,
 Tabs,
 TabsContent,
 TabsList,
 TabsTrigger,
 Card,
 CardContent,
 Badge,
} from '@ghxstship/ui';
import type { 
 TeamRecord, 
 TeamViewConfig, 
 TeamFieldConfig,
 TeamStatistics,
 TeamSearchParams,
 TeamsClientProps,
 ROLE_CONFIGS,
} from './types';
import { teamsService } from './lib/teams-service';

// Field configuration for ATLVS DataViews
const fieldConfig: TeamFieldConfig[] = [
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
 label: 'Name',
 type: 'text',
 width: 200,
 sortable: true,
 filterable: true,
 required: true
 },
 {
 key: 'email',
 label: 'Email',
 type: 'text',
 width: 250,
 sortable: true,
 filterable: true,
 required: true
 },
 {
 key: 'role',
 label: 'Role',
 type: 'select',
 width: 120,
 sortable: true,
 filterable: true,
 options: [
 { value: 'owner', label: 'Owner' },
 { value: 'admin', label: 'Admin' },
 { value: 'manager', label: 'Manager' },
 { value: 'member', label: 'Member' },
 { value: 'viewer', label: 'Viewer' }
 ]
 },
 {
 key: 'status',
 label: 'Status',
 type: 'select',
 width: 100,
 sortable: true,
 filterable: true,
 options: [
 { value: 'active', label: 'Active' },
 { value: 'inactive', label: 'Inactive' },
 { value: 'suspended', label: 'Suspended' },
 { value: 'pending', label: 'Pending' }
 ]
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
 key: 'category',
 label: 'Category',
 type: 'select',
 width: 120,
 sortable: true,
 filterable: true,
 options: [
 { value: 'members', label: 'Members' },
 { value: 'invitations', label: 'Invitations' },
 { value: 'roles', label: 'Roles' },
 { value: 'permissions', label: 'Permissions' }
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
 }
];

export default function TeamsClient({ userId, orgId }: TeamsClientProps) {
 const { toast } = useToastContext();
 
 // State management
 const [records, setRecords] = useState<TeamRecord[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
 const [statistics, setStatistics] = useState<TeamStatistics | null>(null);
 
 // View state
 const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
 const [searchParams, setSearchParams] = useState<TeamSearchParams>({});
 const [activeTab, setActiveTab] = useState('overview');

 // Load team records
 const loadRecords = useCallback(async (params?: TeamSearchParams) => {
 try {
 setLoading(true);
 setError(null);
 const data = await teamsService.getTeamRecords(params);
 setRecords(data);
 } catch (err) {
 const message = err instanceof Error ? err.message : 'Failed to load team records';
 setError(message);
 toast.error(message);
 } finally {
 setLoading(false);
 }
 }, [toast]);

 // Load statistics
 const loadStatistics = useCallback(async () => {
 try {
 const stats = await teamsService.getStatistics();
 setStatistics(stats);
 } catch (err) {
 console.error('Failed to load statistics:', err);
 }
 }, []);

 // Initial data load
 useEffect(() => {
 loadRecords();
 loadStatistics();
 }, [loadRecords, loadStatistics, handleExport]);

 // ATLVS DataViews configuration
 const dataViewConfig: TeamViewConfig = useMemo(() => ({
 id: 'teams',
 name: 'Team Management',
 viewType: currentView,
 defaultView: 'grid',
 fields: fieldConfig,
 data: records,
 onSearch: async (query: string) => {
 const params = { ...searchParams, query };
 setSearchParams(params);
 await loadRecords(params);
 },
 onFilter: async (filters: unknown) => {
 const params = { ...searchParams, ...filters };
 setSearchParams(params);
 await loadRecords(params);
 },
 onSort: async (sorts: unknown) => {
 },
 onRefresh: async () => {
 await loadRecords(searchParams);
 await loadStatistics();
 return records;
 },
 onExport: (data: unknown, format: unknown) => {
 handleExport(format);
 },
 }), [currentView, records, searchParams, loadRecords, loadStatistics, handleExport]);

 // Event handlers
 const handleExport = async (format: 'csv' | 'json') => {
 try {
 const blob = await teamsService.exportRecords({
 format,
 includeMetadata: true,
 });

 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `team-records.${format}`;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);

 toast.success(`Records exported as ${format.toUpperCase()}`);
 } catch (err) {
 const message = err instanceof Error ? err.message : 'Failed to export records';
 toast.error(message);
 }
 };

 const handleRefresh = async () => {
 await loadRecords(searchParams);
 await loadStatistics();
 };

 // View switcher component
 const ViewSwitcher = () => (
 <div className="flex items-center gap-xs">
 <Button
 variant={currentView === 'grid' ? 'default' : 'outline'}
 size="sm"
 onClick={() => setCurrentView('grid')}
 >
 Grid
 </Button>
 <Button
 variant={currentView === 'list' ? 'default' : 'outline'}
 size="sm"
 onClick={() => setCurrentView('list')}
 >
 List
 </Button>
 </div>
 );

 // Simple grid view for teams (since we're focusing on architecture completion)
 const renderTeamGrid = () => {
 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {[...Array(6)].map((_, i) => (
 <Card key={i} className="animate-pulse">
 <CardContent className="p-lg">
 <div className="h-icon-xs bg-muted rounded w-3/4 mb-2"></div>
 <div className="h-3 bg-muted rounded w-1/2"></div>
 </CardContent>
 </Card>
 ))}
 </div>
 );
 }

 const memberRecords = records.filter(r => r.type === 'member');
 const inviteRecords = records.filter(r => r.type === 'invite');

 return (
 <div className="space-y-lg">
 {/* Members Section */}
 <div>
 <h3 className="text-lg font-semibold mb-4">Team Members ({memberRecords.length})</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {memberRecords.map((record) => (
 <Card key={record.id} className="hover:shadow-md transition-shadow">
 <CardContent className="p-lg">
 <div className="flex items-start justify-between mb-3">
 <div>
 <h4 className="font-medium">{record.name}</h4>
 <p className="text-sm text-muted-foreground">{record.email}</p>
 </div>
 <Badge variant="outline">{record.role}</Badge>
 </div>
 <div className="space-y-xs">
 <div className="flex items-center justify-between text-sm">
 <span>Status:</span>
 <Badge variant={record.status === 'active' ? 'default' : 'secondary'}>
 {record.status}
 </Badge>
 </div>
 <p className="text-xs text-muted-foreground">{record.description}</p>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>

 {/* Invitations Section */}
 {inviteRecords.length > 0 && (
 <div>
 <h3 className="text-lg font-semibold mb-4">Pending Invitations ({inviteRecords.length})</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {inviteRecords.map((record) => (
 <Card key={record.id} className="hover:shadow-md transition-shadow border-dashed">
 <CardContent className="p-lg">
 <div className="flex items-start justify-between mb-3">
 <div>
 <h4 className="font-medium">{record.email}</h4>
 <p className="text-sm text-muted-foreground">Invited as {record.role}</p>
 </div>
 <Badge variant="outline">{record.status}</Badge>
 </div>
 <p className="text-xs text-muted-foreground">{record.description}</p>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 )}
 </div>
 );
 };

 if (error) {
 return (
 <div className="flex items-center justify-center h-container-lg">
 <div className="text-center">
 <p className="text-destructive mb-4">{error}</p>
 <Button onClick={() => loadRecords()}>
 <RefreshCw className="h-icon-xs w-icon-xs mr-2" />
 Retry
 </Button>
 </div>
 </div>
 );
 }

 return (
 <DataViewProvider config={dataViewConfig}>
 <StateManagerProvider>
 <div className="space-y-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold">Team Management</h1>
 <p className="text-muted-foreground mt-1">
 Manage team members, invitations, and roles
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
 <Button>
 <UserPlus className="h-icon-xs w-icon-xs mr-2" />
 Invite Member
 </Button>
 </div>
 </div>

 {/* Statistics */}
 {statistics && (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 <div className="bg-card p-md rounded-lg border">
 <div className="flex items-center gap-xs mb-2">
 <Users className="h-icon-sm w-icon-sm text-blue-600" />
 <div className="text-sm font-medium">Total Members</div>
 </div>
 <div className="text-2xl font-bold">{statistics.totalMembers}</div>
 <div className="text-xs text-muted-foreground">
 {statistics.activeMembers} active
 </div>
 </div>
 <div className="bg-card p-md rounded-lg border">
 <div className="flex items-center gap-xs mb-2">
 <Mail className="h-icon-sm w-icon-sm text-green-600" />
 <div className="text-sm font-medium">Pending Invites</div>
 </div>
 <div className="text-2xl font-bold">{statistics.pendingInvites}</div>
 <div className="text-xs text-muted-foreground">
 awaiting response
 </div>
 </div>
 <div className="bg-card p-md rounded-lg border">
 <div className="flex items-center gap-xs mb-2">
 <UserPlus className="h-icon-sm w-icon-sm text-purple-600" />
 <div className="text-sm font-medium">Recent Joins</div>
 </div>
 <div className="text-2xl font-bold">{statistics.recentJoins}</div>
 <div className="text-xs text-muted-foreground">
 last 30 days
 </div>
 </div>
 <div className="bg-card p-md rounded-lg border">
 <div className="flex items-center gap-xs mb-2">
 <Shield className="h-icon-sm w-icon-sm text-orange-600" />
 <div className="text-sm font-medium">Avg Response</div>
 </div>
 <div className="text-2xl font-bold">{statistics.averageResponseTime}h</div>
 <div className="text-xs text-muted-foreground">
 invite acceptance
 </div>
 </div>
 </div>
 )}

 {/* Tab Navigation */}
 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList className="grid w-full grid-cols-4">
 <TabsTrigger value="overview">
 <Users className="h-icon-xs w-icon-xs mr-2" />
 Overview
 </TabsTrigger>
 <TabsTrigger value="members">
 <Users className="h-icon-xs w-icon-xs mr-2" />
 Members
 </TabsTrigger>
 <TabsTrigger value="invitations">
 <Mail className="h-icon-xs w-icon-xs mr-2" />
 Invitations
 </TabsTrigger>
 <TabsTrigger value="settings">
 <Settings className="h-icon-xs w-icon-xs mr-2" />
 Settings
 </TabsTrigger>
 </TabsList>

 <TabsContent value="overview" className="space-y-md">
 {/* View Controls */}
 <div className="flex items-center justify-between">
 <ViewSwitcher />
 <div className="flex items-center gap-xs">
 {selectedRecords.length > 0 && (
 <Button variant="destructive" size="sm">
 Delete ({selectedRecords.length})
 </Button>
 )}
 </div>
 </div>

 {/* Main Content */}
 {renderTeamGrid()}
 </TabsContent>

 <TabsContent value="members" className="space-y-md">
 <div className="bg-card p-xl rounded-lg border text-center">
 <Users className="h-icon-2xl w-icon-2xl mx-auto mb-4 text-muted-foreground" />
 <h3 className="text-lg font-semibold mb-2">Team Members</h3>
 <p className="text-muted-foreground mb-4">
 Member management is available through the overview interface above.
 </p>
 <Button onClick={() => setActiveTab('overview')}>
 Go to Overview
 </Button>
 </div>
 </TabsContent>

 <TabsContent value="invitations" className="space-y-md">
 <div className="bg-card p-xl rounded-lg border text-center">
 <Mail className="h-icon-2xl w-icon-2xl mx-auto mb-4 text-muted-foreground" />
 <h3 className="text-lg font-semibold mb-2">Team Invitations</h3>
 <p className="text-muted-foreground mb-4">
 Invitation management is available through the overview interface above.
 </p>
 <Button onClick={() => setActiveTab('overview')}>
 Go to Overview
 </Button>
 </div>
 </TabsContent>

 <TabsContent value="settings" className="space-y-md">
 <div className="bg-card p-xl rounded-lg border text-center">
 <Settings className="h-icon-2xl w-icon-2xl mx-auto mb-4 text-muted-foreground" />
 <h3 className="text-lg font-semibold mb-2">Team Settings</h3>
 <p className="text-muted-foreground mb-4">
 Team settings configuration will be available in a future update.
 </p>
 <Button onClick={() => setActiveTab('overview')}>
 Go to Overview
 </Button>
 </div>
 </TabsContent>
 </Tabs>
 </div>
 </StateManagerProvider>
 </DataViewProvider>
 );
}
