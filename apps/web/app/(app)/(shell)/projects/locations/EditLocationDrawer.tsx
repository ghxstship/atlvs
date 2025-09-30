"use client";

import { useMemo, useState } from "react";
import { createBrowserClient } from "@ghxstship/auth";
import { AppDrawer, type DrawerFieldConfig } from "@ghxstship/ui";
import type { Location } from "./LocationsClient";
import { Edit, Tag } from 'lucide-react';

interface EditLocationDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 location: Location;
 projects?: Array<{ id: string; name: string }>;
 onSuccess?: () => void;
}

const normalizeCsv = (value: unknown): string[] => {
 if (Array.isArray(value)) {
  return value
  .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
  .map((entry) => entry.trim());
 }

 if (typeof value === "string" && value.trim().length > 0) {
  return value
  .split(",")
  .map((entry) => entry.trim())
  .filter((entry) => entry.length > 0);
 }

 return [];
};

const parseBoolean = (value: unknown, fallback: boolean) => {
 if (typeof value === "boolean") return value;
 if (typeof value === "string") return ["true", "1", "on", "yes"].includes(value.toLowerCase());
 return fallback;
};

const parseNumber = (value: unknown): number | null => {
 if (typeof value === "number") return Number.isFinite(value) ? value : null;
 if (typeof value === "string" && value.trim().length > 0) {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
 }
 return null;
};

const parseCoordinates = (value: unknown): { x: number; y: number } | null => {
 if (typeof value !== "string" || value.trim().length === 0) return null;

 const [latRaw, lngRaw] = value.split(",");
 if (!latRaw || !lngRaw) return null;

 const lat = Number(latRaw.trim());
 const lng = Number(lngRaw.trim());
 if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

 return { x: lng, y: lat };
};

const toCsv = (values: string[] | null | undefined) => (values?.length ? values.join(", ") : "");

