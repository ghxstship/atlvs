import { Card } from '@ghxstship/ui';

export const dynamic = 'force-dynamic';


export const metadata = {
  title: 'Settings · Account',
};

export default function SettingsAccount() {
  return (
    <div className="stack-md">
      <Card title="Account Settings">
        <div className="text-body-sm color-foreground/70">
          Placeholder: Profile details, password, 2FA, sessions, API keys.
        </div>
      </Card>
    </div>
  );
}
