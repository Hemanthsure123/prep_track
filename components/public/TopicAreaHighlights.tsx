/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { BookOpen, ChevronRight, Code2, Cpu, LayoutTemplate, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopicAreaHighlightsProps {
  topicAreas: {
    id: string;
    name: string;
    slug: string;
    _count: {
      subTopics: number;
    };
  }[];
}

const AREA_THEMES: Record<string, { icon: any; color: string }> = {
  "dsa-easy": { icon: Code2, color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
  "dsa-medium-hard": { icon: Code2, color: "text-rose-600 bg-rose-500/10 border-rose-500/20" },
  "system-design": { icon: Cpu, color: "text-blue-600 bg-blue-500/10 border-blue-500/20" },
  "frontend-concepts": { icon: LayoutTemplate, color: "text-teal-600 bg-teal-500/10 border-teal-500/20" },
  "frontend-coding": { icon: LayoutTemplate, color: "text-cyan-600 bg-cyan-500/10 border-cyan-500/20" },
  "backend-concepts": { icon: Database, color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20" },
  "backend-coding": { icon: Database, color: "text-violet-600 bg-violet-500/10 border-violet-500/20" },
};

export function TopicAreaHighlights({ topicAreas }: TopicAreaHighlightsProps) {
  if (topicAreas.length === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Row Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-5">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-primary uppercase tracking-wider bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-sm">
              <BookOpen className="w-3 h-3" />
              Taxonomy Breakdown
            </span>
            <h2 className="text-2xl font-black tracking-tight text-foreground font-display">
              Structure Your Preparation
            </h2>
            <p className="text-xs text-muted-foreground font-semibold">
              We group hundreds of raw interview questions into standard core topic areas.
            </p>
          </div>
          <Link
            href="/topic-areas"
            className="mt-3 md:mt-0 inline-flex items-center gap-1 text-xs font-extrabold text-primary hover:text-foreground transition-colors whitespace-nowrap"
          >
            View all topics <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {topicAreas.slice(0, 5).map((area) => {
            const theme = AREA_THEMES[area.slug] || {
              icon: BookOpen,
              color: "text-slate-600 bg-slate-500/10 border-slate-500/20",
            };
            const Icon = theme.icon;

            return (
              <Link
                key={area.id}
                href={`/topic-areas/${area.slug}`}
                className="group relative flex flex-col justify-between h-full bg-background rounded-lg border border-border p-5 hover:shadow-sm hover:scale-[1.01] transition-all duration-200 cursor-pointer overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Icon */}
                  <div className={cn("p-2.5 rounded-[6px] border w-fit flex items-center justify-center shrink-0", theme.color)}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  
                  {/* Title */}
                  <h4 className="font-extrabold text-foreground text-sm leading-tight group-hover:text-primary transition-colors duration-200">
                    {area.name}
                  </h4>
                </div>

                <div className="mt-8 pt-3 border-t border-border flex items-center justify-between text-xs font-bold text-muted-foreground">
                  <span>{area._count.subTopics} sub-topics</span>
                  <span className="text-primary inline-flex items-center group-hover:translate-x-0.5 transition-transform duration-200">
                    Explore <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
