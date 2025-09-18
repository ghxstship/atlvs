'use client';

import { Card, CardContent, CardHeader } from '@ghxstship/ui/components/Card';
import { Badge } from '@ghxstship/ui/components/Badge';
import { Check, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { typography } from '../lib/typography';
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
        <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary z-20 shadow-md px-md py-xs">
          Most Popular
        </Badge>
      )}
      
      {/* Fixed Header Section */}
      <CardHeader className="text-center pb-md flex-shrink-0">
        <h3 className={`${typography.cardTitle} mb-xs`}>{title}</h3>
        <div className="h-12 flex items-center justify-center">
          <p className="color-muted text-body-sm leading-tight line-clamp-2">{description}</p>
        </div>
        <div className="mt-sm">
          {typeof price === 'string' ? (
            <span className={`${typography.statValue} text-heading-1`}>{price}</span>
          ) : (
            <>
              <span className={`${typography.statValue} text-heading-1`}>${price}</span>
              <span className="color-muted ml-xs">/{period}</span>
            </>
          )}
          {yearlyPrice && typeof price === 'number' && (
            <div className="text-body-sm color-muted mt-xs">
              Billed annually (${yearlyPrice}/year)
            </div>
          )}
        </div>
      </CardHeader>

      {/* Scrollable Features Section */}
      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="flex-1 min-h-0">
          <div className="h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            <ul className="stack-xl pr-sm">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-xl">
                  <Check className="h-4 w-4 color-success flex-shrink-0 mt-0.5" />
                  <span className="text-body-sm leading-relaxed">{feature}</span>
                </li>
              ))}
              {excludedFeatures.map((feature, index) => (
                <li key={`excluded-${index}`} className="flex items-start gap-xl">
                  <div className="h-4 w-4 rounded-full border border-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-body-sm color-muted leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Fixed CTA Button */}
        <div className="mt-md flex-shrink-0">
          {ctaHref ? (
            <Button asChild className="w-full group min-h-[44px] flex items-center justify-center" variant={popular ? 'primary' : 'outline'}>
              <a href={ctaHref} className="flex items-center justify-center gap-xl whitespace-nowrap">
                <span className="truncate">{ctaText}</span>
                {Icon && <Icon className="h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-1" />}
              </a>
            </Button>
          ) : (
            <Button className="w-full group min-h-[44px] flex items-center justify-center gap-xl whitespace-nowrap" variant={popular ? 'primary' : 'outline'}>
              <span className="truncate">{ctaText}</span>
              {Icon && <Icon className="h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-1" />}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
