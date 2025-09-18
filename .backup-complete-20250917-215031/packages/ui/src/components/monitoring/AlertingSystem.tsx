'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Input } from '../Input';
import { Toggle } from '../Toggle';
import { Modal } from '../Modal';
import { Alert } from '../Alert';
import { Bell, Settings, Plus, Trash2, Edit, AlertTriangle, CheckCircle, Clock, Mail, Smartphone } from 'lucide-react';

// Alert types and interfaces
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'muted';
export type NotificationChannel = 'email' | 'sms' | 'webhook' | 'in-app';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  severity: AlertSeverity;
  enabled: boolean;
  channels: NotificationChannel[];
  cooldownMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface AlertInstance {
  id: string;
  ruleId: string;
  ruleName: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  value: number;
  threshold: number;
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  metadata?: Record<string, any>;
}

export interface AlertingSystemProps {
  className?: string;
  onAlertTriggered?: (alert: AlertInstance) => void;
  onRuleCreated?: (rule: AlertRule) => void;
  onRuleUpdated?: (rule: AlertRule) => void;
  onRuleDeleted?: (ruleId: string) => void;
}

const METRIC_OPTIONS = [
  { value: 'database_size', label: 'Database Size (GB)', unit: 'GB' },
  { value: 'table_size', label: 'Table Size (MB)', unit: 'MB' },
  { value: 'index_usage_percent', label: 'Index Usage (%)', unit: '%' },
  { value: 'sequential_scan_ratio', label: 'Sequential Scan Ratio (%)', unit: '%' },
  { value: 'dead_tuple_percent', label: 'Dead Tuple Ratio (%)', unit: '%' },
  { value: 'connection_count', label: 'Active Connections', unit: 'count' },
  { value: 'query_duration_avg', label: 'Average Query Duration (ms)', unit: 'ms' },
  { value: 'error_rate', label: 'Error Rate (%)', unit: '%' },
  { value: 'cpu_usage', label: 'CPU Usage (%)', unit: '%' },
  { value: 'memory_usage', label: 'Memory Usage (%)', unit: '%' }
];

const OPERATOR_OPTIONS = [
  { value: 'gt', label: 'Greater than (>)' },
  { value: 'gte', label: 'Greater than or equal (≥)' },
  { value: 'lt', label: 'Less than (<)' },
  { value: 'lte', label: 'Less than or equal (≤)' },
  { value: 'eq', label: 'Equal to (=)' }
];

