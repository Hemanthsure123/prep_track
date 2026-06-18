"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { prisma } from "@/lib/db";
import { requireAdminOrPanelist } from "@/lib/auth/guards";
import {
  createInterviewTree,
  replaceInterviewTree,
} from "@/lib/interview/write";
import { getOrCreateSubTopicId } from "@/lib/interview/get-or-create";
import { ASSETS_BUCKET, deleteAsset } from "@/lib/storage";
import {
  InterviewFullCreate,
  interviewFullCreateSchema,
} from "@/lib/validations/interview-full";

class ValidationError extends Error {
  constructor(message: string, readonly issues: unknown) {
    super(message);
    this.name = "ValidationError";
  }
}

function parsePayload(input: unknown): InterviewFullCreate {
  const parsed = interviewFullCreateSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Invalid interview payload.", parsed.error.issues);
  }
  return parsed.data;
}

function pathFromPublicUrl(url: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  const prefix = `${base}/storage/v1/object/public/${ASSETS_BUCKET}/`;
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length);
}

async function bestEffortDeleteAssets(
  urls: ReadonlyArray<string>,
): Promise<void> {
  for (const url of urls) {
    const path = pathFromPublicUrl(url);
    if (!path) continue;
    try {
      await deleteAsset(path);
    } catch {
      // Best-effort: storage orphans are preferable to DB inconsistency.
    }
  }
}

function revalidateInterviewPaths(id?: string): void {
  revalidatePath("/admin/interviews");
  if (id) revalidatePath(`/admin/interviews/${id}`);
  revalidatePath("/");
  revalidateTag("analytics");
}

async function preResolveSubTopics(
  payload: InterviewFullCreate,
): Promise<InterviewFullCreate> {
  const newEntries = new Map<string, { name: string; topicAreaId: string }>();
  for (const round of payload.rounds) {
    for (const cov of round.topicCoverages) {
      for (const e of cov.entries) {
        if (e.subTopicId === "__new__" && e.subTopicName) {
          const key = `${cov.topicAreaId}::${e.subTopicName.trim().toLowerCase()}`;
          if (!newEntries.has(key)) {
            newEntries.set(key, {
              name: e.subTopicName.trim(),
              topicAreaId: cov.topicAreaId,
            });
          }
        }
      }
    }
  }

  if (newEntries.size === 0) return payload;

  const resolvedById = new Map<string, string>();
  for (const [key, { name, topicAreaId }] of newEntries) {
    const id = await getOrCreateSubTopicId(prisma, name, topicAreaId);
    resolvedById.set(key, id);
  }

  return {
    ...payload,
    rounds: payload.rounds.map((r) => ({
      ...r,
      topicCoverages: r.topicCoverages.map((cov) => ({
        ...cov,
        entries: cov.entries.map((e) => {
          if (e.subTopicId !== "__new__" || !e.subTopicName) return e;
          const key = `${cov.topicAreaId}::${e.subTopicName.trim().toLowerCase()}`;
          const id = resolvedById.get(key);
          return id ? { ...e, subTopicId: id } : e;
        }),
      })),
    })),
  };
}

export async function createFullInterview(
  input: unknown,
): Promise<{ id: string }> {
  const user = await requireAdminOrPanelist();
  const payload = await preResolveSubTopics(parsePayload(input));

  const { id } = await prisma.$transaction(
    (tx) => createInterviewTree(tx, user.id, payload),
    { maxWait: 10_000, timeout: 30_000 },
  );

  revalidateInterviewPaths(id);
  return { id };
}

export async function updateFullInterview(
  id: string,
  input: unknown,
): Promise<{ id: string }> {
  const user = await requireAdminOrPanelist();
  const payload = await preResolveSubTopics(parsePayload(input));

  const existing = await prisma.interview.findUnique({
    where: { id },
    include: {
      assets: { select: { url: true } },
      rounds: { include: { assets: { select: { url: true } } } },
    },
  });

  if (!existing) {
    throw new ValidationError(`Interview ${id} not found.`, []);
  }

  const keepUrls = new Set(payload.assets.map((a) => a.url));
  const orphanUrls: string[] = [];
  for (const a of existing.assets) {
    if (!keepUrls.has(a.url)) orphanUrls.push(a.url);
  }
  for (const r of existing.rounds) {
    for (const a of r.assets) {
      if (!keepUrls.has(a.url)) orphanUrls.push(a.url);
    }
  }

  await prisma.$transaction(
    (tx) => replaceInterviewTree(tx, id, user.id, payload),
    { maxWait: 10_000, timeout: 30_000 },
  );

  await bestEffortDeleteAssets(orphanUrls);

  revalidateInterviewPaths(id);
  return { id };
}

export async function deleteInterview(id: string): Promise<{ ok: true }> {
  await requireAdminOrPanelist();

  const existing = await prisma.interview.findUnique({
    where: { id },
    include: {
      assets: { select: { url: true } },
      rounds: { include: { assets: { select: { url: true } } } },
    },
  });

  if (!existing) {
    return { ok: true };
  }

  const urls = [
    ...existing.assets.map((a) => a.url),
    ...existing.rounds.flatMap((r) => r.assets.map((a) => a.url)),
  ];

  await prisma.interview.delete({ where: { id } });

  await bestEffortDeleteAssets(urls);

  revalidateInterviewPaths(id);
  return { ok: true };
}

/**
 * Deletes a company and every interview belonging to it (with their rounds,
 * topic coverage, questions, bookmarks and asset rows — all cascaded at the DB
 * level) plus any uploaded files in storage. Irreversible.
 */
export async function deleteCompany(
  id: string,
): Promise<{ ok: true; deletedInterviews: number }> {
  await requireAdminOrPanelist();

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      interviews: {
        include: {
          assets: { select: { url: true } },
          rounds: { include: { assets: { select: { url: true } } } },
        },
      },
    },
  });

  if (!company) {
    return { ok: true, deletedInterviews: 0 };
  }

  const urls = company.interviews.flatMap((iv) => [
    ...iv.assets.map((a) => a.url),
    ...iv.rounds.flatMap((r) => r.assets.map((a) => a.url)),
  ]);

  // Interview.company has no DB-level cascade, so remove the interviews first
  // (their dependents cascade), then the now-empty company — atomically.
  await prisma.$transaction([
    prisma.interview.deleteMany({ where: { companyId: id } }),
    prisma.company.delete({ where: { id } }),
  ]);

  await bestEffortDeleteAssets(urls);

  revalidatePath("/companies");
  revalidatePath(`/companies/${company.slug}`);
  revalidateInterviewPaths();
  return { ok: true, deletedInterviews: company.interviews.length };
}
