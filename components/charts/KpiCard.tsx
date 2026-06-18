import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  change?: {
    value: string | number;
    type: "positive" | "negative" | "neutral";
  };
  isLoading?: boolean;
  className?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  description,
  change,
  isLoading = false,
  className = "",
}: KpiCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 dark:border-border dark:bg-card space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-all hover:border-slate-300 dark:border-border dark:bg-card dark:hover:border-slate-700 ${className}`}
    >
      {/* Decorative Brand Accent (subtle light blue/indigo top bar on hover) */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase dark:text-slate-400">
          {title}
        </p>
        {Icon && (
          <div className="rounded-lg bg-slate-50 p-2 text-slate-600 transition-colors group-hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:group-hover:bg-slate-800 dark:group-hover:text-slate-200">
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <h4 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {typeof value === "number" ? value.toLocaleString() : value}
        </h4>
        {change && (
          <span
            className={`inline-flex items-center text-xs font-semibold rounded-full px-1.5 py-0.5 ${
              change.type === "positive"
                ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30"
                : change.type === "negative"
                ? "text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30"
                : "text-slate-700 bg-slate-50 dark:text-slate-400 dark:bg-slate-950/30"
            }`}
          >
            {change.value}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}
