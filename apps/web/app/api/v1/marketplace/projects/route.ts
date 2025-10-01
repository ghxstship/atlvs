import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';

const projectSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(50),
  category: z.string(),
  subcategory: z.string().optional(),
  scope: z.string().min(20),
  skills_required: z.array(z.string()),
  experience_level: z.enum(['entry', 'intermediate', 'expert']),
  budget_type: z.enum(['fixed', 'hourly', 'not_specified']),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  currency: z.string().default('USD'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  duration: z.string().optional(),
  is_urgent: z.boolean().default(false),
  location_type: z.enum(['remote', 'onsite', 'hybrid']).optional(),
  visibility: z.enum(['public', 'private', 'invite_only']).default('public'),
  deliverables: z.array(z.object({
    title: z.string(),
    description: z.string(),
    due_date: z.string().optional()
  })).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    size: z.number(),
    type: z.string()
  })).optional()
});

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({
      get: (name: string) => {
        const c = cookieStore.get(name);
        return c ? { name: c.name, value: c.value } : undefined;
      },
      set: () => {},
      remove: () => {}
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const clientId = url.searchParams.get('client_id');
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = supabase
      .from('opendeck_projects')
      .select(`
        *,
        proposals:opendeck_proposals(count),
        client:users!client_id(id, email, raw_user_meta_data)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    return NextResponse.json({ projects: data || [] });
  } catch (error) {
    console.error('Error in GET /api/v1/marketplace/projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({
      get: (name: string) => {
        const c = cookieStore.get(name);
        return c ? { name: c.name, value: c.value } : undefined;
      },
      set: () => {},
      remove: () => {}
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = projectSchema.parse(body);

    const projectData = {
      ...validatedData,
      client_id: user.id,
      organization_id: body.organization_id,
      status: 'open',
      views: 0,
      proposals_count: 0
    };

    const { data, error } = await supabase
      .from('opendeck_projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    // Log activity
    await supabase.from('opendeck_analytics').insert({
      event_type: 'project_created',
      entity_type: 'project',
      entity_id: data.id,
      user_id: user.id,
      metadata: { category: data.category }
    });

    return NextResponse.json({ project: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error in POST /api/v1/marketplace/projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({
      get: (name: string) => {
        const c = cookieStore.get(name);
        return c ? { name: c.name, value: c.value } : undefined;
      },
      set: () => {},
      remove: () => {}
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Check ownership
    const { data: project } = await supabase
      .from('opendeck_projects')
      .select('client_id')
      .eq('id', id)
      .single();

    if (!project || project.client_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('opendeck_projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }

    return NextResponse.json({ project: data });
  } catch (error) {
    console.error('Error in PATCH /api/v1/marketplace/projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({
      get: (name: string) => {
        const c = cookieStore.get(name);
        return c ? { name: c.name, value: c.value } : undefined;
      },
      set: () => {},
      remove: () => {}
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Check ownership
    const { data: project } = await supabase
      .from('opendeck_projects')
      .select('client_id')
      .eq('id', id)
      .single();

    if (!project || project.client_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('opendeck_projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/v1/marketplace/projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
