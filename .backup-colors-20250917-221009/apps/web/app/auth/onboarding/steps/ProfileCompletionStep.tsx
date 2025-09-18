"use client";

import { useState } from 'react';
import { Card, CardContent, Button, Avatar } from '@ghxstship/ui';
import { User, Briefcase, MapPin, ArrowRight, ArrowLeft, Camera } from 'lucide-react';
import { Anton } from 'next/font/google';
import { createBrowserClient } from '@supabase/ssr';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

interface ProfileCompletionStepProps {
  user: any;
  onNext: () => void;
  onBack: () => void;
  updateData: (data: any) => void;
  data: any;
}

const industries = [
  'Film & Television',
  'Advertising & Marketing',
  'Music & Entertainment',
  'Corporate Communications',
  'Education',
  'Non-profit',
  'Technology',
  'Healthcare',
  'Other'
];

const teamSizes = [
  '1-5 people',
  '6-20 people',
  '21-50 people',
  '51-200 people',
  '200+ people'
];

const roles = [
  'Creative Director',
  'Producer',
  'Project Manager',
  'Designer',
  'Editor',
  'Developer',
  'Marketing Manager',
  'Executive',
  'Other'
];

export function ProfileCompletionStep({ user, onNext, onBack, updateData, data }: ProfileCompletionStepProps) {
  const [profile, setProfile] = useState({
    jobTitle: data.profile?.jobTitle || '',
    industry: data.profile?.industry || '',
    teamSize: data.profile?.teamSize || '',
    role: data.profile?.role || '',
    location: data.profile?.location || '',
    bio: data.profile?.bio || '',
    avatar: data.profile?.avatar || null,
    ...data.profile
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleInputChange = (field: string, value: string) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      setProfile((prev: any) => ({ ...prev, avatar: publicUrl }));
    } catch (err: any) {
      setError('Failed to upload avatar');
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    setError('');

    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          job_title: profile.jobTitle,
          industry: profile.industry,
          team_size: profile.teamSize,
          role: profile.role,
          location: profile.location,
          bio: profile.bio,
          avatar_url: profile.avatar,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // Update auth user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          job_title: profile.jobTitle,
          industry: profile.industry,
          avatar_url: profile.avatar,
        }
      });

      if (metadataError) throw metadataError;

      updateData({ profile });
      onNext();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack-xl">
      <div className="text-center">
        <h1 className={`${anton.className} uppercase text-heading-2 text-heading-3 mb-md`}>
          COMPLETE YOUR PROFILE
        </h1>
        <p className="text-body color-muted max-w-2xl mx-auto">
          Help your team get to know you better and personalize your GHXSTSHIP experience.
        </p>
      </div>

      <Card className="shadow-xl">
        <CardContent className="p-xl">
          <div className="stack-lg">
            {/* Avatar Upload */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                  {profile.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 color-muted" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-primary color-primary-foreground rounded-full p-sm cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-body-sm color-muted mt-sm">
                Upload a profile photo
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-lg">
              {/* Job Title */}
              <div>
                <label className="block text-body-sm form-label color-foreground mb-sm">
                  Job Title
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 color-muted" />
                  <input
                    type="text"
                    className="w-full pl-2xl pr-md py-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                    placeholder="e.g. Creative Director"
                    value={profile.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-body-sm form-label color-foreground mb-sm">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 color-muted" />
                  <input
                    type="text"
                    className="w-full pl-2xl pr-md py-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                    placeholder="e.g. Los Angeles, CA"
                    value={profile.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-body-sm form-label color-foreground mb-sm">
                  Industry
                </label>
                <select
                  className="w-full px-md py-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  value={profile.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                >
                  <option value="">Select industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role */}
              <div>
                <label className="block text-body-sm form-label color-foreground mb-sm">
                  Primary Role
                </label>
                <select
                  className="w-full px-md py-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  value={profile.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                >
                  <option value="">Select role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Team Size */}
              <div className="md:col-span-2">
                <label className="block text-body-sm form-label color-foreground mb-sm">
                  Team Size
                </label>
                <select
                  className="w-full px-md py-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  value={profile.teamSize}
                  onChange={(e) => handleInputChange('teamSize', e.target.value)}
                >
                  <option value="">Select team size</option>
                  {teamSizes.map(size => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="block text-body-sm form-label color-foreground mb-sm">
                  Bio (Optional)
                </label>
                <textarea
                  className="w-full px-md py-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  placeholder="Tell us a bit about yourself and what you do..."
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                />
                <p className="text-body-sm color-muted mt-xs">
                  This will be visible to your team members
                </p>
              </div>
            </div>

            {error && (
              <div className="p-sm bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-body-sm color-destructive">{error}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card>
        <CardContent className="p-lg">
          <div className="flex items-start cluster-sm">
            <div className="w-5 h-5 bg-info/10 rounded-full flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 bg-info rounded-full"></div>
            </div>
            <div>
              <h4 className="text-heading-4 color-foreground mb-xs">Privacy & Visibility</h4>
              <p className="text-body-sm color-muted">
                Your profile information will be visible to members of your organization. 
                You can update these details anytime in your account settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-lg">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-sm h-4 w-4" />
          Back
        </Button>
        
        <Button 
          onClick={handleContinue} 
          disabled={loading}
         
        >
          {loading ? 'Saving profile...' : 'Complete Setup'}
          <ArrowRight className="ml-sm h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
