"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";

export async function deleteContract(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const contractId = formData.get("contractId")?.toString().trim() || "";

  if (!caseId || !contractId) {
    throw new Error("Case ID and contract ID are required.");
  }

  const existingContract = await prisma.contract.findUnique({
    where: { id: contractId },
    select: {
      id: true,
      caseId: true,
      templateName: true,
      versionNo: true,
      generatedBy: true,
      filePath: true,
      fileUrl: true,
      status: true,
      generatedAt: true,
    },
  });

  if (!existingContract) {
    throw new Error("Contract not found.");
  }

  await prisma.contract.delete({
    where: { id: contractId },
  });

  await prisma.auditLog.create({
    data: {
      caseId: existingContract.caseId,
      relatedEntityType: "contract",
      relatedEntityId: existingContract.id,
      actionType: "delete_contract",
      actorType: "user",
      success: true,
      oldValue: {
        templateName: existingContract.templateName,
        versionNo: existingContract.versionNo,
        generatedBy: existingContract.generatedBy,
        filePath: existingContract.filePath,
        fileUrl: existingContract.fileUrl,
        status: existingContract.status,
        generatedAt: existingContract.generatedAt,
      },
    },
  });

  redirect(`/cases/${caseId}`);
}