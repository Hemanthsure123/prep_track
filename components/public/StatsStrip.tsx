import { Building2, Layers, Tag, HelpCircle } from "lucide-react";

interface StatsStripProps {
  stats: {
    interviewsCount: number;
    companiesCount: number;
    subTopicsCount: number;
    questionsCount: number;
  };
}

export function StatsStrip({ stats }: StatsStripProps) {
  const kpiItems = [
    {
      label: "Real Interviews",
      value: stats.interviewsCount,
      icon: Layers,
      color: "text-primary bg-primary/10 border-primary/20",
    },
    {
      label: "Top Companies",
      value: stats.companiesCount,
      icon: Building2,
      color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Sub-Topics",
      value: stats.subTopicsCount,
      icon: Tag,
      color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Exact Questions",
      value: stats.questionsCount,
      icon: HelpCircle,
      color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="bg-card border-b border-border py-8 shadow-sm">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {kpiItems.map((kpi, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-2 rounded-md"
            >
              <div className={`p-2.5 rounded-md border flex items-center justify-center shrink-0 ${kpi.color}`}>
                <kpi.icon className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
                  {kpi.label}
                </span>
                <span className="text-xl md:text-2xl font-black text-foreground tracking-tight block font-mono">
                  {kpi.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
