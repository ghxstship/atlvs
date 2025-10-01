'use client';

import { User, Lock, Shield, Smartphone, Key, Globe, Clock, AlertCircle } from "lucide-react";
import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
 Card,
 Button,
 Tabs,
 TabsContent,
 TabsList,
 TabsTrigger,
 Badge,
 Alert,
 Loader,
 Input,
 Label,
 useToastContext,
} from '@ghxstship/ui';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import useSupabaseBrowserClient from '@/app/_hooks/useSupabaseBrowserClient';
import {
 fetchSessions,
 revokeSession as revokeSessionApi,
 revokeAllSessions as revokeAllSessionsApi,
 fetchApiKeys,
 createApiKey as createApiKeyApi,
 revokeApiKey as revokeApiKeyApi,
 setupTwoFactor,
 verifyTwoFactor,
 type ApiKeySummary,
 type UserSessionSummary,
} from '@/lib/services/settingsAccountClient';

interface UserProfile {
 id: string;
 email: string;
 name: string;
 avatar_url?: string;
 phone?: string;
 timezone?: string;
 language?: string;
 created_at: string;
 updated_at: string;
}

interface UserSession {
 id: string;
 ipAddress: string;
 userAgent: string;
 deviceInfo?: unknown;
 location?: {
 country?: string;
 city?: string;
 region?: string;
 };
 isActive: boolean;
 isCurrent: boolean;
 lastActivityAt: string;
 expiresAt: string;
 createdAt: string;
}

interface ApiKey {
 id: string;
 name: string;
 description?: string;
 scopes: string[];
 lastUsedAt?: string;
 expiresAt?: string;
 isActive: boolean;
 createdAt: string;
 keyPrefix: string;
}

