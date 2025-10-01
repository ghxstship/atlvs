import { Skeleton } from '@ghxstship/ui';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-md">
      <Loader2 className="h-icon-lg w-icon-lg animate-spin text-blue-600" />
      <div className="text-center space-y-xs">
        <Skeleton className="h-icon-xs w-component-xl mx-auto" />
        <Skeleton className="h-3 w-container-xs mx-auto" />
      </div>
    </div>
  );
}
