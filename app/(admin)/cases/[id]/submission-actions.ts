"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";

export async function deleteSubmission(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const submissionId = formData.get("submissionId")?.toString().trim() || "";

  if (!caseId || !submissionId) {
    throw new Error("Case ID and submission ID are required.");
  }

  const existingSubmission = await prisma.documentSubmission.findUnique({
    where: { id: submissionId },
    include: {
      documents: {
        select: {
          id: true,
          originalFilename: true,
          normalizedFilename: true,
          storageUrl: true,
          docType: true,
        },
      },
    },
  });

  if (!existingSubmission) {
    throw new Error("Submission not found.");
  }

  await prisma.document.deleteMany({
    where: {
      submissionId: existingSubmission.id,
    },
  });

  await prisma.documentSubmission.delete({
    where: { id: existingSubmission.id },
  });

  await prisma.auditLog.create({
    data: {
      caseId: existingSubmission.caseId,
      relatedEntityType: "document_submission",
      relatedEntityId: existingSubmission.id,
      actionType: "delete_submission",
      actorType: "user",
      success: true,
      oldValue: {
        submittedByName: existingSubmission.submittedByName,
        submittedByEmail: existingSubmission.submittedByEmail,
        source: existingSubmission.source,
        status: existingSubmission.status,
        remarks: existingSubmission.remarks,
        deletedDocumentCount: existingSubmission.documents.length,
        deletedDocumentNames: existingSubmission.documents.map(
          (doc) => doc.originalFilename
        ),
      },
    },
  });

  redirect(`/cases/${caseId}`);
}