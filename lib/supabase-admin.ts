import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const STORAGE_BUCKET_NAME = "client-documents";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseServiceRoleKey);
  }

  return cachedClient;
}

export async function uploadBufferToStorage(
  storagePath: string,
  fileBuffer: Buffer,
  contentType: string
) {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET_NAME)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message || "Failed to upload file to storage.");
  }
}

export async function downloadStorageFile(storagePath: string) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET_NAME)
    .download(storagePath);

  if (error || !data) {
    throw new Error(error?.message || "Failed to download file from storage.");
  }

  return Buffer.from(await data.arrayBuffer());
}

export async function createStorageSignedUrl(
  storagePath: string,
  expiresInSeconds = 60 * 60 * 24 * 7
) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET_NAME)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || "Failed to create signed URL.");
  }

  return data.signedUrl;
}

export async function removeStorageFiles(storagePaths: string[]) {
  if (storagePaths.length === 0) {
    return;
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET_NAME)
    .remove(storagePaths);

  if (error) {
    throw new Error(error.message || "Failed to remove files from storage.");
  }
}
