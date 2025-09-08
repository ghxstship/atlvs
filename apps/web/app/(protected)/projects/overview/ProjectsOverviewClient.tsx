'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Badge, Button } from '@ghxstship/ui';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Plus,
  ArrowRight
} from 'lucide-react';

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalRisks: number;
  highRisks: number;
}

interface RecentProject {
  id: string;
  name: string;
  status: string;
  budget: number;
  created_at: string;
  tasks_count?: number;
  completion_percentage?: number;
}

export default function ProjectsOverviewClient({ orgId }: { orgId: string }) {
  const t = useTranslations('projects');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const sb = createBrowserClient();

  useEffect(() => {
    loadOverviewData();
  }, [orgId]);

  async function loadOverviewData() {
    setLoading(true);
    try {
      // Load projects
      const { data: projects } = await sb
        .from('projects')
        .select('*')
        .eq('organization_id', orgId);

      // Load tasks
      const { data: tasks } = await sb
        .from('tasks')
        .select('*')
        .eq('organization_id', orgId);

      // Load risks
      const { data: risks } = await sb
        .from('risks')
        .select('*')
        .eq('organization_id', orgId);

      if (projects) {
        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const activeProjects = projects.filter(p => p.status === 'active').length;
        const completedProjects = projects.filter(p => p.status === 'completed').length;

        const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
        const overdueTasks = tasks?.filter(t => 
          t.due_at && new Date(t.due_at) < new Date() && t.status !== 'done'
        ).length || 0;

        const highRisks = risks?.filter(r => 
          r.impact === 'high' || r.impact === 'very_high'
        ).length || 0;

        setStats({
          totalProjects: projects.length,
          activeProjects,
          completedProjects,
          totalBudget,
          totalTasks: tasks?.length || 0,
          completedTasks,
          overdueTasks,
          totalRisks: risks?.length || 0,
          highRisks
        });

        // Set recent projects (last 5)
        setRecentProjects(
          projects
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
        );
      }
    } catch (error) {
      console.error('Error loading overview data:', error);
      setError('Failed to load overview data');
    } finally {
      setLoading(false);
    }
  }

  async function onSeedDemo() {
    setSeedLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/organizations/${orgId}/demo`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Request failed');
      setMessage(t('empty.seeded'));
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('demo.seeded', { organization_id: orgId });
      }
      await loadOverviewData(); // Refresh data after seeding
      router.refresh();
    } catch (e: any) {
      setError(e?.message || t('empty.error'));
    } finally {
      setSeedLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats || stats.totalProjects === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
        <p className="text-gray-600 mb-6">Get started by creating your first project or seeding demo data.</p>
        <div className="flex items-center justify-center gap-4">
          <Button onClick={() => router.push('/projects?create=true')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
          <Button 
            variant="outline" 
            onClick={onSeedDemo}
            disabled={seedLoading}
          >
            {seedLoading ? 'Seeding...' : 'Seed Demo Data'}
          </Button>
        </div>
        {message && (
          <div className="mt-4 text-green-600 text-sm">{message}</div>
        )}
        {error && (
          <div className="mt-4 text-red-600 text-sm">{error}</div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold">{stats.totalProjects}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600">{stats.activeProjects} active</span>
            <span className="mx-2">•</span>
            <span className="text-gray-600">{stats.completedProjects} completed</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Across all projects
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasks Progress</p>
              <p className="text-2xl font-bold">
                {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600">{stats.completedTasks} done</span>
            <span className="mx-2">•</span>
            <span className="text-red-600">{stats.overdueTasks} overdue</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Risk Status</p>
              <p className="text-2xl font-bold">{stats.totalRisks}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <div className="mt-2 text-sm">
            <span className="text-red-600">{stats.highRisks} high priority</span>
          </div>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Projects</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/projects')}
          >
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="space-y-3">
          {recentProjects.map((project) => (
            <div 
              key={project.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => router.push('/projects/' + project.id as any)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium">{project.name}</h4>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {formatCurrency(project.budget || 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => router.push('/projects?create=true')}
          >
            <Plus className="w-6 h-6" />
            <span>Create Project</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => router.push('/projects/tasks')}
          >
            <Clock className="w-6 h-6" />
            <span>View Tasks</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => router.push('/projects/risks')}
          >
            <AlertTriangle className="w-6 h-6" />
            <span>Manage Risks</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
