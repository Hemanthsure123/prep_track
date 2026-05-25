import { createClient } from "@/lib/supabase/server";

export const ASSETS_BUCKET = "assets";

export type AssetPathPrefix = "interviews" | "rounds";

function sanitizeFilename(name: string): string {
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  const safeStem = stem
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 120);
  const safeExt = ext.replace(/[^a-zA-Z0-9.]+/g, "").slice(0, 16);
  return `${safeStem || "file"}${safeExt.toLowerCase()}`;
}

export function getPublicUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${ASSETS_BUCKET}/${path}`;
}

export async function uploadAsset(
  file: File,
  pathPrefix: AssetPathPrefix,
  ownerId: string,
): Promise<{ path: string; publicUrl: string }> {
  const supabase = await createClient();
  const path = `${pathPrefix}/${ownerId}/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;

  const { error } = await supabase.storage
    .from(ASSETS_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  return { path, publicUrl: getPublicUrl(path) };
}

export async function deleteAsset(path: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(ASSETS_BUCKET).remove([path]);

  if (error) {
    throw new Error(`Storage delete failed: ${error.message}`);
  }
}
