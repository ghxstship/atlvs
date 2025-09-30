import * as React from 'react';
import { cn } from '../lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  hint?: string;
  error?: string;
  requiredIndicator?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  (
    { className, children, hint, error, requiredIndicator = false, ...props },
    ref
  ) => {
    return (
      <div className={cn('space-y-1', error && 'text-destructive')}>
        <label
          ref={ref}
          className={cn(
            'block text-sm font-medium leading-5 text-foreground',
            error && 'text-destructive',
            className
          )}
          {...props}
        >
          <span className="inline-flex items-center gap-1">
            {children}
            {requiredIndicator && <span className="text-destructive">*</span>}
          </span>
        </label>
        {hint && !error && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);

Label.displayName = 'Label';

export default Label;
