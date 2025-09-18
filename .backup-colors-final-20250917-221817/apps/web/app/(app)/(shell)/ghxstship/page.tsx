import { Card } from '@ghxstship/ui';
import FeatureGate from '../../../_components/FeatureGate';

export const metadata = { title: 'GHXSTSHIP' };

export default function GhxstshipLanding() {
  return (
    <FeatureGate feature="ghxstship">
      <div className="stack-md" data-brand="ghxstship">
        <Card title="GHXSTSHIP Marketing">
          <p className="text-body-sm opacity-80">Landing, docs, pricing, careers, and contact will be implemented here using MDX and CMS-ready routes.</p>
        </Card>
      </div>
    </FeatureGate>
  );
}
