import { z } from 'zod';
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@ghxstship/auth";
import { cookies } from "next/headers";

// Validation schema for creating a milestone
const createMilestoneSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  due_date: z.string(),
  status: z.enum(["pending", "completed", "overdue"]).optional(),
  progress: z.number().min(0).max(100).optional(),
  dependencies: z.array(z.string().uuid()).optional()
});

// GET /api/v1/milestones - List all milestones for the organization
export async function GET(request: NextRequest) {
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

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get("project_id");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    let query = supabase
      .from("project_milestones")
      .select(`
        *,
        project:projects(id, name, status)
      `, { count: "exact" })
      .eq("organization_id", orgId);

    // Apply filters
    if (projectId) query = query.eq("project_id", projectId);
    if (status) query = query.eq("status", status);

    // Apply pagination
    query = query
      .order("due_date", { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: milestones, error, count } = await query;

    if (error) {
      console.error("Error fetching milestones:", error);
      return NextResponse.json(
        { error: "Failed to fetch milestones" },
        { status: 500 }
      );
    }

    // Update overdue status
    const today = new Date();
    const updatedMilestones = (milestones || []).map(m => {
      if (m.status === "pending" && new Date(m.due_date) < today) {
        return { ...m, status: "overdue" };
      }
      return m;
    });

    return NextResponse.json({
      data: updatedMilestones,
      count,
      limit,
      offset
    });
  } catch (error) {
    console.error("Error in GET /api/v1/milestones:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/v1/milestones - Create a new milestone
export async function POST(request: NextRequest) {
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
    const validationResult = createMilestoneSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify project belongs to organization
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

    // Determine initial status
    const today = new Date();
    const dueDate = new Date(data.due_date);
    let status = data.status || "pending";
    
    if (data.progress === 100) {
      status = "completed";
    } else if (dueDate < today && data.progress !== 100) {
      status = "overdue";
    }

    // Create the milestone
    const { data: newMilestone, error: createError } = await supabase
      .from("project_milestones")
      .insert({
        organization_id: orgId,
        project_id: data.project_id,
        title: data.title,
        description: data.description || null,
        due_date: data.due_date,
        status,
        progress: data.progress || 0,
        dependencies: data.dependencies || null,
        completed_at: data.progress === 100 ? new Date().toISOString() : null,
        created_by: user.id,
        updated_by: user.id
      })
      .select(`
        *,
        project:projects(id, name, status)
      `)
      .single();

    if (createError) {
      console.error("Error creating milestone:", createError);
      return NextResponse.json(
        { error: "Failed to create milestone" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      organization_id: orgId,
      user_id: user.id,
      resource_type: "milestone",
      resource_id: newMilestone.id,
      action: "create",
      details: {
        title: newMilestone.title,
        due_date: newMilestone.due_date
      }
    });

    return NextResponse.json(newMilestone, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/v1/milestones:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
