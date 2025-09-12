import { Badge } from '@ghxstship/ui';
import { cn } from '../../../lib/utils';

interface PricingToggleProps {
  isAnnual: boolean;
  onToggle: (isAnnual: boolean) => void;
}

export function PricingToggle({ isAnnual, onToggle }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <span className={cn("text-sm transition-colors", !isAnnual ? "text-foreground font-semibold" : "text-muted-foreground")}>
        Monthly
      </span>
      <button
        onClick={() => onToggle(!isAnnual)}
        className={cn(
          "relative w-14 h-7 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:scale-105 border-2",
          isAnnual ? "bg-primary border-primary" : "bg-background border-border"
        )}
        aria-label={`Switch to ${isAnnual ? 'monthly' : 'annual'} billing`}
      >
        <div className={cn(
          "absolute w-5 h-5 rounded-full top-0.5 transition-all duration-200 shadow-lg",
          isAnnual ? "translate-x-7 bg-white" : "translate-x-0.5 bg-foreground"
        )} />
      </button>
      <span className={cn("text-sm transition-colors", isAnnual ? "text-foreground font-semibold" : "text-muted-foreground")}>
        Annual
      </span>
      <Badge variant="secondary" className="ml-2 animate-pulse">
        Save 17%
      </Badge>
    </div>
  );
}
