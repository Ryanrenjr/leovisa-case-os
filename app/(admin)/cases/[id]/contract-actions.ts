"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "../../../../lib/prisma";
import { getAppBaseUrl } from "../../../../lib/app-url";
import { convertDocxBufferToPdf } from "../../../../lib/contracts/convert-docx-to-pdf";
import { getDocumensoClient, isDocumensoConfigured } from "../../../../lib/documenso/client";
import { createDocumensoSigningRequest } from "../../../../lib/documenso/signing";
import {
  createStorageSignedUrl,
  downloadStorageFile,
  removeStorageFiles,
  uploadBufferToStorage,
} from "../../../../lib/supabase-admin";

function buildContractsRedirect(
  caseId: string,
  options?: {
    error?: string;
    message?: string;
  }
) {
  const searchParams = new URLSearchParams();

  if (options?.error) {
    searchParams.set("contractActionError", options.error);
  }

  if (options?.message) {
    searchParams.set("contractActionMessage", options.message);
  }

  const queryString = searchParams.toString();

  return `/cases/${caseId}${queryString ? `?${queryString}` : ""}#contracts-section`;
}

async function ensureContractPdf(contract: {
  id: string;
  filePath: string | null;
  pdfPath: string | null;
  case: {
    caseCode: string;
    reference: string;
  };
}) {
  if (contract.pdfPath) {
    const pdfBuffer = await downloadStorageFile(contract.pdfPath);
    const pdfUrl = await createStorageSignedUrl(contract.pdfPath);

    return {
      pdfBuffer,
      pdfPath: contract.pdfPath,
      pdfUrl,
    };
  }

  if (!contract.filePath) {
    throw new Error("The contract DOCX file is missing.");
  }

  const docxBuffer = await downloadStorageFile(contract.filePath);
  const originalFileName =
    contract.filePath.split("/").pop() || `${contract.id}.docx`;
  const pdfFileName = originalFileName.replace(/\.docx$/i, ".pdf");
  const safeCaseCode = contract.case.caseCode.replace(/[^a-zA-Z0-9._-]/g, "_");
  const pdfPath = `${safeCaseCode}/contracts/${Date.now()}_${pdfFileName}`;
  const pdfBuffer = await convertDocxBufferToPdf(docxBuffer, originalFileName);

  await uploadBufferToStorage(pdfPath, pdfBuffer, "application/pdf");

  const pdfUrl = await createStorageSignedUrl(pdfPath);

  await prisma.contract.update({
    where: { id: contract.id },
    data: {
      pdfPath,
      pdfUrl,
      signatureError: null,
    },
  });

  return {
    pdfBuffer,
    pdfPath,
    pdfUrl,
  };
}

