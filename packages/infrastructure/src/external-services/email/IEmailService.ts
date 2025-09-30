/**
 * Email Service Interface - Adapter Pattern
 * Abstracts email provider implementation
 */

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IEmailService {
  sendEmail(message: EmailMessage): Promise<boolean>;
  sendBulkEmail(messages: EmailMessage[]): Promise<boolean>;
}
