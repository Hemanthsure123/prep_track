"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { BarChart3 } from "lucide-react";
import { InterviewDetail } from "@/lib/queries/interview-detail";

type Round = InterviewDetail["rounds"][number];

export function TopicAreaDistribution({ rounds }: { rounds: Round[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Aggregate counts of subtopic entries per Topic Area
  const counts: Record<string, { name: string; value: number; color: string }> = {};

  // Pure premium minimalist distribution colors
  const areaColors: Record<string, string> = {
    "dsa-easy": "#10B981",
    "dsa-medium": "#F59E0B",
    "dsa-hard": "#EF4444",
    "system-design": "#2563EB",
    "frontend-fundamentals": "#0D9488",
    "frontend-frameworks": "#0F766E",
    "backend-api": "#4F46E5",
    "backend-db": "#7C3AED",
    "devops-cloud": "#0891B2",
    "cs-theory": "#9333EA",
    "resume-projects": "#DB2777",
    "puzzles-math": "#EA580C",
    "behavioral-star": "#E11D48",
    "hr-fit": "#C084FC",
  };

  rounds.forEach((round) => {
    round.topicCoverages.forEach((cov) => {
      const slug = cov.topicArea.slug;
      const name = cov.topicArea.name;
      const entriesCount = cov.entries.length;
      if (entriesCount > 0) {
        if (!counts[slug]) {
          counts[slug] = {
            name,
            value: 0,
            color: areaColors[slug] || "#64748B",
          };
        }
        counts[slug].value += entriesCount;
      }
    });
  });

  const data = Object.values(counts).sort((a, b) => b.value - a.value);
  const totalEntries = data.reduce((sum, item) => sum + item.value, 0);

  if (totalEntries === 0) return null;

  return (
    <div className="bg-card rounded-md border border-border p-5 md:p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Topic Area Distribution</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4 font-medium leading-relaxed">
          Breakdown of sub-topics covered, grouped by major topic area.
        </p>
      </div>

      <div className="flex-1 min-h-[200px] mt-2 relative">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 10, left: -10, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 11, fontWeight: 700 }}
                width={120}
                className="text-foreground/80"
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload;
                    return (
                      <div className="bg-foreground text-background text-xs px-2.5 py-1.5 rounded-md shadow-md border border-border font-bold">
                        {dataPoint.name}: {dataPoint.value} sub-topic{dataPoint.value > 1 ? "s" : ""}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[0, 2, 2, 0]} barSize={14}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground/45 text-xs font-semibold">
            Loading chart...
          </div>
        )}
      </div>

      {/* Legend & Stats */}
      <div className="mt-4 pt-4 border-t border-border space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground font-semibold">Total assessed concepts</span>
          <span className="font-extrabold text-foreground font-mono">{totalEntries}</span>
        </div>
      </div>
    </div>
  );
}
