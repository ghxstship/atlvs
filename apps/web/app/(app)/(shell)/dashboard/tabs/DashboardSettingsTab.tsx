'use client';

import React from 'react';
import { Settings, Shield, Users, Bell, Database, Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Button } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';

interface DashboardSettingsTabProps {
  dashboard?: unknown;
  widgetData?: Record<string, any>;
  user: unknown;
  orgId: string;
  userRole: string;
  isViewMode?: boolean;
  preferences?: unknown;
  tabData?: unknown;
  onTabDataChange?: (data: unknown) => void;
}

export default function DashboardSettingsTab({
  dashboard,
  widgetData,
  user,
  orgId,
  userRole,
  isViewMode = false,
  preferences,
  tabData,
  onTabDataChange
}: DashboardSettingsTabProps) {
  const settingsSections = [
    {
      title: 'General Settings',
      icon: Settings,
      items: [
        { label: 'Dashboard Name', value: 'Sales Overview', editable: true },
        { label: 'Description', value: 'Real-time sales metrics and KPIs', editable: true },
        { label: 'Default View', value: 'Grid Layout', editable: true },
        { label: 'Auto-refresh', value: 'Enabled (5 min)', editable: true }
      ]
    },
    {
      title: 'Sharing & Permissions',
      icon: Users,
      items: [
        { label: 'Access Level', value: 'Organization', badge: 'Public' },
        { label: 'Allowed Users', value: '12 users', editable: true },
        { label: 'Share Link', value: 'https://...', editable: false },
        { label: 'Embed Code', value: 'Available', editable: false }
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        { label: 'Data Encryption', value: 'AES-256', badge: 'Enabled' },
        { label: 'Audit Logging', value: 'Enabled', badge: 'Active' },
        { label: 'Access Control', value: 'RBAC', badge: 'Configured' },
        { label: 'Session Timeout', value: '30 minutes', editable: true }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { label: 'Email Alerts', value: 'Enabled', editable: true },
        { label: 'Push Notifications', value: 'Disabled', editable: true },
        { label: 'Report Schedules', value: 'Weekly', editable: true },
        { label: 'Threshold Alerts', value: 'Configured', editable: true }
      ]
    },
    {
      title: 'Data Management',
      icon: Database,
      items: [
        { label: 'Data Retention', value: '90 days', editable: true },
        { label: 'Backup Frequency', value: 'Daily', badge: 'Automated' },
        { label: 'Export Formats', value: 'PDF, CSV, Excel', editable: false },
        { label: 'Data Sources', value: '4 connected', badge: 'Active' }
      ]
    },
    {
      title: 'API & Integrations',
      icon: Key,
      items: [
        { label: 'API Access', value: 'Enabled', badge: 'Restricted' },
        { label: 'Webhooks', value: '2 active', editable: true },
        { label: 'External APIs', value: '3 connected', badge: 'Active' },
        { label: 'OAuth Tokens', value: 'Managed', editable: true }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Settings</h2>
          <p className="text-muted-foreground">
            Configure dashboard behavior, sharing, and integrations
          </p>
        </div>

        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">{item.label}:</span>
                        <span className="text-sm text-muted-foreground">{item.value}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>

                      {item.editable && (
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Delete Dashboard</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this dashboard and all its data
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Delete Dashboard
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Reset to Defaults</h4>
                <p className="text-sm text-muted-foreground">
                  Reset all settings to default values
                </p>
              </div>
              <Button variant="outline" size="sm">
                Reset Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
