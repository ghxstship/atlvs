import { Card, CardContent, CardHeader } from '@ghxstship/ui/components/Card';
import { Badge } from '@ghxstship/ui/components/Badge';
import { Check, ArrowRight } from 'lucide-react';
import { cn } from '@ghxstship/ui/system';
import { typography } from '../../lib/typography';
import { StandardButton, animationPresets } from '../../../(protected)/components/ui';

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
      animationPresets.cardInteractive,
      popular && 'border-primary shadow-lg ring-2 ring-primary/20',
      className
    )}>
      {popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary z-10 shadow-md">
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
            <StandardButton asChild className="w-full group" variant={popular ? 'primary' : 'outline'}>
              <a href={ctaHref}>
                {ctaText}
                {Icon && <Icon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
              </a>
            </StandardButton>
          ) : (
            <StandardButton className="w-full group" variant={popular ? 'primary' : 'outline'}>
              {ctaText}
              {Icon && <Icon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </StandardButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
