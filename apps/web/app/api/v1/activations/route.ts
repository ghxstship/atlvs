import { z } from 'zod';
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@ghxstship/auth";

// Validation schemas
const createActivationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(["planning", "ready", "active", "completed", "cancelled"]).default("planning"),
  activation_type: z.enum(["soft_launch", "beta", "full_launch", "pilot", "rollout"]).default("full_launch"),
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
  notes: z.string().optional().nullable()
});

const updateActivationSchema = createActivationSchema.partial();

// GET /api/v1/activations - List activations
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
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const projectId = searchParams.get("project_id");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    let query = supabase
      .from("project_activations")
      .select(`
        *,
        project:projects(id, name, status),
        created_by_user:users!project_activations_created_by_fkey(id, email, full_name),
        updated_by_user:users!project_activations_updated_by_fkey(id, email, full_name)
      `, { count: "exact" })
      .eq("organization_id", membership.organization_id)
      .order("scheduled_date", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (type) {
      query = query.eq("activation_type", type);
    }
    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data: activations, error, count } = await query;

    if (error) {
      console.error("Error fetching activations:", error);
      return NextResponse.json({ error: "Failed to fetch activations" }, { status: 500 });
    }

    return NextResponse.json({
      data: activations || [],
      count: count || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error("Error in GET /api/v1/activations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/v1/activations - Create activation
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createActivationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const activationData = validationResult.data;

    // If project_id is provided, verify it belongs to the organization
    if (activationData.project_id) {
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("id", activationData.project_id)
        .eq("organization_id", membership.organization_id)
        .maybeSingle();

      if (!project) {
        return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
      }
    }

    // Create activation
    const { data: activation, error } = await supabase
      .from("project_activations")
      .insert({
        ...activationData,
        organization_id: membership.organization_id,
        created_by: user.id,
        updated_by: user.id
      })
      .select(`
        *,
        project:projects(id, name, status)
      `)
      .single();

    if (error) {
      console.error("Error creating activation:", error);
      return NextResponse.json({ error: "Failed to create activation" }, { status: 500 });
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      organization_id: membership.organization_id,
      user_id: user.id,
      action: "create",
      resource_type: "activation",
      resource_id: activation.id,
      details: {
        name: activation.name,
        status: activation.status,
        type: activation.activation_type
      }
    });

    return NextResponse.json(activation, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/v1/activations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/v1/activations/[id] - Update activation
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const id = pathParts[pathParts.length - 1];

    if (!id || id === "activations") {
      return NextResponse.json({ error: "Activation ID is required" }, { status: 400 });
    }

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
      .eq("id", id)
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
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
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
      details: {
        updates
      }
    });

    return NextResponse.json(activation);
  } catch (error) {
    console.error("Error in PATCH /api/v1/activations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/v1/activations/[id] - Delete activation
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const id = pathParts[pathParts.length - 1];

    if (!id || id === "activations") {
      return NextResponse.json({ error: "Activation ID is required" }, { status: 400 });
    }

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
      .eq("id", id)
      .eq("organization_id", membership.organization_id)
      .maybeSingle();

    if (!existingActivation) {
      return NextResponse.json({ error: "Activation not found or access denied" }, { status: 404 });
    }

    // Delete activation
    const { error } = await supabase
      .from("project_activations")
      .delete()
      .eq("id", id);

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
      resource_id: id,
      details: {
        name: existingActivation.name
      }
    });

    return NextResponse.json({ message: "Activation deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/v1/activations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
