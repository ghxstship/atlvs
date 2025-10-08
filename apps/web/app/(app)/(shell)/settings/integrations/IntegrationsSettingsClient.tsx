'use client';
import { Settings, Plus, Trash2, Link as LinkIcon, TestTube } from "lucide-react";
import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
 Card,
 CardHeader,
 CardTitle,
 CardContent,
 Button,
 Badge,
 Input,
 Label,
 Textarea,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Modal,
 Skeleton,
 useToastContext
} from '@ghxstship/ui';
import {
 fetchIntegrations,
 createIntegration,
 updateIntegration,
 deleteIntegration,
 testIntegration,
 type IntegrationRecord,
 type AvailableIntegration,
 type CreateIntegrationInput
} from '@/lib/services/settingsIntegrationsClient';

export default function IntegrationsSettingsClient() {
 const { toast } = useToastContext();
 const [integrations, setIntegrations] = useState<IntegrationRecord[]>([]);
 const [availableIntegrations, setAvailableIntegrations] = useState<AvailableIntegration[]>([]);
 const [loading, setLoading] = useState(true);
 const [showCreateModal, setShowCreateModal] = useState(false);
 const [editingIntegration, setEditingIntegration] = useState<IntegrationRecord | null>(null);
 const [testing, setTesting] = useState<string | null>(null);
 
 // Form state
 const [formData, setFormData] = useState<CreateIntegrationInput>({
 name: '',
 type: 'webhook',
 enabled: true,
 config: {}
 });

 const loadIntegrations = useCallback(async () => {
 try {
 setLoading(true);
 const response = await fetchIntegrations();
 setIntegrations(response.integrations);
 setAvailableIntegrations(response.availableIntegrations);
 } catch (error) {
 console.error('Error loading integrations:', error);
 toast.error('Failed to load integrations');
 } finally {
 setLoading(false);
 }
 }, [toast]);

 useEffect(() => {
 void loadIntegrations();
 }, [loadIntegrations]);

 const handleCreate = useCallback(async () => {
 try {
 const response = await createIntegration(formData);
 toast.success('Integration created successfully');
 setShowCreateModal(false);
 setFormData({ name: '', type: 'webhook', enabled: true, config: {} });
 await loadIntegrations();
 } catch (error) {
 console.error('Error creating integration:', error);
 toast.error('Failed to create integration');
 }
 }, [formData, loadIntegrations, toast]);

 const handleUpdate = useCallback(async (integration: IntegrationRecord) => {
 try {
 await updateIntegration({
 id: integration.id,
 enabled: !integration.enabled
 });
 toast.success('Integration updated');
 await loadIntegrations();
 } catch (error) {
 console.error('Error updating integration:', error);
 toast.error('Failed to update integration');
 }
 }, [loadIntegrations, toast]);

 const handleDelete = useCallback(async (id: string) => {
 if (!window.confirm('Are you sure you want to delete this integration?')) return;
 
 try {
 await deleteIntegration(id);
 toast.success('Integration deleted');
 await loadIntegrations();
 } catch (error) {
 console.error('Error deleting integration:', error);
 toast.error('Failed to delete integration');
 }
 }, [loadIntegrations, toast]);

 const handleTest = useCallback(async (id: string) => {
 try {
 setTesting(id);
 const response = await testIntegration({ integrationId: id });
 if (response.success) {
 toast.success(response.message);
 } else {
 toast.error(response.message);
 }
 } catch (error) {
 console.error('Error testing integration:', error);
 toast.error('Failed to test integration');
 } finally {
 setTesting(null);
 }
 }, [toast]);

 const getIntegrationIcon = (type: string) => {
 switch (type) {
 case 'webhook':
 return <LinkIcon className="h-icon-xs w-icon-xs" />;
 case 'api':
 return <Settings className="h-icon-xs w-icon-xs" />;
 default:
 return <LinkIcon className="h-icon-xs w-icon-xs" />;
 }
 };

 if (loading) {
 return (
 <div className="space-y-md">
 <Skeleton className="h-icon-2xl w-container-xs" />
 <div className="space-y-sm">
 <Skeleton className="h-component-xl w-full" />
 <Skeleton className="h-component-xl w-full" />
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-lg">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold">Integrations</h1>
 <p className="text-muted-foreground mt-1">
 Connect third-party services and configure API access
 </p>
 </div>
 <Button onClick={() => setShowCreateModal(true)}>
 <Plus className="h-icon-xs w-icon-xs mr-2" />
 Add Integration
 </Button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {integrations.map((integration) => (
 <Card key={integration.id}>
 <CardHeader className="flex flex-row items-start justify-between space-y-0">
 <div className="flex items-center gap-sm">
 {getIntegrationIcon(integration.type)}
 <div>
 <CardTitle className="text-lg">{integration.name}</CardTitle>
 <p className="text-sm text-muted-foreground capitalize">{integration.type}</p>
 </div>
 </div>
 <Badge variant={integration.enabled ? 'success' : 'secondary'}>
 {integration.enabled ? 'Active' : 'Inactive'}
 </Badge>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {integration.last_sync && (
 <p className="text-xs text-muted-foreground">
 Last sync: {new Date(integration.last_sync).toLocaleString()}
 </p>
 )}
 <div className="flex gap-xs">
 <Button
 variant="outline"
 size="sm"
 onClick={() => handleTest(integration.id)}
 disabled={testing === integration.id}
 >
 <TestTube className="h-3 w-3 mr-1" />
 {testing === integration.id ? 'Testing...' : 'Test'}
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => handleUpdate(integration)}
 >
 {integration.enabled ? 'Disable' : 'Enable'}
 </Button>
 <Button
 variant="destructive"
 size="sm"
 onClick={() => handleDelete(integration.id)}
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 </div>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>

 {integrations.length === 0 && (
 <Card>
 <CardContent className="py-lg text-center">
 <p className="text-muted-foreground mb-md">No integrations configured yet</p>
 <Button onClick={() => setShowCreateModal(true)}>
 <Plus className="h-icon-xs w-icon-xs mr-2" />
 Add Your First Integration
 </Button>
 </CardContent>
 </Card>
 )}

 <Modal
 open={showCreateModal}
 onClose={() => setShowCreateModal(false)}
 title="Add Integration"
 description="Configure a new integration with external services"
 >
 <div className="space-y-md">
 <div className="space-y-sm">
 <Label htmlFor="name">Name</Label>
 <Input
 
 value={formData.name}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 setFormData((prevState) => ({
 ...prevState,
 name: event.target.value
 }))
 }
 placeholder="My Integration"
 />
 </div>
 
 <div className="space-y-sm">
 <Label htmlFor="type">Type</Label>
 <Select
 value={formData.type}
 onValueChange={(value) =>
 setFormData((prev: unknown) => ({
 ...prev,
 type: value as CreateIntegrationInput['type']
 }))
 }
 >
 <SelectTrigger >
 <SelectValue placeholder="Select integration type" />
 </SelectTrigger>
 <SelectContent>
 {availableIntegrations.map((integration) => (
 <SelectItem key={integration.type} value={integration.type}>
 {integration.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 {formData.type === 'webhook' && (
 <div className="space-y-sm">
 <Label htmlFor="webhook-url">Webhook URL</Label>
 <Input
 
 placeholder="https://example.com/webhook"
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 setFormData((prev: unknown) => ({
 ...prev,
 config: { ...prev.config, url: event.target.value }
 }))
 }
 />
 </div>
 )}

 <div className="flex justify-end gap-sm">
 <Button variant="outline" onClick={() => setShowCreateModal(false)}>
 Cancel
 </Button>
 <Button onClick={handleCreate} disabled={!formData.name}>
 Create Integration
 </Button>
 </div>
 </div>
 </Modal>
 </div>
 );
}
