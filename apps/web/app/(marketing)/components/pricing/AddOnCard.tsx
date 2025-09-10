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
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <h3 className={`${typography.cardTitle} mb-2`}>{addon.name}</h3>
          <p className="text-muted-foreground mb-4">{addon.description}</p>
          <div className="flex items-baseline justify-center gap-2">
            <span className={`${typography.statValue} text-3xl`}>${addon.price}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {addon.features.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full" onClick={onAddToPlan}>
          Add to Plan
        </Button>
      </CardContent>
    </Card>
  );
}
