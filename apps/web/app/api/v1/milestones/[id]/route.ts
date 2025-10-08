import { z } from 'zod';
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@ghxstship/auth";
import { cookies } from "next/headers";

// Validation schema for updating a milestone
const updateMilestoneSchema = z.object({
  project_id: z.string().uuid().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  due_date: z.string().optional(),
  status: z.enum(["pending", "completed", "overdue"]).optional(),
  progress: z.number().min(0).max(100).optional(),
  dependencies: z.array(z.string().uuid()).nullable().optional()
});

// GET /api/v1/milestones/[id] - Get a single milestone
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get organization ID from headers
    const orgId = request.headers.get("x-organization-id");
    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID required" },
        { status: 400 }
      );
    }

    // Verify user belongs to organization
    const { data: membership } = await supabase
      .from("memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("organization_id", orgId)
      .eq("status", "active")
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Get the milestone
    const { data: milestone, error } = await supabase
      .from("project_milestones")
      .select(`
        *,
        project:projects(id, name, status),
        created_by_user:users!project_milestones_created_by_fkey(id, email, full_name),
        updated_by_user:users!project_milestones_updated_by_fkey(id, email, full_name)
      `)
      .eq("id", params.id)
      .eq("organization_id", orgId)
      .single();

    if (error || !milestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    // Update status if overdue
    const today = new Date();
    if (milestone.status === "pending" && new Date(milestone.due_date) < today) {
      milestone.status = "overdue";
    }

    return NextResponse.json(milestone);
  } catch (error) {
    console.error("Error in GET /api/v1/milestones/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/milestones/[id] - Update a milestone
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get organization ID from headers
    const orgId = request.headers.get("x-organization-id");
    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID required" },
        { status: 400 }
      );
    }

    // Verify user belongs to organization
    const { data: membership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", orgId)
      .eq("status", "active")
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateMilestoneSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify milestone exists and belongs to organization
    const { data: existingMilestone } = await supabase
      .from("project_milestones")
      .select("id, progress, due_date")
      .eq("id", params.id)
      .eq("organization_id", orgId)
      .single();

    if (!existingMilestone) {
      return NextResponse.json(
        { error: "Milestone not found or access denied" },
        { status: 404 }
      );
    }

    // If project_id is being updated, verify new project belongs to organization
    if (data.project_id) {
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("id", data.project_id)
        .eq("organization_id", orgId)
        .single();

      if (!project) {
        return NextResponse.json(
          { error: "Project not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Determine status based on progress and due date
    let status = data.status;
    const progress = data.progress !== undefined ? data.progress : existingMilestone.progress;
    const dueDate = data.due_date || existingMilestone.due_date;
    const today = new Date();

    if (progress === 100) {
      status = "completed";
    } else if (new Date(dueDate) < today && progress < 100) {
      status = "overdue";
    } else if (progress < 100) {
      status = "pending";
    }

    // Set completed_at if progress is 100
    let completed_at = undefined;
    if (progress === 100 && existingMilestone.progress !== 100) {
      completed_at = new Date().toISOString();
    } else if (progress < 100) {
      completed_at = null;
    }

    // Update the milestone
    const updateData: unknown = {
      ...data,
      status,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    };

    if (completed_at !== undefined) {
      updateData.completed_at = completed_at;
    }

    const { data: updatedMilestone, error: updateError } = await supabase
      .from("project_milestones")
      .update(updateData)
      .eq("id", params.id)
      .select(`
        *,
        project:projects(id, name, status)
      `)
      .single();

    if (updateError) {
      console.error("Error updating milestone:", updateError);
      return NextResponse.json(
        { error: "Failed to update milestone" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      organization_id: orgId,
      user_id: user.id,
      resource_type: "milestone",
      resource_id: params.id,
      action: "update",
      details: {
        changes: Object.keys(data)
      }
    });

    return NextResponse.json(updatedMilestone);
  } catch (error) {
    console.error("Error in PATCH /api/v1/milestones/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/milestones/[id] - Delete a milestone
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get organization ID from headers
    const orgId = request.headers.get("x-organization-id");
    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID required" },
        { status: 400 }
      );
    }

    // Verify user belongs to organization with proper role
    const { data: membership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", orgId)
      .eq("status", "active")
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Check if user has permission to delete (admin or owner only)
    if (!["admin", "owner"].includes(membership.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Verify milestone exists and belongs to organization
    const { data: existingMilestone } = await supabase
      .from("project_milestones")
      .select("id, title")
      .eq("id", params.id)
      .eq("organization_id", orgId)
      .single();

    if (!existingMilestone) {
      return NextResponse.json(
        { error: "Milestone not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the milestone
    const { error: deleteError } = await supabase
      .from("project_milestones")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      console.error("Error deleting milestone:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete milestone" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      organization_id: orgId,
      user_id: user.id,
      resource_type: "milestone",
      resource_id: params.id,
      action: "delete",
      details: {
        title: existingMilestone.title
      }
    });

    return NextResponse.json(
      { message: "Milestone deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/v1/milestones/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
