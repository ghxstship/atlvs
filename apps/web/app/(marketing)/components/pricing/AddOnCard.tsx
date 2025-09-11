import { Card, CardContent, Button } from '@ghxstship/ui';
import { Check } from 'lucide-react';
import { typography } from '../../lib/typography';

interface AddOn {
  name: string;
  description: string;
  price: number;
  features: string[];
}

interface AddOnCardProps {
  addon: AddOn;
  onAddToPlan?: () => void;
}

export function AddOnCard({ addon, onAddToPlan }: AddOnCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 h-full flex flex-col">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="text-center mb-6">
          <h3 className={`${typography.cardTitle} mb-3`}>{addon.name}</h3>
          <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{addon.description}</p>
          <div className="flex items-baseline justify-center gap-2">
            <span className={`${typography.statValue} text-3xl`}>${addon.price}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
        </div>

        <div className="space-y-3 mb-6 flex-1">
          {addon.features.map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground leading-relaxed">{feature}</span>
            </div>
          ))}
        </div>

        <Button 
          variant="outline" 
          className="w-full group transition-all duration-200 hover:scale-105 mt-auto" 
          onClick={onAddToPlan}
        >
          Add to Plan
        </Button>
      </CardContent>
    </Card>
  );
}
