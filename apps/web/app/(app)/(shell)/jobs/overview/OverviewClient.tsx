'use client';


import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Button, Badge, Skeleton } from '@ghxstship/ui';
import { 
  BriefcaseIcon, 
  ClipboardDocumentListIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowRightIcon,
  ChartBarIcon,
  CalendarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface OverviewClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface JobsStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  draftJobs: number;
  totalOpportunities: number;
  activeBids: number;
  activeContracts: number;
  pendingCompliance: number;
  totalAssignments: number;
  activeRFPs: number;
}

interface RecentActivity {
  id: string;
  type: 'job' | 'opportunity' | 'bid' | 'contract' | 'assignment' | 'compliance' | 'rfp';
  title: string;
  status: string;
  updatedAt: string;
  priority?: 'high' | 'medium' | 'low';
}

const QUICK_ACTIONS = [
  {
    title: 'Create New Job',
    description: 'Start a new job posting',
    href: '/jobs?action=create',
    icon: BriefcaseIcon,
    color: 'bg-accent',
  },
  {
    title: 'Browse Opportunities',
    description: 'View available opportunities',
    href: '/jobs/opportunities',
    icon: ClipboardDocumentListIcon,
    color: 'bg-success',
  },
  {
    title: 'Submit New Bid',
    description: 'Create a new bid proposal',
    href: '/jobs/bids?action=create',
    icon: DocumentTextIcon,
    color: 'bg-secondary',
  },
  {
    title: 'Review Compliance',
    description: 'Check compliance status',
    href: '/jobs/compliance',
    icon: CheckCircleIcon,
    color: 'bg-warning',
  },
];

