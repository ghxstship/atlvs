/**
 * PEOPLE MODULE - DATA MUTATION OPERATIONS
 * Comprehensive mutation handlers for all People module data operations
 * Includes transaction management, validation, and audit logging
 */

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schemas for mutations
const CreatePersonSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  title: z.string().optional(),
  department: z.string().optional(),
  bio: z.string().optional(),
  avatar_url: z.string().url().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  start_date: z.string().optional(),
  manager_id: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('active')
});

const UpdatePersonSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  bio: z.string().optional(),
  avatar_url: z.string().url().optional().nullable(),
  phone: z.string().optional(),
  location: z.string().optional(),
  start_date: z.string().optional(),
  manager_id: z.string().uuid().optional().nullable(),
  status: z.enum(['active', 'inactive', 'pending']).optional()
});

const CreateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  color: z.string().optional()
});

const CreateCompetencySchema = z.object({
  name: z.string().min(1, 'Competency name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  level_definitions: z.record(z.string()).optional()
});

const AssignCompetencySchema = z.object({
  person_id: z.string().uuid('Invalid person ID'),
  competency_id: z.string().uuid('Invalid competency ID'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  notes: z.string().optional(),
  assigned_by: z.string().uuid('Invalid assigner ID'),
  assigned_at: z.string().optional()
});

const CreateEndorsementSchema = z.object({
  recipient_id: z.string().uuid('Invalid recipient ID'),
  competency_id: z.string().uuid('Invalid competency ID'),
  endorser_id: z.string().uuid('Invalid endorser ID'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  comment: z.string().optional(),
  is_public: z.boolean().default(true)
});

const CreateAssignmentSchema = z.object({
  person_id: z.string().uuid('Invalid person ID'),
  title: z.string().min(1, 'Assignment title is required'),
  description: z.string().optional(),
  status: z.enum(['assigned', 'in_progress', 'completed', 'cancelled']).default('assigned'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assigned_by: z.string().uuid('Invalid assigner ID'),
  due_date: z.string().optional(),
  project_id: z.string().uuid().optional(),
  tags: z.array(z.string()).default([])
});

export class PeopleMutationHandler {
  private supabase = createClient();
  private orgId: string;

  constructor(orgId: string) {
    this.orgId = orgId;
  }

  // Person CRUD Operations
  async createPerson(personData: z.infer<typeof CreatePersonSchema>) {
    // Validate input
    const validatedData = CreatePersonSchema.parse(personData);

    // Check for existing email
    const { data: existingPerson } = await this.supabase
      .from('people')
      .select('id')
      .eq('email', validatedData.email)
      .eq('organization_id', this.orgId)
      .single();

    if (existingPerson) {
      throw new Error('Person with this email already exists in the organization');
    }

    // Get current user for audit
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Create person
    const { data, error } = await this.supabase
      .from('people')
      .insert([{
        ...validatedData,
        organization_id: this.orgId,
        created_by: user.id,
        updated_by: user.id
      }])
      .select()
      .single();

    if (error) throw error;

    // Create membership if not exists
    const { error: membershipError } = await this.supabase
      .from('memberships')
      .insert([{
        user_id: data.id,
        organization_id: this.orgId,
        role: 'member',
        status: 'active',
        invited_by: user.id
      }]);

    if (membershipError) {
      // Clean up person if membership creation fails
      await this.supabase.from('people').delete().eq('id', data.id);
      throw membershipError;
    }

    return data;
  }

  async updatePerson(id: string, updates: z.infer<typeof UpdatePersonSchema>) {
    // Validate input
    const validatedData = UpdatePersonSchema.parse(updates);

    // Get current user for audit
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Check if person exists and belongs to organization
    const { data: existingPerson, error: checkError } = await this.supabase
      .from('people')
      .select('id')
      .eq('id', id)
      .eq('organization_id', this.orgId)
      .single();

    if (checkError || !existingPerson) {
      throw new Error('Person not found or access denied');
    }

    // Check email uniqueness if email is being updated
    if (validatedData.email) {
      const { data: existingEmail } = await this.supabase
        .from('people')
        .select('id')
        .eq('email', validatedData.email)
        .eq('organization_id', this.orgId)
        .neq('id', id)
        .single();

      if (existingEmail) {
        throw new Error('Email address already in use');
      }
    }

    // Update person
    const { data, error } = await this.supabase
      .from('people')
      .update({
        ...validatedData,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', this.orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePerson(id: string, hardDelete: boolean = false) {
    // Get current user for audit
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Check permissions (owner/admin only)
    const { data: userMembership } = await this.supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', this.orgId)
      .single();

    if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
      throw new Error('Insufficient permissions to delete people');
    }

    if (hardDelete) {
      // Hard delete - remove all related data
      const { error } = await this.supabase
        .from('people')
        .delete()
        .eq('id', id)
        .eq('organization_id', this.orgId);

      if (error) throw error;
    } else {
      // Soft delete - update status
      const { error } = await this.supabase
        .from('people')
        .update({
          status: 'inactive',
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('organization_id', this.orgId);

      if (error) throw error;
    }

    return true;
  }

  // Bulk Operations
  async bulkUpdatePeople(ids: string[], updates: Partial<z.infer<typeof UpdatePersonSchema>>) {
    // Validate bulk updates
    const validatedUpdates = UpdatePersonSchema.partial().parse(updates);

    // Get current user
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Perform bulk update
    const { data, error } = await this.supabase
      .from('people')
      .update({
        ...validatedUpdates,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .eq('organization_id', this.orgId)
      .select();

    if (error) throw error;
    return data || [];
  }

  async bulkDeletePeople(ids: string[]) {
    // Get current user
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Check permissions
    const { data: userMembership } = await this.supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', this.orgId)
      .single();

    if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
      throw new Error('Insufficient permissions for bulk delete');
    }

    // Perform bulk delete
    const { error } = await this.supabase
      .from('people')
      .delete()
      .in('id', ids)
      .eq('organization_id', this.orgId);

    if (error) throw error;
    return true;
  }

  // Role Operations
  async createRole(roleData: z.infer<typeof CreateRoleSchema>) {
    const validatedData = CreateRoleSchema.parse(roleData);

    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data, error } = await this.supabase
      .from('people_roles')
      .insert([{
        ...validatedData,
        organization_id: this.orgId,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateRole(id: string, updates: Partial<z.infer<typeof CreateRoleSchema>>) {
    const validatedUpdates = CreateRoleSchema.partial().parse(updates);

    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data, error } = await this.supabase
      .from('people_roles')
      .update({
        ...validatedUpdates,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', this.orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Competency Operations
  async createCompetency(competencyData: z.infer<typeof CreateCompetencySchema>) {
    const validatedData = CreateCompetencySchema.parse(competencyData);

    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data, error } = await this.supabase
      .from('people_competencies')
      .insert([{
        ...validatedData,
        organization_id: this.orgId,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async assignCompetency(assignmentData: z.infer<typeof AssignCompetencySchema>) {
    const validatedData = AssignCompetencySchema.parse(assignmentData);

    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data, error } = await this.supabase
      .from('person_competencies')
      .insert([{
        ...validatedData,
        assigned_at: validatedData.assigned_at || new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Endorsement Operations
  async createEndorsement(endorsementData: z.infer<typeof CreateEndorsementSchema>) {
    const validatedData = CreateEndorsementSchema.parse(endorsementData);

    // Prevent self-endorsement
    if (validatedData.recipient_id === validatedData.endorser_id) {
      throw new Error('Cannot endorse yourself');
    }

    const { data, error } = await this.supabase
      .from('people_endorsements')
      .insert([{
        ...validatedData,
        organization_id: this.orgId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Assignment Operations
  async createAssignment(assignmentData: z.infer<typeof CreateAssignmentSchema>) {
    const validatedData = CreateAssignmentSchema.parse(assignmentData);

    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data, error } = await this.supabase
      .from('people_assignments')
      .insert([{
        ...validatedData,
        organization_id: this.orgId,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAssignmentStatus(id: string, status: string, notes?: string) {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data, error } = await this.supabase
      .from('people_assignments')
      .update({
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        notes,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', this.orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// Factory function for mutation handler
export function createPeopleMutationHandler(orgId: string) {
  return new PeopleMutationHandler(orgId);
}

// Export validation schemas for reuse
export {
  CreatePersonSchema,
  UpdatePersonSchema,
  CreateRoleSchema,
  CreateCompetencySchema,
  AssignCompetencySchema,
  CreateEndorsementSchema,
  CreateAssignmentSchema
};
