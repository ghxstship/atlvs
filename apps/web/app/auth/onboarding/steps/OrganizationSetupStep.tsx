"use client";

import { useState } from 'react';
import { Card, CardContent, Button } from '@ghxstship/ui';
import { Building, Users, ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { anton } from '../../../_components/lib/typography';
import { createBrowserClient } from '@supabase/ssr';


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

        // Get or create user profile in public.users table
        let publicUserId = user.id;
        
        // Check if user exists in public.users
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single();

        if (existingUser) {
          publicUserId = existingUser.id;
        } else {
          // Create user profile if it doesn't exist
          const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
              auth_id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            })
            .select('id')
            .single();

          if (userError) throw userError;
          publicUserId = newUser.id;
        }

        // Create organization (without created_by since column may not exist yet)
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: orgName.trim(),
            slug: orgSlug
          })
          .select()
          .single();

        if (orgError) throw orgError;

        // Try to update with created_by if column exists (will fail silently if not)
        try {
          await supabase
            .from('organizations')
            .update({ created_by: publicUserId })
            .eq('id', org.id);
        } catch (err) {
          // Ignore error if created_by column doesn't exist
          console.warn('Could not set created_by on organization:', err);
        }

        // Create membership for the user as owner
        const { error: membershipError } = await supabase
          .from('memberships')
          .insert({
            user_id: publicUserId,
            organization_id: org.id,
            role: 'owner',
            status: 'active'
          });

        if (membershipError) throw membershipError;

        updateData({
          setupType,
          orgName,
          orgSlug,
          organizationId: org.id,
          userRole: 'owner'
        });

      } else if (setupType === 'join') {
        if (!inviteCode.trim()) {
          throw new Error('Invite code is required');
        }

        // Get or create user profile in public.users table
        let publicUserId = user.id;
        
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single();

        if (existingUser) {
          publicUserId = existingUser.id;
        } else {
          const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
              auth_id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            })
            .select('id')
            .single();

          if (userError) throw userError;
          publicUserId = newUser.id;
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
            user_id: publicUserId,
            organization_id: org.id,
            role: 'team_member',
            status: 'active'
          });

        if (membershipError) throw membershipError;

        updateData({
          setupType,
          inviteCode,
          organizationId: org.id,
          orgName: org.name,
          userRole: 'team_member'
        });
      }

      onNext();
    } catch (err: any) {
      setError(err?.message || "An error occurred" || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brand-ghostship stack-xl">
      <div className="brand-ghostship text-center mb-xl">
        <h1 className={`${anton.className} uppercase text-heading-2 mb-md`}>
          ORGANIZATION SETUP
        </h1>
        <p className="text-body color-muted max-w-2xl mx-auto">
          Create a new organization or join an existing one to collaborate with your team.
        </p>
      </div>

      {!setupType ? (
        <div className="brand-ghostship grid md:grid-cols-2 gap-lg">
          {/* Create Organization */}
          <Card 
            className="cursor-pointer hover:shadow-floating transition-all duration-200 hover:scale-105"
            onClick={() => setSetupType('create')}
          >
            <CardContent className="p-xl text-center">
              <Building className="h-icon-2xl w-icon-2xl color-accent mx-auto mb-md" />
              <h3 className={`${anton.className} uppercase text-heading-4 mb-sm`}>
                CREATE ORGANIZATION
              </h3>
              <p className="color-muted mb-lg">
                Start fresh with a new organization. You&apos;ll be the owner and can invite team members.
              </p>
              <Button className="w-full">
                <Plus className="mr-sm h-icon-xs w-icon-xs" />
                Create New Organization
              </Button>
            </CardContent>
          </Card>

          {/* Join Organization */}
          <Card 
            className="cursor-pointer hover:shadow-floating transition-all duration-200 hover:scale-105"
            onClick={() => setSetupType('join')}
          >
            <CardContent className="p-xl text-center">
              <Users className="h-icon-2xl w-icon-2xl color-accent mx-auto mb-md" />
              <h3 className={`${anton.className} uppercase text-heading-4 mb-sm`}>
                JOIN ORGANIZATION
              </h3>
              <p className="color-muted mb-lg">
                Join an existing organization using an invite code from your team.
              </p>
              <Button variant="outline" className="w-full">
                <Users className="mr-sm h-icon-xs w-icon-xs" />
                Join Existing Organization
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="shadow-modal">
          <CardContent className="p-xl">
            {setupType === 'create' ? (
              <div className="brand-ghostship stack-lg">
                <div className="brand-ghostship text-center mb-lg">
                  <Building className="h-icon-2xl w-icon-2xl color-accent mx-auto mb-md" />
                  <h2 className={`${anton.className} uppercase text-heading-3 mb-sm`}>
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOrgNameChange(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-body-sm form-label color-foreground mb-sm">
                    Organization URL
                  </label>
                  <div className="brand-ghostship flex">
                    <span className="inline-flex items-center  px-md rounded-l-lg border border-r-0 border-border bg-secondary color-muted text-body-sm">
                      atlvs.app/
                    </span>
                    <input
                      type="text"
                      className="flex-1 px-md py-sm border border-border rounded-r-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                      placeholder="organization-slug"
                      value={orgSlug}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrgSlug(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-body-sm color-muted mt-xs">
                    This will be your organization&apos;s unique URL
                  </p>
                </div>
              </div>
            ) : (
              <div className="brand-ghostship stack-lg">
                <div className="brand-ghostship text-center mb-lg">
                  <Users className="h-icon-2xl w-icon-2xl color-accent mx-auto mb-md" />
                  <h2 className={`${anton.className} uppercase text-heading-3 mb-sm`}>
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteCode(e.target.value.toUpperCase())}
                    required
                  />
                  <p className="text-body-sm color-muted mt-xs">
                    Ask your team admin for the organization invite code
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="brand-ghostship mt-md p-sm bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-body-sm color-destructive">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="brand-ghostship flex justify-between pt-lg">
        <Button 
          variant="outline" 
          onClick={setupType ? () => setSetupType(null) : onBack}
        >
          <ArrowLeft className="mr-sm h-icon-xs w-icon-xs" />
          Back
        </Button>
        
        {setupType && (
          <Button 
            onClick={handleContinue} 
            disabled={loading || (setupType === 'create' && !orgName.trim()) || (setupType === 'join' && !inviteCode.trim())}
           
          >
            {loading ? 'Setting up...' : 'Continue'}
            <ArrowRight className="ml-sm h-icon-xs w-icon-xs" />
          </Button>
        )}
      </div>
    </div>
  );
}
