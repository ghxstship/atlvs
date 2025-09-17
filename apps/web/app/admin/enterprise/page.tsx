import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@ghxstship/ui';
import { Shield, Activity, Database, Users, Settings, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Enterprise Dashboard | GHXSTSHIP',
  description: 'Enterprise-grade monitoring, security, and compliance dashboard',
};

export default function EnterprisePage() {
  const dashboardSections = [
    {
      title: 'System Monitoring',
      description: 'Real-time system health, performance metrics, and capacity planning',
      href: '/admin/enterprise/monitoring',
      icon: Activity,
      color: 'color-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Security Dashboard',
      description: 'Security events, threat detection, and compliance monitoring',
      href: '/admin/enterprise/security',
      icon: Shield,
      color: 'color-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Database Management',
      description: 'Database performance, backup status, and disaster recovery',
      href: '/admin/enterprise/database',
      icon: Database,
      color: 'color-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'User Management',
      description: 'Enterprise user access, roles, and authentication settings',
      href: '/admin/enterprise/users',
      icon: Users,
      color: 'color-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'System Configuration',
      description: 'Enterprise settings, integrations, and feature toggles',
      href: '/admin/enterprise/settings',
      icon: Settings,
      color: 'color-muted',
      bgColor: 'bg-muted/30',
    },
    {
      title: 'Incident Management',
      description: 'Security incidents, alerts, and response procedures',
      href: '/admin/enterprise/incidents',
      icon: AlertTriangle,
      color: 'color-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enterprise Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive enterprise-grade monitoring, security, and management tools
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dashboardSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href as any} className="block">
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${section.bgColor}`}>
                      <Icon className={`h-5 w-5 ${section.color}`} />
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {section.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Enterprise Features Status
            </CardTitle>
            <CardDescription>
              Overview of enabled enterprise capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-success rounded-full" />
                <span className="text-sm">Advanced Monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-success rounded-full" />
                <span className="text-sm">Security Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-success rounded-full" />
                <span className="text-sm">Compliance Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-success rounded-full" />
                <span className="text-sm">Disaster Recovery</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
