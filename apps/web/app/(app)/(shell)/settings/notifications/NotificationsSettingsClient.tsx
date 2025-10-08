'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
 Badge,
 Button,
 Card,
 CardContent,
 CardHeader,
 CardTitle,
 Input,
 Label,
 Modal,
 ConfirmModal,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Skeleton,
 Textarea,
 Toggle,
 useToastContext
} from '@ghxstship/ui';
import {
 fetchNotificationSettings,
 markAllNotificationsRead,
 NotificationCategory,
 NotificationFrequency,
 NotificationGlobalSettings,
 NotificationPreference,
 NotificationSettingsResponse,
 NotificationType,
 resetNotificationPreferences,
 sendTestNotification,
 updateNotificationSettings
} from '@/lib/services/settingsNotificationsClient';

const FREQUENCY_OPTIONS: { value: NotificationFrequency; label: string }[] = [
 { value: 'immediate', label: 'Immediate' },
 { value: 'hourly', label: 'Hourly' },
 { value: 'daily', label: 'Daily' },
 { value: 'weekly', label: 'Weekly' },
];

const DIGEST_FREQUENCY_OPTIONS = [
 { value: 'daily', label: 'Daily' },
 { value: 'weekly', label: 'Weekly' },
 { value: 'monthly', label: 'Monthly' },
];

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
 project_updates: 'Project Updates',
 job_assignments: 'Job Assignments',
 financial_alerts: 'Financial Alerts',
 system_notifications: 'System Notifications',
 security_alerts: 'Security Alerts',
 marketplace_activity: 'Marketplace Activity',
 training_reminders: 'Training Reminders',
 compliance_updates: 'Compliance Updates',
 approval_requests: 'Approval Requests'
};

const TYPE_LABELS: Record<NotificationType, string> = {
 email: 'Email',
 sms: 'SMS',
 push: 'Push',
 in_app: 'In-App'
};

interface PreferenceFormState extends NotificationPreference {}

interface GlobalSettingsFormState {
 quietHoursEnabled: boolean;
 quietHoursStart: string;
 quietHoursEnd: string;
 quietHoursTimezone: string;
 digestEnabled: boolean;
 digestFrequency: 'daily' | 'weekly' | 'monthly';
 digestTime: string;
}

const DEFAULT_GLOBAL_STATE: GlobalSettingsFormState = {
 quietHoursEnabled: false,
 quietHoursStart: '22:00',
 quietHoursEnd: '08:00',
 quietHoursTimezone: 'UTC',
 digestEnabled: true,
 digestFrequency: 'daily',
 digestTime: '09:00'
};

const DEFAULT_PREFERENCES: PreferenceFormState[] = [
 {
 type: 'email',
 enabled: true,
 frequency: 'immediate',
 categories: ['security_alerts', 'approval_requests']
 },
 {
 type: 'in_app',
 enabled: true,
 frequency: 'immediate',
 categories: ['project_updates', 'job_assignments']
 },
 {
 type: 'push',
 enabled: false,
 frequency: 'immediate',
 categories: []
 },
 {
 type: 'sms',
 enabled: false,
 frequency: 'immediate',
 categories: ['security_alerts']
 },
];

function buildGlobalState(settings: NotificationGlobalSettings | undefined): GlobalSettingsFormState {
 if (!settings) return DEFAULT_GLOBAL_STATE;
 return {
 quietHoursEnabled: settings.quietHours?.enabled ?? false,
 quietHoursStart: settings.quietHours?.startTime ?? '22:00',
 quietHoursEnd: settings.quietHours?.endTime ?? '08:00',
 quietHoursTimezone: settings.quietHours?.timezone ?? 'UTC',
 digestEnabled: settings.digestEnabled ?? true,
 digestFrequency: settings.digestFrequency ?? 'daily',
 digestTime: settings.digestTime ?? '09:00'
 };
}

function exportGlobalState(state: GlobalSettingsFormState): NotificationGlobalSettings {
 return {
 quietHours: state.quietHoursEnabled
 ? {
 enabled: true,
 startTime: state.quietHoursStart,
 endTime: state.quietHoursEnd,
 timezone: state.quietHoursTimezone
 }
 : { enabled: false, startTime: '22:00', endTime: '08:00', timezone: 'UTC' },
 digestEnabled: state.digestEnabled,
 digestFrequency: state.digestFrequency,
 digestTime: state.digestTime
 };
}

