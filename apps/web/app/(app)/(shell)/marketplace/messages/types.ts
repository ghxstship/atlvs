import type { DataRecord } from '@ghxstship/ui';

export interface MessageFormData {
  recipient_id: string;
  subject?: string;
  content: string;
  message_type: 'listing_inquiry' | 'project_proposal' | 'vendor_contact' | 'general';
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface ConversationData {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: 'active' | 'archived' | 'blocked';
  type: 'listing_inquiry' | 'project_proposal' | 'vendor_contact' | 'general';
  metadata?: {
    listing_id?: string;
    project_id?: string;
    vendor_id?: string;
  };
}

export interface MessageData extends DataRecord {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  message_type: 'text' | 'file' | 'system' | 'automated';
  timestamp: string;
  read: boolean;
  read_at?: string;
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  metadata?: Record<string, unknown>;
}

export interface MessagesStats {
  totalConversations: number;
  unreadMessages: number;
  activeConversations: number;
  archivedConversations: number;
  averageResponseTime: number;
  messageTypeBreakdown: Record<string, number>;
  conversationStatusBreakdown: Record<string, number>;
}

export interface MessageActivity extends DataRecord {
  id: string;
  conversation_id: string;
  type: 'message_sent' | 'message_read' | 'conversation_archived' | 'participant_added';
  user_id: string;
  user_name?: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface MessageSearchFilters {
  query?: string;
  conversation_type?: 'listing_inquiry' | 'project_proposal' | 'vendor_contact' | 'general';
  status?: 'active' | 'archived' | 'blocked';
  unread_only?: boolean;
  date_range?: {
    start?: string;
    end?: string;
  };
  participant?: string;
  sortBy?: 'last_message_time' | 'created_at' | 'participant_name';
  sortOrder?: 'asc' | 'desc';
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quiet_hours: {
    enabled: boolean;
    start_time: string;
    end_time: string;
  };
}
