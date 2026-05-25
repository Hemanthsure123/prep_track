import Link from "next/link";
import { redirect } from "next/navigation";
import { EyeIcon, PencilIcon, PlusIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

import { DeleteInterviewButton } from "./delete-button";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const OUTCOME_TONE: Record<string, string> = {
  SELECTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  WAITLISTED: "bg-amber-100 text-amber-700",
  WITHDREW: "bg-slate-100 text-slate-700",
  IN_PROCESS: "bg-sky-100 text-sky-700",
};

export default async function AdminInterviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const pageNum = Math.max(1, Number(params.page ?? 1) || 1);
  const skip = (pageNum - 1) * PAGE_SIZE;

  const [total, rows] = await Promise.all([
    prisma.interview.count(),
    prisma.interview.findMany({
      orderBy: { publishedAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: {
        company: { select: { name: true, slug: true, logoUrl: true } },
        _count: { select: { rounds: true } },
        rounds: { select: { _count: { select: { questions: true } } } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (total === 0) {
    return (
      <div className="space-y-6">
        <PageHeader empty />
        <Card>
          <CardHeader>
            <CardTitle>No interviews yet.</CardTitle>
            <CardDescription>Add the first one.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/admin/interviews/new" />}>
              <PlusIcon className="size-4" />
              Add interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader />

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Company</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">Year</th>
              <th className="px-3 py-2 font-medium">Outcome</th>
              <th className="px-3 py-2 font-medium">Rounds</th>
              <th className="px-3 py-2 font-medium">Questions</th>
              <th className="px-3 py-2 font-medium">Created</th>
              <th className="px-3 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const questionTotal = row.rounds.reduce(
                (acc, r) => acc + r._count.questions,
                0,
              );
              return (
                <tr key={row.id} className="border-t">
                  <td className="px-3 py-2">{row.company.name}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{row.role}</div>
                    <div className="text-muted-foreground text-xs">
                      {row.roleLevel.replace(/_/g, " ")}
                    </div>
                  </td>
                  <td className="px-3 py-2">{row.year}</td>
                  <td className="px-3 py-2">
                    <Badge
                      className={cn(
                        "font-normal",
                        OUTCOME_TONE[row.finalOutcome] ?? "",
                      )}
                    >
                      {row.finalOutcome}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 font-mono">
                    {row._count.rounds}
                  </td>
                  <td className="px-3 py-2 font-mono">{questionTotal}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.publishedAt.toISOString().slice(0, 10)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        render={
                          <Link href={`/admin/interviews/${row.id}`} />
                        }
                      >
                        <EyeIcon className="size-4" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        render={
                          <Link href={`/admin/interviews/${row.id}/edit`} />
                        }
                      >
                        <PencilIcon className="size-4" />
                        Edit
                      </Button>
                      <DeleteInterviewButton id={row.id} label="Delete" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {pageNum} of {totalPages} · {total} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pageNum <= 1}
              render={
                <Link
                  href={`/admin/interviews?page=${Math.max(1, pageNum - 1)}`}
                  aria-disabled={pageNum <= 1}
                />
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pageNum >= totalPages}
              render={
                <Link
                  href={`/admin/interviews?page=${Math.min(totalPages, pageNum + 1)}`}
                  aria-disabled={pageNum >= totalPages}
                />
              }
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PageHeader({ empty }: { empty?: boolean }) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Interviews</h1>
        <p className="text-muted-foreground text-sm">
          Browse and manage every interview captured in the system.
        </p>
      </div>
      {empty ? null : (
        <Button render={<Link href="/admin/interviews/new" />}>
          <PlusIcon className="size-4" />
          New interview
        </Button>
      )}
    </header>
  );
}
