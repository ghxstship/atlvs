/**
 * Edge Function: Record Validation
 * Handles complex business logic validation for all ATLVS modules
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ValidationRequest {
  table: string;
  operation: 'insert' | 'update' | 'delete';
  record: Record<string, any>;
  organizationId: string;
  userId: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { table, operation, record, organizationId, userId }: ValidationRequest = await req.json();

    const result = await validateRecord(supabase, table, operation, record, organizationId, userId);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: result.valid ? 200 : 400,
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      valid: false, 
      errors: [error.message],
      warnings: []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function validateRecord(
  supabase: any,
  table: string,
  operation: string,
  record: Record<string, any>,
  organizationId: string,
  userId: string
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Universal validations
  if (operation !== 'delete') {
    // Check organization access
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single();

    if (!membership) {
      errors.push('User does not have access to this organization');
      return { valid: false, errors, warnings };
    }

    // Ensure organization_id is set correctly
    if (record.organization_id && record.organization_id !== organizationId) {
      errors.push('Invalid organization ID');
    }
  }

  // Table-specific validations
  switch (table) {
    case 'projects':
      await validateProject(supabase, record, operation, errors, warnings, organizationId);
      break;
    
    case 'tasks':
      await validateTask(supabase, record, operation, errors, warnings, organizationId);
      break;
    
    case 'jobs':
      await validateJob(supabase, record, operation, errors, warnings, organizationId);
      break;
    
    case 'companies':
      await validateCompany(supabase, record, operation, errors, warnings, organizationId);
      break;
    
    case 'procurement_orders':
      await validateProcurementOrder(supabase, record, operation, errors, warnings, organizationId);
      break;
    
    case 'invoices':
      await validateInvoice(supabase, record, operation, errors, warnings, organizationId);
      break;
    
    case 'budgets':
      await validateBudget(supabase, record, operation, errors, warnings, organizationId);
      break;
    
    default:
      // Generic validation for other tables
      await validateGeneric(supabase, table, record, operation, errors, warnings, organizationId);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

async function validateProject(
  supabase: any,
  record: Record<string, any>,
  operation: string,
  errors: string[],
  warnings: string[],
  organizationId: string
) {
  if (operation === 'delete') return;

  // Required fields
  if (!record.name?.trim()) {
    errors.push('Project name is required');
  }

  // Date validation
  if (record.starts_at && record.ends_at) {
    const startDate = new Date(record.starts_at);
    const endDate = new Date(record.ends_at);
    
    if (startDate >= endDate) {
      errors.push('Project start date must be before end date');
    }
    
    if (startDate < new Date()) {
      warnings.push('Project start date is in the past');
    }
  }

  // Check for duplicate names
  const { data: existing } = await supabase
    .from('projects')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('name', record.name)
    .neq('id', record.id || '');

  if (existing && existing.length > 0) {
    errors.push('A project with this name already exists');
  }
}

async function validateTask(
  supabase: any,
  record: Record<string, any>,
  operation: string,
  errors: string[],
  warnings: string[],
  organizationId: string
) {
  if (operation === 'delete') return;

  // Required fields
  if (!record.title?.trim()) {
    errors.push('Task title is required');
  }

  // Project validation
  if (record.project_id) {
    const { data: project } = await supabase
      .from('projects')
      .select('id, status')
      .eq('id', record.project_id)
      .eq('organization_id', organizationId)
      .single();

    if (!project) {
      errors.push('Invalid project ID');
    } else if (project.status === 'completed') {
      warnings.push('Adding tasks to a completed project');
    }
  }

  // Due date validation
  if (record.due_at) {
    const dueDate = new Date(record.due_at);
    const now = new Date();
    
    if (dueDate < now) {
      warnings.push('Task due date is in the past');
    }
  }
}

async function validateJob(
  supabase: any,
  record: Record<string, any>,
  operation: string,
  errors: string[],
  warnings: string[],
  organizationId: string
) {
  if (operation === 'delete') return;

  // Required fields
  if (!record.title?.trim()) {
    errors.push('Job title is required');
  }

  // Status validation
  const validStatuses = ['open', 'in_progress', 'blocked', 'done', 'cancelled'];
  if (record.status && !validStatuses.includes(record.status)) {
    errors.push('Invalid job status');
  }

  // Project validation
  if (record.project_id) {
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', record.project_id)
      .eq('organization_id', organizationId)
      .single();

    if (!project) {
      errors.push('Invalid project ID');
    }
  }
}

async function validateCompany(
  supabase: any,
  record: Record<string, any>,
  operation: string,
  errors: string[],
  warnings: string[],
  organizationId: string
) {
  if (operation === 'delete') return;

  // Required fields
  if (!record.name?.trim()) {
    errors.push('Company name is required');
  }

  // Email validation
  if (record.email && !isValidEmail(record.email)) {
    errors.push('Invalid email format');
  }

  // Website validation
  if (record.website && !isValidUrl(record.website)) {
    errors.push('Invalid website URL');
  }

  // Check for duplicate names
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('name', record.name)
    .neq('id', record.id || '');

  if (existing && existing.length > 0) {
    warnings.push('A company with this name already exists');
  }
}

async function validateProcurementOrder(
  supabase: any,
  record: Record<string, any>,
  operation: string,
  errors: string[],
  warnings: string[],
  organizationId: string
) {
  if (operation === 'delete') return;

  // Required fields
  if (!record.title?.trim()) {
    errors.push('Procurement order title is required');
  }

  // Amount validation
  if (record.amount !== undefined) {
    if (typeof record.amount !== 'number' || record.amount < 0) {
      errors.push('Amount must be a positive number');
    }
  }

  // Status validation
  const validStatuses = ['draft', 'pending', 'approved', 'ordered', 'received', 'cancelled'];
  if (record.status && !validStatuses.includes(record.status)) {
    errors.push('Invalid procurement order status');
  }

  // Project validation
  if (record.project_id) {
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', record.project_id)
      .eq('organization_id', organizationId)
      .single();

    if (!project) {
      errors.push('Invalid project ID');
    }
  }
}

async function validateInvoice(
  supabase: any,
  record: Record<string, any>,
  operation: string,
  errors: string[],
  warnings: string[],
  organizationId: string
) {
  if (operation === 'delete') return;

  // Required fields
  if (!record.number?.trim()) {
    errors.push('Invoice number is required');
  }

  // Amount validation
  if (record.amount !== undefined) {
    if (typeof record.amount !== 'number' || record.amount <= 0) {
      errors.push('Invoice amount must be a positive number');
    }
  }

  // Status validation
  const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
  if (record.status && !validStatuses.includes(record.status)) {
    errors.push('Invalid invoice status');
  }

  // Due date validation
  if (record.due_at) {
    const dueDate = new Date(record.due_at);
    const issueDate = new Date(record.issued_at || new Date());
    
    if (dueDate <= issueDate) {
      errors.push('Invoice due date must be after issue date');
    }
  }

  // Check for duplicate invoice numbers
  const { data: existing } = await supabase
    .from('invoices')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('number', record.number)
    .neq('id', record.id || '');

  if (existing && existing.length > 0) {
    errors.push('An invoice with this number already exists');
  }
}

async function validateBudget(
  supabase: any,
  record: Record<string, any>,
  operation: string,
  errors: string[],
  warnings: string[],
  organizationId: string
) {
  if (operation === 'delete') return;

  // Required fields
  if (!record.category?.trim()) {
    errors.push('Budget category is required');
  }

  // Amount validation
  if (record.amount !== undefined) {
    if (typeof record.amount !== 'number' || record.amount < 0) {
      errors.push('Budget amount must be a non-negative number');
    }
  }

  // Project validation
  if (record.project_id) {
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', record.project_id)
      .eq('organization_id', organizationId)
      .single();

    if (!project) {
      errors.push('Invalid project ID');
    }
  }
}

async function validateGeneric(
  supabase: any,
  table: string,
  record: Record<string, any>,
  operation: string,
  errors: string[],
  warnings: string[],
  organizationId: string
) {
  if (operation === 'delete') return;

  // Generic validations for all tables
  
  // Check if table has a name field and validate it
  if ('name' in record && !record.name?.trim()) {
    errors.push('Name is required');
  }

  // Check if table has a title field and validate it
  if ('title' in record && !record.title?.trim()) {
    errors.push('Title is required');
  }

  // Validate email fields
  if ('email' in record && record.email && !isValidEmail(record.email)) {
    errors.push('Invalid email format');
  }

  // Validate URL fields
  if ('website' in record && record.website && !isValidUrl(record.website)) {
    errors.push('Invalid website URL');
  }
}

// Helper functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
