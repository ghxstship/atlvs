import { z } from 'zod';
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@ghxstship/auth";

// Validation schemas
const createLocationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["venue", "office", "warehouse", "retail", "outdoor", "studio", "residential", "other"]).optional(),
  project_id: z.string().uuid().optional().nullable(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  coordinates: z.object({ x: z.number(), y: z.number() }).optional().nullable(),
  capacity: z.number().positive().optional().nullable(),
  size: z.number().positive().optional().nullable(),
  rental_rate: z.number().positive().optional().nullable(),
  currency: z.string().default("USD"),
  availability_status: z.enum(["available", "booked", "maintenance", "unavailable"]).default("available"),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional(),
  operating_hours: z.string().optional(),
  parking_available: z.boolean().default(false),
  parking_capacity: z.number().positive().optional().nullable(),
  public_transport: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  accessibility_features: z.array(z.string()).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_featured: z.boolean().default(false),
});

const updateLocationSchema = createLocationSchema.partial();

// GET /api/v1/locations - List locations
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
    const availabilityStatus = searchParams.get("availability_status");
    const isFeatured = searchParams.get("is_featured");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    let query = supabase
      .from("locations")
      .select(`
        *,
        project:projects(id, name, status)
      `, { count: "exact" })
      .eq("organization_id", membership.organization_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (projectId) {
      query = query.eq("project_id", projectId);
    }
    if (type) {
      query = query.eq("type", type);
    }
    if (availabilityStatus) {
      query = query.eq("availability_status", availabilityStatus);
    }
    if (isFeatured === "true") {
      query = query.eq("is_featured", true);
    }

    const { data: locations, error, count } = await query;

    if (error) {
      console.error("Error fetching locations:", error);
      return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
    }

    return NextResponse.json({
      data: locations || [],
      count: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error in GET /api/v1/locations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/v1/locations - Create location
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
    const validationResult = createLocationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const locationData = validationResult.data;

    // If project_id is provided, verify it belongs to the organization
    if (locationData.project_id) {
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("id", locationData.project_id)
        .eq("organization_id", membership.organization_id)
        .maybeSingle();

      if (!project) {
        return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
      }
    }

    // Create location
    const { data: location, error } = await supabase
      .from("locations")
      .insert({
        ...locationData,
        organization_id: membership.organization_id,
        created_by: user.id,
      })
      .select(`
        *,
        project:projects(id, name, status)
      `)
      .single();

    if (error) {
      console.error("Error creating location:", error);
      return NextResponse.json({ error: "Failed to create location" }, { status: 500 });
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      organization_id: membership.organization_id,
      user_id: user.id,
      action: "create",
      resource_type: "location",
      resource_id: location.id,
      details: {
        name: location.name,
        type: location.type,
        address: location.address,
      },
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/v1/locations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