export async function sendContractForSignature(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const contractId = formData.get("contractId")?.toString().trim() || "";

  if (!caseId || !contractId) {
    throw new Error("Case ID and Contract ID are required.");
  }

  if (!isDocumensoConfigured()) {
    redirect(
      buildContractsRedirect(caseId, {
        error: "DOCUMENSO_API_KEY is missing.",
      })
    );
  }

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      case: {
        include: {
          client: true,
        },
      },
    },
  });

  if (!contract || contract.caseId !== caseId) {
    throw new Error("Contract not found.");
  }

  if (contract.status === "signed") {
    redirect(
      buildContractsRedirect(caseId, {
        error: "This contract has already been signed.",
      })
    );
  }

  if (contract.providerDocumentId || contract.providerSigningUrl) {
    redirect(
      buildContractsRedirect(caseId, {
        message: "Signing link already exists. Copy it and share it with the client manually.",
      })
    );
  }

  const signerName =
    contract.case.client.englishName?.trim() ||
    contract.case.client.chineseName?.trim() ||
    "Client";
  const signerEmail = contract.case.client.email?.trim() || "";

  if (!signerEmail) {
    redirect(
      buildContractsRedirect(caseId, {
        error: "Client email is still required to create the signing link.",
      })
    );
  }

  try {
    const { pdfBuffer, pdfPath, pdfUrl } = await ensureContractPdf({
      id: contract.id,
      filePath: contract.filePath,
      pdfPath: contract.pdfPath,
      case: {
        caseCode: contract.case.caseCode,
        reference: contract.case.reference,
      },
    });

    const signingRequest = await createDocumensoSigningRequest({
      contractId: contract.id,
      title: `${contract.case.reference} ${signerName} Contract`,
      pdfBuffer,
      signerName,
      signerEmail,
      redirectUrl: `${getAppBaseUrl()}/signing/complete`,
    });

    await prisma.$transaction([
      prisma.contract.update({
        where: { id: contract.id },
        data: {
          pdfPath,
          pdfUrl,
          signProvider: "documenso",
          signDeliveryMode: "link",
          signerName,
          signerEmail,
          providerDocumentId: signingRequest.documentId,
          providerRecipientId: signingRequest.recipientId,
          providerSigningToken: signingRequest.signingToken,
          providerSigningUrl: signingRequest.signingUrl,
          providerDocumentStatus: signingRequest.documentStatus,
          providerRecipientStatus: signingRequest.recipientStatus,
          signatureError: null,
          status: "sent",
          sentAt: new Date(),
        },
      }),
      prisma.case.update({
        where: { id: caseId },
        data: {
          contractStatus: "sent",
        },
      }),
      prisma.auditLog.create({
        data: {
          caseId,
          relatedEntityType: "contract",
          relatedEntityId: contract.id,
          actionType: "send_contract_for_signature",
          actorType: "user",
          success: true,
          newValue: {
            signProvider: "documenso",
            signDeliveryMode: "link",
            reference: contract.case.reference,
            signerName,
            signerEmail,
            providerDocumentId: signingRequest.documentId,
            providerRecipientId: signingRequest.recipientId,
            providerSigningUrl: signingRequest.signingUrl,
          },
        },
      }),
    ]);

    redirect(
      buildContractsRedirect(caseId, {
        message: "Signing link is ready. Share it with the client manually.",
      })
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("Send contract for signature failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to send the contract for signature.";

    await prisma.contract.update({
      where: { id: contract.id },
      data: {
        signatureError: message,
      },
    });

    redirect(
      buildContractsRedirect(caseId, {
        error: message,
      })
    );
  }
}

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
      pdfPath: true,
      pdfUrl: true,
      signedPdfPath: true,
      signedPdfUrl: true,
      status: true,
      providerDocumentId: true,
      providerSigningUrl: true,
      signerEmail: true,
    },
  });

  if (!existingContract) {
    throw new Error("Contract not found.");
  }

  if (existingContract.providerDocumentId && isDocumensoConfigured()) {
    try {
      const documenso = getDocumensoClient();
      await documenso.documents.delete({
        documentId: existingContract.providerDocumentId,
      });
    } catch (error) {
      console.error("Failed to delete Documenso document:", error);
    }
  }

  const storagePaths = [
    existingContract.filePath,
    existingContract.pdfPath,
    existingContract.signedPdfPath,
  ].filter((value): value is string => Boolean(value));

  if (storagePaths.length > 0) {
    try {
      await removeStorageFiles(Array.from(new Set(storagePaths)));
    } catch (error) {
      console.error("Failed to remove contract files from storage:", error);
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
        pdfPath: existingContract.pdfPath,
        pdfUrl: existingContract.pdfUrl,
        signedPdfPath: existingContract.signedPdfPath,
        signedPdfUrl: existingContract.signedPdfUrl,
        status: existingContract.status,
        providerDocumentId: existingContract.providerDocumentId,
        providerSigningUrl: existingContract.providerSigningUrl,
        signerEmail: existingContract.signerEmail,
      },
    },
  });

  redirect(`/cases/${caseId}`);
}
