import { Card } from '@ghxstship/ui';
import BillingPortalClient from './BillingPortalClient';
import Plans from './Plans';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'Settings · Billing' };

export default function SettingsBillingPage() {
  return (
    <div className="stack-md">
      <Card title="Settings · Billing">
        <div className="text-body-sm color-foreground/70">Manage your subscription and payment methods.</div>
        <div className="mt-md">
          <BillingPortalClient />
        </div>
      </Card>
      <Card title="Plans">
        <Plans />
      </Card>
    </div>
  );
}
