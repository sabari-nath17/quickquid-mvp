"use server";

import { getSupabaseAdmin } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth";
import { randomUUID } from "crypto";

type Bucket = "avatars" | "portfolios" | "packages";

export async function uploadImage(
  formData: FormData,
  bucket: Bucket
): Promise<{ url?: string; error?: string }> {
  try {
    await requireAuth();
  } catch {
    return { error: "Not authenticated" };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided" };
  if (file.size > 10 * 1024 * 1024) return { error: "File too large (max 10 MB)" };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
  if (!allowed.includes(ext)) return { error: "Only JPG, PNG, WebP, or GIF allowed" };

  const path = `${randomUUID()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}
