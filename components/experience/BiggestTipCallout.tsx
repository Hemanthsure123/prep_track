import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { InterviewDetail } from "@/lib/queries/interview-detail";
import { Quote } from "lucide-react";

export function BiggestTipCallout({
  interview,
}: {
  interview: InterviewDetail;
}) {
  const { biggestTip, company, role } = interview;

  if (!biggestTip || biggestTip.trim().length === 0) return null;

  return (
    <div className="bg-background border border-border border-l-4 border-l-primary rounded-lg p-6 md:p-8 hover:shadow-sm hover:scale-[1.01] transition-all duration-200 relative overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
        <div className="w-10 h-10 rounded-[6px] bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary shadow-sm">
          <Quote className="w-4 h-4" />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-[10px] font-black text-primary uppercase tracking-wider mb-2">
              Candidate&apos;s Golden Advice
            </h3>
            <div className="prose dark:prose-invert max-w-none text-sm md:text-base font-medium leading-relaxed text-foreground">
              <MarkdownRenderer content={biggestTip} className="prose-p:text-foreground prose-strong:text-foreground font-semibold" />
            </div>
          </div>

          <div className="border-t border-border pt-3 text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">
            &mdash; Successful Candidate for {role} at {company.name}
          </div>
        </div>
      </div>
    </div>
  );
}
