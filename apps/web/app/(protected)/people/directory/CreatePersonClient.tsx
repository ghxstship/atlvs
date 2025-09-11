'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Textarea, Drawer } from '@ghxstship/ui';
import { User, Plus, Save, X } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const personSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  bio: z.string().optional(),
  skills: z.string().optional(),
  status: z.enum(['active', 'inactive', 'terminated']).default('active'),
});

type PersonFormData = z.infer<typeof personSchema>;

interface CreatePersonClientProps {
  orgId: string;
  onPersonCreated?: () => void;
}

export default function CreatePersonClient({ orgId, onPersonCreated }: CreatePersonClientProps) {
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
  } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    mode: 'onChange',
    defaultValues: {
      status: 'active',
    }
  });

  const onSubmit = async (data: PersonFormData) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Convert skills string to array
      const skillsArray = data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

      const response = await fetch('/api/v1/people', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId,
        },
        body: JSON.stringify({
          ...data,
          skills: skillsArray,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create person');
      }

      const result = await response.json();

      // Track person creation
      posthog?.capture('people_person_created', {
        person_id: result.data.id,
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role,
        department: data.department,
        status: data.status,
        organization_id: orgId,
      });

      // Log activity
      await sb.from('activities').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'create',
        resource_type: 'person',
        resource_id: result.data.id,
        details: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role,
          department: data.department,
          status: data.status,
        },
      });

      // Reset form and close drawer
      reset();
      setIsOpen(false);
      onPersonCreated?.();

    } catch (error) {
      console.error('Error creating person:', error);
      posthog?.capture('people_person_creation_failed', {
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
        Add Person
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Add Person"
       
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
              form="person-form"
              disabled={!isValid || isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Person'}
            </Button>
          </div>
        }
      >
        <form id="person-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Person Information</h3>
              <p className="text-sm text-foreground/70">
                Add a new person to your organization directory
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  First Name *
                </label>
                <Input
                  {...register('firstName')}
                  placeholder="John"
                  error={errors.firstName?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Name *
                </label>
                <Input
                  {...register('lastName')}
                  placeholder="Smith"
                  error={errors.lastName?.message}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="john.smith@example.com"
                  error={errors.email?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone
                </label>
                <Input
                  {...register('phone')}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Role
                </label>
                <Input
                  {...register('role')}
                  placeholder="e.g., Production Manager, Rigger"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Department
                </label>
                <Input
                  {...register('department')}
                  placeholder="e.g., Production, Technical, Creative"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <Input
                  {...register('location')}
                  placeholder="e.g., Los Angeles, CA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Date
                </label>
                <Input
                  {...register('startDate')}
                  type="date"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Skills
              </label>
              <Input
                {...register('skills')}
                placeholder="e.g., Lighting, Sound, Rigging (comma separated)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter skills separated by commas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Bio
              </label>
              <Textarea
                {...register('bio')}
                placeholder="Brief professional background and experience"
                rows={3}
              />
            </div>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg">
            <h4 className="font-medium text-primary mb-2">Directory Guidelines</h4>
            <ul className="text-sm text-primary/80 space-y-1">
              <li>• Provide accurate contact information for effective communication</li>
              <li>• Include relevant skills to help with project assignments</li>
              <li>• Keep role and department information current</li>
              <li>• Use consistent location formatting for better organization</li>
            </ul>
          </div>
        </form>
      </Drawer>
    </>
  );
}
