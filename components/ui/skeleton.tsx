import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      className={cn("skeleton rounded-md bg-slate-200/70", className)}
      {...props}
    />
  );
}

export { Skeleton };
