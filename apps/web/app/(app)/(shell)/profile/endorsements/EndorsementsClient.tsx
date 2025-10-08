'use client';


import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  ThumbsUp, 
  Edit, 
  Save, 
  Plus,
  Star,
  User,
  Calendar,
  Trash2
} from 'lucide-react';import {
  Card,
  Button,
  UnifiedInput,
  Select,
  Textarea,
  Badge,
  Drawer
} from '@ghxstship/ui';
import {
  Card,
  Button,
  Select,
  Textarea,
  Badge,
  Drawer
} from '@ghxstship/ui';


const endorsementSchema = z.object({
  endorser_name: z.string().min(1, 'Endorser name is required'),
  endorser_title: z.string().optional(),
  endorser_company: z.string().optional(),
  relationship: z.enum(['colleague', 'supervisor', 'client', 'subordinate', 'other']),
  endorsement_text: z.string().min(10, 'Endorsement must be at least 10 characters'),
  skills_endorsed: z.array(z.string()).min(1, 'At least one skill must be endorsed'),
  rating: z.number().min(1).max(5),
  date_received: z.string(),
  is_public: z.boolean().default(true)
});

type EndorsementForm = z.infer<typeof endorsementSchema>;

interface Endorsement {
  id: string;
  endorser_name: string;
  endorser_title?: string;
  endorser_company?: string;
  relationship: string;
  endorsement_text: string;
  skills_endorsed: string[];
  rating: number;
  date_received: string;
  is_public: boolean;
  created_at: string;
}

