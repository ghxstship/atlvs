/**
 * GHXSTSHIP Dashboard Service
 * Enterprise-grade service layer for dashboard analytics and management
 */

import { createBrowserClient } from '@ghxstship/auth';
import type {
  ActivityItem,
  DashboardListItem,
  DashboardQuickInsight,
  DashboardTemplate,
  DashboardWidget,
  OverviewMetric,
  WidgetData
} from '../types';

type WidgetRow = DashboardWidget & {
  dashboard_id: string;
};

type DashboardInsertPayload = {
  name?: string;
  description?: string;
  slug?: string;
  layout?: 'grid' | 'masonry' | 'flex' | 'tabs' | 'accordion' | 'sidebar' | 'fullscreen';
  settings?: Record<string, unknown>;
  is_default?: boolean;
  is_template?: boolean;
  is_public?: boolean;
  tags?: string;
  type?: 'system' | 'custom' | 'template';
  access_level?: 'private' | 'team' | 'organization' | 'public';
};

type DashboardCreatePayload = {
  name: string;
  description?: string;
  slug?: string;
  layout?: 'grid' | 'masonry' | 'flex' | 'tabs' | 'accordion' | 'sidebar' | 'fullscreen';
  settings?: Record<string, unknown>;
  is_default?: boolean;
  is_template?: boolean;
  is_public?: boolean;
  tags?: string;
  type?: 'system' | 'custom' | 'template';
  access_level?: 'private' | 'team' | 'organization' | 'public';
};

const unwrapSingle = <T>(value: T | T[] | null | undefined): T | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value ?? undefined;
};

export class DashboardService {
  private supabase = createBrowserClient();

  /**
   * Dashboard CRUD
   */
  async getDashboards(orgId: string): Promise<DashboardListItem[]> {
    const { data, error } = await this.supabase
      .from('dashboards')
      .select(`
        *,
        dashboard_widgets(count),
        dashboard_shares(count),
        created_by_user:users!dashboards_created_by_fkey(id, email, full_name)
      `)
      .eq('organization_id', orgId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((dashboard) => {
      const widgetInfo = unwrapSingle<{ count?: number }>(dashboard.dashboard_widgets);
      const shareInfo = unwrapSingle<{ count?: number }>(dashboard.dashboard_shares);

      return {
        ...dashboard,
        widget_count: widgetInfo?.count ?? 0,
        share_count: shareInfo?.count ?? 0
      } as DashboardListItem;
    });
  }

  async createDashboard(orgId: string, payload: DashboardCreatePayload): Promise<DashboardListItem> {
    const { data, error } = await this.supabase
      .from('dashboards')
      .insert({
        name: payload.name,
        description: payload.description,
        type: payload.type ?? 'custom',
        layout: payload.layout ?? [],
        settings: payload.settings ?? {},
        is_default: payload.is_default ?? false,
        is_public: payload.is_public ?? false,
        tags: payload.tags ?? [],
        organization_id: orgId,
        access_level: payload.access_level ?? 'organization'
      })
      .select(`
        *,
        dashboard_widgets(count),
        dashboard_shares(count),
        created_by_user:users!dashboards_created_by_fkey(id, email, full_name)
      `)
      .single();

    if (error || !data) {
      throw error ?? new Error('Failed to create dashboard');
    }

    const widgetInfo = unwrapSingle<{ count?: number }>(data.dashboard_widgets);
    const shareInfo = unwrapSingle<{ count?: number }>(data.dashboard_shares);

    return {
      ...data,
      widget_count: widgetInfo?.count ?? 0,
      share_count: shareInfo?.count ?? 0
    } as DashboardListItem;
  }

  async updateDashboard(orgId: string, id: string, payload: DashboardInsertPayload): Promise<DashboardListItem> {
    const updates: Record<string, unknown> = {};

    if (payload.name !== undefined) updates.name = payload.name;
    if (payload.description !== undefined) updates.description = payload.description;
    if (payload.layout !== undefined) updates.layout = payload.layout;
    if (payload.settings !== undefined) updates.settings = payload.settings;
    if (payload.is_default !== undefined) updates.is_default = payload.is_default;
    if (payload.is_public !== undefined) updates.is_public = payload.is_public;
    if (payload.tags !== undefined) updates.tags = payload.tags;
    if (payload.type !== undefined) updates.type = payload.type;
    if (payload.access_level !== undefined) updates.access_level = payload.access_level;

    if (Object.keys(updates).length === 0) {
      const existing = await this.getDashboards(orgId);
      const dashboard = existing.find((d) => d.id === id);
      if (!dashboard) {
        throw new Error('Dashboard not found');
      }
      return dashboard;
    }

    const { data, error } = await this.supabase
      .from('dashboards')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', orgId)
      .select(`
        *,
        dashboard_widgets(count),
        dashboard_shares(count),
        created_by_user:users!dashboards_created_by_fkey(id, email, full_name)
      `)
      .single();

    if (error || !data) {
      throw error ?? new Error('Failed to update dashboard');
    }

    return {
      ...data,
      widget_count: data.dashboard_widgets?.[0]?.count ?? 0,
      share_count: data.dashboard_shares?.[0]?.count ?? 0
    };
  }

  async deleteDashboard(orgId: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .from('dashboards')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) throw error;
  }

