import { Card } from '@ghxstship/ui';

export const metadata = { title: 'Settings · Security' };

export default function SettingsSecurityPage() {
  return (
    <div className="space-y-4">
      <Card title="Settings · Security">
        <div className="text-body-sm color-foreground/70">Placeholder: 2FA, SSO/SAML, sessions, device management.</div>
      </Card>
    </div>
  );
}
