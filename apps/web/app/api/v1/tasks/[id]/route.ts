import { z } from 'zod';
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@ghxstship/auth";
import { cookies } from "next/headers";

// Validation schema for updating a task
const updateTaskSchema = z.object({
  project_id: z.string().uuid().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["todo", "in_progress", "review", "done", "blocked"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  assignee_id: z.string().uuid().nullable().optional(),
  parent_task_id: z.string().uuid().nullable().optional(),
  estimated_hours: z.number().positive().nullable().optional(),
  actual_hours: z.number().min(0).nullable().optional(),
  start_date: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  dependencies: z.array(z.string().uuid()).nullable().optional(),
  position: z.number().min(0).optional()
});

// GET /api/v1/tasks/[id] - Get a single task
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

    // Get the task
    const { data: task, error } = await supabase
      .from("project_tasks")
      .select(`
        *,
        project:projects(id, name, status),
        assignee:users!project_tasks_assignee_id_fkey(id, email, full_name),
        reporter:users!project_tasks_reporter_id_fkey(id, email, full_name),
        parent_task:project_tasks!parent_task_id(id, title),
        created_by_user:users!project_tasks_created_by_fkey(id, email, full_name),
        updated_by_user:users!project_tasks_updated_by_fkey(id, email, full_name)
      `)
      .eq("id", params.id)
      .eq("organization_id", orgId)
      .single();

    if (error || !task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error in GET /api/v1/tasks/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/tasks/[id] - Update a task
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
    const validationResult = updateTaskSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify task exists and belongs to organization
    const { data: existingTask } = await supabase
      .from("project_tasks")
      .select("id, status")
      .eq("id", params.id)
      .eq("organization_id", orgId)
      .single();

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found or access denied" },
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

    // Set completed_at if status is changing to done
    let completed_at = undefined;
    if (data.status === "done" && existingTask.status !== "done") {
      completed_at = new Date().toISOString();
    } else if (data.status && data.status !== "done") {
      completed_at = null;
    }

    // Update the task
    const updateData: Record<string, unknown> = {
      ...data,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    };

    if (completed_at !== undefined) {
      updateData.completed_at = completed_at;
    }

    const { data: updatedTask, error: updateError } = await supabase
      .from("project_tasks")
      .update(updateData)
      .eq("id", params.id)
      .select(`
        *,
        project:projects(id, name, status),
        assignee:users!project_tasks_assignee_id_fkey(id, email, full_name),
        reporter:users!project_tasks_reporter_id_fkey(id, email, full_name)
      `)
      .single();

    if (updateError) {
      console.error("Error updating task:", updateError);
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      organization_id: orgId,
      user_id: user.id,
      resource_type: "task",
      resource_id: params.id,
      action: "update",
      details: {
        changes: Object.keys(data)
      }
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error in PATCH /api/v1/tasks/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/tasks/[id] - Delete a task
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

    // Verify task exists and belongs to organization
    const { data: existingTask } = await supabase
      .from("project_tasks")
      .select("id, title, reporter_id, assignee_id")
      .eq("id", params.id)
      .eq("organization_id", orgId)
      .single();

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found or access denied" },
        { status: 404 }
      );
    }

    // Check if user can delete (admin, owner, or task reporter/assignee)
    const canDelete = ["admin", "owner"].includes(membership.role) ||
                     existingTask.reporter_id === user.id ||
                     existingTask.assignee_id === user.id;

    if (!canDelete) {
      return NextResponse.json(
        { error: "Insufficient permissions to delete this task" },
        { status: 403 }
      );
    }

    // Check for subtasks
    const { data: subtasks } = await supabase
      .from("project_tasks")
      .select("id")
      .eq("parent_task_id", params.id)
      .limit(1);

    if (subtasks && subtasks.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete task with subtasks" },
        { status: 400 }
      );
    }

    // Delete the task
    const { error: deleteError } = await supabase
      .from("project_tasks")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      console.error("Error deleting task:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete task" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      organization_id: orgId,
      user_id: user.id,
      resource_type: "task",
      resource_id: params.id,
      action: "delete",
      details: {
        title: existingTask.title
      }
    });

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/v1/tasks/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
