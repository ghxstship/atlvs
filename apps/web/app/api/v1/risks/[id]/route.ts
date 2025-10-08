import { z } from 'zod';
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@ghxstship/auth";
import { cookies } from "next/headers";

// Validation schema for updating a risk
const updateRiskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  category: z.enum(["technical", "financial", "operational", "legal", "environmental", "safety"]).optional(),
  probability: z.enum(["very_low", "low", "medium", "high", "very_high"]).optional(),
  impact: z.enum(["very_low", "low", "medium", "high", "very_high"]).optional(),
  status: z.enum(["identified", "assessed", "mitigated", "closed"]).optional(),
  owner_id: z.string().uuid().nullable().optional(),
  mitigation_plan: z.string().nullable().optional(),
  contingency_plan: z.string().nullable().optional(),
  identified_date: z.string().optional(),
  review_date: z.string().nullable().optional(),
  closed_date: z.string().nullable().optional()
});

// GET /api/v1/risks/[id] - Get a single risk
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

    // Get the risk
    const { data: risk, error } = await supabase
      .from("project_risks")
      .select(`
        *,
        project:projects(id, name, status),
        owner:users!project_risks_owner_id_fkey(id, email, full_name),
        created_by_user:users!project_risks_created_by_fkey(id, email, full_name),
        updated_by_user:users!project_risks_updated_by_fkey(id, email, full_name)
      `)
      .eq("id", params.id)
      .eq("organization_id", orgId)
      .single();

    if (error || !risk) {
      return NextResponse.json(
        { error: "Risk not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(risk);
  } catch (error) {
    console.error("Error in GET /api/v1/risks/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/risks/[id] - Update a risk
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
    const validationResult = updateRiskSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify risk exists and belongs to organization
    const { data: existingRisk } = await supabase
      .from("project_risks")
      .select("id, probability, impact")
      .eq("id", params.id)
      .eq("organization_id", orgId)
      .single();

    if (!existingRisk) {
      return NextResponse.json(
        { error: "Risk not found or access denied" },
        { status: 404 }
      );
    }

    // Calculate new risk score if probability or impact changed
    let riskScore = undefined;
    if (data.probability || data.impact) {
      const probMap: Record<string, number> = {
        very_low: 1,
        low: 2,
        medium: 3,
        high: 4,
        very_high: 5
      };
      const probability = data.probability || existingRisk.probability;
      const impact = data.impact || existingRisk.impact;
      riskScore = probMap[probability] * probMap[impact];
    }

    // Set closed date if status is being changed to closed
    let closedDate = data.closed_date;
    if (data.status === "closed" && !closedDate) {
      closedDate = new Date().toISOString().split("T")[0];
    }

    // Update the risk
    const updateData: Record<string, unknown> = {
      ...data,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    };
    
    if (riskScore !== undefined) {
      updateData.risk_score = riskScore;
    }
    
    if (closedDate !== undefined) {
      updateData.closed_date = closedDate;
    }

    const { data: updatedRisk, error: updateError } = await supabase
      .from("project_risks")
      .update(updateData)
      .eq("id", params.id)
      .select(`
        *,
        project:projects(id, name, status),
        owner:users!project_risks_owner_id_fkey(id, email, full_name)
      `)
      .single();

    if (updateError) {
      console.error("Error updating risk:", updateError);
      return NextResponse.json(
        { error: "Failed to update risk" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      organization_id: orgId,
      user_id: user.id,
      resource_type: "risk",
      resource_id: params.id,
      action: "update",
      details: {
        changes: Object.keys(data)
      }
    });

    return NextResponse.json(updatedRisk);
  } catch (error) {
    console.error("Error in PATCH /api/v1/risks/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/risks/[id] - Delete a risk
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

    // Verify risk exists and belongs to organization
    const { data: existingRisk } = await supabase
      .from("project_risks")
      .select("id, title")
      .eq("id", params.id)
      .eq("organization_id", orgId)
      .single();

    if (!existingRisk) {
      return NextResponse.json(
        { error: "Risk not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the risk
    const { error: deleteError } = await supabase
      .from("project_risks")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      console.error("Error deleting risk:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete risk" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      organization_id: orgId,
      user_id: user.id,
      resource_type: "risk",
      resource_id: params.id,
      action: "delete",
      details: {
        title: existingRisk.title
      }
    });

    return NextResponse.json(
      { message: "Risk deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/v1/risks/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
