"use client";

import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Header {
  label: string;
  key: string;
}

interface CsvExportButtonProps {
  data: Array<Record<string, unknown>>;
  headers: Header[];
  filename?: string;
  variant?: "outline" | "ghost" | "default" | "secondary";
  size?: "sm" | "default" | "lg";
}

export function CsvExportButton({
  data,
  headers,
  filename = "export.csv",
  variant = "outline",
  size = "sm",
}: CsvExportButtonProps) {
  const exportToCsv = () => {
    if (!data || data.length === 0) return;

    // Create the CSV header row
    const headerRow = headers.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(",");

    // Create rows
    const rows = data.map((item) => {
      return headers
        .map((h) => {
          const val = item[h.key];
          if (val === null || val === undefined) {
            return '""';
          }
          const strVal = String(val);
          // Escape quotes and wrap in quotes
          return `"${strVal.replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    const csvContent = [headerRow, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      onClick={exportToCsv}
      variant={variant}
      size={size}
      className="flex items-center gap-1.5 text-xs h-8 px-2.5 font-medium border-slate-200 text-slate-600 hover:text-slate-900 transition-all dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      disabled={!data || data.length === 0}
      title="Export data to CSV"
    >
      <Download className="h-3.5 w-3.5" />
      <span>CSV</span>
    </Button>
  );
}
