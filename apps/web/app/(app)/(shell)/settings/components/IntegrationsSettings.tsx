'use client';

import { useState, useEffect } from 'react';
import { Plug, ExternalLink, CheckCircle, AlertCircle, Settings as SettingsIcon, Webhook, Key, Shield } from "lucide-react";
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
  Badge,
  Switch,
  Separator,
  Alert,
  AlertDescription,
} from '@ghxstship/ui';

interface IntegrationsSettingsProps {
  userId: string;
  orgId: string;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'productivity' | 'communication' | 'analytics' | 'storage' | 'development';
  status: 'connected' | 'disconnected' | 'error';
  last_sync?: string;
  scopes: string[];
  webhook_url?: string;
  api_key?: string;
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'failed';
  last_delivery?: string;
  created_at: string;
}

const AVAILABLE_INTEGRATIONS = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send notifications and updates to Slack channels',
    category: 'communication' as const,
    icon: '💬'
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Connect Discord servers for team communication',
    category: 'communication' as const,
    icon: '💙'
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Sync files and documents with Google Drive',
    category: 'storage' as const,
    icon: '📁'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'File storage and synchronization',
    category: 'storage' as const,
    icon: '📦'
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect repositories and track development activity',
    category: 'development' as const,
    icon: '🐙'
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'CI/CD pipelines and repository management',
    category: 'development' as const,
    icon: '🦊'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automate workflows with thousands of apps',
    category: 'productivity' as const,
    icon: '⚡'
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Track usage and performance metrics',
    category: 'analytics' as const,
    icon: '📊'
  }
];

