"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface GapFiltersProps {
  threshold: number;
  staleMonths: number;
}

export function GapFilters({ threshold, staleMonths }: GapFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 rounded-lg border border-border bg-card p-5 dark:border-border dark:bg-card mb-6">
      {/* Threshold Selector */}
      <div className="space-y-1.5">
        <label
          htmlFor="threshold-select"
          className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400"
        >
          Weakness Threshold (Rounds Count)
        </label>
        <select
          id="threshold-select"
          value={threshold}
          onChange={(e) => handleFilterChange("threshold", e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="3">Less than 3 rounds (Highly Critical)</option>
          <option value="5">Less than 5 rounds (Standard Warning)</option>
          <option value="8">Less than 8 rounds (Broad Review)</option>
          <option value="12">Less than 12 rounds (Aggressive Growth)</option>
        </select>
      </div>

      {/* Stale Months Selector */}
      <div className="space-y-1.5">
        <label
          htmlFor="stale-select"
          className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400"
        >
          Company Inactivity Period (Months)
        </label>
        <select
          id="stale-select"
          value={staleMonths}
          onChange={(e) => handleFilterChange("staleMonths", e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="3">No updates in 3 months (Freshness Critical)</option>
          <option value="6">No updates in 6 months (Standard Stale)</option>
          <option value="12">No updates in 12 months (Severely Outdated)</option>
        </select>
      </div>
    </div>
  );
}
