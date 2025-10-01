'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Monitor, Volume2, VolumeX, Settings as SettingsIcon } from "lucide-react";
import { createBrowserClient } from '@ghxstship/auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Separator,
} from '@ghxstship/ui';

interface NotificationsSettingsProps {
  userId: string;
  orgId: string;
}

interface NotificationPreferences {
  email: {
    enabled: boolean;
    project_updates: boolean;
    task_assignments: boolean;
    mentions: boolean;
    comments: boolean;
    deadlines: boolean;
    weekly_digest: boolean;
  };
  sms: {
    enabled: boolean;
    urgent_tasks: boolean;
    deadlines: boolean;
  };
  push: {
    enabled: boolean;
    project_updates: boolean;
    task_assignments: boolean;
    mentions: boolean;
  };
  in_app: {
    enabled: boolean;
    sound_enabled: boolean;
    desktop_notifications: boolean;
  };
  digest: {
    frequency: 'none' | 'daily' | 'weekly' | 'monthly';
    include_metrics: boolean;
    include_tasks: boolean;
  };
}

const NOTIFICATION_TYPES = [
  {
    key: 'project_updates',
    label: 'Project Updates',
    description: 'Changes to project status, milestones, and progress'
  },
  {
    key: 'task_assignments',
    label: 'Task Assignments',
    description: 'When tasks are assigned to you or your team'
  },
  {
    key: 'mentions',
    label: 'Mentions & Tags',
    description: 'When someone mentions you in comments or tasks'
  },
  {
    key: 'comments',
    label: 'Comments & Replies',
    description: 'New comments on tasks and projects you follow'
  },
  {
    key: 'deadlines',
    label: 'Deadlines & Reminders',
    description: 'Upcoming deadlines and task reminders'
  }
];

