import { InterviewDetail } from "@/lib/queries/interview-detail";
import Link from "next/link";
import { Tag } from "lucide-react";

type Round = InterviewDetail["rounds"][number];

export function TopicCloud({ rounds }: { rounds: Round[] }) {
  // Aggregate topic counts
  const counts: Record<string, { name: string; slug: string; count: number }> = {};

  rounds.forEach((round) => {
    round.topicCoverages.forEach((cov) => {
      cov.entries.forEach((entry) => {
        const topic = entry.subTopic;
        if (!counts[topic.slug]) {
          counts[topic.slug] = {
            name: topic.name,
            slug: topic.slug,
            count: 0,
          };
        }
        counts[topic.slug].count += 1;
      });
    });
  });

  const list = Object.values(counts).sort((a, b) => b.count - a.count);

  if (list.length === 0) return null;

  const maxCount = Math.max(...list.map((item) => item.count));
  const minCount = Math.min(...list.map((item) => item.count));

  const getFontSize = (count: number) => {
    if (maxCount === minCount) return "13px";
    const ratio = (count - minCount) / (maxCount - minCount);
    // Weighted font scale in pixel equivalents for minimalist typography lock
    return `${12 + Math.round(ratio * 4)}px`;
  };

  return (
    <div className="bg-background rounded-lg border border-border p-5 md:p-6 hover:shadow-sm hover:scale-[1.01] transition-all duration-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-[6px] bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
          <Tag className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-display">Topic Cloud</h3>
      </div>
      
      <p className="text-xs text-muted-foreground mb-4 font-medium leading-relaxed">
        Topics covered across this interview process, weighted by how often they appeared.
      </p>

      <div className="flex flex-wrap gap-2 items-center">
        {list.map((topic) => (
          <Link
            key={topic.slug}
            href={`/sub-topics/${topic.slug}`}
            style={{ fontSize: getFontSize(topic.count) }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border border-border bg-secondary hover:bg-secondary/70 text-foreground transition-all font-bold tracking-tight shadow-sm"
          >
            <span>{topic.name}</span>
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm font-mono font-extrabold">
              {topic.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
