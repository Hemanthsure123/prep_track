"use client";

import { useState } from "react";
import { ExternalLink, Link2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { detectPlatform } from "@/lib/platform-links";

type Props = {
  url: string;
  className?: string;
};

export function PlatformLinkChip({ url, className }: Props) {
  const [hovered, setHovered] = useState(false);
  const platform = detectPlatform(url);

  if (!platform) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:underline hover:text-foreground transition-colors",
          className,
        )}
      >
        <Link2 className="size-3" />
        Reference link
      </a>
    );
  }

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={cn(
        "relative inline-flex items-center gap-1.5 px-2 h-6 rounded-md border text-[11px] font-medium cursor-default transition-colors",
        platform.tint,
        className,
      )}
    >
      <span>{platform.name}</span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={0}
        className={cn(
          "inline-flex items-center gap-1 ml-1 px-1.5 h-4 rounded text-[10px] font-semibold border border-current/30 bg-background/60 transition-opacity",
          hovered ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        Solve <ExternalLink className="size-2.5" />
      </a>
    </span>
  );
}
