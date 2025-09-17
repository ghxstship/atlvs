import { Card, CardContent, Button } from '@ghxstship/ui';
import { Check } from 'lucide-react';
import { typography } from '../../lib/typography';

interface AddOn {
  name: string;
  description: string;
  price: number | string;
  features: string[];
}

interface AddOnCardProps {
  addon: AddOn;
  onAddToPlan?: () => void;
}

export function AddOnCard({ addon, onAddToPlan }: AddOnCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 h-full flex flex-col">
      <CardContent className="p-lg flex flex-col h-full">
        <div className="text-center mb-6">
          <h3 className={`${typography.cardTitle} mb-3`}>{addon.name}</h3>
          <p className="color-muted mb-4 text-body-sm leading-relaxed">{addon.description}</p>
          <div className="flex items-baseline justify-center gap-sm">
            {typeof addon.price === 'string' ? (
              <span className={`${typography.statValue} text-heading-2`}>{addon.price}</span>
            ) : (
              <>
                <span className={`${typography.statValue} text-heading-2`}>${addon.price}</span>
                <span className="color-muted">/month</span>
              </>
            )}
          </div>
        </div>

        <div className="stack-sm mb-6 flex-1">
          {addon.features.map((feature) => (
            <div key={feature} className="flex items-start gap-sm">
              <Check className="h-4 w-4 color-success flex-shrink-0 mt-0.5" />
              <span className="text-body-sm color-foreground leading-relaxed">{feature}</span>
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
