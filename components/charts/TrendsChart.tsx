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

interface TrendsEntry {
  year: number;
  topicAreaName: string;
  count: number;
}

interface TrendsChartProps {
  data: TrendsEntry[];
}

const TRENDS_COLORS = [
  "var(--color-brand-primary, #2D5BFF)",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#3B82F6",
  "#06B6D4",
];

export function TrendsChart({ data }: TrendsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-slate-400 text-xs">
        No trend data available.
      </div>
    );
  }

  // 1. Get unique years
  const years = Array.from(new Set(data.map((x) => x.year))).sort((a, b) => a - b);

  // 2. Get unique topic areas
  const topicAreas = Array.from(new Set(data.map((x) => x.topicAreaName))).sort();

  // 3. Transform data for Recharts
  const chartData = years.map((year) => {
    const row: Record<string, string | number> = { year: String(year) };
    let total = 0;

    topicAreas.forEach((topic) => {
      const match = data.find((x) => x.year === year && x.topicAreaName === topic);
      const val = match ? match.count : 0;
      row[topic] = val;
      total += val;
    });

    row.total = total;
    return row;
  });

  return (
    <div className="h-[360px] w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
        >
          <defs>
            {topicAreas.map((topic, idx) => {
              const color = TRENDS_COLORS[idx % TRENDS_COLORS.length];
              return (
                <linearGradient
                  key={`trends-grad-${topic}`}
                  id={`trends-color-${topic}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
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
            dataKey="year"
            tickLine={false}
            axisLine={false}
            stroke="var(--color-brand-muted, #64748B)"
            style={{ fontSize: "11px", fontWeight: 600 }}
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
            cursor={{ stroke: "rgba(226, 232, 240, 0.5)", strokeWidth: 1.5 }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const total = payload[0].payload.total || 0;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-md dark:border-slate-800 dark:bg-slate-900 text-xs">
                    <p className="font-bold text-slate-900 dark:text-slate-50 mb-1.5 border-b border-slate-100 dark:border-slate-800 pb-1 uppercase tracking-wider text-[10px]">
                      Year: {label}
                    </p>
                    <div className="space-y-1">
                      {payload.map((p, idx) => {
                        const val = Number(p.value) || 0;
                        const percent =
                          total > 0 ? ((val / total) * 100).toFixed(1) : "0";
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-4 justify-between"
                          >
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    p.color ||
                                    TRENDS_COLORS[idx % TRENDS_COLORS.length],
                                }}
                              />
                              <span>{p.name}:</span>
                            </div>
                            <span className="font-bold text-slate-950 dark:text-slate-100">
                              {val} ({percent}%)
                            </span>
                          </div>
                        );
                      })}
                      <div className="mt-1.5 border-t border-slate-100 dark:border-slate-800 pt-1 flex justify-between font-bold text-slate-900 dark:text-slate-100">
                        <span>Total Rounds:</span>
                        <span>{total}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11.5px", fontWeight: 500 }}
          />
          {topicAreas.map((topic, idx) => {
            const color = TRENDS_COLORS[idx % TRENDS_COLORS.length];
            return (
              <Area
                key={topic}
                type="monotone"
                dataKey={topic}
                name={topic}
                stackId="1"
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#trends-color-${topic})`}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