export default function EditLocationDrawer({
 open,
 onOpenChange,
 location,
 projects = [],
 onSuccess,
}: EditLocationDrawerProps) {
 const supabase = createBrowserClient();
 const [loading, setLoading] = useState(false);

 const projectOptions = useMemo(() => (
 [{ label: "No project", value: "" },
 ...projects.map((project): { label: string; value: string } => ({
 label: project.name,
 value: project.id,
 }))]
), [projects]);

 const fields: DrawerFieldConfig[] = [
 {
 key: "name",
 label: "Location Name",
 type: "text",
 required: true,
 placeholder: "Enter location name",
 },
 {
 key: "type",
 label: "Location Type",
 type: "select",
 required: true,
 options: [
 { label: "Venue", value: "venue" },
 { label: "Office", value: "office" },
 { label: "Warehouse", value: "warehouse" },
 { label: "Retail", value: "retail" },
 { label: "Outdoor", value: "outdoor" },
 { label: "Studio", value: "studio" },
 { label: "Residential", value: "residential" },
 { label: "Other", value: "other" },
 ],
 },
 {
 key: "project_id",
 label: "Associated Project",
 type: "select",
 options: projectOptions,
 },
 {
 key: "address",
 label: "Street Address",
 type: "text",
 placeholder: "123 Main St",
 },
 {
 key: "city",
 label: "City",
 type: "text",
 placeholder: "San Francisco",
 },
 {
 key: "state",
 label: "State/Province",
 type: "text",
 placeholder: "CA",
 },
 {
 key: "country",
 label: "Country",
 type: "text",
 placeholder: "USA",
 },
 {
 key: "postal_code",
 label: "Postal Code",
 type: "text",
 placeholder: "94102",
 },
 {
 key: "capacity",
 label: "Capacity (people)",
 type: "number",
 placeholder: "100",
 },
 {
 key: "size",
 label: "Size (sq ft)",
 type: "number",
 placeholder: "5000",
 },
 {
 key: "rental_rate",
 label: "Rental Rate (per day)",
 type: "currency",
 placeholder: "1500.00",
 },
 {
 key: "availability_status",
 label: "Availability Status",
 type: "select",
 options: [
 { label: "Available", value: "available" },
 { label: "Booked", value: "booked" },
 { label: "Maintenance", value: "maintenance" },
 { label: "Unavailable", value: "unavailable" },
 ],
 },
 {
 key: "contact_name",
 label: "Contact Name",
 type: "text",
 placeholder: "John Doe",
 },
 {
 key: "contact_phone",
 label: "Contact Phone",
 type: "text",
 placeholder: "+1 (555) 123-4567",
 },
 {
 key: "contact_email",
 label: "Contact Email",
 type: "email",
 placeholder: "contact@example.com",
 },
 {
 key: "operating_hours",
 label: "Operating Hours",
 type: "text",
 placeholder: "Mon-Fri 9AM-5PM",
 },
 {
 key: "parking_available",
 label: "Parking Available",
 type: "checkbox",
 },
 {
 key: "parking_capacity",
 label: "Parking Capacity",
 type: "number",
 placeholder: "50",
 },
 {
 key: "public_transport",
 label: "Public Transport Access",
 type: "textarea",
 placeholder: "Near BART station, Bus lines 14, 49",
 },
 {
 key: "amenities",
 label: "Amenities (comma-separated)",
 type: "text",
 placeholder: "WiFi, Kitchen, Restrooms, AV Equipment",
 },
 {
 key: "accessibility_features",
 label: "Accessibility Features (comma-separated)",
 type: "text",
 placeholder: "Wheelchair ramp, Elevator, Accessible restrooms",
 },
 {
 key: "notes",
 label: "Notes",
 type: "textarea",
 placeholder: "Additional information about the location",
 },
 {
 key: "tags",
 label: "Tags (comma-separated)",
 type: "text",
 placeholder: "downtown, waterfront, historic",
 },
 {
 key: "is_featured",
 label: "Featured Location",
 type: "checkbox",
 },
 ];

 const handleSave = async (data: Record<string, unknown>) => {
 const name = typeof data.name === "string" ? data.name.trim() : "";
 if (!name) {
 throw new Error("Location name is required");
 }

 const type = typeof data.type === "string" && data.type.trim().length > 0 ? data.type.trim() : location.type ?? "other";
 const selectedProjectId =
 typeof data.project_id === "string" && data.project_id.trim().length > 0
 ? data.project_id.trim()
 : location.project_id;
 const coordinates = parseCoordinates(data.coordinates) ?? location.coordinates ?? null;

 const updates = {
 name,
 type,
 project_id: selectedProjectId || null,
 address: typeof data.address === "string" && data.address.trim().length > 0 ? data.address.trim() : null,
 city: typeof data.city === "string" && data.city.trim().length > 0 ? data.city.trim() : null,
 state: typeof data.state === "string" && data.state.trim().length > 0 ? data.state.trim() : null,
 country: typeof data.country === "string" && data.country.trim().length > 0 ? data.country.trim() : null,
 postal_code: typeof data.postal_code === "string" && data.postal_code.trim().length > 0 ? data.postal_code.trim() : null,
 coordinates,
 capacity: parseNumber(data.capacity),
 size: parseNumber(data.size),
 rental_rate: parseNumber(data.rental_rate),
 availability_status:
 typeof data.availability_status === "string" && data.availability_status.trim().length > 0
 ? data.availability_status.trim()
 : location.availability_status ?? "available",
 contact_name: typeof data.contact_name === "string" && data.contact_name.trim().length > 0 ? data.contact_name.trim() : null,
 contact_phone: typeof data.contact_phone === "string" && data.contact_phone.trim().length > 0 ? data.contact_phone.trim() : null,
 contact_email: typeof data.contact_email === "string" && data.contact_email.trim().length > 0 ? data.contact_email.trim() : null,
 operating_hours: typeof data.operating_hours === "string" && data.operating_hours.trim().length > 0 ? data.operating_hours.trim() : null,
 parking_available: parseBoolean(data.parking_available, Boolean(location.parking_available)),
 parking_capacity: parseNumber(data.parking_capacity),
 public_transport: typeof data.public_transport === "string" && data.public_transport.trim().length > 0 ? data.public_transport.trim() : null,
 amenities: normalizeCsv(data.amenities),
 accessibility_features: normalizeCsv(data.accessibility_features),
 notes: typeof data.notes === "string" && data.notes.trim().length > 0 ? data.notes.trim() : null,
 tags: normalizeCsv(data.tags),
 is_featured: parseBoolean(data.is_featured, Boolean(location.is_featured)),
 updated_at: new Date().toISOString(),
 };

 setLoading(true);

 try {
 const { error } = await supabase
 .from("locations")
 .update(updates)
 .eq("id", location.id);

 if (error) {
 throw error;
 }

 onOpenChange(false);
 onSuccess?.();
 } catch (error) {
 console.error("Error updating location:", error);
 throw error;
 } finally {
 setLoading(false);
 }
 };

 // Pre-populate form with location data
 const record = {
 id: location.id,
 name: location.name,
 type: location.type ?? "other",
 project_id: location.project_id ?? "",
 address: location.address ?? "",
 city: location.city ?? "",
 state: location.state ?? "",
 country: location.country ?? "",
 postal_code: location.postal_code ?? "",
 coordinates: location.coordinates ? `${location.coordinates.y},${location.coordinates.x}` : "",
 capacity: location.capacity?.toString() ?? "",
 size: location.size?.toString() ?? "",
 rental_rate: location.rental_rate?.toString() ?? "",
 availability_status: location.availability_status ?? "available",
 contact_name: location.contact_name ?? "",
 contact_phone: location.contact_phone ?? "",
 contact_email: location.contact_email ?? "",
 operating_hours: location.operating_hours ?? "",
 parking_available: Boolean(location.parking_available),
 parking_capacity: location.parking_capacity?.toString() ?? "",
 public_transport: location.public_transport ?? "",
 amenities: toCsv(location.amenities ?? null),
 accessibility_features: toCsv(location.accessibility_features ?? null),
 notes: location.notes ?? "",
 tags: toCsv(location.tags ?? null),
 is_featured: Boolean(location.is_featured),
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title="Edit Location"
 mode="edit"
 fields={fields}
 record={record}
 onSave={handleSave}
 loading={loading}
 />
 );
}
