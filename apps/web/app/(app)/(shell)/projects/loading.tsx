import { Skeleton } from '@ghxstship/ui';

export default function Loading() {
  return (
    <div className="space-y-lg p-lg">
      {/* Header skeleton */}
      <div className="space-y-xs">
        <Skeleton className="h-icon-lg w-40" />
        <Skeleton className="h-icon-xs w-container-sm" />
      </div>

      {/* Projects overview skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-md border rounded-lg space-y-xs">
            <Skeleton className="h-icon-xs w-component-lg" />
            <Skeleton className="h-icon-md w-component-md" />
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

      {/* Projects list skeleton */}
      <div className="space-y-sm">
        <Skeleton className="h-icon-md w-28" />
        <div className="border rounded-lg">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-md border-b last:border-b-0">
              <div className="flex justify-between items-center">
                <div className="space-y-xs">
                  <Skeleton className="h-icon-xs w-40" />
                  <Skeleton className="h-3 w-container-xs" />
                </div>
                <div className="flex items-center space-x-xs">
                  <Skeleton className="h-icon-sm w-component-md" />
                  <Skeleton className="h-icon-md w-icon-md rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
