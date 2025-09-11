import { Shield, Zap, Users, Globe } from 'lucide-react';

const trustIndicators = [
  { icon: Shield, text: '14-day free trial', color: 'text-success' },
  { icon: Zap, text: 'No setup fees', color: 'text-primary' },
  { icon: Users, text: 'Cancel anytime', color: 'text-primary' },
  { icon: Globe, text: '24/7 support', color: 'text-secondary' },
];

export function TrustIndicators() {
  return (
    <div className="text-center mt-12 mb-16">
      <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-sm text-muted-foreground">
        {trustIndicators.map((indicator) => {
          const Icon = indicator.icon;
          return (
            <div key={indicator.text} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <Icon className={`h-4 w-4 ${indicator.color}`} />
              <span className="whitespace-nowrap">{indicator.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
