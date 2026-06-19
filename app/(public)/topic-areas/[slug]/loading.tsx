export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-4">
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
      <div className="h-44 bg-slate-200/50 border border-border rounded-lg animate-pulse" />
      <div className="space-y-5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-40 bg-slate-200/50 border border-border rounded-lg animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
