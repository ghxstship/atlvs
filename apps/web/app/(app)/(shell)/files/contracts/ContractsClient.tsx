'use client';

import { FileText, Plus, Filter, Download, Upload, AlertTriangle, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
 DataViewProvider, 
 StateManagerProvider, 
 ViewSwitcher, 
 DataActions,
 Drawer,
 DataViews,
 GridView,
 ListView,
 KanbanView,
 CalendarView,
 TimelineView,
 DashboardView
} from '@ghxstship/ui';
import { Button } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';

import { contractsService } from './lib/contracts-service';
import { 
 CONTRACT_FIELD_CONFIGS,
 getContractFieldConfigsForView,
 getDefaultContractSort,
 CONTRACT_STATUS_COLUMNS,
 CONTRACT_TYPE_OPTIONS,
 CONTRACT_STATUS_OPTIONS,
 CONTRACT_PRIORITY_OPTIONS
} from '../lib/field-config';
import type { 
 ContractAsset, 
 ContractFilters, 
 ContractStats,
 CreateContractData,
 UpdateContractData
} from './types';

interface ContractsClientProps {
 initialFilters?: Partial<ContractFilters>;
 defaultView?: 'grid' | 'list' | 'kanban' | 'calendar' | 'timeline' | 'dashboard';
}

