"use server";

import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../../../../lib/prisma";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const bucketName = "client-documents";

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
      storageProvider: true,
      storagePath: true,
      storageUrl: true,
      docType: true,
      displayName: true,
      fileSize: true,
      reviewStatus: true,
    },
  });

  if (!existingDocument) {
    throw new Error("Document not found.");
  }

  if (
    existingDocument.storageProvider === "supabase_storage" &&
    existingDocument.storagePath
  ) {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        "Supabase environment variables are missing for storage deletion."
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([existingDocument.storagePath]);

    if (error) {
      throw new Error(`Failed to delete Supabase file: ${error.message}`);
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
        storageProvider: existingDocument.storageProvider,
        storagePath: existingDocument.storagePath,
        storageUrl: existingDocument.storageUrl,
        displayName: existingDocument.displayName,
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

export async function updateDocumentReviewStatus(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const documentId = formData.get("documentId")?.toString().trim() || "";
  const reviewStatus = formData.get("reviewStatus")?.toString().trim() || "";

  if (!caseId || !documentId || !reviewStatus) {
    throw new Error("Case ID, document ID, and review status are required.");
  }

  const existingDocument = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      caseId: true,
      reviewStatus: true,
      originalFilename: true,
      normalizedFilename: true,
      docType: true,
    },
  });

  if (!existingDocument) {
    throw new Error("Document not found.");
  }

  await prisma.document.update({
    where: { id: documentId },
    data: {
      reviewStatus,
    },
  });

  await prisma.auditLog.create({
    data: {
      caseId: existingDocument.caseId,
      relatedEntityType: "document",
      relatedEntityId: existingDocument.id,
      actionType: "update_document_review_status",
      actorType: "user",
      success: true,
      oldValue: {
        reviewStatus: existingDocument.reviewStatus,
        originalFilename: existingDocument.originalFilename,
        normalizedFilename: existingDocument.normalizedFilename,
        docType: existingDocument.docType,
      },
      newValue: {
        reviewStatus,
        originalFilename: existingDocument.originalFilename,
        normalizedFilename: existingDocument.normalizedFilename,
        docType: existingDocument.docType,
      },
    },
  });

  redirect(`/cases/${caseId}`);
}

export async function updateDocumentDisplayName(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const documentId = formData.get("documentId")?.toString().trim() || "";
  const displayName = formData.get("displayName")?.toString().trim() || "";

  if (!caseId || !documentId) {
    throw new Error("Case ID and document ID are required.");
  }

  const existingDocument = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      caseId: true,
      displayName: true,
      originalFilename: true,
      normalizedFilename: true,
      docType: true,
    },
  });

  if (!existingDocument) {
    throw new Error("Document not found.");
  }

  await prisma.document.update({
    where: { id: documentId },
    data: {
      displayName: displayName || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      caseId: existingDocument.caseId,
      relatedEntityType: "document",
      relatedEntityId: existingDocument.id,
      actionType: "update_document_display_name",
      actorType: "user",
      success: true,
      oldValue: {
        displayName: existingDocument.displayName,
        originalFilename: existingDocument.originalFilename,
        normalizedFilename: existingDocument.normalizedFilename,
        docType: existingDocument.docType,
      },
      newValue: {
        displayName: displayName || null,
        originalFilename: existingDocument.originalFilename,
        normalizedFilename: existingDocument.normalizedFilename,
        docType: existingDocument.docType,
      },
    },
  });

  redirect(`/cases/${caseId}`);
}