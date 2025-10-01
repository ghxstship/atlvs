import { Skeleton } from '@ghxstship/ui';

export default function Loading() {
  return (
    <div className="space-y-lg p-lg">
      {/* Header skeleton */}
      <div className="space-y-xs">
        <Skeleton className="h-icon-lg w-36" />
        <Skeleton className="h-icon-xs w-60" />
      </div>

      {/* People stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-md border rounded-lg space-y-xs">
            <Skeleton className="h-icon-xs w-component-lg" />
            <Skeleton className="h-icon-md w-icon-2xl" />
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

      {/* People grid skeleton */}
      <div className="space-y-sm">
        <Skeleton className="h-icon-md w-28" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-md border rounded-lg space-y-sm">
              <div className="flex items-center space-x-sm">
                <Skeleton className="h-icon-xl w-icon-xl rounded-full" />
                <div className="space-y-xs">
                  <Skeleton className="h-icon-xs w-component-lg" />
                  <Skeleton className="h-3 w-component-xl" />
                </div>
              </div>
              <div className="space-y-xs">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
