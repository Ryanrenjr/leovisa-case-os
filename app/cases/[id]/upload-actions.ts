"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";

export async function generateUploadLink(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";

  if (!caseId) {
    throw new Error("Case ID is required.");
  }

  const caseItem = await prisma.case.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      caseCode: true,
    },
  });

  if (!caseItem) {
    throw new Error("Case not found.");
  }

  const token = crypto.randomBytes(16).toString("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const link = await prisma.submissionLink.create({
    data: {
      caseId: caseItem.id,
      token,
      status: "active",
      expiresAt,
      maxUses: 20,
      currentUses: 0,
    },
  });

  await prisma.auditLog.create({
    data: {
      caseId: caseItem.id,
      relatedEntityType: "submission_link",
      relatedEntityId: link.id,
      actionType: "generate_upload_link",
      actorType: "user",
      success: true,
      newValue: {
        token: link.token,
        expiresAt: link.expiresAt?.toISOString(),
        status: link.status,
      },
    },
  });

  redirect(`/cases/${caseItem.id}`);
}
