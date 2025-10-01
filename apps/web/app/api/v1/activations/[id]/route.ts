import { z } from 'zod';
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@ghxstship/auth";

// Validation schema for updates
const updateActivationSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["planning", "ready", "active", "completed", "cancelled"]).optional(),
  activation_type: z.enum(["soft_launch", "beta", "full_launch", "pilot", "rollout"]).optional(),
  project_id: z.string().uuid().optional().nullable(),
  scheduled_date: z.string().optional().nullable(),
  actual_date: z.string().optional().nullable(),
  completion_date: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  budget: z.number().optional().nullable(),
  actual_cost: z.number().optional().nullable(),
  success_metrics: z.record(z.any()).optional(),
  stakeholders: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  risks: z.array(z.string()).optional(),
  notes: z.string().optional().nullable(),
});

// GET /api/v1/activations/[id] - Get single activation
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

    // Fetch activation with related data
    const { data: activation, error } = await supabase
      .from("project_activations")
      .select(`
        *,
        project:projects(id, name, status),
        created_by_user:users!project_activations_created_by_fkey(id, email, full_name),
        updated_by_user:users!project_activations_updated_by_fkey(id, email, full_name)
      `)
      .eq("id", params.id)
      .eq("organization_id", membership.organization_id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching activation:", error);
      return NextResponse.json({ error: "Failed to fetch activation" }, { status: 500 });
    }

    if (!activation) {
      return NextResponse.json({ error: "Activation not found" }, { status: 404 });
    }

    return NextResponse.json(activation);
  } catch (error) {
    console.error("Error in GET /api/v1/activations/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/v1/activations/[id] - Update activation
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

    // Verify activation exists and belongs to organization
    const { data: existingActivation } = await supabase
      .from("project_activations")
      .select("id")
      .eq("id", params.id)
      .eq("organization_id", membership.organization_id)
      .maybeSingle();

    if (!existingActivation) {
      return NextResponse.json({ error: "Activation not found or access denied" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateActivationSchema.safeParse(body);

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

    // Update activation
    const { data: activation, error } = await supabase
      .from("project_activations")
      .update({
        ...updates,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select(`
        *,
        project:projects(id, name, status)
      `)
      .single();

    if (error) {
      console.error("Error updating activation:", error);
      return NextResponse.json({ error: "Failed to update activation" }, { status: 500 });
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      organization_id: membership.organization_id,
      user_id: user.id,
      action: "update",
      resource_type: "activation",
      resource_id: activation.id,
      details: { updates },
    });

    return NextResponse.json(activation);
  } catch (error) {
    console.error("Error in PATCH /api/v1/activations/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/v1/activations/[id] - Delete activation
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

    // Verify activation exists and belongs to organization
    const { data: existingActivation } = await supabase
      .from("project_activations")
      .select("id, name")
      .eq("id", params.id)
      .eq("organization_id", membership.organization_id)
      .maybeSingle();

    if (!existingActivation) {
      return NextResponse.json({ error: "Activation not found or access denied" }, { status: 404 });
    }

    // Delete activation
    const { error } = await supabase
      .from("project_activations")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Error deleting activation:", error);
      return NextResponse.json({ error: "Failed to delete activation" }, { status: 500 });
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      organization_id: membership.organization_id,
      user_id: user.id,
      action: "delete",
      resource_type: "activation",
      resource_id: params.id,
      details: {
        name: existingActivation.name,
      },
    });

    return NextResponse.json({ message: "Activation deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/v1/activations/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
