'use client';

import { Button, Drawer, Input, Loader2, Plus, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import { AppDrawer, Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Select, Switch } from '@ghxstship/ui';
import type { DashboardLayout, AccessLevel } from '../types';

const createDashboardSchema = z.object({
 name: z.string().min(1, 'Dashboard name is required').max(100, 'Name too long'),
 description: z.string().optional(),
 slug: z.string().optional(),
 layout: z.enum(['grid', 'masonry', 'flex', 'tabs', 'accordion', 'sidebar', 'fullscreen'] as const),
 access_level: z.enum(['private', 'team', 'organization', 'public'] as const),
 is_default: z.boolean().default(false),
 is_template: z.boolean().default(false),
 tags: z.string().optional()
});

type CreateDashboardForm = z.infer<typeof createDashboardSchema>;

interface CreateDashboardDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 orgId: string;
 onSubmit: (data: CreateDashboardForm) => Promise<void>;
}

export default function CreateDashboardDrawer({
 open,
 onOpenChange,
 orgId,
 onSubmit
}: CreateDashboardDrawerProps) {
 const [isSubmitting, setIsSubmitting] = useState(false);
 const { toast } = useToast();

 const form = useForm<CreateDashboardForm>({
 resolver: zodResolver(createDashboardSchema),
 defaultValues: {
 name: '',
 description: '',
 slug: '',
 layout: 'grid',
 access_level: 'team',
 is_default: false,
 is_template: false,
 tags: ''
 }
 });

 const handleSubmit = async (data: CreateDashboardForm) => {
 try {
 setIsSubmitting(true);
 
 // Process tags
 const processedData = {
 ...data,
 tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined
 };
 
 await onSubmit(processedData);
 form.reset();
 onOpenChange(false);
 
 toast({
 title: 'Dashboard created',
 description: `${data.name} has been created successfully.`
 });
 } catch (error) {
 console.error('Failed to create dashboard:', error);
 toast({
 title: 'Creation failed',
 description: 'Unable to create dashboard. Please try again.',
 variant: 'destructive'
 });
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title="Create Dashboard"
 description="Create a new dashboard to organize and visualize your data."
 >
 <Form {...form}>
 <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-lg">
 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Dashboard Name *</FormLabel>
 <FormControl>
 <Input
 placeholder="e.g., Executive Overview, Team Performance"
 {...field}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Description</FormLabel>
 <FormControl>
 <textarea
 placeholder="Describe what this dashboard will show..."
 rows={3}
 {...field}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Layout Type</FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value}>
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
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Access Level</FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value}>
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
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>URL Slug (Optional)</FormLabel>
 <FormControl>
 <Input
 placeholder="e.g., executive-overview"
 {...field}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Tags (Optional)</FormLabel>
 <FormControl>
 <Input
 placeholder="e.g., executive, finance, quarterly"
 {...field}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <div className="space-y-md">
 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-md">
 <div className="space-y-xs">
 <FormLabel className="text-body font-medium">
 Set as Default Dashboard
 </FormLabel>
 <p className="text-body-sm text-muted-foreground">
 This dashboard will be shown by default when users visit the dashboard section.
 </p>
 </div>
 <FormControl>
 <Switch
 checked={field.value}
 onCheckedChange={field.onChange}
 />
 </FormControl>
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-md">
 <div className="space-y-xs">
 <FormLabel className="text-body font-medium">
 Save as Template
 </FormLabel>
 <p className="text-body-sm text-muted-foreground">
 Allow others to create dashboards based on this configuration.
 </p>
 </div>
 <FormControl>
 <Switch
 checked={field.value}
 onCheckedChange={field.onChange}
 />
 </FormControl>
 </FormItem>
 )}
 />
 </div>

 <div className="flex justify-end gap-sm pt-lg">
 <Button
 type="button"
 variant="outline"
 onClick={() => onOpenChange(false)}
 disabled={isSubmitting}
 >
 Cancel
 </Button>
 <Button type="submit" disabled={isSubmitting}>
 {isSubmitting ? (
 <>
 <Loader2 className="mr-sm h-icon-xs w-icon-xs animate-spin" />
 Creating...
 </>
 ) : (
 <>
 <Plus className="mr-sm h-icon-xs w-icon-xs" />
 Create Dashboard
 </>
 )}
 </Button>
 </div>
 </form>
 </Form>
 </AppDrawer>
 );
}
