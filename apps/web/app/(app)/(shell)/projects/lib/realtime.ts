import { createBrowserClient } from "@ghxstship/auth";
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// Subscription types
export type SubscriptionType =
  | 'projects'
  | 'tasks'
  | 'files'
  | 'risks'
  | 'inspections'
  | 'activations'
  | 'locations'
  | 'milestones'
  | 'all';

export type ChangeType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeChange<T = any> {
  type: ChangeType;
  table: string;
  record: T;
  oldRecord?: T;
  timestamp: string;
}

// Subscription callback types
export type ProjectChangeCallback = (change: RealtimeChange) => void;
export type TaskChangeCallback = (change: RealtimeChange) => void;
export type FileChangeCallback = (change: RealtimeChange) => void;
export type RiskChangeCallback = (change: RealtimeChange) => void;
export type InspectionChangeCallback = (change: RealtimeChange) => void;
export type ActivationChangeCallback = (change: RealtimeChange) => void;
export type LocationChangeCallback = (change: RealtimeChange) => void;
export type MilestoneChangeCallback = (change: RealtimeChange) => void;
export type GeneralChangeCallback = (change: RealtimeChange) => void;

// Subscription options
export interface SubscriptionOptions {
  orgId: string;
  projectId?: string;
  userId?: string;
  includeRelated?: boolean;
  debounceMs?: number;
}

// Active subscription
export interface ActiveSubscription {
  id: string;
  channel: RealtimeChannel;
  type: SubscriptionType;
  unsubscribe: () => void;
}

/**
 * PROJECTS REAL-TIME SUBSCRIPTIONS
 */
export class ProjectRealtime {
  private supabase = createBrowserClient();
  private subscriptions = new Map<string, ActiveSubscription>();

