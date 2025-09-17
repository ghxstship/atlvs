import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  clientId: z.string().uuid('Valid client ID required'),
  projectId: z.string().uuid().optional(),
  issueDate: z.string(),
  dueDate: z.string(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
  currency: z.string().default('USD'),
  subtotal: z.number().min(0),
  taxRate: z.number().min(0).max(100).default(0),
  taxAmount: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  total: z.number().min(0),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().min(0),
    amount: z.number().min(0),
  })).optional(),
});

const UpdateInvoiceSchema = CreateInvoiceSchema.partial();

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

export async function GET(request: NextRequest) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const projectId = searchParams.get('projectId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabase
      .from('invoices')
      .select('*')
      .eq('organization_id', orgId)
      .order('issue_date', { ascending: false });

    if (status) query = query.eq('status', status);
    if (clientId) query = query.eq('client_id', clientId);
    if (projectId) query = query.eq('project_id', projectId);
    if (startDate) query = query.gte('issue_date', startDate);
    if (endDate) query = query.lte('issue_date', endDate);

    const { data: invoices, error } = await query;

    if (error) {
      console.error('Invoices fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'invoices.list',
      resource_type: 'invoice',
      details: { count: invoices?.length || 0, filters: { status, clientId, projectId, startDate, endDate } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ invoices: invoices || [] });

  } catch (error: any) {
    console.error('Invoices GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const invoiceData = CreateInvoiceSchema.parse(body);

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        ...invoiceData,
        organization_id: orgId,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Invoice creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'invoices.create',
      resource_type: 'invoice',
      resource_id: invoice.id,
      details: { invoiceNumber: invoice.invoiceNumber, total: invoice.total, status: invoice.status },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ invoice }, { status: 201 });

  } catch (error: any) {
    console.error('Invoices POST error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const invoiceData = UpdateInvoiceSchema.parse(updateData);

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({
        ...invoiceData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Invoice update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'invoices.update',
      resource_type: 'invoice',
      resource_id: invoice.id,
      details: { updated_fields: Object.keys(invoiceData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ invoice });

  } catch (error: any) {
    console.error('Invoices PUT error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
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
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const { data: invoice } = await supabase
      .from('invoices')
      .select('invoiceNumber')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Invoice deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'invoices.delete',
      resource_type: 'invoice',
      resource_id: id,
      details: { invoiceNumber: invoice?.invoiceNumber || 'Unknown' },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Invoices DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
