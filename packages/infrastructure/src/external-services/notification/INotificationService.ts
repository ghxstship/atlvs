/**
 * Notification Service Interface - Adapter Pattern
 * Abstracts notification provider implementation (SMS, Push, In-App)
 */

export enum NotificationType {
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  EMAIL = 'email',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface NotificationMessage {
  type: NotificationType;
  recipient: string; // phone number, device token, user ID, or email
  title?: string;
  body: string;
  data?: Record<string, unknown>;
  priority?: NotificationPriority;
  scheduledAt?: Date;
}

export interface NotificationResult {
  id: string;
  status: 'sent' | 'failed' | 'scheduled';
  sentAt?: Date;
  error?: string;
}

export interface INotificationService {
  send(message: NotificationMessage): Promise<NotificationResult>;
  sendBulk(messages: NotificationMessage[]): Promise<NotificationResult[]>;
  cancel(notificationId: string): Promise<boolean>;
  getStatus(notificationId: string): Promise<NotificationResult>;
}
