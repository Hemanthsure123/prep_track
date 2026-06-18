import { Prisma } from "@prisma/client";

import { slugify } from "@/lib/slug";

/**
 * These reference entities (Company, RoleLevel, SubTopic) each have MORE THAN
 * ONE unique key — typically both a human `name` and a derived `slug` (scoped
 * to a topic area for sub-topics). A plain `create`, or an `upsert` keyed on
 * just one of those uniques, blows up with P2002 whenever an existing row
 * matches on the *other* unique — e.g. two names that slugify to the same
 * value ("DP!" / "DP?" -> "dp"), or differing whitespace/casing.
 *
 * `getOrCreate` resolves this for good: it looks the row up by ANY of its
 * unique keys first (so near-duplicates reuse the existing row), and only
 * inserts when nothing matches. If a concurrent writer wins the insert race
 * (P2002), it re-reads and returns theirs. Works against either the base
 * client or a transaction client.
 */

function isUniqueViolation(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"
  );
}

async function getOrCreate(
  find: () => Promise<{ id: string } | null>,
  create: () => Promise<{ id: string }>,
): Promise<string> {
  const found = await find();
  if (found) return found.id;
  try {
    return (await create()).id;
  } catch (e) {
    // Lost an insert race to a concurrent writer — re-read and use theirs.
    // (When already inside an aborted transaction the re-read will throw, in
    // which case the original error propagates, same as before.)
    if (isUniqueViolation(e)) {
      const again = await find();
      if (again) return again.id;
    }
    throw e;
  }
}

export async function getOrCreateRoleLevelId(
  db: Prisma.TransactionClient,
  rawName: string,
): Promise<string> {
  const name = rawName.trim();
  const slug = slugify(rawName);
  return getOrCreate(
    () =>
      db.roleLevel.findFirst({
        where: { OR: [{ slug }, { name }] },
        select: { id: true },
      }),
    () => db.roleLevel.create({ data: { name, slug }, select: { id: true } }),
  );
}

export async function getOrCreateSubTopicId(
  db: Prisma.TransactionClient,
  rawName: string,
  topicAreaId: string,
): Promise<string> {
  const name = rawName.trim();
  const slug = slugify(rawName);
  return getOrCreate(
    () =>
      db.subTopic.findFirst({
        where: { topicAreaId, OR: [{ slug }, { name }] },
        select: { id: true },
      }),
    () =>
      db.subTopic.create({
        data: { name, slug, topicAreaId },
        select: { id: true },
      }),
  );
}

export async function getOrCreateCompanyId(
  db: Prisma.TransactionClient,
  data: {
    name: string;
    slug?: string | null;
    logoUrl?: string | null;
    websiteUrl?: string | null;
    description?: string | null;
  },
): Promise<string> {
  const name = data.name.trim();
  const slug = (data.slug || slugify(data.name)).trim();
  return getOrCreate(
    () =>
      db.company.findFirst({
        where: { OR: [{ slug }, { name }] },
        select: { id: true },
      }),
    () =>
      db.company.create({
        data: {
          name,
          slug,
          logoUrl: data.logoUrl ?? null,
          websiteUrl: data.websiteUrl ?? null,
          description: data.description ?? null,
        },
        select: { id: true },
      }),
  );
}
