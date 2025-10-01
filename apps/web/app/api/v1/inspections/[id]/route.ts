import { z } from 'zod';
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@ghxstship/auth";

// Validation schema for updates
const updateInspectionSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["safety", "quality", "compliance", "progress", "final"]).optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "failed", "cancelled"]).optional(),
  project_id: z.string().uuid().optional().nullable(),
  scheduled_date: z.string().datetime().optional(),
  completed_date: z.string().datetime().optional().nullable(),
  inspector_id: z.string().uuid().optional(),
  location: z.string().optional(),
  score: z.number().min(0).max(100).optional().nullable(),
  is_passed: z.boolean().optional(),
  findings: z.string().optional().nullable(),
  recommendations: z.string().optional().nullable(),
  follow_up_required: z.boolean().optional(),
  follow_up_date: z.string().date().optional().nullable(),
  checklist_items: z.array(z.object({
    id: z.string(),
    category: z.string(),
    item: z.string(),
    status: z.enum(["pass", "fail", "na", "pending"]),
    notes: z.string().optional().nullable(),
  })).optional(),
  attachments: z.array(z.string()).optional(),
});

// GET /api/v1/inspections/[id] - Get single inspection
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: "No active organization membership" }, { status: 403 });
    }

    // Fetch inspection with related data
    const { data: inspection, error } = await supabase
      .from("project_inspections")
      .select(`
        *,
        project:projects(id, name, status),
        inspector:users!project_inspections_inspector_id_fkey(id, email, full_name)
      `)
      .eq("id", params.id)
      .eq("organization_id", membership.organization_id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching inspection:", error);
      return NextResponse.json({ error: "Failed to fetch inspection" }, { status: 500 });
    }

    if (!inspection) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
    }

    return NextResponse.json(inspection);
  } catch (error) {
    console.error("Error in GET /api/v1/inspections/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/v1/inspections/[id] - Update inspection
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify inspection exists and belongs to organization
    const { data: existingInspection } = await supabase
      .from("project_inspections")
      .select("id, status")
      .eq("id", params.id)
      .eq("organization_id", membership.organization_id)
      .maybeSingle();

    if (!existingInspection) {
      return NextResponse.json({ error: "Inspection not found or access denied" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateInspectionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const updates = validationResult.data;

    // If project_id is being updated, verify it belongs to the organization
    if (updates.project_id) {
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("id", updates.project_id)
        .eq("organization_id", membership.organization_id)
        .maybeSingle();

      if (!project) {
        return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
      }
    }

    // If inspector_id is being updated, verify they belong to the organization
    if (updates.inspector_id) {
      const { data: inspector } = await supabase
        .from("memberships")
        .select("user_id")
        .eq("user_id", updates.inspector_id)
        .eq("organization_id", membership.organization_id)
        .eq("status", "active")
        .maybeSingle();

      if (!inspector) {
        return NextResponse.json({ error: "Inspector not found or not in organization" }, { status: 404 });
      }
    }

    // If status is being changed to completed, set completed_date if not provided
    if (updates.status === "completed" && !updates.completed_date) {
      updates.completed_date = new Date().toISOString();
    }

    // Update inspection
    const { data: inspection, error } = await supabase
      .from("project_inspections")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq("id", params.id)
      .select(`
        *,
        project:projects(id, name, status),
        inspector:users!project_inspections_inspector_id_fkey(id, email, full_name)
      `)
      .single();

    if (error) {
      console.error("Error updating inspection:", error);
      return NextResponse.json({ error: "Failed to update inspection" }, { status: 500 });
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      organization_id: membership.organization_id,
      user_id: user.id,
      action: "update",
      resource_type: "inspection",
      resource_id: inspection.id,
      details: { updates },
    });

    return NextResponse.json(inspection);
  } catch (error) {
    console.error("Error in PATCH /api/v1/inspections/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/v1/inspections/[id] - Delete inspection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization and check permissions
    const { data: membership } = await supabase
      .from("memberships")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: "No active organization membership" }, { status: 403 });
    }

    // Check if user has permission to delete (admin or owner only)
    if (!["admin", "owner"].includes(membership.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Verify inspection exists and belongs to organization
    const { data: existingInspection } = await supabase
      .from("project_inspections")
      .select("id, title")
      .eq("id", params.id)
      .eq("organization_id", membership.organization_id)
      .maybeSingle();

    if (!existingInspection) {
      return NextResponse.json({ error: "Inspection not found or access denied" }, { status: 404 });
    }

    // Delete inspection
    const { error } = await supabase
      .from("project_inspections")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Error deleting inspection:", error);
      return NextResponse.json({ error: "Failed to delete inspection" }, { status: 500 });
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      organization_id: membership.organization_id,
      user_id: user.id,
      action: "delete",
      resource_type: "inspection",
      resource_id: params.id,
      details: {
        title: existingInspection.title,
      },
    });

    return NextResponse.json({ message: "Inspection deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/v1/inspections/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