  /**
   * Metrics & Insights
   */
  async getDashboardOverviewMetrics(orgId: string): Promise<OverviewMetric[]> {
    const { data, error } = await this.supabase
      .from('dashboards')
      .select(`
        id,
        is_public,
        is_default,
        updated_at,
        dashboard_widgets(count),
        dashboard_shares(count)
      `)
      .eq('organization_id', orgId);

    if (error) throw error;

    const dashboards = data || [];
    const total = dashboards.length;
    const shared = dashboards.filter((d) => (d.dashboard_shares?.[0]?.count ?? 0) > 0).length;
    const active = dashboards.filter((d) => {
      const updatedAt = d.updated_at ? new Date(d.updated_at) : null;
      if (!updatedAt) return false;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return updatedAt >= thirtyDaysAgo;
    }).length;
    const widgetCounts = dashboards.map((d) => d.dashboard_widgets?.[0]?.count ?? 0);
    const avgWidgets = widgetCounts.length
      ? Math.round(widgetCounts.reduce((sum, count) => sum + count, 0) / widgetCounts.length)
      : 0;

    return [
      {
        id: 'total_dashboards',
        label: 'Total Dashboards',
        value: total,
        format: 'number',
        color: 'blue',
        icon: 'layout'
      },
      {
        id: 'shared_dashboards',
        label: 'Shared Dashboards',
        value: shared,
        format: 'number',
        color: 'purple',
        icon: 'users'
      },
      {
        id: 'active_dashboards',
        label: 'Active (30d)',
        value: active,
        format: 'number',
        color: 'green',
        icon: 'activity'
      },
      {
        id: 'average_widgets',
        label: 'Average Widgets',
        value: avgWidgets,
        format: 'number',
        color: 'orange',
        icon: 'grid'
      }
    ];
  }

