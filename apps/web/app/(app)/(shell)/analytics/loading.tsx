import { Skeleton } from '@ghxstship/ui';

export default function Loading() {
  return (
    <div className="space-y-lg p-lg">
      {/* Header skeleton */}
      <div className="space-y-xs">
        <Skeleton className="h-icon-lg w-52" />
        <Skeleton className="h-icon-xs w-container-sm" />
      </div>

      {/* Analytics cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-md border rounded-lg space-y-xs">
            <Skeleton className="h-icon-xs w-component-lg" />
            <Skeleton className="h-icon-lg w-icon-2xl" />
            <Skeleton className="h-3 w-component-md" />
          </div>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-xs">
        <div className="flex space-x-xs">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-icon-lg w-component-lg" />
          ))}
        </div>
        <Skeleton className="h-px w-full" />
      </div>

      {/* Chart and data skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <div className="space-y-md">
          <Skeleton className="h-icon-md w-component-xl" />
          <Skeleton className="h-container-sm w-full rounded-lg" />
        </div>
        <div className="space-y-md">
          <Skeleton className="h-icon-md w-28" />
          <div className="space-y-xs">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-icon-2xl w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
