'use client';


import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Users, Plus, Save, X } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const networkConnectionSchema = z.object({
  personId: z.string().min(1, 'Person selection is required'),
  connectedPersonId: z.string().min(1, 'Connected person selection is required'),
  relationshipType: z.enum(['colleague', 'mentor', 'mentee', 'supervisor', 'subordinate', 'collaborator', 'friend', 'other']).default('colleague'),
  strength: z.enum(['weak', 'moderate', 'strong']).default('moderate'),
  notes: z.string().optional(),
  projectId: z.string().optional(),
  isPublic: z.boolean().default(true),
});

type NetworkConnectionFormData = z.infer<typeof networkConnectionSchema>;

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  role?: string;
  department?: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
}

interface CreateNetworkConnectionClientProps {
  orgId: string;
  onConnectionCreated?: () => void;
}

export default function CreateNetworkConnectionClient({ orgId, onConnectionCreated }: CreateNetworkConnectionClientProps) {
  const t = useTranslations('people');
  const posthog = usePostHog();
  const sb = createBrowserClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<NetworkConnectionFormData>({
    resolver: zodResolver(networkConnectionSchema),
    mode: 'onChange',
    defaultValues: {
      relationshipType: 'colleague',
      strength: 'moderate',
      isPublic: true,
    }
  });

  const selectedPersonId = watch('personId');

  useEffect(() => {
    if (isOpen) {
      loadPeople();
      loadProjects();
    }
  }, [isOpen, orgId]);

  const loadPeople = async () => {
    try {
      const { data: people } = await sb
        .from('people')
        .select('id, first_name, last_name, role, department')
        .eq('organization_id', orgId)
        .eq('status', 'active')
        .order('first_name');

      setPeople(people || []);
    } catch (error) {
      console.error('Error loading people:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const { data: projects } = await sb
        .from('projects')
        .select('id, name, status')
        .eq('organization_id', orgId)
        .in('status', ['active', 'planning', 'in_progress'])
        .order('name');

      setProjects(projects || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const onSubmit = async (data: NetworkConnectionFormData) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('/api/v1/people/network', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create network connection');
      }

      const result = await response.json();

      // Track network connection creation
      posthog?.capture('people_network_connection_created', {
        connection_id: result.data.id,
        person_id: data.personId,
        connected_person_id: data.connectedPersonId,
        relationship_type: data.relationshipType,
        strength: data.strength,
        organization_id: orgId,
      });

      // Log activity
      await sb.from('activities').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'create',
        resource_type: 'network_connection',
        resource_id: result.data.id,
        details: {
          person_id: data.personId,
          connected_person_id: data.connectedPersonId,
          relationship_type: data.relationshipType,
          strength: data.strength,
        },
      });

      // Reset form and close drawer
      reset();
      setIsOpen(false);
      onConnectionCreated?.();

    } catch (error) {
      console.error('Error creating network connection:', error);
      posthog?.capture('people_network_connection_creation_failed', {
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

  // Filter out the selected person from the connected person options
  const availableConnectedPeople = people.filter(person => person.id !== selectedPersonId);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-sm"
       
      >
        <Plus className="h-4 w-4" />
        Add Connection
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Add Network Connection"
       
        footer={
          <div className="flex justify-end gap-sm">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-sm" />
              Cancel
            </Button>
            <Button
              type="submit"
              form="network-connection-form"
              disabled={!isValid || isSubmitting}
            >
              <Save className="h-4 w-4 mr-sm" />
              {isSubmitting ? 'Creating...' : 'Create Connection'}
            </Button>
          </div>
        }
      >
        <form id="network-connection-form" onSubmit={handleSubmit(onSubmit)} className="stack-lg">
          <div className="flex items-center gap-sm mb-lg">
            <div className="p-sm bg-secondary/10 rounded-lg">
              <Users className="h-5 w-5 color-secondary" />
            </div>
            <div>
              <h3 className="form-label">Network Connection Information</h3>
              <p className="text-body-sm color-foreground/70">
                Document professional relationships within your organization
              </p>
            </div>
          </div>

          <div className="stack-md">
            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Person *
                </label>
                <select
                  {...register('personId')}
                  className="w-full  px-md py-sm border border-input rounded-md bg-background"
                >
                  <option value="">Select person...</option>
                  {people.map((person: any) => (
                    <option key={person.id} value={person.id}>
                      {person.first_name} {person.last_name} {person.role && `(${person.role})`}
                    </option>
                  ))}
                </select>
                {errors.personId && (
                  <p className="text-body-sm color-destructive mt-xs">{errors.personId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Connected To *
                </label>
                <select
                  {...register('connectedPersonId')}
                  className="w-full  px-md py-sm border border-input rounded-md bg-background"
                >
                  <option value="">Select connected person...</option>
                  {availableConnectedPeople.map((person: any) => (
                    <option key={person.id} value={person.id}>
                      {person.first_name} {person.last_name} {person.role && `(${person.role})`}
                    </option>
                  ))}
                </select>
                {errors.connectedPersonId && (
                  <p className="text-body-sm color-destructive mt-xs">{errors.connectedPersonId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Relationship Type
                </label>
                <select
                  {...register('relationshipType')}
                  className="w-full  px-md py-sm border border-input rounded-md bg-background"
                >
                  <option value="colleague">Colleague</option>
                  <option value="mentor">Mentor</option>
                  <option value="mentee">Mentee</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="subordinate">Subordinate</option>
                  <option value="collaborator">Collaborator</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Connection Strength
                </label>
                <select
                  {...register('strength')}
                  className="w-full  px-md py-sm border border-input rounded-md bg-background"
                >
                  <option value="weak">Weak - Occasional interaction</option>
                  <option value="moderate">Moderate - Regular interaction</option>
                  <option value="strong">Strong - Close working relationship</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Project Context (Optional)
              </label>
              <select
                {...register('projectId')}
                className="w-full  px-md py-sm border border-input rounded-md bg-background"
              >
                <option value="">Select project (optional)...</option>
                {projects.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Notes
              </label>
              <Textarea
                {...register('notes')}
                placeholder="Additional context about this relationship"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-sm">
              <input
                type="checkbox"
                {...register('isPublic')}
                className="w-4 h-4"
              />
              <label className="text-body-sm form-label">
                Make this connection visible to other team members
              </label>
            </div>
          </div>

          <div className="bg-secondary/10 p-md rounded-lg">
            <h4 className="form-label color-secondary mb-sm">Network Guidelines</h4>
            <ul className="text-body-sm color-secondary/80 stack-xs">
              <li>• Document meaningful professional relationships</li>
              <li>• Use appropriate relationship types for clarity</li>
              <li>• Consider connection strength based on frequency and depth of interaction</li>
              <li>• Add project context when the relationship was formed through specific work</li>
              <li>• Respect privacy preferences when marking connections as public</li>
            </ul>
          </div>
        </form>
      </Drawer>
    </>
  );
}
