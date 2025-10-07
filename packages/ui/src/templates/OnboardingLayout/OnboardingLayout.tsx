import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Button, Progress } from '../../atoms';

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  status?: 'complete' | 'current' | 'upcoming';
  optional?: boolean;
}

export interface OnboardingLayoutProps {
  steps: OnboardingStep[];
  currentStepId: string;
  onStepChange?: (stepId: string) => void;
  children: ReactNode;
  helpContent?: ReactNode;
  statusSummary?: ReactNode;
  className?: string;
  hero?: {
    eyebrow?: string;
    title: string;
    description?: string;
    illustration?: ReactNode;
    cta?: ReactNode;
  };
  footer?: ReactNode;
  showProgressBar?: boolean;
}

function resolveStepStatus(step: OnboardingStep, currentId: string, index: number, steps: OnboardingStep[]) {
  if (step.status) return step.status;
  const currentIndex = Math.max(0, steps.findIndex((s) => s.id === currentId));
  if (index < currentIndex) return 'complete';
  if (index === currentIndex) return 'current';
  return 'upcoming';
}

export function OnboardingLayout({
  steps,
  currentStepId,
  onStepChange,
  children,
  helpContent,
  statusSummary,
  className,
  hero,
  footer,
  showProgressBar = true,
}: OnboardingLayoutProps) {
  const currentIndex = Math.max(0, steps.findIndex((step) => step.id === currentStepId));
  const progress = steps.length > 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className={cn('flex h-full w-full flex-col bg-background text-foreground', className)}>
      {/* Hero / header area */}
      {(hero || showProgressBar) && (
        <div className="border-b border-border bg-muted/40">
          <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-lg px-xl py-lg">
            {hero && (
              <div className="grid items-center gap-lg md:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
                <div className="space-y-sm">
                  {hero.eyebrow && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {hero.eyebrow}
                    </span>
                  )}
                  <h1 className="text-3xl font-bold leading-tight tracking-tight">{hero.title}</h1>
                  {hero.description && (
                    <p className="max-w-2xl text-muted-foreground">{hero.description}</p>
                  )}
                  {hero.cta && <div className="pt-sm">{hero.cta}</div>}
                </div>
                {hero.illustration && (
                  <div className="hidden h-full w-full items-center justify-end rounded-xl bg-card/60 p-lg shadow-inner md:flex">
                    {hero.illustration}
                  </div>
                )}
              </div>
            )}
            {showProgressBar && steps.length > 0 && (
              <div className="flex items-center gap-md">
                <Progress value={progress} className="h-2 flex-1" />
                <span className="text-sm font-medium text-muted-foreground">
                  Step {currentIndex + 1} of {steps.length}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Step Navigation */}
        <aside className="hidden w-[300px] flex-shrink-0 border-r border-border bg-card/40 lg:flex">
          <nav className="flex w-full flex-col gap-sm px-lg py-xl" aria-label="Onboarding steps">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Onboarding Progress
            </div>
            <ol className="space-y-xs">
              {steps.map((step, index) => {
                const status = resolveStepStatus(step, currentStepId, index, steps);
                const isCurrent = status === 'current';
                const Icon = step.icon;
                const statusStyles =
                  status === 'complete'
                    ? 'border-success bg-success/10 text-success'
                    : status === 'current'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-transparent text-muted-foreground';

                return (
                  <li key={step.id}>
                    <button
                      type="button"
                      onClick={() => onStepChange?.(step.id)}
                      className={cn(
                        'flex w-full items-start gap-sm rounded-lg border px-md py-sm text-left transition-colors hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-accent',
                        statusStyles,
                        isCurrent && 'shadow-sm'
                      )}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-semibold">
                        {status === 'complete' ? '✓' : index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-xs">
                          <span className="truncate text-sm font-semibold">{step.title}</span>
                          {step.optional && (
                            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              Optional
                            </span>
                          )}
                        </div>
                        {step.description && (
                          <p className="truncate text-xs text-muted-foreground">{step.description}</p>
                        )}
                      </div>
                      {Icon && <span className="text-muted-foreground">{Icon}</span>}
                    </button>
                  </li>
                );
              })}
            </ol>
            {statusSummary && <div className="pt-lg border-t border-border text-xs text-muted-foreground">{statusSummary}</div>}
          </nav>
        </aside>

        {/* Main content + help drawer */}
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 flex-col gap-xl lg:flex-row">
            <div className="min-w-0 flex-1 overflow-y-auto px-lg py-xl">
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-xl">
                {/* Mobile step selector */}
                <div className="lg:hidden">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Onboarding Progress
                  </label>
                  <div className="mt-xs grid grid-cols-2 gap-sm">
                    {steps.map((step, index) => {
                      const status = resolveStepStatus(step, currentStepId, index, steps);
                      const isCurrent = status === 'current';
                      return (
                        <Button
                          key={step.id}
                          variant={isCurrent ? 'default' : 'outline'}
                          size="sm"
                          className="justify-start"
                          onClick={() => onStepChange?.(step.id)}
                          aria-current={isCurrent ? 'step' : undefined}
                        >
                          <span className="truncate text-xs font-medium">{step.title}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-lg" role="presentation">
                  {children}
                </div>
              </div>
            </div>

            {helpContent && (
              <aside className="w-full max-w-[360px] border-t border-border bg-card/30 px-lg py-xl lg:max-w-[320px] lg:border-l lg:border-t-0">
                <div className="sticky top-xl flex flex-col gap-md">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Need Help?
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Tips, guidance, and best practices for completing this step.
                    </p>
                  </div>
                  <div className="space-y-md text-sm text-muted-foreground">
                    {helpContent}
                  </div>
                </div>
              </aside>
            )}
          </div>
        </section>
      </div>

      {footer && (
        <footer className="border-t border-border bg-background px-xl py-lg">
          <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between gap-sm">
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
}

export default OnboardingLayout;
