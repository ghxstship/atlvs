import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { ProcurementService } from '@ghxstship/application';
import { z } from 'zod';

const createExpenseSchema = z.object({
  purchase_order_id: z.string().uuid(),
});

const allocateToProjectSchema = z.object({
  purchase_order_id: z.string().uuid(),
  project_id: z.string().uuid(),
  allocation_percentage: z.number().min(1).max(100),
});

const validateBudgetSchema = z.object({
  project_id: z.string().uuid(),
  amount: z.number().min(0),
  currency: z.string().default('USD'),
});

export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract organization context
    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Verify user membership and permissions
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check RBAC permissions - only admin/manager can perform integrations
    if (!['admin', 'manager'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    const procurementService = new ProcurementService(supabase);

    switch (action) {
      case 'create_expense': {
        const validatedData = createExpenseSchema.parse(body);
        await procurementService.createExpenseFromOrder(orgId, validatedData.purchase_order_id, user.id);
        return NextResponse.json({ success: true, message: 'Expense created successfully' });
      }

      case 'allocate_to_project': {
        const validatedData = allocateToProjectSchema.parse(body);
        await procurementService.allocateOrderToProject(
          orgId,
          validatedData.purchase_order_id,
          validatedData.project_id,
          validatedData.allocation_percentage,
          user.id
        );
        return NextResponse.json({ success: true, message: 'Order allocated to project successfully' });
      }

      case 'validate_budget': {
        const validatedData = validateBudgetSchema.parse(body);
        const validation = await procurementService.validateProjectBudget(
          orgId,
          validatedData.project_id,
          validatedData.amount,
          validatedData.currency
        );
        return NextResponse.json({ data: validation });
      }

      case 'get_project_summary': {
        const { project_id } = body;
        if (!project_id) {
          return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
        }
        const summary = await procurementService.getProjectProcurementSummary(orgId, project_id);
        return NextResponse.json({ data: summary });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in procurement integration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
