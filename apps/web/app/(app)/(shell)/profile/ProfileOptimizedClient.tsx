'use client';

import { User, Briefcase, Award, Heart, Globe, Shield, Activity, Clock, FileText, Phone } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { createBrowserClient } from '@/lib/supabase/client';
import { ModuleTemplate } from '@ghxstship/ui/core/templates/ModuleTemplate';
import { DataViewProvider } from '@ghxstship/ui/providers/DataViewProvider';
import { StateManagerProvider } from '@ghxstship/ui/providers/StateManagerProvider';
import { ViewSwitcher, StateManagerProvider, DataViewProvider } from '@ghxstship/ui';
import { DataActions } from '@ghxstship/ui';
import { UnifiedDrawer } from '@ghxstship/ui/unified/drawers/UnifiedDrawer';
import { useToast } from '@ghxstship/ui/hooks/useToast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ghxstship/ui';
import { Card } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Button } from '@ghxstship/ui';
import { Skeleton } from '@ghxstship/ui';
import type { ProfileData, ProfileSection } from './types';

// Optimized configuration with consolidated sections
const PROFILE_SECTIONS: ProfileSection[] = [
 {
 id: 'overview',
 label: 'Overview',
 icon: User,
 component: 'OverviewSection',
 priority: 1
 },
 {
 id: 'professional',
 label: 'Professional',
 icon: Briefcase,
 component: 'ProfessionalSection',
 priority: 2,
 subsections: ['job-history', 'certifications', 'endorsements']
 },
 {
 id: 'personal',
 label: 'Personal',
 icon: Heart,
 component: 'PersonalSection',
 priority: 3,
 subsections: ['basic', 'contact', 'emergency']
 },
 {
 id: 'compliance',
 label: 'Compliance',
 icon: Shield,
 component: 'ComplianceSection',
 priority: 4,
 subsections: ['health', 'travel', 'uniform']
 },
 {
 id: 'activity',
 label: 'Activity',
 icon: Activity,
 component: 'ActivitySection',
 priority: 5,
 subsections: ['history', 'performance']
 }
];

// Virtual list component for performance
const VirtualProfileList = ({ items, height = 600 }: { items: unknown[], height?: number }) => {
 const parentRef = useCallback((node: HTMLDivElement | null) => {
 if (node) {
 virtualizer.measure();
 }
 }, []);

 const virtualizer = useVirtualizer({
 count: items.length,
 getScrollElement: () => parentRef.current,
 estimateSize: () => 80,
 overscan: 5
 });

 return (
 <div
 ref={parentRef}
 style={{ height, overflow: 'auto' }}
 className="relative"
 >
 <div
 style={{
 height: `${virtualizer.getTotalSize()}px`,
 width: '100%',
 position: 'relative'
 }}
 >
 {virtualizer.getVirtualItems().map((virtualItem) => (
 <div
 key={virtualItem.key}
 style={{
 position: 'absolute',
 top: 0,
 left: 0,
 width: '100%',
 height: `${virtualItem.size}px`,
 transform: `translateY(${virtualItem.start}px)`
 }}
 >
 <ProfileItemRow item={items[virtualItem.index]} />
 </div>
 ))}
 </div>
 </div>
 );
};

// Memoized profile item row
const ProfileItemRow = React.memo(({ item }: { item: unknown }) => (
 <Card className="p-md mb-2 hover:shadow-md transition-shadow">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <div className="w-icon-xl h-icon-xl rounded-full bg-primary/10 flex items-center justify-center">
 {item.icon && <item.icon className="w-icon-sm h-icon-sm text-primary" />}
 </div>
 <div>
 <p className="font-medium">{item.label}</p>
 <p className="text-sm text-muted-foreground">{item.value}</p>
 </div>
 </div>
 {item.status && (
 <Badge variant={item.status === 'complete' ? 'success' : 'warning'}>
 {item.status}
 </Badge>
 )}
 </div>
 </Card>
));

ProfileItemRow.displayName = 'ProfileItemRow';

interface ProfileOptimizedClientProps {
 orgId: string;
 userId: string;
}

