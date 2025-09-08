import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

// Validation schema for company contacts
const CompanyContactSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  isPrimary: z.boolean().default(false),
  isActive: z.boolean().default(true),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Get user and verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization ID from headers
    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const isPrimary = searchParams.get('isPrimary');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('company_contacts')
      .select(`
        *,
        companies!inner(name)
      `)
      .eq('organization_id', orgId);

    // Apply filters
    if (companyId) query = query.eq('company_id', companyId);
    if (isPrimary) query = query.eq('is_primary', isPrimary === 'true');
    if (isActive) query = query.eq('is_active', isActive === 'true');

    // Apply pagination and ordering
    query = query
      .range(offset, offset + limit - 1)
      .order('is_primary', { ascending: false })
      .order('name', { ascending: true });

    const { data: contacts, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }

    // Format response with company names
    const formattedContacts = contacts.map(contact => ({
      ...contact,
      companyName: contact.companies?.name,
      companies: undefined // Remove the joined data
    }));

    return NextResponse.json({
      contacts: formattedContacts,
      pagination: {
        page,
        limit,
        total: contacts.length
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Get user and verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization ID from headers
    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Check permissions - require settings:manage for contact creation
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role, permissions')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !membership.permissions?.includes('settings:manage')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CompanyContactSchema.parse(body);

    // Verify company belongs to organization
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('id', validatedData.companyId)
      .eq('organization_id', orgId)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // If setting as primary, unset other primary contacts for this company
    if (validatedData.isPrimary) {
      await supabase
        .from('company_contacts')
        .update({ is_primary: false })
        .eq('company_id', validatedData.companyId)
        .eq('organization_id', orgId);
    }

    // Create contact
    const { data: contact, error } = await supabase
      .from('company_contacts')
      .insert({
        ...validatedData,
        organization_id: orgId,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'create',
      resource_type: 'company_contact',
      resource_id: contact.id,
      details: { name: contact.name, company_id: contact.company_id }
    });

    return NextResponse.json({
      contact: {
        ...contact,
        createdAt: contact.created_at,
        updatedAt: contact.updated_at
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }

    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Get user and verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization ID from headers
    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Contact ID required' }, { status: 400 });
    }

    const validatedData = CompanyContactSchema.partial().parse(updateData);

    // Check permissions
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role, permissions')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !membership.permissions?.includes('settings:manage')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get current contact to check company_id
    const { data: currentContact } = await supabase
      .from('company_contacts')
      .select('company_id')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (!currentContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // If setting as primary, unset other primary contacts for this company
    if (validatedData.isPrimary) {
      await supabase
        .from('company_contacts')
        .update({ is_primary: false })
        .eq('company_id', currentContact.company_id)
        .eq('organization_id', orgId)
        .neq('id', id);
    }

    // Update contact
    const { data: contact, error } = await supabase
      .from('company_contacts')
      .update(validatedData)
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'update',
      resource_type: 'company_contact',
      resource_id: contact.id,
      details: { changes: validatedData }
    });

    return NextResponse.json({
      contact: {
        ...contact,
        createdAt: contact.created_at,
        updatedAt: contact.updated_at
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }

    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Get user and verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization ID from headers
    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get contact ID from query params
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('id');
    
    if (!contactId) {
      return NextResponse.json({ error: 'Contact ID required' }, { status: 400 });
    }

    // Check permissions
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role, permissions')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !membership.permissions?.includes('settings:manage')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get contact details for audit log
    const { data: contact } = await supabase
      .from('company_contacts')
      .select('id, name, company_id')
      .eq('id', contactId)
      .eq('organization_id', orgId)
      .single();

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Delete contact
    const { error } = await supabase
      .from('company_contacts')
      .delete()
      .eq('id', contactId)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'delete',
      resource_type: 'company_contact',
      resource_id: contactId,
      details: { name: contact.name, company_id: contact.company_id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
