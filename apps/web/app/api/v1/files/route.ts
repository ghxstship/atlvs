import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

const CREATE_ASSET_SCHEMA = z.object({
  title: z.string().min(1, 'Asset title is required'),
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
  ]),
  project_id: z.string().uuid().optional().nullable(),
  folder_id: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['active', 'archived', 'processing', 'error']).default('active'),
  access_level: z.enum(['public', 'team', 'restricted', 'private']).default('team'),
  file_url: z.string().url().optional(),
  file_size: z.number().int().nonnegative().optional(),
  file_type: z.string().optional(),
  version: z.string().default('1.0.0'),
  language: z.string().default('en'),
  is_featured: z.boolean().default(false),
  is_pinned: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional()
});

const UPDATE_ASSET_SCHEMA = CREATE_ASSET_SCHEMA.partial().refine(
  data => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update.' }
);

const BULK_UPDATE_SCHEMA = z.object({
  ids: z.array(z.string().uuid()).min(1),
  data: UPDATE_ASSET_SCHEMA
});

const BULK_DELETE_SCHEMA = z.object({
  ids: z.array(z.string().uuid()).min(1)
});

const LIST_QUERY_SCHEMA = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  category: z.string().optional(),
  status: z.string().optional(),
  access_level: z.string().optional(),
  project_id: z.string().uuid().optional(),
  folder_id: z.string().uuid().optional(),
  search: z.string().optional(),
  sort_field: z
    .string()
    .optional()
    .refine(
      value => !value || SORTABLE_FIELDS.has(value),
      value => ({ message: `Unsupported sort field: ${value}` })
    ),
  sort_direction: z.enum(['asc', 'desc']).default('desc'),
  format: z.enum(['json', 'csv']).default('json')
});

const SORTABLE_FIELDS = new Set([
  'title',
  'category',
  'status',
  'visibility',
  'created_at',
  'updated_at',
  'view_count',
  'download_count'
]);

const WRITE_ROLES = new Set(['owner', 'admin', 'manager', 'member']);
const ADMIN_ROLES = new Set(['owner', 'admin']);

type Context = {
  supabase: ReturnType<typeof createServerClient>;
  user: { id: string; email?: string | null };
  organizationId: string;
  role: string;
};

