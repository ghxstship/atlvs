"use client";

import { Grid3x3, Map, List, LayoutGrid, Search, Filter, Download, Upload, MoreVertical, Plus, Edit, Trash2, Eye, Copy, Archive, MapPin, Building, Users, Navigation, Globe, Home, Warehouse, Store, Building2, TreePine, Waves, Mountain, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, Columns, ExternalLink } from "lucide-react";
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@ghxstship/auth";
import {
 Card,
 Button,
 Badge,
 Input,
 Select,
 Checkbox,
 Tabs,
 TabsList,
 TabsTrigger,
 TabsContent,
 toast
} from "@ghxstship/ui";
import { format, parseISO } from "date-fns";
import CreateLocationDrawer from "./CreateLocationDrawer";
import EditLocationDrawer from "./EditLocationDrawer";
import ViewLocationDrawer from "./ViewLocationDrawer";
import LocationGridView from "./views/LocationGridView";
import LocationMapView from "./views/LocationMapView";
import LocationListView from "./views/LocationListView";
import LocationGalleryView from "./views/LocationGalleryView";

// Types
export interface Location {
 id: string;
 organization_id: string;
 project_id?: string;
 project?: {
 id: string;
 name: string;
 status: string;
 };
 name: string;
 type?: "venue" | "office" | "warehouse" | "retail" | "outdoor" | "studio" | "residential" | "other";
 address?: string;
 city?: string;
 state?: string;
 country?: string;
 postal_code?: string;
 coordinates?: { x: number; y: number } | null;
 capacity?: number;
 size?: number; // square feet/meters
 amenities?: string[];
 accessibility_features?: string[];
 parking_available?: boolean;
 parking_capacity?: number;
 public_transport?: string;
 contact_name?: string;
 contact_phone?: string;
 contact_email?: string;
 operating_hours?: string;
 rental_rate?: number;
 currency?: string;
 availability_status?: "available" | "booked" | "maintenance" | "unavailable";
 images?: string[];
 floor_plans?: string[];
 notes?: string;
 tags?: string[];
 is_featured?: boolean;
 is_demo?: boolean;
 created_at: string;
 updated_at: string;
 created_by?: string;
}

interface LocationsClientProps {
 orgId: string;
 projectId?: string;
 initialLocations?: Location[];
 projects?: Array<{ id: string; name: string }>;
}

// View configurations
const VIEW_TYPES = [
 { id: "grid", label: "Grid", icon: Grid3x3 },
 { id: "map", label: "Map", icon: Map },
 { id: "list", label: "List", icon: List },
 { id: "gallery", label: "Gallery", icon: LayoutGrid },
] as const;

type ViewType = typeof VIEW_TYPES[number]["id"];

// Field configuration for visibility and ordering
const FIELD_CONFIG = [
 { id: "name", label: "Name", visible: true, sortable: true },
 { id: "type", label: "Type", visible: true, sortable: true },
 { id: "address", label: "Address", visible: true, sortable: false },
 { id: "city", label: "City", visible: true, sortable: true },
 { id: "state", label: "State", visible: false, sortable: true },
 { id: "country", label: "Country", visible: false, sortable: true },
 { id: "capacity", label: "Capacity", visible: true, sortable: true },
 { id: "size", label: "Size", visible: false, sortable: true },
 { id: "availability_status", label: "Availability", visible: true, sortable: true },
 { id: "rental_rate", label: "Rate", visible: false, sortable: true },
 { id: "project", label: "Project", visible: true, sortable: true },
 { id: "contact_name", label: "Contact", visible: false, sortable: false },
 { id: "created_at", label: "Created", visible: false, sortable: true },
 { id: "updated_at", label: "Updated", visible: false, sortable: true },
];

