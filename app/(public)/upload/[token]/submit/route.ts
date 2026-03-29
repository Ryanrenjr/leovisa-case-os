import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

type UploadItem = {
  docType: string;
  otherName: string;
  file: File;
};

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const formData = await request.formData();

  if (!token) {
    return NextResponse.redirect(
      new URL(`/upload/${token}?error=upload_failed`, request.url),
      303
    );
  }

  const submissionLink = await prisma.submissionLink.findUnique({
    where: { token },
    include: {
      case: {
        include: {
          client: true,
        },
      },
    },
  });

  if (!submissionLink) {
    return NextResponse.redirect(
      new URL(`/upload/${token}?error=link_unavailable`, request.url),
      303
    );
  }

  const isExpired =
    submissionLink.expiresAt && new Date(submissionLink.expiresAt) < new Date();

  const isInactive = submissionLink.status !== "active";
  const isMaxedOut =
    submissionLink.maxUses !== null &&
    submissionLink.currentUses >= submissionLink.maxUses;

  if (isExpired || isInactive || isMaxedOut) {
    return NextResponse.redirect(
      new URL(`/upload/${token}?error=link_unavailable`, request.url),
      303
    );
  }

  const remarks = formData.get("remarks")?.toString().trim() || "";
  const rowCount = Number(formData.get("rowCount") || 0);

  const uploadItems: UploadItem[] = [];

  for (let i = 0; i < rowCount; i++) {
    const docType = formData.get(`docType_${i}`)?.toString().trim() || "";
    const otherName = formData.get(`otherName_${i}`)?.toString().trim() || "";
    const file = formData.get(`file_${i}`);

    if (!docType && !file) {
      continue;
    }

    if (!docType || !(file instanceof File) || file.size === 0) {
      return NextResponse.redirect(
        new URL(`/upload/${token}?error=invalid_files`, request.url),
        303
      );
    }

    if (docType === "other" && !otherName) {
      return NextResponse.redirect(
        new URL(`/upload/${token}?error=invalid_files`, request.url),
        303
      );
    }

    uploadItems.push({
      docType,
      otherName,
      file,
    });
  }

  if (uploadItems.length === 0) {
    return NextResponse.redirect(
      new URL(`/upload/${token}?error=no_files`, request.url),
      303
    );
  }

  const clientDisplayName =
    submissionLink.case.client.englishName?.trim() ||
    submissionLink.case.client.chineseName?.trim() ||
    "Client";

  try {
    const submission = await prisma.documentSubmission.create({
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

    const caseFolderName = submissionLink.case.caseCode.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      caseFolderName
    );

    await fs.mkdir(uploadDir, { recursive: true });

    for (const item of uploadItems) {
      const bytes = await item.file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const safeOriginalName = item.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const savedFileName = `${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}_${safeOriginalName}`;
      const savedFilePath = path.join(uploadDir, savedFileName);

      await fs.writeFile(savedFilePath, buffer);

      const publicUrl = `/uploads/${caseFolderName}/${savedFileName}`;

      await prisma.document.create({
        data: {
          caseId: submissionLink.caseId,
          submissionId: submission.id,
          docType: item.docType,
          displayName: item.docType === "other" ? item.otherName : null,
          originalFilename: item.file.name,
          normalizedFilename: savedFileName,
          mimeType: item.file.type || null,
          fileSize: BigInt(item.file.size),
          versionNo: 1,
          storageProvider: "local",
          storagePath: savedFilePath,
          storageUrl: publicUrl,
          reviewStatus: "uploaded",
        },
      });
    }

    await prisma.submissionLink.update({
      where: { id: submissionLink.id },
      data: {
        currentUses: {
          increment: 1,
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        caseId: submissionLink.caseId,
        relatedEntityType: "document_submission",
        relatedEntityId: submission.id,
        actionType: "submit_upload_portal_form",
        actorType: "client",
        success: true,
        newValue: {
          submittedByName: submission.submittedByName,
          submittedByEmail: submission.submittedByEmail,
          status: submission.status,
          fileCount: uploadItems.length,
          docTypes: uploadItems.map((item) => item.docType),
          otherNames: uploadItems.map((item) => item.otherName || null),
          fileNames: uploadItems.map((item) => item.file.name),
        },
      },
    });

    return NextResponse.redirect(
      new URL(`/upload/${token}?success=1`, request.url),
      303
    );
  } catch (error) {
    console.error("Upload portal submit failed:", error);

    return NextResponse.redirect(
      new URL(`/upload/${token}?error=upload_failed`, request.url),
      303
    );
  }
}