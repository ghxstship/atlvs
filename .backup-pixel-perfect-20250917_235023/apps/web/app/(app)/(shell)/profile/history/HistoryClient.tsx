'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Badge, Button, Input, Textarea, Select, Drawer } from '@ghxstship/ui';
import { 
  History, 
  Edit, 
  Save, 
  Plus,
  Calendar,
  MapPin,
  Building,
  Trash2,
  Clock
} from 'lucide-react';

const historyEntrySchema = z.object({
  entry_type: z.enum(['employment', 'education', 'project', 'achievement', 'certification', 'other']),
  title: z.string().min(1, 'Title is required'),
  organization: z.string().optional(),
  location: z.string().optional(),
  start_date: z.string(),
  end_date: z.string().optional(),
  is_current: z.boolean().default(false),
  description: z.string().optional(),
  skills_gained: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  references: z.string().optional()
});

type HistoryEntryForm = z.infer<typeof historyEntrySchema>;

interface HistoryEntry {
  id: string;
  entry_type: string;
  title: string;
  organization?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  skills_gained: string[];
  achievements: string[];
  references?: string;
  created_at: string;
}

export default function HistoryClient({ orgId, userId }: { orgId: string; userId: string }) {
  const t = useTranslations('profile');
  const sb = createBrowserClient();
  
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HistoryEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [skillInput, setSkillInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');

  const form = useForm<HistoryEntryForm>({
    resolver: zodResolver(historyEntrySchema),
    defaultValues: {
      entry_type: 'employment',
      title: '',
      organization: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      skills_gained: [],
      achievements: [],
      references: ''
    }
  });

  useEffect(() => {
    loadHistoryEntries();
  }, [orgId, userId]);

  const loadHistoryEntries = async () => {
    try {
      setLoading(true);
      
      // Mock history data
      const mockEntries: HistoryEntry[] = [
        {
          id: '1',
          entry_type: 'employment',
          title: 'Senior Maritime Officer',
          organization: 'Black Pearl Shipping Co.',
          location: 'Caribbean Waters',
          start_date: '2022-01-15',
          end_date: '2024-01-15',
          is_current: false,
          description: 'Led maritime operations and crew management for flagship vessel operations.',
          skills_gained: ['Leadership', 'Navigation', 'Crew Management', 'Safety Protocols'],
          achievements: ['Reduced operational costs by 15%', 'Zero safety incidents over 2 years'],
          references: 'Captain Jack Sparrow - jack@blackpearl.sea',
          created_at: '2022-01-15T10:00:00Z'
        },
        {
          id: '2',
          entry_type: 'education',
          title: 'Maritime Academy Certification',
          organization: 'Royal Naval Academy',
          location: 'Portsmouth, England',
          start_date: '2020-09-01',
          end_date: '2021-06-30',
          is_current: false,
          description: 'Advanced maritime operations and navigation certification program.',
          skills_gained: ['Advanced Navigation', 'Maritime Law', 'Weather Analysis'],
          achievements: ['Graduated Summa Cum Laude', 'Outstanding Navigation Award'],
          created_at: '2020-09-01T08:00:00Z'
        },
        {
          id: '3',
          entry_type: 'project',
          title: 'Treasure Fleet Expedition',
          organization: 'GHXSTSHIP Maritime',
          location: 'Various Caribbean Ports',
          start_date: '2023-03-01',
          end_date: '2023-11-30',
          is_current: false,
          description: 'Coordinated multi-vessel expedition for historical artifact recovery.',
          skills_gained: ['Project Management', 'Logistics Coordination', 'Team Leadership'],
          achievements: ['Successfully recovered 12 historical artifacts', 'Managed team of 50+ crew members'],
          created_at: '2023-03-01T12:00:00Z'
        }
      ];
      
      setHistoryEntries(mockEntries);
    } catch (error) {
      console.error('Error loading history entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: HistoryEntryForm) => {
    setSaving(true);
    try {
      if (editingEntry) {
        // Update existing entry
        const updatedEntries = historyEntries.map(entry =>
          entry.id === editingEntry.id
            ? { ...entry, ...data }
            : entry
        );
        setHistoryEntries(updatedEntries);
      } else {
        // Create new entry
        const newEntry: HistoryEntry = {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString()
        };
        setHistoryEntries([newEntry, ...historyEntries]);
      }

      // Log activity
      await sb
        .from('user_profile_activity')
        .insert({
          user_id: userId,
          organization_id: orgId,
          activity_type: editingEntry ? 'history_entry_updated' : 'history_entry_added',
          activity_description: editingEntry 
            ? `Updated history entry: ${data.title}`
            : `Added new history entry: ${data.title}`,
          performed_by: userId
        });

      setDrawerOpen(false);
      setEditingEntry(null);
      form.reset();
    } catch (error) {
      console.error('Error saving history entry:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry: HistoryEntry) => {
    setEditingEntry(entry);
    form.reset({
      entry_type: entry.entry_type as any,
      title: entry.title,
      organization: entry.organization || '',
      location: entry.location || '',
      start_date: entry.start_date,
      end_date: entry.end_date || '',
      is_current: entry.is_current,
      description: entry.description || '',
      skills_gained: entry.skills_gained,
      achievements: entry.achievements,
      references: entry.references || ''
    });
    setDrawerOpen(true);
  };

  const handleDelete = async (entryId: string) => {
    if (confirm('Are you sure you want to delete this history entry?')) {
      const entry = historyEntries.find(e => e.id === entryId);
      setHistoryEntries(historyEntries.filter(e => e.id !== entryId));
      
      // Log activity
      if (entry) {
        await sb
          .from('user_profile_activity')
          .insert({
            user_id: userId,
            organization_id: orgId,
            activity_type: 'history_entry_deleted',
            activity_description: `Deleted history entry: ${entry.title}`,
            performed_by: userId
          });
      }
    }
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = form.getValues('skills_gained');
      if (!currentSkills.includes(skillInput.trim())) {
        form.setValue('skills_gained', [...currentSkills, skillInput.trim()]);
        setSkillInput('');
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues('skills_gained');
    form.setValue('skills_gained', currentSkills.filter(skill => skill !== skillToRemove));
  };

  const addAchievement = () => {
    if (achievementInput.trim()) {
      const currentAchievements = form.getValues('achievements');
      if (!currentAchievements.includes(achievementInput.trim())) {
        form.setValue('achievements', [...currentAchievements, achievementInput.trim()]);
        setAchievementInput('');
      }
    }
  };

  const removeAchievement = (achievementToRemove: string) => {
    const currentAchievements = form.getValues('achievements');
    form.setValue('achievements', currentAchievements.filter(achievement => achievement !== achievementToRemove));
  };

  const getEntryTypeIcon = (type: string) => {
    const icons = {
      employment: Building,
      education: History,
      project: MapPin,
      achievement: Calendar,
      certification: Clock,
      other: History
    };
    return icons[type as keyof typeof icons] || History;
  };

  const getEntryTypeColor = (type: string) => {
    const colors = {
      employment: 'blue',
      education: 'green',
      project: 'purple',
      achievement: 'orange',
      certification: 'red',
      other: 'gray'
    };
    return colors[type as keyof typeof colors] || 'gray';
  };

  const formatEntryType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const calculateDuration = (startDate: string, endDate?: string, isCurrent?: boolean) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}${isCurrent ? ' (current)' : ''}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      let duration = `${years} year${years !== 1 ? 's' : ''}`;
      if (remainingMonths > 0) {
        duration += ` ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
      }
      return duration + (isCurrent ? ' (current)' : '');
    }
  };

  const filteredEntries = filterType === 'all' 
    ? historyEntries 
    : historyEntries.filter(entry => entry.entry_type === filterType);

  // Sort entries by start date (most recent first)
  const sortedEntries = [...filteredEntries].sort((a, b) => 
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  if (loading) {
    return (
      <div className="stack-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary rounded mb-md"></div>
          <div className="stack-md">
            <div className="h-32 bg-secondary rounded"></div>
            <div className="h-32 bg-secondary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-4 text-heading-4">Professional History</h2>
        <Button 
          onClick={() => {
            setEditingEntry(null);
            form.reset();
            setDrawerOpen(true);
          }}
          className="flex items-center gap-sm"
        >
          <Plus className="h-4 w-4" />
          Add History Entry
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-sm flex-wrap">
        {['all', 'employment', 'education', 'project', 'achievement', 'certification', 'other'].map((type) => (
          <Button
            key={type}
            variant={filterType === type ? 'primary' : 'outline'}
           
            onClick={() => setFilterType(type)}
          >
            {type === 'all' ? 'All Entries' : formatEntryType(type)}
          </Button>
        ))}
      </div>

      {sortedEntries.length === 0 ? (
        <Card>
          <div className="p-xl text-center">
            <History className="h-12 w-12 color-muted mx-auto mb-md" />
            <h3 className="text-body text-heading-4 mb-sm">No History Entries</h3>
            <p className="color-muted mb-md">
              Build your professional timeline by adding employment, education, projects, and achievements.
            </p>
            <Button 
              onClick={() => {
                setEditingEntry(null);
                form.reset();
                setDrawerOpen(true);
              }}
            >
              Add Your First Entry
            </Button>
          </div>
        </Card>
      ) : (
        <div className="stack-md">
          {sortedEntries.map((entry) => {
            const IconComponent = getEntryTypeIcon(entry.entry_type);
            
            return (
              <Card key={entry.id}>
                <div className="p-lg">
                  <div className="flex items-start justify-between mb-md">
                    <div className="flex items-center gap-sm">
                      <div className={`h-10 w-10 bg-${getEntryTypeColor(entry.entry_type)}-100 rounded-full flex items-center justify-center`}>
                        <IconComponent className={`h-5 w-5 text-${getEntryTypeColor(entry.entry_type)}-600`} />
                      </div>
                      <div>
                        <h3 className="text-heading-4">{entry.title}</h3>
                        {entry.organization && (
                          <p className="text-body-sm color-muted">{entry.organization}</p>
                        )}
                        <div className="flex items-center gap-sm mt-xs">
                          <Badge variant="outline">
                            {formatEntryType(entry.entry_type)}
                          </Badge>
                          {entry.is_current && (
                            <Badge variant="success">Current</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-sm">
                      <Button
                        variant="outline"
                       
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                       
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mb-md">
                    <div className="flex items-center gap-md text-body-sm color-muted mb-sm">
                      <div className="flex items-center gap-xs">
                        <Calendar className="h-4 w-4" />
                        {new Date(entry.start_date).toLocaleDateString()} - {
                          entry.is_current ? 'Present' : 
                          entry.end_date ? new Date(entry.end_date).toLocaleDateString() : 'Present'
                        }
                      </div>
                      <span>•</span>
                      <span>{calculateDuration(entry.start_date, entry.end_date, entry.is_current)}</span>
                      {entry.location && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-xs">
                            <MapPin className="h-4 w-4" />
                            {entry.location}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {entry.description && (
                    <div className="mb-md">
                      <p className="text-body-sm color-muted">{entry.description}</p>
                    </div>
                  )}

                  {entry.skills_gained.length > 0 && (
                    <div className="mb-md">
                      <h4 className="text-body-sm form-label mb-sm">Skills Gained</h4>
                      <div className="flex flex-wrap gap-sm">
                        {entry.skills_gained.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.achievements.length > 0 && (
                    <div className="mb-md">
                      <h4 className="text-body-sm form-label mb-sm">Key Achievements</h4>
                      <ul className="list-disc list-inside stack-xs">
                        {entry.achievements.map((achievement, index) => (
                          <li key={index} className="text-body-sm color-muted">
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingEntry ? 'Edit History Entry' : 'Add New History Entry'}
        description={editingEntry ? 'Update history entry details' : 'Add a new entry to your professional history'}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="stack-md">
          <Select
            {...form.register('entry_type')}
          >
            <option value="employment">Employment</option>
            <option value="education">Education</option>
            <option value="project">Project</option>
            <option value="achievement">Achievement</option>
            <option value="certification">Certification</option>
            <option value="other">Other</option>
          </Select>

          <Input
            label="Title"
            placeholder="Position title, degree, project name, etc."
            {...form.register('title')}
           
          />

          <div className="grid grid-cols-2 gap-md">
            <Input
              label="Organization"
              placeholder="Company, school, or organization"
              {...form.register('organization')}
             
            />

            <Input
              label="Location"
              placeholder="City, state, country"
              {...form.register('location')}
             
            />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <Input
              label="Start Date"
              type="date"
              {...form.register('start_date')}
             
            />

            <Input
              label="End Date"
              type="date"
              {...form.register('end_date')}
             
              disabled={form.watch('is_current')}
            />
          </div>

          <div className="flex items-center cluster-sm">
            <input
              type="checkbox"
              id="is_current"
              {...form.register('is_current')}
              className="rounded border-border"
            />
            <label htmlFor="is_current" className="text-body-sm form-label">
              This is my current position/activity
            </label>
          </div>

          <Textarea
            label="Description"
            placeholder="Describe your role, responsibilities, or what you learned"
            {...form.register('description')}
           
            rows={3}
          />

          <div>
            <label className="block text-body-sm form-label mb-sm">Skills Gained</label>
            <div className="flex gap-sm mb-sm">
              <Input
                placeholder="Add a skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-sm">
              {form.watch('skills_gained').map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-xs"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-xs color-destructive hover:color-destructive/80"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-body-sm form-label mb-sm">Key Achievements</label>
            <div className="flex gap-sm mb-sm">
              <Input
                placeholder="Add an achievement"
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
              />
              <Button type="button" onClick={addAchievement}>Add</Button>
            </div>
            <div className="stack-sm">
              {form.watch('achievements').map((achievement, index) => (
                <div key={index} className="flex items-center justify-between p-sm bg-secondary rounded">
                  <span className="text-body-sm">{achievement}</span>
                  <button
                    type="button"
                    onClick={() => removeAchievement(achievement)}
                    className="color-destructive hover:color-destructive/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Textarea
            label="References"
            placeholder="Contact information for references (optional)"
            {...form.register('references')}
           
            rows={2}
          />

          <div className="flex justify-end gap-sm pt-md">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              <Save className="h-4 w-4 mr-sm" />
              {editingEntry ? 'Update' : 'Save'} Entry
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
