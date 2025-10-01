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
 Save,
 AlertTriangle,
 EyeOff,
 Eye,
 Copy,
 RefreshCw,
 X,
} from "lucide-react";
import { useState, useEffect } from 'react';
import { type ControllerRenderProps, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
 Drawer,
 Form,
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
 Input,
 Textarea,
 Button,
 useToastContext,
 Tabs,
 TabsContent,
 TabsList,
 TabsTrigger,
 Badge,
 Alert,
 AlertDescription,
} from '@ghxstship/ui';
import type { AccountDrawerProps, AccountRecord, ProfileFormData, PasswordFormData } from '../types';
import { accountService } from '../lib/account-service';

const profileFormSchema = z.object({
 name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
 email: z.string().email('Invalid email address'),
 phone: z.string().optional(),
 timezone: z.string().optional(),
 language: z.string().optional(),
});

const passwordFormSchema = z.object({
 current_password: z.string().min(1, 'Current password is required'),
 new_password: z.string().min(8, 'Password must be at least 8 characters'),
 confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
 message: "Passwords don't match",
 path: ["confirm_password"],
});

export default function EditAccountDrawer({
 mode,
 record,
 isOpen,
 onClose,
 onSave,
 onDelete,
}: AccountDrawerProps) {
 const { toast } = useToastContext();
 const [saving, setSaving] = useState(false);
 const [deleting, setDeleting] = useState(false);
 const [activeTab, setActiveTab] = useState('details');
 const [showPassword, setShowPassword] = useState(false);
 const [showNewPassword, setShowNewPassword] = useState(false);
 const [twoFactorQr, setTwoFactorQr] = useState<string | null>(null);

 const profileForm = useForm<ProfileFormData>({
 resolver: zodResolver(profileFormSchema),
 defaultValues: {
 name: '',
 email: '',
 phone: '',
 timezone: '',
 language: '',
 },
 });

 const passwordForm = useForm<PasswordFormData>({
 resolver: zodResolver(passwordFormSchema),
 defaultValues: {
 current_password: '',
 new_password: '',
 confirm_password: '',
 },
 });

 const isReadOnly = mode === 'view';

 // Load record data when drawer opens
 useEffect(() => {
 if (record && isOpen) {
 if (record.type === 'profile' && record.metadata) {
 profileForm.reset({
 name: record.metadata.name || '',
 email: record.metadata.email || '',
 phone: record.metadata.phone || '',
 timezone: record.metadata.timezone || '',
 language: record.metadata.language || '',
 });
 }
 }
 }, [record, isOpen, profileForm]);

 const handleProfileSave = async (data: ProfileFormData) => {
 if (!record || !onSave) return;

 try {
 setSaving(true);
 await accountService.updateProfile(data);
 toast.success('Profile updated successfully');
 onClose();
 } catch (error) {
 console.error('Error updating profile:', error);
 toast.error('Failed to update profile');
 } finally {
 setSaving(false);
 }
 };

 const handlePasswordChange = async (data: PasswordFormData) => {
 try {
 setSaving(true);
 await accountService.changePassword(data);
 toast.success('Password changed successfully');
 passwordForm.reset();
 } catch (error) {
 console.error('Error changing password:', error);
 toast.error('Failed to change password');
 } finally {
 setSaving(false);
 }
 };

 const handleRevokeSession = async () => {
 if (!record || record.type !== 'session') return;

 try {
 setDeleting(true);
 await accountService.revokeSession(record.metadata.id);
 toast.success('Session revoked successfully');
 onClose();
 } catch (error) {
 console.error('Error revoking session:', error);
 toast.error('Failed to revoke session');
 } finally {
 setDeleting(false);
 }
 };

 const handleRevokeApiKey = async () => {
 if (!record || record.type !== 'api_key') return;

 try {
 setDeleting(true);
 await accountService.revokeApiKey(record.metadata.id);
 toast.success('API key revoked successfully');
 onClose();
 } catch (error) {
 console.error('Error revoking API key:', error);
 toast.error('Failed to revoke API key');
 } finally {
 setDeleting(false);
 }
 };

 const handleSetupTwoFactor = async () => {
 try {
 setSaving(true);
 const qrCode = await accountService.setupTwoFactor();
 setTwoFactorQr(qrCode);
 toast.success('2FA setup initiated');
 } catch (error) {
 console.error('Error setting up 2FA:', error);
 toast.error('Failed to setup 2FA');
 } finally {
 setSaving(false);
 }
 };

 const handleCopyToClipboard = (text: string) => {
 navigator.clipboard.writeText(text);
 toast.success('Copied to clipboard');
 };

 const handleClose = () => {
 profileForm.reset();
 passwordForm.reset();
 setActiveTab('details');
 setTwoFactorQr(null);
 onClose();
 };

 const getDrawerTitle = () => {
 if (!record) return 'Account Record';
 
 const typeLabels = {
 profile: 'User Profile',
 session: 'User Session',
 api_key: 'API Key',
 security: 'Security Settings',
 preference: 'User Preferences',
 };

 const prefix = mode === 'view' ? 'View' : 'Edit';
 return `${prefix} ${typeLabels[record.type] || 'Account Record'}`;
 };

 const getDrawerDescription = () => {
 if (!record) return 'Manage account record';
 
 if (mode === 'view') return `View ${record.type} details and information`;
 return `Modify ${record.type} settings and configuration`;
 };

 const renderProfileTab = () => (
 <Form {...profileForm}>
 <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="space-y-md">
 <FormField
 control={profileForm.control}
 
 render={({ field }: { field: ControllerRenderProps<ProfileFormData, 'name'> }) => (
 <FormItem>
 <FormLabel>Full Name</FormLabel>
 <FormControl>
 <Input 
 placeholder="Enter your full name"
 disabled={isReadOnly}
 {...field} 
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={profileForm.control}
 
 render={({ field }: { field: ControllerRenderProps<ProfileFormData, 'email'> }) => (
 <FormItem>
 <FormLabel>Email Address</FormLabel>
 <FormControl>
 <Input 
 type="email"
 placeholder="Enter your email"
 disabled={isReadOnly}
 {...field} 
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={profileForm.control}
 
 render={({ field }: { field: ControllerRenderProps<ProfileFormData, 'phone'> }) => (
 <FormItem>
 <FormLabel>Phone Number (Optional)</FormLabel>
 <FormControl>
 <Input 
 placeholder="Enter your phone number"
 disabled={isReadOnly}
 {...field} 
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <div className="grid grid-cols-2 gap-md">
 <FormField
 control={profileForm.control}
 
 render={({ field }: { field: ControllerRenderProps<ProfileFormData, 'timezone'> }) => (
 <FormItem>
 <FormLabel>Timezone (Optional)</FormLabel>
 <FormControl>
 <Input 
 placeholder="e.g., America/New_York"
 disabled={isReadOnly}
 {...field} 
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={profileForm.control}
 
 render={({ field }: { field: ControllerRenderProps<ProfileFormData, 'language'> }) => (
 <FormItem>
 <FormLabel>Language (Optional)</FormLabel>
 <FormControl>
 <Input 
 placeholder="e.g., en-US"
 disabled={isReadOnly}
 {...field} 
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 {!isReadOnly && (
 <div className="flex justify-end pt-4">
 <Button type="submit" disabled={saving}>
 <Save className="h-icon-xs w-icon-xs mr-2" />
 {saving ? 'Saving...' : 'Save Profile'}
 </Button>
 </div>
 )}
 </form>
 </Form>
 );

 const renderPasswordTab = () => (
 <Form {...passwordForm}>
 <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-md">
 <Alert>
 <AlertTriangle className="h-icon-xs w-icon-xs" />
 <AlertDescription>
 Changing your password will log you out of all other sessions.
 </AlertDescription>
 </Alert>

 <FormField
 control={passwordForm.control}
 
 render={({ field }: { field: ControllerRenderProps<PasswordFormData, 'current_password'> }) => (
 <FormItem>
 <FormLabel>Current Password</FormLabel>
 <FormControl>
 <div className="relative">
 <Input 
 type={showPassword ? 'text' : 'password'}
 placeholder="Enter your current password"
 {...field} 
 />
 <Button
 type="button"
 variant="ghost"
 size="sm"
 className="absolute right-0 top-0 h-full px-sm"
 onClick={() => setShowPassword(!showPassword)}
 >
 {showPassword ? <EyeOff className="h-icon-xs w-icon-xs" /> : <Eye className="h-icon-xs w-icon-xs" />}
 </Button>
 </div>
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={passwordForm.control}
 
 render={({ field }: { field: ControllerRenderProps<PasswordFormData, 'new_password'> }) => (
 <FormItem>
 <FormLabel>New Password</FormLabel>
 <FormControl>
 <div className="relative">
 <Input 
 type={showNewPassword ? 'text' : 'password'}
 placeholder="Enter your new password"
 {...field} 
 />
 <Button
 type="button"
 variant="ghost"
 size="sm"
 className="absolute right-0 top-0 h-full px-sm"
 onClick={() => setShowNewPassword(!showNewPassword)}
 >
 {showNewPassword ? <EyeOff className="h-icon-xs w-icon-xs" /> : <Eye className="h-icon-xs w-icon-xs" />}
 </Button>
 </div>
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={passwordForm.control}
 
 render={({ field }: { field: ControllerRenderProps<PasswordFormData, 'confirm_password'> }) => (
 <FormItem>
 <FormLabel>Confirm New Password</FormLabel>
 <FormControl>
 <Input 
 type="password"
 placeholder="Confirm your new password"
 {...field} 
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <div className="flex justify-end pt-4">
 <Button type="submit" disabled={saving}>
 <Save className="h-icon-xs w-icon-xs mr-2" />
 {saving ? 'Changing...' : 'Change Password'}
 </Button>
 </div>
 </form>
 </Form>
 );

 const renderSessionDetails = () => {
 if (!record || record.type !== 'session') return null;

 const session = record.metadata;
 
 return (
 <div className="space-y-md">
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium">IP Address</label>
 <div className="flex items-center gap-xs mt-1">
 <code className="text-sm bg-muted px-xs py-xs rounded flex-1">
 {session.ip_address}
 </code>
 <Button
 size="sm"
 variant="ghost"
 onClick={() => handleCopyToClipboard(session.ip_address)}
 >
 <Copy className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>
 <div>
 <label className="text-sm font-medium">Status</label>
 <div className="mt-1">
 <Badge variant={session.is_current ? 'default' : 'secondary'}>
 {session.is_current ? 'Current Session' : 'Other Session'}
 </Badge>
 </div>
 </div>
 </div>

 <div>
 <label className="text-sm font-medium">User Agent</label>
 <div className="mt-1">
 <Textarea
 value={session.user_agent}
 readOnly
 className="text-sm font-mono"
 rows={3}
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium">Created</label>
 <div className="text-sm text-muted-foreground mt-1">
 {new Date(session.created_at).toLocaleString()}
 </div>
 </div>
 <div>
 <label className="text-sm font-medium">Last Active</label>
 <div className="text-sm text-muted-foreground mt-1">
 {new Date(session.last_active).toLocaleString()}
 </div>
 </div>
 </div>

 {!session.is_current && !isReadOnly && (
 <div className="pt-4 border-t">
 <Button
 variant="destructive"
 onClick={handleRevokeSession}
 disabled={deleting}
 >
 <Trash2 className="h-icon-xs w-icon-xs mr-2" />
 {deleting ? 'Revoking...' : 'Revoke Session'}
 </Button>
 </div>
 )}
 </div>
 );
 };

 const renderApiKeyDetails = () => {
 if (!record || record.type !== 'api_key') return null;

 const apiKey = record.metadata;
 
 return (
 <div className="space-y-md">
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium">Key Name</label>
 <div className="text-sm mt-1">{apiKey.name}</div>
 </div>
 <div>
 <label className="text-sm font-medium">Status</label>
 <div className="mt-1">
 <Badge variant={apiKey.is_active ? 'default' : 'destructive'}>
 {apiKey.is_active ? 'Active' : 'Revoked'}
 </Badge>
 </div>
 </div>
 </div>

 <div>
 <label className="text-sm font-medium">Key Prefix</label>
 <div className="flex items-center gap-xs mt-1">
 <code className="text-sm bg-muted px-xs py-xs rounded flex-1">
 {apiKey.key_prefix}***
 </code>
 <Button
 size="sm"
 variant="ghost"
 onClick={() => handleCopyToClipboard(apiKey.key_prefix)}
 >
 <Copy className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>

 <div>
 <label className="text-sm font-medium">Permissions</label>
 <div className="flex flex-wrap gap-xs mt-1">
 {apiKey.permissions.map((permission: string) => (
 <Badge key={permission} variant="outline" className="text-xs">
 {permission}
 </Badge>
 ))}
 </div>
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium">Created</label>
 <div className="text-sm text-muted-foreground mt-1">
 {new Date(apiKey.created_at).toLocaleString()}
 </div>
 </div>
 <div>
 <label className="text-sm font-medium">Last Used</label>
 <div className="text-sm text-muted-foreground mt-1">
 {apiKey.last_used ? new Date(apiKey.last_used).toLocaleString() : 'Never'}
 </div>
 </div>
 </div>

 {apiKey.is_active && !isReadOnly && (
 <div className="pt-4 border-t">
 <Button
 variant="destructive"
 onClick={handleRevokeApiKey}
 disabled={deleting}
 >
 <Trash2 className="h-icon-xs w-icon-xs mr-2" />
 {deleting ? 'Revoking...' : 'Revoke API Key'}
 </Button>
 </div>
 )}
 </div>
 );
 };

 const renderSecurityDetails = () => {
 if (!record || record.type !== 'security') return null;

 const twoFactor = record.metadata;
 
 return (
 <div className="space-y-md">
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium">Status</label>
 <div className="mt-1">
 <Badge variant={twoFactor.is_enabled ? 'default' : 'secondary'}>
 {twoFactor.is_enabled ? 'Enabled' : 'Disabled'}
 </Badge>
 </div>
 </div>
 <div>
 <label className="text-sm font-medium">Backup Codes</label>
 <div className="text-sm text-muted-foreground mt-1">
 {twoFactor.backup_codes?.length || 0} codes available
 </div>
 </div>
 </div>

 {!twoFactor.is_enabled && !isReadOnly && (
 <div className="space-y-md">
 <Alert>
 <AlertTriangle className="h-icon-xs w-icon-xs" />
 <AlertDescription>
 Two-factor authentication is not enabled. Enable it to secure your account.
 </AlertDescription>
 </Alert>

 <Button onClick={handleSetupTwoFactor} disabled={saving}>
 <RefreshCw className="h-icon-xs w-icon-xs mr-2" />
 {saving ? 'Setting up...' : 'Setup Two-Factor Authentication'}
 </Button>

 {twoFactorQr && (
 <div className="p-md border rounded-lg">
 <p className="text-sm mb-2">Scan this QR code with your authenticator app:</p>
 <code className="text-xs bg-muted p-xs rounded block">
 {twoFactorQr}
 </code>
 </div>
 )}
 </div>
 )}

 {twoFactor.is_enabled && (
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium">Created</label>
 <div className="text-sm text-muted-foreground mt-1">
 {new Date(twoFactor.created_at).toLocaleString()}
 </div>
 </div>
 <div>
 <label className="text-sm font-medium">Last Used</label>
 <div className="text-sm text-muted-foreground mt-1">
 {twoFactor.last_used ? new Date(twoFactor.last_used).toLocaleString() : 'Never'}
 </div>
 </div>
 </div>
 )}
 </div>
 );
 };

 return (
 <Drawer
 isOpen={isOpen}
 onClose={handleClose}
 title={getDrawerTitle()}
 description={getDrawerDescription()}
 >
 <div className="space-y-lg">
 {record && (
 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList className="grid w-full grid-cols-3">
 <TabsTrigger value="details">Details</TabsTrigger>
 {record.type === 'profile' && (
 <TabsTrigger value="password">Password</TabsTrigger>
 )}
 <TabsTrigger value="metadata">Metadata</TabsTrigger>
 </TabsList>

 <TabsContent value="details" className="space-y-md">
 {record.type === 'profile' && renderProfileTab()}
 {record.type === 'session' && renderSessionDetails()}
 {record.type === 'api_key' && renderApiKeyDetails()}
 {record.type === 'security' && renderSecurityDetails()}
 </TabsContent>

 {record.type === 'profile' && (
 <TabsContent value="password" className="space-y-md">
 {renderPasswordTab()}
 </TabsContent>
 )}

 <TabsContent value="metadata" className="space-y-md">
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium">Record ID</label>
 <div className="text-sm text-muted-foreground font-mono mt-1">
 {record.id}
 </div>
 </div>
 <div>
 <label className="text-sm font-medium">Type</label>
 <div className="mt-1">
 <Badge variant="outline">{record.type}</Badge>
 </div>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium">Created</label>
 <div className="text-sm text-muted-foreground mt-1">
 {new Date(record.created_at).toLocaleString()}
 </div>
 </div>
 <div>
 <label className="text-sm font-medium">Last Updated</label>
 <div className="text-sm text-muted-foreground mt-1">
 {new Date(record.updated_at).toLocaleString()}
 </div>
 </div>
 </div>
 </TabsContent>
 </Tabs>
 )}

 <div className="flex justify-end gap-sm pt-4 border-t">
 <Button
 type="button"
 variant="outline"
 onClick={handleClose}
 disabled={saving || deleting}
 >
 <X className="h-icon-xs w-icon-xs mr-2" />
 {mode === 'view' ? 'Close' : 'Cancel'}
 </Button>
 </div>
 </div>
 </Drawer>
 );
}
