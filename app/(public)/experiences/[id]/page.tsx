import { notFound } from "next/navigation";
import { getInterviewDetail } from "@/lib/queries/interview-detail";
import { ExperienceHero } from "@/components/experience/ExperienceHero";
import { ProcessStepper } from "@/components/experience/ProcessStepper";
import { RoundSection } from "@/components/experience/RoundSection";
import { TopicCloud } from "@/components/experience/TopicCloud";
import { BiggestTipCallout } from "@/components/experience/BiggestTipCallout";
import { AssetDownloads } from "@/components/experience/AssetDownloads";
import { RelatedExperiences } from "@/components/experience/RelatedExperiences";
import { RecentlyViewedTracker } from "@/components/experience/RecentlyViewedTracker";
import { getCurrentDbUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const TopicAreaDistribution = dynamic(
  () => import("@/components/experience/TopicAreaDistribution").then((mod) => mod.TopicAreaDistribution),
  { loading: () => <div className="h-64 bg-card border border-border rounded-md animate-pulse flex items-center justify-center text-xs text-muted-foreground/50 font-bold">Loading visual taxonomy distribution...</div> }
);

export const revalidate = 3600; // ISR: re-render at most once per hour

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const interview = await getInterviewDetail(id);
  if (!interview) return { title: "Not found | Interview Experience Platform" };
  return {
    title: `${interview.company.name} — ${interview.role} (${interview.year}) Interview Experience`,
    description: interview.biggestTip?.slice(0, 160) ?? `Detailed interview experience for ${interview.role} at ${interview.company.name}.`,
  };
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const interview = await getInterviewDetail(id);
  if (!interview) notFound();

  const user = await getCurrentDbUser();
  const bookmarked = user
    ? !!(await prisma.bookmark.findUnique({
        where: {
          userId_interviewId: { userId: user.id, interviewId: interview.id },
        },
      }))
    : false;

  return (
    <article className="min-h-screen bg-background pb-20 font-sans antialiased text-foreground selection:bg-primary/10 selection:text-primary">
      <RecentlyViewedTracker interviewId={interview.id} />
      <ExperienceHero
        interview={interview}
        bookmarked={bookmarked}
        isAuthenticated={!!user}
      />
      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-10">
        <ProcessStepper rounds={interview.rounds} />
        
        <section className="space-y-10">
          {interview.rounds.map((round) => (
            <RoundSection key={round.id} round={round} />
          ))}
        </section>
        
        <section className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <TopicCloud rounds={interview.rounds} />
          <TopicAreaDistribution rounds={interview.rounds} />
        </section>
        
        <BiggestTipCallout interview={interview} />
        
        <AssetDownloads
          interviewAssets={interview.assets}
          roundAssets={interview.rounds.flatMap((r) => r.assets)}
        />
        
        <Suspense fallback={
          <div className="space-y-4">
            <div className="h-8 w-48 bg-slate-200/50 rounded animate-pulse" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200/50 border border-border rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        }>
          <RelatedExperiences interview={interview} />
        </Suspense>
      </div>
    </article>
  );
}