async function getContext(): Promise<Context> {
  const cookieStore = cookies();
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

class ResponseError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

function mapStatusToResource(status: string | undefined) {
  if (!status) return undefined;
  switch (status) {
    case 'active':
      return 'published';
    case 'archived':
      return 'archived';
    case 'processing':
    case 'error':
      return status;
    default:
      return status;
  }
}

function mapResourceToClientStatus(status: string | null | undefined) {
  switch (status) {
    case 'published':
      return 'active';
    default:
      return status ?? 'active';
  }
}

function mapAccessToVisibility(access: string | undefined) {
  if (!access) return undefined;
  switch (access) {
    case 'team':
      return 'team';
    case 'restricted':
      return 'restricted';
    case 'private':
      return 'private';
    case 'public':
    default:
      return 'public';
  }
}

function mapVisibilityToAccess(visibility: string | null | undefined) {
  switch (visibility) {
    case 'team':
      return 'team';
    case 'restricted':
      return 'restricted';
    case 'private':
      return 'private';
    case 'public':
    default:
      return 'public';
  }
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) {
    return 'id,title,category,status,access_level,created_at,updated_at\n';
  }

  const headers = [
    'id',
    'title',
    'description',
    'category',
    'status',
    'access_level',
    'version',
    'language',
    'view_count',
    'download_count',
    'is_featured',
    'is_pinned',
    'created_at',
    'updated_at'
  ];

  const escape = (value: unknown) => {
    if (value === null || value === undefined) return '';
    const stringValue = Array.isArray(value) ? value.join(';') : String(value);
    if (/[",\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  return [
    headers.join(','),
    ...rows.map(row => headers.map(header => escape(row[header])).join(','))
  ].join('\n');
}

async function logActivity(
  ctx: Context,
  action: string,
  details: Record<string, unknown>
) {
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

export async function GET(request: NextRequest) {
  try {
    const ctx = await getContext();
    const query = LIST_QUERY_SCHEMA.parse(Object.fromEntries(new URL(request.url).searchParams.entries()));

    let supabaseQuery = ctx.supabase
      .from('resources')
      .select(
        `
        *,
        created_by_user:users!resources_created_by_fkey(id, email, full_name)
      `,
        { count: 'exact' }
      )
      .eq('organization_id', ctx.organizationId);

    if (query.category) supabaseQuery = supabaseQuery.eq('category', query.category);
    if (query.status) supabaseQuery = supabaseQuery.eq('status', mapStatusToResource(query.status));
    if (query.access_level) supabaseQuery = supabaseQuery.eq('visibility', mapAccessToVisibility(query.access_level));
    if (query.project_id) supabaseQuery = supabaseQuery.eq('metadata->project_id', query.project_id);
    if (query.folder_id) supabaseQuery = supabaseQuery.eq('metadata->folder_id', query.folder_id);
    if (query.search) {
      const safeSearch = query.search.replace(/%/g, '');
      supabaseQuery = supabaseQuery.or(
        `title.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%,content.ilike.%${safeSearch}%`
      );
    }

    const sortField = query.sort_field ?? 'updated_at';
    supabaseQuery = supabaseQuery
      .order(sortField, { ascending: query.sort_direction === 'asc' })
      .range((query.page - 1) * query.limit, query.page * query.limit - 1);

    const { data, error, count } = await supabaseQuery;

    if (error) {
      throw new ResponseError('Failed to fetch files', 500);
    }

    const normalized = (data || []).map(item => ({
      ...item,
      status: mapResourceToClientStatus(item.status),
      access_level: mapVisibilityToAccess(item.visibility)
    }));

    await logActivity(ctx, 'files.list', {
      count: normalized.length,
      filters: query
    });

    if (query.format === 'csv') {
      const csv = toCsv(normalized as unknown as Record<string, unknown>[]);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="files-export.csv"'
        }
      });
    }

    return NextResponse.json({
      data: normalized,
      total: count ?? 0,
      page: query.page,
      per_page: query.limit,
      total_pages: Math.ceil((count ?? 0) / query.limit)
    });
  } catch (error) {
    if (error instanceof ResponseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error in GET /api/v1/files:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getContext();

    if (!WRITE_ROLES.has(ctx.role)) {
      throw new ResponseError('Insufficient permissions', 403);
    }

    const payload = CREATE_ASSET_SCHEMA.parse(await request.json());

    const { data, error } = await ctx.supabase
      .from('resources')
      .insert({
        title: payload.title,
        description: payload.description,
        content: payload.content ?? '',
        type: 'digital_asset',
        category: payload.category,
        tags: payload.tags ?? [],
        status: mapStatusToResource(payload.status) ?? 'published',
        visibility: mapAccessToVisibility(payload.access_level) ?? 'team',
        version: payload.version ?? '1.0.0',
        language: payload.language ?? 'en',
        file_url: payload.file_url ?? null,
        file_size: payload.file_size ?? null,
        file_type: payload.file_type ?? null,
        is_featured: payload.is_featured ?? false,
        is_pinned: payload.is_pinned ?? false,
        metadata: {
          ...payload.metadata,
          project_id: payload.project_id ?? null,
          folder_id: payload.folder_id ?? null
        },
        organization_id: ctx.organizationId,
        created_by: ctx.user.id,
        updated_by: ctx.user.id,
        view_count: 0,
        download_count: 0
      })
      .select(
        `
        *,
        created_by_user:users!resources_created_by_fkey(id, email, full_name)
      `
      )
      .single();

    if (error || !data) {
      throw new ResponseError('Failed to create file', 500);
    }

    const normalized = {
      ...data,
      status: mapResourceToClientStatus(data.status),
      access_level: mapVisibilityToAccess(data.visibility)
    };

    await logActivity(ctx, 'files.create', {
      resource_id: data.id,
      title: data.title,
      category: data.category
    });

    return NextResponse.json(normalized, { status: 201 });
  } catch (error) {
    if (error instanceof ResponseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Error in POST /api/v1/files:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getContext();

    if (!WRITE_ROLES.has(ctx.role)) {
      throw new ResponseError('Insufficient permissions', 403);
    }

    const { ids, data } = BULK_UPDATE_SCHEMA.parse(await request.json());

    const updatePayload = {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.tags !== undefined ? { tags: data.tags } : {}),
      ...(data.status !== undefined ? { status: mapStatusToResource(data.status) } : {}),
      ...(data.access_level !== undefined ? { visibility: mapAccessToVisibility(data.access_level) } : {}),
      ...(data.version !== undefined ? { version: data.version } : {}),
      ...(data.language !== undefined ? { language: data.language } : {}),
      ...(data.file_url !== undefined ? { file_url: data.file_url } : {}),
      ...(data.file_size !== undefined ? { file_size: data.file_size } : {}),
      ...(data.file_type !== undefined ? { file_type: data.file_type } : {}),
      ...(data.is_featured !== undefined ? { is_featured: data.is_featured } : {}),
      ...(data.is_pinned !== undefined ? { is_pinned: data.is_pinned } : {}),
      ...(data.metadata !== undefined || data.project_id !== undefined || data.folder_id !== undefined
        ? {
            metadata: {
              ...(data.metadata ?? {}),
              ...(data.project_id !== undefined ? { project_id: data.project_id } : {}),
              ...(data.folder_id !== undefined ? { folder_id: data.folder_id } : {})
            }
          }
        : {}),
      updated_by: ctx.user.id,
      updated_at: new Date().toISOString()
    };

    const { data: updated, error } = await ctx.supabase
      .from('resources')
      .update(updatePayload)
      .in('id', ids)
      .eq('organization_id', ctx.organizationId)
      .select('id, title, status, visibility');

    if (error) {
      throw new ResponseError('Failed to update files', 500);
    }

    await logActivity(ctx, 'files.bulk_update', {
      ids,
      updates: updatePayload
    });

    return NextResponse.json({
      updated: (updated || []).map(item => ({
        id: item.id,
        status: mapResourceToClientStatus(item.status),
        access_level: mapVisibilityToAccess(item.visibility)
      }))
    });
  } catch (error) {
    if (error instanceof ResponseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Error in PATCH /api/v1/files:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getContext();

    if (!ADMIN_ROLES.has(ctx.role)) {
      throw new ResponseError('Insufficient permissions', 403);
    }

    const body = await request.json().catch(() => ({}));
    const bodyIds = BULK_DELETE_SCHEMA.safeParse(body);

    let ids: string[] | null = null;
    if (bodyIds.success) {
      ids = bodyIds.data.ids;
    } else {
      const queryIds = new URL(request.url).searchParams.getAll('id');
      if (queryIds.length > 0) {
        ids = queryIds;
      }
    }

    if (!ids || ids.length === 0) {
      throw new ResponseError('No file ids provided for deletion', 400);
    }

    const { data: existing } = await ctx.supabase
      .from('resources')
      .select('id, title')
      .in('id', ids)
      .eq('organization_id', ctx.organizationId);

    if (!existing || existing.length === 0) {
      return NextResponse.json({ deleted: [] });
    }

    const { error } = await ctx.supabase
      .from('resources')
      .delete()
      .in('id', existing.map(item => item.id))
      .eq('organization_id', ctx.organizationId);

    if (error) {
      throw new ResponseError('Failed to delete files', 500);
    }

    await logActivity(ctx, 'files.bulk_delete', {
      ids: existing.map(item => item.id),
      titles: existing.map(item => item.title)
    });

    return NextResponse.json({ deleted: existing.map(item => item.id) });
  } catch (error) {
    if (error instanceof ResponseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Error in DELETE /api/v1/files:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

