import { redirect } from "next/navigation";
import { QuestionCategory } from "@prisma/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { ASSETS_BUCKET } from "@/lib/storage";

export const metadata = {
  title: "DB Check | Interview Experience Platform",
};

export const dynamic = "force-dynamic";

const ALL_CATEGORIES = Object.values(QuestionCategory);

export default async function DbCheckPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    topicTotal,
    topicsGrouped,
    sampleTopicsRaw,
    companies,
    flags,
    userTotal,
    currentUser,
    interviewCount,
    roundCount,
    questionCount,
    assetCount,
    bookmarkCount,
  ] = await Promise.all([
    prisma.topic.count(),
    prisma.topic.groupBy({
      by: ["category"],
      _count: { _all: true },
      orderBy: { category: "asc" },
    }),
    prisma.topic.findMany({
      select: { name: true, slug: true, category: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.company.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.featureFlag.findMany({ orderBy: { key: "asc" } }),
    prisma.user.count(),
    user.email
      ? prisma.user.findUnique({ where: { email: user.email } })
      : Promise.resolve(null),
    prisma.interview.count(),
    prisma.round.count(),
    prisma.question.count(),
    prisma.asset.count(),
    prisma.bookmark.count(),
  ]);

  const countsByCategory = new Map<string, number>(
    topicsGrouped.map((g) => [g.category, g._count._all]),
  );

  const samplesByCategory = new Map<string, string[]>();
  for (const t of sampleTopicsRaw) {
    const list = samplesByCategory.get(t.category) ?? [];
    if (list.length < 5) list.push(t.name);
    samplesByCategory.set(t.category, list);
  }

  let storageOk = false;
  let storageError: string | null = null;
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      storageError = error.message;
    } else {
      storageOk = (buckets ?? []).some((b) => b.name === ASSETS_BUCKET);
      if (!storageOk) {
        storageError = `No bucket named "${ASSETS_BUCKET}" was returned.`;
      }
    }
  } catch (err) {
    storageError = err instanceof Error ? err.message : String(err);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">DB & Storage diagnostic</h1>
        <p className="text-muted-foreground text-sm">
          Throwaway page that proves every model is queryable and the storage
          bucket is reachable. Read-only.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Topics</CardTitle>
          <CardDescription>
            Controlled vocabulary keyed by category.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Stat label="Total topics" value={topicTotal} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_CATEGORIES.map((cat) => {
              const count = countsByCategory.get(cat) ?? 0;
              const samples = samplesByCategory.get(cat) ?? [];
              return (
                <div
                  key={cat}
                  className="rounded-md border p-3 text-sm"
                  data-testid={`topic-cat-${cat}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{cat}</span>
                    <span className="text-muted-foreground font-mono">
                      {count}
                    </span>
                  </div>
                  {samples.length > 0 ? (
                    <ul className="text-muted-foreground mt-2 space-y-1">
                      {samples.map((name) => (
                        <li key={name}>· {name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground mt-2 italic">empty</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
          <CardDescription>Starter list seeded in Step 2.</CardDescription>
        </CardHeader>
        <CardContent>
          <Stat label="Total companies" value={companies.length} />
          <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <dt>{c.name}</dt>
                <dd className="text-muted-foreground font-mono">{c.slug}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature flags</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            {flags.map((f) => (
              <div
                key={f.key}
                className="flex items-start justify-between gap-4 rounded-md border px-3 py-2"
              >
                <div>
                  <dt className="font-mono">{f.key}</dt>
                  {f.description ? (
                    <dd className="text-muted-foreground">{f.description}</dd>
                  ) : null}
                </div>
                <span
                  className={
                    f.enabled
                      ? "rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                      : "bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs font-medium"
                  }
                >
                  {f.enabled ? "ON" : "OFF"}
                </span>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Proves Supabase auth user ↔ Prisma User row are mapped by email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Stat label="Total users" value={userTotal} />
          {currentUser ? (
            <dl className="space-y-1 rounded-md border p-3 text-sm">
              <Row label="id" value={currentUser.id} mono />
              <Row label="email" value={currentUser.email} mono />
              <Row label="name" value={currentUser.name ?? "—"} />
              <Row label="role" value={currentUser.role} />
              <Row
                label="createdAt"
                value={currentUser.createdAt.toISOString()}
                mono
              />
            </dl>
          ) : (
            <p className="text-destructive text-sm">
              No matching Prisma User row for {user.email}. (Signup should have
              upserted one — re-sign-up or run a manual upsert.)
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interviews / Rounds / Questions / Assets / Bookmarks</CardTitle>
          <CardDescription>
            Zeros are expected for now — the wizard lands in Step 3.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <Stat label="Interviews" value={interviewCount} />
            <Stat label="Rounds" value={roundCount} />
            <Stat label="Questions" value={questionCount} />
            <Stat label="Assets" value={assetCount} />
            <Stat label="Bookmarks" value={bookmarkCount} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage bucket</CardTitle>
          <CardDescription>
            Listing buckets via Supabase Storage API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <span className="font-mono">{ASSETS_BUCKET}</span>
            <span
              className={
                storageOk
                  ? "rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                  : "bg-destructive/10 text-destructive rounded px-2 py-0.5 text-xs font-medium"
              }
            >
              {storageOk ? "OK" : "MISSING"}
            </span>
          </div>
          {storageError ? (
            <p className="text-muted-foreground mt-2 text-xs">{storageError}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </div>
      <div className="mt-1 font-mono text-lg">{value}</div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono" : ""}>{value}</dd>
    </div>
  );
}
