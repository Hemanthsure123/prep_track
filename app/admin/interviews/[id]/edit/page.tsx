import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { ForbiddenError, requireAdminOrPanelist } from "@/lib/auth/guards";
import { ASSETS_BUCKET } from "@/lib/storage";
import type {
  CompanyOption,
  TopicOption,
  WizardValues,
} from "@/components/forms/wizard/types";

import { EditInterviewClient } from "./edit-interview-client";

export const metadata = {
  title: "Edit interview | Admin",
};

export const dynamic = "force-dynamic";

function pathFromPublicUrl(url: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  const prefix = `${base}/storage/v1/object/public/${ASSETS_BUCKET}/`;
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length);
}

export default async function EditInterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  try {
    await requireAdminOrPanelist();
  } catch (err) {
    if (err instanceof ForbiddenError) redirect("/admin");
    throw err;
  }

  const { id } = await params;

  const [interview, companies, topics] = await Promise.all([
    prisma.interview.findUnique({
      where: { id },
      include: {
        assets: true,
        rounds: {
          orderBy: { roundNumber: "asc" },
          include: {
            assets: true,
            questions: {
              orderBy: { orderIndex: "asc" },
              include: { topics: { select: { topicId: true } } },
            },
          },
        },
      },
    }),
    prisma.company.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.topic.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, category: true },
    }),
  ]);

  if (!interview) notFound();

  const initialValues: WizardValues = {
    company: { mode: "existing", companyId: interview.companyId },
    interview: {
      role: interview.role,
      roleLevel: interview.roleLevel,
      year: interview.year,
      season: interview.season,
      isOnCampus: interview.isOnCampus,
      source: interview.source ?? null,
      cgpaCutoff: interview.cgpaCutoff ?? null,
      totalSelected: interview.totalSelected ?? null,
      candidateCgpa: interview.candidateCgpa ?? null,
      candidateBranch: interview.candidateBranch ?? null,
      candidateGradYear: interview.candidateGradYear ?? null,
      candidateBackground: interview.candidateBackground ?? null,
      finalOutcome: interview.finalOutcome,
      biggestTip: interview.biggestTip ?? null,
    },
    rounds: interview.rounds.map((r) => ({
      roundNumber: r.roundNumber,
      roundName: r.roundName,
      roundType: r.roundType,
      durationMinutes: r.durationMinutes ?? null,
      mode: r.mode,
      numInterviewers: r.numInterviewers ?? null,
      interviewStyle: r.interviewStyle ?? null,
      outcome: r.outcome,
      keyLearnings: r.keyLearnings ?? null,
      questions: r.questions.map((q) => ({
        orderIndex: q.orderIndex,
        title: q.title,
        statement: q.statement,
        category: q.category,
        difficulty: q.difficulty,
        approach: q.approach ?? null,
        timeGivenMin: q.timeGivenMin ?? null,
        timeTakenMin: q.timeTakenMin ?? null,
        solvedStatus: q.solvedStatus ?? null,
        followUps: q.followUps,
        referenceUrl: q.referenceUrl ?? null,
        topicIds: q.topics.map((t) => t.topicId),
      })),
    })),
    assets: [
      ...interview.assets.map((a) => ({
        scope: "interview" as const,
        roundIndex: null,
        kind: a.kind as "prep_pdf" | "infographic_pdf" | "external_link",
        path: pathFromPublicUrl(a.url),
        url: a.url,
        label: a.label ?? null,
      })),
      ...interview.rounds.flatMap((r, idx) =>
        r.assets.map((a) => ({
          scope: "round" as const,
          roundIndex: idx,
          kind: a.kind as "prep_pdf" | "infographic_pdf" | "external_link",
          path: pathFromPublicUrl(a.url),
          url: a.url,
          label: a.label ?? null,
        })),
      ),
    ],
  };

  const companyOptions: CompanyOption[] = companies;
  const topicOptions: TopicOption[] = topics;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Edit interview</h1>
        <p className="text-muted-foreground text-sm">
          Changes replace the existing rounds, questions, and assets in a
          single transaction.
        </p>
      </header>
      <EditInterviewClient
        id={id}
        companies={companyOptions}
        topics={topicOptions}
        initialValues={initialValues}
      />
    </div>
  );
}
