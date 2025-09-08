'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Badge, Button, Input, Textarea, Select, Drawer } from '@ghxstship/ui';
import { 
  ThumbsUp, 
  Edit, 
  Save, 
  Plus,
  Star,
  User,
  Calendar,
  Trash2
} from 'lucide-react';

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
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const formatRelationship = (relationship: string) => {
    return relationship.charAt(0).toUpperCase() + relationship.slice(1);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Endorsements</h2>
        <Button 
          onClick={() => {
            setEditingEndorsement(null);
            form.reset();
            setDrawerOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Endorsement
        </Button>
      </div>

      {endorsements.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <ThumbsUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Endorsements Yet</h3>
            <p className="text-muted-foreground mb-4">
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
        <div className="space-y-4">
          {endorsements.map((endorsement) => (
            <Card key={endorsement.id}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{endorsement.endorser_name}</h3>
                      {endorsement.endorser_title && (
                        <p className="text-sm text-muted-foreground">
                          {endorsement.endorser_title}
                          {endorsement.endorser_company && ` at ${endorsement.endorser_company}`}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" size="sm">
                          {formatRelationship(endorsement.relationship)}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {renderStars(endorsement.rating)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(endorsement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(endorsement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <blockquote className="text-muted-foreground italic mb-4 border-l-4 border-blue-200 pl-4">
                  "{endorsement.endorsement_text}"
                </blockquote>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {endorsement.skills_endorsed.map((skill, index) => (
                      <Badge key={index} variant="secondary" size="sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Endorser Name"
            placeholder="Enter endorser's full name"
            {...form.register('endorser_name')}
            error={form.formState.errors.endorser_name?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Title"
              placeholder="Job title"
              {...form.register('endorser_title')}
              error={form.formState.errors.endorser_title?.message}
            />

            <Input
              label="Company"
              placeholder="Company name"
              {...form.register('endorser_company')}
              error={form.formState.errors.endorser_company?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Relationship"
              {...form.register('relationship')}
              error={form.formState.errors.relationship?.message}
            >
              <option value="colleague">Colleague</option>
              <option value="supervisor">Supervisor</option>
              <option value="client">Client</option>
              <option value="subordinate">Subordinate</option>
              <option value="other">Other</option>
            </Select>

            <Input
              label="Date Received"
              type="date"
              {...form.register('date_received')}
              error={form.formState.errors.date_received?.message}
            />
          </div>

          <Textarea
            label="Endorsement Text"
            placeholder="Enter the endorsement text"
            {...form.register('endorsement_text')}
            error={form.formState.errors.endorsement_text?.message}
            rows={4}
          />

          <div>
            <label className="block text-sm font-medium mb-2">Skills Endorsed</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add a skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.watch('skills_endorsed').map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            {form.formState.errors.skills_endorsed && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.skills_endorsed.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Rating"
              {...form.register('rating', { valueAsNumber: true })}
              error={form.formState.errors.rating?.message}
            >
              <option value={5}>5 Stars - Excellent</option>
              <option value={4}>4 Stars - Very Good</option>
              <option value={3}>3 Stars - Good</option>
              <option value={2}>2 Stars - Fair</option>
              <option value={1}>1 Star - Poor</option>
            </Select>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_public"
                {...form.register('is_public')}
                className="rounded border-gray-300"
              />
              <label htmlFor="is_public" className="text-sm font-medium">
                Make this endorsement public
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              <Save className="h-4 w-4 mr-2" />
              {editingEndorsement ? 'Update' : 'Save'} Endorsement
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
