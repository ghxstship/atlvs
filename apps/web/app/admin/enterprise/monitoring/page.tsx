import { Metadata } from 'next';
import MonitoringDashboard from '../../../_components/enterprise/monitoring-dashboard';

export const metadata: Metadata = {
  title: 'System Monitoring | Enterprise Dashboard',
  description: 'Real-time system health, performance metrics, and capacity planning',
};

export default function MonitoringPage() {
  return (
    <div className="stack-lg">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
        <p className="text-muted-foreground mt-2">
          Real-time monitoring of system health, performance metrics, and capacity planning
        </p>
      </div>
      
      <MonitoringDashboard />
    </div>
  );
}
