/**
 * Twilio Notification Service Implementation
 * Implements INotificationService using Twilio for SMS
 */

import {
  INotificationService,
  NotificationMessage,
  NotificationResult,
  NotificationType,
} from './INotificationService';

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export class TwilioNotificationService implements INotificationService {
  constructor(private readonly config: TwilioConfig) {}

  async send(message: NotificationMessage): Promise<NotificationResult> {
    if (message.type !== NotificationType.SMS) {
      throw new Error(`Twilio service only supports SMS notifications`);
    }

    try {
      // In production, use actual Twilio SDK
      // const client = twilio(this.config.accountSid, this.config.authToken);
      // const result = await client.messages.create({
      //   body: message.body,
      //   from: this.config.fromNumber,
      //   to: message.recipient,
      // });

      // Mock implementation for now
      const result = {
        id: `twilio_${Date.now()}`,
        status: 'sent' as const,
        sentAt: new Date(),
      };

      return result;
    } catch (error) {
      return {
        id: `twilio_${Date.now()}`,
        status: 'failed' as const,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendBulk(messages: NotificationMessage[]): Promise<NotificationResult[]> {
    return Promise.all(messages.map((msg) => this.send(msg)));
  }

  async cancel(_notificationId: string): Promise<boolean> {
    // Twilio doesn't support canceling sent messages
    return false;
  }

  async getStatus(notificationId: string): Promise<NotificationResult> {
    // In production, query Twilio API for message status
    return {
      id: notificationId,
      status: 'sent' as const,
      sentAt: new Date(),
    };
  }
}
