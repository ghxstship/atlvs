/**
 * Enterprise Incident Response System
 * Comprehensive incident management with on-call rotation and escalation procedures
 */

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  affectedServices: string[];
  impact: {
    users: number;
    revenue: number;
    description: string;
  };
  timeline: IncidentEvent[];
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  postmortem?: Postmortem;
}

export interface IncidentEvent {
  timestamp: string;
  type: 'created' | 'updated' | 'escalated' | 'assigned' | 'resolved' | 'comment';
  actor: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface Postmortem {
  summary: string;
  rootCause: string;
  impact: string;
  timeline: string;
  lessonsLearned: string[];
  actionItems: ActionItem[];
  prevention: string[];
  createdAt: string;
}

export interface ActionItem {
  id: string;
  description: string;
  owner: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

export interface OnCallRotation {
  id: string;
  name: string;
  schedule: OnCallSchedule[];
  escalationPolicy: EscalationLevel[];
  contactMethods: ContactMethod[];
  active: boolean;
}

export interface OnCallSchedule {
  userId: string;
  userName: string;
  startDate: string;
  endDate: string;
  timezone: string;
  backupUsers: string[];
}

export interface EscalationLevel {
  level: number;
  delayMinutes: number;
  recipients: string[];
  channels: ('email' | 'sms' | 'slack' | 'call')[];
  description: string;
}

export interface ContactMethod {
  userId: string;
  methods: {
    email?: string;
    sms?: string;
    slack?: string;
    phone?: string;
  };
}

export interface IncidentResponseRunbook {
  incidentType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  initialResponse: string[];
  investigationSteps: string[];
  communicationPlan: string[];
  escalationTriggers: string[];
  resolutionCriteria: string[];
  stakeholders: string[];
}

class IncidentResponseService {
  private incidents: Map<string, Incident> = new Map();
  private onCallRotations: Map<string, OnCallRotation> = new Map();
  private runbooks: Map<string, IncidentResponseRunbook> = new Map();
  private escalationTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeDefaultRunbooks();
    this.initializeOnCallRotation();
  }

  async initialize(): Promise<void> {
    console.log('🚨 Incident response service initialized');

    // Load existing incidents from storage
    await this.loadIncidents();

    // Set up periodic escalation checks
    setInterval(() => this.checkEscalations(), 60000); // Every minute
  }