export function ContractsClient({ 
 initialFilters = {}, 
 defaultView = 'grid' 
}: ContractsClientProps) {
 const router = useRouter();
 const searchParams = useSearchParams();
 
 // State management
 const [contracts, setContracts] = useState<ContractAsset[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [stats, setStats] = useState<ContractStats | null>(null);
 const [filters, setFilters] = useState<ContractFilters>(initialFilters);
 const [selectedContracts, setSelectedContracts] = useState<string[]>([]);
 const [currentView, setCurrentView] = useState(defaultView);
 
 // Drawer state
 const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
 const [editDrawerOpen, setEditDrawerOpen] = useState(false);
 const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
 const [selectedContract, setSelectedContract] = useState<ContractAsset | null>(null);

 // Load contracts data
 const loadContracts = useCallback(async () => {
 try {
 setLoading(true);
 setError(null);

 const response = await contractsService.getContracts(undefined, {
 filters,
 page: 1,
 perPage: 100
 });

 if (response.data) {
 setContracts(response.data.data);
 }
 } catch (err) {
 console.error('Failed to load contracts:', err);
 setError('Failed to load contracts');
 } finally {
 setLoading(false);
 }
 }, [filters]);

 // Load contract statistics
 const loadStats = useCallback(async () => {
 try {
 const contractStats = await contractsService.getContractStats();
 setStats(contractStats);
 } catch (err) {
 console.error('Failed to load contract stats:', err);
 }
 }, []);

 // Load data on mount and filter changes
 useEffect(() => {
 loadContracts();
 loadStats();
 }, [loadContracts, loadStats]);

 // Handle contract creation
 const handleCreateContract = async (data: CreateContractData) => {
 try {
 const newContract = await contractsService.createContract(data);
 setContracts(prev => [newContract, ...prev]);
 setCreateDrawerOpen(false);
 
 // Refresh stats
 loadStats();
 } catch (err) {
 console.error('Failed to create contract:', err);
 throw err;
 }
 };

 // Handle contract update
 const handleUpdateContract = async (data: UpdateContractData) => {
 try {
 const updatedContract = await contractsService.updateContract(data);
 setContracts(prev => 
 prev.map(contract => 
 contract.id === updatedContract.id ? updatedContract : contract
 )
 );
 setEditDrawerOpen(false);
 setSelectedContract(null);
 
 // Refresh stats
 loadStats();
 } catch (err) {
 console.error('Failed to update contract:', err);
 throw err;
 }
 };

 // Handle contract deletion
 const handleDeleteContract = async (contractId: string) => {
 try {
 await contractsService.deleteResource(contractId);
 setContracts(prev => prev.filter(contract => contract.id !== contractId));
 
 // Refresh stats
 loadStats();
 } catch (err) {
 console.error('Failed to delete contract:', err);
 throw err;
 }
 };

 // Handle contract actions
 const handleActivateContract = async (contract: ContractAsset) => {
 try {
 const updatedContract = await contractsService.activateContract(contract.id);
 setContracts(prev => 
 prev.map(c => c.id === contract.id ? updatedContract : c)
 );
 loadStats();
 } catch (err) {
 console.error('Failed to activate contract:', err);
 }
 };

 const handleTerminateContract = async (contract: ContractAsset, reason?: string) => {
 try {
 const updatedContract = await contractsService.terminateContract(contract.id, reason);
 setContracts(prev => 
 prev.map(c => c.id === contract.id ? updatedContract : c)
 );
 loadStats();
 } catch (err) {
 console.error('Failed to terminate contract:', err);
 }
 };

 const handleRenewContract = async (contract: ContractAsset, newEndDate: string) => {
 try {
 const updatedContract = await contractsService.renewContract(contract.id, newEndDate);
 setContracts(prev => 
 prev.map(c => c.id === contract.id ? updatedContract : c)
 );
 loadStats();
 } catch (err) {
 console.error('Failed to renew contract:', err);
 }
 };

 // Handle bulk actions
 const handleBulkApprove = async () => {
 try {
 await contractsService.bulkUpdateContractStatus(selectedContracts, 'active');
 setSelectedContracts([]);
 loadContracts();
 loadStats();
 } catch (err) {
 console.error('Failed to bulk approve contracts:', err);
 }
 };

 const handleBulkTerminate = async () => {
 try {
 await contractsService.bulkUpdateContractStatus(selectedContracts, 'terminated');
 setSelectedContracts([]);
 loadContracts();
 loadStats();
 } catch (err) {
 console.error('Failed to bulk terminate contracts:', err);
 }
 };

 const handleBulkDelete = async () => {
 try {
 await contractsService.bulkDeleteContracts(selectedContracts);
 setSelectedContracts([]);
 loadContracts();
 loadStats();
 } catch (err) {
 console.error('Failed to bulk delete contracts:', err);
 }
 };

 // Handle export
 const handleExport = async (format: 'csv' | 'json') => {
 try {
 const contractsToExport = selectedContracts.length > 0 
 ? contracts.filter(c => selectedContracts.includes(c.id))
 : contracts;
 
 // Implementation would depend on your export service
 } catch (err) {
 console.error('Failed to export contracts:', err);
 }
 };

 // Handle import
 const handleImport = async (file: File) => {
 try {
 // Implementation would depend on your import service
 } catch (err) {
 console.error('Failed to import contracts:', err);
 }
 };

 // Contract actions configuration
 const contractActions = [
 {
 label: 'View Details',
 icon: FileText,
 onClick: (contract: ContractAsset) => {
 setSelectedContract(contract);
 setViewDrawerOpen(true);
 }
 },
 {
 label: 'Edit Contract',
 icon: 'Edit',
 onClick: (contract: ContractAsset) => {
 setSelectedContract(contract);
 setEditDrawerOpen(true);
 }
 },
 {
 label: 'Activate',
 icon: CheckCircle,
 onClick: handleActivateContract,
 disabled: (contract: ContractAsset) => 
 contract.contract_metadata.contract_status !== 'draft'
 },
 {
 label: 'Terminate',
 icon: XCircle,
 onClick: (contract: ContractAsset) => handleTerminateContract(contract),
 disabled: (contract: ContractAsset) => 
 ['terminated', 'completed', 'expired'].includes(contract.contract_metadata.contract_status)
 },
 {
 label: 'Renew',
 icon: RefreshCw,
 onClick: (contract: ContractAsset) => {
 const newEndDate = new Date();
 newEndDate.setFullYear(newEndDate.getFullYear() + 1);
 handleRenewContract(contract, newEndDate.toISOString());
 },
 disabled: (contract: ContractAsset) => 
 !['active', 'expired'].includes(contract.contract_metadata.contract_status)
 }
 ];

 // Bulk actions configuration
 const bulkActions = [
 {
 label: 'Bulk Approve',
 icon: CheckCircle,
 onClick: handleBulkApprove,
 variant: 'default' as const
 },
 {
 label: 'Bulk Terminate',
 icon: XCircle,
 onClick: handleBulkTerminate,
 variant: 'destructive' as const
 },
 {
 label: 'Bulk Delete',
 icon: 'Trash',
 onClick: handleBulkDelete,
 variant: 'destructive' as const
 }
 ];

 // Get field configuration for current view
 const fieldConfig = getContractFieldConfigsForView(currentView as unknown);
 const defaultSort = getDefaultContractSort(currentView as unknown);

 return (
 <div className="space-y-md">
 {/* Contract Statistics Dashboard */}
 {stats && (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-xs">
 <CardTitle className="text-body-sm font-medium">Total Contracts</CardTitle>
 <FileText className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-display-xs font-bold">{stats.total}</div>
 <p className="text-caption text-muted-foreground">
 {stats.active_contracts} active
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-xs">
 <CardTitle className="text-body-sm font-medium">Contract Value</CardTitle>
 <div className="text-muted-foreground">$</div>
 </CardHeader>
 <CardContent>
 <div className="text-display-xs font-bold">
 ${stats.total_value.toLocaleString()}
 </div>
 <p className="text-caption text-muted-foreground">
 Avg: ${Math.round(stats.average_contract_value).toLocaleString()}
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-xs">
 <CardTitle className="text-body-sm font-medium">Expiring Soon</CardTitle>
 <AlertTriangle className="h-4 w-4 text-warning" />
 </CardHeader>
 <CardContent>
 <div className="text-display-xs font-bold text-warning">
 {stats.expiring_contracts}
 </div>
 <p className="text-caption text-muted-foreground">
 Within 30 days
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-xs">
 <CardTitle className="text-body-sm font-medium">Pending Actions</CardTitle>
 <Clock className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-display-xs font-bold">
 {stats.pending_approvals + stats.pending_signatures}
 </div>
 <p className="text-caption text-muted-foreground">
 {stats.pending_approvals} approvals, {stats.pending_signatures} signatures
 </p>
 </CardContent>
 </Card>
 </div>
 )}

 {/* ATLVS DataViews Integration */}
 <DataViewProvider
 data={contracts}
 fieldConfig={fieldConfig}
 defaultView={currentView}
 enabledViews={['grid', 'list', 'kanban', 'calendar', 'timeline', 'dashboard']}
 defaultSort={defaultSort}
 onViewChange={setCurrentView}
 >
 <StateManagerProvider
 loading={loading}
 error={error}
 emptyState={{
 title: 'No contracts found',
 description: 'Create your first contract to get started with unified contract management',
 action: {
 label: 'Create Contract',
 onClick: () => setCreateDrawerOpen(true)
 }
 }}
 errorState={{
 title: 'Failed to load contracts',
 description: error || 'There was an error loading your contracts',
 action: {
 label: 'Retry',
 onClick: loadContracts
 }
 }}
 >
 <div className="space-y-md">
 {/* View Controls */}
 <div className="flex items-center justify-between">
 <ViewSwitcher />
 
 <div className="flex items-center gap-xs">
 <Button
 variant="outline"
 size="sm"
 onClick={() => setCreateDrawerOpen(true)}
 >
 <Plus className="h-4 w-4 mr-xs" />
 Create Contract
 </Button>
 </div>
 </div>

 {/* Data Actions */}
 <DataActions
 selectedCount={selectedContracts.length}
 totalCount={contracts.length}
 onExport={handleExport}
 onImport={handleImport}
 bulkActions={bulkActions}
 filters={filters}
 onFiltersChange={setFilters}
 filterOptions={{
 contract_type: CONTRACT_TYPE_OPTIONS,
 contract_status: CONTRACT_STATUS_OPTIONS,
 contract_priority: CONTRACT_PRIORITY_OPTIONS
 }}
 />

 {/* Data Views */}
 <DataViews>
 <GridView 
 actions={contractActions}
 onSelectionChange={setSelectedContracts}
 selectedItems={selectedContracts}
 />
 <ListView 
 actions={contractActions}
 onSelectionChange={setSelectedContracts}
 selectedItems={selectedContracts}
 />
 <KanbanView 
 columns={CONTRACT_STATUS_COLUMNS}
 groupByField="contract_status"
 actions={contractActions}
 />
 <CalendarView 
 dateField="end_date"
 titleField="title"
 colorField="contract_status"
 actions={contractActions}
 />
 <TimelineView 
 startDateField="start_date"
 endDateField="end_date"
 titleField="title"
 actions={contractActions}
 />
 <DashboardView 
 stats={stats}
 chartData={{
 contractsByType: Object.entries(stats?.by_type || {}).map(([type, count]) => ({
 name: type,
 value: count
 })),
 contractsByStatus: Object.entries(stats?.by_status || {}).map(([status, count]) => ({
 name: status,
 value: count
 }))
 }}
 />
 </DataViews>
 </div>
 </StateManagerProvider>
 </DataViewProvider>

 {/* Drawers */}
 <Drawer
 open={createDrawerOpen}
 onClose={() => setCreateDrawerOpen(false)}
 title="Create New Contract"
 size="lg"
 >
 {/* CreateContractForm would go here */}
 <div className="p-md">
 <p>Contract creation form will be implemented in the next phase</p>
 </div>
 </Drawer>

 <Drawer
 open={editDrawerOpen}
 onClose={() => {
 setEditDrawerOpen(false);
 setSelectedContract(null);
 }}
 title="Edit Contract"
 size="lg"
 >
 {/* EditContractForm would go here */}
 <div className="p-md">
 <p>Contract editing form will be implemented in the next phase</p>
 </div>
 </Drawer>

 <Drawer
 open={viewDrawerOpen}
 onClose={() => {
 setViewDrawerOpen(false);
 setSelectedContract(null);
 }}
 title={selectedContract?.title || 'Contract Details'}
 size="lg"
 >
 {/* ContractDetailsView would go here */}
 {selectedContract && (
 <div className="p-md space-y-md">
 <div>
 <h3 className="text-body-lg font-semibold">Contract Information</h3>
 <div className="mt-xs space-y-xs">
 <div className="flex justify-between">
 <span className="text-muted-foreground">Type:</span>
 <Badge variant="outline">
 {selectedContract.contract_metadata.contract_type}
 </Badge>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Status:</span>
 <Badge 
 variant={
 selectedContract.contract_metadata.contract_status === 'active' ? 'success' :
 selectedContract.contract_metadata.contract_status === 'terminated' ? 'destructive' :
 'secondary'
 }
 >
 {selectedContract.contract_metadata.contract_status}
 </Badge>
 </div>
 {selectedContract.contract_metadata.contract_value && (
 <div className="flex justify-between">
 <span className="text-muted-foreground">Value:</span>
 <span>
 {selectedContract.contract_metadata.currency || '$'}
 {selectedContract.contract_metadata.contract_value.toLocaleString()}
 </span>
 </div>
 )}
 <div className="flex justify-between">
 <span className="text-muted-foreground">Related to:</span>
 <span>{selectedContract.contract_metadata.related_entity_name}</span>
 </div>
 </div>
 </div>
 </div>
 )}
 </Drawer>
 </div>
 );
}