export default function LocationsClient({
 orgId,
 projectId,
 initialLocations = [],
 projects = []
}: LocationsClientProps) {
 const router = useRouter();
 const supabase = createBrowserClient();

 // State
 const [locations, setLocations] = useState<Location[]>(initialLocations);
 const [loading, setLoading] = useState(false);
 const [viewType, setViewType] = useState<ViewType>("grid");
 const [searchQuery, setSearchQuery] = useState("");
 const [selectedType, setSelectedType] = useState<string>("all");
 const [selectedAvailability, setSelectedAvailability] = useState<string>("all");
 const [selectedProject, setSelectedProject] = useState<string>(projectId || "all");
 const [sortField, setSortField] = useState<string>("created_at");
 const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
 const [selectedLocations, setSelectedLocations] = useState<Set<string>(new Set());
 const [fieldVisibility, setFieldVisibility] = useState(FIELD_CONFIG);

 // Drawers
 const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
 const [editDrawerOpen, setEditDrawerOpen] = useState(false);
 const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
 const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

 // Load locations from Supabase
 const loadLocations = useCallback(async () => {
 setLoading(true);
 try {
 let query = supabase
 .from("locations")
 .select(`
 *,
 project:projects(id, name, status)
 `)
 .eq("organization_id", orgId)
 .order(sortField, { ascending: sortDirection === "asc" });

 // Apply filters
 if (projectId) {
 query = query.eq("project_id", projectId);
 } else if (selectedProject !== "all") {
 query = query.eq("project_id", selectedProject);
 }

 const { data, error } = await query;

 if (error) throw error;
 
 // Transform data to match our interface
 const transformedData = (data || []).map(loc => ({
 ...loc,
 type: loc.type || "other",
 availability_status: loc.availability_status || "available",
 amenities: loc.amenities || [],
 accessibility_features: loc.accessibility_features || [],
 images: loc.images || [],
 floor_plans: loc.floor_plans || [],
 tags: loc.tags || []
 }));
 
 setLocations(transformedData);
 } catch (error) {
 console.error("Error loading locations:", error);
 toast.error("Failed to load locations");
 } finally {
 setLoading(false);
 }
 }, [supabase, orgId, projectId, selectedProject, sortField, sortDirection]);

 // Load locations on mount and when filters change
 useEffect(() => {
 loadLocations();
 }, [loadLocations]);

 // Real-time subscription
 useEffect(() => {
 const channel = supabase
 .channel("locations-changes")
 .on(
 "postgres_changes",
 {
 event: "*",
 schema: "public",
 table: "locations",
 filter: `organization_id=eq.${orgId}`
 },
 (payload) => {
 loadLocations();
 }
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 }, [supabase, orgId, loadLocations]);

 // Filter locations based on search
 const filteredLocations = useMemo(() => {
 return locations.filter((location) => {
 if (searchQuery) {
 const query = searchQuery.toLowerCase();
 return (
 location.name.toLowerCase().includes(query) ||
 location.address?.toLowerCase().includes(query) ||
 location.city?.toLowerCase().includes(query) ||
 location.state?.toLowerCase().includes(query) ||
 location.country?.toLowerCase().includes(query) ||
 location.notes?.toLowerCase().includes(query) ||
 location.contact_name?.toLowerCase().includes(query) ||
 location.tags?.some(tag => tag.toLowerCase().includes(query))
 );
 }
 return true;
 });
 }, [locations, searchQuery]);

 // Apply type and availability filters
 const filteredAndTypedLocations = useMemo(() => {
 return filteredLocations.filter((location) => {
 if (selectedType !== "all" && location.type !== selectedType) {
 return false;
 }
 if (selectedAvailability !== "all" && location.availability_status !== selectedAvailability) {
 return false;
 }
 return true;
 });
 }, [filteredLocations, selectedType, selectedAvailability]);

 // Sort locations
 const sortedLocations = useMemo(() => {
 return [...filteredAndTypedLocations].sort((a, b) => {
 let aVal: unknown = a[sortField as keyof Location];
 let bVal: unknown = b[sortField as keyof Location];

 // Handle nested fields
 if (sortField === "project") {
 aVal = a.project?.name || "";
 bVal = b.project?.name || "";
 }

 // Handle dates
 if (sortField.includes("_at")) {
 aVal = aVal ? new Date(aVal).getTime() : 0;
 bVal = bVal ? new Date(bVal).getTime() : 0;
 }

 // Handle numbers
 if (typeof aVal === "number" && typeof bVal === "number") {
 return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
 }

 // Handle strings
 const aStr = String(aVal || "").toLowerCase();
 const bStr = String(bVal || "").toLowerCase();
 return sortDirection === "asc" 
 ? aStr.localeCompare(bStr)
 : bStr.localeCompare(aStr);
 });
 }, [filteredAndTypedLocations, sortField, sortDirection]);

 // Handle selection
 const handleSelectAll = useCallback(() => {
 if (selectedLocations.size === sortedLocations.length) {
 setSelectedLocations(new Set());
 } else {
 setSelectedLocations(new Set(sortedLocations.map((l) => l.id)));
 }
 }, [selectedLocations, sortedLocations]);

 const handleSelectLocation = useCallback((id: string) => {
 setSelectedLocations((prev: unknown) => {
 const next = new Set(prev);
 if (next.has(id)) {
 next.delete(id);
 } else {
 next.add(id);
 }
 return next;
 });
 }, []);

 // Handle actions
 const handleView = useCallback((location: Location) => {
 setSelectedLocation(location);
 setViewDrawerOpen(true);
 }, []);

 const handleEdit = useCallback((location: Location) => {
 setSelectedLocation(location);
 setEditDrawerOpen(true);
 }, []);

 const handleDelete = useCallback(async (location: Location) => {
 if (!confirm(`Are you sure you want to delete "${location.name}"?`)) return;

 try {
 const { error } = await supabase
 .from("locations")
 .delete()
 .eq("id", location.id);

 if (error) throw error;
 
 toast.success("Location deleted successfully");
 loadLocations();
 } catch (error) {
 console.error("Error deleting location:", error);
 toast.error("Failed to delete location");
 }
 }, [supabase, loadLocations]);

 const handleDuplicate = useCallback(async (location: Location) => {
 try {
 const { id, created_at, updated_at, ...locationData } = location;
 const { data, error } = await supabase
 .from("locations")
 .insert({
 ...locationData,
 name: `${location.name} (Copy)`
 })
 .select()
 .single();

 if (error) throw error;
 
 toast.success("Location duplicated successfully");
 loadLocations();
 } catch (error) {
 console.error("Error duplicating location:", error);
 toast.error("Failed to duplicate location");
 }
 }, [supabase, loadLocations]);

 const handleNavigate = useCallback((location: Location) => {
 if (location.coordinates) {
 const { x: lng, y: lat } = location.coordinates;
 window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
 } else if (location.address) {
 const query = encodeURIComponent(`${location.address}, ${location.city}, ${location.state} ${location.postal_code}`);
 window.open(`https://maps.google.com/?q=${query}`, "_blank");
 }
 }, []);

 // Bulk actions
 const handleBulkDelete = useCallback(async () => {
 if (!confirm(`Are you sure you want to delete ${selectedLocations.size} locations?`)) return;

 try {
 const { error } = await supabase
 .from("locations")
 .delete()
 .in("id", Array.from(selectedLocations));

 if (error) throw error;
 
 toast.success(`${selectedLocations.size} locations deleted successfully`);
 setSelectedLocations(new Set());
 loadLocations();
 } catch (error) {
 console.error("Error deleting locations:", error);
 toast.error("Failed to delete locations");
 }
 }, [supabase, selectedLocations, loadLocations]);

 const handleBulkExport = useCallback(() => {
 const selectedData = sortedLocations.filter(l => selectedLocations.has(l.id));
 const csv = convertToCSV(selectedData.length > 0 ? selectedData : sortedLocations);
 downloadCSV(csv, "locations.csv");
 }, [sortedLocations, selectedLocations]);

 // Helper functions for export
 const convertToCSV = (data: Location[]) => {
 const headers = ["Name", "Type", "Address", "City", "State", "Country", "Capacity", "Size", "Availability", "Project"];
 const rows = data.map(l => [
 l.name,
 l.type || "",
 l.address || "",
 l.city || "",
 l.state || "",
 l.country || "",
 l.capacity?.toString() || "",
 l.size?.toString() || "",
 l.availability_status || "",
 l.project?.name || "",
 ]);
 return [headers, ...rows].map(row => row.join(",")).join("\n");
 };

 const downloadCSV = (csv: string, filename: string) => {
 const blob = new Blob([csv], { type: "text/csv" });
 const url = window.URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download = filename;
 a.click();
 window.URL.revokeObjectURL(url);
 };

 // Get type icon
 const getTypeIcon = (type: string) => {
 switch (type) {
 case "venue":
 return Building2;
 case "office":
 return Building;
 case "warehouse":
 return Warehouse;
 case "retail":
 return Store;
 case "outdoor":
 return TreePine;
 case "studio":
 return Home;
 case "residential":
 return Home;
 default:
 return MapPin;
 }
 };

 // Get availability badge variant
 const getAvailabilityBadgeVariant = (status: string) => {
 switch (status) {
 case "available":
 return "success";
 case "booked":
 return "warning";
 case "maintenance":
 return "secondary";
 case "unavailable":
 return "destructive";
 default:
 return "default";
 }
 };

 // Get type badge variant
 const getTypeBadgeVariant = (type: string) => {
 switch (type) {
 case "venue":
 return "info";
 case "office":
 return "secondary";
 case "warehouse":
 return "warning";
 case "retail":
 return "success";
 case "outdoor":
 return "default";
 default:
 return "outline";
 }
 };

 return (
 <div className="space-y-md">
 {/* Header */}
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-md">
 <div>
 <h1 className="text-2xl font-bold">Project Locations</h1>
 <p className="text-muted-foreground">
 Manage venues, offices, and event locations
 </p>
 </div>
 <Button onClick={() => setCreateDrawerOpen(true)}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Add Location
 </Button>
 </div>

 {/* Filters and View Switcher */}
 <div className="flex flex-col lg:flex-row gap-md">
 <div className="flex-1 flex flex-wrap gap-sm">
 <div className="relative flex-1 min-w-content-narrow">
 <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground" />
 <Input
 placeholder="Search locations..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-9"
 />
 </div>
 
 <Select value={selectedType} onValueChange={setSelectedType}>
 <option value="all">All Types</option>
 <option value="venue">Venue</option>
 <option value="office">Office</option>
 <option value="warehouse">Warehouse</option>
 <option value="retail">Retail</option>
 <option value="outdoor">Outdoor</option>
 <option value="studio">Studio</option>
 <option value="residential">Residential</option>
 <option value="other">Other</option>
 </Select>

 <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
 <option value="all">All Availability</option>
 <option value="available">Available</option>
 <option value="booked">Booked</option>
 <option value="maintenance">Maintenance</option>
 <option value="unavailable">Unavailable</option>
 </Select>

 {!projectId && projects.length > 0 && (
 <Select value={selectedProject} onValueChange={setSelectedProject}>
 <option value="all">All Projects</option>
 {projects.map((project) => (
 <option key={project.id} value={project.id}>
 {project.name}
 </option>
 ))}
 </Select>
 )}
 </div>

 {/* View Switcher */}
 <div className="flex items-center gap-sm">
 <Button
 variant="outline"
 size="sm"
 onClick={handleBulkExport}
 >
 <Download className="mr-2 h-icon-xs w-icon-xs" />
 Export
 </Button>

 <div className="flex rounded-md shadow-sm">
 {VIEW_TYPES.map((view) => {
 const Icon = view.icon;
 return (
 <Button
 key={view.id}
 variant={viewType === view.id ? "default" : "outline"}
 size="sm"
 onClick={() => setViewType(view.id as ViewType)}
 className="rounded-none first:rounded-l-md last:rounded-r-md"
 >
 <Icon className="h-icon-xs w-icon-xs" />
 </Button>
 );
 })}
 </div>
 </div>
 </div>
 </Card>

 {/* Bulk Actions Bar */}
 {selectedLocations.size > 0 && (
 <Card className="p-sm">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <Checkbox
 checked={selectedLocations.size === sortedLocations.length}
 onChange={handleSelectAll}
 />
 <span className="text-sm text-muted-foreground">
 {selectedLocations.size} selected
 </span>
 </div>
 <div className="flex items-center gap-sm">
 <Button
 variant="outline"
 size="sm"
 onClick={handleBulkExport}
 >
 Export Selected
 </Button>
 <Button
 variant="destructive"
 size="sm"
 onClick={handleBulkDelete}
 >
 Delete Selected
 </Button>
 </div>
 </div>
 </Card>
 )}

 {/* Content Views */}
 <Card className="p-lg">
 {loading ? (
 <div className="flex items-center justify-center py-xl">
 <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary"></div>
 </div>
 ) : sortedLocations.length === 0 ? (
 <div className="text-center py-xl">
 <MapPin className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-md" />
 <h3 className="text-lg font-semibold mb-sm">No locations found</h3>
 <p className="text-muted-foreground mb-md">
 {searchQuery || selectedType !== "all" || selectedAvailability !== "all"
 ? "Try adjusting your filters"
 : "Get started by adding your first location"}
 </p>
 {!searchQuery && selectedType === "all" && selectedAvailability === "all" && (
 <Button onClick={() => setCreateDrawerOpen(true)}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Add Location
 </Button>
 )}
 </div>
 ) : (
 <>
 {viewType === "grid" && (
 <LocationGridView
 locations={sortedLocations}
 selectedLocations={selectedLocations}
 onSelectLocation={handleSelectLocation}
 onView={handleView}
 onEdit={handleEdit}
 onDelete={handleDelete}
 onDuplicate={handleDuplicate}
 onNavigate={handleNavigate}
 getTypeIcon={getTypeIcon}
 getAvailabilityBadgeVariant={getAvailabilityBadgeVariant}
 getTypeBadgeVariant={getTypeBadgeVariant}
 />
 )}
 {viewType === "map" && (
 <LocationMapView
 locations={sortedLocations}
 onView={handleView}
 getTypeIcon={getTypeIcon}
 getAvailabilityBadgeVariant={getAvailabilityBadgeVariant}
 />
 )}
 {viewType === "list" && (
 <LocationListView
 locations={sortedLocations}
 selectedLocations={selectedLocations}
 fieldVisibility={fieldVisibility}
 sortField={sortField}
 sortDirection={sortDirection}
 onSelectAll={handleSelectAll}
 onSelectLocation={handleSelectLocation}
 onSort={(field) => {
 if (sortField === field) {
 setSortDirection(sortDirection === "asc" ? "desc" : "asc");
 } else {
 setSortField(field);
 setSortDirection("asc");
 }
 }}
 onView={handleView}
 onEdit={handleEdit}
 onDelete={handleDelete}
 onDuplicate={handleDuplicate}
 onNavigate={handleNavigate}
 getTypeBadgeVariant={getTypeBadgeVariant}
 getAvailabilityBadgeVariant={getAvailabilityBadgeVariant}
 />
 )}
 {viewType === "gallery" && (
 <LocationGalleryView
 locations={sortedLocations}
 selectedLocations={selectedLocations}
 onSelectLocation={handleSelectLocation}
 onView={handleView}
 onEdit={handleEdit}
 onDelete={handleDelete}
 onNavigate={handleNavigate}
 getTypeIcon={getTypeIcon}
 getAvailabilityBadgeVariant={getAvailabilityBadgeVariant}
 />
 )}
 </>
 )}
 </Card>

 {/* Drawers */}
 <CreateLocationDrawer
 open={createDrawerOpen}
 onClose={() => setCreateDrawerOpen(false)}
 orgId={orgId}
 projectId={projectId}
 projects={projects}
 onSuccess={loadLocations}
 />
 
 {selectedLocation && (
 <>
 <EditLocationDrawer
 open={editDrawerOpen}
 onClose={() => setEditDrawerOpen(false)}
 location={selectedLocation}
 projects={projects}
 onSuccess={loadLocations}
 />
 
 <ViewLocationDrawer
 open={viewDrawerOpen}
 onClose={() => setViewDrawerOpen(false)}
 location={selectedLocation}
 onEdit={() => {
 setViewDrawerOpen(false);
 setEditDrawerOpen(true);
 }}
 onNavigate={() => handleNavigate(selectedLocation)}
 getTypeIcon={getTypeIcon}
 getAvailabilityBadgeVariant={getAvailabilityBadgeVariant}
 getTypeBadgeVariant={getTypeBadgeVariant}
 />
 </>
 )}
 </div>
 );
}
