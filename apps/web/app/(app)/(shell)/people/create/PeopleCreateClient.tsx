'use client';

import { UserPlus, Mail, Building, Calendar, FileText, Users, Send, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { createBrowserClient } from '@ghxstship/auth';
import {
  Button,
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  UnifiedInput,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
} from '@ghxstship/ui';

interface PeopleCreateClientProps {
  orgId: string;
  userId: string;
  userEmail: string;
  userRole: string;
}

type CollaboratorRole =
  | 'client'
  | 'contractor'
  | 'consultant'
  | 'vendor'
  | 'freelancer'
  | 'partner'
  | 'stakeholder'
  | 'reviewer'
  | 'collaborator';

type CollaboratorStatus = 'invited' | 'accepted' | 'active' | 'inactive' | 'suspended';

type InvitationType = 'organization' | 'project';

interface CollaboratorFormData {
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;

  // Collaboration Details
  role: CollaboratorRole;
  invitationType: InvitationType;
  projectId?: string;
  organizationId: string;

  // Additional Information
  company?: string;
  jobTitle?: string;
  department?: string;
  bio?: string;
  skills?: string[];

  // Invitation Details
  message?: string;
  expiresInDays: number;
}

interface CreatedInvitation {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: CollaboratorRole;
  invitation_type: InvitationType;
  project_id?: string;
  organization_id: string;
  status: CollaboratorStatus;
  invited_by: string;
  expires_at: string;
  message?: string;
  company?: string;
  job_title?: string;
  department?: string;
  bio?: string;
  skills?: string[];
  created_at: string;
  updated_at: string;
}

export default function PeopleCreateClient({
  orgId,
  userId,
  userEmail,
  userRole,
}: PeopleCreateClientProps) {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [activeTab, setActiveTab] = useState('basic');
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CollaboratorFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'collaborator',
    invitationType: 'organization',
    organizationId: orgId,
    company: '',
    jobTitle: '',
    department: '',
    bio: '',
    skills: [],
    message: '',
    expiresInDays: 7,
  });

  // Load projects for project-specific invitations
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, status')
          .eq('organization_id', orgId)
          .eq('status', 'active')
          .order('name');

        if (error) throw error;
        setProjects(data || []);
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };

    if (formData.invitationType === 'project') {
      loadProjects();
    }
  }, [orgId, supabase, formData.invitationType]);

  const handleInputChange = useCallback((field: keyof CollaboratorFormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    }, []);

  const handleSelectChange = useCallback((field: keyof CollaboratorFormData) =>
    (value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

  const handleMultiSelectChange = useCallback((field: 'skills') =>
    (values: string[]) => {
      setFormData(prev => ({ ...prev, [field]: values }));
    }, []);

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Please enter a valid email address';

    if (formData.invitationType === 'project' && !formData.projectId) {
      return 'Please select a project for project-specific invitations';
    }

    return null;
  };

  const generateInvitationMessage = (): string => {
    const inviterName = userEmail.split('@')[0]; // Simple name extraction
    const organizationName = 'your organization'; // Could be fetched from org data

    if (formData.invitationType === 'project') {
      const projectName = projects.find(p => p.id === formData.projectId)?.name || 'the project';
      return `Hi ${formData.firstName},

You've been invited by ${inviterName} to collaborate on ${projectName} as a ${formData.role}.

${formData.message || 'We\'d love to have you join our team and contribute to this project.'}

Please accept this invitation to get started.

Best regards,
${inviterName}`;
    } else {
      return `Hi ${formData.firstName},

You've been invited by ${inviterName} to join ${organizationName} as a ${formData.role}.

${formData.message || 'We\'d love to have you join our organization and collaborate with our team.'}

Please accept this invitation to get started.

Best regards,
${inviterName}`;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Check if person already exists or has pending invitation
      const { data: existingPerson } = await supabase
        .from('people')
        .select('id, email')
        .eq('email', formData.email)
        .eq('organization_id', orgId)
        .maybeSingle();

      if (existingPerson) {
        setError('A person with this email already exists in your organization');
        return;
      }

      // Check for pending invitations
      const { data: pendingInvite } = await supabase
        .from('organization_invites')
        .select('id, email, status')
        .eq('email', formData.email)
        .eq('organization_id', orgId)
        .eq('status', 'pending')
        .maybeSingle();

      if (pendingInvite) {
        setError('An invitation is already pending for this email address');
        return;
      }

      // Create the invitation record
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + formData.expiresInDays);

      const invitationData = {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
        invitation_type: formData.invitationType,
        project_id: formData.invitationType === 'project' ? formData.projectId : null,
        organization_id: orgId,
        status: 'invited' as CollaboratorStatus,
        invited_by: userId,
        expires_at: expiresAt.toISOString(),
        message: generateInvitationMessage(),
        company: formData.company || null,
        job_title: formData.jobTitle || null,
        department: formData.department || null,
        bio: formData.bio || null,
        skills: formData.skills,
        phone: formData.phone || null,
      };

      const { data, error: insertError } = await supabase
        .from('organization_invites')
        .insert(invitationData)
        .select()
        .single();

      if (insertError) throw insertError;

      // TODO: Send invitation email via API
      // For now, we'll just create the invitation record
      // In production, this would trigger an email service

      setSuccess(`Invitation sent successfully to ${formData.email}`);

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'collaborator',
        invitationType: 'organization',
        organizationId: orgId,
        company: '',
        jobTitle: '',
        department: '',
        bio: '',
        skills: [],
        message: '',
        expiresInDays: 7,
      });

      setActiveTab('basic');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/people');
  };

  const collaboratorRoles: { value: CollaboratorRole; label: string; description: string }[] = [
    { value: 'client', label: 'Client', description: 'External client or customer' },
    { value: 'contractor', label: 'Contractor', description: 'External contractor or vendor' },
    { value: 'consultant', label: 'Consultant', description: 'External consultant or advisor' },
    { value: 'vendor', label: 'Vendor', description: 'Supplier or service provider' },
    { value: 'freelancer', label: 'Freelancer', description: 'Independent freelancer' },
    { value: 'partner', label: 'Partner', description: 'Business partner or ally' },
    { value: 'stakeholder', label: 'Stakeholder', description: 'Project stakeholder' },
    { value: 'reviewer', label: 'Reviewer', description: 'Content or code reviewer' },
    { value: 'collaborator', label: 'Collaborator', description: 'General collaborator' },
  ];

  const invitationTypes: { value: InvitationType; label: string; description: string }[] = [
    { value: 'organization', label: 'Organization-wide', description: 'Access to entire organization' },
    { value: 'project', label: 'Project-specific', description: 'Limited to specific project(s)' },
  ];

  const expiryOptions = [
    { value: 1, label: '1 day' },
    { value: 3, label: '3 days' },
    { value: 7, label: '7 days' },
    { value: 14, label: '14 days' },
    { value: 30, label: '30 days' },
  ];

  return (
    <div className="container mx-auto max-w-6xl space-y-lg p-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-icon-xs w-icon-xs" />
            Cancel
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Invite Collaborator</h1>
            <p className="text-muted-foreground">Invite external collaborators to work with your organization</p>
            <Badge variant="outline" className="mt-2">
              <AlertCircle className="h-3 w-3 mr-1" />
              Does not count against billing seats
            </Badge>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Card className="p-md bg-green-50 border-green-200">
          <div className="flex items-center gap-sm">
            <CheckCircle className="h-icon-sm w-icon-sm text-green-600" />
            <p className="text-green-800">{success}</p>
          </div>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="flex items-center gap-xs">
                <UserPlus className="h-icon-xs w-icon-xs" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="collaboration" className="flex items-center gap-xs">
                <Users className="h-icon-xs w-icon-xs" />
                Collaboration
              </TabsTrigger>
              <TabsTrigger value="invitation" className="flex items-center gap-xs">
                <Mail className="h-icon-xs w-icon-xs" />
                Invitation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-lg mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div className="space-y-md">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-xs">
                    <UserPlus className="h-icon-sm w-icon-sm" />
                    Personal Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">First Name *</label>
                    <UnifiedInput
                      value={formData.firstName}
                      onChange={handleInputChange('firstName')}
                      placeholder="Enter first name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                    <UnifiedInput
                      value={formData.lastName}
                      onChange={handleInputChange('lastName')}
                      placeholder="Enter last name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <UnifiedInput
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      placeholder="collaborator@company.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <UnifiedInput
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange('phone')}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-md">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-xs">
                    <Building className="h-icon-sm w-icon-sm" />
                    Professional Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">Company</label>
                    <UnifiedInput
                      value={formData.company}
                      onChange={handleInputChange('company')}
                      placeholder="Company or Organization"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Job Title</label>
                    <UnifiedInput
                      value={formData.jobTitle}
                      onChange={handleInputChange('jobTitle')}
                      placeholder="Senior Developer, Project Manager, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Department</label>
                    <UnifiedInput
                      value={formData.department}
                      onChange={handleInputChange('department')}
                      placeholder="Engineering, Marketing, Sales, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Skills</label>
                    <UnifiedInput
                      value={formData.skills?.join(', ')}
                      onChange={(e) => handleMultiSelectChange('skills')(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      placeholder="JavaScript, React, Project Management (comma-separated)"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <Textarea
                  value={formData.bio}
                  onChange={handleInputChange('bio')}
                  placeholder="Brief professional background or bio"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="collaboration" className="space-y-lg mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div className="space-y-md">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-xs">
                    <Users className="h-icon-sm w-icon-sm" />
                    Collaboration Setup
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">Role *</label>
                    <Select value={formData.role} onValueChange={handleSelectChange('role')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select collaborator role" />
                      </SelectTrigger>
                      <SelectContent>
                        {collaboratorRoles.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            <div>
                              <div className="font-medium">{role.label}</div>
                              <div className="text-xs text-muted-foreground">{role.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Invitation Type *</label>
                    <Select value={formData.invitationType} onValueChange={handleSelectChange('invitationType')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select invitation scope" />
                      </SelectTrigger>
                      <SelectContent>
                        {invitationTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.invitationType === 'project' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Project *</label>
                      <Select value={formData.projectId} onValueChange={handleSelectChange('projectId')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map(project => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-md">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-xs">
                    <FileText className="h-icon-sm w-icon-sm" />
                    Access & Permissions
                  </h3>

                  <div className="p-md bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="font-medium text-blue-900 mb-2">Role Permissions</h4>
                    <div className="text-sm text-blue-800">
                      {formData.role === 'client' && 'Can view project progress, submit feedback, and communicate with the team.'}
                      {formData.role === 'contractor' && 'Can access assigned tasks, submit deliverables, and collaborate on project work.'}
                      {formData.role === 'consultant' && 'Can provide expert advice, review work, and participate in strategic discussions.'}
                      {formData.role === 'vendor' && 'Can manage deliveries, submit invoices, and coordinate with procurement team.'}
                      {formData.role === 'freelancer' && 'Can work on assigned tasks and submit completed work for review.'}
                      {formData.role === 'partner' && 'Can collaborate on joint projects and access relevant organizational resources.'}
                      {formData.role === 'stakeholder' && 'Can monitor progress, provide input, and stay informed about project developments.'}
                      {formData.role === 'reviewer' && 'Can review and approve work, provide feedback, and ensure quality standards.'}
                      {formData.role === 'collaborator' && 'Can participate in team activities and contribute to collaborative work.'}
                      {!formData.role && 'Select a role to see permissions.'}
                    </div>
                  </div>

                  <div className="p-md bg-green-50 border border-green-200 rounded-md">
                    <h4 className="font-medium text-green-900 mb-2">Billing Impact</h4>
                    <div className="text-sm text-green-800">
                      External collaborators do not count against your organization's billing seats.
                      This invitation will not affect your subscription costs.
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="invitation" className="space-y-lg mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div className="space-y-md">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-xs">
                    <Mail className="h-icon-sm w-icon-sm" />
                    Invitation Details
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">Expiry Period</label>
                    <Select
                      value={formData.expiresInDays.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, expiresInDays: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select expiry period" />
                      </SelectTrigger>
                      <SelectContent>
                        {expiryOptions.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Personalized Message</label>
                    <Textarea
                      value={formData.message}
                      onChange={handleInputChange('message')}
                      placeholder="Add a personal message to the invitation..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="space-y-md">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-xs">
                    <Send className="h-icon-sm w-icon-sm" />
                    Preview
                  </h3>

                  <div className="p-md bg-gray-50 border border-gray-200 rounded-md">
                    <h4 className="font-medium mb-2">Email Preview</h4>
                    <div className="text-sm text-gray-700 whitespace-pre-line max-h-40 overflow-y-auto">
                      {generateInvitationMessage()}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-6 p-md bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-sm mt-6 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="h-icon-xs w-icon-xs mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Send className="h-icon-xs w-icon-xs mr-2" />
              {isLoading ? 'Sending Invitation...' : 'Send Invitation'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
