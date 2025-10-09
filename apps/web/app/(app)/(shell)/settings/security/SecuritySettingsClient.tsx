'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
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
 fetchSecuritySettings,
 generateSecurityBackupCodes,
 resetSecuritySettings,
 runSecurityTest,
 SecurityDeviceRecord,
 SecurityEventRecord,
 SecuritySettings,
 SecuritySettingsResponse,
 SecuritySessionRecord,
 updateSecuritySettings
} from '@/lib/services/settingsSecurityClient';

type MfaMethod = (typeof MFA_METHOD_OPTIONS)[number]['value'];

const MFA_METHOD_OPTIONS: { value: 'totp' | 'sms' | 'email'; label: string }[] = [
 { value: 'totp', label: 'Authenticator App' },
 { value: 'sms', label: 'SMS' },
 { value: 'email', label: 'Email' },
];

const PASSWORD_POLICY_PRESETS = [
 {
 name: 'Strict (Recommended)',
 value: 'strict',
 policy: {
 minLength: 12,
 requireUppercase: true,
 requireLowercase: true,
 requireNumbers: true,
 requireSpecialChars: true,
 maxAge: 90,
 preventReuse: 5
 }
 },
 {
 name: 'Moderate',
 value: 'moderate',
 policy: {
 minLength: 10,
 requireUppercase: true,
 requireLowercase: true,
 requireNumbers: true,
 requireSpecialChars: false,
 maxAge: 180,
 preventReuse: 3
 }
 },
 {
 name: 'Basic',
 value: 'basic',
 policy: {
 minLength: 8,
 requireUppercase: false,
 requireLowercase: true,
 requireNumbers: true,
 requireSpecialChars: false,
 maxAge: 365,
 preventReuse: 2
 }
 },
];

const SESSION_TIMEOUT_OPTIONS = [
 { label: '15 minutes', value: 900 },
 { label: '30 minutes', value: 1800 },
 { label: '1 hour', value: 3600 },
 { label: '8 hours (workday)', value: 28800 },
];

function ensureSecuritySettings(data?: SecuritySettings): SecuritySettings {
 return {
 passwordPolicy: {
 minLength: data?.passwordPolicy?.minLength ?? 12,
 requireUppercase: data?.passwordPolicy?.requireUppercase ?? true,
 requireLowercase: data?.passwordPolicy?.requireLowercase ?? true,
 requireNumbers: data?.passwordPolicy?.requireNumbers ?? true,
 requireSpecialChars: data?.passwordPolicy?.requireSpecialChars ?? true,
 maxAge: data?.passwordPolicy?.maxAge ?? 90,
 preventReuse: data?.passwordPolicy?.preventReuse ?? 5
 },
 sessionSettings: {
 maxSessionDuration: data?.sessionSettings?.maxSessionDuration ?? 28800,
 idleTimeout: data?.sessionSettings?.idleTimeout ?? 1800,
 requireReauth: data?.sessionSettings?.requireReauth ?? true,
 maxConcurrentSessions: data?.sessionSettings?.maxConcurrentSessions ?? 3
 },
 mfaSettings: {
 required: data?.mfaSettings?.required ?? false,
 allowedMethods: (data?.mfaSettings?.allowedMethods ?? ['totp', 'email']) as MfaMethod[],
 gracePeriod: data?.mfaSettings?.gracePeriod ?? 7
 },
 accessControl: {
 ipWhitelist: data?.accessControl?.ipWhitelist ?? [],
 allowedDomains: data?.accessControl?.allowedDomains ?? [],
 blockSuspiciousActivity: data?.accessControl?.blockSuspiciousActivity ?? true,
 maxFailedAttempts: data?.accessControl?.maxFailedAttempts ?? 5,
 lockoutDuration: data?.accessControl?.lockoutDuration ?? 900
 },
 auditSettings: {
 logAllActions: data?.auditSettings?.logAllActions ?? true,
 retentionPeriod: data?.auditSettings?.retentionPeriod ?? 365,
 alertOnSensitiveActions: data?.auditSettings?.alertOnSensitiveActions ?? true,
 exportEnabled: data?.auditSettings?.exportEnabled ?? true
 }
 };
}

