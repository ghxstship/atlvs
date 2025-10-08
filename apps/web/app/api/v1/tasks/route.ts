import { z } from 'zod';
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@ghxstship/auth";
import { cookies } from "next/headers";

// Validation schema for creating a task
const createTaskSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "review", "done", "blocked"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  assignee_id: z.string().uuid().optional(),
  parent_task_id: z.string().uuid().optional(),
  estimated_hours: z.number().positive().optional(),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dependencies: z.array(z.string().uuid()).optional()
});

// GET /api/v1/tasks - List all tasks for the organization
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
    const priority = searchParams.get("priority");
    const assigneeId = searchParams.get("assignee_id");
    const hasDueDate = searchParams.get("has_due_date");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    let query = supabase
      .from("project_tasks")
      .select(`
        *,
        project:projects(id, name, status),
        assignee:users!project_tasks_assignee_id_fkey(id, email, full_name),
        reporter:users!project_tasks_reporter_id_fkey(id, email, full_name)
      `, { count: "exact" })
      .eq("organization_id", orgId);

    // Apply filters
    if (projectId) query = query.eq("project_id", projectId);
    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("priority", priority);
    if (assigneeId) query = query.eq("assignee_id", assigneeId);
    if (hasDueDate === "true") query = query.not("due_date", "is", null);

    // Apply pagination
    query = query
      .order("position", { ascending: true })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: tasks, error, count } = await query;

    if (error) {
      console.error("Error fetching tasks:", error);
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: tasks,
      count,
      limit,
      offset
    });
  } catch (error) {
    console.error("Error in GET /api/v1/tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/v1/tasks - Create a new task
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
    const validationResult = createTaskSchema.safeParse(body);

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

    // Verify assignee belongs to organization if provided
    if (data.assignee_id) {
      const { data: assigneeMembership } = await supabase
        .from("memberships")
        .select("id")
        .eq("user_id", data.assignee_id)
        .eq("organization_id", orgId)
        .eq("status", "active")
        .single();

      if (!assigneeMembership) {
        return NextResponse.json(
          { error: "Assignee not found or not a member of the organization" },
          { status: 400 }
        );
      }
    }

    // Get the next position for the task
    const { data: lastTask } = await supabase
      .from("project_tasks")
      .select("position")
      .eq("project_id", data.project_id)
      .order("position", { ascending: false })
      .limit(1)
      .single();

    const position = lastTask ? lastTask.position + 1 : 0;

    // Create the task
    const { data: newTask, error: createError } = await supabase
      .from("project_tasks")
      .insert({
        organization_id: orgId,
        project_id: data.project_id,
        title: data.title,
        description: data.description || null,
        status: data.status || "todo",
        priority: data.priority || "medium",
        assignee_id: data.assignee_id || null,
        reporter_id: user.id,
        parent_task_id: data.parent_task_id || null,
        estimated_hours: data.estimated_hours || null,
        actual_hours: 0,
        start_date: data.start_date || null,
        due_date: data.due_date || null,
        tags: data.tags || null,
        dependencies: data.dependencies || null,
        position,
        created_by: user.id,
        updated_by: user.id
      })
      .select(`
        *,
        project:projects(id, name, status),
        assignee:users!project_tasks_assignee_id_fkey(id, email, full_name),
        reporter:users!project_tasks_reporter_id_fkey(id, email, full_name)
      `)
      .single();

    if (createError) {
      console.error("Error creating task:", createError);
      return NextResponse.json(
        { error: "Failed to create task" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      organization_id: orgId,
      user_id: user.id,
      resource_type: "task",
      resource_id: newTask.id,
      action: "create",
      details: {
        title: newTask.title,
        status: newTask.status,
        priority: newTask.priority
      }
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/v1/tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
