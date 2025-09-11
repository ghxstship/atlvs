'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Badge, Button, Input, Textarea, Select } from '@ghxstship/ui';
import { 
  Briefcase, 
  Edit, 
  Save, 
  Award, 
  Target,
  Users,
  TrendingUp,
  Calendar
} from 'lucide-react';

const professionalSchema = z.object({
  job_title: z.string().optional(),
  department: z.string().optional(),
  employee_id: z.string().optional(),
  hire_date: z.string().optional(),
  employment_type: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'intern']).optional(),
  manager_id: z.string().optional(),
  skills: z.array(z.string()).default([]),
  bio: z.string().optional(),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  website_url: z.string().url().optional().or(z.literal('')),
  salary_range: z.string().optional(),
  performance_rating: z.enum(['exceeds', 'meets', 'below', 'not-rated']).optional(),
  career_goals: z.string().optional(),
  mentorship_interests: z.array(z.string()).default([])
});

type ProfessionalForm = z.infer<typeof professionalSchema>;

interface ProfessionalProfile {
  id: string;
  job_title?: string;
  department?: string;
  employee_id?: string;
  hire_date?: string;
  employment_type?: string;
  manager_id?: string;
  skills: string[];
  bio?: string;
  linkedin_url?: string;
  website_url?: string;
  salary_range?: string;
  performance_rating?: string;
  career_goals?: string;
  mentorship_interests: string[];
  updated_at: string;
}

