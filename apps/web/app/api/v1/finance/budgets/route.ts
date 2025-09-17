import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schemas
const CreateBudgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  description: z.string().optional(),
  projectId: z.string().uuid().optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  period: z.enum(['monthly', 'quarterly', 'yearly', 'project']).default('project'),
  startDate: z.string(),
  endDate: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).default('draft'),
});

const UpdateBudgetSchema = CreateBudgetSchema.partial();

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

  // Get organization membership
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
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Build query
    let query = supabase
      .from('budgets')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (projectId) query = query.eq('project_id', projectId);
    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);

    const { data: budgets, error } = await query;

    if (error) {
      console.error('Budgets fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'budgets.list',
      resource_type: 'budget',
      details: { count: budgets?.length || 0, filters: { projectId, status, category } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ budgets: budgets || [] });

  } catch (error: any) {
    console.error('Budgets GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    // Check permissions
    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const budgetData = CreateBudgetSchema.parse(body);

    // Create budget
    const { data: budget, error } = await supabase
      .from('budgets')
      .insert({
        ...budgetData,
        organization_id: orgId,
        created_by: user.id,
        spent: 0, // Initialize spent amount
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Budget creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'budgets.create',
      resource_type: 'budget',
      resource_id: budget.id,
      details: { name: budget.name, amount: budget.amount, currency: budget.currency },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ budget }, { status: 201 });

  } catch (error: any) {
    console.error('Budgets POST error:', error);
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

    // Check permissions
    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 });
    }

    const budgetData = UpdateBudgetSchema.parse(updateData);

    // Update budget
    const { data: budget, error } = await supabase
      .from('budgets')
      .update({
        ...budgetData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Budget update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'budgets.update',
      resource_type: 'budget',
      resource_id: budget.id,
      details: { updated_fields: Object.keys(budgetData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ budget });

  } catch (error: any) {
    console.error('Budgets PUT error:', error);
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

    // Check permissions (only admin/owner can delete)
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 });
    }

    // Check for dependencies (expenses linked to this budget)
    const { data: expenses } = await supabase
      .from('expenses')
      .select('id')
      .eq('budget_id', id)
      .eq('organization_id', orgId)
      .limit(1);

    if (expenses && expenses.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete budget with linked expenses. Please remove expenses first.' 
      }, { status: 409 });
    }

    // Get budget name for audit log
    const { data: budget } = await supabase
      .from('budgets')
      .select('name')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    // Delete budget
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Budget deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'budgets.delete',
      resource_type: 'budget',
      resource_id: id,
      details: { name: budget?.name || 'Unknown' },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Budgets DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
