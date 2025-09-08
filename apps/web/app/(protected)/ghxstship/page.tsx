import { Card } from '@ghxstship/ui';
import FeatureGate from '../../components/FeatureGate';

export const metadata = { title: 'GHXSTSHIP' };

export default function GhxstshipLanding() {
  return (
    <FeatureGate feature="ghxstship">
      <div className="space-y-4" data-brand="ghxstship">
        <Card title="GHXSTSHIP Marketing">
          <p className="text-sm opacity-80">Landing, docs, pricing, careers, and contact will be implemented here using MDX and CMS-ready routes.</p>
        </Card>
      </div>
    </FeatureGate>
  );
}
