"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

interface CompanyOption {
  id: string;
  name: string;
}

interface RawComparisonEntry {
  companyId: string;
  topicAreaId: string;
  topicAreaName: string;
  count: number;
}

interface CompanyComparisonChartProps {
  allCompanies: CompanyOption[];
  selectedCompanyIds: string[];
  comparisonData: RawComparisonEntry[];
}

const COMPARISON_COLORS = [
  "var(--color-brand-primary, #2D5BFF)",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#3B82F6",
];

export function CompanyComparisonChart({
  allCompanies,
  selectedCompanyIds,
  comparisonData,
}: CompanyComparisonChartProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle multi-select checkboxes
  const handleCompanyToggle = (companyId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let currentSelected = selectedCompanyIds.filter((id) => id);

    if (currentSelected.includes(companyId)) {
      currentSelected = currentSelected.filter((id) => id !== companyId);
    } else {
      currentSelected.push(companyId);
    }

    if (currentSelected.length > 0) {
      params.set("companyIds", currentSelected.join(","));
    } else {
      params.delete("companyIds");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  // 1. Get unique topic area names present in comparison data
  const topicAreas = Array.from(
    new Set(comparisonData.map((d) => d.topicAreaName))
  ).sort();

  // 2. Map of company names by ID
  const companyNameMap = new Map(allCompanies.map((c) => [c.id, c.name]));

  // 3. Transform data for Recharts multi-series rendering
  const chartData = topicAreas.map((topicName) => {
    const row: Record<string, string | number> = { name: topicName };
    selectedCompanyIds.forEach((id) => {
      const name = companyNameMap.get(id) || id;
      const match = comparisonData.find(
        (d) => d.companyId === id && d.topicAreaName === topicName
      );
      row[name] = match ? match.count : 0;
    });
    return row;
  });

  return (
    <div className="space-y-6">
      {/* Dynamic Checklist Picker Grid */}
      <div className="rounded-lg border border-border bg-card p-5 dark:border-border dark:bg-card space-y-3">
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
            Compare Companies Side-by-Side
          </h4>
          <p className="text-xs text-slate-500">
            Select two or more companies from the list below to compare their topic area coverage profiles.
          </p>
        </div>

        <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 md:grid-cols-5 pt-1 max-h-[140px] overflow-y-auto pr-1">
          {allCompanies.map((company) => {
            const isChecked = selectedCompanyIds.includes(company.id);
            return (
              <label
                key={company.id}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium cursor-pointer select-none transition-all duration-150 ${
                  isChecked
                    ? "border-brand-primary bg-indigo-50/40 text-brand-primary dark:border-indigo-900/60 dark:bg-indigo-950/20 dark:text-indigo-400"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCompanyToggle(company.id)}
                  className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary h-3.5 w-3.5 dark:border-slate-800 dark:bg-slate-900"
                />
                <span className="truncate" title={company.name}>
                  {company.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Recharts Visualization */}
      <div className="rounded-lg border border-border bg-card p-5 dark:border-border dark:bg-card">
        <div className="mb-5 flex flex-col justify-between sm:flex-row sm:items-center gap-2">
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-base">
              Coverage Profile Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Comparative round density mapping specific topic areas against selected organizations.
            </p>
          </div>
        </div>

        {selectedCompanyIds.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-center text-slate-400 text-xs">
            Select companies above to render comparison.
          </div>
        ) : (
          <div className="h-[320px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-border, #E2E8F0)"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
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
                  cursor={{ fill: "rgba(226, 232, 240, 0.3)" }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-md dark:border-slate-800 dark:bg-slate-900 text-xs">
                          <p className="font-semibold text-slate-900 dark:text-slate-50 mb-1.5 border-b border-slate-100 dark:border-slate-800 pb-1">
                            {label}
                          </p>
                          <div className="space-y-1.5">
                            {payload.map((p, idx) => (
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
                                        COMPARISON_COLORS[
                                          idx % COMPARISON_COLORS.length
                                        ],
                                    }}
                                  />
                                  <span>{p.name}:</span>
                                </div>
                                <span className="font-bold text-slate-950 dark:text-slate-100">
                                  {p.value} {p.value === 1 ? "Round" : "Rounds"}
                                </span>
                              </div>
                            ))}
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
                {selectedCompanyIds.map((id, idx) => {
                  const companyName = companyNameMap.get(id) || id;
                  const color =
                    COMPARISON_COLORS[idx % COMPARISON_COLORS.length];
                  return (
                    <Bar
                      key={id}
                      dataKey={companyName}
                      fill={color}
                      radius={[3, 3, 0, 0]}
                      barSize={16}
                    />
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
