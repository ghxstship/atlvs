'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Shield, Smartphone, Key, Globe, Clock, AlertCircle, Save, Eye, EyeOff } from "lucide-react";
import { createBrowserClient } from '@ghxstship/auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  Alert,
  AlertDescription,
} from '@ghxstship/ui';

interface AccountSettingsProps {
  userId: string;
  orgId: string;
}

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

export default function AccountSettings({ userId, orgId }: AccountSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  // const toast = useToast();
  const supabase = createBrowserClient();

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    timezone: 'UTC',
    language: 'en'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .single();

        if (error) throw error;

        setProfile(data);
        if (!profile) {
          console.error('Unable to load user profile');
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, supabase]);

  const handleProfileUpdate = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileForm.name,
          phone: profileForm.phone,
          timezone: profileForm.timezone,
          language: profileForm.language,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast({
        title: 'Success',
        description: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: 'Error',
        description: 'Failed to update password',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading account settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      <Tabs defaultValue="profile" className="space-y-lg">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-lg">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <User className="h-icon-sm w-icon-sm" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div className="space-y-xs">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-xs">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-xs">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={profileForm.timezone}
                    onValueChange={(value) => setProfileForm(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-xs">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={profileForm.language}
                    onValueChange={(value) => setProfileForm(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleProfileUpdate} disabled={saving}>
                  <Save className="h-icon-xs w-icon-xs mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-lg">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Lock className="h-icon-sm w-icon-sm" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <Alert>
                <AlertCircle className="h-icon-xs w-icon-xs" />
                <AlertDescription>
                  Password must be at least 8 characters long and contain a mix of letters, numbers, and symbols.
                </AlertDescription>
              </Alert>

              <div className="space-y-md">
                <div className="space-y-xs">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-sm py-xs hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-icon-xs w-icon-xs" /> : <Eye className="h-icon-xs w-icon-xs" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-xs">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-xs">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handlePasswordChange} disabled={saving}>
                  <Lock className="h-icon-xs w-icon-xs mr-2" />
                  {saving ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-lg">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Shield className="h-icon-sm w-icon-sm" />
                Two-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable 2FA</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>

              {twoFactorEnabled ? (
                <Alert>
                  <Smartphone className="h-icon-xs w-icon-xs" />
                  <AlertDescription>
                    Two-factor authentication is enabled. Use an authenticator app to generate codes.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertCircle className="h-icon-xs w-icon-xs" />
                  <AlertDescription>
                    Two-factor authentication is disabled. Enable it to secure your account.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Clock className="h-icon-sm w-icon-sm" />
                Session Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your active sessions across devices.
              </p>
              <Button variant="outline" size="sm">
                View Active Sessions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-lg">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage devices and sessions where you're currently signed in.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-xl">
                <Globe className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Session management interface will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-lg">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Key className="h-icon-sm w-icon-sm" />
                API Keys
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage API keys for programmatic access to your account.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-xl">
                <Key className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  API key management interface will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
