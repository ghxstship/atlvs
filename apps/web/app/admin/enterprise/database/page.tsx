import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Progress, Button } from '@ghxstship/ui';
import { Database, HardDrive, Clock, Shield, AlertCircle, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Database Management | Enterprise Dashboard',
  description: 'Database performance, backup status, and disaster recovery',
};

export default function DatabasePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Database Management</h1>
        <p className="text-muted-foreground mt-2">
          Monitor database performance, backup status, and disaster recovery procedures
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Health</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 color-success" />
              <span className="text-2xl font-bold">Healthy</span>
            </div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <Progress value={68} className="mt-2" />
            <p className="text-xs text-muted-foreground">2.1TB of 3TB used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h ago</div>
            <p className="text-xs text-muted-foreground">Next backup in 22h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recovery Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 color-success" />
              <span className="text-2xl font-bold">Ready</span>
            </div>
            <p className="text-xs text-muted-foreground">RTO: 15min, RPO: 1h</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Backup Schedule</CardTitle>
            <CardDescription>Automated backup procedures and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Full Database Backup</p>
                <p className="text-sm text-muted-foreground">Daily at 2:00 AM UTC</p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Incremental Backup</p>
                <p className="text-sm text-muted-foreground">Every 4 hours</p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Transaction Log Backup</p>
                <p className="text-sm text-muted-foreground">Every 15 minutes</p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disaster Recovery</CardTitle>
            <CardDescription>Recovery procedures and testing status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Recovery Procedure Test</p>
                <p className="text-sm text-muted-foreground">Last tested 7 days ago</p>
              </div>
              <Badge variant="default">Passed</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Backup Verification</p>
                <p className="text-sm text-muted-foreground">Automated daily checks</p>
              </div>
              <Badge variant="default">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Failover Readiness</p>
                <p className="text-sm text-muted-foreground">Secondary region sync</p>
              </div>
              <Badge variant="default">Ready</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Database Events</CardTitle>
          <CardDescription>Important database operations and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 color-success mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Backup completed successfully</p>
                <p className="text-xs text-muted-foreground">2 hours ago • Full database backup</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 color-warning mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">High query volume detected</p>
                <p className="text-xs text-muted-foreground">4 hours ago • Performance monitoring</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 color-success mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Recovery test completed</p>
                <p className="text-xs text-muted-foreground">1 day ago • Disaster recovery validation</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
