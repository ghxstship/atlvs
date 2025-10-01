'use client';


import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
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
        className="flex items-center gap-sm"
       
      >
        <Plus className="h-icon-xs w-icon-xs" />
        Add Person
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Add Person"
       
        footer={
          <div className="flex justify-end gap-sm">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-icon-xs w-icon-xs mr-sm" />
              Cancel
            </Button>
            <Button
              type="submit"
              form="person-form"
              disabled={!isValid || isSubmitting}
            >
              <Save className="h-icon-xs w-icon-xs mr-sm" />
              {isSubmitting ? 'Creating...' : 'Create Person'}
            </Button>
          </div>
        }
      >
        <form id="person-form" onSubmit={handleSubmit(onSubmit)} className="stack-lg">
          <div className="flex items-center gap-sm mb-lg">
            <div className="p-sm bg-accent/10 rounded-lg">
              <User className="h-icon-sm w-icon-sm color-accent" />
            </div>
            <div>
              <h3 className="form-label">Person Information</h3>
              <p className="text-body-sm color-foreground/70">
                Add a new person to your organization directory
              </p>
            </div>
          </div>

          <div className="stack-md">
            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-sm">
                  First Name *
                </label>
                <UnifiedInput                   {...register('firstName')}
                  placeholder="John"
                  error={errors.firstName?.message}
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Last Name *
                </label>
                <UnifiedInput                   {...register('lastName')}
                  placeholder="Smith"
                  error={errors.lastName?.message}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Email
                </label>
                <UnifiedInput                   {...register('email')}
                  type="email"
                  placeholder="john.smith@example.com"
                  error={errors.email?.message}
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Phone
                </label>
                <UnifiedInput                   {...register('phone')}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Role
                </label>
                <UnifiedInput                   {...register('role')}
                  placeholder="e.g., Production Manager, Rigger"
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Department
                </label>
                <UnifiedInput                   {...register('department')}
                  placeholder="e.g., Production, Technical, Creative"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Location
                </label>
                <UnifiedInput                   {...register('location')}
                  placeholder="e.g., Los Angeles, CA"
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Start Date
                </label>
                <UnifiedInput                   {...register('startDate')}
                  type="date"
                />
              </div>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full  px-md py-sm border border-input rounded-md bg-background"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Skills
              </label>
              <UnifiedInput                 {...register('skills')}
                placeholder="e.g., Lighting, Sound, Rigging (comma separated)"
              />
              <p className="text-body-sm color-muted mt-xs">
                Enter skills separated by commas
              </p>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Bio
              </label>
              <Textarea
                {...register('bio')}
                placeholder="Brief professional background and experience"
                rows={3}
              />
            </div>
          </div>

          <div className="bg-accent/5 p-md rounded-lg">
            <h4 className="form-label color-accent mb-sm">Directory Guidelines</h4>
            <ul className="text-body-sm color-accent/80 stack-xs">
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
