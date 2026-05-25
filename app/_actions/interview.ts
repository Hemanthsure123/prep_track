"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { requireAdminOrPanelist } from "@/lib/auth/guards";
import {
  createInterviewTree,
  replaceInterviewTree,
} from "@/lib/interview/write";
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
}

export async function createFullInterview(
  input: unknown,
): Promise<{ id: string }> {
  const user = await requireAdminOrPanelist();
  const payload = parsePayload(input);

  const { id } = await prisma.$transaction((tx) =>
    createInterviewTree(tx, user.id, payload),
  );

  revalidateInterviewPaths(id);
  return { id };
}

export async function updateFullInterview(
  id: string,
  input: unknown,
): Promise<{ id: string }> {
  const user = await requireAdminOrPanelist();
  const payload = parsePayload(input);

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

  await prisma.$transaction((tx) =>
    replaceInterviewTree(tx, id, user.id, payload),
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