export default function AccountSettingsClient() {
 const supabase = useSupabaseBrowserClient();
 const { toast } = useToastContext();
 const [user, setUser] = useState<SupabaseUser | null>(null);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [activeTab, setActiveTab] = useState('profile');

 // Profile state
 const [profile, setProfile] = useState<UserProfile | null>(null);
 const [profileForm, setProfileForm] = useState({
 name: '',
 phone: '',
 timezone: 'UTC',
 language: 'en'
 });

 // Password state
 const [passwordForm, setPasswordForm] = useState({
 currentPassword: '',
 newPassword: '',
 confirmPassword: ''
 });

 // 2FA state
 const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
 const [twoFactorQR, setTwoFactorQR] = useState('');
 const [verificationCode, setVerificationCode] = useState('');

 // Sessions state
 const [sessions, setSessions] = useState<UserSessionSummary[]>([]);
 const [loadingSessions, setLoadingSessions] = useState(false);

 // API Keys state
 const [apiKeys, setApiKeys] = useState<ApiKeySummary[]>([]);
 const [loadingApiKeys, setLoadingApiKeys] = useState(false);
 const [showCreateApiKey, setShowCreateApiKey] = useState(false);
 const [newApiKeyForm, setNewApiKeyForm] = useState<{
 name: string;
 description: string;
 scopes: string[];
 expiresIn: string;
 }>({
 name: '',
 description: '',
 scopes: [],
 expiresIn: '90'
 });

 const loadProfile = useCallback(async (targetUserId: string) => {
 try {
 setLoading(true);
 const { data, error } = await supabase
 .from('users')
 .select('*')
 .eq('id', targetUserId)
 .single();

 if (error) throw error;

 setProfile(data);
 setProfileForm({
 name: data.name || '',
 phone: data.phone || '',
 timezone: data.timezone || 'UTC',
 language: data.language || 'en'
 });

 // Check 2FA status
 const { data: securitySettings } = await supabase
 .from('security_settings')
 .select('two_factor_enabled')
 .eq('user_id', targetUserId)
 .single();

 if (securitySettings) {
 setTwoFactorEnabled(securitySettings.two_factor_enabled);
 }
 } catch (error) {
 console.error('Error loading profile:', error);
 toast.error('Failed to load profile settings');
 } finally {
 setLoading(false);
 }
 }, [supabase, toast]);

 const loadSessions = useCallback(async () => {
 try {
 setLoadingSessions(true);
 const data = await fetchSessions();
 setSessions(data);
 } catch (error) {
 console.error('Error loading sessions:', error);
 toast.error('Failed to load active sessions');
 } finally {
 setLoadingSessions(false);
 }
 }, [toast]);

 const loadApiKeys = useCallback(async () => {
 try {
 setLoadingApiKeys(true);
 const data = await fetchApiKeys();
 setApiKeys(data);
 } catch (error) {
 console.error('Error loading API keys:', error);
 toast.error('Failed to load API keys');
 } finally {
 setLoadingApiKeys(false);
 }
 }, [toast]);

 const loadUser = useCallback(async () => {
 const { data: { user: currentUser } } = await supabase.auth.getUser();
 setUser(currentUser);
 if (currentUser) {
 await Promise.all([
 loadProfile(currentUser.id),
 loadSessions(),
 loadApiKeys(),
 ]);
 }
 }, [supabase, loadApiKeys, loadProfile, loadSessions]);

 useEffect(() => {
 void loadUser();
 }, [loadUser]);

 const updateProfile = async () => {
 try {
 setSaving(true);
 const { error } = await supabase
 .from('users')
 .update({
 name: profileForm.name,
 phone: profileForm.phone,
 timezone: profileForm.timezone,
 language: profileForm.language,
 updated_at: new Date().toISOString()
 })
 .eq('id', user?.id);

 if (error) throw error;

 toast.success('Profile updated successfully');

 if (user) {
 await loadProfile(user.id);
 }
 } catch (error) {
 console.error('Error updating profile:', error);
 toast.error('Failed to update profile');
 } finally {
 setSaving(false);
 }
 };

 const updatePassword = async () => {
 if (passwordForm.newPassword !== passwordForm.confirmPassword) {
 toast.error('Passwords do not match');
 return;
 }

 try {
 setSaving(true);
 const { error } = await supabase.auth.updateUser({
 password: passwordForm.newPassword
 });

 if (error) throw error;

 toast.success('Password updated successfully');

 setPasswordForm({
 currentPassword: '',
 newPassword: '',
 confirmPassword: ''
 });
 } catch (error) {
 console.error('Error updating password:', error);
 toast.error('Failed to update password');
 } finally {
 setSaving(false);
 }
 };

 const enable2FA = async () => {
 try {
 setSaving(true);
 const data = await setupTwoFactor();
 setTwoFactorQR(data.qrCode);
 } catch (error) {
 console.error('Error enabling 2FA:', error);
 toast.error('Failed to enable 2FA');
 } finally {
 setSaving(false);
 }
 };

 const verify2FA = async () => {
 try {
 setSaving(true);
 const result = await verifyTwoFactor(verificationCode);
 setTwoFactorEnabled(true);
 setTwoFactorQR('');
 setVerificationCode('');

 toast.success('2FA enabled successfully', undefined, {
 description: `Backup codes: ${result.backupCodes.join(', ')}`
 });
 } catch (error) {
 console.error('Error verifying 2FA:', error);
 toast.error('Invalid verification code');
 } finally {
 setSaving(false);
 }
 };

 const revokeSession = async (sessionId: string) => {
 try {
 await revokeSessionApi(sessionId);

 toast.success('Session revoked successfully');

 await loadSessions();
 } catch (error) {
 console.error('Error revoking session:', error);
 toast.error('Failed to revoke session');
 }
 };

 const revokeAllSessions = async () => {
 try {
 const count = await revokeAllSessionsApi();
 toast.success(`Revoked ${count} sessions`);

 await loadSessions();
 } catch (error) {
 console.error('Error revoking all sessions:', error);
 toast.error('Failed to revoke sessions');
 }
 };

 const createApiKey = async () => {
 try {
 setSaving(true);
 const expiresDays = parseInt(newApiKeyForm.expiresIn, 10);
 const expiresAt = expiresDays > 0
 ? new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString()
 : undefined;

 const data = await createApiKeyApi({
 name: newApiKeyForm.name,
 description: newApiKeyForm.description,
 scopes: newApiKeyForm.scopes,
 expiresAt
 });

 toast.success('API Key Created', undefined, {
 description: `Store this key securely: ${data.apiKey.key}`
 });

 setShowCreateApiKey(false);
 setNewApiKeyForm({
 name: '',
 description: '',
 scopes: [],
 expiresIn: '90'
 });

 await loadApiKeys();
 } catch (error) {
 console.error('Error creating API key:', error);
 toast.error('Failed to create API key');
 } finally {
 setSaving(false);
 }
 };

 const revokeApiKey = async (keyId: string) => {
 try {
 await revokeApiKeyApi(keyId);

 toast.success('API key revoked successfully');

 await loadApiKeys();
 } catch (error) {
 console.error('Error revoking API key:', error);
 toast.error('Failed to revoke API key');
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center h-container-lg">
 <Loader className="h-icon-lg w-icon-lg animate-spin" />
 </div>
 );
 }

 return (
 <div className="container max-w-6xl mx-auto p-lg space-y-lg">
 <div>
 <h1 className="text-3xl font-bold">Account Settings</h1>
 <p className="text-muted-foreground mt-2">
 Manage your personal account settings, security, and API access
 </p>
 </div>

 <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-lg">
 <TabsList className="grid w-full grid-cols-5">
 <TabsTrigger value="profile">
 <User className="h-icon-xs w-icon-xs mr-2" />
 Profile
 </TabsTrigger>
 <TabsTrigger value="password">
 <Lock className="h-icon-xs w-icon-xs mr-2" />
 Password
 </TabsTrigger>
 <TabsTrigger value="2fa">
 <Shield className="h-icon-xs w-icon-xs mr-2" />
 2FA
 </TabsTrigger>
 <TabsTrigger value="sessions">
 <Smartphone className="h-icon-xs w-icon-xs mr-2" />
 Sessions
 </TabsTrigger>
 <TabsTrigger value="api-keys">
 <Key className="h-icon-xs w-icon-xs mr-2" />
 API Keys
 </TabsTrigger>
 </TabsList>

 <TabsContent value="profile" className="space-y-lg">
 <Card>
 <div className="p-lg">
 <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
 <div className="space-y-md">
 <div>
 <Label htmlFor="email">Email</Label>
 <Input
 
 type="email"
 value={profile?.email || ''}
 disabled
 className="bg-muted"
 />
 </div>
 <div>
 <Label htmlFor="name">Full Name</Label>
 <Input
 
 value={profileForm.name}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 setProfileForm({ ...profileForm, name: event.target.value })
 }
 placeholder="Enter your full name"
 />
 </div>
 <div>
 <Label htmlFor="phone">Phone Number</Label>
 <Input
 
 type="tel"
 value={profileForm.phone}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 setProfileForm({ ...profileForm, phone: event.target.value })
 }
 placeholder="+1 (555) 000-0000"
 />
 </div>
 <div className="grid grid-cols-2 gap-md">
 <div>
 <Label htmlFor="timezone">Timezone</Label>
 <select
 
 value={profileForm.timezone}
 onChange={(event: ChangeEvent<HTMLSelectElement>) =>
 setProfileForm({ ...profileForm, timezone: event.target.value })
 }
 className="w-full px-sm py-xs border rounded-md"
 >
 <option value="UTC">UTC</option>
 <option value="America/New_York">Eastern Time</option>
 <option value="America/Chicago">Central Time</option>
 <option value="America/Denver">Mountain Time</option>
 <option value="America/Los_Angeles">Pacific Time</option>
 </select>
 </div>
 <div>
 <Label htmlFor="language">Language</Label>
 <select
 
 value={profileForm.language}
 onChange={(event: ChangeEvent<HTMLSelectElement>) =>
 setProfileForm({ ...profileForm, language: event.target.value })
 }
 className="w-full px-sm py-xs border rounded-md"
 >
 <option value="en">English</option>
 <option value="es">Spanish</option>
 <option value="fr">French</option>
 <option value="de">German</option>
 <option value="ja">Japanese</option>
 </select>
 </div>
 </div>
 <Button onClick={updateProfile} disabled={saving}>
 {saving ? 'Saving...' : 'Save Changes'}
 </Button>
 </div>
 </div>
 </Card>
 </TabsContent>

 <TabsContent value="password" className="space-y-lg">
 <Card>
 <div className="p-lg">
 <h2 className="text-xl font-semibold mb-4">Change Password</h2>
 <div className="space-y-md">
 <div>
 <Label htmlFor="current-password">Current Password</Label>
 <Input
 
 type="password"
 value={passwordForm.currentPassword}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 setPasswordForm({ ...passwordForm, currentPassword: event.target.value })
 }
 placeholder="Enter current password"
 />
 </div>
 <div>
 <Label htmlFor="new-password">New Password</Label>
 <Input
 
 type="password"
 value={passwordForm.newPassword}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 setPasswordForm({ ...passwordForm, newPassword: event.target.value })
 }
 placeholder="Enter new password"
 />
 </div>
 <div>
 <Label htmlFor="confirm-password">Confirm New Password</Label>
 <Input
 
 type="password"
 value={passwordForm.confirmPassword}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })
 }
 placeholder="Confirm new password"
 />
 </div>
 <Alert>
 <AlertCircle className="h-icon-xs w-icon-xs" />
 <div>
 <p className="font-semibold">Password Requirements</p>
 <ul className="list-disc list-inside text-sm mt-1">
 <li>At least 8 characters long</li>
 <li>Contains uppercase and lowercase letters</li>
 <li>Contains at least one number</li>
 </ul>
 </div>
 </Alert>
 <Button onClick={updatePassword} disabled={saving}>
 {saving ? 'Updating...' : 'Update Password'}
 </Button>
 </div>
 </div>
 </Card>
 </TabsContent>

 <TabsContent value="2fa" className="space-y-lg">
 <Card>
 <div className="p-lg">
 <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>
 {twoFactorEnabled ? (
 <div className="space-y-md">
 <Alert>
 <Shield className="h-icon-xs w-icon-xs" />
 <div>
 <p className="font-semibold">2FA is enabled</p>
 <p className="text-sm mt-1">
 Your account is protected with two-factor authentication
 </p>
 </div>
 </Alert>
 <Button variant="destructive" onClick={() => setTwoFactorEnabled(false)}>
 Disable 2FA
 </Button>
 </div>
 ) : (
 <div className="space-y-md">
 <p className="text-muted-foreground">
 Add an extra layer of security to your account by enabling two-factor authentication
 </p>
 {twoFactorQR ? (
 <div className="space-y-md">
 <div className="p-md bg-muted rounded-lg">
 <p className="text-sm mb-2">Scan this QR code with your authenticator app:</p>
 <div className="bg-white p-md rounded inline-block">
 {/* QR Code would be displayed here */}
 <div className="h-component-xl w-component-xl bg-gray-200 flex items-center justify-center">
 QR Code
 </div>
 </div>
 </div>
 <div>
 <Label htmlFor="verification-code">Verification Code</Label>
 <Input
 
 value={verificationCode}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 setVerificationCode(event.target.value)
 }
 placeholder="Enter 6-digit code"
 maxLength={6}
 />
 </div>
 <div className="flex gap-xs">
 <Button onClick={verify2FA} disabled={saving}>
 {saving ? 'Verifying...' : 'Verify & Enable'}
 </Button>
 <Button variant="outline" onClick={() => setTwoFactorQR('')}>
 Cancel
 </Button>
 </div>
 </div>
 ) : (
 <Button onClick={enable2FA} disabled={saving}>
 {saving ? 'Setting up...' : 'Enable 2FA'}
 </Button>
 )}
 </div>
 )}
 </div>
 </Card>
 </TabsContent>

 <TabsContent value="sessions" className="space-y-lg">
 <Card>
 <div className="p-lg">
 <div className="flex justify-between items-center mb-4">
 <h2 className="text-xl font-semibold">Active Sessions</h2>
 <Button variant="destructive" size="sm" onClick={revokeAllSessions}>
 Revoke All Other Sessions
 </Button>
 </div>
 {loadingSessions ? (
 <div className="flex justify-center py-xl">
 <Loader className="h-icon-md w-icon-md animate-spin" />
 </div>
 ) : (
 <div className="space-y-md">
 {sessions.map((session) => (
 <div key={session.id} className="border rounded-lg p-md">
 <div className="flex justify-between items-start">
 <div className="space-y-xs">
 <div className="flex items-center gap-xs">
 <Smartphone className="h-icon-xs w-icon-xs" />
 <span className="font-medium">
 {session.deviceInfo?.device || 'Unknown Device'}
 </span>
 {session.isCurrent && (
 <Badge variant="success">Current</Badge>
 )}
 </div>
 <p className="text-sm text-muted-foreground">
 {session.userAgent}
 </p>
 <div className="flex items-center gap-md text-xs text-muted-foreground">
 <span className="flex items-center gap-xs">
 <Globe className="h-3 w-3" />
 {session.ipAddress}
 </span>
 {session.location && (
 <span>
 {session.location.city}, {session.location.country}
 </span>
 )}
 <span className="flex items-center gap-xs">
 <Clock className="h-3 w-3" />
 Last active: {new Date(session.lastActivityAt).toLocaleString()}
 </span>
 </div>
 </div>
 {!session.isCurrent && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => revokeSession(session.id)}
 >
 Revoke
 </Button>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </Card>
 </TabsContent>

 <TabsContent value="api-keys" className="space-y-lg">
 <Card>
 <div className="p-lg">
 <div className="flex justify-between items-center mb-4">
 <h2 className="text-xl font-semibold">API Keys</h2>
 <Button onClick={() => setShowCreateApiKey(true)}>
 Create API Key
 </Button>
 </div>
 {loadingApiKeys ? (
 <div className="flex justify-center py-xl">
 <Loader className="h-icon-md w-icon-md animate-spin" />
 </div>
 ) : (
 <div className="space-y-md">
 {apiKeys.length === 0 ? (
 <p className="text-muted-foreground text-center py-xl">
 No API keys created yet
 </p>
 ) : (
 apiKeys.map((apiKey) => (
 <div key={apiKey.id} className="border rounded-lg p-md">
 <div className="flex justify-between items-start">
 <div className="space-y-xs">
 <div className="flex items-center gap-xs">
 <span className="font-medium">{apiKey.name}</span>
 <Badge variant={apiKey.isActive ? 'success' : 'secondary'}>
 {apiKey.isActive ? 'Active' : 'Inactive'}
 </Badge>
 </div>
 {apiKey.description && (
 <p className="text-sm text-muted-foreground">
 {apiKey.description}
 </p>
 )}
 <div className="flex items-center gap-md text-xs text-muted-foreground">
 <span>Key: {apiKey.keyPrefix}...</span>
 {apiKey.lastUsedAt && (
 <span>Last used: {new Date(apiKey.lastUsedAt).toLocaleString()}</span>
 )}
 {apiKey.expiresAt && (
 <span>Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}</span>
 )}
 </div>
 {apiKey.scopes.length > 0 && (
 <div className="flex gap-xs mt-2">
 {apiKey.scopes.map((scope: string) => (
 <Badge key={scope} variant="outline" className="text-xs">
 {scope}
 </Badge>
 ))}
 </div>
 )}
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => revokeApiKey(apiKey.id)}
 >
 Revoke
 </Button>
 </div>
 </div>
 ))
 )}
 </div>
 )}
 </div>
 </Card>

 {showCreateApiKey && (
 <Card>
 <div className="p-lg">
 <h3 className="text-lg font-semibold mb-4">Create New API Key</h3>
 <div className="space-y-md">
 <div>
 <Label htmlFor="api-key-name">Name</Label>
 <Input
 
 value={newApiKeyForm.name}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 setNewApiKeyForm({ ...newApiKeyForm, name: event.target.value })
 }
 placeholder="My API Key"
 />
 </div>
 <div>
 <Label htmlFor="api-key-description">Description (optional)</Label>
 <Input
 
 value={newApiKeyForm.description}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 setNewApiKeyForm({ ...newApiKeyForm, description: event.target.value })
 }
 placeholder="Used for..."
 />
 </div>
 <div>
 <Label htmlFor="api-key-expires">Expires In</Label>
 <select
 
 value={newApiKeyForm.expiresIn}
 onChange={(event: ChangeEvent<HTMLSelectElement>) =>
 setNewApiKeyForm({ ...newApiKeyForm, expiresIn: event.target.value })
 }
 className="w-full px-sm py-xs border rounded-md"
 >
 <option value="30">30 days</option>
 <option value="60">60 days</option>
 <option value="90">90 days</option>
 <option value="180">180 days</option>
 <option value="365">1 year</option>
 <option value="0">Never</option>
 </select>
 </div>
 <div className="flex gap-xs">
 <Button onClick={createApiKey} disabled={saving || !newApiKeyForm.name}>
 {saving ? 'Creating...' : 'Create Key'}
 </Button>
 <Button variant="outline" onClick={() => setShowCreateApiKey(false)}>
 Cancel
 </Button>
 </div>
 </div>
 </div>
 </Card>
 )}
 </TabsContent>
 </Tabs>
 </div>
 );
}
