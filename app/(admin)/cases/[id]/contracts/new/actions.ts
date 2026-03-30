"use server";

import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../../../../../../lib/prisma";
import { generateClientCareLetter } from "../../../../../../lib/contracts/generate-client-care-letter";
import { isRedirectError } from "next/dist/client/components/redirect-error";

type ActionState = {
  error?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const bucketName = "client-documents";

function formatDateForLetter(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB");
}

export async function createClientCareLetterAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const date = formData.get("date")?.toString().trim() || "";
  const dateOfBirth = formData.get("dateOfBirth")?.toString().trim() || "";
  const passport = formData.get("passport")?.toString().trim() || "";
  const totalFee = formData.get("totalFee")?.toString().trim() || "";
  const deposit = formData.get("deposit")?.toString().trim() || "";
  const balance = formData.get("balance")?.toString().trim() || "";
  const caseSummary = formData.get("caseSummary")?.toString().trim() || "";

  if (!caseId || !date || !dateOfBirth || !passport || !totalFee || !deposit || !balance) {
    return { error: "Please complete all required fields." };
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return { error: "Supabase environment variables are missing." };
  }

  const caseItem = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      client: true,
    },
  });

  if (!caseItem) {
    return { error: "Case not found." };
  }

  const clientName =
    caseItem.client.englishName?.trim() ||
    caseItem.client.chineseName?.trim() ||
    "Client";

  try {
    const fileBuffer = await generateClientCareLetter({
      ClientName: clientName,
      Date: formatDateForLetter(date),
      CaseRef: caseItem.caseCode,
      VisaType: caseItem.serviceType,
      Nationality: caseItem.client.nationality || "",
      DateOfBirth: dateOfBirth,
      Passport: passport,
      TotalFee: totalFee,
      Deposit: deposit,
      Balance: balance,
      CaseSummary: caseSummary,
    });

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const safeCaseCode = caseItem.caseCode.replace(/[^a-zA-Z0-9._-]/g, "_");
    const safeClientName = clientName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${safeCaseCode}_${safeClientName}_client_care_letter.docx`;
    const storagePath = `${safeCaseCode}/contracts/${Date.now()}_${fileName}`;

        const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, fileBuffer, {
        contentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        upsert: false,
      });

    if (uploadError) {
      console.error("Contract upload error:", uploadError);
      return { error: "Failed to upload contract file." };
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Create signed URL error:", signedUrlError);
      return { error: "Failed to create contract file URL." };
    }

    await prisma.contract.create({
      data: {
        caseId: caseItem.id,
        templateName: "client-care-letter-template",
        versionNo: 1,
        generatedBy: null,
        filePath: storagePath,
        fileUrl: signedUrlData.signedUrl,
        status: "generated",
      },
    });

    await prisma.auditLog.create({
      data: {
        caseId: caseItem.id,
        relatedEntityType: "contract",
        relatedEntityId: caseItem.id,
        actionType: "generate_contract",
        actorType: "user",
        success: true,
        newValue: {
          templateName: "client-care-letter-template",
          caseCode: caseItem.caseCode,
          filePath: storagePath,
          fileUrl: signedUrlData.signedUrl,
        },
      },
    });

    redirect(`/cases/${caseItem.id}`);
    } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("Create contract failed:", error);

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "Failed to generate contract." };
  }
}