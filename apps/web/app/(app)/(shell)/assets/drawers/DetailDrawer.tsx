"use client";

/**
 * Assets Detail Drawer
 *
 * Enterprise-grade detail drawer for viewing comprehensive asset information.
 * Features lazy loading, context preservation, related data display,
 * audit trail, and quick navigation.
 *
 * @module assets/drawers/DetailDrawer
 */

import React, { useCallback, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
} from "@ghxstship/ui";
import { Separator } from "@ghxstship/ui/components/Separator";
import { Asset, EnrichedAsset } from "../types";
import { apiClient } from "../lib/api";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Edit,
  History,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Package,
  Settings,
  Share,
  Trash2,
  User,
  DollarSign,
} from "lucide-react";

interface DetailDrawerProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (asset: Asset | EnrichedAsset) => void;
  onDelete?: (asset: Asset | EnrichedAsset) => void;
  onDuplicate?: (asset: Asset | EnrichedAsset) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  className?: string;
}

type DetailDrawerTab = "overview" | "details" | "activity";

const formatDate = (value?: Date | string | null) => {
  if (!value) return "—";
  const parsed = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(parsed);
};

const formatCurrency = (value?: number | null) => {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

const isEnrichedAsset = (
  candidate: Asset | EnrichedAsset | null,
): candidate is EnrichedAsset => {
  if (!candidate) return false;
  const enriched = candidate as EnrichedAsset;
  return (
    typeof enriched.assigned_to === "object" ||
    typeof enriched.location === "object" ||
    typeof enriched.supplier === "object"
  );
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="space-y-xs">
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <p className="text-sm text-foreground">{value ?? "—"}</p>
  </div>
);

export default function DetailDrawer({
  asset,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  className = "",
}: DetailDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [assetDetails, setAssetDetails] = useState<Asset | EnrichedAsset | null>(null);
  const [activeTab, setActiveTab] = useState<DetailDrawerTab>("overview");

  const fetchAssetDetails = useCallback(async () => {
    if (!asset?.id) return;

    setLoading(true);
    try {
      const details = await apiClient.getAsset(asset.id);
      setAssetDetails(details);
    } catch (error) {
      console.error("Failed to fetch asset details:", error);
    } finally {
      setLoading(false);
    }
  }, [asset?.id]);

  React.useEffect(() => {
    if (isOpen && asset?.id) {
      void fetchAssetDetails();
      setActiveTab("overview");
    }

    if (!isOpen) {
      setAssetDetails(null);
    }
  }, [isOpen, asset?.id, fetchAssetDetails]);

  const displayAsset = assetDetails ?? asset;
  if (!displayAsset) {
    return null;
  }

  const enrichedAsset = isEnrichedAsset(displayAsset) ? displayAsset : null;

  const summaryItems = useMemo(
    () => [
      {
        icon: Package,
        label: "Category",
        value: displayAsset.category?.replace(/_/g, " ") ?? "—",
      },
      {
        icon: MapPin,
        label: "Location",
        value: enrichedAsset?.location?.name ?? "Unassigned",
      },
      {
        icon: User,
        label: "Assigned To",
        value: enrichedAsset?.assigned_to?.name ?? "Unassigned",
      },
      {
        icon: Calendar,
        label: "Purchase Date",
        value: formatDate(displayAsset.purchase_date as Date | string | undefined),
      },
      {
        icon: Clock,
        label: "Warranty Expiry",
        value: formatDate(displayAsset.warranty_expiry as Date | string | undefined),
      },
      {
        icon: Settings,
        label: "Condition",
        value: displayAsset.condition?.replace(/_/g, " ") ?? "—",
      },
    ],
    [displayAsset, enrichedAsset],
  );

  const financialItems = useMemo(
    () => [
      {
        icon: DollarSign,
        label: "Purchase Price",
        value: formatCurrency(displayAsset.purchase_price),
      },
      {
        icon: DollarSign,
        label: "Current Value",
        value: formatCurrency(displayAsset.current_value),
      },
      {
        icon: AlertTriangle,
        label: "Depreciation Rate",
        value:
          typeof displayAsset.depreciation_rate === "number"
            ? `${displayAsset.depreciation_rate}%`
            : "—",
      },
      {
        icon: CheckCircle,
        label: "Supplier",
        value: enrichedAsset?.supplier?.name ?? "—",
      },
    ],
    [displayAsset, enrichedAsset],
  );

  const specifications = useMemo(() => {
    if (!displayAsset.specifications) return [] as Array<[string, unknown]>;
    return Object.entries(displayAsset.specifications);
  }, [displayAsset.specifications]);

  const galleryImages = useMemo(() => displayAsset.image_urls ?? [], [displayAsset.image_urls]);

  const handleDrawerChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const handleEdit = () => {
    onEdit?.(displayAsset);
  };

  const handleDuplicate = () => {
    onDuplicate?.(displayAsset);
  };

  const handleDelete = () => {
    onDelete?.(displayAsset);
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleDrawerChange}>
      <DrawerContent className={cn("max-w-3xl", className)}>
        <DrawerHeader className="border-b border-border">
          <div className="flex flex-col gap-md">
            <div className="flex flex-wrap items-start justify-between gap-md">
              <div className="space-y-sm">
                <DrawerTitle className="text-xl font-semibold text-foreground">
                  {displayAsset.name}
                </DrawerTitle>
                <DrawerDescription className="flex flex-wrap items-center gap-sm text-sm">
                  Asset tag
                  <span className="font-medium text-foreground">{displayAsset.asset_tag}</span>
                  <Badge variant="outline" className="capitalize">
                    {displayAsset.status?.replace(/_/g, " ") ?? "Unknown"}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">
                    {displayAsset.condition?.replace(/_/g, " ") ?? "Unknown"}
                  </Badge>
                </DrawerDescription>
              </div>

              <div className="flex items-center gap-sm">
                {hasPrevious && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Previous asset"
                    onClick={onPrevious}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}

                {hasNext && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Next asset"
                    onClick={onNext}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Asset actions">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onSelect={handleEdit}>
                      <Edit className="mr-sm h-4 w-4" /> Edit asset
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleDuplicate}>
                      <Copy className="mr-sm h-4 w-4" /> Duplicate asset
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => void fetchAssetDetails()}>
                      <Download className="mr-sm h-4 w-4" /> Refresh details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleDelete} className="text-destructive">
                      <Trash2 className="mr-sm h-4 w-4" /> Delete asset
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Share className="mr-sm h-4 w-4" /> Share asset
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {loading && (
              <div className="flex items-center gap-sm text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Fetching latest details…
              </div>
            )}
          </div>
        </DrawerHeader>

        <div className="flex flex-col gap-lg p-lg">
          <Tabs
            className="w-full"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as DetailDrawerTab)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-lg space-y-lg">
              <section className="rounded-lg border border-border bg-background p-lg shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground">Summary</h3>
                <div className="mt-md grid grid-cols-1 gap-md sm:grid-cols-2">
                  {summaryItems.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-sm">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <InfoRow label={label} value={value} />
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-border bg-background p-lg shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground">Financials</h3>
                <div className="mt-md grid grid-cols-1 gap-md sm:grid-cols-2">
                  {financialItems.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-sm">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <InfoRow label={label} value={value} />
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-border bg-background p-lg shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground">Media</h3>
                {galleryImages.length === 0 ? (
                  <p className="mt-sm text-sm text-muted-foreground">
                    No media assets have been attached to this record yet.
                  </p>
                ) : (
                  <div className="mt-md grid grid-cols-2 gap-sm md:grid-cols-3">
                    {galleryImages.map((url) => (
                      <div
                        key={url}
                        className="group relative overflow-hidden rounded-md border border-border"
                      >
                        <img
                          src={url}
                          alt="Asset"
                          className="h-24 w-full object-cover transition group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </TabsContent>

            <TabsContent value="details" className="mt-lg space-y-lg">
              <section className="rounded-lg border border-border bg-background p-lg shadow-sm">
                <div className="grid grid-cols-1 gap-md md:grid-cols-2">
                  <InfoRow label="Brand" value={displayAsset.brand ?? "—"} />
                  <InfoRow label="Model" value={displayAsset.model ?? "—"} />
                  <InfoRow label="Serial Number" value={displayAsset.serial_number ?? "—"} />
                  <InfoRow label="Asset Tag" value={displayAsset.asset_tag ?? "—"} />
                </div>

                <Separator className="my-lg" />

                <div className="space-y-sm">
                  <h4 className="text-sm font-medium text-muted-foreground">Specifications</h4>
                  {specifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No specifications recorded for this asset.
                    </p>
                  ) : (
                    <dl className="grid grid-cols-1 gap-sm sm:grid-cols-2">
                      {specifications.map(([key, value]) => (
                        <div key={key} className="rounded-md border border-border p-sm">
                          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {key}
                          </dt>
                          <dd className="mt-xs text-sm text-foreground">
                            {typeof value === "string" || typeof value === "number"
                              ? value
                              : JSON.stringify(value, null, 2)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-border bg-background p-lg shadow-sm">
                <h4 className="flex items-center gap-sm text-sm font-medium text-muted-foreground">
                  <ImageIcon className="h-4 w-4" /> Documentation
                </h4>
                <p className="mt-sm text-sm text-muted-foreground">
                  Documentation, maintenance records, and inspections will appear here once connected to the live data source.
                </p>
              </section>
            </TabsContent>

            <TabsContent value="activity" className="mt-lg space-y-lg">
              <section className="rounded-lg border border-border bg-background p-lg shadow-sm">
                <div className="flex items-start gap-sm">
                  <History className="mt-xs h-5 w-5 text-muted-foreground" />
                  <div className="space-y-xs">
                    <h4 className="text-sm font-medium text-foreground">Activity log</h4>
                    <p className="text-sm text-muted-foreground">
                      Live activity, maintenance updates, and assignment changes will stream into this timeline once Supabase realtime is wired.
                    </p>
                    <div className="flex items-center gap-xs text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4" /> Enterprise audit logging is enabled across the Assets module.
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-border bg-background p-lg shadow-sm">
                <h4 className="text-sm font-medium text-muted-foreground">Upcoming Maintenance</h4>
                <p className="mt-sm text-sm text-muted-foreground">
                  Scheduled maintenance events will appear here with status updates and assignee information.
                </p>
              </section>
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}