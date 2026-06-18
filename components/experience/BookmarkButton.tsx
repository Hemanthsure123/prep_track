"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { toggleBookmark } from "@/app/_actions/bookmarks";
import { InlineSpinner } from "@/components/loading/InlineSpinner";
import { cn } from "@/lib/utils";

type Props = {
  interviewId: string;
  initialBookmarked: boolean;
  isAuthenticated: boolean;
  variant?: "full" | "icon";
  className?: string;
};

export function BookmarkButton({
  interviewId,
  initialBookmarked,
  isAuthenticated,
  variant = "full",
  className,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(initialBookmarked);

  if (!isAuthenticated) {
    const href = `/login?next=${encodeURIComponent(`/experiences/${interviewId}`)}`;
    if (variant === "icon") {
      return (
        <Button
          variant="outline"
          size="icon-sm"
          className={cn("rounded-full", className)}
          render={<Link href={href} aria-label="Sign in to save" />}
        >
          <Bookmark className="size-4" />
        </Button>
      );
    }
    return (
      <Button
        variant="outline"
        size="sm"
        className={className}
        render={<Link href={href} />}
      >
        <Bookmark className="size-4" />
        Save
      </Button>
    );
  }

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      setOptimistic(!optimistic);
      try {
        await toggleBookmark(interviewId);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Could not update bookmark.",
        );
      }
    });
  };

  if (variant === "icon") {
    return (
      <Button
        type="button"
        variant={optimistic ? "default" : "outline"}
        size="icon-sm"
        disabled={pending}
        onClick={onClick}
        aria-label={optimistic ? "Remove bookmark" : "Bookmark this interview"}
        aria-pressed={optimistic}
        className={cn("rounded-full", className)}
      >
        {pending ? (
          <InlineSpinner />
        ) : optimistic ? (
          <BookmarkCheck className="size-4" />
        ) : (
          <Bookmark className="size-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={optimistic ? "default" : "outline"}
      size="sm"
      disabled={pending}
      onClick={onClick}
      aria-pressed={optimistic}
      className={className}
    >
      {pending ? (
        <InlineSpinner />
      ) : optimistic ? (
        <BookmarkCheck className="size-4" />
      ) : (
        <Bookmark className="size-4" />
      )}
      {optimistic ? "Saved" : "Save"}
    </Button>
  );
}
