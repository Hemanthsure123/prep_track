import { CardGridSkeleton } from "@/components/loading/Skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompaniesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      
      {/* Title Area Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-32 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-28 rounded" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 rounded-xl" />
              <Skeleton className="h-8 w-20 rounded-xl" />
              <Skeleton className="h-8 w-16 rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 rounded" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-12 rounded-xl" />
              <Skeleton className="h-8 w-12 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <CardGridSkeleton count={9} />

    </div>
  );
}
