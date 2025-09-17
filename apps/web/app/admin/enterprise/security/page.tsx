import { Metadata } from 'next';
import SecurityDashboard from '../../../_components/enterprise/security-dashboard';

export const metadata: Metadata = {
  title: 'Security Dashboard | Enterprise Dashboard',
  description: 'Security events, threat detection, and compliance monitoring',
};

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor security events, threat detection, and compliance status
        </p>
      </div>
      
      <SecurityDashboard />
    </div>
  );
}