  async getQuickInsights(orgId: string): Promise<DashboardQuickInsight[]> {
    const [dashboards, activities] = await Promise.all([
      this.supabase
        .from('dashboards')
        .select(`
          id,
          name,
          is_default,
          is_public,
          dashboard_widgets(count),
          dashboard_shares(count)
        `)
        .eq('organization_id', orgId),
      this.supabase
        .from('dashboard_activity')
        .select('id')
        .eq('organization_id', orgId)
        .gte('occurred_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    const dashboardData = dashboards.data || [];
    const activityCount = activities.data?.length || 0;

    const topWidgets = dashboardData
      .map((d) => ({
        id: d.id,
        widgets: unwrapSingle<{ count?: number }>(d.dashboard_widgets)?.count ?? 0
      }))
      .sort((a, b) => b.widgets - a.widgets);

    return [
      {
        id: 'default_dashboard',
        title: 'Default Dashboard',
        description: 'Primary dashboard used for new sessions',
        value: dashboardData.find((d) => d.is_default)?.name ?? 'Not Configured',
        format: 'text',
        link: '/analytics/dashboards'
      },
      {
        id: 'activity_7d',
        title: 'Activity (7 days)',
        description: 'Number of dashboard interactions captured',
        value: activityCount,
        format: 'number',
        trend: activityCount > 25 ? 'up' : activityCount < 10 ? 'down' : 'flat'
      },
      {
        id: 'top_dashboard',
        title: 'Most Widget-Rich',
        description: 'Dashboard with the largest widget library',
        value: topWidgets[0]?.widgets ?? 0,
        format: 'number',
        link: topWidgets[0] ? `/analytics/dashboards/${topWidgets[0].id}` : undefined
      },
      {
        id: 'shared_visibility',
        title: 'Shared Visibility',
        description: 'Dashboards visible outside the organization',
        value: `${dashboardData.filter((d) => d.is_public).length}/${dashboardData.length}`,
        format: 'text'
      }
    ];
  }

  async getOverviewMetrics(orgId: string, module: string): Promise<OverviewMetric[]> {
    if (module === 'dashboard') {
      return this.getDashboardOverviewMetrics(orgId);
    }

    return [];
  }

  async getRecentActivity(orgId: string, limit = 20): Promise<ActivityItem[]> {
    const { data, error } = await this.supabase
      .from('dashboard_activity')
      .select(`
        id,
        action,
        details,
        occurred_at,
        user:users!dashboard_activity_user_id_fkey(full_name, avatar_url),
        dashboard:dashboards(name)
      `)
      .eq('organization_id', orgId)
      .order('occurred_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((activity) => {
      const dashboardInfo = unwrapSingle<{ name?: string }>(activity.dashboard);
      const userInfo = unwrapSingle<{ full_name?: string | null; avatar_url?: string | null }>(activity.user);

      return {
        id: activity.id,
        type: 'dashboard',
        title: activity.action,
        description: dashboardInfo?.name ?? 'Dashboard',
        user_name: userInfo?.full_name ?? 'System',
        user_avatar: userInfo?.avatar_url ?? undefined,
        timestamp: activity.occurred_at,
        metadata: activity.details ?? {},
        action_url: '/analytics/dashboards'
      } satisfies ActivityItem;
    });
  }

  /**
   * Widget Data
   */
  async getWidgetData(widget: DashboardWidget): Promise<WidgetData> {
    const start = Date.now();

    try {
      let data: unknown[] = [];

      switch (widget.config.dataSource) {
        case 'dashboard':
          data = await this.getDashboardData(widget.organization_id);
          break;
        default:
          data = [];
      }

      return {
        widget_id: widget.id,
        data,
        metadata: {
          total_count: data.length,
          last_updated: new Date().toISOString(),
          query_time_ms: Date.now() - start,
          cache_hit: false
        }
      };
    } catch (error) {
      return {
        widget_id: widget.id,
        data: [],
        metadata: {
          last_updated: new Date().toISOString(),
          query_time_ms: Date.now() - start,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  private async getDashboardData(orgId: string) {
    const { data, error } = await this.supabase
      .from('dashboards')
      .select('id, name, type, is_public, is_default, updated_at')
      .eq('organization_id', orgId)
      .order('updated_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  }

  /**
   * Dashboard widgets
   */
  async addWidget(widget: Omit<WidgetRow, 'id' | 'created_at' | 'updated_at'>): Promise<DashboardWidget> {
    const { data, error } = await this.supabase
      .from('dashboard_widgets')
      .insert(widget)
      .select('*')
      .single();

    if (error || !data) {
      throw error ?? new Error('Failed to create widget');
    }

    return data;
  }

  async updateWidget(id: string, payload: Partial<WidgetRow>): Promise<DashboardWidget> {
    const { data, error } = await this.supabase
      .from('dashboard_widgets')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      throw error ?? new Error('Failed to update widget');
    }

    return data;
  }

  async deleteWidget(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('dashboard_widgets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Dashboard templates
   */
  async getDashboardTemplates(): Promise<DashboardTemplate[]> {
    const { data, error } = await this.supabase
      .from('dashboard_templates')
      .select('*')
      .eq('is_public', true)
      .order('usage_count', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
