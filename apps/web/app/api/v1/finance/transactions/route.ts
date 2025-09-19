import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateTransactionSchema = z.object({
  type: z.enum(['debit', 'credit', 'transfer', 'adjustment']),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  description: z.string().min(1, 'Description is required'),
  accountId: z.string().uuid('Valid account ID required'),
  toAccountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  referenceNumber: z.string().optional(),
  transactionDate: z.string(),
  status: z.enum(['pending', 'posted', 'reconciled', 'voided']).default('pending'),
  attachmentUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
});

const UpdateTransactionSchema = CreateTransactionSchema.partial();

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
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const accountId = searchParams.get('accountId');
    const projectId = searchParams.get('projectId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('organization_id', orgId)
      .order('transaction_date', { ascending: false });

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (accountId) query = query.eq('account_id', accountId);
    if (projectId) query = query.eq('project_id', projectId);
    if (startDate) query = query.gte('transaction_date', startDate);
    if (endDate) query = query.lte('transaction_date', endDate);

    const { data: transactions, error } = await query;

    if (error) {
      console.error('Transactions fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'transactions.list',
      resource_type: 'transaction',
      details: { count: transactions?.length || 0, filters: { type, status, accountId, projectId, startDate, endDate } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ transactions: transactions || [] });

  } catch (error) {
    console.error('Transactions GET error:', error);
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
    const transactionData = CreateTransactionSchema.parse(body);

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        ...transactionData,
        organization_id: orgId,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Transaction creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'transactions.create',
      resource_type: 'transaction',
      resource_id: transaction.id,
      details: { type: transaction.type, amount: transaction.amount, description: transaction.description },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ transaction }, { status: 201 });

  } catch (error) {
    console.error('Transactions POST error:', error);
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
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const transactionData = UpdateTransactionSchema.parse(updateData);

    const { data: transaction, error } = await supabase
      .from('transactions')
      .update({
        ...transactionData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Transaction update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'transactions.update',
      resource_type: 'transaction',
      resource_id: transaction.id,
      details: { updated_fields: Object.keys(transactionData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ transaction });

  } catch (error) {
    console.error('Transactions PUT error:', error);
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
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const { data: transaction } = await supabase
      .from('transactions')
      .select('description, amount')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Transaction deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'transactions.delete',
      resource_type: 'transaction',
      resource_id: id,
      details: { description: transaction?.description || 'Unknown', amount: transaction?.amount || 0 },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Transactions DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
