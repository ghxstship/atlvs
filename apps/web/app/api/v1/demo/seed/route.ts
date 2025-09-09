import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, createServiceRoleClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function POST(request: NextRequest) {
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
    // Check if demo data already exists
    const { data: existingDemo } = await svc
      .from('projects')
      .select('id')
      .eq('organization_id', orgId)
      .eq('is_demo', true)
      .limit(1);

    if (existingDemo && existingDemo.length > 0) {
      return NextResponse.json({ error: 'Demo data already exists' }, { status: 400 });
    }

    // Create demo project
    const { data: project, error: projectError } = await svc
      .from('projects')
      .insert({
        organization_id: orgId,
        name: 'Blackwater Reverb — Main Deck Takeover',
        description: 'Epic pirate-themed entertainment production featuring the legendary Blackwater Fleet',
        status: 'planning',
        starts_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        created_by: user.id,
        is_demo: true
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Create demo locations
    const locations = [
      {
        organization_id: orgId,
        project_id: project.id,
        name: 'Port of Lost Echoes',
        address: 'Pier 7, Harbor City',
        capacity: 500,
        notes: 'Main performance venue with harbor views',
        created_by: user.id,
        is_demo: true
      },
      {
        organization_id: orgId,
        project_id: project.id,
        name: 'Harbor East Rig',
        address: 'East Harbor Platform',
        capacity: 200,
        notes: 'Secondary stage for acoustic sets',
        created_by: user.id,
        is_demo: true
      }
    ];

    const { data: createdLocations, error: locationsError } = await svc
      .from('locations')
      .insert(locations)
      .select();

    if (locationsError) throw locationsError;

    // Create demo tasks
    const tasks = [
      {
        organization_id: orgId,
        project_id: project.id,
        name: 'Rigging: Starboard Mast',
        description: 'Set up main stage rigging on starboard side',
        status: 'pending',
        priority: 'high',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: user.id,
        is_demo: true
      },
      {
        organization_id: orgId,
        project_id: project.id,
        name: 'Soundcheck — Captain\'s Choir',
        description: 'Audio testing for main performance group',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: user.id,
        is_demo: true
      }
    ];

    const { error: tasksError } = await svc
      .from('tasks')
      .insert(tasks);

    if (tasksError) throw tasksError;

    // Create demo OPENDECK listing
    const { data: vendor, error: vendorError } = await svc
      .from('vendors')
      .insert({
        organization_id: orgId,
        name: 'Blackwater Audio Co',
        website: 'https://blackwateraudio.co',
        contact_email: 'rentals@blackwateraudio.co',
        status: 'active',
        created_by: user.id,
        is_demo: true
      })
      .select()
      .single();

    if (vendorError) throw vendorError;

    const { error: listingError } = await svc
      .from('listings')
      .insert({
        organization_id: orgId,
        title: 'Phantom PA Stack — Rent',
        description: 'Professional-grade PA system perfect for outdoor events. Includes 4x line array speakers, subwoofers, mixing console, and all cables.',
        price: 1500,
        currency: 'USD',
        status: 'active',
        vendor_id: vendor.id,
        created_by: user.id,
        is_demo: true
      });

    if (listingError) throw listingError;

    // Create demo files (placeholder URLs)
    const files = [
      {
        organization_id: orgId,
        project_id: project.id,
        name: 'Stage Layout Plan.pdf',
        path: 'demo/stage-layout-plan.pdf',
        mime_type: 'application/pdf',
        size: 2048576,
        created_by: user.id,
        is_demo: true
      },
      {
        organization_id: orgId,
        project_id: project.id,
        name: 'Blackwater Fleet Poster.jpg',
        path: 'demo/blackwater-fleet-poster.jpg',
        mime_type: 'image/jpeg',
        size: 1024000,
        created_by: user.id,
        is_demo: true
      }
    ];

    const { error: filesError } = await svc
      .from('files')
      .insert(files);

    if (filesError) throw filesError;

    // Track telemetry
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('demo.seeded', {
        organization_id: orgId,
        project_id: project.id,
        user_id: user.id
      });
    }

    return NextResponse.json({ 
      success: true, 
      project_id: project.id,
      message: 'Demo data seeded successfully'
    });

  } catch (error: any) {
    console.error('Demo seed error:', error);
    return NextResponse.json({ 
      error: 'Failed to seed demo data',
      details: error.message 
    }, { status: 500 });
  }
}
