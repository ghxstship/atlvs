import { z } from 'zod';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateContractSchema = z.object({
  personId: z.string().uuid(),
  projectId: z.string().uuid(),
  type: z.enum(['employment', 'freelance', 'nda', 'vendor', 'service']),
  status: z.enum(['draft', 'sent', 'signed', 'expired', 'terminated']).default('draft'),
  startDate: z.string(),
  endDate: z.string().optional(),
  value: z.number().optional(),
  currency: z.string().default('USD'),
  signedDate: z.string().optional(),
  documentUrl: z.string().url().optional(),
  notes: z.string().optional()
});

const UpdateContractSchema = CreateContractSchema.partial();

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) {
    throw new Error('No active organization membership');
  }

  return { user, orgId: membership.organization_id, role: membership.role, supabase };
}

export async function GET(request: NextRequest) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');

    let query = supabase
      .from('files_contracts')
      .select(`
        *,
        person:people(first_name, last_name, email),
        project:projects(name, status)
      `)
      .eq('organization_id', orgId);

    // Apply filters
    if (personId) query = query.eq('person_id', personId);
    if (projectId) query = query.eq('project_id', projectId);
    if (status) query = query.eq('status', status);

    const { data: contracts, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Contracts fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Audit logging
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'files.contracts.list',
      resource_type: 'contract',
      details: { count: contracts?.length || 0, filters: { personId, projectId, status } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ contracts: contracts || [] });

  } catch (error) {
    console.error('Contracts GET error:', error);
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: (error as Error).message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const contractData = CreateContractSchema.parse(body);

    // Verify project exists and user has access
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', contractData.projectId)
      .eq('organization_id', orgId)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { data: contract, error } = await supabase
      .from('files_contracts')
      .insert({
        person_id: contractData.personId,
        project_id: contractData.projectId,
        organization_id: orgId,
        type: contractData.type,
        status: contractData.status,
        start_date: contractData.startDate,
        end_date: contractData.endDate,
        value: contractData.value,
        currency: contractData.currency,
        signed_date: contractData.signedDate,
        document_url: contractData.documentUrl,
        notes: contractData.notes,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        person:people(first_name, last_name, email),
        project:projects(name, status)
      `)
      .single();

    if (error) {
      console.error('Contract creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Audit logging
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'files.contracts.create',
      resource_type: 'contract',
      resource_id: contract.id,
      details: { 
        person_id: contractData.personId,
        project_id: contractData.projectId,
        type: contractData.type,
        status: contractData.status
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ contract }, { status: 201 });

  } catch (error) {
    console.error('Contracts POST error:', error);
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
    }

    // Get contract details for audit log
    const { data: contract } = await supabase
      .from('files_contracts')
      .select('type, status, person_id, project_id')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    const { error: deleteError } = await supabase
      .from('files_contracts')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (deleteError) {
      console.error('Contract deletion error:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    // Audit logging
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'files.contracts.delete',
      resource_type: 'contract',
      resource_id: id,
      details: { 
        type: contract?.type || 'Unknown',
        status: contract?.status || 'Unknown',
        person_id: contract?.person_id || 'Unknown',
        project_id: contract?.project_id || 'Unknown'
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Contracts DELETE error:', error);
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: (error as Error).message || 'Internal server error' }, { status: 500 });
  }
}