export default function ProfessionalClient({ orgId, userId }: { orgId: string; userId: string }) {
  const t = useTranslations('profile');
  const sb = createBrowserClient();
  
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [mentorshipInput, setMentorshipInput] = useState('');

  const form = useForm<ProfessionalForm>({
    resolver: zodResolver(professionalSchema),
    defaultValues: {
      job_title: '',
      department: '',
      employee_id: '',
      hire_date: '',
      employment_type: 'full-time',
      manager_id: '',
      skills: [],
      bio: '',
      linkedin_url: '',
      website_url: '',
      salary_range: '',
      performance_rating: 'not-rated',
      career_goals: '',
      mentorship_interests: []
    }
  });

  useEffect(() => {
    loadProfessionalProfile();
  }, [orgId, userId]);

  const loadProfessionalProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await sb
        .from('user_profiles')
        .select('*')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        form.reset({
          job_title: data.job_title || '',
          department: data.department || '',
          employee_id: data.employee_id || '',
          hire_date: data.hire_date || '',
          employment_type: data.employment_type || 'full-time',
          manager_id: data.manager_id || '',
          skills: data.skills || [],
          bio: data.bio || '',
          linkedin_url: data.linkedin_url || '',
          website_url: data.website_url || '',
          salary_range: data.salary_range || '',
          performance_rating: data.performance_rating || 'not-rated',
          career_goals: data.career_goals || '',
          mentorship_interests: data.mentorship_interests || []
        });
      }
    } catch (error) {
      console.error('Error loading professional profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfessionalForm) => {
    setSaving(true);
    try {
      const { error } = await sb
        .from('user_profiles')
        .upsert({
          user_id: userId,
          organization_id: orgId,
          ...data,
          linkedin_url: data.linkedin_url || null,
          website_url: data.website_url || null
        });

      if (error) throw error;

      // Log activity
      await sb
        .from('user_profile_activity')
        .insert({
          user_id: userId,
          organization_id: orgId,
          activity_type: 'profile_updated',
          activity_description: 'Updated professional information',
          performed_by: userId
        });

      setEditing(false);
      loadProfessionalProfile();
    } catch (error) {
      console.error('Error saving professional profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = form.getValues('skills');
      if (!currentSkills.includes(skillInput.trim())) {
        form.setValue('skills', [...currentSkills, skillInput.trim()]);
        setSkillInput('');
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues('skills');
    form.setValue('skills', currentSkills.filter(skill => skill !== skillToRemove));
  };

  const addMentorshipInterest = () => {
    if (mentorshipInput.trim()) {
      const currentInterests = form.getValues('mentorship_interests');
      if (!currentInterests.includes(mentorshipInput.trim())) {
        form.setValue('mentorship_interests', [...currentInterests, mentorshipInput.trim()]);
        setMentorshipInput('');
      }
    }
  };

  const removeMentorshipInterest = (interestToRemove: string) => {
    const currentInterests = form.getValues('mentorship_interests');
    form.setValue('mentorship_interests', currentInterests.filter(interest => interest !== interestToRemove));
  };

  const formatEmploymentType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getPerformanceRatingColor = (rating: string) => {
    const colors = {
      exceeds: 'success',
      meets: 'secondary',
      below: 'warning',
      'not-rated': 'outline'
    };
    return colors[rating as keyof typeof colors] || 'outline';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Professional Information</h2>
        {!editing ? (
          <Button onClick={() => setEditing(true)} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditing(false);
                form.reset();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              loading={saving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Employment Information */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Employment Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Job Title"
                placeholder="Enter your job title"
                {...form.register('job_title')}
               
                disabled={!editing}
              />

              <Input
                label="Department"
                placeholder="Enter your department"
                {...form.register('department')}
               
                disabled={!editing}
              />

              <Input
                label="Employee ID"
                placeholder="Enter employee ID"
                {...form.register('employee_id')}
               
                disabled={!editing}
              />

              <Input
                label="Hire Date"
                type="date"
                {...form.register('hire_date')}
               
                disabled={!editing}
              />

              <Select
                {...form.register('employment_type')}
                disabled={!editing}
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="intern">Intern</option>
              </Select>

              <Select
                {...form.register('performance_rating')}
                disabled={!editing}
              >
                <option value="not-rated">Not Rated</option>
                <option value="exceeds">Exceeds Expectations</option>
                <option value="meets">Meets Expectations</option>
                <option value="below">Below Expectations</option>
              </Select>
            </div>

            {!editing && profile && (
              <div className="mt-4 flex items-center gap-4">
                {profile.employment_type && (
                  <Badge variant="secondary">
                    {formatEmploymentType(profile.employment_type)}
                  </Badge>
                )}
                {profile.performance_rating && profile.performance_rating !== 'not-rated' && (
                  <Badge variant={getPerformanceRatingColor(profile.performance_rating) as any}>
                    {profile.performance_rating === 'exceeds' ? 'Exceeds Expectations' :
                     profile.performance_rating === 'meets' ? 'Meets Expectations' :
                     'Below Expectations'}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Skills */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-secondary" />
              <h3 className="text-lg font-semibold">Skills & Expertise</h3>
            </div>
            
            {editing && (
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Add a skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill}>Add</Button>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {form.watch('skills').map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {skill}
                  {editing && (
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 text-destructive hover:text-destructive/80"
                    >
                      ×
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Professional Bio */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-success" />
              <h3 className="text-lg font-semibold">Professional Bio</h3>
            </div>
            
            <Textarea
              label="Bio"
              placeholder="Write a brief professional bio"
              {...form.register('bio')}
             
              disabled={!editing}
              rows={4}
            />
          </div>
        </Card>

        {/* Career Development */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-warning" />
              <h3 className="text-lg font-semibold">Career Development</h3>
            </div>
            
            <div className="space-y-4">
              <Textarea
                label="Career Goals"
                placeholder="Describe your career goals and aspirations"
                {...form.register('career_goals')}
               
                disabled={!editing}
                rows={3}
              />
              
              <div>
                <label className="block text-sm font-medium mb-2">Mentorship Interests</label>
                {editing && (
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Add mentorship interest"
                      value={mentorshipInput}
                      onChange={(e) => setMentorshipInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMentorshipInterest())}
                    />
                    <Button type="button" onClick={addMentorshipInterest}>Add</Button>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {form.watch('mentorship_interests').map((interest, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {interest}
                      {editing && (
                        <button
                          type="button"
                          onClick={() => removeMentorshipInterest(interest)}
                          className="ml-1 text-destructive hover:text-destructive/80"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Online Presence */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Online Presence</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="LinkedIn URL"
                placeholder="https://linkedin.com/in/username"
                {...form.register('linkedin_url')}
               
                disabled={!editing}
              />

              <Input
                label="Website URL"
                placeholder="https://yourwebsite.com"
                {...form.register('website_url')}
               
                disabled={!editing}
              />
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
