"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { requireAdminOrPanelist } from "@/lib/auth/guards";
import { extractInterviewFromRow } from "@/lib/ai/extraction";
import type { ParsedCsvRow } from "@/lib/ai/extraction";

import { createFullInterview } from "@/app/_actions/interview";

const CONCURRENCY = 3;

export async function createImportBatch(
  filename: string,
  rows: ParsedCsvRow[],
): Promise<{ batchId: string }> {
  const user = await requireAdminOrPanelist();

  if (rows.length === 0) {
    throw new Error("CSV has no rows to import.");
  }
  if (rows.length > 200) {
    throw new Error(
      "Batches are capped at 200 rows. Split your CSV into smaller files.",
    );
  }

  const batch = await prisma.importBatch.create({
    data: {
      uploadedById: user.id,
      filename,
      totalRows: rows.length,
      rows: {
        create: rows.map((row, i) => ({
          rowIndex: i + 1,
          companyName: (row.company_name ?? "").trim() || "Unknown",
          rawCsvJson: row as unknown as Prisma.InputJsonValue,
          status: "QUEUED",
        })),
      },
    },
    select: { id: true },
  });

  revalidatePath("/admin/imports");
  return { batchId: batch.id };
}

export async function processImportBatch(batchId: string): Promise<void> {
  await requireAdminOrPanelist();

  const rows = await prisma.importRow.findMany({
    where: { batchId, status: "QUEUED" },
    orderBy: { rowIndex: "asc" },
    select: { id: true },
  });

  if (rows.length === 0) {
    revalidatePath(`/admin/imports/${batchId}`);
    return;
  }

  // Bounded-concurrency promise pool.
  const queue = [...rows];
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      while (queue.length > 0) {
        const next = queue.shift();
        if (!next) break;
        await processRow(next.id);
      }
    }),
  );

  revalidatePath(`/admin/imports/${batchId}`);
}

async function processRow(rowId: string): Promise<void> {
  await prisma.importRow.update({
    where: { id: rowId },
    data: { status: "EXTRACTING", errorMessage: null },
  });

  try {
    const row = await prisma.importRow.findUniqueOrThrow({
      where: { id: rowId },
    });
    const result = await extractInterviewFromRow(
      row.rawCsvJson as ParsedCsvRow,
    );

    await prisma.importRow.update({
      where: { id: rowId },
      data: {
        status: "READY_FOR_REVIEW",
        extractedJson: result.extracted as unknown as Prisma.InputJsonValue,
        extractionTokens: result.inputTokens + result.outputTokens,
        extractionCostUsd: result.costUsd,
        errorMessage: null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await prisma.importRow.update({
      where: { id: rowId },
      data: { status: "FAILED", errorMessage: message.slice(0, 2000) },
    });
  }
}

export async function retryRow(
  rowId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminOrPanelist();

  const row = await prisma.importRow.findUnique({ where: { id: rowId } });
  if (!row) return { ok: false, error: "Row not found." };

  await prisma.importRow.update({
    where: { id: rowId },
    data: { status: "QUEUED", errorMessage: null },
  });

  await processRow(rowId);
  revalidatePath(`/admin/imports/${row.batchId}`);
  return { ok: true };
}

export async function approveAndPublishRow(
  rowId: string,
  payload: Parameters<typeof createFullInterview>[0],
): Promise<{ id: string }> {
  await requireAdminOrPanelist();

  const row = await prisma.importRow.findUnique({ where: { id: rowId } });
  if (!row) throw new Error("Import row not found.");
  if (row.status === "PUBLISHED" && row.publishedInterviewId) {
    return { id: row.publishedInterviewId };
  }

  const result = await createFullInterview(payload);

  await prisma.importRow.update({
    where: { id: rowId },
    data: {
      status: "PUBLISHED",
      reviewedAt: new Date(),
      publishedInterviewId: result.id,
    },
  });

  revalidatePath("/admin/imports");
  revalidatePath(`/admin/imports/${row.batchId}`);
  revalidatePath("/admin/interviews");
  return result;
}
