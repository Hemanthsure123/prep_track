import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/components/loading/Skeletons";

export default function CompanyDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      
      {/* Header Skeleton */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-2xl bg-white/10 shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48 rounded bg-white/10" />
              <Skeleton className="h-4 w-32 rounded bg-white/10" />
            </div>
          </div>
          <Skeleton className="h-9 w-28 rounded-xl bg-white/10" />
        </div>
        <div className="space-y-2 border-t border-white/5 pt-5">
          <Skeleton className="h-4 w-3/4 rounded bg-white/10" />
          <Skeleton className="h-4 w-1/2 rounded bg-white/10" />
        </div>
      </div>

      {/* Tabs Navigation Skeleton */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>

      {/* Grid Content Skeleton */}
      <CardGridSkeleton count={3} />

    </div>
  );
}
