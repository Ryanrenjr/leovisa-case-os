"use server";

import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../../../../lib/prisma";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const bucketName = "client-documents";

export async function deleteContract(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const contractId = formData.get("contractId")?.toString().trim() || "";

  if (!caseId || !contractId) {
    throw new Error("Case ID and Contract ID are required.");
  }

  const existingContract = await prisma.contract.findUnique({
    where: { id: contractId },
    select: {
      id: true,
      caseId: true,
      templateName: true,
      versionNo: true,
      filePath: true,
      fileUrl: true,
      status: true,
    },
  });

  if (!existingContract) {
    throw new Error("Contract not found.");
  }

  if (
    existingContract.filePath &&
    supabaseUrl &&
    supabaseServiceRoleKey
  ) {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([existingContract.filePath]);

      if (error) {
        console.error("Failed to delete contract from Supabase Storage:", error);
      }
    } catch (error) {
      console.error("Unexpected Supabase delete error:", error);
    }
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
        filePath: existingContract.filePath,
        fileUrl: existingContract.fileUrl,
        status: existingContract.status,
      },
    },
  });

  redirect(`/cases/${caseId}`);
}