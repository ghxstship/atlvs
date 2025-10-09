'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Shield, RefreshCw, UserMinus, Settings as SettingsIcon } from "lucide-react";
import { createBrowserClient } from '@ghxstship/auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@ghxstship/ui';

interface TeamsSettingsProps {
  userId: string;
  orgId: string;
}

interface TeamMember {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'viewer' | 'contributor' | 'manager' | 'admin';
  status: 'active' | 'pending' | 'inactive';
  joined_at: string;
  last_active?: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: 'viewer' | 'contributor' | 'manager' | 'admin';
  invited_at: string;
  expires_at: string;
  invited_by: string;
}

const ROLE_CONFIGS = {
  viewer: { label: 'Viewer', color: 'bg-gray-100 text-gray-800', description: 'Read-only access' },
  contributor: { label: 'Contributor', color: 'bg-blue-100 text-blue-800', description: 'Can edit and create' },
  manager: { label: 'Manager', color: 'bg-yellow-100 text-yellow-800', description: 'Can manage team and settings' },
  admin: { label: 'Admin', color: 'bg-red-100 text-red-800', description: 'Full administrative access' }
};

export default function TeamsSettings({ userId, orgId }: TeamsSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'contributor' | 'manager' | 'admin'>('contributor');
  const [showInviteForm, setShowInviteForm] = useState(false);

  const supabase = createBrowserClient();

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        // Load team members
        const { data: membersData, error: membersError } = await supabase
          .from('memberships')
          .select(`
            id,
            role,
            status,
            created_at,
            profiles:user_id (
              id,
              email,
              name,
              avatar_url
            )
          `)
          .eq('organization_id', orgId);

        if (membersError) throw membersError;

        const formattedMembers: TeamMember[] = (membersData || []).map(item => ({
          id: item.profiles.id,
          email: item.profiles.email,
          name: item.profiles.name,
          avatar_url: item.profiles.avatar_url,
          role: item.role,
          status: item.status,
          joined_at: item.created_at,
          last_active: new Date().toISOString() // Mock last active
        }));

        setMembers(formattedMembers);

        // Mock pending invites for now
        setPendingInvites([]);

      } catch (error) {
        console.error('Error loading team data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [orgId, supabase]);

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return;

    try {
      // This would integrate with actual invite system

      // Mock adding to pending invites
      const newInvite: PendingInvite = {
        id: `invite_${Date.now()}`,
        email: inviteEmail,
        role: inviteRole,
        invited_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        invited_by: userId
      };

      setPendingInvites(prev => [...prev, newInvite]);
      setInviteEmail('');
      setInviteRole('contributor');
      setShowInviteForm(false);

    } catch (error) {
      console.error('Error sending invite:', error);
    }
  };

  const handleRevokeInvite = (inviteId: string) => {
    setPendingInvites(prev => prev.filter(invite => invite.id !== inviteId));
  };

  const handleUpdateRole = async (memberId: string, newRole: TeamMember['role']) => {
    try {
      const { error } = await supabase
        .from('memberships')
        .update({ role: newRole })
        .eq('user_id', memberId)
        .eq('organization_id', orgId);

      if (error) throw error;

      setMembers(prev => prev.map(member =>
        member.id === memberId ? { ...member, role: newRole } : member
      ));

    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('user_id', memberId)
        .eq('organization_id', orgId);

      if (error) throw error;

      setMembers(prev => prev.filter(member => member.id !== memberId));

    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading team settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
        <Card>
          <CardContent className="p-md">
            <div className="flex items-center gap-sm">
              <div className="p-xs bg-blue-100 rounded-full">
                <Users className="h-icon-xs w-icon-xs text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{members.length}</p>
                <p className="text-sm text-muted-foreground">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-md">
            <div className="flex items-center gap-sm">
              <div className="p-xs bg-yellow-100 rounded-full">
                <Mail className="h-icon-xs w-icon-xs text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingInvites.length}</p>
                <p className="text-sm text-muted-foreground">Pending Invites</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-md">
            <div className="flex items-center gap-sm">
              <div className="p-xs bg-green-100 rounded-full">
                <Shield className="h-icon-xs w-icon-xs text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{members.filter(m => m.role === 'admin').length}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-md">
            <div className="flex items-center gap-sm">
              <div className="p-xs bg-purple-100 rounded-full">
                <UserPlus className="h-icon-xs w-icon-xs text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{members.filter(m => m.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-xs">
              <Users className="h-icon-sm w-icon-sm" />
              Team Members
            </CardTitle>
            <Button onClick={() => setShowInviteForm(!showInviteForm)}>
              <UserPlus className="h-icon-xs w-icon-xs mr-2" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-md">
          {/* Invite Form */}
          {showInviteForm && (
            <Card className="border-dashed">
              <CardContent className="p-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  <div className="space-y-xs">
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-xs">
                    <Label htmlFor="invite-role">Role</Label>
                    <Select value={inviteRole} onChange={(value: unknown) => setInviteRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROLE_CONFIGS).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-xs">
                              <span>{config.label}</span>
                              <span className="text-xs text-muted-foreground">• {config.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-xs">
                    <Button onClick={handleSendInvite} className="flex-1">
                      <Mail className="h-icon-xs w-icon-xs mr-2" />
                      Send Invite
                    </Button>
                    <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Members List */}
          <div className="space-y-md">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-md border rounded-lg">
                <div className="flex items-center gap-sm">
                  <Avatar>
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback>
                      {member.name?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name || member.email}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-sm">
                  <Select
                    value={member.role}
                    onChange={(value: unknown) => handleUpdateRole(member.id, value)}
                  >
                    <SelectTrigger className="w-component-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_CONFIGS).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Badge className={ROLE_CONFIGS[member.role].color}>
                    {ROLE_CONFIGS[member.role].label}
                  </Badge>

                  {member.id !== userId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <UserMinus className="h-icon-xs w-icon-xs" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-xs">
              <Mail className="h-icon-sm w-icon-sm" />
              Pending Invites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-md">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-md border rounded-lg">
                  <div className="flex items-center gap-sm">
                    <div className="p-xs bg-blue-100 rounded-full">
                      <Mail className="h-icon-xs w-icon-xs text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited {new Date(invite.invited_at).toLocaleDateString()} • Expires {new Date(invite.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-sm">
                    <Badge className={ROLE_CONFIGS[invite.role].color}>
                      {ROLE_CONFIGS[invite.role].label}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeInvite(invite.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <SettingsIcon className="h-icon-sm w-icon-sm" />
            Team Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-md">
            <p className="text-sm text-muted-foreground">
              Additional team management settings and policies will be available here.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <Button variant="outline" className="justify-start">
                <Shield className="h-icon-xs w-icon-xs mr-2" />
                Manage Roles & Permissions
              </Button>
              <Button variant="outline" className="justify-start">
                <RefreshCw className="h-icon-xs w-icon-xs mr-2" />
                Bulk Import Members
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
