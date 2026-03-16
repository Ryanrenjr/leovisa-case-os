"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";

export async function deactivateUploadLink(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const linkId = formData.get("linkId")?.toString().trim() || "";

  if (!caseId || !linkId) {
    throw new Error("Case ID and Link ID are required.");
  }

  const existingLink = await prisma.submissionLink.findUnique({
    where: { id: linkId },
    select: {
      id: true,
      caseId: true,
      token: true,
      status: true,
    },
  });

  if (!existingLink) {
    throw new Error("Upload link not found.");
  }

  await prisma.submissionLink.update({
    where: { id: linkId },
    data: {
      status: "inactive",
    },
  });

  await prisma.auditLog.create({
    data: {
      caseId: existingLink.caseId,
      relatedEntityType: "submission_link",
      relatedEntityId: existingLink.id,
      actionType: "deactivate_upload_link",
      actorType: "user",
      success: true,
      oldValue: {
        status: existingLink.status,
      },
      newValue: {
        status: "inactive",
        token: existingLink.token,
      },
    },
  });

  redirect(`/cases/${caseId}`);
}

export async function deleteUploadLink(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const linkId = formData.get("linkId")?.toString().trim() || "";

  if (!caseId || !linkId) {
    throw new Error("Case ID and Link ID are required.");
  }

  const existingLink = await prisma.submissionLink.findUnique({
    where: { id: linkId },
    select: {
      id: true,
      caseId: true,
      token: true,
      status: true,
      currentUses: true,
    },
  });

  if (!existingLink) {
    throw new Error("Upload link not found.");
  }

  await prisma.submissionLink.delete({
    where: { id: linkId },
  });

  await prisma.auditLog.create({
    data: {
      caseId: existingLink.caseId,
      relatedEntityType: "submission_link",
      relatedEntityId: existingLink.id,
      actionType: "delete_upload_link",
      actorType: "user",
      success: true,
      oldValue: {
        token: existingLink.token,
        status: existingLink.status,
        currentUses: existingLink.currentUses,
      },
    },
  });

  redirect(`/cases/${caseId}`);
}