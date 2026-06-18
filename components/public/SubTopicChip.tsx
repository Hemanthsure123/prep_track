import Link from "next/link";
import { cn } from "@/lib/utils";

interface SubTopicChipProps {
  name: string;
  slug: string;
  topicAreaSlug?: string;
  count?: number;
  className?: string;
}

export function SubTopicChip({
  name,
  slug,
  count,
  className,
}: SubTopicChipProps) {
  return (
    <Link
      href={`/sub-topics/${slug}`}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border border-border bg-card hover:bg-secondary text-foreground transition-all duration-150 shadow-sm cursor-pointer select-none",
        className
      )}
    >
      <span>{name}</span>
      {count !== undefined && (
        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm font-mono font-black">
          {count}
        </span>
      )}
    </Link>
  );
}
