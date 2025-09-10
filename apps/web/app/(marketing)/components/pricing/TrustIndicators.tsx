import { Shield, Zap, Users, Globe } from 'lucide-react';

const trustIndicators = [
  { icon: Shield, text: '14-day free trial', color: 'text-green-500' },
  { icon: Zap, text: 'No setup fees', color: 'text-primary' },
  { icon: Users, text: 'Cancel anytime', color: 'text-blue-500' },
  { icon: Globe, text: '24/7 support', color: 'text-purple-500' },
];

export function TrustIndicators() {
  return (
    <div className="text-center mb-16">
      <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
        {trustIndicators.map((indicator) => {
          const Icon = indicator.icon;
          return (
            <div key={indicator.text} className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${indicator.color}`} />
              <span>{indicator.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
