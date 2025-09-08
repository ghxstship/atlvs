'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Card, Avatar, Badge } from '@ghxstship/ui';
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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-24 w-24 bg-muted rounded-full mx-auto mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="h-24 w-24">
            {formData.avatar_url ? (
              <img src={formData.avatar_url} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User className="h-12 w-12" />
            )}
          </Avatar>
          <Button
            size="sm"
            variant="outline"
            className="absolute -bottom-2 -right-2 rounded-full p-2"
          >
            <Camera className="h-3 w-3" />
          </Button>
        </div>
        
        {profile && (
          <div className="text-center">
            <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
              {profile.status}
            </Badge>
            <div className="mt-2 text-sm text-muted-foreground">
              Profile {profile.profile_completion_percentage}% complete
            </div>
          </div>
        )}
      </div>

      {/* Basic Information Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Avatar URL</label>
          <Input
            value={formData.avatar_url}
            onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Date of Birth</label>
          <Input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
            className="w-full px-3 py-2 border border-input bg-background rounded-md"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nationality</label>
          <Input
            value={formData.nationality}
            onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
            placeholder="e.g., American, British, Canadian"
          />
        </div>
      </div>

      {/* Languages Section */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Languages</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.languages.map((language) => (
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
        
        <div className="flex gap-2">
          <Input
            placeholder="Add a language"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleLanguageAdd(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <Button
            variant="outline"
            onClick={(e) => {
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
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
