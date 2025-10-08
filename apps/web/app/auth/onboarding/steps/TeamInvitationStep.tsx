"use client";

import { useState } from 'react';
import { Card, CardContent, Button } from '@ghxstship/ui';
import { UserPlus, Mail, ArrowRight, ArrowLeft, X, Send } from 'lucide-react';
import { anton } from '../../../_components/lib/typography';
import { createBrowserClient } from '@supabase/ssr';


interface TeamInvitationStepProps {
  user: any;
  onNext: () => void;
  onBack: () => void;
  updateData: (data: any) => void;
  data: any;
}

interface TeamMember {
  email: string;
  role: 'admin' | 'team_member' | 'viewer';
  name?: string;
}

const roles = [
  { value: 'admin', label: 'Admin', description: 'Full access to organization settings' },
  { value: 'team_member', label: 'Team Member', description: 'Can create and manage projects' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access to projects' },
];

export function TeamInvitationStep({ user, onNext, onBack, updateData, data }: TeamInvitationStepProps) {
  const [invites, setInvites] = useState<TeamMember[]>(data.teamInvites || []);
  const [currentEmail, setCurrentEmail] = useState('');
  const [currentRole, setCurrentRole] = useState<TeamMember['role']>('team_member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skipInvites, setSkipInvites] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const addInvite = () => {
    if (!currentEmail.trim()) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (invites.some(invite => invite.email === currentEmail)) {
      setError('This email has already been added');
      return;
    }

    setInvites([...invites, { email: currentEmail, role: currentRole }]);
    setCurrentEmail('');
    setError('');
  };

  const removeInvite = (index: number) => {
    setInvites(invites.filter((_, i) => i !== index));
  };

  const updateInviteRole = (index: number, role: TeamMember['role']) => {
    const updated = [...invites];
    updated[index].role = role;
    setInvites(updated);
  };

  const handleContinue = async () => {
    setLoading(true);
    setError('');

    try {
      if (!skipInvites && invites.length > 0) {
        // Send invitations
        const { error: inviteError } = await supabase
          .from('organization_invites')
          .insert(
            invites.map(invite => ({
              organization_id: data.organizationId,
              email: invite.email,
              role: invite.role,
              invited_by: user.id,
              status: 'pending'
            }))
          );

        if (inviteError) throw inviteError;

        // Send invitation emails (this would typically be handled by a background job)
        for (const invite of invites) {
          try {
            await fetch('/api/v1/invitations/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: invite.email,
                role: invite.role,
                organizationName: data.orgName,
                inviterName: user.user_metadata?.full_name || user.email
              })
            });
          } catch (emailError) {
            console.warn('Failed to send invitation email:', emailError);
          }
        }
      }

      updateData({
        teamInvites: invites,
        skipTeamInvites: skipInvites
      });

      onNext();
    } catch (err: any) {
      setError(err?.message || "An error occurred" || 'Failed to send invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInvite();
    }
  };

  return (
    <div className="brand-ghostship stack-xl">
      <div className="brand-ghostship text-center">
        <h1 className={`${anton.className} uppercase text-heading-2 text-heading-3 mb-md`}>
          INVITE YOUR TEAM
        </h1>
        <p className="text-body color-muted max-w-2xl mx-auto">
          {data.userRole === 'owner' 
            ? 'Invite team members to collaborate on your projects. You can always add more people later.'
            : 'You can invite team members if you have admin permissions, or skip this step for now.'
          }
        </p>
      </div>

      <Card className="shadow-modal">
        <CardContent className="p-xl">
          <div className="brand-ghostship stack-lg">
            {/* Add Team Member Form */}
            <div className="brand-ghostship stack-md">
              <div className="brand-ghostship flex items-center cluster-sm mb-md">
                <UserPlus className="h-icon-sm w-icon-sm color-accent" />
                <h3 className={`${anton.className} uppercase text-body text-heading-3`}>
                  ADD TEAM MEMBERS
                </h3>
              </div>

              <div className="brand-ghostship grid md:grid-cols-3 gap-md">
                <div className="brand-ghostship md:col-span-2">
                  <label className="block text-body-sm form-label color-foreground mb-sm">
                    Email Address
                  </label>
                  <div className="brand-ghostship relative">
                    <Mail className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-sm w-icon-sm color-muted" />
                    <input
                      type="email"
                      className="w-full pl-2xl pr-md py-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                      placeholder="colleague@company.com"
                      value={currentEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-body-sm form-label color-foreground mb-sm">
                    Role
                  </label>
                  <select
                    className="w-full px-md py-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                    value={currentRole}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrentRole(e.target.value as TeamMember['role'])}
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button onClick={addInvite} disabled={!currentEmail.trim()}>
                <UserPlus className="mr-sm h-icon-xs w-icon-xs" />
                Add Team Member
              </Button>

              {error && (
                <div className="brand-ghostship p-sm bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-body-sm color-destructive">{error}</p>
                </div>
              )}
            </div>

            {/* Invited Members List */}
            {invites.length > 0 && (
              <div className="brand-ghostship stack-md">
                <h4 className={`${anton.className} uppercase text-md text-heading-3`}>
                  PENDING INVITATIONS ({invites.length})
                </h4>
                
                <div className="brand-ghostship stack-sm">
                  {invites.map((invite, index) => (
                    <div key={index} className="flex items-center justify-between p-md bg-secondary/50 rounded-lg">
                      <div className="brand-ghostship flex items-center cluster-sm">
                        <div className="brand-ghostship w-icon-lg h-icon-lg bg-accent/10 rounded-full flex items-center justify-center">
                          <Mail className="h-icon-xs w-icon-xs color-accent" />
                        </div>
                        <div>
                          <p className="form-label color-foreground">{invite.email}</p>
                          <p className="text-body-sm color-muted">
                            {roles.find(r => r.value === invite.role)?.label}
                          </p>
                        </div>
                      </div>
                      
                      <div className="brand-ghostship flex items-center cluster-sm">
                        <select
                          className=" px-md py-xs border border-border rounded text-body-sm bg-background"
                          value={invite.role}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateInviteRole(index, e.target.value as TeamMember['role'])}
                        >
                          {roles.map(role => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                        
                        <Button
                          variant="ghost"
                         
                          onClick={() => removeInvite(index)}
                        >
                          <X className="h-icon-xs w-icon-xs" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skip Option */}
            <div className="brand-ghostship pt-lg border-t border-border">
              <div className="brand-ghostship flex items-center cluster-sm">
                <input
                  type="checkbox"
                  id="skip-invites"
                  checked={skipInvites}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkipInvites(e.target.checked)}
                  className="h-icon-xs w-icon-xs color-accent border-border rounded focus:ring-primary"
                />
                <label htmlFor="skip-invites" className="text-body-sm color-muted">
                  Skip for now - I&apos;ll invite team members later
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <Card>
        <CardContent className="p-lg">
          <h4 className={`${anton.className} uppercase text-md text-heading-3 mb-md`}>
            ROLE PERMISSIONS
          </h4>
          <div className="brand-ghostship grid md:grid-cols-3 gap-md">
            {roles.map(role => (
              <div key={role.value} className="stack-sm">
                <h5 className="text-heading-4 color-foreground">{role.label}</h5>
                <p className="text-body-sm color-muted">{role.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="brand-ghostship flex justify-between pt-lg">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-sm h-icon-xs w-icon-xs" />
          Back
        </Button>
        
        <Button 
          onClick={handleContinue} 
          disabled={loading}
         
        >
          {loading ? 'Sending invites...' : invites.length > 0 && !skipInvites ? 'Send Invitations' : 'Continue'}
          {invites.length > 0 && !skipInvites ? (
            <Send className="ml-sm h-icon-xs w-icon-xs" />
          ) : (
            <ArrowRight className="ml-sm h-icon-xs w-icon-xs" />
          )}
        </Button>
      </div>
    </div>
  );
}
