/**
 * SendGrid Email Service Adapter
 * Implements IEmailService using SendGrid
 */

import { IEmailService, EmailMessage } from './IEmailService';

export class SendGridAdapter implements IEmailService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(message: EmailMessage): Promise<boolean> {
    try {
      // Mock implementation
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(this.apiKey);
      // await sgMail.send({
      //   to: message.to,
      //   subject: message.subject,
      //   html: message.html,
      //   text: message.text,
      // });
      
      console.log('Email sent:', message.to, message.subject);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendBulkEmail(messages: EmailMessage[]): Promise<boolean> {
    try {
      // Mock implementation
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(this.apiKey);
      // await sgMail.send(messages.map(msg => ({
      //   to: msg.to,
      //   subject: msg.subject,
      //   html: msg.html,
      //   text: msg.text,
      // })));
      
      console.log('Bulk emails sent:', messages.length);
      return true;
    } catch (error) {
      console.error('Failed to send bulk emails:', error);
      return false;
    }
  }
}
