import { z } from 'zod';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UpdateContractSchema = z.object({
  personId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  type: z.enum(['employment', 'freelance', 'nda', 'vendor', 'service']).optional(),
  status: z.enum(['draft', 'sent', 'signed', 'expired', 'terminated']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  value: z.number().optional(),
  currency: z.string().optional(),
  signedDate: z.string().optional(),
  documentUrl: z.string().url().optional(),
  notes: z.string().optional()
});

async function getAuthenticatedUser() {
  const cookieStore = cookies();
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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    const { id } = params;

    const { data: existingContract, error: fetchError } = await supabase
      .from('files_contracts')
      .select(`
        *,
        person:people(first_name, last_name, email, phone),
        project:projects(name, status, description)
      `)
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (fetchError) {
      console.error('Contract fetch error:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    if (!existingContract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const body = await request.json();
    const updateData = UpdateContractSchema.parse(body);

    const { data: updatedContract, error: updateError } = await supabase
      .from('files_contracts')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (updateError) {
      console.error('Contract update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    if (!updatedContract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Audit logging
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'files.contracts.update',
      resource_type: 'contract',
      resource_id: id,
      details: { updated_fields: Object.keys(updateData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ contract: updatedContract });

  } catch (error) {
    console.error('Contract PATCH error:', error);
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();
    const { id } = params;

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get contract details for audit log
    const { data: contract } = await supabase
        .from('files_contracts')
      .select('type, status, person_id, project_id')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    const { error } = await supabase
        .from('files_contracts')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Contract deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
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
    console.error('Contract DELETE error:', error);
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: (error as Error).message || 'Internal server error' }, { status: 500 });
  }
}