export const AlertingSystem: React.FC<AlertingSystemProps> = ({
  className = '',
  onAlertTriggered,
  onRuleCreated,
  onRuleUpdated,
  onRuleDeleted
}) => {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [alerts, setAlerts] = useState<AlertInstance[]>([]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules'>('alerts');

  // Mock data - replace with actual API calls
  const mockRules: AlertRule[] = [
    {
      id: '1',
      name: 'High Database Size',
      description: 'Alert when database size exceeds 5GB',
      metric: 'database_size',
      operator: 'gt',
      threshold: 5,
      severity: 'medium',
      enabled: true,
      channels: ['email', 'in-app'],
      cooldownMinutes: 60,
      createdAt: '2024-09-15T10:00:00Z',
      updatedAt: '2024-09-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Low Index Usage',
      description: 'Alert when index usage drops below 80%',
      metric: 'index_usage_percent',
      operator: 'lt',
      threshold: 80,
      severity: 'high',
      enabled: true,
      channels: ['email', 'sms', 'in-app'],
      cooldownMinutes: 30,
      createdAt: '2024-09-15T09:30:00Z',
      updatedAt: '2024-09-15T09:30:00Z'
    }
  ];

  const mockAlerts: AlertInstance[] = [
    {
      id: '1',
      ruleId: '2',
      ruleName: 'Low Index Usage',
      message: 'Index usage for table "public.audit_logs" has dropped to 65%',
      severity: 'high',
      status: 'active',
      value: 65,
      threshold: 80,
      triggeredAt: '2024-09-15T14:30:00Z',
      metadata: { tableName: 'public.audit_logs' }
    },
    {
      id: '2',
      ruleId: '1',
      ruleName: 'High Database Size',
      message: 'Database size has reached 5.2GB',
      severity: 'medium',
      status: 'acknowledged',
      value: 5.2,
      threshold: 5,
      triggeredAt: '2024-09-15T13:15:00Z',
      acknowledgedAt: '2024-09-15T13:20:00Z',
      acknowledgedBy: 'admin@example.com'
    }
  ];

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRules(mockRules);
      setAlerts(mockAlerts);
      setLoading(false);
    };
    loadData();
  }, []);

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case 'active': return 'destructive';
      case 'acknowledged': return 'warning';
      case 'resolved': return 'success';
      case 'muted': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case 'active': return <AlertTriangle className="h-4 w-4" />;
      case 'acknowledged': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'muted': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    setShowRuleModal(true);
  };

  const handleEditRule = (rule: AlertRule) => {
    setEditingRule(rule);
    setShowRuleModal(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
    onRuleDeleted?.(ruleId);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'acknowledged', 
            acknowledgedAt: new Date().toISOString(),
            acknowledgedBy: 'current-user@example.com'
          }
        : alert
    ));
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'resolved', 
            resolvedAt: new Date().toISOString()
          }
        : alert
    ));
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const acknowledgedAlerts = alerts.filter(alert => alert.status === 'acknowledged');

  return (
    <div className={`gap-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <Bell className="h-6 w-6 text-warning" />
          <h2 className="text-2xl font-bold text-foreground">Alerting System</h2>
          {activeAlerts.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {activeAlerts.length} active
            </Badge>
          )}
        </div>
        <Button onClick={handleCreateRule}>
          <Plus className="h-4 w-4 mr-2" />
          Create Alert Rule
        </Button>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-destructive">{activeAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Active Alerts</div>
            </div>
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </Card>
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-warning">{acknowledgedAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Acknowledged</div>
            </div>
            <Clock className="h-8 w-8 text-warning" />
          </div>
        </Card>
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-primary">{rules.length}</div>
              <div className="text-sm text-muted-foreground">Alert Rules</div>
            </div>
            <Settings className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-success">{rules.filter(r => r.enabled).length}</div>
              <div className="text-sm text-muted-foreground">Enabled Rules</div>
            </div>
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex gap-xl">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-sm px-xs border-b-2 font-medium text-sm ${
              activeTab === 'alerts'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Active Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-sm px-xs border-b-2 font-medium text-sm ${
              activeTab === 'rules'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Alert Rules ({rules.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'alerts' && (
        <div className="space-y-md">
          {alerts.length === 0 ? (
            <Card className="p-xl text-center">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Active Alerts</h3>
              <p className="text-muted-foreground">All systems are operating normally.</p>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id} className="p-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-md">
                    {getStatusIcon(alert.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-sm mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{alert.ruleName}</h3>
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant={getStatusColor(alert.status)}>
                          {alert.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{alert.message}</p>
                      <div className="text-sm text-muted-foreground">
                        <div>Value: {alert.value} (Threshold: {alert.threshold})</div>
                        <div>Triggered: {new Date(alert.triggeredAt).toLocaleString()}</div>
                        {alert.acknowledgedAt && (
                          <div>Acknowledged: {new Date(alert.acknowledgedAt).toLocaleString()} by {alert.acknowledgedBy}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-sm">
                    {alert.status === 'active' && (
                      <>
                        <Button
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          variant="outline"
                          size="sm"
                        >
                          Acknowledge
                        </Button>
                        <Button
                          onClick={() => handleResolveAlert(alert.id)}
                          variant="primary"
                          size="sm"
                        >
                          Resolve
                        </Button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <Button
                        onClick={() => handleResolveAlert(alert.id)}
                        variant="primary"
                        size="sm"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-md">
          {rules.map((rule) => (
            <Card key={rule.id} className="p-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-sm mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{rule.name}</h3>
                    <Badge variant={getSeverityColor(rule.severity)}>
                      {rule.severity.toUpperCase()}
                    </Badge>
                    {rule.enabled ? (
                      <Badge variant="success">ENABLED</Badge>
                    ) : (
                      <Badge variant="secondary">DISABLED</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-2">{rule.description}</p>
                  <div className="text-sm text-muted-foreground">
                    <div>
                      Condition: {METRIC_OPTIONS.find(m => m.value === rule.metric)?.label} {' '}
                      {OPERATOR_OPTIONS.find(o => o.value === rule.operator)?.label} {rule.threshold}
                    </div>
                    <div>Channels: {rule.channels.join(', ')}</div>
                    <div>Cooldown: {rule.cooldownMinutes} minutes</div>
                  </div>
                </div>
                <div className="flex gap-sm">
                  <Button
                    onClick={() => handleEditRule(rule)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteRule(rule.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Rule Creation/Edit Modal */}
      <AlertRuleModal
        isOpen={showRuleModal}
        onClose={() => setShowRuleModal(false)}
        rule={editingRule}
        onSave={(rule) => {
          if (editingRule) {
            setRules(rules.map(r => r.id === rule.id ? rule : r));
            onRuleUpdated?.(rule);
          } else {
            const newRule = { ...rule, id: Date.now().toString() };
            setRules([...rules, newRule]);
            onRuleCreated?.(newRule);
          }
          setShowRuleModal(false);
        }}
      />

      {loading && (
        <div className="flex items-center justify-center p-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading alerts...</span>
        </div>
      )}
    </div>
  );
};

// Alert Rule Modal Component
interface AlertRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule?: AlertRule | null;
  onSave: (rule: AlertRule) => void;
}

const AlertRuleModal: React.FC<AlertRuleModalProps> = ({ isOpen, onClose, rule, onSave }) => {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    metric: string;
    operator: AlertRule['operator'];
    threshold: number;
    severity: AlertSeverity;
    enabled: boolean;
    channels: NotificationChannel[];
    cooldownMinutes: number;
  }>({
    name: '',
    description: '',
    metric: 'database_size',
    operator: 'gt',
    threshold: 0,
    severity: 'medium',
    enabled: true,
    channels: ['email', 'in-app'],
    cooldownMinutes: 60
  });

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        description: rule.description,
        metric: rule.metric,
        operator: rule.operator,
        threshold: rule.threshold,
        severity: rule.severity,
        enabled: rule.enabled,
        channels: rule.channels,
        cooldownMinutes: rule.cooldownMinutes
      });
    } else {
      setFormData({
        name: '',
        description: '',
        metric: 'database_size',
        operator: 'gt',
        threshold: 0,
        severity: 'medium',
        enabled: true,
        channels: ['email', 'in-app'],
        cooldownMinutes: 60
      });
    }
  }, [rule, isOpen]);

  const handleSave = () => {
    const savedRule: AlertRule = {
      id: rule?.id || '',
      ...formData,
      createdAt: rule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSave(savedRule);
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <div className="p-lg">
        <h2 className="text-xl font-semibold mb-4">
          {rule ? 'Edit Alert Rule' : 'Create Alert Rule'}
        </h2>
        
        <div className="space-y-md">
          <Input
            label="Rule Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter rule name"
          />
          
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what this rule monitors"
          />
          
          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Metric</label>
              <select
                value={formData.metric}
                onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
                className="w-full p-sm border border-border rounded-md"
              >
                {METRIC_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Operator</label>
              <select
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value as any })}
                className="w-full p-sm border border-border rounded-md"
              >
                {OPERATOR_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-md">
            <Input
              label="Threshold"
              type="number"
              value={formData.threshold}
              onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
              placeholder="Enter threshold value"
            />
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as AlertSeverity })}
                className="w-full p-sm border border-border rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          
          <Input
            label="Cooldown (minutes)"
            type="number"
            value={formData.cooldownMinutes}
            onChange={(e) => setFormData({ ...formData, cooldownMinutes: Number(e.target.value) })}
            placeholder="Minutes between alerts"
          />
          
          <div className="flex items-center gap-sm">
            <Toggle
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.currentTarget.checked })}
            />
            <label className="text-sm font-medium text-foreground">Enable this rule</label>
          </div>
        </div>
        
        <div className="flex justify-end gap-sm mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {rule ? 'Update Rule' : 'Create Rule'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
