import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, createServiceRoleClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function DELETE(request: NextRequest) {
  const cookieStore = cookies();
  const userSb = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });

  const { data: { user } } = await userSb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: membership } = await userSb
    .from('memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .maybeSingle();

  if (!membership) return NextResponse.json({ error: 'no active organization' }, { status: 400 });

  const orgId = membership.organization_id;
  const svc = createServiceRoleClient();

  try {
    // Delete demo data in reverse dependency order
    const tables = [
      'comments',
      'tags', 
      'audit_logs',
      'files',
      'tasks',
      'listings',
      'vendors',
      'locations',
      'projects'
    ];

    let deletedCount = 0;

    for (const table of tables) {
      const { count, error } = await svc
        .from(table)
        .delete({ count: 'exact' })
        .eq('organization_id', orgId)
        .eq('is_demo', true);

      if (error) {
        console.warn(`Error deleting from ${table}:`, error);
        // Continue with other tables
      } else {
        deletedCount += count || 0;
      }
    }

    // Track telemetry
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('demo.removed', {
        organization_id: orgId,
        user_id: user.id,
        deleted_count: deletedCount
      });
    }

    return NextResponse.json({ 
      success: true, 
      deleted_count: deletedCount,
      message: 'Demo data removed successfully'
    });

  } catch (error: any) {
    console.error('Demo removal error:', error);
    return NextResponse.json({ 
      error: 'Failed to remove demo data',
      details: error.message 
    }, { status: 500 });
  }
}
