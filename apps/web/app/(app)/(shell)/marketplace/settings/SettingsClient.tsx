'use client';

import { Settings, Bell, Shield, CreditCard, Globe, Users, Eye, Lock, Mail, Smartphone, Save, RefreshCw, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { useState, useEffect } from 'react';
import { 
 Card,
 Button,
 Input,
 Textarea,
 Select,
 Badge
} from '@ghxstship/ui';

interface SettingsClientProps {
 orgId: string;
 userId: string;
}

interface MarketplaceSettings {
 // Profile Settings
 display_name: string;
 business_description: string;
 website_url: string;
 logo_url: string;
 
 // Privacy Settings
 profile_visibility: 'public' | 'marketplace_only' | 'private';
 show_contact_info: boolean;
 allow_direct_messages: boolean;
 
 // Notification Settings
 email_notifications: {
 new_messages: boolean;
 project_updates: boolean;
 payment_notifications: boolean;
 review_notifications: boolean;
 marketing_emails: boolean;
 };
 
 sms_notifications: {
 urgent_messages: boolean;
 payment_alerts: boolean;
 };
 
 // Marketplace Preferences
 auto_accept_projects: boolean;
 default_response_time: string;
 preferred_categories: string[];
 minimum_project_value: number;
 currency: string;
 
 // Security Settings
 two_factor_enabled: boolean;
 login_notifications: boolean;
 session_timeout: number;
 
 // Payment Settings
 auto_invoice: boolean;
 payment_terms: string;
 late_fee_percentage: number;
 escrow_preference: 'always' | 'large_projects' | 'never';
}

export default function SettingsClient({ orgId, userId }: SettingsClientProps) {
 const [settings, setSettings] = useState<MarketplaceSettings>({
 display_name: '',
 business_description: '',
 website_url: '',
 logo_url: '',
 profile_visibility: 'public',
 show_contact_info: true,
 allow_direct_messages: true,
 email_notifications: {
 new_messages: true,
 project_updates: true,
 payment_notifications: true,
 review_notifications: true,
 marketing_emails: false
 },
 sms_notifications: {
 urgent_messages: false,
 payment_alerts: true
 },
 auto_accept_projects: false,
 default_response_time: '24 hours',
 preferred_categories: [],
 minimum_project_value: 0,
 currency: 'USD',
 two_factor_enabled: false,
 login_notifications: true,
 session_timeout: 30,
 auto_invoice: true,
 payment_terms: 'Net 30',
 late_fee_percentage: 1.5,
 escrow_preference: 'large_projects'
 });
 
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [activeTab, setActiveTab] = useState('profile');

 useEffect(() => {
 loadSettings();
 }, [orgId]);

 const loadSettings = async () => {
 try {
 setLoading(true);
 
 // Mock settings data - would load from API
 const mockSettings: MarketplaceSettings = {
 display_name: 'Your Organization',
 business_description: 'Professional live event production and technical services',
 website_url: 'https://yourorganization.com',
 logo_url: '',
 profile_visibility: 'public',
 show_contact_info: true,
 allow_direct_messages: true,
 email_notifications: {
 new_messages: true,
 project_updates: true,
 payment_notifications: true,
 review_notifications: true,
 marketing_emails: false
 },
 sms_notifications: {
 urgent_messages: false,
 payment_alerts: true
 },
 auto_accept_projects: false,
 default_response_time: '24 hours',
 preferred_categories: ['audio_visual', 'lighting'],
 minimum_project_value: 1000,
 currency: 'USD',
 two_factor_enabled: false,
 login_notifications: true,
 session_timeout: 30,
 auto_invoice: true,
 payment_terms: 'Net 30',
 late_fee_percentage: 1.5,
 escrow_preference: 'large_projects'
 };

 setSettings(mockSettings);
 } catch (error) {
 console.error('Error loading settings:', error);
 } finally {
 setLoading(false);
 }
 };

 const handleSave = async () => {
 try {
 setSaving(true);
 
 // Mock save - would save to API
 await new Promise(resolve => setTimeout(resolve, 1000));
 
 } catch (error) {
 console.error('Error saving settings:', error);
 } finally {
 setSaving(false);
 }
 };

 const updateSettings = (updates: Partial<MarketplaceSettings>) => {
 setSettings(prev => ({ ...prev, ...updates }));
 };

 const updateNestedSettings = (section: keyof MarketplaceSettings, updates: unknown) => {
 setSettings(prev => ({
 ...prev,
 [section]: { ...prev[section], ...updates }
 }));
 };

 const tabs = [
 { id: 'profile', label: 'Profile', icon: Users },
 { id: 'privacy', label: 'Privacy', icon: Eye },
 { id: 'notifications', label: 'Notifications', icon: Bell },
 { id: 'marketplace', label: 'Marketplace', icon: Globe },
 { id: 'security', label: 'Security', icon: Shield },
 { id: 'payments', label: 'Payments', icon: CreditCard }
 ];

 const renderProfileSettings = () => (
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md">Profile Information</h3>
 <div className="stack-md">
 <Input
 
 value={settings.display_name}
 onChange={(e) => updateSettings({ display_name: e.target.value })}
 placeholder="How you appear in the marketplace"
 />
 
 <Textarea
 
 value={settings.business_description}
 onChange={(e) => updateSettings({ business_description: e.target.value })}
 placeholder="Describe your business and services"
 rows={4}
 />
 
 <Input
 
 value={settings.website_url}
 onChange={(e) => updateSettings({ website_url: e.target.value })}
 placeholder="https://yourwebsite.com"
 />
 
 <div>
 <label className="text-body-sm font-medium mb-xs block">Logo</label>
 <div className="flex items-center gap-sm">
 <div className="h-component-md w-component-md bg-muted rounded flex items-center justify-center">
 {settings.logo_url ? (
 <img src={settings.logo_url} alt="Logo" className="h-full w-full object-cover rounded" />
 ) : (
 <Users className="h-icon-lg w-icon-lg color-muted" />
 )}
 </div>
 <div className="flex gap-sm">
 <Button variant="outline" size="sm">Upload Logo</Button>
 {settings.logo_url && (
 <Button variant="outline" size="sm">
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 )}
 </div>
 </div>
 </div>
 </div>
 </Card>
 );

 const renderPrivacySettings = () => (
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md">Privacy Settings</h3>
 <div className="stack-md">
 <div>
 <label className="text-body-sm font-medium mb-xs block">Profile Visibility</label>
 <Select
 value={settings.profile_visibility}
 onValueChange={(value: unknown) => updateSettings({ profile_visibility: value })}
 >
 <option value="public">Public - Visible to everyone</option>
 <option value="marketplace_only">Marketplace Only - Visible to marketplace users</option>
 <option value="private">Private - Only visible to direct contacts</option>
 </Select>
 </div>
 
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body font-medium">Show Contact Information</p>
 <p className="text-body-sm color-muted">Display email and phone in your profile</p>
 </div>
 <input
 type="checkbox"
 checked={settings.show_contact_info}
 onChange={(e) => updateSettings({ show_contact_info: e.target.checked })}
 />
 </div>
 
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body font-medium">Allow Direct Messages</p>
 <p className="text-body-sm color-muted">Let other users message you directly</p>
 </div>
 <input
 type="checkbox"
 checked={settings.allow_direct_messages}
 onChange={(e) => updateSettings({ allow_direct_messages: e.target.checked })}
 />
 </div>
 </div>
 </Card>
 );

 const renderNotificationSettings = () => (
 <div className="stack-md">
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md flex items-center gap-sm">
 <Mail className="h-icon-sm w-icon-sm" />
 Email Notifications
 </h3>
 <div className="stack-sm">
 {Object.entries(settings.email_notifications).map(([key, value]) => (
 <div key={key} className="flex items-center justify-between">
 <div>
 <p className="text-body font-medium capitalize">
 {key.replace('_', ' ')}
 </p>
 </div>
 <input
 type="checkbox"
 checked={value}
 onChange={(e) => updateNestedSettings('email_notifications', { [key]: e.target.checked })}
 />
 </div>
 ))}
 </div>
 </Card>
 
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md flex items-center gap-sm">
 <Smartphone className="h-icon-sm w-icon-sm" />
 SMS Notifications
 </h3>
 <div className="stack-sm">
 {Object.entries(settings.sms_notifications).map(([key, value]) => (
 <div key={key} className="flex items-center justify-between">
 <div>
 <p className="text-body font-medium capitalize">
 {key.replace('_', ' ')}
 </p>
 </div>
 <input
 type="checkbox"
 checked={value}
 onChange={(e) => updateNestedSettings('sms_notifications', { [key]: e.target.checked })}
 />
 </div>
 ))}
 </div>
 </Card>
 </div>
 );

 const renderMarketplaceSettings = () => (
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md">Marketplace Preferences</h3>
 <div className="stack-md">
 <div>
 <label className="text-body-sm font-medium mb-xs block">Default Response Time</label>
 <Select
 value={settings.default_response_time}
 onValueChange={(value) => updateSettings({ default_response_time: value })}
 >
 <option value="1 hour">Within 1 hour</option>
 <option value="4 hours">Within 4 hours</option>
 <option value="24 hours">Within 24 hours</option>
 <option value="48 hours">Within 48 hours</option>
 </Select>
 </div>
 
 <div className="grid grid-cols-2 gap-sm">
 <Input
 
 type="number"
 value={settings.minimum_project_value}
 onChange={(e) => updateSettings({ minimum_project_value: parseFloat(e.target.value) || 0 })}
 />
 
 <Select
 
 value={settings.currency}
 onValueChange={(value) => updateSettings({ currency: value })}
 >
 <option value="USD">USD</option>
 <option value="EUR">EUR</option>
 <option value="GBP">GBP</option>
 <option value="CAD">CAD</option>
 </Select>
 </div>
 
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body font-medium">Auto-accept Projects</p>
 <p className="text-body-sm color-muted">Automatically accept projects that meet your criteria</p>
 </div>
 <input
 type="checkbox"
 checked={settings.auto_accept_projects}
 onChange={(e) => updateSettings({ auto_accept_projects: e.target.checked })}
 />
 </div>
 </div>
 </Card>
 );

 const renderSecuritySettings = () => (
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md">Security Settings</h3>
 <div className="stack-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body font-medium">Two-Factor Authentication</p>
 <p className="text-body-sm color-muted">Add an extra layer of security to your account</p>
 </div>
 <div className="flex items-center gap-sm">
 {settings.two_factor_enabled && (
 <Badge variant="success" size="sm">Enabled</Badge>
 )}
 <Button variant="outline" size="sm">
 {settings.two_factor_enabled ? 'Disable' : 'Enable'}
 </Button>
 </div>
 </div>
 
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body font-medium">Login Notifications</p>
 <p className="text-body-sm color-muted">Get notified of new login attempts</p>
 </div>
 <input
 type="checkbox"
 checked={settings.login_notifications}
 onChange={(e) => updateSettings({ login_notifications: e.target.checked })}
 />
 </div>
 
 <div>
 <label className="text-body-sm font-medium mb-xs block">Session Timeout (minutes)</label>
 <Select
 value={settings.session_timeout.toString()}
 onValueChange={(value) => updateSettings({ session_timeout: parseInt(value) })}
 >
 <option value="15">15 minutes</option>
 <option value="30">30 minutes</option>
 <option value="60">1 hour</option>
 <option value="240">4 hours</option>
 </Select>
 </div>
 </div>
 </Card>
 );

 const renderPaymentSettings = () => (
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md">Payment Settings</h3>
 <div className="stack-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body font-medium">Auto-generate Invoices</p>
 <p className="text-body-sm color-muted">Automatically create invoices for completed work</p>
 </div>
 <input
 type="checkbox"
 checked={settings.auto_invoice}
 onChange={(e) => updateSettings({ auto_invoice: e.target.checked })}
 />
 </div>
 
 <div className="grid grid-cols-2 gap-sm">
 <Select
 
 value={settings.payment_terms}
 onValueChange={(value) => updateSettings({ payment_terms: value })}
 >
 <option value="Due on receipt">Due on receipt</option>
 <option value="Net 15">Net 15</option>
 <option value="Net 30">Net 30</option>
 <option value="Net 60">Net 60</option>
 </Select>
 
 <Input
 
 type="number"
 step="0.1"
 value={settings.late_fee_percentage}
 onChange={(e) => updateSettings({ late_fee_percentage: parseFloat(e.target.value) || 0 })}
 />
 </div>
 
 <div>
 <label className="text-body-sm font-medium mb-xs block">Escrow Preference</label>
 <Select
 value={settings.escrow_preference}
 onValueChange={(value: unknown) => updateSettings({ escrow_preference: value })}
 >
 <option value="always">Always use escrow</option>
 <option value="large_projects">Use for large projects only</option>
 <option value="never">Never use escrow</option>
 </Select>
 </div>
 </div>
 </Card>
 );

 const renderTabContent = () => {
 switch (activeTab) {
 case 'profile': return renderProfileSettings();
 case 'privacy': return renderPrivacySettings();
 case 'notifications': return renderNotificationSettings();
 case 'marketplace': return renderMarketplaceSettings();
 case 'security': return renderSecuritySettings();
 case 'payments': return renderPaymentSettings();
 default: return renderProfileSettings();
 }
 };

 return (
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-heading-2">Marketplace Settings</h1>
 <p className="color-muted">Configure your marketplace preferences and account settings</p>
 </div>
 <div className="flex items-center gap-sm">
 <Button variant="outline" onClick={loadSettings} disabled={loading}>
 <RefreshCw className="h-icon-xs w-icon-xs mr-sm" />
 Reset
 </Button>
 <Button onClick={handleSave} loading={saving}>
 <Save className="h-icon-xs w-icon-xs mr-sm" />
 Save Changes
 </Button>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-4 gap-md">
 {/* Settings Navigation */}
 <Card className="p-md lg:col-span-1">
 <h3 className="text-heading-5 mb-md">Settings</h3>
 <div className="stack-xs">
 {tabs.map((tab) => {
 const Icon = tab.icon;
 return (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex items-center gap-sm p-sm rounded text-left w-full transition-colors ${
 activeTab === tab.id 
 ? 'bg-primary text-primary-foreground' 
 : 'hover:bg-muted'
 }`}
 >
 <Icon className="h-icon-xs w-icon-xs" />
 <span className="text-body-sm">{tab.label}</span>
 </button>
 );
 })}
 </div>
 </Card>

 {/* Settings Content */}
 <div className="lg:col-span-3">
 {renderTabContent()}
 </div>
 </div>
 </div>
 );
}
