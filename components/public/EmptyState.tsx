import { LucideIcon, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon: Icon = HelpCircle,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
      <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4 border border-brand-primary/20">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-extrabold text-brand-navy mb-2">{title}</h3>
      <p className="text-sm text-brand-muted max-w-sm mb-6 font-medium">
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="outline" className="font-semibold shadow-sm hover:bg-slate-50">
          {actionText}
        </Button>
      )}
    </div>
  );
}
