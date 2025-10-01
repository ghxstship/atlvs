import { z } from 'zod';
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@ghxstship/auth";

// Validation schemas
const createInspectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["safety", "quality", "compliance", "progress", "final"]),
  project_id: z.string().uuid().optional().nullable(),
  scheduled_date: z.string().datetime(),
  inspector_id: z.string().uuid(),
  location: z.string().optional(),
  follow_up_required: z.boolean().default(false),
  follow_up_date: z.string().date().optional().nullable(),
  checklist_items: z.array(z.object({
    id: z.string(),
    category: z.string(),
    item: z.string(),
    status: z.enum(["pass", "fail", "na", "pending"]).default("pending"),
    notes: z.string().optional().nullable(),
  })).optional(),
});

const updateInspectionSchema = createInspectionSchema.partial().extend({
  status: z.enum(["scheduled", "in_progress", "completed", "failed", "cancelled"]).optional(),
  completed_date: z.string().datetime().optional().nullable(),
  score: z.number().min(0).max(100).optional().nullable(),
  is_passed: z.boolean().optional(),
  findings: z.string().optional().nullable(),
  recommendations: z.string().optional().nullable(),
  attachments: z.array(z.string()).optional(),
});

// GET /api/v1/inspections - List inspections
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
    const { data: membership } = await supabase
      .from("memberships")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: "No active organization membership" }, { status: 403 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get("project_id");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const inspectorId = searchParams.get("inspector_id");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    let query = supabase
      .from("project_inspections")
      .select(`
        *,
        project:projects(id, name, status),
        inspector:users!project_inspections_inspector_id_fkey(id, email, full_name)
      `, { count: "exact" })
      .eq("organization_id", membership.organization_id)
      .order("scheduled_date", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (projectId) {
      query = query.eq("project_id", projectId);
    }
    if (type) {
      query = query.eq("type", type);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (inspectorId) {
      query = query.eq("inspector_id", inspectorId);
    }

    const { data: inspections, error, count } = await query;

    if (error) {
      console.error("Error fetching inspections:", error);
      return NextResponse.json({ error: "Failed to fetch inspections" }, { status: 500 });
    }

    return NextResponse.json({
      data: inspections || [],
      count: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error in GET /api/v1/inspections:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/v1/inspections - Create inspection
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
    const { data: membership } = await supabase
      .from("memberships")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: "No active organization membership" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createInspectionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const inspectionData = validationResult.data;

    // If project_id is provided, verify it belongs to the organization
    if (inspectionData.project_id) {
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("id", inspectionData.project_id)
        .eq("organization_id", membership.organization_id)
        .maybeSingle();

      if (!project) {
        return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
      }
    }

    // Verify inspector belongs to the organization
    const { data: inspector } = await supabase
      .from("memberships")
      .select("user_id")
      .eq("user_id", inspectionData.inspector_id)
      .eq("organization_id", membership.organization_id)
      .eq("status", "active")
      .maybeSingle();

    if (!inspector) {
      return NextResponse.json({ error: "Inspector not found or not in organization" }, { status: 404 });
    }

    // Create inspection
    const { data: inspection, error } = await supabase
      .from("project_inspections")
      .insert({
        ...inspectionData,
        organization_id: membership.organization_id,
        status: "scheduled",
        is_passed: false,
        created_by: user.id,
      })
      .select(`
        *,
        project:projects(id, name, status),
        inspector:users!project_inspections_inspector_id_fkey(id, email, full_name)
      `)
      .single();

    if (error) {
      console.error("Error creating inspection:", error);
      return NextResponse.json({ error: "Failed to create inspection" }, { status: 500 });
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      organization_id: membership.organization_id,
      user_id: user.id,
      action: "create",
      resource_type: "inspection",
      resource_id: inspection.id,
      details: {
        title: inspection.title,
        type: inspection.type,
        scheduled_date: inspection.scheduled_date,
      },
    });

    return NextResponse.json(inspection, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/v1/inspections:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
