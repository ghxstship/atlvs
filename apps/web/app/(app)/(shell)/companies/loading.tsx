import { Skeleton } from '@ghxstship/ui';

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-68" />
      </div>

      {/* Company stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-2">
        <div className="flex space-x-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-22" />
          ))}
        </div>
        <Skeleton className="h-px w-full" />
      </div>

      {/* Companies table skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <div className="border rounded-lg">
          <div className="p-4 border-b">
            <Skeleton className="h-4 w-24" />
          </div>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
