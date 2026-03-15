"use server";

import fs from "fs/promises";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";

export async function deleteDocument(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const documentId = formData.get("documentId")?.toString().trim() || "";

  if (!caseId || !documentId) {
    throw new Error("Case ID and Document ID are required.");
  }

  const existingDocument = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      caseId: true,
      originalFilename: true,
      normalizedFilename: true,
      storagePath: true,
      storageUrl: true,
      docType: true,
      fileSize: true,
      reviewStatus: true,
    },
  });

  if (!existingDocument) {
    throw new Error("Document not found.");
  }

  if (existingDocument.storagePath) {
    try {
      await fs.unlink(existingDocument.storagePath);
    } catch (error) {
      console.error("Failed to delete local file:", error);
    }
  }

  await prisma.document.delete({
    where: { id: documentId },
  });

  await prisma.auditLog.create({
    data: {
      caseId: existingDocument.caseId,
      relatedEntityType: "document",
      relatedEntityId: existingDocument.id,
      actionType: "delete_document",
      actorType: "user",
      success: true,
      oldValue: {
        originalFilename: existingDocument.originalFilename,
        normalizedFilename: existingDocument.normalizedFilename,
        storageUrl: existingDocument.storageUrl,
        docType: existingDocument.docType,
        fileSize: existingDocument.fileSize
          ? Number(existingDocument.fileSize)
          : null,
        reviewStatus: existingDocument.reviewStatus,
      },
    },
  });

  redirect(`/cases/${caseId}`);
}