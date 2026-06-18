"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

interface DataItem {
  [key: string]: string | number | boolean | null | undefined;
}

interface HorizontalBarChartProps {
  data: DataItem[];
  dataKey: string;
  nameKey: string;
  color?: string;
  height?: number;
  onBarClick?: (item: DataItem) => void;
  tooltipLabel?: string;
}

const DEFAULT_COLORS = [
  "var(--color-brand-primary, #2D5BFF)",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A78BFA",
];

export function HorizontalBarChart({
  data,
  dataKey,
  nameKey,
  color,
  height = 320,
  onBarClick,
  tooltipLabel = "Occurrences",
}: HorizontalBarChartProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Sort data descending by value for a cleaner horizontal look
  const sortedData = [...data].sort((a, b) => Number(b[dataKey] ?? 0) - Number(a[dataKey] ?? 0));

  if (!mounted) {
    return <div className="w-full bg-slate-200/40 rounded-lg animate-pulse" style={{ height }} />;
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={true}
            vertical={false}
            stroke="var(--color-border, #E2E8F0)"
            opacity={0.5}
          />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            stroke="var(--color-brand-muted, #64748B)"
            style={{ fontSize: "11px", fontWeight: 500 }}
          />
          <YAxis
            dataKey={nameKey}
            type="category"
            tickLine={false}
            axisLine={false}
            width={120}
            stroke="var(--color-brand-muted, #64748B)"
            style={{ fontSize: "11px", fontWeight: 500 }}
            tickFormatter={(value) => {
              if (typeof value !== "string") return String(value);
              return value.length > 18 ? `${value.substring(0, 16)}...` : value;
            }}
          />
          <Tooltip
            cursor={{ fill: "rgba(226, 232, 240, 0.3)" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md dark:border-slate-800 dark:bg-slate-900 text-xs">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      {item[nameKey]}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            color || DEFAULT_COLORS[0],
                        }}
                      />
                      <span>{tooltipLabel}:</span>
                      <span className="font-bold text-slate-950 dark:text-slate-100">
                        {payload[0].value}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey={dataKey}
            radius={[0, 4, 4, 0]}
            barSize={16}
            cursor={onBarClick ? "pointer" : "default"}
            onClick={(state: unknown) => {
              if (onBarClick && state) {
                onBarClick(state as DataItem);
              }
            }}
          >
            {sortedData.map((entry, index) => {
              // Cycle through default colors if custom color is not specified
              const barColor =
                color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
              return <Cell key={`cell-${index}`} fill={barColor} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
