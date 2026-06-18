import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

interface HeroProps {
  interviewCount: number;
  companyCount: number;
}

export function Hero({ interviewCount, companyCount }: HeroProps) {
  return (
    <section className="relative border-b border-border bg-brand-subtle">
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background-elevated px-3 py-1 text-xs text-foreground-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Interview prep, properly organized
        </div>

        <div className="space-y-5">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-[56px] md:leading-[1.05]">
            Real interview experiences,{" "}
            <span className="text-brand">structured</span> for how you prep.
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-foreground-muted lg:text-lg">
            Browse{" "}
            <span className="font-medium text-foreground">
              {interviewCount.toLocaleString()}
            </span>{" "}
            interviews across{" "}
            <span className="font-medium text-foreground">{companyCount}</span>{" "}
            companies. Search by sub-topic, see exactly what gets asked, and
            learn from people who&apos;ve done it.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <Button size="lg" render={<Link href="/companies" />}>
            Browse companies
            <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/search" />}>
            <Search className="size-4" />
            Search topics
          </Button>
        </div>
      </div>
    </section>
  );
}
