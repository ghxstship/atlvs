'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from 'react';
import {
 Card,
 Button,
 Badge,
 Loader,
 Textarea,
 Input,
 useToastContext
} from '@ghxstship/ui';
import {
 fetchAutomationRules,
 createAutomationRule,
 updateAutomationRule,
 deleteAutomationRule,
 type AutomationRuleSummary,
 type AutomationAction,
 type AutomationCondition
} from '@/lib/services/settingsAutomationsClient';

interface AutomationFormState {
 name: string;
 description: string;
 triggerType: string;
 triggerConfig: string;
 conditions: string;
 actions: string;
 isActive: boolean;
}

const emptyForm: AutomationFormState = {
 name: '',
 description: '',
 triggerType: '',
 triggerConfig: '{\n "event": ""\n}',
 conditions: '[]',
 actions: '[\n {\n "type": "",\n "config": {},\n "order": 1\n }\n]',
 isActive: true
};

function parseJsonOrThrow<T>(value: string, label: string): T {
 try {
 return JSON.parse(value) as T;
 } catch (error) {
 throw new Error(`Invalid ${label}. Please provide valid JSON.`);
 }
}

function formatJson(value: unknown): string {
 return JSON.stringify(value, null, 2);
}

export default function AutomationsSettingsClient() {
 const { toast } = useToastContext();
 const [automationRules, setAutomationRules] = useState<AutomationRuleSummary[]>([]);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [showForm, setShowForm] = useState(false);
 const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
 const [form, setForm] = useState<AutomationFormState>(emptyForm);

 const isEditing = useMemo(() => editingRuleId !== null, [editingRuleId]);

 useEffect(() => {
 void loadAutomationRules();
 }, [toast]);

 const loadAutomationRules = async () => {
 try {
 setLoading(true);
 const rules = await fetchAutomationRules();
 setAutomationRules(rules);
 } catch (error) {
 console.error('Error loading automation rules:', error);
 toast.error('Failed to load automation rules');
 } finally {
 setLoading(false);
 }
 };

 const resetForm = () => {
 setForm(emptyForm);
 setEditingRuleId(null);
 };

 const handleCreateNew = () => {
 resetForm();
 setShowForm(true);
 };

 const handleEditRule = (rule: AutomationRuleSummary) => {
 setForm({
 name: rule.name,
 description: rule.description ?? '',
 triggerType: rule.triggerType,
 triggerConfig: formatJson(rule.triggerConfig),
 conditions: formatJson(rule.conditions ?? []),
 actions: formatJson(rule.actions),
 isActive: rule.isActive
 });
 setEditingRuleId(rule.id);
 setShowForm(true);
 };

 const handleDeleteRule = async (rule: AutomationRuleSummary) => {
 const confirmed = window.confirm(`Delete automation rule "${rule.name}"?`);
 if (!confirmed) return;

 try {
 await deleteAutomationRule(rule.id);
 toast.success('Automation rule deleted');
 void loadAutomationRules();
 } catch (error) {
 console.error('Error deleting automation rule:', error);
 toast.error('Failed to delete automation rule');
 }
 };

 const handleToggleActive = async (rule: AutomationRuleSummary) => {
 try {
 await updateAutomationRule(rule.id, { isActive: !rule.isActive });
 toast.success(`Automation ${rule.isActive ? 'paused' : 'activated'}`);
 void loadAutomationRules();
 } catch (error) {
 console.error('Error toggling automation rule:', error);
 toast.error('Failed to update automation status');
 }
 };

 const handleSubmit = async () => {
 try {
 setSaving(true);

 if (!form.name.trim()) {
 throw new Error('Name is required.');
 }
 if (!form.triggerType.trim()) {
 throw new Error('Trigger type is required.');
 }

 const triggerConfig = parseJsonOrThrow<Record<string, unknown>(form.triggerConfig, 'trigger configuration');
 const actions = parseJsonOrThrow<AutomationAction[]>(form.actions, 'actions');
 const conditions = form.conditions.trim()
 ? parseJsonOrThrow<AutomationCondition[]>(form.conditions, 'conditions')
 : [];

 if (!Array.isArray(actions) || actions.length === 0) {
 throw new Error('At least one action is required.');
 }

 const payload = {
 name: form.name.trim(),
 description: form.description.trim() || undefined,
 triggerType: form.triggerType.trim(),
 triggerConfig,
 conditions,
 actions,
 isActive: form.isActive
 };

 if (isEditing && editingRuleId) {
 await updateAutomationRule(editingRuleId, payload);
 toast.success('Automation rule updated');
 } else {
 await createAutomationRule(payload);
 toast.success('Automation rule created');
 }

 resetForm();
 setShowForm(false);
 void loadAutomationRules();
 } catch (error) {
 console.error('Error saving automation rule:', error);
 toast.error(error instanceof Error ? error.message : 'Failed to save automation rule');
 } finally {
 setSaving(false);
 }
 };

 const renderForm = () => (
 <Card>
 <div className="p-lg space-y-md">
 <div className="flex items-center justify-between">
 <h2 className="text-xl font-semibold">
 {isEditing ? 'Edit Automation Rule' : 'Create Automation Rule'}
 </h2>
 <div className="flex gap-xs">
 <Button variant="outline" onClick={() => { resetForm(); setShowForm(false); }} disabled={saving}>
 Cancel
 </Button>
 <Button onClick={handleSubmit} disabled={saving}>
 {saving ? 'Saving...' : isEditing ? 'Update Rule' : 'Create Rule'}
 </Button>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <label className="text-sm font-medium">Name</label>
 <Input
 value={form.name}
 onChange={(event) => setForm((prev: unknown) => ({ ...prev, name: event.target.value }))}
 placeholder="Automation name"
 />
 </div>
 <div className="space-y-xs">
 <label className="text-sm font-medium">Trigger Type</label>
 <Input
 value={form.triggerType}
 onChange={(event) => setForm((prev: unknown) => ({ ...prev, triggerType: event.target.value }))}
 placeholder="e.g. lead.created"
 />
 </div>
 </div>

 <div className="space-y-xs">
 <label className="text-sm font-medium">Description</label>
 <Textarea
 value={form.description}
 onChange={(event) => setForm((prev: unknown) => ({ ...prev, description: event.target.value }))}
 placeholder="Optional description"
 rows={2}
 />
 </div>

 <div className="space-y-xs">
 <label className="text-sm font-medium">Trigger Configuration (JSON)</label>
 <Textarea
 value={form.triggerConfig}
 onChange={(event) => setForm((prev: unknown) => ({ ...prev, triggerConfig: event.target.value }))}
 rows={6}
 />
 </div>

 <div className="space-y-xs">
 <label className="text-sm font-medium">Conditions (JSON array)</label>
 <Textarea
 value={form.conditions}
 onChange={(event) => setForm((prev: unknown) => ({ ...prev, conditions: event.target.value }))}
 rows={6}
 placeholder="[]"
 />
 </div>

 <div className="space-y-xs">
 <label className="text-sm font-medium">Actions (JSON array)</label>
 <Textarea
 value={form.actions}
 onChange={(event) => setForm((prev: unknown) => ({ ...prev, actions: event.target.value }))}
 rows={6}
 />
 </div>

 <div className="flex items-center justify-between">
 <div className="space-y-xs">
 <p className="text-sm font-medium">Status</p>
 <p className="text-xs text-muted-foreground">
 Active automations will run automatically when triggers are satisfied.
 </p>
 </div>
 <Button
 variant={form.isActive ? 'success' : 'outline'}
 onClick={() => setForm((prev: unknown) => ({ ...prev, isActive: !prev.isActive }))}
 type="button"
 >
 {form.isActive ? 'Active' : 'Inactive'}
 </Button>
 </div>
 </div>
 </Card>
 );

 const renderRule = (rule: AutomationRuleSummary) => (
 <Card key={rule.id}>
 <div className="p-lg space-y-md">
 <div className="flex flex-wrap items-start justify-between gap-md">
 <div>
 <div className="flex items-center gap-sm">
 <h3 className="text-lg font-semibold">{rule.name}</h3>
 <Badge variant={rule.isActive ? 'success' : 'secondary'}>
 {rule.isActive ? 'Active' : 'Paused'}
 </Badge>
 </div>
 {rule.description && (
 <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
 )}
 </div>
 <div className="flex gap-xs">
 <Button variant="outline" size="sm" onClick={() => handleToggleActive(rule)}>
 {rule.isActive ? 'Pause' : 'Activate'}
 </Button>
 <Button variant="outline" size="sm" onClick={() => handleEditRule(rule)}>
 Edit
 </Button>
 <Button variant="destructive" size="sm" onClick={() => handleDeleteRule(rule)}>
 Delete
 </Button>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-sm">
 <div className="space-y-sm">
 <div>
 <p className="font-medium text-muted-foreground">Trigger</p>
 <p className="mt-1">Type: <span className="font-mono">{rule.triggerType}</span></p>
 <pre className="mt-2 bg-muted/50 rounded-md p-sm text-xs overflow-x-auto">
 {formatJson(rule.triggerConfig)}
 </pre>
 </div>

 <div>
 <p className="font-medium text-muted-foreground">Conditions</p>
 {rule.conditions && rule.conditions.length > 0 ? (
 <pre className="mt-2 bg-muted/50 rounded-md p-sm text-xs overflow-x-auto">
 {formatJson(rule.conditions)}
 </pre>
 ) : (
 <p className="mt-1 text-muted-foreground">No additional conditions</p>
 )}
 </div>
 </div>
 <div className="space-y-sm">
 <div>
 <p className="font-medium text-muted-foreground">Actions</p>
 <pre className="mt-2 bg-muted/50 rounded-md p-sm text-xs overflow-x-auto">
 {formatJson(rule.actions)}
 </pre>
 </div>
 <div className="flex items-center gap-md text-xs text-muted-foreground">
 <span>Runs: {rule.runCount ?? 0}</span>
 {rule.lastRunAt && (
 <span>Last run: {new Date(rule.lastRunAt).toLocaleString()}</span>
 )}
 <span>Created: {new Date(rule.createdAt).toLocaleString()}</span>
 {rule.updatedAt && (
 <span>Updated: {new Date(rule.updatedAt).toLocaleString()}</span>
 )}
 </div>
 </div>
 </div>
 </div>
 </Card>
 );

 return (
 <div className="space-y-lg">
 <div className="flex flex-wrap items-center justify-between gap-sm">
 <div>
 <h1 className="text-3xl font-bold">Automations</h1>
 <p className="text-muted-foreground mt-1">
 Build rules that react to platform events and orchestrate downstream actions.
 </p>
 </div>
 <Button onClick={handleCreateNew}>
 Create Automation
 </Button>
 </div>

 {showForm && renderForm()}

 <Card>
 <div className="p-lg">
 {loading ? (
 <div className="flex items-center justify-center h-container-xs">
 <Loader className="h-icon-lg w-icon-lg animate-spin" />
 </div>
 ) : automationRules.length === 0 ? (
 <div className="py-16 text-center space-y-sm">
 <p className="text-lg font-medium">No automation rules yet</p>
 <p className="text-sm text-muted-foreground">
 Automations will appear here once you create them.
 </p>
 <Button variant="outline" onClick={handleCreateNew}>
 Create your first rule
 </Button>
 </div>
 ) : (
 <div className="space-y-md">
 {automationRules.map(renderRule)}
 </div>
 )}
 </div>
 </Card>
 </div>
 );
}
