import { Card } from '@ghxstship/ui';
import BillingPortalClient from './BillingPortalClient';
import Plans from './Plans';

export const metadata = { title: 'Settings · Billing' };

export default function SettingsBillingPage() {
  return (
    <div className="space-y-4">
      <Card title="Settings · Billing">
        <div className="text-sm text-foreground/70">Manage your subscription and payment methods.</div>
        <div className="mt-4">
          <BillingPortalClient />
        </div>
      </Card>
      <Card title="Plans">
        <Plans />
      </Card>
    </div>
  );
}
