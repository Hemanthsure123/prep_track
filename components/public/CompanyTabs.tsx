"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InterviewCard } from "./InterviewCard";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Lightbulb, TrendingUp, HelpCircle, ArrowUpDown } from "lucide-react";

interface CompanyTabsInterview {
  id: string;
  role: string;
  year: number;
  publishedAt: Date;
  biggestTip?: string | null;
  roleLevelId: string;
  company: {
    name: string;
    logoUrl?: string | null;
    slug: string;
  };
  roleLevel: {
    id: string;
    name: string;
  };
  rounds: {
    id: string;
    roundNumber: number;
    topicCoverages: {
      id: string;
      entries: {
        id: string;
        subTopic: {
          name: string;
          slug: string;
          topicArea: {
            slug: string;
          };
        };
      }[];
    }[];
  }[];
}

interface CompanyTabsProps {
  interviews: CompanyTabsInterview[];
  roleLevels: { id: string; name: string }[];
}

export function CompanyTabs({ interviews, roleLevels }: CompanyTabsProps) {
  // --- EXPERIENCES TAB STATE & SORTING ---
  const [sortKey, setSortKey] = useState<"recent" | "rounds" | "level">("recent");

  const sortedInterviews = useMemo(() => {
    return [...interviews].sort((a, b) => {
      if (sortKey === "recent") {
        return b.year - a.year || new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      if (sortKey === "rounds") {
        const aRounds = a.rounds?.length ?? 0;
        const bRounds = b.rounds?.length ?? 0;
        return bRounds - aRounds;
      }
      if (sortKey === "level") {
        return a.roleLevel.name.localeCompare(b.roleLevel.name);
      }
      return 0;
    });
  }, [interviews, sortKey]);

  // --- TOPIC TRENDS TAB STATE & AGGREGATION ---
  const [trendRoleFilter, setTrendRoleFilter] = useState<string>("all");

  const subtopicData = useMemo(() => {
    const counts: Record<string, { name: string; value: number; areaSlug: string }> = {};

    interviews.forEach((interview) => {
      // Filter by role level if selected
      if (trendRoleFilter !== "all" && interview.roleLevelId !== trendRoleFilter) {
        return;
      }

      interview.rounds.forEach((round) => {
        round.topicCoverages.forEach((cov) => {
          cov.entries.forEach((entry) => {
            const st = entry.subTopic;
            if (!counts[st.slug]) {
              counts[st.slug] = {
                name: st.name,
                value: 0,
                areaSlug: st.topicArea.slug,
              };
            }
            counts[st.slug].value += 1;
          });
        });
      });
    });

    return Object.values(counts)
      .sort((a, b) => b.value - a.value)
      .slice(0, 15); // Top 15 sub-topics
  }, [interviews, trendRoleFilter]);

  // Theme colors matching TopicAreaDistribution
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

  // --- TIPS TAB AGGREGATION ---
  const tips = useMemo(() => {
    return interviews
      .filter((i) => i.biggestTip && i.biggestTip.trim() !== "")
      .map((i) => ({
        id: i.id,
        role: i.role,
        level: i.roleLevel.name,
        year: i.year,
        tip: i.biggestTip,
      }));
  }, [interviews]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="experiences" className="w-full">
        {/* Underlined Navigation List */}
        <div className="w-full mb-6">
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="experiences" className="px-1 pb-3 pt-2">
              Experiences ({interviews.length})
            </TabsTrigger>
            <TabsTrigger value="trends" className="px-1 pb-3 pt-2">
              Topic Trends
            </TabsTrigger>
            <TabsTrigger value="tips" className="px-1 pb-3 pt-2">
              Tips ({tips.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab content 1 — EXPERIENCES */}
        <TabsContent value="experiences" className="space-y-6 outline-none">
          {/* Sorting panel */}
          <div className="flex items-center justify-between bg-card border border-border p-4 rounded-md shadow-sm">
            <div className="text-xs text-muted-foreground font-semibold">
              Showing {sortedInterviews.length} experiences
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground font-bold flex items-center gap-1 uppercase tracking-wider">
                <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
                Sort:
              </span>
              <div className="flex gap-1">
                {(["recent", "rounds", "level"] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSortKey(key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all cursor-pointer ${
                      sortKey === key
                        ? "bg-primary border-primary text-primary-foreground shadow-sm"
                        : "bg-secondary border-border text-foreground hover:bg-secondary/70"
                    }`}
                  >
                    {key === "recent" ? "Most Recent" : key === "rounds" ? "Most Rounds" : "Role Level"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedInterviews.map((interview) => (
              <div key={interview.id} className="h-full">
                <InterviewCard interview={interview} />
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Tab content 2 — TOPIC TRENDS CHART */}
        <TabsContent value="trends" className="space-y-6 outline-none">
          <div className="bg-card border border-border rounded-md p-5 md:p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Sub-Topic Coverage Frequency
                </h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  Trace exactly which sub-topics are asked most frequently during this company&apos;s interviews.
                </p>
              </div>

              {/* Role Level filter chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setTrendRoleFilter("all")}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all cursor-pointer ${
                    trendRoleFilter === "all"
                      ? "bg-primary border-primary text-primary-foreground shadow-sm"
                      : "bg-secondary border-border text-foreground hover:bg-secondary/70"
                  }`}
                >
                  All Levels
                </button>
                {roleLevels.map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setTrendRoleFilter(lvl.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all cursor-pointer ${
                      trendRoleFilter === lvl.id
                        ? "bg-primary border-primary text-primary-foreground shadow-sm"
                        : "bg-secondary border-border text-foreground hover:bg-secondary/70"
                    }`}
                  >
                    {lvl.name}
                  </button>
                ))}
              </div>
            </div>

            {subtopicData.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground font-semibold flex flex-col items-center gap-2">
                <HelpCircle className="w-8 h-8 text-muted-foreground/30" />
                No subtopic data available for this role level selection.
              </div>
            ) : (
              <div className="space-y-8">
                {/* Horizontal Chart */}
                <div className="h-[380px] w-full mt-2 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={subtopicData}
                      layout="vertical"
                      margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "currentColor", fontSize: 11, fontWeight: 700 }}
                        width={140}
                        className="text-foreground/80"
                      />
                      <Tooltip
                        cursor={{ fill: "transparent" }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const dataPoint = payload[0].payload;
                            return (
                              <div className="bg-foreground text-background text-xs px-2.5 py-1.5 rounded-md shadow-md border border-border font-bold">
                                {dataPoint.name}: asked {dataPoint.value} time{dataPoint.value > 1 ? "s" : ""}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 2, 2, 0]} barSize={14}>
                        {subtopicData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={areaColors[entry.areaSlug] || "#2563EB"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Color Legend */}
                <div className="pt-4 border-t border-border flex flex-wrap gap-x-4 gap-y-2 justify-center">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block w-full text-center mb-1">
                    Legend by Topic Area
                  </span>
                  {Array.from(new Set(subtopicData.map((d) => d.areaSlug))).map((slug) => {
                    const label = slug.split("-").map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(" ");
                    return (
                      <div key={slug} className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: areaColors[slug] || "#2563EB" }} />
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab content 3 — TIPS BLOCKQUOTES */}
        <TabsContent value="tips" className="space-y-6 outline-none">
          {tips.length === 0 ? (
            <div className="bg-card border border-border rounded-md p-12 text-center text-xs text-muted-foreground font-semibold flex flex-col items-center gap-2">
              <Lightbulb className="w-8 h-8 text-muted-foreground/30" />
              No biggest tips have been submitted for this company yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tips.map((tip) => (
                <div
                  key={tip.id}
                  className="bg-card border border-border border-l-4 border-l-primary rounded-md p-5 md:p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-full"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Lightbulb className="w-4 h-4 fill-primary/10" />
                      <span className="text-[10px] font-extrabold tracking-wider uppercase">Candidate Advice</span>
                    </div>

                    <blockquote className="text-xs md:text-sm font-semibold text-foreground leading-relaxed italic">
                      &ldquo;{tip.tip}&rdquo;
                    </blockquote>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                    <span>{tip.role} ({tip.level})</span>
                    <span>Class of {tip.year}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