export default function ProfileOptimizedClient({ orgId, userId }: ProfileOptimizedClientProps) {
 const [loading, setLoading] = useState(true);
 const [profileData, setProfileData] = useState<ProfileData | null>(null);
 const [activeSection, setActiveSection] = useState('overview');
 const [searchQuery, setSearchQuery] = useState('');
 const [drawerOpen, setDrawerOpen] = useState(false);
 const [drawerMode, setDrawerMode] = useState<'view' | 'edit'>('view');
 const { toast } = useToast();
 const supabase = createBrowserClient();

 // Optimized data fetching with pagination
 const fetchProfileData = useCallback(async (section?: string) => {
 try {
 setLoading(true);
 
 // Use pagination for large datasets
 const PAGE_SIZE = 50;
 const query = supabase
 .from('users')
 .select(`
 *,
 memberships!inner(
 organization_id,
 role,
 status
 )
 `)
 .eq('auth_id', userId)
 .range(0, PAGE_SIZE - 1);

 if (section && section !== 'overview') {
 // Fetch only specific section data
 query.select(`${section}_data`);
 }

 const { data, error } = await query.single();

 if (error) throw error;

 setProfileData(data);
 } catch (error) {
 console.error('Error fetching profile:', error);
 toast({
 title: 'Error',
 description: 'Failed to load profile data',
 variant: 'destructive'
 });
 } finally {
 setLoading(false);
 }
 }, [userId, supabase, toast]);

 // Lazy load sections
 useEffect(() => {
 fetchProfileData(activeSection);
 }, [activeSection, fetchProfileData]);

 // Memoized filtered items
 const filteredItems = useMemo(() => {
 if (!profileData) return [];
 
 const items = Object.entries(profileData)
 .filter(([key, value]) => {
 if (!searchQuery) return true;
 return key.toLowerCase().includes(searchQuery.toLowerCase()) ||
 String(value).toLowerCase().includes(searchQuery.toLowerCase());
 })
 .map(([key, value]) => ({
 id: key,
 label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
 value: String(value),
 icon: User,
 status: value ? 'complete' : 'incomplete'
 }));
 
 return items;
 }, [profileData, searchQuery]);

 // Module configuration for template
 const moduleConfig = useMemo(() => ({
 id: 'profile',
 name: 'Profile',
 description: 'User profile management',
 icon: User,
 baseRoute: '/profile',
 tabs: PROFILE_SECTIONS.map(section => ({
 id: section.id,
 label: section.label,
 icon: section.icon,
 route: `/profile/${section.id}`,
 component: section.component
 })),
 permissions: {
 view: ['profile:view'],
 create: ['profile:create'],
 update: ['profile:update'],
 delete: ['profile:delete']
 },
 features: {
 search: true,
 filter: true,
 sort: true,
 export: true,
 import: false,
 bulkActions: false,
 realtime: true
 },
 views: ['grid', 'list', 'kanban'],
 defaultView: 'list'
 }), []);

 if (loading && !profileData) {
 return (
 <div className="space-y-md">
 {[...Array(5)].map((_, i) => (
 <Skeleton key={i} className="h-component-lg w-full" />
 ))}
 </div>
 );
 }

 return (
 <StateManagerProvider>
 <DataViewProvider
 config={{
 module: 'profile',
 defaultView: 'list',
 features: moduleConfig.features
 }}
 >
 <div className="space-y-lg">
 {/* Header with optimized actions */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold">Profile Management</h1>
 <p className="text-muted-foreground">
 Manage your profile information and settings
 </p>
 </div>
 <div className="flex items-center gap-xs">
 <Button
 variant="outline"
 size="sm"
 onClick={() => fetchProfileData(activeSection)}
 >
 Refresh
 </Button>
 <Button
 size="sm"
 onClick={() => {
 setDrawerMode('edit');
 setDrawerOpen(true);
 }}
 >
 Edit Profile
 </Button>
 </div>
 </div>

 {/* Optimized tabs with lazy loading */}
 <Tabs value={activeSection} onValueChange={setActiveSection}>
 <TabsList className="grid grid-cols-5 w-full">
 {PROFILE_SECTIONS.map((section) => (
 <TabsTrigger key={section.id} value={section.id}>
 <section.icon className="w-icon-xs h-icon-xs mr-2" />
 {section.label}
 </TabsTrigger>
 ))}
 </TabsList>

 {PROFILE_SECTIONS.map((section) => (
 <TabsContent key={section.id} value={section.id} className="mt-6">
 <Card className="p-lg">
 <div className="space-y-md">
 {/* Search and filters */}
 <DataActions
 onSearch={setSearchQuery}
 searchPlaceholder={`Search ${section.label.toLowerCase()}...`}
 showViewSwitcher={false}
 showExport={true}
 showFilter={true}
 />

 {/* Virtual list for performance */}
 <VirtualProfileList 
 items={filteredItems} 
 height={600}
 />
 </div>
 </Card>
 </TabsContent>
 ))}
 </Tabs>

 {/* Optimized drawer */}
 <UnifiedDrawer
 open={drawerOpen}
 onClose={() => setDrawerOpen(false)}
 title={drawerMode === 'edit' ? 'Edit Profile' : 'View Profile'}
 size="lg"
 >
 <div className="space-y-lg">
 {/* Drawer content with lazy loading */}
 {drawerMode === 'edit' ? (
 <ProfileEditForm 
 data={profileData} 
 onSave={async (data) => {
 // Save logic
 setDrawerOpen(false);
 await fetchProfileData(activeSection);
 }}
 />
 ) : (
 <ProfileViewDetails data={profileData} />
 )}
 </div>
 </UnifiedDrawer>
 </div>
 </DataViewProvider>
 </StateManagerProvider>
 );
}

// Lazy loaded edit form component
const ProfileEditForm = React.lazy(() => import('./components/ProfileEditForm'));

// Lazy loaded view details component 
const ProfileViewDetails = React.lazy(() => import('./components/ProfileViewDetails'));