export default function NotificationsSettingsClient() {
 const { toast } = useToastContext();
 const [data, setData] = useState<NotificationSettingsResponse | null>(null);
 const [preferencesState, setPreferencesState] = useState<PreferenceFormState[]>(DEFAULT_PREFERENCES);
 const [globalState, setGlobalState] = useState<GlobalSettingsFormState>(DEFAULT_GLOBAL_STATE);
 const [loading, setLoading] = useState<boolean>(true);
 const [saving, setSaving] = useState<boolean>(false);
 const [testModalOpen, setTestModalOpen] = useState<boolean>(false);
 const [testMessage, setTestMessage] = useState<string>('This is a test notification.');
 const [testType, setTestType] = useState<NotificationType>('email');
 const [resetConfirmationOpen, setResetConfirmationOpen] = useState<boolean>(false);
 const [resetting, setResetting] = useState<boolean>(false);

 const load = useCallback(async () => {
 try {
 setLoading(true);
 const response = await fetchNotificationSettings();
 setData(response);
 setPreferencesState(response.preferences.length ? response.preferences : DEFAULT_PREFERENCES);
 setGlobalState(buildGlobalState(response.globalSettings));
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to load notification settings';
 toast.error('Failed to load notification settings', undefined, { description: message });
 } finally {
 setLoading(false);
 }
 }, [toast]);

 useEffect(() => {
 void load();
 }, [load]);

 const handlePreferenceToggle = (type: NotificationType, enabled: boolean) => {
 setPreferencesState((prev: unknown) =>
 prev.map((pref) =>
 pref.type === type
 ? {
 ...pref,
 enabled
 }
 : pref
 )
 );
 };

 const handleFrequencyChange = (type: NotificationType, frequency: NotificationFrequency) => {
 setPreferencesState((prev: unknown) =>
 prev.map((pref) =>
 pref.type === type
 ? {
 ...pref,
 frequency
 }
 : pref
 )
 );
 };

 const handleCategoryToggle = (type: NotificationType, category: NotificationCategory, checked: boolean) => {
 setPreferencesState((prev: unknown) =>
 prev.map((pref) =>
 pref.type === type
 ? {
 ...pref,
 categories: checked
 ? Array.from(new Set([...(pref.categories ?? []), category]))
 : (pref.categories ?? []).filter((cat) => cat !== category)
 }
 : pref
 )
 );
 };

 const handleQuietHoursChange = (key: keyof GlobalSettingsFormState, value: string | boolean) => {
 setGlobalState((prev: unknown) => ({
 ...prev,
 [key]: value
 }));
 };

 const preferencesByType = useMemo(() => {
 return preferencesState.reduce<Record<NotificationType, PreferenceFormState>((acc, pref) => {
 acc[pref.type] = pref;
 return acc;
 }, {
 email: {
 type: 'email',
 enabled: false,
 frequency: 'immediate',
 categories: []
 },
 sms: {
 type: 'sms',
 enabled: false,
 frequency: 'immediate',
 categories: []
 },
 push: {
 type: 'push',
 enabled: false,
 frequency: 'immediate',
 categories: []
 },
 in_app: {
 type: 'in_app',
 enabled: false,
 frequency: 'immediate',
 categories: []
 }
 });
 }, [preferencesState]);

 const handleSave = useCallback(async () => {
 try {
 setSaving(true);
 await updateNotificationSettings({
 preferences: preferencesState,
 globalSettings: exportGlobalState(globalState)
 });
 toast.success('Notification settings saved');
 await load();
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to save notification settings';
 toast.error('Save failed', undefined, { description: message });
 } finally {
 setSaving(false);
 }
 }, [globalState, load, preferencesState, toast]);

 const handleTestNotification = useCallback(async () => {
 try {
 await sendTestNotification({ type: testType, message: testMessage });
 toast.success('Test notification sent');
 setTestModalOpen(false);
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to send test notification';
 toast.error('Test notification failed', undefined, { description: message });
 }
 }, [testMessage, testType, toast]);

 const handleMarkAllRead = useCallback(async () => {
 try {
 await markAllNotificationsRead();
 toast.success('All notifications marked as read');
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to mark notifications';
 toast.error('Action failed', undefined, { description: message });
 }
 }, [toast]);

 const handleResetPreferences = useCallback(async () => {
 try {
 setResetting(true);
 await resetNotificationPreferences();
 toast.success('Notification preferences reset');
 setResetConfirmationOpen(false);
 await load();
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to reset preferences';
 toast.error('Reset failed', undefined, { description: message });
 } finally {
 setResetting(false);
 }
 }, [load, toast]);

 if (loading && !data) {
 return (
 <div className="stack-md">
 <Card>
 <CardHeader>
 <CardTitle>Notification Preferences</CardTitle>
 </CardHeader>
 <CardContent className="space-y-md">
 <Skeleton className="h-icon-lg w-1/2" />
 <Skeleton className="h-icon-xl w-full" />
 <Skeleton className="h-36 w-full" />
 </CardContent>
 </Card>
 <Card>
 <CardHeader>
 <CardTitle>Quiet Hours & Digest</CardTitle>
 </CardHeader>
 <CardContent className="space-y-md">
 <Skeleton className="h-icon-lg w-1/2" />
 <Skeleton className="h-icon-xl w-full" />
 <Skeleton className="h-component-lg w-full" />
 </CardContent>
 </Card>
 </div>
 );
 }

 return (
 <div className="stack-lg">
 <Card>
 <CardHeader className="flex flex-col gap-sm">
 <div className="flex w-full flex-col gap-sm lg:flex-row lg:items-start lg:justify-between">
 <div>
 <CardTitle>Notification Preferences</CardTitle>
 <p className="text-body-sm text-muted-foreground">
 Configure delivery channels, frequencies, and categories for your alerts.
 </p>
 </div>
 <div className="flex flex-wrap gap-sm">
 <Button variant="outline" onClick={handleMarkAllRead}>Mark All Read</Button>
 <Button variant="outline" onClick={() => setResetConfirmationOpen(true)}>Reset to Default</Button>
 <Button variant="outline" onClick={() => setTestModalOpen(true)}>Send Test</Button>
 </div>
 </div>
 </CardHeader>
 <CardContent className="space-y-xl">
 {preferencesState.map((preference) => {
 const current = preferencesByType[preference.type];
 return (
 <div key={preference.type} className="rounded-lg border p-md space-y-md">
 <div className="flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
 <div className="space-y-xs">
 <div className="flex items-center gap-sm">
 <h3 className="text-body font-semibold">{TYPE_LABELS[preference.type]}</h3>
 <Badge variant={current.enabled ? 'success' : 'secondary'}>
 {current.enabled ? 'Enabled' : 'Disabled'}
 </Badge>
 </div>
 <p className="text-body-sm text-muted-foreground">
 {preference.type === 'email' && 'Receive detailed email alerts for critical updates.'}
 {preference.type === 'sms' && 'Get SMS alerts for high-severity and urgent notifications.'}
 {preference.type === 'push' && 'Receive push notifications on connected devices.'}
 {preference.type === 'in_app' && 'Stay informed with in-app notifications and inbox digests.'}
 </p>
 </div>
 <Toggle
 checked={current.enabled}
 onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
 handlePreferenceToggle(preference.type, event.currentTarget.checked)
 }
 label={current.enabled ? 'On' : 'Off'}
 />
 </div>

 <div className="grid grid-cols-1 gap-md md:grid-cols-2">
 <div className="space-y-sm">
 <Label htmlFor={`frequency-${preference.type}`}>Frequency</Label>
 <Select
 value={current.frequency}
 onValueChange={(value) =>
 handleFrequencyChange(preference.type, value as NotificationFrequency)
 }
 >
 <SelectTrigger id={`frequency-${preference.type}`}><SelectValue placeholder="Select frequency" /></SelectTrigger>
 <SelectContent>
 {FREQUENCY_OPTIONS.map((option) => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-sm">
 <Label>Categories</Label>
 <div className="grid grid-cols-1 gap-xs sm:grid-cols-2">
 {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
 <label key={value} className="flex items-center gap-sm">
 <input
 type="checkbox"
 checked={current.categories?.includes(value as NotificationCategory) ?? false}
 onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
 handleCategoryToggle(
 preference.type,
 value as NotificationCategory,
 event.target.checked,
 )
 }
 className="rounded border-border"
 />
 <span className="text-body-sm">{label}</span>
 </label>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
 })}

 <div className="rounded-lg border p-md space-y-md">
 <div className="flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
 <div>
 <h3 className="text-body font-semibold">Global Quiet Hours & Digest Settings</h3>
 <p className="text-body-sm text-muted-foreground">
 Apply consistent delivery rules across all notification channels.
 </p>
 </div>
 <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:gap-md">
 <Toggle
 checked={globalState.quietHoursEnabled}
 onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
 handleQuietHoursChange('quietHoursEnabled', event.currentTarget.checked)
 }
 label={globalState.quietHoursEnabled ? 'Quiet hours enabled' : 'Quiet hours disabled'}
 />
 <Toggle
 checked={globalState.digestEnabled}
 onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
 handleQuietHoursChange('digestEnabled', event.currentTarget.checked)
 }
 label={globalState.digestEnabled ? 'Digest enabled' : 'Digest disabled'}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 gap-md md:grid-cols-2">
 <div className="space-y-xs">
 <Label htmlFor="global-quiet-start">Quiet Hours Start</Label>
 <Input
 
 type="time"
 value={globalState.quietHoursStart}
 onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
 handleQuietHoursChange('quietHoursStart', event.currentTarget.value)
 }
 disabled={!globalState.quietHoursEnabled}
 />
 </div>
 <div className="space-y-xs">
 <Label htmlFor="global-quiet-end">Quiet Hours End</Label>
 <Input
 
 type="time"
 value={globalState.quietHoursEnd}
 onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
 handleQuietHoursChange('quietHoursEnd', event.currentTarget.value)
 }
 disabled={!globalState.quietHoursEnabled}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 gap-md md:grid-cols-3">
 <div className="space-y-xs">
 <Label htmlFor="global-quiet-timezone">Timezone</Label>
 <Select
 value={globalState.quietHoursTimezone}
 onValueChange={(value) => handleQuietHoursChange('quietHoursTimezone', value)}
 disabled={!globalState.quietHoursEnabled}
 >
 <SelectTrigger ><SelectValue placeholder="Select timezone" /></SelectTrigger>
 <SelectContent>
 {['UTC', 'America/Los_Angeles', 'America/New_York', 'Europe/London', 'Asia/Tokyo'].map(
 (timezone) => (
 <SelectItem key={timezone} value={timezone}>
 {timezone}
 </SelectItem>
 ),
 )}
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-xs">
 <Label htmlFor="global-digest-frequency">Digest Frequency</Label>
 <Select
 value={globalState.digestFrequency}
 onValueChange={(value) => handleQuietHoursChange('digestFrequency', value)}
 disabled={!globalState.digestEnabled}
 >
 <SelectTrigger ><SelectValue placeholder="Select digest frequency" /></SelectTrigger>
 <SelectContent>
 {DIGEST_FREQUENCY_OPTIONS.map((option) => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-xs">
 <Label htmlFor="global-digest-time">Digest Time</Label>
 <Input
 
 type="time"
 value={globalState.digestTime}
 onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
 handleQuietHoursChange('digestTime', event.currentTarget.value)
 }
 disabled={!globalState.digestEnabled}
 />
 </div>
 </div>
 </div>

 <div className="flex justify-end gap-sm">
 <Button variant="outline" onClick={() => void load()} disabled={saving}>
 Refresh
 </Button>
 <Button onClick={handleSave} disabled={saving}>
 {saving ? 'Saving…' : 'Save Changes'}
 </Button>
 </div>
 </CardContent>
 </Card>

 <Modal
 open={testModalOpen}
 onClose={() => setTestModalOpen(false)}
 title="Send Test Notification"
 description="Send yourself a test notification to verify delivery settings."
 >
 <div className="space-y-md">
 <div className="space-y-sm">
 <Label>Channel</Label>
 <Select value={testType} onValueChange={(value) => setTestType(value as NotificationType)}>
 <SelectTrigger>
 <SelectValue placeholder="Select channel" />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(TYPE_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-sm">
 <Label htmlFor="test-message">Message Preview</Label>
 <Textarea
 
 rows={4}
 value={testMessage}
 onChange={(event) => setTestMessage(event.target.value)}
 />
 </div>
 <div className="flex justify-end gap-sm">
 <Button variant="outline" onClick={() => setTestModalOpen(false)}>
 Cancel
 </Button>
 <Button onClick={handleTestNotification}>
 Send Test
 </Button>
 </div>
 </div>
 </Modal>

 <ConfirmModal
 open={resetConfirmationOpen}
 onClose={() => setResetConfirmationOpen(false)}
 onConfirm={handleResetPreferences}
 title="Reset preferences?"
 description="We will revert your notification settings to the recommended defaults. This action cannot be undone."
 confirmText="Reset"
 cancelText="Cancel"
 variant="destructive"
 loading={resetting}
 />
 </div>
 );
}