const MAX_IPS = 50;

export default function SecuritySettingsClient() {
 const { toast } = useToastContext();
 const [data, setData] = useState<SecuritySettingsResponse | null>(null);
 const [formState, setFormState] = useState<SecuritySettings>(ensureSecuritySettings());
 const [loading, setLoading] = useState<boolean>(true);
 const [saving, setSaving] = useState<boolean>(false);
 const [testing, setTesting] = useState<boolean>(false);
 const [testResults, setTestResults] = useState<string | null>(null);
 const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
 const [backupCodesModalOpen, setBackupCodesModalOpen] = useState<boolean>(false);
 const [resetModalOpen, setResetModalOpen] = useState<'all' | 'sessions' | null>(null);

 const load = useCallback(async () => {
 try {
 setLoading(true);
 const response = await fetchSecuritySettings();
 setData(response);
 setFormState(ensureSecuritySettings(response.securitySettings));
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to load security settings';
 toast.error('Failed to load security settings', undefined, { description: message });
 } finally {
 setLoading(false);
 }
 }, [toast]);

 useEffect(() => {
 void load();
 }, [load]);

 const handlePresetChange = useCallback((value: string) => {
 const preset = PASSWORD_POLICY_PRESETS.find((preset) => preset.value === value);
 if (!preset) return;
 setFormState((prev: unknown) => ({
 ...prev,
 passwordPolicy: {
 ...prev.passwordPolicy,
 ...preset.policy
 }
 }));
 }, []);

 const handleToggle = useCallback((path: keyof SecuritySettings, key: string, value: boolean) => {
 setFormState((prev: unknown) => ({
 ...prev,
 [path]: {
 ...(prev[path] as Record<string, unknown>),
 [key]: value
 }
 }));
 }, []);

 const handleNumberChange = useCallback((path: keyof SecuritySettings, key: string, value: number) => {
 setFormState((prev: unknown) => ({
 ...prev,
 [path]: {
 ...(prev[path] as Record<string, unknown>),
 [key]: value
 }
 }));
 }, []);

 const handleArrayChange = useCallback((path: keyof SecuritySettings, key: string, value: string[]) => {
 setFormState((prev: unknown) => ({
 ...prev,
 [path]: {
 ...(prev[path] as Record<string, unknown>),
 [key]: value
 }
 }));
 }, []);

 const handleWhitelistChange = useCallback(
 (value: string) => {
 const entries = value
 .split('\n')
 .map((line) => line.trim())
 .filter(Boolean)
 .slice(0, MAX_IPS);
 handleArrayChange('accessControl', 'ipWhitelist', entries);
 },
 [handleArrayChange]
 );

 const handleAllowDomainChange = useCallback(
 (value: string) => {
 const entries = value
 .split('\n')
 .map((line) => line.trim().toLowerCase())
 .filter(Boolean)
 .slice(0, MAX_IPS);
 handleArrayChange('accessControl', 'allowedDomains', entries);
 },
 [handleArrayChange]
 );

 const handleSave = useCallback(async () => {
 try {
 setSaving(true);
 await updateSecuritySettings(formState);
 toast.success('Security settings saved');
 await load();
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to save security settings';
 toast.error('Save failed', undefined, { description: message });
 } finally {
 setSaving(false);
 }
 }, [formState, load, toast]);

 const handleRunTest = useCallback(async () => {
 try {
 setTesting(true);
 const result = await runSecurityTest();
 setTestResults(
 `Overall Score: ${result.overallScore}\nPassword Compliance: ${result.passwordPolicyCompliance ? 'Pass' : 'Fail'}\nRecommendations:\n- ${result.recommendations.join('\n- ')}`
 );
 toast.success('Security assessment completed');
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to run security assessment';
 toast.error('Assessment failed', undefined, { description: message });
 } finally {
 setTesting(false);
 }
 }, [toast]);

 const handleBackupCodes = useCallback(async () => {
 try {
 const codes = await generateSecurityBackupCodes();
 setBackupCodes(codes);
 setBackupCodesModalOpen(true);
 toast.success('Backup codes generated');
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to generate backup codes';
 toast.error('Action failed', undefined, { description: message });
 }
 }, [toast]);

 const confirmReset = useCallback(async (type: 'all' | 'sessions') => {
 try {
 setSaving(true);
 await resetSecuritySettings(type);
 if (type === 'all') {
 toast.success('Security settings reset to defaults');
 await load();
 } else {
 toast.success('All sessions terminated');
 }
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to reset security settings';
 toast.error('Reset failed', undefined, { description: message });
 } finally {
 setSaving(false);
 setResetModalOpen(null);
 }
 }, [load, toast]);

 const currentSettings = ensureSecuritySettings(formState);
 const metrics = data?.securityMetrics;

 if (loading) {
 return (
 <div className="space-y-md">
 <Skeleton className="h-icon-2xl w-container-sm" />
 <div className="grid gap-md md:grid-cols-2">
 <Skeleton className="h-40 w-full" />
 <Skeleton className="h-40 w-full" />
 </div>
 <Skeleton className="h-40 w-full" />
 </div>
 );
 }

 return (
 <div className="space-y-lg">
 <Card>
 <CardHeader className="flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
 <div>
 <CardTitle>Organization Security</CardTitle>
 <p className="text-body-sm text-muted-foreground">
 Manage password policies, session security, MFA requirements, and access controls for your organization.
 </p>
 </div>
 <div className="flex flex-wrap gap-sm">
 <Button variant="outline" onClick={handleRunTest} disabled={testing}>
 {testing ? 'Assessing…' : 'Run Security Assessment'}
 </Button>
 <Button variant="outline" onClick={handleBackupCodes}>
 Generate Backup Codes
 </Button>
 <Button variant="outline" onClick={() => void load()} disabled={saving}>
 Refresh
 </Button>
 </div>
 </CardHeader>
 <CardContent>
 <div className="grid gap-md md:grid-cols-3">
 <div className="rounded-lg border p-md">
 <p className="text-body-xs text-muted-foreground">Failed Logins (24h)</p>
 <p className="text-heading-4">{metrics?.failedLoginsLast24h ?? 0}</p>
 </div>
 <div className="rounded-lg border p-md">
 <p className="text-body-xs text-muted-foreground">Active Sessions</p>
 <p className="text-heading-4">{metrics?.activeSessions ?? 0}</p>
 </div>
 <div className="rounded-lg border p-md">
 <p className="text-body-xs text-muted-foreground">Audit Logs (7 days)</p>
 <p className="text-heading-4">{metrics?.auditLogsLast7Days ?? 0}</p>
 </div>
 </div>
 </CardContent>
 </Card>

 {testResults ? (
 <Card>
 <CardHeader>
 <CardTitle>Security Assessment</CardTitle>
 </CardHeader>
 <CardContent>
 <pre className="whitespace-pre-wrap rounded-md bg-muted/40 p-md text-body-sm text-muted-foreground">{testResults}</pre>
 </CardContent>
 </Card>
 ) : null}

 <Card>
 <CardHeader>
 <CardTitle>Password Policy</CardTitle>
 </CardHeader>
 <CardContent className="space-y-md">
 <div className="grid gap-md md:grid-cols-2">
 <div className="space-y-sm">
 <Label>Password Policy Preset</Label>
 <Select onValueChange={handlePresetChange}>
 <SelectTrigger>
 <SelectValue placeholder="Select preset" />
 </SelectTrigger>
 <SelectContent>
 {PASSWORD_POLICY_PRESETS.map((preset) => (
 <SelectItem key={preset.value} value={preset.value}>
 {preset.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 <p className="text-body-xs text-muted-foreground">
 Pick a preset to quickly align with recommended security posture.
 </p>
 </div>
 <div className="space-y-sm">
 <Label htmlFor="min-length">Minimum Length</Label>
 <Input
 
 type="number"
 min={8}
 max={128}
 value={currentSettings.passwordPolicy?.minLength ?? 12}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 handleNumberChange('passwordPolicy', 'minLength', Number(event.target.value))
 }
 />
 </div>
 </div>

 <div className="grid gap-sm md:grid-cols-2">
 <div className="flex items-center justify-between">
 <Label htmlFor="require-uppercase">Require Uppercase</Label>
 <Toggle
 
 checked={currentSettings.passwordPolicy?.requireUppercase ?? true}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 handleToggle('passwordPolicy', 'requireUppercase', event.target.checked)
 }
 />
 </div>
 <div className="flex items-center justify-between">
 <Label htmlFor="require-lowercase">Require Lowercase</Label>
 <Toggle
 
 checked={currentSettings.passwordPolicy?.requireLowercase ?? true}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 handleToggle('passwordPolicy', 'requireLowercase', event.target.checked)
 }
 />
 </div>
 <div className="flex items-center justify-between">
 <Label htmlFor="require-numbers">Require Numbers</Label>
 <Toggle
 
 checked={currentSettings.passwordPolicy?.requireNumbers ?? true}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 handleToggle('passwordPolicy', 'requireNumbers', event.target.checked)
 }
 />
 </div>
 <div className="flex items-center justify-between">
 <Label htmlFor="require-special">Require Special Characters</Label>
 <Toggle
 
 checked={currentSettings.passwordPolicy?.requireSpecialChars ?? true}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 handleToggle('passwordPolicy', 'requireSpecialChars', event.target.checked)
 }
 />
 </div>
 </div>

 <div className="grid gap-md md:grid-cols-3">
 <div className="space-y-sm">
 <Label htmlFor="max-age">Maximum Password Age (days)</Label>
 <Input
 
 type="number"
 min={0}
 max={365}
 value={currentSettings.passwordPolicy?.maxAge ?? 90}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 handleNumberChange('passwordPolicy', 'maxAge', Number(event.target.value))
 }
 />
 </div>
 <div className="space-y-sm">
 <Label htmlFor="prevent-reuse">Prevent Reuse (Previous passwords)</Label>
 <Input
 
 type="number"
 min={0}
 max={24}
 value={currentSettings.passwordPolicy?.preventReuse ?? 5}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 handleNumberChange('passwordPolicy', 'preventReuse', Number(event.target.value))
 }
 />
 </div>
 <div className="space-y-sm">
 <Label htmlFor="session-timeout">Idle Timeout</Label>
 <Select
 value={String(currentSettings.sessionSettings?.idleTimeout ?? 1800)}
 onChange={(e) =>
 handleNumberChange('sessionSettings', 'idleTimeout', Number(value))
 }
 >
 <SelectTrigger >
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {SESSION_TIMEOUT_OPTIONS.map((option) => (
 <SelectItem key={option.value} value={String(option.value)}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle>Multi-Factor Authentication</CardTitle>
 </CardHeader>
 <CardContent className="space-y-md">
 <div className="flex items-center justify-between">
 <div className="space-y-xs">
 <Label>Require MFA</Label>
 <p className="text-body-xs text-muted-foreground">
 Enforce MFA for all members to access the platform.
 </p>
 </div>
 <Toggle
 checked={currentSettings.mfaSettings?.required ?? false}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 handleToggle('mfaSettings', 'required', event.target.checked)
 }
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="allowed-methods">Allowed Methods</Label>
 <div className="grid gap-sm md:grid-cols-3">
 {MFA_METHOD_OPTIONS.map((option) => {
 const checked = currentSettings.mfaSettings?.allowedMethods?.includes(
 option.value
 );
 return (
 <label key={option.value} className="flex items-center gap-xs text-body-sm">
 <input
 type="checkbox"
 checked={checked}
 onChange={() => {
 setFormState((prev: unknown) => {
 const methods = prev.mfaSettings?.allowedMethods ?? [];
 const nextMethods = checked
 ? methods.filter((method): method is typeof option.value => method !== option.value)
 : [...methods, option.value];
 return {
 ...prev,
 mfaSettings: {
 ...prev.mfaSettings,
 allowedMethods: nextMethods
 }
 };
 });
 }}
 />
 {option.label}
 </label>
 );
 })}
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
