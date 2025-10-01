'use client';

import { useState, useEffect } from 'react';
import { Shield, Lock, Eye, AlertTriangle, Clock, Users, Settings as SettingsIcon } from "lucide-react";
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
  Switch,
  Separator,
  Badge,
  Alert,
  AlertDescription,
  useToast,
} from '@ghxstship/ui';

interface SecuritySettingsProps {
  userId: string;
  orgId: string;
}

interface SecurityPolicies {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  passwordMaxAge: number;
  sessionTimeout: number;
  loginAttemptsMax: number;
  lockoutDuration: number;
  requireTwoFactor: boolean;
  ipWhitelist: string[];
}

export default function SecuritySettings({ userId, orgId }: SecuritySettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [policies, setPolicies] = useState<SecurityPolicies>({
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: false,
    passwordMaxAge: 90,
    sessionTimeout: 480,
    loginAttemptsMax: 5,
    lockoutDuration: 30,
    requireTwoFactor: false,
    ipWhitelist: []
  });

  const toast = useToast();
  const supabase = createBrowserClient();

  useEffect(() => {
    const loadSecurityPolicies = async () => {
      try {
        // Load organization security policies
        const { data, error } = await supabase
          .from('organization_settings')
          .select('security_policies')
          .eq('organization_id', orgId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data?.security_policies) {
          setPolicies({ ...policies, ...data.security_policies });
        }
      } catch (error) {
        console.error('Error loading security policies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSecurityPolicies();
  }, [orgId, supabase]);

  const handleSavePolicies = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('organization_settings')
        .upsert({
          organization_id: orgId,
          security_policies: policies,
          updated_at: new Date().toISOString(),
          updated_by: userId
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Security policies updated successfully'
      });
    } catch (error) {
      console.error('Error saving security policies:', error);
      toast({
        title: 'Error',
        description: 'Failed to update security policies',
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
          <p className="mt-2 text-sm text-muted-foreground">Loading security settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <Shield className="h-icon-sm w-icon-sm" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="flex items-center gap-sm p-sm bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="p-xs bg-green-100 dark:bg-green-900 rounded-full">
                <Lock className="h-icon-xs w-icon-xs text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">Password Policy</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {policies.passwordMinLength} chars minimum
                </p>
              </div>
            </div>

            <div className="flex items-center gap-sm p-sm bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="p-xs bg-blue-100 dark:bg-blue-900 rounded-full">
                <Clock className="h-icon-xs w-icon-xs text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">Session Timeout</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {policies.sessionTimeout} minutes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-sm p-sm bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="p-xs bg-orange-100 dark:bg-orange-900 rounded-full">
                <AlertTriangle className="h-icon-xs w-icon-xs text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="font-medium text-orange-900 dark:text-orange-100">Login Attempts</p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Max {policies.loginAttemptsMax} attempts
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <Lock className="h-icon-sm w-icon-sm" />
            Password Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div className="space-y-md">
              <div className="space-y-xs">
                <Label htmlFor="min-length">Minimum Length</Label>
                <Select
                  value={policies.passwordMinLength.toString()}
                  onValueChange={(value) => setPolicies(prev => ({ ...prev, passwordMinLength: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8 characters</SelectItem>
                    <SelectItem value="10">10 characters</SelectItem>
                    <SelectItem value="12">12 characters</SelectItem>
                    <SelectItem value="16">16 characters</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-xs">
                <Label htmlFor="max-age">Password Expiry (days)</Label>
                <Select
                  value={policies.passwordMaxAge.toString()}
                  onValueChange={(value) => setPolicies(prev => ({ ...prev, passwordMaxAge: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="0">Never expires</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-md">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Uppercase</Label>
                  <p className="text-sm text-muted-foreground">A-Z characters required</p>
                </div>
                <Switch
                  checked={policies.passwordRequireUppercase}
                  onCheckedChange={(checked) => setPolicies(prev => ({ ...prev, passwordRequireUppercase: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Lowercase</Label>
                  <p className="text-sm text-muted-foreground">a-z characters required</p>
                </div>
                <Switch
                  checked={policies.passwordRequireLowercase}
                  onCheckedChange={(checked) => setPolicies(prev => ({ ...prev, passwordRequireLowercase: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Numbers</Label>
                  <p className="text-sm text-muted-foreground">0-9 digits required</p>
                </div>
                <Switch
                  checked={policies.passwordRequireNumbers}
                  onCheckedChange={(checked) => setPolicies(prev => ({ ...prev, passwordRequireNumbers: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Symbols</Label>
                  <p className="text-sm text-muted-foreground">Special characters required</p>
                </div>
                <Switch
                  checked={policies.passwordRequireSymbols}
                  onCheckedChange={(checked) => setPolicies(prev => ({ ...prev, passwordRequireSymbols: checked }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <Clock className="h-icon-sm w-icon-sm" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div className="space-y-xs">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Select
                value={policies.sessionTimeout.toString()}
                onValueChange={(value) => setPolicies(prev => ({ ...prev, sessionTimeout: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="240">4 hours</SelectItem>
                  <SelectItem value="480">8 hours</SelectItem>
                  <SelectItem value="720">12 hours</SelectItem>
                  <SelectItem value="1440">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-xs">
              <Label htmlFor="login-attempts">Max Login Attempts</Label>
              <Select
                value={policies.loginAttemptsMax.toString()}
                onValueChange={(value) => setPolicies(prev => ({ ...prev, loginAttemptsMax: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 attempts</SelectItem>
                  <SelectItem value="5">5 attempts</SelectItem>
                  <SelectItem value="10">10 attempts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-xs">
            <Label htmlFor="lockout-duration">Account Lockout Duration (minutes)</Label>
            <Select
              value={policies.lockoutDuration.toString()}
              onValueChange={(value) => setPolicies(prev => ({ ...prev, lockoutDuration: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
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
              <Label>Require 2FA for All Users</Label>
              <p className="text-sm text-muted-foreground">
                Force two-factor authentication for all organization members
              </p>
            </div>
            <Switch
              checked={policies.requireTwoFactor}
              onCheckedChange={(checked) => setPolicies(prev => ({ ...prev, requireTwoFactor: checked }))}
            />
          </div>

          {policies.requireTwoFactor && (
            <Alert>
              <Shield className="h-icon-xs w-icon-xs" />
              <AlertDescription>
                Two-factor authentication is required for all users. Existing users will be prompted to set it up on their next login.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* IP Whitelist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <Eye className="h-icon-sm w-icon-sm" />
            IP Access Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-md">
          <div className="space-y-xs">
            <Label>Allowed IP Addresses</Label>
            <p className="text-sm text-muted-foreground">
              Restrict access to specific IP addresses or ranges. Leave empty to allow all IPs.
            </p>
            <Input
              placeholder="192.168.1.0/24, 10.0.0.1"
              value={policies.ipWhitelist.join(', ')}
              onChange={(e) => setPolicies(prev => ({
                ...prev,
                ipWhitelist: e.target.value.split(',').map(ip => ip.trim()).filter(ip => ip)
              }))}
            />
          </div>

          {policies.ipWhitelist.length > 0 && (
            <div className="flex flex-wrap gap-xs">
              {policies.ipWhitelist.map((ip, index) => (
                <Badge key={index} variant="secondary">
                  {ip}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <SettingsIcon className="h-icon-sm w-icon-sm" />
            Audit & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-md">
            <p className="text-sm text-muted-foreground">
              Security events and user activities are automatically logged for compliance purposes.
            </p>
            <Button variant="outline" size="sm">
              View Security Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSavePolicies} disabled={saving}>
          <Shield className="h-icon-xs w-icon-xs mr-2" />
          {saving ? 'Saving Policies...' : 'Save Security Settings'}
        </Button>
      </div>
    </div>
  );
}