export default function NotificationsSettings({ userId, orgId }: NotificationsSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      enabled: true,
      project_updates: true,
      task_assignments: true,
      mentions: true,
      comments: true,
      deadlines: true,
      weekly_digest: true
    },
    sms: {
      enabled: false,
      urgent_tasks: true,
      deadlines: true
    },
    push: {
      enabled: true,
      project_updates: false,
      task_assignments: true,
      mentions: true
    },
    in_app: {
      enabled: true,
      sound_enabled: true,
      desktop_notifications: true
    },
    digest: {
      frequency: 'weekly',
      include_metrics: true,
      include_tasks: true
    }
  });

  const supabase = createBrowserClient();

  useEffect(() => {
    const loadNotificationPreferences = async () => {
      try {
        // Load user notification preferences
        const { data, error } = await supabase
          .from('user_notification_settings')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data?.preferences) {
          setPreferences({ ...preferences, ...data.preferences });
        }
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotificationPreferences();
  }, [userId, supabase]);

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_notification_settings')
        .upsert({
          user_id: userId,
          preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;


    } catch (error) {
      console.error('Error saving notification preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateEmailPreference = (key: keyof NotificationPreferences['email'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [key]: value
      }
    }));
  };

  const updateSmsPreference = (key: keyof NotificationPreferences['sms'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      sms: {
        ...prev.sms,
        [key]: value
      }
    }));
  };

  const updatePushPreference = (key: keyof NotificationPreferences['push'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      push: {
        ...prev.push,
        [key]: value
      }
    }));
  };

  const updateInAppPreference = (key: keyof NotificationPreferences['in_app'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      in_app: {
        ...prev.in_app,
        [key]: value
      }
    }));
  };

  const updateDigestPreference = (key: keyof NotificationPreferences['digest'], value: unknown) => {
    setPreferences(prev => ({
      ...prev,
      digest: {
        ...prev.digest,
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading notification settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <Mail className="h-icon-sm w-icon-sm" />
            Email Notifications
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure which activities trigger email notifications.
          </p>
        </CardHeader>
        <CardContent className="space-y-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={preferences.email.enabled}
              onCheckedChange={(checked) => updateEmailPreference('enabled', checked)}
            />
          </div>

          {preferences.email.enabled && (
            <div className="space-y-md ml-6">
              {NOTIFICATION_TYPES.map((type) => (
                <div key={type.key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{type.label}</Label>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                  <Switch
                    checked={preferences.email[type.key as keyof NotificationPreferences['email']] as boolean}
                    onCheckedChange={(checked) => updateEmailPreference(type.key as keyof NotificationPreferences['email'], checked)}
                  />
                </div>
              ))}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Receive a weekly summary of activity</p>
                </div>
                <Switch
                  checked={preferences.email.weekly_digest}
                  onCheckedChange={(checked) => updateEmailPreference('weekly_digest', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <Smartphone className="h-icon-sm w-icon-sm" />
            SMS Notifications
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure SMS notifications for critical updates.
          </p>
        </CardHeader>
        <CardContent className="space-y-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
            </div>
            <Switch
              checked={preferences.sms.enabled}
              onCheckedChange={(checked) => updateSmsPreference('enabled', checked)}
            />
          </div>

          {preferences.sms.enabled && (
            <div className="space-y-md ml-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Urgent Tasks</Label>
                  <p className="text-sm text-muted-foreground">High-priority task notifications</p>
                </div>
                <Switch
                  checked={preferences.sms.urgent_tasks}
                  onCheckedChange={(checked) => updateSmsPreference('urgent_tasks', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Deadlines</Label>
                  <p className="text-sm text-muted-foreground">Task deadline reminders</p>
                </div>
                <Switch
                  checked={preferences.sms.deadlines}
                  onCheckedChange={(checked) => updateSmsPreference('deadlines', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <Monitor className="h-icon-sm w-icon-sm" />
            Push Notifications
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure browser push notifications.
          </p>
        </CardHeader>
        <CardContent className="space-y-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
            </div>
            <Switch
              checked={preferences.push.enabled}
              onCheckedChange={(checked) => updatePushPreference('enabled', checked)}
            />
          </div>

          {preferences.push.enabled && (
            <div className="space-y-md ml-6">
              {NOTIFICATION_TYPES.slice(0, 3).map((type) => (
                <div key={type.key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{type.label}</Label>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                  <Switch
                    checked={preferences.push[type.key as keyof NotificationPreferences['push']] as boolean}
                    onCheckedChange={(checked) => updatePushPreference(type.key as keyof NotificationPreferences['push'], checked)}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <Bell className="h-icon-sm w-icon-sm" />
            In-App Notifications
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure in-app notification preferences.
          </p>
        </CardHeader>
        <CardContent className="space-y-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">Show notifications within the application</p>
            </div>
            <Switch
              checked={preferences.in_app.enabled}
              onCheckedChange={(checked) => updateInAppPreference('enabled', checked)}
            />
          </div>

          {preferences.in_app.enabled && (
            <div className="space-y-md ml-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sound Notifications</Label>
                  <p className="text-sm text-muted-foreground">Play sound for notifications</p>
                </div>
                <Switch
                  checked={preferences.in_app.sound_enabled}
                  onCheckedChange={(checked) => updateInAppPreference('sound_enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Desktop Notifications</Label>
                  <p className="text-sm text-muted-foreground">Show desktop notifications</p>
                </div>
                <Switch
                  checked={preferences.in_app.desktop_notifications}
                  onCheckedChange={(checked) => updateInAppPreference('desktop_notifications', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Digest Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <SettingsIcon className="h-icon-sm w-icon-sm" />
            Digest Preferences
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure summary emails and reports.
          </p>
        </CardHeader>
        <CardContent className="space-y-lg">
          <div className="space-y-xs">
            <Label htmlFor="digest-frequency">Digest Frequency</Label>
            <Select
              value={preferences.digest.frequency}
              onValueChange={(value: unknown) => updateDigestPreference('frequency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No digest</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {preferences.digest.frequency !== 'none' && (
            <div className="space-y-md">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Metrics</Label>
                  <p className="text-sm text-muted-foreground">Project progress and team metrics</p>
                </div>
                <Switch
                  checked={preferences.digest.include_metrics}
                  onCheckedChange={(checked) => updateDigestPreference('include_metrics', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Task Updates</Label>
                  <p className="text-sm text-muted-foreground">Recent task activity and assignments</p>
                </div>
                <Switch
                  checked={preferences.digest.include_tasks}
                  onCheckedChange={(checked) => updateDigestPreference('include_tasks', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSavePreferences} disabled={saving}>
          <Bell className="h-icon-xs w-icon-xs mr-2" />
          {saving ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </div>
    </div>
  );
}
