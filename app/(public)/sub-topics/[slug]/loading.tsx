import { Skeleton } from "@/components/ui/skeleton";

export default function SubTopicDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-pulse">
      
      {/* Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-9 w-64 rounded-lg" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-24 rounded-xl" />
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
      </div>

      {/* Grouped Companies List Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-40 rounded" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border border-slate-200 bg-white rounded-2xl p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 rounded" />
                  <Skeleton className="h-3 w-40 rounded" />
                </div>
              </div>
              <div className="pl-0 md:pl-14 space-y-3">
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sibling Cloud Skeleton */}
      <div className="border border-slate-250 bg-slate-50 p-6 rounded-2xl space-y-4">
        <Skeleton className="h-5 w-48 rounded" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-xl" />
          ))}
        </div>
      </div>

    </div>
  );
}
