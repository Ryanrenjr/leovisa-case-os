"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";

export async function deleteAuditLog(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const logId = formData.get("logId")?.toString().trim() || "";

  if (!caseId || !logId) {
    throw new Error("Case ID and log ID are required.");
  }

  await prisma.auditLog.delete({
    where: { id: logId },
  });

  redirect(`/cases/${caseId}`);
}

export async function deleteSelectedAuditLogs(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const logIds = formData
    .getAll("logIds")
    .map((item) => item.toString().trim())
    .filter(Boolean);

  if (!caseId || logIds.length === 0) {
    throw new Error("Case ID and selected log IDs are required.");
  }

  await prisma.auditLog.deleteMany({
    where: {
      caseId,
      id: {
        in: logIds,
      },
    },
  });

  redirect(`/cases/${caseId}`);
}