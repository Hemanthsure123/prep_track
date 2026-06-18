

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-br from-brand-navy to-brand-primary/90 py-16 px-4 md:px-8 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 animate-pulse flex-shrink-0" />
            <div className="space-y-3">
              <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
              <div className="h-8 w-64 md:w-80 bg-white/20 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-5 w-20 bg-white/15 rounded-full animate-pulse" />
                <div className="h-5 w-24 bg-white/15 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          <div className="space-y-2 flex-shrink-0">
            <div className="h-8 w-24 bg-white/20 rounded-xl animate-pulse" />
            <div className="h-10 w-44 bg-white/15 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Body Skeletons */}
      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="h-20 bg-white rounded-2xl border p-6 animate-pulse" />
        <div className="space-y-4">
          <div className="h-32 bg-white rounded-2xl border p-6 animate-pulse" />
          <div className="h-64 bg-white rounded-2xl border p-6 animate-pulse" />
        </div>
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="h-44 bg-white rounded-2xl border p-6 animate-pulse" />
          <div className="h-44 bg-white rounded-2xl border p-6 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
