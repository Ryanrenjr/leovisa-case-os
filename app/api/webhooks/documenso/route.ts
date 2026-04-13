import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getDocumensoWebhookSecret } from "../../../../lib/documenso/client";
import { extractPdfBufferFromDocumentData, getDocumensoDocumentSnapshot } from "../../../../lib/documenso/signing";
import {
  documensoWebhookSchema,
  verifyDocumensoWebhookSecret,
} from "../../../../lib/documenso/webhooks";
import {
  createStorageSignedUrl,
  uploadBufferToStorage,
} from "../../../../lib/supabase-admin";

function getMatchingRecipient(
  recipients: Array<{
    id: number;
    email: string;
    signingStatus: string;
    readStatus: string;
    signedAt?: string | null | undefined;
    rejectionReason?: string | null | undefined;
  }>,
  contract: {
    providerRecipientId: number | null;
    signerEmail: string | null;
  }
) {
  if (contract.providerRecipientId) {
    const matchedById = recipients.find(
      (recipient) => recipient.id === contract.providerRecipientId
    );

    if (matchedById) {
      return matchedById;
    }
  }

  if (contract.signerEmail) {
    const matchedByEmail = recipients.find(
      (recipient) =>
        recipient.email.toLowerCase() === contract.signerEmail?.toLowerCase()
    );

    if (matchedByEmail) {
      return matchedByEmail;
    }
  }

  return recipients[0] || null;
}

async function syncSignedPdf(contract: {
  id: string;
  providerDocumentId: number;
  providerRecipientId: number | null;
  signerEmail: string | null;
  case: {
    caseCode: string;
  };
}) {
  const { document, signer } = await getDocumensoDocumentSnapshot(
    contract.providerDocumentId,
    contract.signerEmail || undefined,
    contract.providerRecipientId
  );
  const pdfBuffer = extractPdfBufferFromDocumentData(document);
  const safeCaseCode = contract.case.caseCode.replace(/[^a-zA-Z0-9._-]/g, "_");
  const safeContractId = contract.id.replace(/[^a-zA-Z0-9._-]/g, "_");
  const signedPdfPath = `${safeCaseCode}/contracts/${Date.now()}_${safeContractId}_signed.pdf`;

  await uploadBufferToStorage(signedPdfPath, pdfBuffer, "application/pdf");

  return {
    signedPdfPath,
    signedPdfUrl: await createStorageSignedUrl(signedPdfPath),
    providerDocumentStatus: document.status,
    providerRecipientStatus: signer?.signingStatus || null,
  };
}

export async function POST(request: Request) {
  const receivedSecret = request.headers.get("X-Documenso-Secret") || "";
  const expectedSecret = getDocumensoWebhookSecret();

  if (!verifyDocumensoWebhookSecret(receivedSecret, expectedSecret)) {
    return NextResponse.json(
      { error: "Invalid webhook secret." },
      { status: 401 }
    );
  }

  const json = await request.json().catch(() => null);
  const parsedEvent = documensoWebhookSchema.safeParse(json);

  if (!parsedEvent.success) {
    return NextResponse.json(
      { error: "Invalid webhook payload." },
      { status: 400 }
    );
  }

  const { event, payload } = parsedEvent.data;

  const contract =
    (payload.externalId
      ? await prisma.contract.findUnique({
          where: { id: payload.externalId },
          include: {
            case: true,
          },
        })
      : null) ||
    (await prisma.contract.findUnique({
      where: { providerDocumentId: payload.id },
      include: {
        case: true,
      },
    }));

  if (!contract) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const matchedRecipient = getMatchingRecipient(payload.recipients, {
    providerRecipientId: contract.providerRecipientId,
    signerEmail: contract.signerEmail,
  });

  const contractUpdate: {
    providerDocumentStatus?: string;
    providerRecipientStatus?: string | null;
    openedAt?: Date;
    completedAt?: Date;
    rejectedAt?: Date;
    lastWebhookAt: Date;
    status?: string;
    signedPdfPath?: string;
    signedPdfUrl?: string;
    signatureError?: string | null;
  } = {
    providerDocumentStatus: payload.status || contract.providerDocumentStatus || undefined,
    providerRecipientStatus:
      matchedRecipient?.signingStatus ||
      contract.providerRecipientStatus ||
      null,
    lastWebhookAt: new Date(),
  };

  let caseContractStatus: string | null = null;

  if (event === "DOCUMENT_SENT") {
    contractUpdate.status = "sent";
    caseContractStatus = "sent";
  }

  if (event === "DOCUMENT_OPENED") {
    contractUpdate.openedAt = new Date();
    contractUpdate.status = contract.status === "generated" ? "sent" : contract.status;
    caseContractStatus = "sent";
  }

  if (event === "DOCUMENT_SIGNED" || event === "DOCUMENT_RECIPIENT_COMPLETED") {
    contractUpdate.status = contract.status === "generated" ? "sent" : contract.status;
    caseContractStatus = "sent";
  }

  if (event === "DOCUMENT_REJECTED" || event === "DOCUMENT_CANCELLED") {
    contractUpdate.status = event === "DOCUMENT_CANCELLED" ? "cancelled" : "rejected";
    contractUpdate.rejectedAt = new Date(
      matchedRecipient?.signedAt || payload.completedAt || Date.now()
    );
    contractUpdate.signatureError =
      matchedRecipient?.rejectionReason || contract.signatureError || null;
  }

  if (event === "DOCUMENT_COMPLETED") {
    contractUpdate.status = "signed";
    contractUpdate.completedAt = new Date(payload.completedAt || Date.now());
    contractUpdate.signatureError = null;
    caseContractStatus = "signed";

    if (contract.providerDocumentId) {
      try {
        const signedPdf = await syncSignedPdf({
          id: contract.id,
          providerDocumentId: contract.providerDocumentId,
          providerRecipientId: contract.providerRecipientId,
          signerEmail: contract.signerEmail,
          case: {
            caseCode: contract.case.caseCode,
          },
        });

        contractUpdate.signedPdfPath = signedPdf.signedPdfPath;
        contractUpdate.signedPdfUrl = signedPdf.signedPdfUrl;
        contractUpdate.providerDocumentStatus = signedPdf.providerDocumentStatus;
        contractUpdate.providerRecipientStatus = signedPdf.providerRecipientStatus;
      } catch (error) {
        console.error("Signed PDF sync failed:", error);
        contractUpdate.signatureError =
          error instanceof Error
            ? error.message
            : "Signed PDF sync failed.";
      }
    }
  }

  await prisma.$transaction([
    prisma.contract.update({
      where: { id: contract.id },
      data: contractUpdate,
    }),
    ...(caseContractStatus
      ? [
          prisma.case.update({
            where: { id: contract.caseId },
            data: {
              contractStatus: caseContractStatus,
            },
          }),
        ]
      : []),
    prisma.auditLog.create({
      data: {
        caseId: contract.caseId,
        relatedEntityType: "contract",
        relatedEntityId: contract.id,
        actionType: `documenso_${event.toLowerCase()}`,
        actorType: "system",
        success: true,
        metadata: {
          documensoEvent: event,
          providerDocumentId: payload.id,
        },
        newValue: {
          contractStatus: contractUpdate.status || contract.status,
          providerDocumentStatus: contractUpdate.providerDocumentStatus,
          providerRecipientStatus: contractUpdate.providerRecipientStatus,
          signedPdfPath: contractUpdate.signedPdfPath || contract.signedPdfPath,
        },
      },
    }),
  ]);

  return NextResponse.json({ received: true });
}
