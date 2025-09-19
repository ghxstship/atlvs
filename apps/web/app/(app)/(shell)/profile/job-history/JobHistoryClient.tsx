'use client';


import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Badge, Button, Drawer, UnifiedInput, Textarea, Select } from '@ghxstship/ui';
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin,
  Building,
  Clock
} from 'lucide-react';

const jobHistorySchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  job_title: z.string().min(1, 'Job title is required'),
  department: z.string().optional(),
  employment_type: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'intern']),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  is_current: z.boolean().default(false),
  location: z.string().optional(),
  description: z.string().optional(),
  achievements: z.array(z.string()).default([]),
  skills_used: z.array(z.string()).default([])
});

type JobHistoryForm = z.infer<typeof jobHistorySchema>;

interface JobHistory {
  id: string;
  company_name: string;
  job_title: string;
  department?: string;
  employment_type: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  location?: string;
  description?: string;
  achievements: string[];
  skills_used: string[];
  created_at: string;
}

export default function JobHistoryClient({ orgId, userId }: { orgId: string; userId: string }) {
  const t = useTranslations('profile');
  const sb = createBrowserClient();
  
  const [jobHistory, setJobHistory] = useState<JobHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobHistory | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<JobHistoryForm>({
    resolver: zodResolver(jobHistorySchema),
    defaultValues: {
      company_name: '',
      job_title: '',
      department: '',
      employment_type: 'full-time',
      start_date: '',
      end_date: '',
      is_current: false,
      location: '',
      description: '',
      achievements: [],
      skills_used: []
    }
  });

  useEffect(() => {
    loadJobHistory();
  }, [orgId, userId]);

  const loadJobHistory = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await sb
        .from('job_history')
        .select('*')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setJobHistory(data || []);
    } catch (error) {
      console.error('Error loading job history:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = (job?: JobHistory) => {
    if (job) {
      setEditingJob(job);
      form.reset({
        company_name: job.company_name,
        job_title: job.job_title,
        department: job.department || '',
        employment_type: job.employment_type as any,
        start_date: job.start_date,
        end_date: job.end_date || '',
        is_current: job.is_current,
        location: job.location || '',
        description: job.description || '',
        achievements: job.achievements || [],
        skills_used: job.skills_used || []
      });
    } else {
      setEditingJob(null);
      form.reset();
    }
    setDrawerOpen(true);
  };

  const onSubmit = async (data: JobHistoryForm) => {
    setSaving(true);
    try {
      if (editingJob) {
        // Update existing job
        const { error } = await sb
          .from('job_history')
          .update({
            ...data,
            end_date: data.is_current ? null : data.end_date
          })
          .eq('id', editingJob.id);

        if (error) throw error;
      } else {
        // Create new job
        const { error } = await sb
          .from('job_history')
          .insert({
            ...data,
            user_id: userId,
            organization_id: orgId,
            end_date: data.is_current ? null : data.end_date
          });

        if (error) throw error;
      }

      // Log activity
      await sb
        .from('user_profile_activity')
        .insert({
          user_id: userId,
          organization_id: orgId,
          activity_type: 'job_history_added',
          activity_description: `${editingJob ? 'Updated' : 'Added'} job history: ${data.job_title} at ${data.company_name}`,
          performed_by: userId
        });

      setDrawerOpen(false);
      loadJobHistory();
    } catch (error) {
      console.error('Error saving job history:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job history entry?')) return;

    try {
      const { error } = await sb
        .from('job_history')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      loadJobHistory();
    } catch (error) {
      console.error('Error deleting job history:', error);
    }
  };

  const formatEmploymentType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const calculateDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth());
    
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
    
    return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="stack-md">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-secondary rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stack-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-heading-4 text-heading-4">Job History</h2>
        <Button onClick={() => openDrawer()} className="flex items-center gap-sm">
          <Plus className="h-4 w-4" />
          Add Job
        </Button>
      </div>

      {/* Job History List */}
      <div className="stack-md">
        {jobHistory.length > 0 ? (
          jobHistory.map((job: any) => (
            <Card key={job.id}>
              <div className="p-lg">
                <div className="flex items-start justify-between mb-md">
                  <div className="flex items-start gap-md">
                    <div className="p-sm bg-primary/10 rounded-lg">
                      <Briefcase className="h-6 w-6 color-primary" />
                    </div>
                    
                    <div>
                      <h3 className="text-body text-heading-4">{job.job_title}</h3>
                      <div className="flex items-center gap-sm color-muted mb-sm">
                        <Building className="h-4 w-4" />
                        <span>{job.company_name}</span>
                        {job.department && <span>• {job.department}</span>}
                      </div>
                      
                      <div className="flex items-center gap-md text-body-sm color-muted mb-sm">
                        <div className="flex items-center gap-xs">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(job.start_date).toLocaleDateString()} - {' '}
                            {job.is_current ? 'Present' : 
                             job.end_date ? new Date(job.end_date).toLocaleDateString() : 'Present'
                            }
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-xs">
                          <Clock className="h-4 w-4" />
                          <span>{calculateDuration(job.start_date, job.end_date)}</span>
                        </div>
                      </div>
                      
                      {job.location && (
                        <div className="flex items-center gap-xs text-body-sm color-muted mb-sm">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-sm mb-sm">
                        <Badge variant="secondary">
                          {formatEmploymentType(job.employment_type)}
                        </Badge>
                        {job.is_current && (
                          <Badge variant="success">Current</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-sm">
                    <Button
                      variant="outline"
                     
                      onClick={() => openDrawer(job)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                     
                      onClick={() => deleteJob(job.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {job.description && (
                  <div className="mb-md">
                    <h4 className="form-label mb-sm">Description</h4>
                    <p className="text-body-sm color-muted">{job.description}</p>
                  </div>
                )}
                
                {job.achievements && job.achievements.length > 0 && (
                  <div className="mb-md">
                    <h4 className="form-label mb-sm">Key Achievements</h4>
                    <ul className="list-disc list-inside text-body-sm color-muted stack-xs">
                      {job.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {job.skills_used && job.skills_used.length > 0 && (
                  <div>
                    <h4 className="form-label mb-sm">Skills Used</h4>
                    <div className="flex flex-wrap gap-sm">
                      {job.skills_used.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="p-xl text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-md color-muted opacity-50" />
              <h3 className="text-body form-label mb-sm">No Job History</h3>
              <p className="color-muted mb-md">
                Add your work experience to showcase your professional background.
              </p>
              <Button onClick={() => openDrawer()}>
                <Plus className="h-4 w-4 mr-sm" />
                Add Your First Job
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Add/Edit Job Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingJob ? 'Edit Job History' : 'Add Job History'}
        description="Add details about your work experience"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="stack-lg">
          <div className="grid grid-cols-1 gap-md">
            <UnifiedInput               label="Company Name"
              placeholder="Enter company name"
              {...form.register('company_name')}
             
              required
            />

            <UnifiedInput               label="Job Title"
              placeholder="Enter job title"
              {...form.register('job_title')}
             
              required
            />

            <div className="grid grid-cols-2 gap-md">
              <UnifiedInput                 label="Department"
                placeholder="Enter department (optional)"
                {...form.register('department')}
               
              />

              <Select
                {...form.register('employment_type')}
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="intern">Intern</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <UnifiedInput                 label="Start Date"
                type="date"
                {...form.register('start_date')}
               
                required
              />

              <UnifiedInput                 label="End Date"
                type="date"
                {...form.register('end_date')}
               
                disabled={form.watch('is_current')}
              />
            </div>

            <div className="flex items-center gap-sm">
              <input
                type="checkbox"
                id="is_current"
                {...form.register('is_current')}
                className="rounded border-border"
              />
              <label htmlFor="is_current" className="text-body-sm form-label">
                This is my current job
              </label>
            </div>

            <UnifiedInput               label="Location"
              placeholder="Enter location (optional)"
              {...form.register('location')}
             
            />

            <Textarea
              label="Description"
              placeholder="Describe your role and responsibilities (optional)"
              {...form.register('description')}
             
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-sm pt-md border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDrawerOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingJob ? 'Update Job' : 'Add Job'}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