  /**
   * Subscribe to project changes
   */
  subscribeToProjects(
    options: SubscriptionOptions,
    callback: ProjectChangeCallback
  ): string {
    const subscriptionId = `projects_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const channel = this.supabase
      .channel(`projects_${options.orgId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `organization_id=eq.${options.orgId}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const change: RealtimeChange = {
            type: payload.eventType as ChangeType,
            table: 'projects',
            record: payload.new || payload.record,
            oldRecord: payload.old,
            timestamp: new Date().toISOString()
          };

          // Debounce if configured
          if (options.debounceMs) {
            setTimeout(() => callback(change), options.debounceMs);
          } else {
            callback(change);
          }
        }
      )
      .subscribe();

    const subscription: ActiveSubscription = {
      id: subscriptionId,
      channel,
      type: 'projects',
      unsubscribe: () => {
        this.supabase.removeChannel(channel);
        this.subscriptions.delete(subscriptionId);
      }
    };

    this.subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }

  /**
   * Subscribe to project-specific changes (tasks, files, etc.)
   */
  subscribeToProject(
    projectId: string,
    options: SubscriptionOptions,
    callback: GeneralChangeCallback
  ): string {
    const subscriptionId = `project_${projectId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const tables = ['project_tasks', 'project_files', 'project_risks', 'project_inspections', 'project_milestones'];

    const channel = this.supabase.channel(`project_${projectId}`);

    tables.forEach(table => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `project_id=eq.${projectId}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const change: RealtimeChange = {
            type: payload.eventType as ChangeType,
            table,
            record: payload.new || payload.record,
            oldRecord: payload.old,
            timestamp: new Date().toISOString()
          };

          if (options.debounceMs) {
            setTimeout(() => callback(change), options.debounceMs);
          } else {
            callback(change);
          }
        }
      );
    });

    channel.subscribe();

    const subscription: ActiveSubscription = {
      id: subscriptionId,
      channel,
      type: 'all',
      unsubscribe: () => {
        this.supabase.removeChannel(channel);
        this.subscriptions.delete(subscriptionId);
      }
    };

    this.subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }
}

/**
 * TASKS REAL-TIME SUBSCRIPTIONS
 */
export class TaskRealtime {
  private supabase = createBrowserClient();
  private subscriptions = new Map<string, ActiveSubscription>();

  subscribeToTasks(
    options: SubscriptionOptions,
    callback: TaskChangeCallback
  ): string {
    const subscriptionId = `tasks_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let filter = `organization_id=eq.${options.orgId}`;
    if (options.projectId) {
      filter += `,project_id=eq.${options.projectId}`;
    }

    const channel = this.supabase
      .channel(`tasks_${options.orgId}_${options.projectId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_tasks',
          filter
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const change: RealtimeChange = {
            type: payload.eventType as ChangeType,
            table: 'project_tasks',
            record: payload.new || payload.record,
            oldRecord: payload.old,
            timestamp: new Date().toISOString()
          };

          if (options.debounceMs) {
            setTimeout(() => callback(change), options.debounceMs);
          } else {
            callback(change);
          }
        }
      )
      .subscribe();

    const subscription: ActiveSubscription = {
      id: subscriptionId,
      channel,
      type: 'tasks',
      unsubscribe: () => {
        this.supabase.removeChannel(channel);
        this.subscriptions.delete(subscriptionId);
      }
    };

    this.subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }
}

/**
 * FILES REAL-TIME SUBSCRIPTIONS
 */
export class FileRealtime {
  private supabase = createBrowserClient();
  private subscriptions = new Map<string, ActiveSubscription>();

  subscribeToFiles(
    options: SubscriptionOptions,
    callback: FileChangeCallback
  ): string {
    const subscriptionId = `files_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let filter = `organization_id=eq.${options.orgId}`;
    if (options.projectId) {
      filter += `,project_id=eq.${options.projectId}`;
    }

    const channel = this.supabase
      .channel(`files_${options.orgId}_${options.projectId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_files',
          filter
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const change: RealtimeChange = {
            type: payload.eventType as ChangeType,
            table: 'project_files',
            record: payload.new || payload.record,
            oldRecord: payload.old,
            timestamp: new Date().toISOString()
          };

          if (options.debounceMs) {
            setTimeout(() => callback(change), options.debounceMs);
          } else {
            callback(change);
          }
        }
      )
      .subscribe();

    const subscription: ActiveSubscription = {
      id: subscriptionId,
      channel,
      type: 'files',
      unsubscribe: () => {
        this.supabase.removeChannel(channel);
        this.subscriptions.delete(subscriptionId);
      }
    };

    this.subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }
}

/**
 * RISKS REAL-TIME SUBSCRIPTIONS
 */
export class RiskRealtime {
  private supabase = createBrowserClient();
  private subscriptions = new Map<string, ActiveSubscription>();

  subscribeToRisks(
    options: SubscriptionOptions,
    callback: RiskChangeCallback
  ): string {
    const subscriptionId = `risks_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let filter = `organization_id=eq.${options.orgId}`;
    if (options.projectId) {
      filter += `,project_id=eq.${options.projectId}`;
    }

    const channel = this.supabase
      .channel(`risks_${options.orgId}_${options.projectId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_risks',
          filter
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const change: RealtimeChange = {
            type: payload.eventType as ChangeType,
            table: 'project_risks',
            record: payload.new || payload.record,
            oldRecord: payload.old,
            timestamp: new Date().toISOString()
          };

          if (options.debounceMs) {
            setTimeout(() => callback(change), options.debounceMs);
          } else {
            callback(change);
          }
        }
      )
      .subscribe();

    const subscription: ActiveSubscription = {
      id: subscriptionId,
      channel,
      type: 'risks',
      unsubscribe: () => {
        this.supabase.removeChannel(channel);
        this.subscriptions.delete(subscriptionId);
      }
    };

    this.subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }
}

/**
 * INSPECTIONS REAL-TIME SUBSCRIPTIONS
 */
export class InspectionRealtime {
  private supabase = createBrowserClient();
  private subscriptions = new Map<string, ActiveSubscription>();

  subscribeToInspections(
    options: SubscriptionOptions,
    callback: InspectionChangeCallback
  ): string {
    const subscriptionId = `inspections_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let filter = `organization_id=eq.${options.orgId}`;
    if (options.projectId) {
      filter += `,project_id=eq.${options.projectId}`;
    }

    const channel = this.supabase
      .channel(`inspections_${options.orgId}_${options.projectId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_inspections',
          filter
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const change: RealtimeChange = {
            type: payload.eventType as ChangeType,
            table: 'project_inspections',
            record: payload.new || payload.record,
            oldRecord: payload.old,
            timestamp: new Date().toISOString()
          };

          if (options.debounceMs) {
            setTimeout(() => callback(change), options.debounceMs);
          } else {
            callback(change);
          }
        }
      )
      .subscribe();

    const subscription: ActiveSubscription = {
      id: subscriptionId,
      channel,
      type: 'inspections',
      unsubscribe: () => {
        this.supabase.removeChannel(channel);
        this.subscriptions.delete(subscriptionId);
      }
    };

    this.subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }
}

/**
 * ACTIVATIONS REAL-TIME SUBSCRIPTIONS
 */
export class ActivationRealtime {
  private supabase = createBrowserClient();
  private subscriptions = new Map<string, ActiveSubscription>();

  subscribeToActivations(
    options: SubscriptionOptions,
    callback: ActivationChangeCallback
  ): string {
    const subscriptionId = `activations_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let filter = `organization_id=eq.${options.orgId}`;
    if (options.projectId) {
      filter += `,project_id=eq.${options.projectId}`;
    }

    const channel = this.supabase
      .channel(`activations_${options.orgId}_${options.projectId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_activations',
          filter
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const change: RealtimeChange = {
            type: payload.eventType as ChangeType,
            table: 'project_activations',
            record: payload.new || payload.record,
            oldRecord: payload.old,
            timestamp: new Date().toISOString()
          };

          if (options.debounceMs) {
            setTimeout(() => callback(change), options.debounceMs);
          } else {
            callback(change);
          }
        }
      )
      .subscribe();

    const subscription: ActiveSubscription = {
      id: subscriptionId,
      channel,
      type: 'activations',
      unsubscribe: () => {
        this.supabase.removeChannel(channel);
        this.subscriptions.delete(subscriptionId);
      }
    };

    this.subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }
}

/**
 * LOCATIONS REAL-TIME SUBSCRIPTIONS
 */
export class LocationRealtime {
  private supabase = createBrowserClient();
  private subscriptions = new Map<string, ActiveSubscription>();

  subscribeToLocations(
    options: SubscriptionOptions,
    callback: LocationChangeCallback
  ): string {
    const subscriptionId = `locations_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const channel = this.supabase
      .channel(`locations_${options.orgId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_locations',
          filter: `organization_id=eq.${options.orgId}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const change: RealtimeChange = {
            type: payload.eventType as ChangeType,
            table: 'project_locations',
            record: payload.new || payload.record,
            oldRecord: payload.old,
            timestamp: new Date().toISOString()
          };

          if (options.debounceMs) {
            setTimeout(() => callback(change), options.debounceMs);
          } else {
            callback(change);
          }
        }
      )
      .subscribe();

    const subscription: ActiveSubscription = {
      id: subscriptionId,
      channel,
      type: 'locations',
      unsubscribe: () => {
        this.supabase.removeChannel(channel);
        this.subscriptions.delete(subscriptionId);
      }
    };

    this.subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }
}

/**
 * MILESTONES REAL-TIME SUBSCRIPTIONS
 */
export class MilestoneRealtime {
  private supabase = createBrowserClient();
  private subscriptions = new Map<string, ActiveSubscription>();

  subscribeToMilestones(
    options: SubscriptionOptions,
    callback: MilestoneChangeCallback
  ): string {
    const subscriptionId = `milestones_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let filter = `organization_id=eq.${options.orgId}`;
    if (options.projectId) {
      filter += `,project_id=eq.${options.projectId}`;
    }

    const channel = this.supabase
      .channel(`milestones_${options.orgId}_${options.projectId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_milestones',
          filter
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const change: RealtimeChange = {
            type: payload.eventType as ChangeType,
            table: 'project_milestones',
            record: payload.new || payload.record,
            oldRecord: payload.old,
            timestamp: new Date().toISOString()
          };

          if (options.debounceMs) {
            setTimeout(() => callback(change), options.debounceMs);
          } else {
            callback(change);
          }
        }
      )
      .subscribe();

    const subscription: ActiveSubscription = {
      id: subscriptionId,
      channel,
      type: 'milestones',
      unsubscribe: () => {
        this.supabase.removeChannel(channel);
        this.subscriptions.delete(subscriptionId);
      }
    };

    this.subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }
}

/**
 * COMPREHENSIVE REAL-TIME MANAGER
 */
export class ProjectRealtimeManager {
  private subscriptions = new Map<string, ActiveSubscription>();

  private projectRealtime = new ProjectRealtime();
  private taskRealtime = new TaskRealtime();
  private fileRealtime = new FileRealtime();
  private riskRealtime = new RiskRealtime();
  private inspectionRealtime = new InspectionRealtime();
  private activationRealtime = new ActivationRealtime();
  private locationRealtime = new LocationRealtime();
  private milestoneRealtime = new MilestoneRealtime();

  /**
   * Subscribe to all project-related changes
   */
  subscribeToAll(
    options: SubscriptionOptions,
    callback: GeneralChangeCallback
  ): string {
    const subscriptionIds: string[] = [];

    // Subscribe to all entity types
    subscriptionIds.push(
      this.projectRealtime.subscribeToProjects(options, callback),
      this.taskRealtime.subscribeToTasks(options, callback),
      this.fileRealtime.subscribeToFiles(options, callback),
      this.riskRealtime.subscribeToRisks(options, callback),
      this.inspectionRealtime.subscribeToInspections(options, callback),
      this.activationRealtime.subscribeToActivations(options, callback),
      this.locationRealtime.subscribeToLocations(options, callback),
      this.milestoneRealtime.subscribeToMilestones(options, callback)
    );

    // If project-specific, also subscribe to project changes
    if (options.projectId) {
      subscriptionIds.push(
        this.projectRealtime.subscribeToProject(options.projectId, options, callback)
      );
    }

    // Create a master subscription that manages all sub-subscriptions
    const masterId = `all_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const masterSubscription: ActiveSubscription = {
      id: masterId,
      channel: null as any, // Not a single channel
      type: 'all',
      unsubscribe: () => {
        subscriptionIds.forEach(id => this.unsubscribe(id));
        this.subscriptions.delete(masterId);
      }
    };

    this.subscriptions.set(masterId, masterSubscription);
    return masterId;
  }

  /**
   * Unsubscribe from a specific subscription
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
    }
  }

  /**
   * Unsubscribe from all subscriptions
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  /**
   * Get active subscription count
   */
  getActiveSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): ActiveSubscription[] {
    return Array.from(this.subscriptions.values());
  }
}

// Export singleton instances
export const projectRealtime = new ProjectRealtime();
export const taskRealtime = new TaskRealtime();
export const fileRealtime = new FileRealtime();
export const riskRealtime = new RiskRealtime();
export const inspectionRealtime = new InspectionRealtime();
export const activationRealtime = new ActivationRealtime();
export const locationRealtime = new LocationRealtime();
export const milestoneRealtime = new MilestoneRealtime();
export const projectRealtimeManager = new ProjectRealtimeManager();
