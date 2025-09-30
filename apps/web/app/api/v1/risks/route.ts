import { z } from 'zod';
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@ghxstship/auth";
import { cookies } from "next/headers";

// Validation schema for creating a risk
const createRiskSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  category: z.enum(["technical", "financial", "operational", "legal", "environmental", "safety"]),
  probability: z.enum(["very_low", "low", "medium", "high", "very_high"]),
  impact: z.enum(["very_low", "low", "medium", "high", "very_high"]),
  status: z.enum(["identified", "assessed", "mitigated", "closed"]).optional(),
  owner_id: z.string().uuid().optional(),
  mitigation_plan: z.string().optional(),
  contingency_plan: z.string().optional(),
  identified_date: z.string(),
  review_date: z.string().optional(),
  closed_date: z.string().optional(),
});

// GET /api/v1/risks - List all risks for the organization
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
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
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const probability = searchParams.get("probability");
    const impact = searchParams.get("impact");
    const ownerId = searchParams.get("owner_id");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    let query = supabase
      .from("project_risks")
      .select(`
        *,
        project:projects(id, name, status),
        owner:users!project_risks_owner_id_fkey(id, email, full_name)
      `, { count: "exact" })
      .eq("organization_id", orgId);

    // Apply filters
    if (projectId) query = query.eq("project_id", projectId);
    if (category) query = query.eq("category", category);
    if (status) query = query.eq("status", status);
    if (probability) query = query.eq("probability", probability);
    if (impact) query = query.eq("impact", impact);
    if (ownerId) query = query.eq("owner_id", ownerId);

    // Apply pagination
    query = query
      .order("risk_score", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: risks, error, count } = await query;

    if (error) {
      console.error("Error fetching risks:", error);
      return NextResponse.json(
        { error: "Failed to fetch risks" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: risks,
      count,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error in GET /api/v1/risks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/v1/risks - Create a new risk
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
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
    const validationResult = createRiskSchema.safeParse(body);

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

    // Calculate risk score
    const probMap: Record<string, number> = {
      very_low: 1,
      low: 2,
      medium: 3,
      high: 4,
      very_high: 5,
    };
    const riskScore = probMap[data.probability] * probMap[data.impact];

    // Create the risk
    const { data: newRisk, error: createError } = await supabase
      .from("project_risks")
      .insert({
        organization_id: orgId,
        project_id: data.project_id,
        title: data.title,
        description: data.description,
        category: data.category,
        probability: data.probability,
        impact: data.impact,
        risk_score: riskScore,
        status: data.status || "identified",
        owner_id: data.owner_id || null,
        mitigation_plan: data.mitigation_plan || null,
        contingency_plan: data.contingency_plan || null,
        identified_date: data.identified_date,
        review_date: data.review_date || null,
        closed_date: data.closed_date || null,
        created_by: user.id,
        updated_by: user.id,
      })
      .select(`
        *,
        project:projects(id, name, status),
        owner:users!project_risks_owner_id_fkey(id, email, full_name)
      `)
      .single();

    if (createError) {
      console.error("Error creating risk:", createError);
      return NextResponse.json(
        { error: "Failed to create risk" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      organization_id: orgId,
      user_id: user.id,
      resource_type: "risk",
      resource_id: newRisk.id,
      action: "create",
      details: {
        title: newRisk.title,
        category: newRisk.category,
        risk_score: newRisk.risk_score,
      },
    });

    return NextResponse.json(newRisk, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/v1/risks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
