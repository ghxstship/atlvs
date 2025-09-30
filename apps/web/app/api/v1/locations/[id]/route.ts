import { z } from 'zod';
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@ghxstship/auth";

// Validation schema for updates
const updateLocationSchema = z.object({
  name: z.string().min(1).optional(),
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
  currency: z.string().optional(),
  availability_status: z.enum(["available", "booked", "maintenance", "unavailable"]).optional(),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional(),
  operating_hours: z.string().optional(),
  parking_available: z.boolean().optional(),
  parking_capacity: z.number().positive().optional().nullable(),
  public_transport: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  accessibility_features: z.array(z.string()).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  floor_plans: z.array(z.string()).optional(),
});

// GET /api/v1/locations/[id] - Get single location
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
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

    // Fetch location with related data
    const { data: location, error } = await supabase
      .from("locations")
      .select(`
        *,
        project:projects(id, name, status)
      `)
      .eq("id", params.id)
      .eq("organization_id", membership.organization_id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching location:", error);
      return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 });
    }

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error("Error in GET /api/v1/locations/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/v1/locations/[id] - Update location
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
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

    // Verify location exists and belongs to organization
    const { data: existingLocation } = await supabase
      .from("locations")
      .select("id")
      .eq("id", params.id)
      .eq("organization_id", membership.organization_id)
      .maybeSingle();

    if (!existingLocation) {
      return NextResponse.json({ error: "Location not found or access denied" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateLocationSchema.safeParse(body);

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

    // Update location
    const { data: location, error } = await supabase
      .from("locations")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select(`
        *,
        project:projects(id, name, status)
      `)
      .single();

    if (error) {
      console.error("Error updating location:", error);
      return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      organization_id: membership.organization_id,
      user_id: user.id,
      action: "update",
      resource_type: "location",
      resource_id: location.id,
      details: { updates },
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error("Error in PATCH /api/v1/locations/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/v1/locations/[id] - Delete location
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
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

    // Verify location exists and belongs to organization
    const { data: existingLocation } = await supabase
      .from("locations")
      .select("id, name")
      .eq("id", params.id)
      .eq("organization_id", membership.organization_id)
      .maybeSingle();

    if (!existingLocation) {
      return NextResponse.json({ error: "Location not found or access denied" }, { status: 404 });
    }

    // Delete location
    const { error } = await supabase
      .from("locations")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Error deleting location:", error);
      return NextResponse.json({ error: "Failed to delete location" }, { status: 500 });
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      organization_id: membership.organization_id,
      user_id: user.id,
      action: "delete",
      resource_type: "location",
      resource_id: params.id,
      details: {
        name: existingLocation.name,
      },
    });

    return NextResponse.json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/v1/locations/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
