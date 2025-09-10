import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { extractTenantContext } from '@/lib/tenant-context';
import { enforceRBAC } from '@/lib/rbac';
import { createClient } from '@/lib/supabase/server';

const UpdatePersonSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  endDate: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
  status: z.enum(['active', 'inactive', 'terminated']).optional(),
  avatarUrl: z.string().url().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await extractTenantContext();
    await enforceRBAC(context.userId, context.organizationId, 'people:read');

    const supabase = await createClient();
    const { data: person, error } = await supabase
      .from('people')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', context.organizationId)
      .single();

    if (error || !person) {
      return NextResponse.json(
        { success: false, error: 'Person not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: person,
    });
  } catch (error) {
    console.error('Error fetching person:', error);
    
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await extractTenantContext();
    await enforceRBAC(context.userId, context.organizationId, 'people:write');

    const body = await request.json();
    const updates = UpdatePersonSchema.parse(body);

    const supabase = await createClient();
    const { data: person, error } = await supabase
      .from('people')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('organization_id', context.organizationId)
      .select()
      .single();

    if (error || !person) {
      return NextResponse.json(
        { success: false, error: 'Person not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: person,
    });
  } catch (error) {
    console.error('Error updating person:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await extractTenantContext();
    await enforceRBAC(context.userId, context.organizationId, 'people:delete');

    const supabase = await createClient();
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', context.organizationId);

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete person' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Person deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting person:', error);
    
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
