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
  Legend,
} from "recharts";

interface ProfileEntry {
  roleLevelId: string;
  roleLevelName: string;
  topicAreaId: string;
  topicAreaName: string;
  count: number;
}

interface RoleLevelStackedChartProps {
  data: ProfileEntry[];
}

const PALETTE = [
  "var(--color-brand-primary, #2D5BFF)",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#3B82F6",
  "#06B6D4",
];

export function RoleLevelStackedChart({ data }: RoleLevelStackedChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-slate-400 text-xs">
        No role level profile data available.
      </div>
    );
  }

  // 1. Extract unique role level names
  const roleLevels = Array.from(new Set(data.map((x) => x.roleLevelName))).sort();

  // 2. Extract unique topic area names
  const topicAreas = Array.from(new Set(data.map((x) => x.topicAreaName))).sort();

  // 3. Transform data: Group counts by role level name
  const chartData = roleLevels.map((level) => {
    const row: Record<string, string | number> = { name: level };
    let total = 0;

    // Calculate absolute counts first
    topicAreas.forEach((topic) => {
      const match = data.find(
        (x) => x.roleLevelName === level && x.topicAreaName === topic
      );
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
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            vertical={true}
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
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            width={90}
            stroke="var(--color-brand-muted, #64748B)"
            style={{ fontSize: "11px", fontWeight: 600 }}
          />
          <Tooltip
            cursor={{ fill: "rgba(226, 232, 240, 0.3)" }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const total = payload[0].payload.total || 0;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-md dark:border-slate-800 dark:bg-slate-900 text-xs">
                    <p className="font-bold text-slate-900 dark:text-slate-50 mb-1.5 border-b border-slate-100 dark:border-slate-800 pb-1 uppercase tracking-wider text-[10px]">
                      {label} profile
                    </p>
                    <div className="space-y-1">
                      {payload.map((p, idx) => {
                        const val = Number(p.value) || 0;
                        const percent = total > 0 ? ((val / total) * 100).toFixed(1) : "0";
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
                                    p.color || PALETTE[idx % PALETTE.length],
                                }}
                              />
                              <span>{p.name}:</span>
                            </div>
                            <span className="font-bold text-slate-950 dark:text-slate-100">
                              {val} rounds ({percent}%)
                            </span>
                          </div>
                        );
                      })}
                      <div className="mt-1.5 border-t border-slate-100 dark:border-slate-800 pt-1 flex justify-between font-bold text-slate-900 dark:text-slate-100">
                        <span>Total rounds:</span>
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
            wrapperStyle={{ fontSize: "11px", fontWeight: 500 }}
          />
          {topicAreas.map((topic, idx) => {
            const color = PALETTE[idx % PALETTE.length];
            return (
              <Bar
                key={topic}
                dataKey={topic}
                name={topic}
                stackId="a"
                fill={color}
                barSize={20}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
