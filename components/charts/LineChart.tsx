"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface SeriesConfig {
  key: string;
  name: string;
  color?: string;
}

interface LineChartProps {
  data: Array<Record<string, unknown>>;
  xKey: string;
  series: SeriesConfig[];
  height?: number;
}

const DEFAULT_SERIES_COLORS = [
  "var(--color-brand-primary, #2D5BFF)",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#3B82F6",
];

export function LineChart({ data, xKey, series, height = 320 }: LineChartProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full bg-slate-200/40 rounded-lg animate-pulse" style={{ height }} />;
  }

  return (
    <div className="w-full text-xs" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s, idx) => {
              const color = s.color || DEFAULT_SERIES_COLORS[idx % DEFAULT_SERIES_COLORS.length];
              return (
                <linearGradient key={`grad-${s.key}`} id={`color-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--color-border, #E2E8F0)"
            opacity={0.5}
          />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            stroke="var(--color-brand-muted, #64748B)"
            style={{ fontSize: "11px", fontWeight: 500 }}
            dy={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            stroke="var(--color-brand-muted, #64748B)"
            style={{ fontSize: "11px", fontWeight: 500 }}
            dx={-8}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <p className="font-semibold text-slate-900 dark:text-slate-50 mb-1.5 border-b border-slate-100 dark:border-slate-800 pb-1">
                      {label}
                    </p>
                    <div className="space-y-1">
                      {payload.map((p, idx) => {
                        const config = series.find((s) => s.key === p.name || s.key === p.dataKey);
                        const labelName = config?.name || p.name || String(p.dataKey);
                        const color = p.color || DEFAULT_SERIES_COLORS[idx % DEFAULT_SERIES_COLORS.length];
                        return (
                          <div key={idx} className="flex items-center gap-4 justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              <span>{labelName}:</span>
                            </div>
                            <span className="font-bold text-slate-950 dark:text-slate-100">
                              {p.value}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          {series.length > 1 && (
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", fontWeight: 500 }}
            />
          )}
          {series.map((s, idx) => {
            const color = s.color || DEFAULT_SERIES_COLORS[idx % DEFAULT_SERIES_COLORS.length];
            return (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#color-${s.key})`}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
