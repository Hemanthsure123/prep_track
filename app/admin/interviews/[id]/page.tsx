import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ExternalLinkIcon,
  FileTextIcon,
  PencilIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

import { DeleteInterviewButton } from "../delete-button";

export const dynamic = "force-dynamic";

const OUTCOME_TONE: Record<string, string> = {
  SELECTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  WAITLISTED: "bg-amber-100 text-amber-700",
  WITHDREW: "bg-slate-100 text-slate-700",
  IN_PROCESS: "bg-sky-100 text-sky-700",
};

const DIFFICULTY_TONE: Record<string, string> = {
  EASY: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HARD: "bg-red-100 text-red-700",
};

const ROUND_OUTCOME_TONE: Record<string, string> = {
  CLEARED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  PENDING: "bg-slate-100 text-slate-700",
  NO_SHOW: "bg-slate-100 text-slate-700",
};

export default async function AdminInterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const interview = await prisma.interview.findUnique({
    where: { id },
    include: {
      company: true,
      createdBy: { select: { email: true, name: true } },
      assets: { orderBy: { uploadedAt: "asc" } },
      rounds: {
        orderBy: { roundNumber: "asc" },
        include: {
          assets: { orderBy: { uploadedAt: "asc" } },
          questions: {
            orderBy: { orderIndex: "asc" },
            include: {
              topics: {
                include: { topic: { select: { name: true, slug: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!interview) notFound();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {interview.company.name} · {interview.role}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">
              {interview.roleLevel.replace(/_/g, " ")}
            </Badge>
            <Badge variant="outline">
              {interview.season} {interview.year}
            </Badge>
            <Badge
              className={cn(
                "font-normal",
                OUTCOME_TONE[interview.finalOutcome] ?? "",
              )}
            >
              {interview.finalOutcome}
            </Badge>
            <Badge variant="outline">
              {interview.isOnCampus ? "On-campus" : "Off-campus"}
            </Badge>
            {interview.source ? (
              <Badge variant="outline">Source: {interview.source}</Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            Submitted by{" "}
            {interview.createdBy?.email ?? "(unknown)"} ·{" "}
            {interview.publishedAt.toISOString().slice(0, 10)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            render={<Link href={`/admin/interviews/${interview.id}/edit`} />}
          >
            <PencilIcon className="size-4" />
            Edit
          </Button>
          <DeleteInterviewButton
            id={interview.id}
            label="Delete"
            variant="outline"
            redirectAfter="/admin/interviews"
          />
          <Button
            variant="ghost"
            render={<Link href={`/experiences/${interview.id}`} />}
          >
            View as student
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Candidate profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <dl className="grid gap-3 sm:grid-cols-3">
            <DlRow label="CGPA" value={fmtNum(interview.candidateCgpa)} />
            <DlRow
              label="Branch"
              value={interview.candidateBranch?.replace(/_/g, " ") ?? "—"}
            />
            <DlRow
              label="Grad year"
              value={interview.candidateGradYear?.toString() ?? "—"}
            />
            <DlRow
              label="CGPA cutoff"
              value={fmtNum(interview.cgpaCutoff)}
            />
            <DlRow
              label="Total selected"
              value={interview.totalSelected?.toString() ?? "—"}
            />
            <DlRow
              label="Mode"
              value={interview.isOnCampus ? "On-campus" : "Off-campus"}
            />
          </dl>
          {interview.candidateBackground ? (
            <>
              <Separator />
              <div>
                <p className="text-muted-foreground mb-1 text-xs uppercase">
                  Background
                </p>
                <MarkdownRenderer content={interview.candidateBackground} />
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {interview.biggestTip ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Biggest tip</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={interview.biggestTip} />
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Rounds ({interview.rounds.length})
        </h2>
        {interview.rounds.map((r) => (
          <details
            key={r.id}
            className="rounded-md border"
            open
          >
            <summary className="flex cursor-pointer flex-wrap items-center gap-2 p-3 text-sm">
              <span className="text-muted-foreground font-mono">
                #{r.roundNumber}
              </span>
              <span className="font-medium">{r.roundName}</span>
              <Badge variant="secondary">{r.roundType.replace(/_/g, " ")}</Badge>
              <Badge variant="secondary">{r.mode.replace(/_/g, " ")}</Badge>
              {r.durationMinutes ? (
                <Badge variant="outline">{r.durationMinutes} min</Badge>
              ) : null}
              {r.numInterviewers != null ? (
                <Badge variant="outline">
                  {r.numInterviewers} interviewer
                  {r.numInterviewers === 1 ? "" : "s"}
                </Badge>
              ) : null}
              <Badge
                className={cn(
                  "ml-auto font-normal",
                  ROUND_OUTCOME_TONE[r.outcome] ?? "",
                )}
              >
                {r.outcome}
              </Badge>
            </summary>
            <div className="border-t p-3 space-y-3 text-sm">
              {r.interviewStyle ? (
                <p>
                  <span className="text-muted-foreground text-xs uppercase mr-2">
                    Style
                  </span>
                  {r.interviewStyle}
                </p>
              ) : null}

              {r.questions.length === 0 ? (
                <p className="text-muted-foreground italic">
                  No questions recorded.
                </p>
              ) : (
                r.questions.map((q) => (
                  <div key={q.id} className="rounded-md border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        Q{q.orderIndex + 1}
                      </Badge>
                      <span className="font-medium">{q.title}</span>
                      <Badge variant="secondary">
                        {q.category.replace(/_/g, " ")}
                      </Badge>
                      <Badge
                        className={cn(
                          "font-normal",
                          DIFFICULTY_TONE[q.difficulty] ?? "",
                        )}
                      >
                        {q.difficulty}
                      </Badge>
                      {q.solvedStatus ? (
                        <Badge variant="outline">
                          {q.solvedStatus.replace(/_/g, " ")}
                        </Badge>
                      ) : null}
                    </div>
                    {q.topics.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {q.topics.map(({ topic }) => (
                          <Badge key={topic.slug} variant="outline">
                            {topic.name}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs uppercase">
                          Statement
                        </p>
                        <MarkdownRenderer content={q.statement} />
                      </div>
                      {q.approach ? (
                        <details className="text-sm">
                          <summary className="cursor-pointer underline">
                            Show approach
                          </summary>
                          <div className="mt-2">
                            <MarkdownRenderer content={q.approach} />
                          </div>
                        </details>
                      ) : null}
                      {q.followUps.length > 0 ? (
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs uppercase">
                            Follow-ups
                          </p>
                          <ul className="ml-5 list-disc">
                            {q.followUps.map((fu, i) => (
                              <li key={i}>{fu}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        {q.timeGivenMin != null ? (
                          <span>Time given: {q.timeGivenMin} min</span>
                        ) : null}
                        {q.timeTakenMin != null ? (
                          <span>Time taken: {q.timeTakenMin} min</span>
                        ) : null}
                        {q.referenceUrl ? (
                          <a
                            className="underline"
                            href={q.referenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLinkIcon className="mr-1 inline size-3" />
                            Reference
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {r.keyLearnings ? (
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-muted-foreground mb-1 text-xs uppercase">
                    Key learnings
                  </p>
                  <MarkdownRenderer content={r.keyLearnings} />
                </div>
              ) : null}

              {r.assets.length > 0 ? (
                <div>
                  <p className="text-muted-foreground mb-1 text-xs uppercase">
                    Round assets
                  </p>
                  <AssetList assets={r.assets} />
                </div>
              ) : null}
            </div>
          </details>
        ))}
      </section>

      {interview.assets.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Interview assets</CardTitle>
            <CardDescription>
              Prep PDFs and external links scoped to the whole interview.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AssetList assets={interview.assets} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function DlRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-muted-foreground text-xs uppercase">{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}

function fmtNum(n: number | null): string {
  if (n === null || n === undefined) return "—";
  return n.toString();
}

function AssetList({
  assets,
}: {
  assets: { id: string; kind: string; url: string; label: string | null }[];
}) {
  return (
    <ul className="space-y-1 text-sm">
      {assets.map((a) => (
        <li key={a.id} className="flex items-center gap-2">
          {a.kind === "external_link" ? (
            <ExternalLinkIcon className="size-3" />
          ) : (
            <FileTextIcon className="size-3" />
          )}
          <a
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {a.label || a.url}
          </a>
          <span className="text-muted-foreground text-xs">[{a.kind}]</span>
        </li>
      ))}
    </ul>
  );
}
