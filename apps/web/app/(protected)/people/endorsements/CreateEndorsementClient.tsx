'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Textarea, Drawer } from '@ghxstship/ui';
import { Star, Plus, Save, X } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const endorsementSchema = z.object({
  personId: z.string().min(1, 'Person selection is required'),
  competencyId: z.string().optional(),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().optional(),
  projectId: z.string().optional(),
  endorsementType: z.enum(['skill', 'performance', 'leadership', 'collaboration', 'general']).default('skill'),
});

type EndorsementFormData = z.infer<typeof endorsementSchema>;

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  role?: string;
}

interface Competency {
  id: string;
  name: string;
  category?: string;
}

interface CreateEndorsementClientProps {
  orgId: string;
  onEndorsementCreated?: () => void;
}

export default function CreateEndorsementClient({ orgId, onEndorsementCreated }: CreateEndorsementClientProps) {
  const t = useTranslations('people');
  const posthog = usePostHog();
  const sb = createBrowserClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<EndorsementFormData>({
    resolver: zodResolver(endorsementSchema),
    mode: 'onChange',
    defaultValues: {
      rating: 5,
      endorsementType: 'skill',
    }
  });

  useEffect(() => {
    if (isOpen) {
      loadPeople();
      loadCompetencies();
    }
  }, [isOpen, orgId]);

  const loadPeople = async () => {
    try {
      const { data: people } = await sb
        .from('people')
        .select('id, first_name, last_name, role')
        .eq('organization_id', orgId)
        .eq('status', 'active')
        .order('first_name');

      setPeople(people || []);
    } catch (error) {
      console.error('Error loading people:', error);
    }
  };

  const loadCompetencies = async () => {
    try {
      const { data: competencies } = await sb
        .from('people_competencies')
        .select('id, name, category')
        .eq('organization_id', orgId)
        .order('name');

      setCompetencies(competencies || []);
    } catch (error) {
      console.error('Error loading competencies:', error);
    }
  };

  const onSubmit = async (data: EndorsementFormData) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('/api/v1/people/endorsements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId,
        },
        body: JSON.stringify({
          ...data,
          endorserId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create endorsement');
      }

      const result = await response.json();

      // Track endorsement creation
      posthog?.capture('people_endorsement_created', {
        endorsement_id: result.data.id,
        person_id: data.personId,
        competency_id: data.competencyId,
        rating: data.rating,
        type: data.endorsementType,
        organization_id: orgId,
      });

      // Log activity
      await sb.from('activities').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'create',
        resource_type: 'endorsement',
        resource_id: result.data.id,
        details: {
          person_id: data.personId,
          competency_id: data.competencyId,
          rating: data.rating,
          type: data.endorsementType,
        },
      });

      // Reset form and close drawer
      reset();
      setIsOpen(false);
      onEndorsementCreated?.();

    } catch (error) {
      console.error('Error creating endorsement:', error);
      posthog?.capture('people_endorsement_creation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        organization_id: orgId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
       
      >
        <Plus className="h-4 w-4" />
        Add Endorsement
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Add Endorsement"
       
        footer={
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              form="endorsement-form"
              disabled={!isValid || isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Endorsement'}
            </Button>
          </div>
        }
      >
        <form id="endorsement-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium">Endorsement Information</h3>
              <p className="text-sm text-foreground/70">
                Provide feedback and recognition for team members
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Person *
              </label>
              <select
                {...register('personId')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Select person...</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.first_name} {person.last_name} {person.role && `(${person.role})`}
                  </option>
                ))}
              </select>
              {errors.personId && (
                <p className="text-sm text-red-600 mt-1">{errors.personId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Endorsement Type
                </label>
                <select
                  {...register('endorsementType')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="skill">Skill</option>
                  <option value="performance">Performance</option>
                  <option value="leadership">Leadership</option>
                  <option value="collaboration">Collaboration</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Rating *
                </label>
                <select
                  {...register('rating', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value={1}>1 - Needs Improvement</option>
                  <option value={2}>2 - Below Expectations</option>
                  <option value={3}>3 - Meets Expectations</option>
                  <option value={4}>4 - Exceeds Expectations</option>
                  <option value={5}>5 - Outstanding</option>
                </select>
                {errors.rating && (
                  <p className="text-sm text-red-600 mt-1">{errors.rating.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Specific Competency (Optional)
              </label>
              <select
                {...register('competencyId')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Select competency (optional)...</option>
                {competencies.map((competency) => (
                  <option key={competency.id} value={competency.id}>
                    {competency.name} {competency.category && `(${competency.category})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Project (Optional)
              </label>
              <Input
                {...register('projectId')}
                placeholder="Project ID or name where this was observed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Comments
              </label>
              <Textarea
                {...register('comment')}
                placeholder="Specific feedback, examples, and observations"
                rows={4}
              />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Endorsement Guidelines</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Provide specific, constructive feedback with examples</li>
              <li>• Focus on observable behaviors and outcomes</li>
              <li>• Be fair and objective in your ratings</li>
              <li>• Consider the person's role and experience level</li>
              <li>• Use endorsements to recognize good work and guide development</li>
            </ul>
          </div>
        </form>
      </Drawer>
    </>
  );
}
