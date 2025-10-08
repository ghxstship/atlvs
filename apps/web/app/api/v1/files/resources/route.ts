import { z } from 'zod';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateResourceSchema = z.object({
  title: z.string().min(1, 'Resource title is required'),
  description: z.string().optional(),
  content: z.string().optional(),
  type: z.enum(['document', 'template', 'guide', 'policy', 'procedure', 'training', 'other']),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  visibility: z.enum(['public', 'private', 'team', 'role']).default('private'),
  fileUrl: z.string().url().optional().or(z.literal('')),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  version: z.string().default('1.0.0'),
  expiryDate: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

const UpdateResourceSchema = CreateResourceSchema.partial();

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

export async function GET(request: NextRequest) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const visibility = searchParams.get('visibility');
    const tags = searchParams.get('tags');
    const search = searchParams.get('search');

    let query = supabase
      .from('resources')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (visibility) query = query.eq('visibility', visibility);
    if (tags) {
      const tagArray = tags.split(',');
      query = query.contains('tags', tagArray);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: resources, error } = await query;

    if (error) {
      console.error('Resources fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'resources.list',
      resource_type: 'resource',
      details: { count: resources?.length || 0, filters: { type, category, status, visibility, tags, search } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ resources: resources || [] });

  } catch (error) {
    console.error('Resources GET error:', error);
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
    const resourceData = CreateResourceSchema.parse(body);

    const { data: resource, error } = await supabase
      .from('resources')
      .insert({
        ...resourceData,
        organization_id: orgId,
        created_by: user.id,
        view_count: 0,
        download_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Resource creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'resources.create',
      resource_type: 'resource',
      resource_id: resource.id,
      details: { title: resource.title, type: resource.type, status: resource.status },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ resource }, { status: 201 });

  } catch (error) {
    console.error('Resources POST error:', error);
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
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    const resourceData = UpdateResourceSchema.parse(updateData);

    const { data: resource, error } = await supabase
      .from('resources')
      .update({
        ...resourceData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Resource update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'resources.update',
      resource_type: 'resource',
      resource_id: resource.id,
      details: { updated_fields: Object.keys(resourceData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ resource });

  } catch (error) {
    console.error('Resources PUT error:', error);
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
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    const { data: resource } = await supabase
      .from('resources')
      .select('title')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Resource deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'resources.delete',
      resource_type: 'resource',
      resource_id: id,
      details: { title: resource?.title || 'Unknown' },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Resources DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
