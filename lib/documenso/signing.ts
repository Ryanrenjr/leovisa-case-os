import { PDFDocument } from "pdf-lib";
import type { DocumentGetDocumentWithDetailsByIdResponse } from "@documenso/sdk-typescript/models/operations/documentgetdocumentwithdetailsbyid.js";
import { getDocumensoClient, buildDocumensoSigningUrl } from "./client";

type CreateDocumensoSigningRequestInput = {
  contractId: string;
  title: string;
  pdfBuffer: Buffer;
  signerName: string;
  signerEmail: string;
  redirectUrl?: string;
};

type DocumensoDocumentSnapshot = DocumentGetDocumentWithDetailsByIdResponse;

function getSignerFromDocument(
  document: DocumensoDocumentSnapshot,
  signerEmail?: string,
  providerRecipientId?: number | null
) {
  if (providerRecipientId) {
    const matchedById = document.recipients.find(
      (recipient) => recipient.id === providerRecipientId
    );

    if (matchedById) {
      return matchedById;
    }
  }

  if (signerEmail) {
    const matchedByEmail = document.recipients.find(
      (recipient) => recipient.email.toLowerCase() === signerEmail.toLowerCase()
    );

    if (matchedByEmail) {
      return matchedByEmail;
    }
  }

  return (
    document.recipients.find((recipient) => recipient.role === "SIGNER") ||
    document.recipients[0] ||
    null
  );
}

async function uploadPdfToPresignedUrl(uploadUrl: string, fileBuffer: Buffer) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: new Uint8Array(fileBuffer),
    headers: {
      "Content-Type": "application/pdf",
    },
  });

  if (!response.ok) {
    throw new Error(`Documenso PDF upload failed with status ${response.status}.`);
  }
}

async function getPdfPageCount(pdfBuffer: Buffer) {
  const pdfDocument = await PDFDocument.load(pdfBuffer);
  return pdfDocument.getPageCount();
}

function buildSignatureField(pageCount: number) {
  return {
    type: "FREE_SIGNATURE" as const,
    pageNumber: Math.max(pageCount, 1),
    pageX: 62,
    pageY: 84,
    width: 28,
    height: 9,
  };
}

export async function createDocumensoSigningRequest({
  contractId,
  title,
  pdfBuffer,
  signerName,
  signerEmail,
  redirectUrl,
}: CreateDocumensoSigningRequestInput) {
  const client = getDocumensoClient();
  const pageCount = await getPdfPageCount(pdfBuffer);

  const createResponse = await client.documents.createV0({
    title,
    externalId: contractId,
    recipients: [
      {
        email: signerEmail,
        name: signerName,
        role: "SIGNER",
        fields: [buildSignatureField(pageCount)],
      },
    ],
    meta: {
      distributionMethod: "NONE",
      language: "en",
      redirectUrl,
      typedSignatureEnabled: true,
      drawSignatureEnabled: true,
      uploadSignatureEnabled: true,
    },
  });

  await uploadPdfToPresignedUrl(createResponse.uploadUrl, pdfBuffer);

  await client.documents.distribute({
    documentId: createResponse.document.id,
    meta: {
      distributionMethod: "NONE",
      language: "en",
      redirectUrl,
    },
  });

  const document = await client.documents.get({
    documentId: createResponse.document.id,
  });

  const signer = getSignerFromDocument(document, signerEmail, null);

  if (!signer?.token) {
    throw new Error("Documenso did not return a signing token for the signer.");
  }

  return {
    documentId: document.id,
    documentStatus: document.status,
    recipientId: signer.id,
    recipientStatus: signer.signingStatus,
    signingToken: signer.token,
    signingUrl: buildDocumensoSigningUrl(signer.token),
  };
}

export async function getDocumensoDocumentSnapshot(
  documentId: number,
  signerEmail?: string,
  providerRecipientId?: number | null
) {
  const client = getDocumensoClient();
  const document = await client.documents.get({ documentId });
  const signer = getSignerFromDocument(document, signerEmail, providerRecipientId);

  return {
    document,
    signer,
  };
}

export function extractPdfBufferFromDocumentData(document: {
  documentData: {
    type: "S3_PATH" | "BYTES" | "BYTES_64";
    data: string;
  };
}) {
  if (document.documentData.type === "BYTES_64") {
    return Buffer.from(document.documentData.data, "base64");
  }

  if (document.documentData.type === "BYTES") {
    return Buffer.from(document.documentData.data);
  }

  throw new Error(
    "Documenso returned an S3_PATH document payload. Signed PDF sync is unavailable without a downloadable payload."
  );
}
