"use client";

import React from "react";
import { CsvExportButton } from "./CsvExportButton";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

interface Header {
  label: string;
  key: string;
}

interface ChartCardProps {
  title: string;
  description?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  csvData?: Array<Record<string, unknown>>;
  csvHeaders?: Header[];
  csvFilename?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  isLoading = false,
  isEmpty = false,
  csvData,
  csvHeaders,
  csvFilename,
  action,
  children,
  className = "",
}: ChartCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-all dark:border-border dark:bg-card ${className}`}
    >
      {/* Header section */}
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h3 className="font-semibold text-slate-900 tracking-tight dark:text-slate-50 flex items-center gap-1.5 text-base">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {action}
          {csvData && csvHeaders && csvData.length > 0 && (
            <CsvExportButton
              data={csvData}
              headers={csvHeaders}
              filename={csvFilename || `${title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_export`}
            />
          )}
        </div>
      </div>

      {/* Content section */}
      <div className="relative min-h-[300px] w-full flex items-center justify-center">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-4 bg-white/50 backdrop-blur-[1px] dark:bg-slate-950/50">
            <div className="w-full h-full space-y-4">
              <Skeleton className="h-[20px] w-3/4 rounded-md" />
              <div className="flex items-end gap-3 h-[180px] pt-4">
                <Skeleton className="h-[40%] flex-1 rounded" />
                <Skeleton className="h-[75%] flex-1 rounded" />
                <Skeleton className="h-[90%] flex-1 rounded" />
                <Skeleton className="h-[55%] flex-1 rounded" />
                <Skeleton className="h-[30%] flex-1 rounded" />
                <Skeleton className="h-[80%] flex-1 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-[12px] w-[50px] rounded" />
                <Skeleton className="h-[12px] w-[50px] rounded" />
                <Skeleton className="h-[12px] w-[50px] rounded" />
                <Skeleton className="h-[12px] w-[50px] rounded" />
                <Skeleton className="h-[12px] w-[50px] rounded" />
                <Skeleton className="h-[12px] w-[50px] rounded" />
              </div>
            </div>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="rounded-full bg-slate-50 p-3 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <AlertCircle className="h-6 w-6 text-slate-400 dark:text-slate-500" />
            </div>
            <h4 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-50">No Data Available</h4>
            <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">
              There is currently not enough collected data to populate this visualization. Add more interview submissions.
            </p>
          </div>
        ) : (
          <div className="w-full h-full min-h-[300px] flex items-center justify-center">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
