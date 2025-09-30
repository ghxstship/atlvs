import { z as zod } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { CatalogService } from '@/app/(app)/(shell)/procurement/catalog/lib/catalogService';

export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract organization context
    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Verify user membership
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

    const statsQuerySchema = zod.object({
      timeframe: zod.enum(['7d', '30d', '90d', '1y']).default('30d'),
      compare: zod.boolean().default(false),
      category: zod.string().optional(),
      supplier: zod.string().optional(),
      status: zod.enum(['all', 'active', 'inactive', 'discontinued']).default('all'),
      type: zod.enum(['all', 'product', 'service']).default('all'),
    });

    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validatedQuery = statsQuerySchema.parse(queryParams);

    const catalogService = new CatalogService();
    const stats = await catalogService.getCatalogStats(orgId, {
      timeframe: validatedQuery.timeframe,
      compare: validatedQuery.compare,
      category: validatedQuery.category,
      supplier: validatedQuery.supplier,
      status: validatedQuery.status,
      type: validatedQuery.type,
    });

    return NextResponse.json({ data: stats });
  } catch (error: unknown) {
    if (error instanceof zod.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching catalog stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
