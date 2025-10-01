import { Card, CardContent, Button } from '@ghxstship/ui';
import { Check } from 'lucide-react';
import { typography, anton } from '../../lib/typography';

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
    <Card className="hover:shadow-floating transition-all duration-200 hover:scale-105 h-full flex flex-col">
      <CardContent className="p-lg flex flex-col h-full">
        <div className="text-center mb-md">
          <h3 className={`${anton.className} text-heading-4 text-heading-3 uppercase mb-sm`}>{addon.name}</h3>
          <p className="color-muted mb-sm text-body-sm leading-relaxed">{addon.description}</p>
          <div className="flex items-baseline justify-center gap-xl">
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

        <div className="stack-xl mb-md flex-1">
          {addon.features.map((feature: any) => (
            <div key={feature} className="flex items-start gap-xl">
              <Check className="h-icon-xs w-icon-xs color-success flex-shrink-0 mt-0.5" />
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