export default function IntegrationsSettings({ userId, orgId }: IntegrationsSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [apiRateLimit, setApiRateLimit] = useState(1000);
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);

  const supabase = createBrowserClient();

  useEffect(() => {
    const loadIntegrationData = async () => {
      try {
        // Load integrations
        const { data: integrationsData, error: integrationsError } = await supabase
          .from('organization_integrations')
          .select('*')
          .eq('organization_id', orgId);

        if (integrationsError && integrationsError.code !== 'PGRST116') throw integrationsError;

        // Mock integrations data
        setIntegrations([
          {
            id: 'slack',
            name: 'Slack',
            description: 'Send notifications to Slack channels',
            category: 'communication',
            status: 'connected',
            last_sync: new Date().toISOString(),
            scopes: ['channels:read', 'chat:write'],
            webhook_url: 'https://hooks.slack.com/services/...'
          },
          {
            id: 'github',
            name: 'GitHub',
            description: 'Repository integration',
            category: 'development',
            status: 'connected',
            last_sync: new Date(Date.now() - 3600000).toISOString(),
            scopes: ['repo', 'workflow']
          }
        ]);

        // Load webhooks
        const { data: webhooksData, error: webhooksError } = await supabase
          .from('organization_webhooks')
          .select('*')
          .eq('organization_id', orgId);

        if (webhooksError && webhooksError.code !== 'PGRST116') throw webhooksError;

        setWebhooks(webhooksData || []);

        // Load API settings
        setApiRateLimit(1000);
        setAllowedDomains(['*.yourcompany.com']);

      } catch (error) {
        console.error('Error loading integration data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIntegrationData();
  }, [orgId, supabase]);

  const handleConnectIntegration = async (integrationId: string) => {
    try {
      // This would redirect to OAuth flow
      // Mock connection
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: 'connected', last_sync: new Date().toISOString() }
          : integration
      ));
    } catch (error) {
      console.error('Error connecting integration:', error);
    }
  };

  const handleDisconnectIntegration = async (integrationId: string) => {
    try {
      const { error } = await supabase
        .from('organization_integrations')
        .delete()
        .eq('organization_id', orgId)
        .eq('integration_id', integrationId);

      if (error) throw error;

      setIntegrations(prev => prev.filter(integration => integration.id !== integrationId));
    } catch (error) {
      console.error('Error disconnecting integration:', error);
    }
  };

  const handleAddWebhook = async () => {
    if (!newWebhookUrl.trim() || selectedEvents.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('organization_webhooks')
        .insert({
          organization_id: orgId,
          url: newWebhookUrl.trim(),
          events: selectedEvents,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setWebhooks(prev => [...prev, data]);
      setNewWebhookUrl('');
      setSelectedEvents([]);

    } catch (error) {
      console.error('Error adding webhook:', error);
    }
  };

  const handleRemoveWebhook = async (webhookId: string) => {
    try {
      const { error } = await supabase
        .from('organization_webhooks')
        .delete()
        .eq('id', webhookId);

      if (error) throw error;

      setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));

    } catch (error) {
      console.error('Error removing webhook:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="secondary">Disconnected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Available Integrations
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Connect third-party services to enhance your workflow.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_INTEGRATIONS.map((available) => {
              const connected = integrations.find(i => i.id === available.id);
              return (
                <div key={available.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{available.icon}</div>
                    <div>
                      <p className="font-medium">{available.name}</p>
                      <p className="text-sm text-muted-foreground">{available.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {connected ? (
                      <>
                        {getStatusBadge(connected.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnectIntegration(available.id)}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleConnectIntegration(available.id)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Connected Integrations */}
      {integrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Connected Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div key={integration.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Last sync: {integration.last_sync ? new Date(integration.last_sync).toLocaleString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Permissions:</p>
                    <div className="flex flex-wrap gap-2">
                      {integration.scopes.map((scope) => (
                        <Badge key={scope} variant="outline" className="text-xs">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhooks
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Send real-time notifications to external services when events occur.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Webhook */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://your-app.com/webhook"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-events">Events</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (!selectedEvents.includes(value)) {
                    setSelectedEvents(prev => [...prev, value]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project.created">Project Created</SelectItem>
                  <SelectItem value="project.updated">Project Updated</SelectItem>
                  <SelectItem value="task.created">Task Created</SelectItem>
                  <SelectItem value="task.completed">Task Completed</SelectItem>
                  <SelectItem value="user.invited">User Invited</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleAddWebhook} disabled={!newWebhookUrl.trim() || selectedEvents.length === 0}>
                Add Webhook
              </Button>
            </div>
          </div>

          {/* Selected Events */}
          {selectedEvents.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Events:</Label>
              <div className="flex flex-wrap gap-2">
                {selectedEvents.map((event) => (
                  <Badge key={event} variant="secondary" className="cursor-pointer"
                         onClick={() => setSelectedEvents(prev => prev.filter(e => e !== event))}>
                    {event} ×
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Webhooks List */}
          {webhooks.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        webhook.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900'
                          : webhook.status === 'inactive'
                          ? 'bg-gray-100 dark:bg-gray-900'
                          : 'bg-red-100 dark:bg-red-900'
                      }`}>
                        <Webhook className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium font-mono text-sm">{webhook.url}</p>
                        <p className="text-sm text-muted-foreground">
                          Events: {webhook.events.join(', ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(webhook.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={
                        webhook.status === 'active' ? 'default' :
                        webhook.status === 'inactive' ? 'secondary' : 'destructive'
                      }>
                        {webhook.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveWebhook(webhook.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure API access and security settings.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="rate-limit">API Rate Limit (requests/hour)</Label>
              <Select
                value={apiRateLimit.toString()}
                onValueChange={(value) => setApiRateLimit(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 requests/hour</SelectItem>
                  <SelectItem value="500">500 requests/hour</SelectItem>
                  <SelectItem value="1000">1000 requests/hour</SelectItem>
                  <SelectItem value="5000">5000 requests/hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowed-domains">Allowed Domains</Label>
              <Input
                id="allowed-domains"
                placeholder="*.yourcompany.com, api.example.com"
                value={allowedDomains.join(', ')}
                onChange={(e) => setAllowedDomains(e.target.value.split(',').map(d => d.trim()).filter(d => d))}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of allowed domains for API access
              </p>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              API keys and settings are organization-wide. Changes here affect all API integrations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button>
          <SettingsIcon className="h-4 w-4 mr-2" />
          Save Integration Settings
        </Button>
      </div>
    </div>
  );
}
