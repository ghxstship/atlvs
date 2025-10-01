"use client";

import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AppDrawer,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  toast,
} from "@ghxstship/ui";
import type { DashboardListItem } from "../types";

const editDashboardSchema = z.object({
  name: z.string().min(1, "Dashboard name is required").max(100, "Name too long"),
  description: z.string().optional(),
  slug: z.string().optional(),
  layout: z.enum(["grid", "masonry", "flex", "tabs", "accordion", "sidebar", "fullscreen"] as const),
  access_level: z.enum(["private", "team", "organization", "public"] as const),
  is_default: z.boolean().default(false),
  is_template: z.boolean().default(false),
  tags: z.string().optional(),
});

type EditDashboardForm = z.infer<typeof editDashboardSchema>;

type EditDashboardPayload = Omit<EditDashboardForm, "tags"> & { tags?: string[] };

interface EditDashboardDrawerProps {
  open: boolean;
  dashboard: DashboardListItem;
  onSubmit: (data: EditDashboardPayload) => Promise<void>;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

const tagsToInputValue = (tags?: string[] | null) => (tags && tags.length > 0 ? tags.join(", ") : "");

const inputValueToTags = (value?: string | null): string[] | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = value
    .split(",")
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  return parsed.length > 0 ? parsed : undefined;
};

function EditDashboardDrawer({
  open,
  onOpenChange,
  onClose,
  dashboard,
  onSubmit,
}: EditDashboardDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<EditDashboardForm>({
    resolver: zodResolver(editDashboardSchema),
    defaultValues: {
      name: "",
      description: "",
      slug: "",
      layout: "grid",
      access_level: "team",
      is_default: false,
      is_template: false,
      tags: "",
    },
  });

  useEffect(() => {
    if (!dashboard) {
      return;
    }

    form.reset({
      name: dashboard.name ?? "",
      description: dashboard.description ?? "",
      slug: dashboard.slug ?? "",
      layout: dashboard.layout ?? "grid",
      access_level: dashboard.access_level ?? "team",
      is_default: dashboard.is_default ?? false,
      is_template: dashboard.is_template ?? false,
      tags: tagsToInputValue(dashboard.tags),
    });
  }, [dashboard, form]);

  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  const handleSubmit = async (data: EditDashboardForm) => {
    try {
      setIsSubmitting(true);

      await onSubmit({
        ...data,
        tags: inputValueToTags(data.tags),
      });

      handleClose();

      toast.success("Dashboard updated", `${data.name} has been updated successfully.`);
    } catch (error) {
      console.error("Failed to update dashboard:", error);
      toast.error("Update failed", "Unable to update dashboard. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppDrawer open={open} onClose={handleClose} title="Edit Dashboard">
      <Form {...(form as any)}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-lg">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dashboard Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Executive Overview, Team Performance" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe what this dashboard shows..." rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-md md:grid-cols-2">
            <FormField
              control={form.control}
              name="layout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Layout Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select layout" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="grid">Grid Layout</SelectItem>
                        <SelectItem value="masonry">Masonry Layout</SelectItem>
                        <SelectItem value="flex">Flexible Layout</SelectItem>
                        <SelectItem value="tabs">Tabbed Layout</SelectItem>
                        <SelectItem value="accordion">Accordion Layout</SelectItem>
                        <SelectItem value="sidebar">Sidebar Layout</SelectItem>
                        <SelectItem value="fullscreen">Fullscreen Layout</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="access_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Level</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="private">Private (Only me)</SelectItem>
                        <SelectItem value="team">Team (My team)</SelectItem>
                        <SelectItem value="organization">Organization (Everyone)</SelectItem>
                        <SelectItem value="public">Public (External access)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Slug (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., executive-overview" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., executive, finance, quarterly" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-md">
            <FormField
              control={form.control}
              name="is_default"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-md">
                  <div className="space-y-xs">
                    <FormLabel className="text-body font-medium">Set as Default Dashboard</FormLabel>
                    <p className="text-body-sm text-muted-foreground">
                      This dashboard will be shown by default when users visit the dashboard section.
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_template"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-md">
                  <div className="space-y-xs">
                    <FormLabel className="text-body font-medium">Save as Template</FormLabel>
                    <p className="text-body-sm text-muted-foreground">
                      Allow others to create dashboards based on this configuration.
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-sm pt-lg">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-sm h-icon-xs w-icon-xs animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-sm h-icon-xs w-icon-xs" />
                  Update Dashboard
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </AppDrawer>
  );
}

export default EditDashboardDrawer;
