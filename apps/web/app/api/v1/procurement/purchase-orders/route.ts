import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreatePurchaseOrderSchema = z.object({
  poNumber: z.string().optional(), // Auto-generated if not provided
  vendorId: z.string().uuid('Invalid vendor ID'),
  projectId: z.string().uuid().optional(),
  jobId: z.string().uuid().optional(),
  status: z.enum(['draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'delivered', 'invoiced', 'paid', 'cancelled']).default('draft'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  requestedBy: z.string().uuid().optional(),
  approvedBy: z.string().uuid().optional(),
  orderDate: z.string(),
  deliveryDate: z.string().optional(),
  deliveryAddress: z.object({
    name: z.string().optional(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default('US'),
    contactName: z.string().optional(),
    contactPhone: z.string().optional()
  }),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    unit: z.string().optional(),
    category: z.string().optional(),
    partNumber: z.string().optional(),
    notes: z.string().optional(),
    taxable: z.boolean().default(true),
    accountCode: z.string().optional()
  })),
  terms: z.object({
    paymentTerms: z.string().default('Net 30'),
    shippingMethod: z.string().optional(),
    shippingCost: z.number().min(0).default(0),
    taxRate: z.number().min(0).max(1).default(0),
    discountRate: z.number().min(0).max(1).default(0),
    currency: z.string().default('USD')
  }),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number().optional()
  })).optional(),
  metadata: z.record(z.any()).optional(),
});

const UpdatePurchaseOrderSchema = CreatePurchaseOrderSchema.partial().omit({ vendorId: true });

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

