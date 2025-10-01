import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

const UPDATE_ASSET_SCHEMA = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  category: z.enum([
    'document',
    'image',
    'video',
    'audio',
    'drawing',
    'specification',
    'report',
    'template',
    'policy',
    'contract',
    'other'
  ]).optional(),
  project_id: z.string().uuid().optional().nullable(),
  folder_id: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['active', 'archived', 'processing', 'error']).optional(),
  access_level: z.enum(['public', 'team', 'restricted', 'private']).optional(),
  version: z.string().optional(),
  language: z.string().optional(),
  file_url: z.string().url().optional(),
  file_size: z.number().int().nonnegative().optional(),
  file_type: z.string().optional(),
  is_featured: z.boolean().optional(),
  is_pinned: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional()
});

const WRITE_ROLES = new Set(['owner', 'admin', 'manager', 'member']);
const ADMIN_ROLES = new Set(['owner', 'admin']);

class ResponseError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function getContext() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new ResponseError('Unauthorized', 401);
  }

  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    throw new ResponseError('Organization membership required', 403);
  }

  return {
    supabase,
    user: { id: user.id, email: user.email },
    organizationId: membership.organization_id,
    role: membership.role
  };
}

function mapStatusToResource(status: string | undefined) {
  if (!status) return undefined;
  return status === 'active' ? 'published' : status;
}

function mapResourceToClientStatus(status: string | null | undefined) {
  return status === 'published' ? 'active' : status ?? 'active';
}

function mapAccessToVisibility(access: string | undefined) {
  if (!access) return undefined;
  return access;
}

function mapVisibilityToAccess(visibility: string | null | undefined) {
  return visibility ?? 'public';
}

async function logActivity(ctx: Awaited<ReturnType<typeof getContext>>, action: string, details: Record<string, unknown>) {
  try {
    await ctx.supabase.from('activity_logs').insert({
      organization_id: ctx.organizationId,
      user_id: ctx.user.id,
      action,
      resource_type: 'file',
      details
    });
  } catch (error) {
    console.error(`Failed to log activity for action ${action}:`, error);
  }
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await getContext();

    const { data: file, error } = await ctx.supabase
      .from('resources')
      .select(
        `
        *,
        created_by_user:users!resources_created_by_fkey(id, email, full_name)
      `
      )
      .eq('id', params.id)
      .eq('organization_id', ctx.organizationId)
      .maybeSingle();

    if (error) {
      throw new ResponseError('Failed to fetch file', 500);
    }

    if (!file) {
      throw new ResponseError('File not found', 404);
    }

    await logActivity(ctx, 'files.view', {
      resource_id: file.id,
      title: file.title
    });

    return NextResponse.json({
      ...file,
      status: mapResourceToClientStatus(file.status),
      access_level: mapVisibilityToAccess(file.visibility)
    });
  } catch (error) {
    if (error instanceof ResponseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error in GET /api/v1/files/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await getContext();

    if (!WRITE_ROLES.has(ctx.role)) {
      throw new ResponseError('Insufficient permissions', 403);
    }

    const payload = UPDATE_ASSET_SCHEMA.parse(await request.json());

    const { data: existing, error: existingError } = await ctx.supabase
      .from('resources')
      .select('id')
      .eq('id', params.id)
      .eq('organization_id', ctx.organizationId)
      .maybeSingle();

    if (existingError) {
      throw new ResponseError('Failed to fetch file', 500);
    }

    if (!existing) {
      throw new ResponseError('File not found', 404);
    }

    const updatePayload = {
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.content !== undefined ? { content: payload.content } : {}),
      ...(payload.category !== undefined ? { category: payload.category } : {}),
      ...(payload.tags !== undefined ? { tags: payload.tags } : {}),
      ...(payload.status !== undefined ? { status: mapStatusToResource(payload.status) } : {}),
      ...(payload.access_level !== undefined ? { visibility: mapAccessToVisibility(payload.access_level) } : {}),
      ...(payload.version !== undefined ? { version: payload.version } : {}),
      ...(payload.language !== undefined ? { language: payload.language } : {}),
      ...(payload.file_url !== undefined ? { file_url: payload.file_url } : {}),
      ...(payload.file_size !== undefined ? { file_size: payload.file_size } : {}),
      ...(payload.file_type !== undefined ? { file_type: payload.file_type } : {}),
      ...(payload.is_featured !== undefined ? { is_featured: payload.is_featured } : {}),
      ...(payload.is_pinned !== undefined ? { is_pinned: payload.is_pinned } : {}),
      ...(payload.metadata !== undefined || payload.project_id !== undefined || payload.folder_id !== undefined
        ? {
            metadata: {
              ...(payload.metadata ?? {}),
              ...(payload.project_id !== undefined ? { project_id: payload.project_id } : {}),
              ...(payload.folder_id !== undefined ? { folder_id: payload.folder_id } : {})
            }
          }
        : {}),
      updated_by: ctx.user.id,
      updated_at: new Date().toISOString()
    };

    const { data: updated, error } = await ctx.supabase
      .from('resources')
      .update(updatePayload)
      .eq('id', params.id)
      .eq('organization_id', ctx.organizationId)
      .select(
        `
        *,
        created_by_user:users!resources_created_by_fkey(id, email, full_name)
      `
      )
      .maybeSingle();

    if (error) {
      throw new ResponseError('Failed to update file', 500);
    }

    if (!updated) {
      throw new ResponseError('File not found', 404);
    }

    await logActivity(ctx, 'files.update', {
      resource_id: updated.id,
      updates: updatePayload
    });

    return NextResponse.json({
      ...updated,
      status: mapResourceToClientStatus(updated.status),
      access_level: mapVisibilityToAccess(updated.visibility)
    });
  } catch (error) {
    if (error instanceof ResponseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Error in PATCH /api/v1/files/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await getContext();

    if (!ADMIN_ROLES.has(ctx.role)) {
      throw new ResponseError('Insufficient permissions', 403);
    }

    const { data: existing, error } = await ctx.supabase
      .from('resources')
      .select('id, title')
      .eq('id', params.id)
      .eq('organization_id', ctx.organizationId)
      .maybeSingle();

    if (error) {
      throw new ResponseError('Failed to fetch file', 500);
    }

    if (!existing) {
      throw new ResponseError('File not found', 404);
    }

    const { error: deleteError } = await ctx.supabase
      .from('resources')
      .delete()
      .eq('id', existing.id)
      .eq('organization_id', ctx.organizationId);

    if (deleteError) {
      throw new ResponseError('Failed to delete file', 500);
    }

    await logActivity(ctx, 'files.delete', {
      resource_id: existing.id,
      title: existing.title
    });

    return NextResponse.json({ deleted: existing.id });
  } catch (error) {
    if (error instanceof ResponseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error in DELETE /api/v1/files/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


