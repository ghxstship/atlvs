import { Card, CardContent, CardHeader } from '@ghxstship/ui/components/Card';
import { Badge } from '@ghxstship/ui/components/Badge';
import { Button } from '@ghxstship/ui/components/Button';
import { Check, ArrowRight } from 'lucide-react';
import { cn } from '@ghxstship/ui/system';
import { typography } from '../../lib/typography';

interface PricingCardProps {
  title: string;
  price: number | string;
  yearlyPrice?: number;
  period?: string;
  description: string;
  features: string[];
  excludedFeatures?: string[];
  ctaText: string;
  ctaHref?: string;
  popular?: boolean;
  icon?: any;
  className?: string;
}

export function PricingCard({
  title,
  price,
  yearlyPrice,
  period = 'month',
  description,
  features,
  excludedFeatures = [],
  ctaText,
  ctaHref,
  popular,
  icon: Icon,
  className
}: PricingCardProps) {
  return (
    <Card className={cn(
      'relative p-6 hover:shadow-lg transition-shadow',
      popular && 'border-primary shadow-lg scale-105',
      className
    )}>
      {popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center pb-4">
        <h3 className={`${typography.cardTitle} mb-2`}>{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        <div className="mb-4">
          <span className={`${typography.statValue} text-4xl`}>${price}</span>
          <span className="text-muted-foreground ml-1">/{period}</span>
          {yearlyPrice && (
            <div className="text-sm text-muted-foreground mt-1">
              Billed annually (${yearlyPrice}/year)
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
          {excludedFeatures.map((feature, index) => (
            <li key={`excluded-${index}`} className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full border border-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        {ctaHref ? (
          <Button asChild className="w-full" variant={popular ? 'primary' : 'outline'}>
            <a href={ctaHref}>
              {ctaText}
              {Icon && <Icon className="ml-2 h-4 w-4" />}
            </a>
          </Button>
        ) : (
          <Button className="w-full" variant={popular ? 'primary' : 'outline'}>
            {ctaText}
            {Icon && <Icon className="ml-2 h-4 w-4" />}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
