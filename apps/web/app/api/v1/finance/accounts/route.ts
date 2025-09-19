import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  subtype: z.string().optional(),
  accountNumber: z.string().optional(),
  description: z.string().optional(),
  parentAccountId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
  currency: z.string().default('USD'),
  balance: z.number().default(0),
  notes: z.string().optional(),
});

const UpdateAccountSchema = CreateAccountSchema.partial();

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
    const isActive = searchParams.get('isActive');
    const parentAccountId = searchParams.get('parentAccountId');

    let query = supabase
      .from('accounts')
      .select('*')
      .eq('organization_id', orgId)
      .order('name', { ascending: true });

    if (type) query = query.eq('type', type);
    if (isActive !== null) query = query.eq('is_active', isActive === 'true');
    if (parentAccountId) query = query.eq('parent_account_id', parentAccountId);

    const { data: accounts, error } = await query;

    if (error) {
      console.error('Accounts fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'accounts.list',
      resource_type: 'account',
      details: { count: accounts?.length || 0, filters: { type, isActive, parentAccountId } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ accounts: accounts || [] });

  } catch (error) {
    console.error('Accounts GET error:', error);
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
    const accountData = CreateAccountSchema.parse(body);

    const { data: account, error } = await supabase
      .from('accounts')
      .insert({
        ...accountData,
        organization_id: orgId,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Account creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'accounts.create',
      resource_type: 'account',
      resource_id: account.id,
      details: { name: account.name, type: account.type, balance: account.balance },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ account }, { status: 201 });

  } catch (error) {
    console.error('Accounts POST error:', error);
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
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const accountData = UpdateAccountSchema.parse(updateData);

    const { data: account, error } = await supabase
      .from('accounts')
      .update({
        ...accountData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Account update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'accounts.update',
      resource_type: 'account',
      resource_id: account.id,
      details: { updated_fields: Object.keys(accountData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ account });

  } catch (error) {
    console.error('Accounts PUT error:', error);
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
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const { data: account } = await supabase
      .from('accounts')
      .select('name')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Account deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'accounts.delete',
      resource_type: 'account',
      resource_id: id,
      details: { name: account?.name || 'Unknown' },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Accounts DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
