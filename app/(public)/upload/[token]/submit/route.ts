import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const formData = await request.formData();

  const submittedByName =
    formData.get("submittedByName")?.toString().trim() || "";
  const submittedByEmail =
    formData.get("submittedByEmail")?.toString().trim() || "";
  const remarks = formData.get("remarks")?.toString().trim() || "";
  const docType = formData.get("docType")?.toString().trim() || "other";

  const files = formData
    .getAll("files")
    .filter((item): item is File => item instanceof File && item.size > 0);

  if (!token || !submittedByName) {
    throw new Error("Token and name are required.");
  }

  if (files.length === 0) {
    throw new Error("Please select at least one file.");
  }

  const submissionLink = await prisma.submissionLink.findUnique({
    where: { token },
    include: {
      case: true,
    },
  });

  if (!submissionLink) {
    throw new Error("Upload link not found.");
  }

  const isExpired =
    submissionLink.expiresAt && new Date(submissionLink.expiresAt) < new Date();

  const isInactive = submissionLink.status !== "active";
  const isMaxedOut =
    submissionLink.maxUses !== null &&
    submissionLink.currentUses >= submissionLink.maxUses;

  if (isExpired || isInactive || isMaxedOut) {
    throw new Error("This upload link is unavailable.");
  }

  const submission = await prisma.documentSubmission.create({
    data: {
      caseId: submissionLink.caseId,
      submissionLinkId: submissionLink.id,
      source: "upload_portal",
      submittedByName,
      submittedByEmail: submittedByEmail || null,
      status: "submitted",
      remarks: remarks || null,
    },
  });

  const caseFolderName = submissionLink.case.caseCode;
  const uploadDir = path.join(process.cwd(), "public", "uploads", caseFolderName);

  await fs.mkdir(uploadDir, { recursive: true });

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const savedFileName = `${Date.now()}_${safeOriginalName}`;
    const savedFilePath = path.join(uploadDir, savedFileName);

    await fs.writeFile(savedFilePath, buffer);

    const publicUrl = `/uploads/${caseFolderName}/${savedFileName}`;

    await prisma.document.create({
      data: {
        caseId: submissionLink.caseId,
        submissionId: submission.id,
        docType,
        originalFilename: file.name,
        normalizedFilename: savedFileName,
        mimeType: file.type || null,
        fileSize: BigInt(file.size),
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
        docType,
        fileCount: files.length,
        fileNames: files.map((file) => file.name),
      },
    },
  });

  return NextResponse.redirect(
  new URL(`/upload/${token}?success=1`, request.url),
  303
);

}
