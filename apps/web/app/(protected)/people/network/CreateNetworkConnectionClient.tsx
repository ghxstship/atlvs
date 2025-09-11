'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Textarea, Drawer } from '@ghxstship/ui';
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
        className="flex items-center gap-2"
       
      >
        <Plus className="h-4 w-4" />
        Add Connection
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Add Network Connection"
       
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
              form="network-connection-form"
              disabled={!isValid || isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Connection'}
            </Button>
          </div>
        }
      >
        <form id="network-connection-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Users className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-medium">Network Connection Information</h3>
              <p className="text-sm text-foreground/70">
                Document professional relationships within your organization
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                  <p className="text-sm text-destructive mt-1">{errors.personId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Connected To *
                </label>
                <select
                  {...register('connectedPersonId')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Select connected person...</option>
                  {availableConnectedPeople.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.first_name} {person.last_name} {person.role && `(${person.role})`}
                    </option>
                  ))}
                </select>
                {errors.connectedPersonId && (
                  <p className="text-sm text-destructive mt-1">{errors.connectedPersonId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Relationship Type
                </label>
                <select
                  {...register('relationshipType')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
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
                <label className="block text-sm font-medium mb-2">
                  Connection Strength
                </label>
                <select
                  {...register('strength')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="weak">Weak - Occasional interaction</option>
                  <option value="moderate">Moderate - Regular interaction</option>
                  <option value="strong">Strong - Close working relationship</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Project Context (Optional)
              </label>
              <select
                {...register('projectId')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Select project (optional)...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Notes
              </label>
              <Textarea
                {...register('notes')}
                placeholder="Additional context about this relationship"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('isPublic')}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">
                Make this connection visible to other team members
              </label>
            </div>
          </div>

          <div className="bg-secondary/10 p-4 rounded-lg">
            <h4 className="font-medium text-secondary mb-2">Network Guidelines</h4>
            <ul className="text-sm text-secondary/80 space-y-1">
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
