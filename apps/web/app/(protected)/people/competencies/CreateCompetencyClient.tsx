'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Textarea, Drawer } from '@ghxstship/ui';
import { Award, Plus, Save, X } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const competencySchema = z.object({
  name: z.string().min(1, 'Competency name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  beginnerDefinition: z.string().optional(),
  intermediateDefinition: z.string().optional(),
  advancedDefinition: z.string().optional(),
  expertDefinition: z.string().optional(),
});

type CompetencyFormData = z.infer<typeof competencySchema>;

interface CreateCompetencyClientProps {
  orgId: string;
  onCompetencyCreated?: () => void;
}

export default function CreateCompetencyClient({ orgId, onCompetencyCreated }: CreateCompetencyClientProps) {
  const t = useTranslations('people');
  const posthog = usePostHog();
  const sb = createBrowserClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<CompetencyFormData>({
    resolver: zodResolver(competencySchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: CompetencyFormData) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Build level definitions object
      const levelDefinitions = {
        beginner: data.beginnerDefinition || '',
        intermediate: data.intermediateDefinition || '',
        advanced: data.advancedDefinition || '',
        expert: data.expertDefinition || '',
      };

      const response = await fetch('/api/v1/people/competencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId,
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          category: data.category,
          levelDefinitions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create competency');
      }

      const result = await response.json();

      // Track competency creation
      posthog?.capture('people_competency_created', {
        competency_id: result.data.id,
        name: data.name,
        category: data.category,
        organization_id: orgId,
      });

      // Log activity
      await sb.from('activities').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'create',
        resource_type: 'competency',
        resource_id: result.data.id,
        details: {
          name: data.name,
          category: data.category,
        },
      });

      // Reset form and close drawer
      reset();
      setIsOpen(false);
      onCompetencyCreated?.();

    } catch (error) {
      console.error('Error creating competency:', error);
      posthog?.capture('people_competency_creation_failed', {
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
        Add Competency
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Add Competency"
       
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
              form="competency-form"
              disabled={!isValid || isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Competency'}
            </Button>
          </div>
        }
      >
        <form id="competency-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Award className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-medium">Competency Information</h3>
              <p className="text-sm text-foreground/70">
                Define a new skill or competency for assessment
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Competency Name *
              </label>
              <Input
                {...register('name')}
                placeholder="e.g., Lighting Design, Sound Engineering"
                error={errors.name?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Category
              </label>
              <Input
                {...register('category')}
                placeholder="e.g., Technical, Creative, Management"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                {...register('description')}
                placeholder="Brief description of this competency"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm">Level Definitions</h4>
              <p className="text-xs text-muted-foreground">
                Define what each proficiency level means for this competency
              </p>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Beginner Level
                </label>
                <Textarea
                  {...register('beginnerDefinition')}
                  placeholder="What defines beginner level proficiency?"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Intermediate Level
                </label>
                <Textarea
                  {...register('intermediateDefinition')}
                  placeholder="What defines intermediate level proficiency?"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Advanced Level
                </label>
                <Textarea
                  {...register('advancedDefinition')}
                  placeholder="What defines advanced level proficiency?"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Expert Level
                </label>
                <Textarea
                  {...register('expertDefinition')}
                  placeholder="What defines expert level proficiency?"
                  rows={2}
                />
              </div>
            </div>
          </div>

          <div className="bg-secondary/10 p-4 rounded-lg">
            <h4 className="font-medium text-secondary mb-2">Competency Guidelines</h4>
            <ul className="text-sm text-secondary/80 space-y-1">
              <li>• Use clear, specific names that are easily understood</li>
              <li>• Define measurable criteria for each proficiency level</li>
              <li>• Consider both technical skills and soft skills</li>
              <li>• Align competencies with industry standards where applicable</li>
            </ul>
          </div>
        </form>
      </Drawer>
    </>
  );
}
