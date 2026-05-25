"use server";

import { requireAdminOrPanelist } from "@/lib/auth/guards";
import {
  AssetPathPrefix,
  deleteAsset,
  uploadAsset,
} from "@/lib/storage";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_PREFIXES: ReadonlySet<AssetPathPrefix> = new Set([
  "interviews",
  "rounds",
]);

export async function uploadAssetAction(
  formData: FormData,
): Promise<{ path: string; publicUrl: string }> {
  const user = await requireAdminOrPanelist();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Missing file.");
  }

  if (file.size === 0) {
    throw new Error("File is empty.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`File too large. Max ${MAX_BYTES / (1024 * 1024)} MB.`);
  }
  if (file.type && !ALLOWED_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}.`);
  }

  const rawPrefix = formData.get("prefix");
  if (typeof rawPrefix !== "string" || !ALLOWED_PREFIXES.has(rawPrefix as AssetPathPrefix)) {
    throw new Error("Invalid upload prefix.");
  }

  return uploadAsset(file, rawPrefix as AssetPathPrefix, user.id);
}

export async function deleteAssetAction(path: string): Promise<{ ok: true }> {
  await requireAdminOrPanelist();
  if (!path || path.includes("..") || path.startsWith("/")) {
    throw new Error("Invalid path.");
  }
  await deleteAsset(path);
  return { ok: true };
}