// Generate PO number
async function generatePONumber(supabase, orgId: string): Promise<string> {
  const year = new Date().getFullYear();
  const { data: lastPO } = await supabase
    .from('purchase_orders')
    .select('po_number')
    .eq('organization_id', orgId)
    .like('po_number', `PO-${year}-%`)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  let nextNumber = 1;
  if (lastPO?.po_number) {
    const match = lastPO.po_number.match(/PO-\d{4}-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  return `PO-${year}-${nextNumber.toString().padStart(4, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const vendorId = searchParams.get('vendorId');
    const projectId = searchParams.get('projectId');
    const jobId = searchParams.get('jobId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('purchase_orders')
      .select(`
        *,
        vendor:companies!vendor_id(id, name, contact_info),
        project:projects(id, name),
        job:jobs(id, title),
        requested_by:users!requested_by(id, name, email),
        approved_by:users!approved_by(id, name, email),
        items:purchase_order_items(*)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (vendorId) query = query.eq('vendor_id', vendorId);
    if (projectId) query = query.eq('project_id', projectId);
    if (jobId) query = query.eq('job_id', jobId);
    if (search) {
      query = query.or(`po_number.ilike.%${search}%,notes.ilike.%${search}%`);
    }

    const { data: purchaseOrders, error, count } = await query;

    if (error) {
      console.error('Purchase orders fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Calculate metrics
    const metrics = {
      totalValue: purchaseOrders?.reduce((sum, po) => {
        const itemsTotal = po.items?.reduce((itemSum: number, item) => 
          itemSum + (item.quantity * item.unit_price), 0) || 0;
        const shipping = po.terms?.shipping_cost || 0;
        const tax = itemsTotal * (po.terms?.tax_rate || 0);
        const discount = itemsTotal * (po.terms?.discount_rate || 0);
        return sum + (itemsTotal + shipping + tax - discount);
      }, 0) || 0,
      totalOrders: purchaseOrders?.length || 0,
      pendingApproval: purchaseOrders?.filter(po => po.status === 'pending_approval').length || 0,
      delivered: purchaseOrders?.filter(po => po.status === 'delivered').length || 0,
    };

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'procurement.purchase_orders.list',
      resource_type: 'purchase_order',
      details: { 
        count: purchaseOrders?.length || 0,
        filters: { status, vendorId, projectId, jobId, search }
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      purchaseOrders: purchaseOrders || [], 
      metrics,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Purchase orders GET error:', error);
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
    const poData = CreatePurchaseOrderSchema.parse(body);

    // Verify vendor belongs to organization
    const { data: vendor } = await supabase
      .from('companies')
      .select('id, name, type')
      .eq('id', poData.vendorId)
      .eq('organization_id', orgId)
      .eq('type', 'vendor')
      .single();

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Generate PO number if not provided
    const poNumber = poData.poNumber || await generatePONumber(supabase, orgId);

    // Calculate totals
    const itemsTotal = poData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const shippingCost = poData.terms.shippingCost || 0;
    const taxAmount = itemsTotal * (poData.terms.taxRate || 0);
    const discountAmount = itemsTotal * (poData.terms.discountRate || 0);
    const totalAmount = itemsTotal + shippingCost + taxAmount - discountAmount;

    // Create purchase order
    const { data: purchaseOrder, error } = await supabase
      .from('purchase_orders')
      .insert({
        po_number: poNumber,
        vendor_id: poData.vendorId,
        project_id: poData.projectId,
        job_id: poData.jobId,
        status: poData.status,
        priority: poData.priority,
        requested_by: poData.requestedBy || user.id,
        approved_by: poData.approvedBy,
        order_date: poData.orderDate,
        delivery_date: poData.deliveryDate,
        delivery_address: poData.deliveryAddress,
        terms: poData.terms,
        subtotal: itemsTotal,
        tax_amount: taxAmount,
        shipping_cost: shippingCost,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        notes: poData.notes,
        internal_notes: poData.internalNotes,
        attachments: poData.attachments,
        metadata: poData.metadata,
        organization_id: orgId,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Purchase order creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create purchase order items
    if (poData.items && poData.items.length > 0) {
      const items = poData.items.map((item, index) => ({
        purchase_order_id: purchaseOrder.id,
        organization_id: orgId,
        line_number: index + 1,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        unit: item.unit,
        category: item.category,
        part_number: item.partNumber,
        notes: item.notes,
        taxable: item.taxable,
        account_code: item.accountCode,
        line_total: item.quantity * item.unitPrice,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      await supabase.from('purchase_order_items').insert(items);
    }

    // Send notification if status requires approval
    if (poData.status === 'pending_approval') {
      // Find approvers (owners/admins)
      const { data: approvers } = await supabase
        .from('memberships')
        .select('user:users(id, email, name)')
        .eq('organization_id', orgId)
        .in('role', ['owner', 'admin'])
        .eq('status', 'active');

      if (approvers) {
        const notifications = approvers.map((approver: any) => ({
          user_id: approver.user.id,
          organization_id: orgId,
          type: 'purchase_order_approval',
          title: 'Purchase Order Approval Required',
          message: `Purchase Order ${poNumber} requires your approval. Total: $${totalAmount.toFixed(2)}`,
          created_at: new Date().toISOString()
        }));

        await supabase.from('notifications').insert(notifications);
      }
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'procurement.purchase_orders.create',
      resource_type: 'purchase_order',
      resource_id: purchaseOrder.id,
      details: { 
        po_number: poNumber,
        vendor_id: poData.vendorId,
        total_amount: totalAmount,
        status: poData.status
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ purchaseOrder }, { status: 201 });

  } catch (error) {
    console.error('Purchase orders POST error:', error);
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
      return NextResponse.json({ error: 'Purchase order ID is required' }, { status: 400 });
    }

    const poData = UpdatePurchaseOrderSchema.parse(updateData);

    // Check if PO can be updated
    const { data: existingPO } = await supabase
      .from('purchase_orders')
      .select('status, po_number')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (!existingPO) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    if (['sent', 'acknowledged', 'delivered', 'invoiced', 'paid'].includes(existingPO.status)) {
      return NextResponse.json({ 
        error: 'Cannot modify purchase order in current status' 
      }, { status: 400 });
    }

    // Recalculate totals if items were updated
    let calculatedFields = {};
    if (poData.items) {
      const itemsTotal = poData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const shippingCost = poData.terms?.shippingCost || 0;
      const taxAmount = itemsTotal * (poData.terms?.taxRate || 0);
      const discountAmount = itemsTotal * (poData.terms?.discountRate || 0);
      const totalAmount = itemsTotal + shippingCost + taxAmount - discountAmount;

      calculatedFields = {
        subtotal: itemsTotal,
        tax_amount: taxAmount,
        shipping_cost: shippingCost,
        discount_amount: discountAmount,
        total_amount: totalAmount
      };
    }

    const { data: purchaseOrder, error } = await supabase
      .from('purchase_orders')
      .update({
        ...poData,
        ...calculatedFields,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Purchase order update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Update items if provided
    if (poData.items) {
      // Delete existing items
      await supabase
        .from('purchase_order_items')
        .delete()
        .eq('purchase_order_id', id);

      // Insert new items
      const items = poData.items.map((item, index) => ({
        purchase_order_id: id,
        organization_id: orgId,
        line_number: index + 1,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        unit: item.unit,
        category: item.category,
        part_number: item.partNumber,
        notes: item.notes,
        taxable: item.taxable,
        account_code: item.accountCode,
        line_total: item.quantity * item.unitPrice,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      await supabase.from('purchase_order_items').insert(items);
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'procurement.purchase_orders.update',
      resource_type: 'purchase_order',
      resource_id: purchaseOrder.id,
      details: { 
        po_number: existingPO.po_number,
        updated_fields: Object.keys(poData)
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ purchaseOrder });

  } catch (error) {
    console.error('Purchase orders PUT error:', error);
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
      return NextResponse.json({ error: 'Purchase order ID is required' }, { status: 400 });
    }

    const { data: purchaseOrder } = await supabase
      .from('purchase_orders')
      .select('po_number, status, total_amount')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (!purchaseOrder) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    // Only allow deletion of draft or cancelled orders
    if (!['draft', 'cancelled'].includes(purchaseOrder.status)) {
      return NextResponse.json({ 
        error: 'Only draft or cancelled purchase orders can be deleted' 
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Purchase order deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'procurement.purchase_orders.delete',
      resource_type: 'purchase_order',
      resource_id: id,
      details: { 
        po_number: purchaseOrder.po_number,
        status: purchaseOrder.status,
        total_amount: purchaseOrder.total_amount
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Purchase orders DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
