"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../../../../lib/prisma";
import { generateClientCareLetter } from "../../../../../../lib/contracts/generate-client-care-letter";
import { convertDocxBufferToPdf } from "../../../../../../lib/contracts/convert-docx-to-pdf";
import { getServiceTypeLabel } from "../../../../../../lib/service-options";
import {
  createStorageSignedUrl,
  uploadBufferToStorage,
} from "../../../../../../lib/supabase-admin";
import { isRedirectError } from "next/dist/client/components/redirect-error";

type ActionState = {
  error?: string;
};

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

function getFormValues(formData: FormData, field: string) {
  return formData
    .getAll(field)
    .map((value) => value.toString().trim());
}

function buildMainApplicantLine({
  clientName,
  nationality,
  dateOfBirth,
  passport,
}: {
  clientName: string;
  nationality: string;
  dateOfBirth: string;
  passport: string;
}) {
  return `Name: ${clientName}; Nationality: ${nationality}; DoB. ${dateOfBirth}; Passport No. ${passport}`;
}

function getSelfApplicationBullet(serviceType: string, applicationLocation: string) {
  const normalized = serviceType.toLowerCase();

  if (normalized.includes("citizenship") || normalized.includes("naturalisation")) {
    return "You want to apply for citizenship for yourself;";
  }

  const applicationName =
    normalized.includes("visa") || normalized.includes("settlement")
      ? serviceType
      : `${serviceType} visa`;
  const locationSuffix = applicationLocation ? ` ${applicationLocation}` : "";
  return `You want to apply for ${applicationName} for yourself${locationSuffix};`;
}

export async function createClientCareLetterAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const caseRefInput = formData.get("caseRef")?.toString().trim() || "";
  const date = formData.get("date")?.toString().trim() || "";
  const applicationLocation =
    formData.get("applicationLocation")?.toString().trim() || "outside UK";
  const nationalityInput =
    formData.get("nationality")?.toString().trim() || "";
  const dateOfBirth = formData.get("dateOfBirth")?.toString().trim() || "";
  const passport = formData.get("passport")?.toString().trim() || "";
  const totalFee = formData.get("totalFee")?.toString().trim() || "";
  const deposit = formData.get("deposit")?.toString().trim() || "";
  const balance = formData.get("balance")?.toString().trim() || "";
  const caseSummary = formData.get("caseSummary")?.toString().trim() || "";
  const dependantTypes = getFormValues(formData, "dependantType");
  const dependantRelationships = getFormValues(formData, "dependantRelationship");
  const dependantNames = getFormValues(formData, "dependantName");
  const dependantNationalities = getFormValues(formData, "dependantNationality");
  const dependantDatesOfBirth = getFormValues(formData, "dependantDateOfBirth");
  const dependantPassports = getFormValues(formData, "dependantPassport");

  if (!caseId || !date || !dateOfBirth || !passport || !totalFee || !deposit || !balance) {
    return { error: "Please complete all required fields." };
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
    const contractCaseRef =
      caseRefInput || caseItem.reference || caseItem.caseCode;
    const visaType = getServiceTypeLabel(caseItem.serviceType);
    const nationality = nationalityInput || caseItem.client.nationality || "";
    const dependants = dependantNames
      .map((name, index) => ({
        type: dependantTypes[index] || "Dependant visa",
        relationship: dependantRelationships[index] || "",
        name,
        nationality: dependantNationalities[index] || "",
        dateOfBirth: dependantDatesOfBirth[index] || "",
        passport: dependantPassports[index] || "",
      }))
      .filter(
        (dependant) =>
          dependant.name ||
          dependant.nationality ||
          dependant.dateOfBirth ||
          dependant.passport
      );
    const dependantApplicationBullets = dependants.map((dependant) => {
      const relationshipSuffix = dependant.relationship
        ? ` for your ${dependant.relationship}`
        : "";
      const nameSuffix = dependant.name ? ` ${dependant.name}` : "";

      return `You want to apply for ${dependant.type}${relationshipSuffix}${nameSuffix};`;
    });
    const applicantDetails = [
      buildMainApplicantLine({
        clientName,
        nationality,
        dateOfBirth,
        passport,
      }),
      ...dependants.map((dependant) =>
        buildMainApplicantLine({
          clientName: dependant.name || "Dependant",
          nationality: dependant.nationality,
          dateOfBirth: dependant.dateOfBirth,
          passport: dependant.passport,
        })
      ),
    ].join("\n");

    const fileBuffer = await generateClientCareLetter({
      ClientName: clientName,
      Date: formatDateForLetter(date),
      CaseRef: contractCaseRef,
      VisaType: visaType,
      InstructionBullets: [
        getSelfApplicationBullet(visaType, applicationLocation),
        ...dependantApplicationBullets,
        applicantDetails,
      ],
      ApplicationLocation: applicationLocation,
      Nationality: nationality,
      DateOfBirth: dateOfBirth,
      Passport: passport,
      TotalFee: totalFee,
      Deposit: deposit,
      Balance: balance,
      CaseSummary: caseSummary,
    });

    const safeCaseCode = caseItem.caseCode.replace(/[^a-zA-Z0-9._-]/g, "_");
    const safeContractCaseRef = contractCaseRef.replace(/[^a-zA-Z0-9._-]/g, "_");
    const safeClientName = clientName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${safeContractCaseRef}_${safeClientName}_client_care_letter.docx`;
    const storagePath = `${safeCaseCode}/contracts/${Date.now()}_${fileName}`;
    const pdfFileName = fileName.replace(/\.docx$/i, ".pdf");
    const pdfStoragePath = `${safeCaseCode}/contracts/${Date.now()}_${pdfFileName}`;

    await uploadBufferToStorage(
      storagePath,
      fileBuffer,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    const fileUrl = await createStorageSignedUrl(storagePath);

    let generatedPdfPath: string | null = null;
    let generatedPdfUrl: string | null = null;

    try {
      const pdfBuffer = await convertDocxBufferToPdf(fileBuffer, fileName);

      await uploadBufferToStorage(pdfStoragePath, pdfBuffer, "application/pdf");

      generatedPdfPath = pdfStoragePath;
      generatedPdfUrl = await createStorageSignedUrl(pdfStoragePath);
    } catch (error) {
      console.warn("Contract PDF conversion skipped:", error);
    }

    await prisma.contract.create({
      data: {
        caseId: caseItem.id,
        templateName: "client-care-letter-template",
        versionNo: 1,
        generatedBy: null,
        filePath: storagePath,
        fileUrl,
        pdfPath: generatedPdfPath,
        pdfUrl: generatedPdfUrl,
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
          reference: caseItem.reference,
          contractCaseRef,
          filePath: storagePath,
          fileUrl,
          pdfPath: generatedPdfPath,
          pdfUrl: generatedPdfUrl,
        },
      },
    });

    redirect(`/cases/${caseItem.id}?tab=contracts#contracts-section`);
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
