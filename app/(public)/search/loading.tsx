import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/components/loading/Skeletons";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-pulse">
      
      {/* Title area skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>

      {/* Matching section 1 */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-48 rounded" />
        <CardGridSkeleton count={3} />
      </div>

      {/* Matching section 2 */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-48 rounded" />
        <CardGridSkeleton count={3} />
      </div>

    </div>
  );
}
