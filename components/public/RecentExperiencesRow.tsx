/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { InterviewCard } from "./InterviewCard";

interface RecentExperiencesRowProps {
  interviews: any[];
}

export function RecentExperiencesRow({
  interviews,
}: RecentExperiencesRowProps) {
  if (interviews.length === 0) return null;

  return (
    <section className="border-b border-border bg-background-elevated py-16">
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 border-b border-border pb-5">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Recently shared
            </h2>
            <p className="text-sm text-foreground-muted">
              Latest interview pathways reported by candidates.
            </p>
          </div>
          <Link
            href="/companies"
            className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand transition-colors hover:text-brand-dim"
          >
            Browse all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {interviews.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      </div>
    </section>
  );
}
