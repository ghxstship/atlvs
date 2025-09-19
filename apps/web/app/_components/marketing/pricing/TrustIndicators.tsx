import { Shield, Zap, Users, Globe } from 'lucide-react';

const trustIndicators = [
  { icon: Shield, text: '14-day free trial', color: 'color-success' },
  { icon: Zap, text: 'No setup fees', color: 'color-primary' },
  { icon: Users, text: 'Cancel anytime', color: 'color-primary' },
  { icon: Globe, text: '24/7 support', color: 'color-secondary' },
];

export function TrustIndicators() {
  return (
    <div className="text-center mt-lg mb-xl">
      <div className="flex flex-wrap justify-center items-center gap-xl md:gap-xl text-body-sm color-muted">
        {trustIndicators.map((indicator: any) => {
          const Icon = indicator.icon;
          return (
            <div key={indicator.text} className="flex items-center gap-xl  px-md py-md rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <Icon className={`h-4 w-4 ${indicator.color}`} />
              <span className="whitespace-nowrap">{indicator.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
