import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schemas
const CreateExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  category: z.string().optional(),
  budgetId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  expenseDate: z.string(),
  receiptUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected', 'paid']).default('draft'),
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.string().optional(),
  paidAt: z.string().optional(),
});

const UpdateExpenseSchema = CreateExpenseSchema.partial();

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
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const projectId = searchParams.get('projectId');
    const budgetId = searchParams.get('budgetId');

    // Build query
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('organization_id', orgId)
      .order('expense_date', { ascending: false });

    // Apply filters
    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (projectId) query = query.eq('project_id', projectId);
    if (budgetId) query = query.eq('budget_id', budgetId);

    const { data: expenses, error } = await query;

    if (error) {
      console.error('Expenses fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'expenses.list',
      resource_type: 'expense',
      details: { count: expenses?.length || 0, filters: { status, category, projectId, budgetId } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ expenses: expenses || [] });

  } catch (error) {
    console.error('Expenses GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    // Check permissions (all authenticated users can create expenses)
    const body = await request.json();
    const expenseData = CreateExpenseSchema.parse(body);

    // Create expense
    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({
        ...expenseData,
        organization_id: orgId,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Expense creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'expenses.create',
      resource_type: 'expense',
      resource_id: expense.id,
      details: { description: expense.description, amount: expense.amount, currency: expense.currency },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ expense }, { status: 201 });

  } catch (error) {
    console.error('Expenses POST error:', error);
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

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    const expenseData = UpdateExpenseSchema.parse(updateData);

    // Check if user can update this expense (owner or admin/manager can update any, others can only update their own)
    let query = supabase
      .from('expenses')
      .update({
        ...expenseData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId);

    // If not admin/manager, restrict to own expenses
    if (!['owner', 'admin', 'manager'].includes(role)) {
      query = query.eq('created_by', user.id);
    }

    const { data: expense, error } = await query.select().single();

    if (error) {
      console.error('Expense update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found or access denied' }, { status: 404 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'expenses.update',
      resource_type: 'expense',
      resource_id: expense.id,
      details: { updated_fields: Object.keys(expenseData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ expense });

  } catch (error) {
    console.error('Expenses PUT error:', error);
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

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    // Check permissions (only admin/owner can delete, or user can delete their own draft expenses)
    const { data: expense } = await supabase
      .from('expenses')
      .select('description, status, created_by')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Check delete permissions
    const canDelete = ['owner', 'admin'].includes(role) || 
                     (expense.created_by === user.id && expense.status === 'draft');

    if (!canDelete) {
      return NextResponse.json({ 
        error: 'Cannot delete expense. Only draft expenses can be deleted by their creator, or admins can delete any expense.' 
      }, { status: 403 });
    }

    // Delete expense
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Expense deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'expenses.delete',
      resource_type: 'expense',
      resource_id: id,
      details: { description: expense.description },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Expenses DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
