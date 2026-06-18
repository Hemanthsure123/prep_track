"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";

interface HeatmapEntry {
  companyId: string;
  companyName: string;
  topicAreaId: string;
  topicAreaName: string;
  count: number;
}

interface HeatmapProps {
  data: HeatmapEntry[];
}

export function Heatmap({ data }: HeatmapProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{
    company: string;
    topic: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-96 w-full animate-pulse bg-slate-200/40 rounded-lg" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <Info className="h-8 w-8 text-slate-300 mb-2" />
        <span className="text-xs">No heatmap data found.</span>
      </div>
    );
  }

  // Extract unique companies and topic areas
  const companies = Array.from(new Set(data.map((x) => x.companyName))).sort();
  const topicAreas = Array.from(
    new Set(data.map((x) => x.topicAreaName))
  ); // Keep order returned from database (sortOrder)

  // Map data to quick lookup by key "companyName|topicAreaName"
  const lookup = new Map<string, number>();
  data.forEach((x) => {
    lookup.set(`${x.companyName}|${x.topicAreaName}`, x.count);
  });

  // Calculate cell color intensity
  const getCellColor = (count: number) => {
    if (count === 0) {
      return "bg-slate-50 text-slate-300 dark:bg-slate-900/40 dark:text-slate-800";
    }
    if (count === 1) {
      return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30";
    }
    if (count === 2) {
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/30";
    }
    if (count === 3) {
      return "bg-indigo-200 text-indigo-900 dark:bg-indigo-800/60 dark:text-indigo-200 border border-indigo-300/50 dark:border-indigo-700/30";
    }
    return "bg-brand-primary/20 text-brand-primary dark:bg-brand-primary/30 dark:text-blue-300 border border-brand-primary/30 font-bold";
  };

  const handleCellHover = (
    e: React.MouseEvent<HTMLDivElement>,
    company: string,
    topic: string,
    count: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
    if (parentRect) {
      setHoveredCell({
        company,
        topic,
        count,
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top - 8,
      });
    }
  };

  return (
    <div className="relative w-full overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/20 p-2">
      <div className="min-w-[800px] select-none">
        {/* Heatmap Grid Layout */}
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `180px repeat(${topicAreas.length}, minmax(100px, 1fr))`,
          }}
        >
          {/* Header Corner */}
          <div className="flex items-center text-xs font-semibold text-slate-500 uppercase tracking-wider pl-2">
            Company
          </div>

          {/* Topic Columns Headers */}
          {topicAreas.map((topic, i) => (
            <div
              key={i}
              className="text-center text-xs font-medium text-slate-600 dark:text-slate-400 p-2 bg-slate-50 dark:bg-slate-900 rounded-md line-clamp-2 min-h-[44px] flex items-center justify-center"
              title={topic}
            >
              {topic}
            </div>
          ))}

          {/* Rows for each Company */}
          {companies.map((company, rowIdx) => (
            <React.Fragment key={rowIdx}>
              {/* Row Header */}
              <div className="flex items-center text-xs font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800 pl-2">
                {company}
              </div>

              {/* Row cells */}
              {topicAreas.map((topic, colIdx) => {
                const count = lookup.get(`${company}|${topic}`) || 0;
                return (
                  <div
                    key={colIdx}
                    className={`h-11 rounded-md flex flex-col items-center justify-center transition-all duration-150 cursor-help ${getCellColor(
                      count
                    )}`}
                    onMouseEnter={(e) => handleCellHover(e, company, topic, count)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <span className="text-sm font-semibold">{count}</span>
                    <span className="text-[9px] opacity-70 tracking-wide uppercase">
                      {count === 1 ? "round" : "rounds"}
                    </span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Floating Interactive Tooltip */}
      {hoveredCell && (
        <div
          className="absolute z-10 pointer-events-none rounded-lg border border-slate-200 bg-white p-2.5 shadow-md dark:border-slate-800 dark:bg-slate-900 text-xs animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="font-semibold text-slate-900 dark:text-slate-50">
            {hoveredCell.company}
          </div>
          <div className="mt-1 text-slate-500 dark:text-slate-400">
            {hoveredCell.topic}:{" "}
            <span className="font-bold text-slate-950 dark:text-slate-100">
              {hoveredCell.count} {hoveredCell.count === 1 ? "Round" : "Rounds"}
            </span>
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45 border-r border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
        </div>
      )}
    </div>
  );
}
