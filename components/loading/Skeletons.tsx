import { Skeleton } from "@/components/ui/skeleton";

function StatusWrapper({
  children,
  label = "Loading",
  className,
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={className}
    >
      {children}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <StatusWrapper className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-background p-6 space-y-3 shadow-sm"
        >
          <Skeleton className="h-9 w-9 rounded-[6px]" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-16 mt-2" />
        </div>
      ))}
    </StatusWrapper>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <header className="mb-8 space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-44" />
      </header>
      <CardGridSkeleton count={4} />
    </div>
  );
}

export function TableSkeleton({
  rows = 8,
  cols = 5,
  widths,
}: {
  rows?: number;
  cols?: number;
  widths?: string[];
}) {
  const ws =
    widths && widths.length === cols
      ? widths
      : Array.from({ length: cols }, () => "flex-1");
  return (
    <StatusWrapper className="rounded-md border overflow-hidden">
      <div className="flex gap-4 border-b bg-muted/50 px-3 py-2">
        {ws.map((w, c) => (
          <Skeleton key={c} className={`h-4 ${w}`} />
        ))}
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 px-3 py-3 items-center">
            {ws.map((w, c) => (
              <Skeleton key={c} className={`h-5 ${w}`} />
            ))}
          </div>
        ))}
      </div>
    </StatusWrapper>
  );
}

export function InterviewsListSkeleton() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </header>
      <TableSkeleton
        rows={6}
        cols={8}
        widths={[
          "w-24",
          "flex-1",
          "w-20",
          "w-12",
          "w-14",
          "w-20",
          "w-24",
          "w-32",
        ]}
      />
    </div>
  );
}

export function TaxonomyListSkeleton({
  title = "Taxonomy",
}: {
  title?: string;
}) {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" aria-label={title} />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </header>
      <TableSkeleton
        rows={8}
        cols={4}
        widths={["flex-1", "w-32", "w-24", "w-24"]}
      />
    </div>
  );
}

export function WizardSkeleton() {
  return (
    <StatusWrapper className="space-y-6">
      <header className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </header>

      <div className="flex items-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-3 flex-1" />
          </div>
        ))}
      </div>

      <div className="space-y-5 rounded-lg border border-border bg-background p-6 shadow-sm">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </StatusWrapper>
  );
}

export function InterviewDetailSkeleton() {
  return (
    <StatusWrapper className="space-y-6">
      <div className="rounded-lg border border-border bg-background p-6 space-y-3 shadow-sm">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-20 rounded-[6px]" />
          <Skeleton className="h-6 w-24 rounded-[6px]" />
          <Skeleton className="h-6 w-16 rounded-[6px]" />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-background p-6 space-y-3 shadow-sm">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-background p-6 space-y-3 shadow-sm"
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-32 w-full rounded-[6px]" />
          </div>
        ))}
      </div>
    </StatusWrapper>
  );
}

export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <StatusWrapper className="space-y-6 max-w-2xl">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </StatusWrapper>
  );
}

export function DetailPageSkeleton() {
  return (
    <StatusWrapper className="space-y-8">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </StatusWrapper>
  );
}
