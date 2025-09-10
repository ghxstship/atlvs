"use client";

import { useState } from 'react';
import { Card, CardContent, Button } from '@ghxstship/ui';
import { Building, Users, ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { Anton } from 'next/font/google';
import { createBrowserClient } from '@ghxstship/auth';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

interface OrganizationSetupStepProps {
  user: any;
  onNext: () => void;
  onBack: () => void;
  updateData: (data: any) => void;
  data: any;
}

export function OrganizationSetupStep({ user, onNext, onBack, updateData, data }: OrganizationSetupStepProps) {
  const [setupType, setSetupType] = useState<'create' | 'join' | null>(data.setupType || null);
  const [orgName, setOrgName] = useState(data.orgName || '');
  const [orgSlug, setOrgSlug] = useState(data.orgSlug || '');
  const [inviteCode, setInviteCode] = useState(data.inviteCode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const supabase = createBrowserClient();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleOrgNameChange = (value: string) => {
    setOrgName(value);
    setOrgSlug(generateSlug(value));
  };

  const handleContinue = async () => {
    setLoading(true);
    setError('');

    try {
      if (setupType === 'create') {
        if (!orgName.trim()) {
          throw new Error('Organization name is required');
        }

        // Create organization
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: orgName.trim(),
            slug: orgSlug,
            created_by: user.id,
          })
          .select()
          .single();

        if (orgError) throw orgError;

        // Create membership for the user as owner
        const { error: membershipError } = await supabase
          .from('memberships')
          .insert({
            user_id: user.id,
            organization_id: org.id,
            role: 'owner',
            status: 'active',
          });

        if (membershipError) throw membershipError;

        updateData({
          setupType,
          orgName,
          orgSlug,
          organizationId: org.id,
          userRole: 'owner',
        });

      } else if (setupType === 'join') {
        if (!inviteCode.trim()) {
          throw new Error('Invite code is required');
        }

        // Find organization by invite code
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('invite_code', inviteCode.trim())
          .single();

        if (orgError || !org) {
          throw new Error('Invalid invite code');
        }

        // Create membership for the user
        const { error: membershipError } = await supabase
          .from('memberships')
          .insert({
            user_id: user.id,
            organization_id: org.id,
            role: 'team_member',
            status: 'active',
          });

        if (membershipError) throw membershipError;

        updateData({
          setupType,
          inviteCode,
          organizationId: org.id,
          orgName: org.name,
          userRole: 'team_member',
        });
      }

      onNext();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className={`${anton.className} uppercase text-3xl font-bold mb-4`}>
          ORGANIZATION SETUP
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create a new organization or join an existing one to collaborate with your team.
        </p>
      </div>

      {!setupType ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Organization */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => setSetupType('create')}
          >
            <CardContent className="p-8 text-center">
              <Building className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className={`${anton.className} uppercase text-xl font-bold mb-3`}>
                CREATE ORGANIZATION
              </h3>
              <p className="text-muted-foreground mb-6">
                Start fresh with a new organization. You'll be the owner and can invite team members.
              </p>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create New Organization
              </Button>
            </CardContent>
          </Card>

          {/* Join Organization */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => setSetupType('join')}
          >
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className={`${anton.className} uppercase text-xl font-bold mb-3`}>
                JOIN ORGANIZATION
              </h3>
              <p className="text-muted-foreground mb-6">
                Join an existing organization using an invite code from your team.
              </p>
              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Join Existing Organization
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="shadow-xl">
          <CardContent className="p-8">
            {setupType === 'create' ? (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Building className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h2 className={`${anton.className} uppercase text-2xl font-bold mb-2`}>
                    CREATE YOUR ORGANIZATION
                  </h2>
                  <p className="text-muted-foreground">
                    Set up your organization workspace
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                    placeholder="Enter organization name"
                    value={orgName}
                    onChange={(e) => handleOrgNameChange(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Organization URL
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                      ghxstship.com/
                    </span>
                    <input
                      type="text"
                      className="flex-1 px-4 py-3 border border-border rounded-r-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                      placeholder="organization-slug"
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be your organization's unique URL
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h2 className={`${anton.className} uppercase text-2xl font-bold mb-2`}>
                    JOIN ORGANIZATION
                  </h2>
                  <p className="text-muted-foreground">
                    Enter the invite code provided by your team
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Invite Code
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-center text-lg font-mono"
                    placeholder="Enter invite code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ask your team admin for the organization invite code
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={setupType ? () => setSetupType(null) : onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        {setupType && (
          <Button 
            onClick={handleContinue} 
            disabled={loading || (setupType === 'create' && !orgName.trim()) || (setupType === 'join' && !inviteCode.trim())}
           
          >
            {loading ? 'Setting up...' : 'Continue'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
