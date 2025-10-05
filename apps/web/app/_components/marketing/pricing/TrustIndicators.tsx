import { Shield, Zap, Users, Globe } from 'lucide-react';

interface TrustIndicatorItem {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  color: string;
}

const trustIndicators: TrustIndicatorItem[] = [
  { icon: Shield, text: '14-day free trial', color: 'color-success' },
  { icon: Zap, text: 'No setup fees', color: 'color-accent' },
  { icon: Users, text: 'Cancel anytime', color: 'color-accent' },
  { icon: Globe, text: '24/7 support', color: 'color-secondary' },
];

export function TrustIndicators() {
  return (
    <div className="text-center mt-lg mb-xl">
      <div className="flex flex-wrap justify-center items-center gap-xl md:gap-xl text-body-sm color-muted">
        {trustIndicators.map((indicator: TrustIndicatorItem) => {
          const Icon = indicator.icon;
          return (
            <div key={indicator.text} className="flex items-center gap-xl  px-md py-md rounded-lg bg-accent color-accent-foreground hover:bg-accent/90 transition-colors">
              <Icon className={`h-icon-xs w-icon-xs ${indicator.color}`} />
              <span className="whitespace-nowrap">{indicator.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
