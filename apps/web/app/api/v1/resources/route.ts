import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAndServices } from '../../../../lib/services';
import type { TenantContext } from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ResourceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['policy', 'guide', 'training', 'template', 'procedure', 'featured']),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published', 'archived', 'under_review']).default('draft'),
  visibility: z.enum(['public', 'private', 'team', 'role_based']).default('public'),
  allowedRoles: z.array(z.string()).optional(),
  allowedTeams: z.array(z.string()).optional(),
  version: z.string().default('1.0'),
  language: z.string().default('en'),
  fileUrl: z.string().url().optional().or(z.literal('')),
  fileSize: z.number().optional(),
  fileType: z.string().optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  isFeatured: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  expiryDate: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

function getTenantContextFromRequest(req: NextRequest, userId?: string): TenantContext {
  const organizationId = req.headers.get('x-org-id') || '';
  const projectId = req.headers.get('x-project-id') || undefined;
  const rolesHeader = req.headers.get('x-roles');
  const roles = rolesHeader ? (rolesHeader.split(',').map((r) => r.trim()) as any) : [];
  if (!organizationId) throw new Error('Missing x-org-id header');
  if (!userId) throw new Error('Unauthenticated');
  return { organizationId, projectId, userId, roles };
}

export async function GET(request: NextRequest) {
  return Sentry.startSpan({ name: 'resources.list' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');
    const visibility = url.searchParams.get('visibility');
    const tags = url.searchParams.get('tags')?.split(',').filter(Boolean);
    const language = url.searchParams.get('language');
    const isFeatured = url.searchParams.get('isFeatured');
    const isPinned = url.searchParams.get('isPinned');
    const search = url.searchParams.get('search');
    const limit = Number(url.searchParams.get('limit') ?? '20');
    const offset = Number(url.searchParams.get('offset') ?? '0');

    let query = sb
      .from('resources')
      .select('*')
      .eq('organization_id', ctx.organizationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) query = query.eq('type', type);
    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (visibility) query = query.eq('visibility', visibility);
    if (language) query = query.eq('language', language);
    if (isFeatured !== null) query = query.eq('is_featured', isFeatured === 'true');
    if (isPinned !== null) query = query.eq('is_pinned', isPinned === 'true');
    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data: resources, error } = await query;

    if (error) {
      console.error('Error fetching resources:', error);
      return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
    }

    return NextResponse.json({ resources: resources || [] }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'resources.create' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'resources:create') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const validatedData = ResourceSchema.parse(body);

      const { data: resource, error } = await sb
        .from('resources')
        .insert({
          organization_id: ctx.organizationId,
          title: validatedData.title,
          description: validatedData.description,
          content: validatedData.content,
          type: validatedData.type,
          category: validatedData.category,
          tags: validatedData.tags,
          status: validatedData.status,
          visibility: validatedData.visibility,
          allowed_roles: validatedData.allowedRoles,
          allowed_teams: validatedData.allowedTeams,
          version: validatedData.version,
          language: validatedData.language,
          file_url: validatedData.fileUrl,
          file_size: validatedData.fileSize,
          file_type: validatedData.fileType,
          thumbnail_url: validatedData.thumbnailUrl,
          download_count: 0,
          view_count: 0,
          is_featured: validatedData.isFeatured,
          is_pinned: validatedData.isPinned,
          expiry_date: validatedData.expiryDate,
          metadata: validatedData.metadata,
          created_by: ctx.userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating resource:', error);
        return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
      }

      // Audit log
      await audit.record({
        occurredAt: new Date().toISOString(),
        actor: { userId: ctx.userId },
        tenant: { organizationId: ctx.organizationId },
        action: 'create',
        entity: { type: 'resource', id: resource.id },
        meta: { title: resource.title, type: resource.type, category: resource.category }
      });

      return NextResponse.json({ resource }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
      }
      console.error('Error creating resource:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function PUT(request: NextRequest) {
  return Sentry.startSpan({ name: 'resources.update' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'resources:update') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const { id, ...updateData } = body;
      
      if (!id) {
        return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
      }

      const validatedData = ResourceSchema.partial().parse(updateData);

      const updateFields: any = {
        updated_by: ctx.userId
      };

      if (validatedData.title !== undefined) updateFields.title = validatedData.title;
      if (validatedData.description !== undefined) updateFields.description = validatedData.description;
      if (validatedData.content !== undefined) updateFields.content = validatedData.content;
      if (validatedData.type !== undefined) updateFields.type = validatedData.type;
      if (validatedData.category !== undefined) updateFields.category = validatedData.category;
      if (validatedData.tags !== undefined) updateFields.tags = validatedData.tags;
      if (validatedData.status !== undefined) updateFields.status = validatedData.status;
      if (validatedData.visibility !== undefined) updateFields.visibility = validatedData.visibility;
      if (validatedData.allowedRoles !== undefined) updateFields.allowed_roles = validatedData.allowedRoles;
      if (validatedData.allowedTeams !== undefined) updateFields.allowed_teams = validatedData.allowedTeams;
      if (validatedData.version !== undefined) updateFields.version = validatedData.version;
      if (validatedData.language !== undefined) updateFields.language = validatedData.language;
      if (validatedData.fileUrl !== undefined) updateFields.file_url = validatedData.fileUrl;
      if (validatedData.fileSize !== undefined) updateFields.file_size = validatedData.fileSize;
      if (validatedData.fileType !== undefined) updateFields.file_type = validatedData.fileType;
      if (validatedData.thumbnailUrl !== undefined) updateFields.thumbnail_url = validatedData.thumbnailUrl;
      if (validatedData.isFeatured !== undefined) updateFields.is_featured = validatedData.isFeatured;
      if (validatedData.isPinned !== undefined) updateFields.is_pinned = validatedData.isPinned;
      if (validatedData.expiryDate !== undefined) updateFields.expiry_date = validatedData.expiryDate;
      if (validatedData.metadata !== undefined) updateFields.metadata = validatedData.metadata;

      const { data: resource, error } = await sb
        .from('resources')
        .update(updateFields)
        .eq('id', id)
        .eq('organization_id', ctx.organizationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating resource:', error);
        return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
      }

      // Audit log
      await audit.record({
        occurredAt: new Date().toISOString(),
        actor: { userId: ctx.userId },
        tenant: { organizationId: ctx.organizationId },
        action: 'update',
        entity: { type: 'resource', id: resource.id },
        meta: validatedData
      });

      return NextResponse.json({ resource }, { status: 200 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
      }
      console.error('Error updating resource:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function DELETE(request: NextRequest) {
  return Sentry.startSpan({ name: 'resources.delete' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'resources:delete') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    const { data: resource } = await sb
      .from('resources')
      .select('title, type')
      .eq('id', id)
      .eq('organization_id', ctx.organizationId)
      .single();

    const { error } = await sb
      .from('resources')
      .delete()
      .eq('id', id)
      .eq('organization_id', ctx.organizationId);

    if (error) {
      console.error('Error deleting resource:', error);
      return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
    }

    // Audit log
    await audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'delete',
      entity: { type: 'resource', id },
      meta: { title: resource?.title, type: resource?.type }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  });
}
