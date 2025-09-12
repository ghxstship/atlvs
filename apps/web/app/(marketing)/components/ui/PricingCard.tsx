import { Card, CardContent, CardHeader } from '@ghxstship/ui/components/Card';
import { Badge } from '@ghxstship/ui/components/Badge';
import { Check, ArrowRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { typography } from '../../lib/typography';
import { Button } from '@ghxstship/ui';

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
      'relative h-full flex flex-col',
      "transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
      popular && 'border-primary shadow-lg ring-2 ring-primary/20',
      className
    )}>
      {popular && (
        <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary z-20 shadow-md px-4 py-1">
          Most Popular
        </Badge>
      )}
      
      {/* Fixed Header Section */}
      <CardHeader className="text-center pb-4 flex-shrink-0">
        <h3 className={`${typography.cardTitle} mb-2`}>{title}</h3>
        <div className="h-12 flex items-center justify-center">
          <p className="text-muted-foreground text-sm leading-tight line-clamp-2">{description}</p>
        </div>
        <div className="mt-4">
          <span className={`${typography.statValue} text-4xl`}>${price}</span>
          <span className="text-muted-foreground ml-1">/{period}</span>
          {yearlyPrice && (
            <div className="text-sm text-muted-foreground mt-1">
              Billed annually (${yearlyPrice}/year)
            </div>
          )}
        </div>
      </CardHeader>

      {/* Scrollable Features Section */}
      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="flex-1 min-h-0">
          <div className="h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            <ul className="space-y-3 pr-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">{feature}</span>
                </li>
              ))}
              {excludedFeatures.map((feature, index) => (
                <li key={`excluded-${index}`} className="flex items-start gap-3">
                  <div className="h-4 w-4 rounded-full border border-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Fixed CTA Button */}
        <div className="mt-6 flex-shrink-0">
          {ctaHref ? (
            <Button asChild className="w-full group min-h-[44px] flex items-center justify-center" variant={popular ? 'primary' : 'outline'}>
              <a href={ctaHref} className="flex items-center justify-center gap-2 whitespace-nowrap">
                <span className="truncate">{ctaText}</span>
                {Icon && <Icon className="h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-1" />}
              </a>
            </Button>
          ) : (
            <Button className="w-full group min-h-[44px] flex items-center justify-center gap-2 whitespace-nowrap" variant={popular ? 'primary' : 'outline'}>
              <span className="truncate">{ctaText}</span>
              {Icon && <Icon className="h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-1" />}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
