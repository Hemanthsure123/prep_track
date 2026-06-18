import { LucideIcon } from "lucide-react";

interface StatsKpiProps {
  value: string | number;
  label: string;
  description?: string;
  icon: LucideIcon;
  colorClass?: string;
}

export function StatsKpi({
  value,
  label,
  description,
  icon: Icon,
  colorClass = "bg-primary/10 text-primary border-primary/20",
}: StatsKpiProps) {
  return (
    <div className="group relative overflow-hidden rounded-md border border-border bg-card p-5 md:p-6 shadow-sm hover:shadow transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">{label}</p>
          <h3 className="text-2xl font-black text-foreground tracking-tight font-mono">{value}</h3>
          {description && (
            <p className="text-xs font-semibold text-muted-foreground">{description}</p>
          )}
        </div>
        <div className={`p-2.5 rounded-md border flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
    </div>
  );
}
