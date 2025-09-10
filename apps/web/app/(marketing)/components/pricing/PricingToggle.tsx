import { cn } from '@ghxstship/ui/system';
import { Badge } from '@ghxstship/ui';

interface PricingToggleProps {
  isAnnual: boolean;
  onToggle: (isAnnual: boolean) => void;
}

export function PricingToggle({ isAnnual, onToggle }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <span className={cn("text-sm", !isAnnual ? "text-foreground font-semibold" : "text-muted-foreground")}>
        Monthly
      </span>
      <button
        onClick={() => onToggle(!isAnnual)}
        className={cn(
          "relative w-14 h-7 rounded-full transition-colors",
          isAnnual ? "bg-primary" : "bg-muted"
        )}
        aria-label={`Switch to ${isAnnual ? 'monthly' : 'annual'} billing`}
      >
        <div className={cn(
          "absolute w-5 h-5 bg-white rounded-full top-1 transition-transform",
          isAnnual ? "translate-x-8" : "translate-x-1"
        )} />
      </button>
      <span className={cn("text-sm", isAnnual ? "text-foreground font-semibold" : "text-muted-foreground")}>
        Annual
      </span>
      <Badge variant="secondary" className="ml-2">
        Save 17%
      </Badge>
    </div>
  );
}