  // Incident Management
  async createIncident(
    title: string,
    description: string,
    severity: Incident['severity'],
    affectedServices: string[] = [],
    reporter: string
  ): Promise<Incident> {
    const incident: Incident = {
      id: this.generateIncidentId(),
      title,
      description,
      severity,
      status: 'investigating',
      priority: this.mapSeverityToPriority(severity),
      affectedServices,
      impact: {
        users: 0,
        revenue: 0,
        description: 'Impact assessment in progress'
      },
      timeline: [{
        timestamp: new Date().toISOString(),
        type: 'created',
        actor: reporter,
        description: `Incident created: ${title}`
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.incidents.set(incident.id, incident);

    // Auto-assign based on on-call rotation
    await this.autoAssignIncident(incident);

    // Start escalation timer
    this.startEscalationTimer(incident);

    // Notify stakeholders
    await this.notifyIncidentCreated(incident);

    console.log(`🚨 Incident created: ${incident.id} - ${title}`);

    return incident;
  }

  async updateIncident(
    incidentId: string,
    updates: Partial<Incident>,
    actor: string
  ): Promise<Incident | null> {
    const incident = this.incidents.get(incidentId);
    if (!incident) return null;

    const updatedIncident = {
      ...incident,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Add timeline event
    updatedIncident.timeline.push({
      timestamp: new Date().toISOString(),
      type: 'updated',
      actor,
      description: `Incident updated: ${Object.keys(updates).join(', ')}`,
      metadata: updates
    });

    this.incidents.set(incidentId, updatedIncident);

    // Handle status changes
    if (updates.status === 'resolved' && incident.status !== 'resolved') {
      await this.resolveIncident(updatedIncident, actor);
    }

    // Notify stakeholders of update
    await this.notifyIncidentUpdate(updatedIncident);

    return updatedIncident;
  }

  async resolveIncident(incident: Incident, resolver: string): Promise<void> {
    incident.status = 'resolved';
    incident.resolvedAt = new Date().toISOString();

    // Clear escalation timer
    this.clearEscalationTimer(incident.id);

    // Add resolution event
    incident.timeline.push({
      timestamp: new Date().toISOString(),
      type: 'resolved',
      actor: resolver,
      description: `Incident resolved`
    });

    // Schedule postmortem for high/critical incidents
    if (incident.severity === 'high' || incident.severity === 'critical') {
      setTimeout(() => this.schedulePostmortem(incident), 24 * 60 * 60 * 1000); // 24 hours
    }

    // Notify stakeholders
    await this.notifyIncidentResolved(incident);

    console.log(`✅ Incident resolved: ${incident.id} - ${incident.title}`);
  }

  async escalateIncident(incidentId: string, level: number, actor: string): Promise<void> {
    const incident = this.incidents.get(incidentId);
    if (!incident) return;

    incident.timeline.push({
      timestamp: new Date().toISOString(),
      type: 'escalated',
      actor,
      description: `Escalated to level ${level}`
    });

    // Notify escalation level
    await this.notifyEscalation(incident, level);

    console.log(`🚨 Incident escalated: ${incident.id} to level ${level}`);
  }

  // On-Call Management
  async createOnCallRotation(
    name: string,
    schedule: OnCallSchedule[],
    escalationPolicy: EscalationLevel[]
  ): Promise<OnCallRotation> {
    const rotation: OnCallRotation = {
      id: this.generateRotationId(),
      name,
      schedule,
      escalationPolicy,
      contactMethods: [],
      active: true
    };

    this.onCallRotations.set(rotation.id, rotation);
    return rotation;
  }

  getCurrentOnCall(rotationId?: string): string | null {
    const rotation = rotationId
      ? this.onCallRotations.get(rotationId)
      : Array.from(this.onCallRotations.values()).find(r => r.active);

    if (!rotation) return null;

    const now = new Date();
    const currentSchedule = rotation.schedule.find(schedule =>
      new Date(schedule.startDate) <= now && new Date(schedule.endDate) >= now
    );

    return currentSchedule?.userId || null;
  }

  async updateContactMethods(rotationId: string, contacts: ContactMethod[]): Promise<void> {
    const rotation = this.onCallRotations.get(rotationId);
    if (!rotation) return;

    rotation.contactMethods = contacts;
  }

  // Runbook Management
  async createRunbook(runbook: IncidentResponseRunbook): Promise<void> {
    this.runbooks.set(runbook.incidentType, runbook);
  }

  getRunbook(incidentType: string): IncidentResponseRunbook | undefined {
    return this.runbooks.get(incidentType);
  }

  // Communication Methods
  private async notifyIncidentCreated(incident: Incident): Promise<void> {
    const message = `🚨 NEW INCIDENT: ${incident.title}\nSeverity: ${incident.severity}\nStatus: ${incident.status}\nID: ${incident.id}`;

    await this.sendNotification('incident_created', message, {
      incidentId: incident.id,
      severity: incident.severity,
      services: incident.affectedServices
    });
  }

  private async notifyIncidentUpdate(incident: Incident): Promise<void> {
    const message = `📝 INCIDENT UPDATE: ${incident.title}\nStatus: ${incident.status}\nID: ${incident.id}`;

    await this.sendNotification('incident_update', message, {
      incidentId: incident.id,
      status: incident.status
    });
  }

  private async notifyIncidentResolved(incident: Incident): Promise<void> {
    const message = `✅ INCIDENT RESOLVED: ${incident.title}\nResolution Time: ${this.calculateResolutionTime(incident)}\nID: ${incident.id}`;

    await this.sendNotification('incident_resolved', message, {
      incidentId: incident.id,
      resolutionTime: this.calculateResolutionTime(incident)
    });
  }

  private async notifyEscalation(incident: Incident, level: number): Promise<void> {
    const message = `🚨 INCIDENT ESCALATION: ${incident.title}\nEscalated to Level ${level}\nID: ${incident.id}`;

    await this.sendNotification('incident_escalation', message, {
      incidentId: incident.id,
      level,
      severity: incident.severity
    });
  }

  private async sendNotification(type: string, message: string, metadata: Record<string, unknown>): Promise<void> {
    // This would integrate with various notification services
    console.log(`📢 Notification [${type}]: ${message}`, metadata);

    // Send to Slack, email, PagerDuty, etc.
    // Implementation would use the alerting service and external APIs
  }

  // Escalation Logic
  private startEscalationTimer(incident: Incident): void {
    const rotation = Array.from(this.onCallRotations.values()).find(r => r.active);
    if (!rotation) return;

    let currentLevel = 0;

    const escalate = () => {
      currentLevel++;
      const level = rotation.escalationPolicy.find(l => l.level === currentLevel);

      if (level) {
        this.escalateIncident(incident.id, currentLevel, 'system');

        // Schedule next escalation if not the last level
        if (currentLevel < rotation.escalationPolicy.length) {
          const nextLevel = rotation.escalationPolicy.find(l => l.level === currentLevel + 1);
          if (nextLevel) {
            this.escalationTimers.set(
              incident.id,
              setTimeout(escalate, nextLevel.delayMinutes * 60 * 1000)
            );
          }
        }
      }
    };

    // Start initial escalation timer
    const firstLevel = rotation.escalationPolicy.find(l => l.level === 1);
    if (firstLevel) {
      this.escalationTimers.set(
        incident.id,
        setTimeout(escalate, firstLevel.delayMinutes * 60 * 1000)
      );
    }
  }

  private clearEscalationTimer(incidentId: string): void {
    const timer = this.escalationTimers.get(incidentId);
    if (timer) {
      clearTimeout(timer);
      this.escalationTimers.delete(incidentId);
    }
  }

  private checkEscalations(): void {
    // Check for incidents that need escalation based on time thresholds
    const now = new Date();

    for (const [id, incident] of this.incidents) {
      if (incident.status === 'resolved') continue;

      const ageMinutes = (now.getTime() - new Date(incident.createdAt).getTime()) / (1000 * 60);

      // Escalate based on severity and age
      if (incident.severity === 'critical' && ageMinutes > 15) {
        this.escalateIncident(id, 2, 'system');
      } else if (incident.severity === 'high' && ageMinutes > 60) {
        this.escalateIncident(id, 2, 'system');
      } else if ((incident.severity === 'medium' || incident.severity === 'low') && ageMinutes > 240) {
        this.escalateIncident(id, 2, 'system');
      }
    }
  }

  private async autoAssignIncident(incident: Incident): Promise<void> {
    const onCallUser = this.getCurrentOnCall();
    if (onCallUser) {
      incident.assignedTo = onCallUser;
      incident.timeline.push({
        timestamp: new Date().toISOString(),
        type: 'assigned',
        actor: 'system',
        description: `Auto-assigned to on-call engineer: ${onCallUser}`
      });
    }
  }

  private async schedulePostmortem(incident: Incident): Promise<void> {
    // Schedule postmortem meeting and create action items
    console.log(`📋 Scheduling postmortem for incident ${incident.id}`);
  }

  // Utility Methods
  private mapSeverityToPriority(severity: Incident['severity']): Incident['priority'] {
    switch (severity) {
      case 'critical': return 'P1';
      case 'high': return 'P2';
      case 'medium': return 'P3';
      case 'low': return 'P4';
      default: return 'P3';
    }
  }

  private calculateResolutionTime(incident: Incident): string {
    if (!incident.resolvedAt) return 'N/A';

    const resolutionTime = new Date(incident.resolvedAt).getTime() - new Date(incident.createdAt).getTime();
    const minutes = Math.floor(resolutionTime / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  }

  private generateIncidentId(): string {
    return `INC-${Date.now().toString(36).toUpperCase()}`;
  }

  private generateRotationId(): string {
    return `ROT-${Date.now().toString(36).toUpperCase()}`;
  }

  private async loadIncidents(): Promise<void> {
    // Load incidents from persistent storage
    // This would typically load from a database
    console.log('Loading existing incidents...');
  }

  // Public API
  getIncidents(status?: Incident['status'], severity?: Incident['severity']): Incident[] {
    let incidents = Array.from(this.incidents.values());

    if (status) {
      incidents = incidents.filter(i => i.status === status);
    }

    if (severity) {
      incidents = incidents.filter(i => i.severity === severity);
    }

    return incidents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getIncident(id: string): Incident | undefined {
    return this.incidents.get(id);
  }

  getOnCallRotations(): OnCallRotation[] {
    return Array.from(this.onCallRotations.values());
  }

  getRunbooks(): IncidentResponseRunbook[] {
    return Array.from(this.runbooks.values());
  }
}

// Default runbooks for common incident types
function initializeDefaultRunbooks(): IncidentResponseRunbook[] {
  return [
    {
      incidentType: 'application_down',
      severity: 'critical',
      initialResponse: [
        'Check application status on monitoring dashboard',
        'Verify server logs for error messages',
        'Check database connectivity',
        'Attempt restart if safe to do so',
      ],
      investigationSteps: [
        'Review recent deployments',
        'Check system resources (CPU, memory, disk)',
        'Analyze error logs and stack traces',
        'Test database queries and connections',
        'Check third-party service status',
      ],
      communicationPlan: [
        'Notify engineering team immediately',
        'Update status page within 5 minutes',
        'Send customer notification within 15 minutes',
        'Provide regular updates every 30 minutes',
      ],
      escalationTriggers: [
        'Downtime exceeds 15 minutes',
        'Customer impact affects 10%+ of users',
        'Revenue impact exceeds $1000/hour',
      ],
      resolutionCriteria: [
        'Application is accessible and functional',
        'All core features are working',
        'Performance metrics return to normal',
        'No data loss occurred',
      ],
      stakeholders: [
        'Engineering Team',
        'Product Team',
        'Customer Success',
        'Executive Team',
      ]
    },
    {
      incidentType: 'performance_degradation',
      severity: 'high',
      initialResponse: [
        'Check performance monitoring dashboards',
        'Review recent traffic patterns',
        'Analyze response times and error rates',
        'Check system resource utilization',
      ],
      investigationSteps: [
        'Identify bottleneck (CPU, memory, network, database)',
        'Review recent code changes',
        'Analyze database query performance',
        'Check CDN and third-party services',
        'Run performance profiling',
      ],
      communicationPlan: [
        'Notify engineering team within 10 minutes',
        'Update internal stakeholders',
        'Monitor for customer impact before external communication',
      ],
      escalationTriggers: [
        'Response time degradation > 50%',
        'Error rate increase > 5%',
        'Customer complaints about slowness',
      ],
      resolutionCriteria: [
        'Performance metrics return to baseline',
        'Response times < 2 seconds (95th percentile)',
        'Error rate < 1%',
        'No customer impact',
      ],
      stakeholders: [
        'Engineering Team',
        'DevOps Team',
        'Performance Team',
      ]
    },
  ];
}

// Initialize default runbooks
const defaultRunbooks = initializeDefaultRunbooks();

// Default on-call rotation
const defaultOnCallRotation: OnCallRotation = {
  id: 'primary-rotation',
  name: 'Primary Engineering On-Call',
  schedule: [
    {
      userId: 'eng-lead-1',
      userName: 'Engineering Lead 1',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
      timezone: 'UTC',
      backupUsers: ['eng-lead-2', 'senior-eng-1']
    },
  ],
  escalationPolicy: [
    {
      level: 1,
      delayMinutes: 5,
      recipients: ['current-on-call'],
      channels: ['slack', 'email'],
      description: 'Initial notification to on-call engineer'
    },
    {
      level: 2,
      delayMinutes: 15,
      recipients: ['engineering-lead', 'devops-lead'],
      channels: ['slack', 'email', 'sms'],
      description: 'Escalate to team leads'
    },
    {
      level: 3,
      delayMinutes: 60,
      recipients: ['cto', 'ceo'],
      channels: ['email', 'sms', 'call'],
      description: 'Executive escalation'
    },
  ],
  contactMethods: [],
  active: true
};

export const incidentResponseService = new IncidentResponseService();

// Export types and utilities
export type { Incident, OnCallRotation, IncidentResponseRunbook };
export { initializeDefaultRunbooks, defaultOnCallRotation };