export default function EndorsementsClient({ orgId, userId }: { orgId: string; userId: string }) {
  const t = useTranslations('profile');
  const sb = createBrowserClient();
  
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEndorsement, setEditingEndorsement] = useState<Endorsement | null>(null);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const form = useForm<EndorsementForm>({
    resolver: zodResolver(endorsementSchema),
    defaultValues: {
      endorser_name: '',
      endorser_title: '',
      endorser_company: '',
      relationship: 'colleague',
      endorsement_text: '',
      skills_endorsed: [],
      rating: 5,
      date_received: new Date().toISOString().split('T')[0],
      is_public: true
    }
  });

  useEffect(() => {
    loadEndorsements();
  }, [orgId, userId]);

  const loadEndorsements = async () => {
    try {
      setLoading(true);
      
      // For now, we'll use mock data since endorsements table doesn't exist
      // In a real implementation, this would query the endorsements table
      const mockEndorsements: Endorsement[] = [
        {
          id: '1',
          endorser_name: 'Captain Jack Sparrow',
          endorser_title: 'Senior Captain',
          endorser_company: 'Black Pearl Shipping',
          relationship: 'supervisor',
          endorsement_text: 'An exceptional crew member with outstanding leadership skills and dedication to maritime excellence.',
          skills_endorsed: ['Leadership', 'Navigation', 'Team Management'],
          rating: 5,
          date_received: '2024-01-15',
          is_public: true,
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          endorser_name: 'Anne Bonny',
          endorser_title: 'First Mate',
          endorser_company: 'Revenge Maritime',
          relationship: 'colleague',
          endorsement_text: 'Reliable and skilled professional with excellent problem-solving abilities.',
          skills_endorsed: ['Problem Solving', 'Communication', 'Reliability'],
          rating: 4,
          date_received: '2024-02-20',
          is_public: true,
          created_at: '2024-02-20T14:30:00Z'
        }
      ];
      
      setEndorsements(mockEndorsements);
    } catch (error) {
      console.error('Error loading endorsements:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EndorsementForm) => {
    setSaving(true);
    try {
      if (editingEndorsement) {
        // Update existing endorsement
        const updatedEndorsements = endorsements.map(endorsement =>
          endorsement.id === editingEndorsement.id
            ? { ...endorsement, ...data }
            : endorsement
        );
        setEndorsements(updatedEndorsements);
      } else {
        // Create new endorsement
        const newEndorsement: Endorsement = {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString()
        };
        setEndorsements([newEndorsement, ...endorsements]);
      }

      // Log activity
      await sb
        .from('user_profile_activity')
        .insert({
          user_id: userId,
          organization_id: orgId,
          activity_type: editingEndorsement ? 'endorsement_updated' : 'endorsement_added',
          activity_description: editingEndorsement 
            ? `Updated endorsement from ${data.endorser_name}`
            : `Added new endorsement from ${data.endorser_name}`,
          performed_by: userId
        });

      setDrawerOpen(false);
      setEditingEndorsement(null);
      form.reset();
    } catch (error) {
      console.error('Error saving endorsement:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (endorsement: Endorsement) => {
    setEditingEndorsement(endorsement);
    form.reset({
      endorser_name: endorsement.endorser_name,
      endorser_title: endorsement.endorser_title || '',
      endorser_company: endorsement.endorser_company || '',
      relationship: endorsement.relationship as any,
      endorsement_text: endorsement.endorsement_text,
      skills_endorsed: endorsement.skills_endorsed,
      rating: endorsement.rating,
      date_received: endorsement.date_received,
      is_public: endorsement.is_public
    });
    setDrawerOpen(true);
  };

  const handleDelete = async (endorsementId: string) => {
    if (confirm('Are you sure you want to delete this endorsement?')) {
      const endorsement = endorsements.find(e => e.id === endorsementId);
      setEndorsements(endorsements.filter(e => e.id !== endorsementId));
      
      // Log activity
      if (endorsement) {
        await sb
          .from('user_profile_activity')
          .insert({
            user_id: userId,
            organization_id: orgId,
            activity_type: 'endorsement_deleted',
            activity_description: `Deleted endorsement from ${endorsement.endorser_name}`,
            performed_by: userId
          });
      }
    }
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = form.getValues('skills_endorsed');
      if (!currentSkills.includes(skillInput.trim())) {
        form.setValue('skills_endorsed', [...currentSkills, skillInput.trim()]);
        setSkillInput('');
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues('skills_endorsed');
    form.setValue('skills_endorsed', currentSkills.filter(skill => skill !== skillToRemove));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-icon-xs w-icon-xs ${i < rating ? 'color-warning fill-current' : 'color-muted'}`}
      />
    ));
  };

  const formatRelationship = (relationship: string) => {
    return relationship.charAt(0).toUpperCase() + relationship.slice(1);
  };

  if (loading) {
    return (
      <div className="stack-lg">
        <div className="animate-pulse">
          <div className="h-icon-lg bg-secondary rounded mb-md"></div>
          <div className="stack-md">
            <div className="h-component-xl bg-secondary rounded"></div>
            <div className="h-component-xl bg-secondary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-4 text-heading-4">Endorsements</h2>
        <Button 
          onClick={() => {
            setEditingEndorsement(null);
            form.reset();
            setDrawerOpen(true);
          }}
          className="flex items-center gap-sm"
        >
          <Plus className="h-icon-xs w-icon-xs" />
          Add Endorsement
        </Button>
      </div>

      {endorsements.length === 0 ? (
        <Card>
          <div className="p-xl text-center">
            <ThumbsUp className="h-icon-2xl w-icon-2xl color-muted mx-auto mb-md" />
            <h3 className="text-body text-heading-4 mb-sm">No Endorsements Yet</h3>
            <p className="color-muted mb-md">
              Start building your professional reputation by adding endorsements from colleagues and clients.
            </p>
            <Button 
              onClick={() => {
                setEditingEndorsement(null);
                form.reset();
                setDrawerOpen(true);
              }}
            >
              Add Your First Endorsement
            </Button>
          </div>
        </Card>
      ) : (
        <div className="stack-md">
          {endorsements.map((endorsement: any) => (
            <Card key={endorsement.id}>
              <div className="p-lg">
                <div className="flex items-start justify-between mb-md">
                  <div className="flex items-center gap-sm">
                    <div className="h-icon-xl w-icon-xl bg-accent/10 rounded-full flex items-center justify-center">
                      <User className="h-icon-sm w-icon-sm color-accent" />
                    </div>
                    <div>
                      <h3 className="text-body text-heading-4">{endorsement.endorser_name}</h3>
                      {endorsement.endorser_title && (
                        <p className="text-body-sm color-muted">
                          {endorsement.endorser_title}
                          {endorsement.endorser_company && ` at ${endorsement.endorser_company}`}
                        </p>
                      )}
                      <div className="flex items-center gap-sm mt-xs">
                        <Badge variant="outline">
                          {formatRelationship(endorsement.relationship)}
                        </Badge>
                        <div className="flex items-center gap-xs">
                          {renderStars(endorsement.rating)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm">
                    <Button
                      variant="outline"
                     
                      onClick={() => handleEdit(endorsement)}
                    >
                      <Edit className="h-icon-xs w-icon-xs" />
                    </Button>
                    <Button
                      variant="outline"
                     
                      onClick={() => handleDelete(endorsement.id)}
                    >
                      <Trash2 className="h-icon-xs w-icon-xs" />
                    </Button>
                  </div>
                </div>

                <blockquote className="color-muted italic mb-md border-l-4 border-primary/20 pl-md">
                  "{endorsement.endorsement_text}"
                </blockquote>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-sm">
                    {endorsement.skills_endorsed.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-sm text-body-sm color-muted">
                    <Calendar className="h-icon-xs w-icon-xs" />
                    {new Date(endorsement.date_received).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingEndorsement ? 'Edit Endorsement' : 'Add New Endorsement'}
        description={editingEndorsement ? 'Update endorsement details' : 'Add a new professional endorsement'}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="stack-md">
          <UnifiedInput             label="Endorser Name"
            placeholder="Enter endorser's full name"
            {...form.register('endorser_name')}
           
          />

          <div className="grid grid-cols-2 gap-md">
            <UnifiedInput               label="Title"
              placeholder="Job title"
              {...form.register('endorser_title')}
             
            />

            <UnifiedInput               label="Company"
              placeholder="Company name"
              {...form.register('endorser_company')}
             
            />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <Select
              {...form.register('relationship')}
            >
              <option value="colleague">Colleague</option>
              <option value="supervisor">Supervisor</option>
              <option value="client">Client</option>
              <option value="subordinate">Subordinate</option>
              <option value="other">Other</option>
            </Select>

            <UnifiedInput               label="Date Received"
              type="date"
              {...form.register('date_received')}
             
            />
          </div>

          <Textarea
            label="Endorsement Text"
            placeholder="Enter the endorsement text"
            {...form.register('endorsement_text')}
           
            rows={4}
          />

          <div>
            <label className="block text-body-sm form-label mb-sm">Skills Endorsed</label>
            <div className="flex gap-sm mb-sm">
              <UnifiedInput                 placeholder="Add a skill"
                value={skillInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkillInput(e.target.value)}
                onKeyPress={(e: any) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-sm">
              {form.watch('skills_endorsed').map((skill, index) => (
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
            {form.formState.errors.skills_endorsed && (
              <p className="text-body-sm color-destructive mt-xs">
                {form.formState.errors.skills_endorsed.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-md">
            <Select
              {...form.register('rating')}
            >
              <option value={5}>5 Stars - Excellent</option>
              <option value={4}>4 Stars - Very Good</option>
              <option value={3}>3 Stars - Good</option>
              <option value={2}>2 Stars - Fair</option>
              <option value={1}>1 Star - Poor</option>
            </Select>

            <div className="flex items-center cluster-sm">
              <input
                type="checkbox"
                id="is_public"
                {...form.register('is_public')}
                className="rounded border-border"
              />
              <label htmlFor="is_public" className="text-body-sm form-label">
                Make this endorsement public
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-sm pt-md">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              <Save className="h-icon-xs w-icon-xs mr-sm" />
              {editingEndorsement ? 'Update' : 'Save'} Endorsement
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
