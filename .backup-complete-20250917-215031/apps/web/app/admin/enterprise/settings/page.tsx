import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '@ghxstship/ui';
import { Settings, Shield, Database, Users, Bell, Globe, Key, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Enterprise Settings | Enterprise Dashboard',
  description: 'Enterprise configuration, integrations, and feature management',
};

export default function SettingsPage() {
  return (
    <div className="stack-lg">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enterprise Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure enterprise features, integrations, and system settings
        </p>
      </div>

      <div className="grid gap-lg lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-sm">
              <Shield className="h-5 w-5" />
              Security Configuration
            </CardTitle>
            <CardDescription>Authentication, authorization, and security policies</CardDescription>
          </CardHeader>
          <CardContent className="stack-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Multi-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Enforce MFA for all users</p>
              </div>
              <Badge variant="default">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Session Timeout</p>
                <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
              </div>
              <Badge variant="secondary">8 hours</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Password Policy</p>
                <p className="text-sm text-muted-foreground">Minimum requirements and rotation</p>
              </div>
              <Badge variant="default">Strict</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Configure Security Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-sm">
              <Database className="h-5 w-5" />
              Database Configuration
            </CardTitle>
            <CardDescription>Performance tuning and backup settings</CardDescription>
          </CardHeader>
          <CardContent className="stack-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Connection Pooling</p>
                <p className="text-sm text-muted-foreground">Max concurrent connections</p>
              </div>
              <Badge variant="secondary">100</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Query Timeout</p>
                <p className="text-sm text-muted-foreground">Maximum query execution time</p>
              </div>
              <Badge variant="secondary">30s</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Backup Retention</p>
                <p className="text-sm text-muted-foreground">How long to keep backups</p>
              </div>
              <Badge variant="secondary">90 days</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Configure Database Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-sm">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>User provisioning and access control</CardDescription>
          </CardHeader>
          <CardContent className="stack-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-Provisioning</p>
                <p className="text-sm text-muted-foreground">Automatic user creation from SSO</p>
              </div>
              <Badge variant="default">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Default Role</p>
                <p className="text-sm text-muted-foreground">Role assigned to new users</p>
              </div>
              <Badge variant="secondary">Viewer</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Guest Access</p>
                <p className="text-sm text-muted-foreground">Allow external user access</p>
              </div>
              <Badge variant="destructive">Disabled</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Manage User Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-sm">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Alert channels and notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="stack-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">System alerts via email</p>
              </div>
              <Badge variant="default">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Slack Integration</p>
                <p className="text-sm text-muted-foreground">Send alerts to Slack channels</p>
              </div>
              <Badge variant="default">Configured</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Webhook Endpoints</p>
                <p className="text-sm text-muted-foreground">Custom notification webhooks</p>
              </div>
              <Badge variant="secondary">3 Active</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Configure Notifications
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-sm">
            <Zap className="h-5 w-5" />
            Feature Toggles
          </CardTitle>
          <CardDescription>Enable or disable enterprise features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-md md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center justify-between p-sm border rounded-lg">
              <div>
                <p className="font-medium">Advanced Monitoring</p>
                <p className="text-xs text-muted-foreground">Real-time metrics and alerts</p>
              </div>
              <Badge variant="default">On</Badge>
            </div>
            <div className="flex items-center justify-between p-sm border rounded-lg">
              <div>
                <p className="font-medium">Threat Detection</p>
                <p className="text-xs text-muted-foreground">AI-powered security monitoring</p>
              </div>
              <Badge variant="default">On</Badge>
            </div>
            <div className="flex items-center justify-between p-sm border rounded-lg">
              <div>
                <p className="font-medium">Compliance Reporting</p>
                <p className="text-xs text-muted-foreground">GDPR, SOC2, ISO27001</p>
              </div>
              <Badge variant="default">On</Badge>
            </div>
            <div className="flex items-center justify-between p-sm border rounded-lg">
              <div>
                <p className="font-medium">Disaster Recovery</p>
                <p className="text-xs text-muted-foreground">Automated backup and recovery</p>
              </div>
              <Badge variant="default">On</Badge>
            </div>
            <div className="flex items-center justify-between p-sm border rounded-lg">
              <div>
                <p className="font-medium">Audit Logging</p>
                <p className="text-xs text-muted-foreground">Comprehensive activity logs</p>
              </div>
              <Badge variant="default">On</Badge>
            </div>
            <div className="flex items-center justify-between p-sm border rounded-lg">
              <div>
                <p className="font-medium">API Rate Limiting</p>
                <p className="text-xs text-muted-foreground">Advanced rate limiting</p>
              </div>
              <Badge variant="default">On</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-sm">
            <Globe className="h-5 w-5" />
            Integration Status
          </CardTitle>
          <CardDescription>External service integrations and API connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="stack-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <Key className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Supabase Enterprise</p>
                  <p className="text-sm text-muted-foreground">Database and authentication</p>
                </div>
              </div>
              <Badge variant="default">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <Key className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Monitoring Service</p>
                  <p className="text-sm text-muted-foreground">System health and metrics</p>
                </div>
              </div>
              <Badge variant="default">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <Key className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Security Scanner</p>
                  <p className="text-sm text-muted-foreground">Vulnerability assessment</p>
                </div>
              </div>
              <Badge variant="default">Connected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
