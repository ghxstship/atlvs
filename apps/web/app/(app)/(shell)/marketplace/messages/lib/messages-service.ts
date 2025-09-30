import { createClient } from '@ghxstship/auth/client';
import type { MessageFormData, ConversationData, MessageData, MessagesStats } from '../types';

export class MessagesService {
  private supabase = createClient();

  async getConversations(filters: unknown = {}): Promise<ConversationData[]> {
    try {
      let query = this.supabase
        .from('marketplace_conversations')
        .select(`
          *,
          participant:users(id, name, email),
          last_message:marketplace_messages(content, created_at)
        `)
        .order('updated_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.unread_only) {
        query = query.gt('unread_count', 0);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  async getConversation(id: string): Promise<ConversationData | null> {
    try {
      const { data, error } = await this.supabase
        .from('marketplace_conversations')
        .select(`
          *,
          participant:users(id, name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
  }

  async getMessages(conversationId: string): Promise<MessageData[]> {
    try {
      const { data, error } = await this.supabase
        .from('marketplace_messages')
        .select(`
          *,
          sender:users(id, name, email)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  async sendMessage(conversationId: string, messageData: Partial<MessageFormData>): Promise<MessageData> {
    try {
      const { data, error } = await this.supabase
        .from('marketplace_messages')
        .insert([{
          conversation_id: conversationId,
          content: messageData.content,
          message_type: messageData.message_type || 'text',
          attachments: messageData.attachments || [],
          read: false
        }])
        .select()
        .single();

      if (error) throw error;

      // Update conversation last message
      await this.supabase
        .from('marketplace_conversations')
        .update({
          last_message: messageData.content,
          last_message_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async createConversation(participantId: string, initialMessage: MessageFormData): Promise<ConversationData> {
    try {
      // Create conversation
      const { data: conversation, error: convError } = await this.supabase
        .from('marketplace_conversations')
        .insert([{
          participant_id: participantId,
          type: initialMessage.message_type,
          status: 'active',
          unread_count: 1,
          last_message: initialMessage.content,
          last_message_time: new Date().toISOString()
        }])
        .select()
        .single();

      if (convError) throw convError;

      // Send initial message
      await this.sendMessage(conversation.id, initialMessage);

      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  async markAsRead(conversationId: string, messageIds?: string[]): Promise<void> {
    try {
      if (messageIds && messageIds.length > 0) {
        // Mark specific messages as read
        await this.supabase
          .from('marketplace_messages')
          .update({ 
            read: true, 
            read_at: new Date().toISOString() 
          })
          .in('id', messageIds);
      } else {
        // Mark all messages in conversation as read
        await this.supabase
          .from('marketplace_messages')
          .update({ 
            read: true, 
            read_at: new Date().toISOString() 
          })
          .eq('conversation_id', conversationId)
          .eq('read', false);
      }

      // Update conversation unread count
      const { data: unreadCount } = await this.supabase
        .from('marketplace_messages')
        .select('id', { count: 'exact' })
        .eq('conversation_id', conversationId)
        .eq('read', false);

      await this.supabase
        .from('marketplace_conversations')
        .update({ unread_count: unreadCount?.length || 0 })
        .eq('id', conversationId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  async archiveConversation(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('marketplace_conversations')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw error;
    }
  }

  async blockConversation(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('marketplace_conversations')
        .update({ status: 'blocked' })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error blocking conversation:', error);
      throw error;
    }
  }

  async searchMessages(query: string, conversationId?: string): Promise<MessageData[]> {
    try {
      let searchQuery = this.supabase
        .from('marketplace_messages')
        .select(`
          *,
          sender:users(id, name, email),
          conversation:marketplace_conversations(id, participant_id)
        `)
        .textSearch('content', query);

      if (conversationId) {
        searchQuery = searchQuery.eq('conversation_id', conversationId);
      }

      const { data, error } = await searchQuery.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  async getMessagesStats(userId: string): Promise<MessagesStats> {
    try {
      const { data: conversations, error } = await this.supabase
        .from('marketplace_conversations')
        .select('*')
        .or(`user_id.eq.${userId},participant_id.eq.${userId}`);

      if (error) throw error;

      const stats: MessagesStats = {
        totalConversations: conversations?.length || 0,
        unreadMessages: conversations?.reduce((sum, c) => sum + (c.unread_count || 0), 0) || 0,
        activeConversations: conversations?.filter(c => c.status === 'active').length || 0,
        archivedConversations: conversations?.filter(c => c.status === 'archived').length || 0,
        averageResponseTime: 0, // Would need additional calculation
        messageTypeBreakdown: {},
        conversationStatusBreakdown: {}
      };

      // Calculate breakdowns
      conversations?.forEach(conversation => {
        stats.messageTypeBreakdown[conversation.type] = (stats.messageTypeBreakdown[conversation.type] || 0) + 1;
        stats.conversationStatusBreakdown[conversation.status] = (stats.conversationStatusBreakdown[conversation.status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching messages stats:', error);
      throw error;
    }
  }

  async exportConversations(format: 'csv' | 'json' | 'excel', filters: unknown = {}): Promise<Blob> {
    try {
      const conversations = await this.getConversations(filters);
      
      const exportData = conversations.map(conversation => ({
        id: conversation.id,
        participant_name: conversation.participant_name,
        type: conversation.type,
        status: conversation.status,
        last_message: conversation.last_message,
        last_message_time: conversation.last_message_time,
        unread_count: conversation.unread_count
      }));

      if (format === 'csv') {
        const headers = Object.keys(exportData[0]).join(',');
        const rows = exportData.map(row => Object.values(row).join(','));
        const csv = [headers, ...rows].join('\n');
        return new Blob([csv], { type: 'text/csv' });
      } else if (format === 'json') {
        const json = JSON.stringify(exportData, null, 2);
        return new Blob([json], { type: 'application/json' });
      } else {
        throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Error exporting conversations:', error);
      throw error;
    }
  }

  // Real-time subscriptions
  subscribeToConversation(conversationId: string, callback: (message: MessageData) => void) {
    return this.supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'marketplace_messages',
          filter: `conversation_id=eq.${conversationId}`
        }, 
        callback
      )
      .subscribe();
  }

  subscribeToConversations(userId: string, callback: (conversation: ConversationData) => void) {
    return this.supabase
      .channel(`user_conversations:${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'marketplace_conversations',
          filter: `participant_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();
  }

  // Helper methods
  generateId(): string {
    return crypto.randomUUID();
  }

  getCurrentUserId(): string {
    return 'current-user-id';
  }
}
