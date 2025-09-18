"use client";

import { useState } from 'react';
import { Card, CardContent, Button } from '@ghxstship/ui';
import { Building, Users, ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { Anton } from 'next/font/google';
import { createBrowserClient } from '@supabase/ssr';

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
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
    <div className="stack-xl">
      <div className="text-center">
        <h1 className={`${anton.className} uppercase text-heading-2 text-heading-3 mb-md`}>
          ORGANIZATION SETUP
        </h1>
        <p className="text-body color-muted max-w-2xl mx-auto">
          Create a new organization or join an existing one to collaborate with your team.
        </p>
      </div>

      {!setupType ? (
        <div className="grid md:grid-cols-2 gap-lg">
          {/* Create Organization */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => setSetupType('create')}
          >
            <CardContent className="p-xl text-center">
              <Building className="h-12 w-12 color-primary mx-auto mb-md" />
              <h3 className={`${anton.className} uppercase text-heading-4 text-heading-3 mb-sm`}>
                CREATE ORGANIZATION
              </h3>
              <p className="color-muted mb-lg">
                Start fresh with a new organization. You'll be the owner and can invite team members.
              </p>
              <Button className="w-full">
                <Plus className="mr-sm h-4 w-4" />
                Create New Organization
              </Button>
            </CardContent>
          </Card>

          {/* Join Organization */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => setSetupType('join')}
          >
            <CardContent className="p-xl text-center">
              <Users className="h-12 w-12 color-primary mx-auto mb-md" />
              <h3 className={`${anton.className} uppercase text-heading-4 text-heading-3 mb-sm`}>
                JOIN ORGANIZATION
              </h3>
              <p className="color-muted mb-lg">
                Join an existing organization using an invite code from your team.
              </p>
              <Button variant="outline" className="w-full">
                <Users className="mr-sm h-4 w-4" />
                Join Existing Organization
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="shadow-xl">
          <CardContent className="p-xl">
            {setupType === 'create' ? (
              <div className="stack-lg">
                <div className="text-center mb-lg">
                  <Building className="h-12 w-12 color-primary mx-auto mb-md" />
                  <h2 className={`${anton.className} uppercase text-heading-3 text-heading-3 mb-sm`}>
                    CREATE YOUR ORGANIZATION
                  </h2>
                  <p className="color-muted">
                    Set up your organization workspace
                  </p>
                </div>

                <div>
                  <label className="block text-body-sm form-label color-foreground mb-sm">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-md py-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                    placeholder="Enter organization name"
                    value={orgName}
                    onChange={(e) => handleOrgNameChange(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-body-sm form-label color-foreground mb-sm">
                    Organization URL
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-sm rounded-l-lg border border-r-0 border-border bg-secondary color-muted text-body-sm">
                      ghxstship.com/
                    </span>
                    <input
                      type="text"
                      className="flex-1 px-md py-sm border border-border rounded-r-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                      placeholder="organization-slug"
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-body-sm color-muted mt-xs">
                    This will be your organization's unique URL
                  </p>
                </div>
              </div>
            ) : (
              <div className="stack-lg">
                <div className="text-center mb-lg">
                  <Users className="h-12 w-12 color-primary mx-auto mb-md" />
                  <h2 className={`${anton.className} uppercase text-heading-3 text-heading-3 mb-sm`}>
                    JOIN ORGANIZATION
                  </h2>
                  <p className="color-muted">
                    Enter the invite code provided by your team
                  </p>
                </div>

                <div>
                  <label className="block text-body-sm form-label color-foreground mb-sm">
                    Invite Code
                  </label>
                  <input
                    type="text"
                    className="w-full px-md py-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-center text-body font-mono"
                    placeholder="Enter invite code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    required
                  />
                  <p className="text-body-sm color-muted mt-xs">
                    Ask your team admin for the organization invite code
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-md p-sm bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-body-sm color-destructive">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-lg">
        <Button 
          variant="outline" 
          onClick={setupType ? () => setSetupType(null) : onBack}
        >
          <ArrowLeft className="mr-sm h-4 w-4" />
          Back
        </Button>
        
        {setupType && (
          <Button 
            onClick={handleContinue} 
            disabled={loading || (setupType === 'create' && !orgName.trim()) || (setupType === 'join' && !inviteCode.trim())}
           
          >
            {loading ? 'Setting up...' : 'Continue'}
            <ArrowRight className="ml-sm h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
