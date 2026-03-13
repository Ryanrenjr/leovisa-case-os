"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";

export async function updateCaseStatus(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const status = formData.get("status")?.toString().trim() || "";
  const contractStatus =
    formData.get("contractStatus")?.toString().trim() || "";
  const intakeStatus = formData.get("intakeStatus")?.toString().trim() || "";

  if (!caseId || !status || !contractStatus || !intakeStatus) {
    throw new Error("Missing required fields.");
  }

  const existingCase = await prisma.case.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      caseCode: true,
      status: true,
      contractStatus: true,
      intakeStatus: true,
    },
  });

  if (!existingCase) {
    throw new Error("Case not found.");
  }

  const updatedCase = await prisma.case.update({
    where: { id: caseId },
    data: {
      status,
      contractStatus,
      intakeStatus,
    },
  });

  await prisma.auditLog.create({
    data: {
      caseId: updatedCase.id,
      relatedEntityType: "case",
      relatedEntityId: updatedCase.id,
      actionType: "update_case_status",
      actorType: "user",
      success: true,
      oldValue: {
        status: existingCase.status,
        contractStatus: existingCase.contractStatus,
        intakeStatus: existingCase.intakeStatus,
      },
      newValue: {
        status: updatedCase.status,
        contractStatus: updatedCase.contractStatus,
        intakeStatus: updatedCase.intakeStatus,
      },
    },
  });

  redirect(`/cases/${updatedCase.id}`);
}
