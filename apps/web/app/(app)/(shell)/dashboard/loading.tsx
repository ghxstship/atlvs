import { Skeleton } from '@ghxstship/ui';

export default function Loading() {
  return (
    <div className="space-y-lg p-lg">
      {/* Header skeleton */}
      <div className="space-y-xs">
        <Skeleton className="h-icon-lg w-container-sm" />
        <Skeleton className="h-icon-xs w-container-lg" />
      </div>

      {/* Metrics cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-md border rounded-lg space-y-xs">
            <Skeleton className="h-icon-xs w-component-lg" />
            <Skeleton className="h-icon-lg w-component-md" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <div className="space-y-md">
          <Skeleton className="h-icon-md w-component-xl" />
          <div className="space-y-xs">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-icon-2xl w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-md">
          <Skeleton className="h-icon-md w-component-xl" />
          <div className="space-y-xs">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-component-md w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
