'use client';


import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, UnifiedInput, Card, Avatar, Badge } from '@ghxstship/ui';
import { Camera, Save, User } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  nationality?: string;
  languages: string[];
  profile_completion_percentage: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function BasicInfoClient({ orgId, userId }: { orgId: string; userId: string }) {
  const t = useTranslations('profile');
  const sb = createBrowserClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    avatar_url: '',
    date_of_birth: '',
    gender: '',
    nationality: '',
    languages: [] as string[]
  });

  useEffect(() => {
    loadProfile();
  }, [orgId, userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Get current user's profile
      const { data: userData } = await sb
        .from('users')
        .select('id')
        .eq('auth_id', userId)
        .single();

      if (userData) {
        const { data: profileData } = await sb
          .from('user_profiles')
          .select('*')
          .eq('user_id', userData.id)
          .eq('organization_id', orgId)
          .single();

        if (profileData) {
          setProfile(profileData);
          setFormData({
            avatar_url: profileData.avatar_url || '',
            date_of_birth: profileData.date_of_birth || '',
            gender: profileData.gender || '',
            nationality: profileData.nationality || '',
            languages: profileData.languages || []
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      
      const { error } = await sb
        .from('user_profiles')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      await loadProfile(); // Reload to get updated data
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageAdd = (language: string) => {
    if (language && !formData.languages.includes(language)) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, language]
      }));
    }
  };

  const handleLanguageRemove = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  if (loading) {
    return (
      <div className="stack-lg">
        <div className="animate-pulse">
          <div className="h-component-lg w-component-lg bg-secondary rounded-full mx-auto mb-md"></div>
          <div className="stack-sm">
            <div className="h-icon-xs bg-secondary rounded w-3/4"></div>
            <div className="h-icon-xs bg-secondary rounded w-1/2"></div>
            <div className="h-icon-xs bg-secondary rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      {/* Avatar Section */}
      <div className="flex flex-col items-center stack-md">
        <div className="relative">
          <Avatar className="h-component-lg w-component-lg">
            {formData.avatar_url ? (
              <img src={formData.avatar_url} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User className="h-icon-2xl w-icon-2xl" />
            )}
          </Avatar>
          <Button
           
            variant="outline"
            className="absolute -bottom-2 -right-2 rounded-full p-sm"
          >
            <Camera className="h-3 w-3" />
          </Button>
        </div>
        
        {profile && (
          <div className="text-center">
            <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
              {profile.status}
            </Badge>
            <div className="mt-sm text-body-sm color-muted">
              Profile {profile.profile_completion_percentage}% complete
            </div>
          </div>
        )}
      </div>

      {/* Basic Information Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="stack-sm">
          <label className="text-body-sm form-label">Avatar URL</label>
          <UnifiedInput             value={formData.avatar_url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <div className="stack-sm">
          <label className="text-body-sm form-label">Date of Birth</label>
          <UnifiedInput             type="date"
            value={formData.date_of_birth}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
          />
        </div>

        <div className="stack-sm">
          <label className="text-body-sm form-label">Gender</label>
          <select
            value={formData.gender}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
            className="w-full  px-md py-sm border border-input bg-background rounded-md"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        <div className="stack-sm">
          <label className="text-body-sm form-label">Nationality</label>
          <UnifiedInput             value={formData.nationality}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
            placeholder="e.g., American, British, Canadian"
          />
        </div>
      </div>

      {/* Languages Section */}
      <div className="stack-md">
        <div>
          <label className="text-body-sm form-label">Languages</label>
          <div className="flex flex-wrap gap-sm mt-sm">
            {formData.languages.map((language: any) => (
              <Badge
                key={language}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleLanguageRemove(language)}
              >
                {language} ×
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex gap-sm">
          <UnifiedInput             placeholder="Add a language"
            onKeyPress={(e: any) => {
              if (e.key === 'Enter') {
                handleLanguageAdd(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <Button
            variant="outline"
            onClick={(e: React.MouseEvent) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              handleLanguageAdd(input.value);
              input.value = '';
            }}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-icon-xs w-icon-xs mr-sm" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
