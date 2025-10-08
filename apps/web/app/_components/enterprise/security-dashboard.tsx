'use client';


import { Card, CardBody, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Shield, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SecurityDashboard() {
  return (
    <div className="stack-lg">
      <div className="grid gap-md md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-sm">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-icon-xs w-icon-xs text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold color-success">A+</div>
            <p className="text-xs text-muted-foreground">Overall security rating</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-sm">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Lock className="h-icon-xs w-icon-xs text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">Authenticated users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-sm">
            <CardTitle className="text-sm font-medium">Threats Blocked</CardTitle>
            <AlertTriangle className="h-icon-xs w-icon-xs text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold color-destructive">24</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-sm">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <CheckCircle className="h-icon-xs w-icon-xs text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold color-success">100%</div>
            <p className="text-xs text-muted-foreground">SOC 2 compliant</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