export function OverviewClient({ user, orgId, translations }: OverviewClientProps) {
  const [stats, setStats] = useState<JobsStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    loadOverviewData();
  }, [orgId]);

  const loadOverviewData = async () => {
    try {
      setLoading(true);

      // Load jobs stats
      const [
        jobsResult,
        opportunitiesResult,
        bidsResult,
        contractsResult,
        assignmentsResult,
        complianceResult,
        rfpsResult
      ] = await Promise.all([
        supabase.from('jobs').select('status').eq('organization_id', orgId),
        supabase.from('opportunities').select('status').eq('organization_id', orgId),
        supabase.from('job_bids').select('status').eq('organization_id', orgId),
        supabase.from('job_contracts').select('status').eq('organization_id', orgId),
        supabase.from('job_assignments').select('status').eq('organization_id', orgId),
        supabase.from('job_compliance').select('status').eq('organization_id', orgId),
        supabase.from('rfps').select('status').eq('organization_id', orgId)
      ]);

      const jobs = jobsResult.data || [];
      const opportunities = opportunitiesResult.data || [];
      const bids = bidsResult.data || [];
      const contracts = contractsResult.data || [];
      const assignments = assignmentsResult.data || [];
      const compliance = complianceResult.data || [];
      const rfps = rfpsResult.data || [];

      setStats({
        totalJobs: jobs.length,
        activeJobs: jobs.filter((j: any) => j.status === 'in_progress').length,
        completedJobs: jobs.filter((j: any) => j.status === 'completed').length,
        draftJobs: jobs.filter((j: any) => j.status === 'draft').length,
        totalOpportunities: opportunities.length,
        activeBids: bids.filter((b: any) => b.status === 'submitted' || b.status === 'under_review').length,
        activeContracts: contracts.filter((c: any) => c.status === 'active').length,
        pendingCompliance: compliance.filter((c: any) => c.status === 'pending').length,
        totalAssignments: assignments.length,
        activeRFPs: rfps.filter((r: any) => r.status === 'open').length,
      });

      // Load recent activity (combining multiple sources)
      const recentJobs = await supabase
        .from('jobs')
        .select('id, title, status, updated_at')
        .eq('organization_id', orgId)
        .order('updated_at', { ascending: false })
        .limit(3);

      const recentOpportunities = await supabase
        .from('opportunities')
        .select('id, title, status, updated_at')
        .eq('organization_id', orgId)
        .order('updated_at', { ascending: false })
        .limit(2);

      const activity: RecentActivity[] = [
        ...(recentJobs.data || []).map((job: any) => ({
          id: job.id,
          type: 'job' as const,
          title: job.title,
          status: job.status,
          updatedAt: job.updated_at,
        })),
        ...(recentOpportunities.data || []).map((opp: any) => ({
          id: opp.id,
          type: 'opportunity' as const,
          title: opp.title,
          status: opp.status,
          updatedAt: opp.updated_at,
        })),
      ];

      // Sort by updated_at and take top 5
      activity.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setRecentActivity(activity.slice(0, 5));

    } catch (error) {
      console.error('Error loading overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-success/10 color-success';
      case 'completed': return 'bg-accent/10 color-accent';
      case 'pending': return 'bg-warning/10 color-warning';
      case 'draft': return 'bg-secondary/10 color-muted';
      case 'cancelled': return 'bg-destructive/10 color-destructive';
      default: return 'bg-secondary/10 color-muted';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job':
        return BriefcaseIcon;
      case 'opportunity':
        return ClipboardDocumentListIcon;
      case 'bid':
        return DocumentTextIcon;
      case 'contract':
        return CheckCircleIcon;
      case 'assignment':
        return CalendarIcon;
      case 'compliance':
        return ExclamationTriangleIcon;
      default:
        return BriefcaseIcon;
    }
  };

  return (
    <div className="stack-lg">
      {/* Header */}
      <div>
        <h1 className="text-heading-3 text-heading-3 color-foreground">{translations.title}</h1>
        <p className="text-body-sm color-foreground/70 mt-xs">{translations.subtitle}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-md">
              <Skeleton className="h-4 w-20 mb-sm" />
              <Skeleton className="h-8 w-12" />
            </Card>
          ))
        ) : (
          <>
            <Card className="p-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm form-label color-foreground/70">Total Jobs</p>
                  <p className="text-heading-3 text-heading-3 color-foreground">{stats?.totalJobs || 0}</p>
                </div>
                <BriefcaseIcon className="h-8 w-8 color-accent" />
              </div>
            </Card>

            <Card className="p-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm form-label color-foreground/70">Active Jobs</p>
                  <p className="text-body-sm color-muted">{stats?.activeJobs || 0} active</p>
                </div>
                <ChartBarIcon className="h-8 w-8 color-success" />
              </div>
            </Card>

            <Card className="p-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="color-muted">Monitor job performance and manage opportunities.</p>
                  <p className="text-heading-3 text-heading-3 color-success">{stats?.totalOpportunities || 0}</p>
                </div>
                <ClipboardDocumentListIcon className="h-8 w-8 color-success" />
              </div>
            </Card>

            <Card className="p-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm form-label color-foreground/70">Active Bids</p>
                  <p className="text-body-sm color-muted">{stats?.activeBids || 0} active bids</p>
                </div>
                <DocumentTextIcon className="h-8 w-8 color-secondary" />
              </div>
            </Card>

            <Card className="p-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-body-sm color-muted">tracts</span>
                  <p className="text-heading-3 text-heading-3 color-secondary">{stats?.activeContracts || 0}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 color-accent" />
              </div>
            </Card>

            <Card className="p-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm form-label color-foreground/70">Assignments</p>
                  <p className="text-body-sm color-muted">{stats?.totalAssignments || 0} assignments</p>
                </div>
                <DocumentTextIcon className="h-8 w-8 color-warning" />
              </div>
            </Card>

            <Card className="p-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm color-muted">Pending Compliance</p>
                  <h1 className="text-heading-3 text-heading-3 color-foreground">{stats?.pendingCompliance || 0}</h1>
                </div>
                <ExclamationTriangleIcon className="h-8 w-8 color-warning" />
              </div>
            </Card>

            <Card className="p-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm form-label color-foreground/70">Active RFPs</p>
                  <p className="text-body-sm color-muted">{stats?.activeRFPs || 0} active RFPs</p>
                </div>
                <DocumentTextIcon className="h-8 w-8 color-accent" />
              </div>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Quick Actions */}
        <Card title="Quick Actions" className="p-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            {QUICK_ACTIONS.map((action: any) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} href="#">
                  <div className="flex items-center p-md rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer">
                    <div className={`p-sm rounded-lg ${action.color} text-background mr-sm`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm form-label color-foreground truncate">
                        {action.title}
                      </p>
                      <p className="text-body-sm color-foreground/70 truncate">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 color-foreground/40" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity" className="p-lg">
          {loading ? (
            <div className="stack-sm">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center cluster-sm">
                  <div className="w-3 h-3 bg-secondary rounded"></div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="stack-sm">
              {recentActivity.map((activity: any) => {
                const Icon = getTypeIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-center justify-between p-sm rounded-lg border border-border">
                    <div className="flex items-center cluster-sm">
                      <Icon className="h-5 w-5 color-foreground/60" />
                      <div>
                        <p className="text-body-sm form-label color-foreground truncate">
                          {activity.title}
                        </p>
                        <p className="text-body-sm color-foreground/70 capitalize">
                          {activity.type} • {new Date(activity.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status.replace('_', ' ')}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-xl">
              <BriefcaseIcon className="h-12 w-12 color-muted mx-auto mb-sm" />
              <p className="text-body-sm color-muted">No recent activity</p>
              <p className="text-body-sm color-muted mt-xs">
                Create your first job to get started
              </p>
            </div>
          )}
          
          {recentActivity.length > 0 && (
            <div className="mt-md pt-md border-t border-border">
              <Link href="/jobs">
                <Button className="w-full">
                  View All Jobs
                  <ArrowRightIcon className="h-4 w-4 ml-sm" />
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
