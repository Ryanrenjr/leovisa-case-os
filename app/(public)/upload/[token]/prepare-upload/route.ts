import { NextResponse } from "next/server";
import {
  getSupabaseAdminClient,
  STORAGE_BUCKET_NAME,
} from "../../../../../lib/supabase-admin";
import { prisma } from "../../../../../lib/prisma";

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

type PrepareUploadFile = {
  originalFilename: string;
  mimeType: string;
  fileSize: number;
};

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const body = await request.json().catch(() => null);
  const files = Array.isArray(body?.files)
    ? (body.files as PrepareUploadFile[])
    : [];

  if (!token || files.length === 0) {
    return NextResponse.json({ error: "invalid_files" }, { status: 400 });
  }

  const submissionLink = await prisma.submissionLink.findUnique({
    where: { token },
    include: {
      case: true,
    },
  });

  if (!submissionLink) {
    return NextResponse.json({ error: "link_unavailable" }, { status: 404 });
  }

  const isExpired =
    submissionLink.expiresAt && new Date(submissionLink.expiresAt) < new Date();
  const isInactive = submissionLink.status !== "active";
  const isMaxedOut =
    submissionLink.maxUses !== null &&
    submissionLink.currentUses >= submissionLink.maxUses;

  if (isExpired || isInactive || isMaxedOut) {
    return NextResponse.json({ error: "link_unavailable" }, { status: 403 });
  }

  const invalidFile = files.some(
    (file) =>
      !file ||
      !file.originalFilename ||
      !allowedMimeTypes.includes(file.mimeType) ||
      !Number.isFinite(file.fileSize) ||
      file.fileSize <= 0
  );

  if (invalidFile) {
    return NextResponse.json({ error: "invalid_files" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const caseFolderName = submissionLink.case.caseCode.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    const uploads = await Promise.all(
      files.map(async (file) => {
        const safeOriginalName = sanitizeFilename(file.originalFilename);
        const uniquePrefix = `${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}`;
        const normalizedFilename = `${uniquePrefix}_${safeOriginalName}`;
        const storagePath = `${caseFolderName}/${normalizedFilename}`;

        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET_NAME)
          .createSignedUploadUrl(storagePath, {
            upsert: false,
          });

        if (error || !data?.signedUrl) {
          throw new Error(error?.message || "Failed to create upload URL.");
        }

        return {
          originalFilename: file.originalFilename,
          normalizedFilename,
          mimeType: file.mimeType,
          fileSize: file.fileSize,
          storagePath,
          signedUrl: data.signedUrl,
        };
      })
    );

    return NextResponse.json({ uploads });
  } catch (error) {
    console.error("Prepare upload failed:", error);
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }
}
