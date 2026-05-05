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

type CompletedUploadItem = {
  docType: string;
  checklistItemId: string | null;
  otherName: string;
  displayName: string | null;
  originalFilename: string;
  normalizedFilename: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
};

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

function buildValidationPayload(
  errorCode: string,
  options?: {
    missingChecklistItems?: string[];
    duplicateChecklistItems?: string[];
    alreadyUploadedChecklistItems?: string[];
  }
) {
  return {
    error: errorCode,
    missingChecklistItems: options?.missingChecklistItems ?? [],
    duplicateChecklistItems: options?.duplicateChecklistItems ?? [],
    alreadyUploadedChecklistItems: options?.alreadyUploadedChecklistItems ?? [],
  };
}

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const body = await request.json().catch(() => null);
  const remarks = body?.remarks?.toString().trim() || "";
  const uploadItems = Array.isArray(body?.items)
    ? (body.items as CompletedUploadItem[])
    : [];

  if (!token || uploadItems.length === 0) {
    return NextResponse.json({ error: "no_files" }, { status: 400 });
  }

  const submissionLink = await prisma.submissionLink.findUnique({
    where: { token },
    include: {
      case: {
        include: {
          client: true,
          checklistItems: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            include: {
              documents: {
                select: { id: true },
              },
            },
          },
        },
      },
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

  const caseFolderName = submissionLink.case.caseCode.replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  );
  const invalidFile = uploadItems.some(
    (item) =>
      !item ||
      !item.originalFilename ||
      !item.normalizedFilename ||
      !item.storagePath ||
      !item.storagePath.startsWith(`${caseFolderName}/`) ||
      !allowedMimeTypes.includes(item.mimeType) ||
      !Number.isFinite(item.fileSize) ||
      item.fileSize <= 0
  );

  if (invalidFile) {
    return NextResponse.json({ error: "invalid_files" }, { status: 400 });
  }

  const checklistItems = submissionLink.case.checklistItems;
  const checklistMode = checklistItems.length > 0;
  const checklistItemMap = new Map(
    checklistItems.map((item) => [item.id, item])
  );

  if (checklistMode) {
    const invalidChecklistItem = uploadItems.some(
      (item) =>
        !item.checklistItemId || !checklistItemMap.has(item.checklistItemId)
    );

    if (invalidChecklistItem) {
      return NextResponse.json({ error: "invalid_files" }, { status: 400 });
    }

    const selectedChecklistItemIds = uploadItems
      .map((item) => item.checklistItemId)
      .filter((item): item is string => Boolean(item));
    const duplicateChecklistItems = Array.from(
      new Set(
        selectedChecklistItemIds
          .filter(
            (itemId, index) => selectedChecklistItemIds.indexOf(itemId) !== index
          )
          .map((itemId) => checklistItemMap.get(itemId)?.label || itemId)
      )
    );
    const alreadyUploadedChecklistItems = selectedChecklistItemIds
      .filter((itemId) => {
        const checklistItem = checklistItemMap.get(itemId);
        return (checklistItem?.documents.length ?? 0) > 0;
      })
      .map((itemId) => checklistItemMap.get(itemId)?.label || itemId);

    if (
      duplicateChecklistItems.length > 0 ||
      alreadyUploadedChecklistItems.length > 0
    ) {
      const errorCode =
        duplicateChecklistItems.length > 0
          ? "duplicate_checklist_items"
          : "checklist_items_already_uploaded";

      return NextResponse.json(
        buildValidationPayload(errorCode, {
          duplicateChecklistItems,
          alreadyUploadedChecklistItems,
        }),
        { status: 400 }
      );
    }
  } else {
    const invalidDocType = uploadItems.some(
      (item) => !item.docType || (item.docType === "other" && !item.otherName)
    );

    if (invalidDocType) {
      return NextResponse.json({ error: "invalid_files" }, { status: 400 });
    }
  }

  const clientDisplayName =
    submissionLink.case.client.englishName?.trim() ||
    submissionLink.case.client.chineseName?.trim() ||
    "Client";

  try {
    const submission = await prisma.$transaction(async (tx) => {
      const createdSubmission = await tx.documentSubmission.create({
        data: {
          caseId: submissionLink.caseId,
          submissionLinkId: submissionLink.id,
          source: "upload_portal",
          submittedByName: clientDisplayName,
          submittedByEmail: null,
          status: "submitted",
          remarks: remarks || null,
        },
      });

      for (const item of uploadItems) {
        const checklistItem = item.checklistItemId
          ? checklistItemMap.get(item.checklistItemId)
          : null;
        const docType = checklistMode
          ? checklistItem?.label || item.docType
          : item.docType;
        const displayName = checklistMode
          ? checklistItem?.label || item.displayName
          : item.displayName;

        await tx.document.create({
          data: {
            caseId: submissionLink.caseId,
            submissionId: createdSubmission.id,
            docType,
            checklistItemId: item.checklistItemId,
            displayName,
            originalFilename: item.originalFilename,
            normalizedFilename: item.normalizedFilename,
            mimeType: item.mimeType || null,
            fileSize: BigInt(item.fileSize),
            versionNo: 1,
            storageProvider: "supabase_storage",
            storagePath: item.storagePath,
            storageUrl: null,
            reviewStatus: "uploaded",
          },
        });
      }

      await tx.submissionLink.update({
        where: { id: submissionLink.id },
        data: {
          currentUses: {
            increment: 1,
          },
        },
      });

      await tx.auditLog.create({
        data: {
          caseId: submissionLink.caseId,
          relatedEntityType: "document_submission",
          relatedEntityId: createdSubmission.id,
          actionType: "submit_upload_portal_form",
          actorType: "client",
          success: true,
          newValue: {
            submittedByName: createdSubmission.submittedByName,
            submittedByEmail: createdSubmission.submittedByEmail,
            status: createdSubmission.status,
            fileCount: uploadItems.length,
            docTypes: uploadItems.map((item) => item.docType),
            checklistItemIds: uploadItems.map((item) => item.checklistItemId),
            otherNames: uploadItems.map((item) => item.otherName || null),
            fileNames: uploadItems.map((item) => item.originalFilename),
          },
        },
      });

      return createdSubmission;
    });

    return NextResponse.json({ success: true, submissionId: submission.id });
  } catch (error) {
    console.error("Complete upload failed:", error);

    try {
      const supabase = getSupabaseAdminClient();
      await supabase.storage
        .from(STORAGE_BUCKET_NAME)
        .remove(uploadItems.map((item) => item.storagePath));
    } catch (cleanupError) {
      console.error("Failed to clean up uploaded files:", cleanupError);
    }

    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }
}
