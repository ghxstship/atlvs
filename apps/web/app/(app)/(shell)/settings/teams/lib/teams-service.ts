/**
 * Teams Service Layer
 * ATLVS Architecture Compliance
 */

import { createBrowserClient } from '@ghxstship/auth';
import type {
  TeamMember,
  TeamInvite,
  TeamRecord,
  InviteMemberFormData,
  BulkInviteFormData,
  UpdateMemberFormData,
  TeamSettingsFormData,
  TeamSearchParams,
  TeamStatistics,
  TeamAuditLog,
  TeamExportOptions,
  TeamFilterOptions,
  BulkOperation,
  BulkOperationResult
} from '../types';

class TeamsService {
  private supabase = createBrowserClient();

  /**
   * Member Management
   */
  async getMembers(): Promise<TeamMember[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: membership } = await this.supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) throw new Error('No active organization membership');

      const { data, error } = await this.supabase
        .from('memberships')
        .select(`
          *,
          user:users(name, email, avatar_url)
        `)
        .eq('organization_id', membership.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(member => ({
        id: member.id,
        user_id: member.user_id,
        organization_id: member.organization_id,
        name: member.user?.name || 'Unknown',
        email: member.user?.email || '',
        role: member.role,
        status: member.status,
        avatar_url: member.user?.avatar_url,
        department: member.department,
        title: member.title,
        invited_at: member.invited_at,
        joined_at: member.joined_at,
        last_active: member.last_active,
        created_at: member.created_at,
        updated_at: member.updated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching members:', error);
      throw new Error('Failed to fetch team members');
    }
  }

  async getInvites(): Promise<TeamInvite[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: membership } = await this.supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) throw new Error('No active organization membership');

      const { data, error } = await this.supabase
        .from('invitations')
        .select(`
          *,
          invited_by_user:users!invitations_invited_by_fkey(name, email)
        `)
        .eq('organization_id', membership.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(invite => ({
        id: invite.id,
        organization_id: invite.organization_id,
        email: invite.email,
        role: invite.role,
        status: invite.status,
        invited_by: invite.invited_by,
        invited_by_name: invite.invited_by_user?.name || 'Unknown',
        expires_at: invite.expires_at,
        accepted_at: invite.accepted_at,
        created_at: invite.created_at,
        updated_at: invite.updated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching invites:', error);
      throw new Error('Failed to fetch team invites');
    }
  }

  async inviteMember(data: InviteMemberFormData): Promise<TeamInvite> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: membership } = await this.supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) throw new Error('No active organization membership');

      // Check if user is already a member or has pending invite
      const { data: existingMember } = await this.supabase
        .from('memberships')
        .select('id')
        .eq('organization_id', membership.organization_id)
        .eq('email', data.email)
        .single();

      if (existingMember) {
        throw new Error('User is already a member of this organization');
      }

      const { data: existingInvite } = await this.supabase
        .from('invitations')
        .select('id')
        .eq('organization_id', membership.organization_id)
        .eq('email', data.email)
        .eq('status', 'pending')
        .single();

      if (existingInvite) {
        throw new Error('User already has a pending invitation');
      }

      // Create invitation
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { data: newInvite, error } = await this.supabase
        .from('invitations')
        .insert([{
          organization_id: membership.organization_id,
          email: data.email,
          role: data.role,
          invited_by: user.id,
          expires_at: expiresAt.toISOString(),
          message: data.message,
          department: data.department,
          title: data.title
        }])
        .select()
        .single();

      if (error) throw error;

      // Log the invitation
      await this.logAuditEvent('member_invite', {
        email: data.email,
        role: data.role
      }, user.id, membership.organization_id);

      return {
        ...newInvite,
        invited_by_name: user.email || 'Unknown'
      };
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  }

  async bulkInviteMembers(data: BulkInviteFormData): Promise<BulkOperationResult> {
    const results: BulkOperationResult = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const invite of data.invites) {
      try {
        await this.inviteMember({
          ...invite,
          message: data.message
        });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          memberId: invite.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  async resendInvite(inviteId: string): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update expiry date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await this.supabase
        .from('invitations')
        .update({
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId);

      if (error) throw error;

      // Log the resend
      await this.logAuditEvent('invite_resend', { inviteId }, user.id);
    } catch (error) {
      console.error('Error resending invite:', error);
      throw new Error('Failed to resend invitation');
    }
  }

  async cancelInvite(inviteId: string): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await this.supabase
        .from('invitations')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId);

      if (error) throw error;

      // Log the cancellation
      await this.logAuditEvent('invite_cancel', { inviteId }, user.id);
    } catch (error) {
      console.error('Error cancelling invite:', error);
      throw new Error('Failed to cancel invitation');
    }
  }

  async updateMember(memberId: string, data: UpdateMemberFormData): Promise<TeamMember> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: updatedMember, error } = await this.supabase
        .from('memberships')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId)
        .select(`
          *,
          user:users(name, email, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Log the update
      await this.logAuditEvent('member_update', {
        memberId,
        changes: data
      }, user.id);

      return {
        id: updatedMember.id,
        user_id: updatedMember.user_id,
        organization_id: updatedMember.organization_id,
        name: updatedMember.user?.name || 'Unknown',
        email: updatedMember.user?.email || '',
        role: updatedMember.role,
        status: updatedMember.status,
        avatar_url: updatedMember.user?.avatar_url,
        department: updatedMember.department,
        title: updatedMember.title,
        invited_at: updatedMember.invited_at,
        joined_at: updatedMember.joined_at,
        last_active: updatedMember.last_active,
        created_at: updatedMember.created_at,
        updated_at: updatedMember.updated_at
      };
    } catch (error) {
      console.error('Error updating member:', error);
      throw new Error('Failed to update team member');
    }
  }

  async removeMember(memberId: string): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get member info for audit log
      const { data: member } = await this.supabase
        .from('memberships')
        .select('user_id, email')
        .eq('id', memberId)
        .single();

      const { error } = await this.supabase
        .from('memberships')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      // Log the removal
      await this.logAuditEvent('member_remove', {
        memberId,
        email: member?.email
      }, user.id);
    } catch (error) {
      console.error('Error removing member:', error);
      throw new Error('Failed to remove team member');
    }
  }

  /**
   * Team Records for ATLVS DataViews
   */
  async getTeamRecords(params?: TeamSearchParams): Promise<TeamRecord[]> {
    try {
      const [members, invites] = await Promise.all([
        this.getMembers(),
        this.getInvites(),
      ]);

      const records: TeamRecord[] = [];

      // Member records
      members.forEach(member => {
        records.push({
          id: `member-${member.id}`,
          type: 'member',
          name: member.name,
          email: member.email,
          role: member.role,
          status: member.status,
          description: `${member.title || 'Team Member'} - ${member.department || 'No Department'}`,
          category: 'members',
          created_at: member.created_at,
          updated_at: member.updated_at,
          metadata: member
        });
      });

      // Invite records
      invites.forEach(invite => {
        records.push({
          id: `invite-${invite.id}`,
          type: 'invite',
          name: 'Pending Invitation',
          email: invite.email,
          role: invite.role,
          status: invite.status,
          description: `Invited by ${invite.invited_by_name} - Expires ${new Date(invite.expires_at).toLocaleDateString()}`,
          category: 'invitations',
          created_at: invite.created_at,
          updated_at: invite.updated_at,
          metadata: invite
        });
      });

      // Apply filters
      let filteredRecords = records;

      if (params?.query) {
        filteredRecords = filteredRecords.filter(record =>
          record.name.toLowerCase().includes(params.query!.toLowerCase()) ||
          record.email.toLowerCase().includes(params.query!.toLowerCase()) ||
          record.description.toLowerCase().includes(params.query!.toLowerCase())
        );
      }

      if (params?.type) {
        filteredRecords = filteredRecords.filter(record => record.type === params.type);
      }

      if (params?.role) {
        filteredRecords = filteredRecords.filter(record => record.role === params.role);
      }

      if (params?.status) {
        filteredRecords = filteredRecords.filter(record => record.status === params.status);
      }

      if (params?.category) {
        filteredRecords = filteredRecords.filter(record => record.category === params.category);
      }

      return filteredRecords.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching team records:', error);
      throw new Error('Failed to fetch team records');
    }
  }

  /**
   * Statistics
   */
  async getStatistics(): Promise<TeamStatistics> {
    try {
      const [members, invites] = await Promise.all([
        this.getMembers(),
        this.getInvites(),
      ]);

      const activeMembers = members.filter(m => m.status === 'active').length;
      const pendingInvites = invites.filter(i => i.status === 'pending').length;

      // Count by role
      const membersByRole = members.reduce((acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Count by status
      const membersByStatus = members.reduce((acc, member) => {
        acc[member.status] = (acc[member.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Recent joins (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentJoins = members.filter(m => 
        m.joined_at && new Date(m.joined_at) > thirtyDaysAgo
      ).length;

      // Calculate average response time
      const acceptedInvites = invites.filter(i => i.accepted_at);
      const averageResponseTime = acceptedInvites.length > 0 
        ? acceptedInvites.reduce((sum, invite) => {
            const responseTime = new Date(invite.accepted_at!).getTime() - new Date(invite.created_at).getTime();
            return sum + (responseTime / (1000 * 60 * 60)); // Convert to hours
          }, 0) / acceptedInvites.length
        : 0;

      return {
        totalMembers: members.length,
        activeMembers,
        pendingInvites,
        membersByRole: membersByRole as unknown,
        membersByStatus: membersByStatus as unknown,
        recentJoins,
        averageResponseTime: Math.round(averageResponseTime)
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw new Error('Failed to fetch team statistics');
    }
  }

  /**
   * Bulk Operations
   */
  async performBulkOperation(operation: BulkOperation): Promise<BulkOperationResult> {
    const results: BulkOperationResult = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const memberId of operation.memberIds) {
      try {
        switch (operation.type) {
          case 'role_change':
            await this.updateMember(memberId, { 
              role: operation.data.role,
              status: 'active' // Ensure we don't accidentally change status
            });
            break;
          case 'status_change':
            await this.updateMember(memberId, { 
              status: operation.data.status,
              role: 'member' // Ensure we don't accidentally change role
            });
            break;
          case 'remove':
            await this.removeMember(memberId);
            break;
          case 'resend_invite':
            await this.resendInvite(memberId);
            break;
        }
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          memberId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Export
   */
  async exportRecords(options: TeamExportOptions): Promise<Blob> {
    try {
      const records = await this.getTeamRecords();

      if (options.format === 'json') {
        const exportData = options.includeMetadata 
          ? records 
          : records.map(({ id, name, email, role, status, description, category }) => ({
              id, name, email, role, status, description, category
            }));

        return new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json'
        });
      } else if (options.format === 'csv') {
        const headers = options.includeMetadata
          ? ['ID', 'Name', 'Email', 'Role', 'Status', 'Description', 'Category', 'Created', 'Updated']
          : ['ID', 'Name', 'Email', 'Role', 'Status', 'Description', 'Category'];

        const rows = records.map(record => {
          const baseRow = [
            record.id,
            record.name,
            record.email,
            record.role,
            record.status,
            record.description,
            record.category,
          ];

          if (options.includeMetadata) {
            return [...baseRow, record.created_at, record.updated_at];
          }

          return baseRow;
        });

        const csvContent = [headers, ...rows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');

        return new Blob([csvContent], { type: 'text/csv' });
      }

      throw new Error('Unsupported export format');
    } catch (error) {
      console.error('Error exporting records:', error);
      throw new Error('Failed to export team records');
    }
  }

  /**
   * Audit Logs
   */
  async getAuditLogs(): Promise<TeamAuditLog[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: membership } = await this.supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) throw new Error('No active organization membership');

      const { data, error } = await this.supabase
        .from('team_audit_logs')
        .select(`
          *,
          performed_by_user:users!team_audit_logs_performed_by_fkey(name, email)
        `)
        .eq('organization_id', membership.organization_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return data?.map(log => ({
        ...log,
        performed_by_name: log.performed_by_user?.name || log.performed_by_user?.email || 'Unknown'
      })) || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw new Error('Failed to fetch audit logs');
    }
  }

  /**
   * Private helper methods
   */
  private async logAuditEvent(
    action: string,
    details: unknown,
    userId: string,
    orgId?: string
  ): Promise<void> {
    try {
      if (!orgId) {
        const { data: membership } = await this.supabase
          .from('memberships')
          .select('organization_id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();
        orgId = membership?.organization_id;
      }

      if (!orgId) return;

      await this.supabase
        .from('team_audit_logs')
        .insert([{
          organization_id: orgId,
          action,
          details,
          performed_by: userId,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }
}

export const teamsService = new TeamsService();
